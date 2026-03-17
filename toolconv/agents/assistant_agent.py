"""
agents/assistant_agent.py — the core tool-calling assistant agent.

Responsibility
--------------
Given a ConversationPlan and the user's messages, execute each tool step:

  For each step in plan.tool_steps:
    1. If a ClarificationStep is scheduled for this turn → emit the question
       and pause (the orchestrator will splice in the user's response).
    2. Otherwise:
       a. If not the first tool call:
            search session memory → inject context → mark step as "grounded"
       b. Fill tool arguments from SlotStore (chain consistency).
       c. Validate arguments.
       d. Mock the tool result.
       e. Write result to session memory.
       f. Emit assistant text + tool message.
  3. After all steps: generate a final summary response.

Outputs
-------
  AssistantResult — carries all messages, tool_calls, tool_outputs,
  the final ConversationState, and the computed memory_grounding_rate.

Chain consistency guarantee
---------------------------
SlotStore.fill_args() replaces "${field_name}" placeholders with values
extracted from prior tool results.  _infer_args() pre-populates argument
dicts with these placeholders so real slot values flow automatically.
"""

from __future__ import annotations

import json
import logging
import random
from dataclasses import dataclass, field
from typing import Any

from toolconv.agents.planner_agent import ClarificationStep, ConversationPlan
from toolconv.executor.mocker import ToolMocker
from toolconv.executor.state import ConversationState
from toolconv.executor.validator import ToolCallValidator
from toolconv.memory.mem0_store import ScopedMemoryStore
from toolconv.registry import ToolRegistry
from toolconv.registry.models import ToolDef
from toolconv.utils.llm import call_llm

logger = logging.getLogger(__name__)

_SYSTEM = (
    "You are a helpful AI assistant that uses tools to complete user requests. "
    "Be concise and natural. When calling a tool, briefly explain what you are doing. "
    "Output ONLY the assistant's message text — no JSON, no markdown headers."
)


# ---------------------------------------------------------------------------
# Output container
# ---------------------------------------------------------------------------

@dataclass
class AssistantResult:
    """
    Everything produced by one AssistantAgent.run() call.

    Attributes
    ----------
    messages         : All conversation messages in order
                       (role ∈ {"assistant", "tool"}).
    tool_calls       : List of {endpoint_id, arguments} dicts.
    tool_outputs     : List of {endpoint_id, output} dicts.
    state            : Final ConversationState (slot store, call log).
    grounded_steps   : 0-based indices of non-first tool steps where
                       ≥1 session memory entry was retrieved.
    n_clarification_questions : Number of clarification questions emitted.
    """
    messages: list[dict[str, str]] = field(default_factory=list)
    tool_calls: list[dict[str, Any]] = field(default_factory=list)
    tool_outputs: list[dict[str, Any]] = field(default_factory=list)
    state: ConversationState = field(default_factory=ConversationState)
    grounded_steps: list[int] = field(default_factory=list)
    n_clarification_questions: int = 0

    @property
    def memory_grounding_rate(self) -> float | None:
        """
        Fraction of non-first tool calls where ≥1 memory entry was retrieved.
        Returns None when there is only one tool call (denominator = 0).
        """
        n_tool_calls = len(self.tool_calls)
        if n_tool_calls <= 1:
            return None
        non_first = n_tool_calls - 1
        return round(len(self.grounded_steps) / non_first, 4)


# ---------------------------------------------------------------------------
# AssistantAgent
# ---------------------------------------------------------------------------

