"""
agents/planner_agent.py — conversation planner agent.

Responsibility
--------------
Given a SamplerResult (tool chain + pattern) and access to corpus memory,
produce a ConversationPlan that specifies:

  • What the user wants to accomplish (user_goal)
  • Which aspects of the request are intentionally left ambiguous
  • Exactly when and what clarification questions to ask
  • Per-turn intent notes to guide the AssistantAgent

Flow
----
  1. Search corpus memory for related past conversations.
  2. Build a structured LLM prompt (tool names, pattern, corpus context).
  3. Parse the LLM's JSON response into a ConversationPlan.
  4. Guarantee hard requirements:
       - clarify_first patterns have ≥ 1 ClarificationStep
       - All other patterns may have 0..N clarification steps
       - At least one ambiguity is noted for clarify_first
"""

from __future__ import annotations

import json
import logging
import random
import re
from dataclasses import dataclass, field
from typing import Any

from toolconv.agents.sampler_agent import SamplerResult
from toolconv.memory.mem0_store import ScopedMemoryStore
from toolconv.utils.llm import call_llm

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Output types
# ---------------------------------------------------------------------------

@dataclass
class ClarificationStep:
    """One turn where the assistant asks the user for missing information."""
    turn: int           # 0-based turn index in the conversation
    question: str       # the clarification question text
    target_param: str   # name of the parameter being clarified
    tool_name: str      # tool that needs this parameter


@dataclass
class ConversationPlan:
    """
    Full plan for one synthetic conversation.

    Produced by PlannerAgent; consumed by UserProxyAgent + AssistantAgent.
    """
    user_goal: str
    domain: str
    pattern_type: str                           # "sequential"|"parallel"|"clarify_first"
    tool_steps: list[str]                       # ordered tool names (real tools only)
    clarification_steps: list[ClarificationStep]
    ambiguities: list[str]                      # vague aspects in the user's opening message
    corpus_summaries: list[dict[str, Any]]      # retrieved corpus memory entries
    corpus_memory_enabled: bool
    seed: int
    metadata: dict[str, Any] = field(default_factory=dict)

    @property
    def has_clarification(self) -> bool:
        return len(self.clarification_steps) > 0

    @property
    def n_clarification_questions(self) -> int:
        return len(self.clarification_steps)

    def clarification_at(self, turn: int) -> ClarificationStep | None:
        for step in self.clarification_steps:
            if step.turn == turn:
                return step
        return None

    def __repr__(self) -> str:
        return (
            f"ConversationPlan(goal={self.user_goal[:40]!r}, "
            f"tools={self.tool_steps}, "
            f"clarifications={self.n_clarification_questions})"
        )


# ---------------------------------------------------------------------------
# Prompt builder
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = """\
You are a conversation designer for a synthetic data generation system.
Your job is to plan realistic multi-turn conversations where an AI assistant
uses tools to help a user.  Output ONLY valid JSON — no prose, no markdown fences.\
"""

_PLAN_SCHEMA = """\
{
  "user_goal": "<one sentence describing what the user wants>",
  "ambiguities": ["<vague aspect 1>", "<vague aspect 2>"],
  "clarification_steps": [
    {
      "turn": <int>,
      "question": "<assistant question text>",
      "target_param": "<parameter name>",
      "tool_name": "<tool name>"
    }
  ],
  "turn_notes": ["<intent note for turn 0>", "<intent note for turn 1>", ...]
}\
"""


def _build_prompt(
    sampler: SamplerResult,
    corpus_summaries: list[dict[str, Any]],
    corpus_memory_enabled: bool,
) -> str:
    tool_list = "\n".join(
        f"  {i+1}. {t.name}: {t.description}"
        for i, t in enumerate(sampler.tool_chain)
    )
    pattern_notes = {
        "sequential":    "The conversation follows a strict sequential pipeline.",
        "parallel":      "Multiple tools are called in the same turn.",
        "clarify_first": (
            "IMPORTANT: The user's opening message MUST be intentionally vague "
            "about at least one required parameter.  Include ≥1 clarification_step "
            "at turn 1 where the assistant asks for the missing information."
        ),
    }.get(sampler.pattern_type, "")

    corpus_ctx = ""
    if corpus_memory_enabled and corpus_summaries:
        summaries = "\n".join(f"  - {e['content']}" for e in corpus_summaries[:5])
        corpus_ctx = f"\nPast conversation summaries for context:\n{summaries}\n"

    return f"""Plan a multi-turn conversation for the following tool chain.

Domain: {sampler.domain}
Pattern: {sampler.pattern_type}
{pattern_notes}

Tools (in call order):
{tool_list}
{corpus_ctx}
Requirements:
- user_goal must be realistic and specific to the {sampler.domain} domain
- ambiguities: 1-3 aspects the user leaves unspecified in their opening message
- clarification_steps: turns where the assistant asks a clarifying question
  (required for clarify_first; optional for other patterns)
- turn_notes: one short intent note per tool step

Output this JSON schema exactly:
{_PLAN_SCHEMA}
"""


