"""
generation/conversation_schema.py — output record schema and assembler.

Every synthetic conversation is serialised as one JSON object.
This module defines the exact schema (via Pydantic) and provides
`assemble()`, which converts agent outputs into a validated record
ready to be written to the JSONL dataset.

Output schema
-------------
{
  "conversation_id": "uuid",
  "messages": [
    {"role": "user"|"assistant"|"tool", "content": "..."}
  ],
  "tool_calls": [
    {"endpoint_id": "...", "arguments": {...}}
  ],
  "tool_outputs": [
    {"endpoint_id": "...", "output": {...}}
  ],
  "metadata": {
    "seed":                        int,
    "tool_ids_used":               list[str],
    "num_turns":                   int,
    "num_clarification_questions": int,
    "memory_grounding_rate":       float | null,
    "corpus_memory_enabled":       bool,
    "pattern_type":                str,
    "domain":                      str,
    "validation_passed":           bool
  }
}
"""

from __future__ import annotations

import json
from typing import Any

from pydantic import BaseModel, Field, model_validator


# ---------------------------------------------------------------------------
# Sub-models
# ---------------------------------------------------------------------------

class Message(BaseModel):
    role: str
    content: str

    @model_validator(mode="after")
    def check_role(self) -> Message:
        valid = {"user", "assistant", "tool", "system"}
        if self.role not in valid:
            raise ValueError(f"Invalid role {self.role!r}; must be one of {valid}")
        return self


class ToolCall(BaseModel):
    endpoint_id: str
    arguments: dict[str, Any] = Field(default_factory=dict)


class ToolOutput(BaseModel):
    endpoint_id: str
    output: Any = None


class ConversationMetadata(BaseModel):
    seed: int
    tool_ids_used: list[str]
    num_turns: int
    num_clarification_questions: int
    memory_grounding_rate: float | None
    corpus_memory_enabled: bool
    pattern_type: str
    domain: str
    validation_passed: bool

    model_config = {"extra": "allow"}   # allow additional diagnostic fields


# ---------------------------------------------------------------------------
# Top-level record
# ---------------------------------------------------------------------------

class ConversationRecord(BaseModel):
    """One synthetic conversation, ready for JSONL serialisation."""
    conversation_id: str
    messages: list[Message]
    tool_calls: list[ToolCall]
    tool_outputs: list[ToolOutput]
    metadata: ConversationMetadata

    model_config = {"extra": "forbid"}

    # ------------------------------------------------------------------
    # Serialisation helpers
    # ------------------------------------------------------------------

    def to_dict(self) -> dict[str, Any]:
        """Return a plain dict suitable for json.dumps()."""
        return self.model_dump()

    def to_json(self) -> str:
        """Return compact JSON string (one line for JSONL)."""
        return self.model_dump_json()

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> ConversationRecord:
        return cls.model_validate(d)

    @classmethod
    def from_json(cls, s: str) -> ConversationRecord:
        return cls.model_validate_json(s)


# ---------------------------------------------------------------------------
# Assembler
# ---------------------------------------------------------------------------

def assemble(
    conversation_id: str,
    messages: list[dict[str, str]],
    tool_calls: list[dict[str, Any]],
    tool_outputs: list[dict[str, Any]],
    seed: int,
    tool_ids_used: list[str],
    num_turns: int,
    num_clarification_questions: int,
    memory_grounding_rate: float | None,
    corpus_memory_enabled: bool,
    pattern_type: str,
    domain: str,
    validation_passed: bool,
    extra_metadata: dict[str, Any] | None = None,
) -> ConversationRecord:
    """
    Assemble a ConversationRecord from raw agent outputs.

    Parameters
    ----------
    conversation_id            : Unique ID (from ConversationState).
    messages                   : All message dicts in conversation order.
    tool_calls                 : List of {endpoint_id, arguments} dicts.
    tool_outputs               : List of {endpoint_id, output} dicts.
    seed                       : RNG seed used for this conversation.
    tool_ids_used              : Ordered list of tool names called.
    num_turns                  : Total conversation turns.
    num_clarification_questions: Number of clarification questions asked.
    memory_grounding_rate      : Fraction of grounded non-first calls, or None.
    corpus_memory_enabled      : Whether corpus memory was active.
    pattern_type               : "sequential"|"parallel"|"clarify_first".
    domain                     : Inferred domain tag.
    validation_passed          : Whether ValidatorAgent approved this record.
    extra_metadata             : Optional additional fields merged into metadata.

    Returns
    -------
    A fully validated ConversationRecord.
    """
    meta_dict: dict[str, Any] = {
        "seed":                        seed,
        "tool_ids_used":               tool_ids_used,
        "num_turns":                   num_turns,
        "num_clarification_questions": num_clarification_questions,
        "memory_grounding_rate":       memory_grounding_rate,
        "corpus_memory_enabled":       corpus_memory_enabled,
        "pattern_type":                pattern_type,
        "domain":                      domain,
        "validation_passed":           validation_passed,
    }
    if extra_metadata:
        meta_dict.update(extra_metadata)

    return ConversationRecord(
        conversation_id=conversation_id,
        messages=[Message(**m) for m in messages],
        tool_calls=[ToolCall(**tc) for tc in tool_calls],
        tool_outputs=[ToolOutput(**to) for to in tool_outputs],
        metadata=ConversationMetadata(**meta_dict),
    )


def assemble_from_agents(
    assistant_result: Any,    # AssistantResult
    plan: Any,                # ConversationPlan
    sampler_result: Any,      # SamplerResult
    validation_passed: bool,
    seed: int,
    user_messages: list[dict[str, str]] | None = None,
    extra_metadata: dict[str, Any] | None = None,
) -> ConversationRecord:
    """
    Convenience wrapper: builds a ConversationRecord directly from agent objects.

    Merges user messages (from UserProxyAgent) with assistant messages in
    chronological order.

    Parameters
    ----------
    assistant_result : AssistantResult from AssistantAgent.run().
    plan             : ConversationPlan from PlannerAgent.plan().
    sampler_result   : SamplerResult from SamplerAgent.sample().
    validation_passed: Whether ValidatorAgent approved.
    seed             : RNG seed used for this conversation.
    user_messages    : Optional user-role messages to prepend/interleave.
    extra_metadata   : Optional additional metadata fields.
    """
    state = assistant_result.state

    # Merge user messages with assistant/tool messages
    all_messages: list[dict[str, str]] = []
    if user_messages:
        all_messages.extend(user_messages[:1])   # opening message first
    all_messages.extend(assistant_result.messages)

    return assemble(
        conversation_id=state.conversation_id,
        messages=all_messages,
        tool_calls=assistant_result.tool_calls,
        tool_outputs=assistant_result.tool_outputs,
        seed=seed,
        tool_ids_used=list(dict.fromkeys(state.all_tool_names)),  # unique, ordered
        num_turns=state.n_turns,
        num_clarification_questions=assistant_result.n_clarification_questions,
        memory_grounding_rate=assistant_result.memory_grounding_rate,
        corpus_memory_enabled=plan.corpus_memory_enabled,
        pattern_type=plan.pattern_type,
        domain=plan.domain,
        validation_passed=validation_passed,
        extra_metadata=extra_metadata,
    )