class AssistantAgent:
    """
    Executes tool steps, manages session memory, and generates text responses.

    Parameters
    ----------
    registry  : ToolRegistry — used to resolve ToolDef objects by name.
    memory    : ScopedMemoryStore — session + corpus memory.
    mocker    : ToolMocker — generates deterministic mock tool results.
    seed      : RNG seed forwarded to new ConversationState instances.
    """

    def __init__(
        self,
        registry: ToolRegistry,
        memory: ScopedMemoryStore,
        mocker: ToolMocker | None = None,
        seed: int | None = None,
    ) -> None:
        self._registry = registry
        self._memory = memory
        self._mocker = mocker or ToolMocker(seed=seed)
        self._validator = ToolCallValidator()
        self._rng = random.Random(seed)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def run(
        self,
        plan: ConversationPlan,
        user_turns: list[dict[str, str]],
        conversation_id: str | None = None,
    ) -> AssistantResult:
        """
        Execute the full plan against the provided user turns.

        Parameters
        ----------
        plan          : ConversationPlan from PlannerAgent.
        user_turns    : List of {"role": "user", "content": ...} dicts,
                        in order: [opening, clarify_resp_0, clarify_resp_1, ...]
        conversation_id : Optional stable ID; auto-generated if None.

        Returns
        -------
        AssistantResult with all messages and metrics.
        """
        state = ConversationState(conversation_id=conversation_id)
        result = AssistantResult(state=state)

        # Track which user turn to emit next
        user_turn_idx = 0
        tool_call_idx = 0      # total tool calls so far (for grounding logic)

        # Clarification steps indexed by turn
        clarify_map: dict[int, ClarificationStep] = {
            cs.turn: cs for cs in plan.clarification_steps
        }

        # Iterate over conversation turns
        # Turn 0: opening user message → assistant responds / may clarify
        # Turn 1..N: sequential tool steps (each tool = one conversation turn)
        total_turns = len(plan.tool_steps) + len(plan.clarification_steps) + 1

        conv_turn = 0   # current conversation turn index

        # --- Turn 0: consume opening user message ---
        if user_turns:
            # (user message is already in the caller's messages list;
            #  we don't re-emit it, just advance the pointer)
            user_turn_idx += 1

        # --- Tool execution turns ---
        for step_idx, tool_name in enumerate(plan.tool_steps):
            conv_turn += 1

            # Check if a clarification is scheduled before this tool step
            if conv_turn in clarify_map:
                cs = clarify_map[conv_turn]
                # Emit clarification question
                q_text = self._generate_clarification(cs, plan)
                result.messages.append({"role": "assistant", "content": q_text})
                result.n_clarification_questions += 1
                logger.debug("Clarification at turn %d: %r", conv_turn, q_text[:60])

                # Consume the user's clarification response (if available)
                if user_turn_idx < len(user_turns):
                    result.messages.append(user_turns[user_turn_idx])
                    user_turn_idx += 1
                conv_turn += 1

            # Resolve tool definition
            tool = self._resolve_tool(tool_name)
            if tool is None:
                logger.warning("Tool %r not found in registry — skipping", tool_name)
                continue

            # --- Session memory: grounding for non-first tool calls ---
            memory_context = ""
            if tool_call_idx > 0:
                mem_entries = self._search_session_memory(
                    tool_name, plan.user_goal, conversation_id or state.conversation_id
                )
                if mem_entries:
                    result.grounded_steps.append(tool_call_idx)
                    memory_context = self._format_memory_context(mem_entries)
                    logger.debug(
                        "Step %d grounded with %d memory entries",
                        step_idx, len(mem_entries),
                    )

            # --- Build and fill tool arguments (chain consistency) ---
            raw_args = self._infer_args(tool, state)
            filled_args = state.slots.fill_args(raw_args)
            validated_args = self._validated_args(tool, filled_args)

            # --- Generate pre-call assistant message ---
            pre_msg = self._generate_pre_call(tool, validated_args, plan, memory_context)
            result.messages.append({"role": "assistant", "content": pre_msg})

            # --- Execute (mock) the tool call ---
            call_rec = state.record_call(
                turn=conv_turn,
                tool_name=tool_name,
                args=validated_args,
                call_index=tool_call_idx,
            )
            mock_payload = self._mocker.mock_result(tool, call_args=validated_args)
            state.resolve_call(call_rec.call_id, mock_payload, auto_slot=True)

            # --- Emit tool result message ---
            tool_output = mock_payload.get("result", {})
            result.messages.append({
                "role": "tool",
                "content": json.dumps(tool_output),
            })
            result.tool_calls.append({
                "endpoint_id": tool_name,
                "arguments":   validated_args,
            })
            result.tool_outputs.append({
                "endpoint_id": tool_name,
                "output":      tool_output,
            })

            # --- Write tool output to session memory ---
            self._write_session_memory(
                tool_name, tool_output, plan, state.conversation_id, step_idx
            )

            tool_call_idx += 1

        # --- Final assistant summary message ---
        final_msg = self._generate_final(plan, result, state)
        result.messages.append({"role": "assistant", "content": final_msg})

        logger.info(
            "AssistantAgent done: %d tool calls, %d grounded, MGR=%s",
            len(result.tool_calls),
            len(result.grounded_steps),
            result.memory_grounding_rate,
        )
        return result

    # ------------------------------------------------------------------
    # Tool argument helpers (chain consistency)
    # ------------------------------------------------------------------

    def _infer_args(self, tool: ToolDef, state: ConversationState) -> dict[str, Any]:
        """
        Build a raw argument dict, using "${slot_name}" placeholders for
        parameters whose values may come from prior tool results.
        """
        args: dict[str, Any] = {}
        slots = state.slots.as_dict()

        for param_name in tool.param_names():
            param_schema = tool.get_param(param_name)
            # Check if a slot with this name (or a matching key) is available
            if param_name in slots:
                args[param_name] = f"${{{param_name}}}"   # placeholder → filled below
            elif any(param_name in k for k in slots):
                # Partial match (e.g. "id" matches "user_id" slot)
                for k in slots:
                    if param_name in k:
                        args[param_name] = f"${{{k}}}"
                        break
            else:
                # No slot — generate a mock value
                args[param_name] = self._mocker.mock_args(tool).get(
                    param_name,
                    f"<{param_name}>",
                )
        return args

    def _validated_args(self, tool: ToolDef, args: dict[str, Any]) -> dict[str, Any]:
        """Validate args; log warnings but always return args (never block)."""
        vr = self._validator.validate(tool, args)
        if not vr.valid:
            logger.debug(
                "Validation warnings for %s: %s",
                tool.name,
                [e.message for e in vr.errors],
            )
        return args

    def _resolve_tool(self, name: str) -> ToolDef | None:
        entry = self._registry.get(name)
        return entry.tool if entry else None

    # ------------------------------------------------------------------
    # Memory helpers
    # ------------------------------------------------------------------

    def _search_session_memory(
        self,
        tool_name: str,
        user_goal: str,
        conversation_id: str,
    ) -> list[dict[str, Any]]:
        """Search session memory scoped to this conversation."""
        scope = f"session:{conversation_id}"
        try:
            return self._memory.search(tool_name, scope=scope, top_k=3)
        except Exception as exc:
            logger.warning("Session memory search failed: %s", exc)
            return []

    def _write_session_memory(
        self,
        tool_name: str,
        output: Any,
        plan: ConversationPlan,
        conversation_id: str,
        step: int,
    ) -> None:
        """Persist tool output to session memory."""
        scope = f"session:{conversation_id}"
        content = f"{tool_name} returned: {json.dumps(output, default=str)[:300]}"
        try:
            self._memory.add(
                content=content,
                scope=scope,
                metadata={
                    "conversation_id": conversation_id,
                    "step":            step,
                    "endpoint":        tool_name,
                    "domain":          plan.domain,
                },
            )
        except Exception as exc:
            logger.warning("Session memory write failed: %s", exc)

    @staticmethod
    def _format_memory_context(entries: list[dict[str, Any]]) -> str:
        lines = [e["content"] for e in entries if e.get("content")]
        return "Relevant context from earlier steps:\n" + "\n".join(f"  - {l}" for l in lines)

    # ------------------------------------------------------------------
    # Text generation helpers
    # ------------------------------------------------------------------

    def _generate_clarification(
        self, cs: ClarificationStep, plan: ConversationPlan
    ) -> str:
        prompt = (
            f"Domain: {plan.domain}\n"
            f"You are about to call the tool '{cs.tool_name}' but need "
            f"the user's '{cs.target_param}'.\n"
            "Ask the user for this information in one natural sentence:"
        )
        text = call_llm(prompt, system=_SYSTEM, max_tokens=80)
        if len(text) < 5:
            text = cs.question   # fall back to plan's pre-written question
        return text

    def _generate_pre_call(
        self,
        tool: ToolDef,
        args: dict[str, Any],
        plan: ConversationPlan,
        memory_context: str,
    ) -> str:
        ctx = f"\n{memory_context}" if memory_context else ""
        prompt = (
            f"Domain: {plan.domain}\n"
            f"You are calling the tool '{tool.name}': {tool.description}.{ctx}\n"
            "Write a one-sentence assistant message telling the user what you're doing:"
        )
        text = call_llm(prompt, system=_SYSTEM, max_tokens=80)
        if len(text) < 5:
            text = f"Let me use {tool.name} to help with that."
        return text

    def _generate_final(
        self,
        plan: ConversationPlan,
        result: AssistantResult,
        state: ConversationState,
    ) -> str:
        tool_summary = ", ".join(
            tc["endpoint_id"] for tc in result.tool_calls
        )
        prompt = (
            f"Domain: {plan.domain}\n"
            f"User goal: {plan.user_goal}\n"
            f"Tools used: {tool_summary}\n"
            f"Number of results: {len(result.tool_outputs)}\n"
            "Write a brief, helpful final response summarising what was accomplished "
            "(2-3 sentences, natural tone):"
        )
        text = call_llm(prompt, system=_SYSTEM, max_tokens=150)
        if len(text) < 10:
            text = (
                f"I've completed the request using {tool_summary}. "
                f"Here are the results — let me know if you need anything else!"
            )
        return text