# ---------------------------------------------------------------------------
# Response parser
# ---------------------------------------------------------------------------

def _extract_json(text: str) -> dict[str, Any]:
    """Extract the first JSON object from an LLM response string."""
    # Strip markdown code fences if present
    text = re.sub(r"```(?:json)?\s*", "", text).strip()
    text = text.rstrip("`").strip()
    # Find first { ... } block
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    # Return empty dict on failure — caller will use fallback defaults
    return {}


def _parse_plan(
    raw: dict[str, Any],
    sampler: SamplerResult,
    corpus_summaries: list[dict[str, Any]],
    corpus_memory_enabled: bool,
    seed: int,
) -> ConversationPlan:
    """Convert a parsed LLM dict into a ConversationPlan, applying safe defaults."""
    user_goal = raw.get("user_goal") or f"Help me with a {sampler.domain} task"
    ambiguities: list[str] = raw.get("ambiguities") or []

    raw_clarify = raw.get("clarification_steps") or []
    clarification_steps: list[ClarificationStep] = []
    for cs in raw_clarify:
        if not isinstance(cs, dict):
            continue
        try:
            clarification_steps.append(ClarificationStep(
                turn=int(cs.get("turn", 1)),
                question=str(cs.get("question", "Could you clarify that for me?")),
                target_param=str(cs.get("target_param", "unknown")),
                tool_name=str(cs.get("tool_name", sampler.tool_names[0])),
            ))
        except (TypeError, ValueError):
            continue

    # Hard requirement: clarify_first must have ≥ 1 clarification step
    if sampler.pattern_type == "clarify_first" and not clarification_steps:
        first_tool = sampler.tool_chain[0] if sampler.tool_chain else None
        param = (
            first_tool.required_param_names()[0]
            if first_tool and first_tool.required_param_names()
            else "details"
        )
        clarification_steps.append(ClarificationStep(
            turn=1,
            question=f"Could you provide more details about the {param}?",
            target_param=param,
            tool_name=first_tool.name if first_tool else "unknown",
        ))
        if not ambiguities:
            ambiguities = [f"The {param} was not specified"]

    return ConversationPlan(
        user_goal=user_goal,
        domain=sampler.domain,
        pattern_type=sampler.pattern_type,
        tool_steps=sampler.tool_names,
        clarification_steps=clarification_steps,
        ambiguities=ambiguities,
        corpus_summaries=corpus_summaries,
        corpus_memory_enabled=corpus_memory_enabled,
        seed=seed,
        metadata={"turn_notes": raw.get("turn_notes", [])},
    )


# ---------------------------------------------------------------------------
# PlannerAgent
# ---------------------------------------------------------------------------

class PlannerAgent:
    """
    Plans a multi-turn conversation given a SamplerResult and corpus memory.

    Parameters
    ----------
    memory               : ScopedMemoryStore used to retrieve corpus context.
    corpus_memory_enabled: If False, corpus search is skipped (--no-corpus-memory).
    """

    def __init__(
        self,
        memory: ScopedMemoryStore,
        corpus_memory_enabled: bool = True,
    ) -> None:
        self._memory = memory
        self._corpus_enabled = corpus_memory_enabled

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def plan(
        self,
        sampler_result: SamplerResult,
        seed: int | None = None,
    ) -> ConversationPlan:
        """
        Produce a ConversationPlan for *sampler_result*.

        Parameters
        ----------
        sampler_result : Output from SamplerAgent.sample().
        seed           : Forwarded into ConversationPlan for audit trail.

        Returns
        -------
        ConversationPlan ready for UserProxyAgent + AssistantAgent.
        """
        actual_seed = seed if seed is not None else sampler_result.seed

        # 1. Retrieve corpus context
        corpus_summaries = self._fetch_corpus(sampler_result.domain)

        # 2. Call LLM
        prompt = _build_prompt(sampler_result, corpus_summaries, self._corpus_enabled)
        raw_text = call_llm(prompt, system=_SYSTEM_PROMPT, max_tokens=800)
        logger.debug("PlannerAgent LLM response:\n%s", raw_text[:400])

        # 3. Parse + validate
        raw_dict = _extract_json(raw_text)
        if not raw_dict:
            logger.warning("PlannerAgent: LLM returned unparseable JSON — using defaults")
            raw_dict = {}

        plan = _parse_plan(
            raw_dict, sampler_result, corpus_summaries,
            self._corpus_enabled, actual_seed,
        )
        logger.info("PlannerAgent: plan ready — %s", plan)
        return plan

    # ------------------------------------------------------------------
    # Internal
    # ------------------------------------------------------------------

    def _fetch_corpus(self, domain: str) -> list[dict[str, Any]]:
        if not self._corpus_enabled:
            return []
        try:
            results = self._memory.search(domain, scope="corpus", top_k=5)
            logger.debug(
                "PlannerAgent corpus search %r → %d entries", domain, len(results)
            )
            return results
        except Exception as exc:
            logger.warning("PlannerAgent corpus search failed: %s", exc)
            return []
