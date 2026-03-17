"""
executor/state.py — track tool call state across a multi-turn conversation.

A ConversationState records every tool call and its result as the
generation layer builds up a synthetic conversation turn by turn.
It provides:

  • An append-only log of ToolCallRecord objects
  • A slot store — named values extracted from results that can be
    referenced by later turns (e.g. the user_id returned by get_user
    can be injected into the next call's arguments)
  • Convenience views: last call, calls by tool name, success/error counts
  • Serialisation to a plain dict for JSON export

This module has no LLM or network dependencies.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


# ---------------------------------------------------------------------------
# Call status
# ---------------------------------------------------------------------------

class CallStatus(str, Enum):
    SUCCESS = "success"
    ERROR   = "error"
    PENDING = "pending"   # call recorded but result not yet available


# ---------------------------------------------------------------------------
# Individual call record
# ---------------------------------------------------------------------------

@dataclass
class ToolCallRecord:
    """
    Immutable record of one tool invocation.

    Attributes
    ----------
    turn        : 0-based conversation turn index.
    call_index  : Position within the turn (for parallel calls).
    tool_name   : Name of the called tool.
    args        : Arguments supplied to the tool.
    result      : Raw result payload (None until resolved).
    status      : SUCCESS | ERROR | PENDING.
    error       : Error dict if status == ERROR, else None.
    call_id     : Unique string identifier for this call (auto-generated).
    """
    turn: int
    call_index: int
    tool_name: str
    args: dict[str, Any]
    result: Any = None
    status: CallStatus = CallStatus.PENDING
    error: dict[str, Any] | None = None
    call_id: str = field(default="")

    def __post_init__(self) -> None:
        if not self.call_id:
            import uuid
            self.call_id = str(uuid.uuid4())[:8]

    @property
    def is_success(self) -> bool:
        return self.status == CallStatus.SUCCESS

    @property
    def is_error(self) -> bool:
        return self.status == CallStatus.ERROR

    def resolve(self, result_payload: dict[str, Any]) -> None:
        """
        Populate result from a mocker / real API payload.

        Expects the dict shape that ToolMocker.mock_result() returns:
          { "status": "success"|"error", "result": ..., "error": ... }
        """
        if result_payload.get("status") == "error":
            self.status = CallStatus.ERROR
            self.error  = result_payload.get("error")
            self.result = None
        else:
            self.status = CallStatus.SUCCESS
            self.result = result_payload.get("result")

    def to_dict(self) -> dict[str, Any]:
        return {
            "call_id":    self.call_id,
            "turn":       self.turn,
            "call_index": self.call_index,
            "tool_name":  self.tool_name,
            "args":       self.args,
            "status":     self.status.value,
            "result":     self.result,
            "error":      self.error,
        }


# ---------------------------------------------------------------------------
# Slot store — named values shared across turns
# ---------------------------------------------------------------------------

class SlotStore:
    """
    Key-value store for values extracted from tool results.

    Slots let later turns reference data produced by earlier ones.
    E.g. after get_user returns {"user_id": "abc"}, a slot "user_id"
    can be set to "abc" and injected into the next tool's args.
    """

    def __init__(self) -> None:
        self._slots: dict[str, Any] = {}

    def set(self, key: str, value: Any) -> None:
        self._slots[key] = value

    def get(self, key: str, default: Any = None) -> Any:
        return self._slots.get(key, default)

    def update_from_result(self, result: Any, prefix: str = "") -> None:
        """
        Flatten the top-level keys of a result dict into the slot store.

        prefix : optional namespace (e.g. tool name) to avoid collisions.
        """
        if not isinstance(result, dict):
            return
        for k, v in result.items():
            slot_key = f"{prefix}.{k}" if prefix else k
            self._slots[slot_key] = v

    def fill_args(self, args: dict[str, Any]) -> dict[str, Any]:
        """
        Return a copy of *args* where any string value of the form
        "${slot_name}" is replaced by the corresponding slot value.

        Example:
            slots = {"user_id": "abc-123"}
            args  = {"id": "${user_id}", "action": "delete"}
            →      {"id": "abc-123",     "action": "delete"}
        """
        filled: dict[str, Any] = {}
        for k, v in args.items():
            if isinstance(v, str) and v.startswith("${") and v.endswith("}"):
                slot_key = v[2:-1]
                filled[k] = self._slots.get(slot_key, v)  # keep placeholder if missing
            else:
                filled[k] = v
        return filled

    def as_dict(self) -> dict[str, Any]:
        return dict(self._slots)

    def __contains__(self, key: str) -> bool:
        return key in self._slots

    def __repr__(self) -> str:
        return f"SlotStore({self._slots!r})"


# ---------------------------------------------------------------------------
# Conversation state
# ---------------------------------------------------------------------------

class ConversationState:
    """
    Tracks the full state of one synthetic conversation as it is built.

    Usage
    -----
        state = ConversationState()

        # Turn 0 — single call
        rec = state.record_call(turn=0, tool_name="get_user", args={"id": "u1"})
        state.resolve_call(rec.call_id, mocker.mock_result(tool))

        # Turn 1 — inject slot from previous result
        args = state.slots.fill_args({"user_id": "${user_id}"})
        rec2 = state.record_call(turn=1, tool_name="update_user", args=args)
        ...
    """

    def __init__(self, conversation_id: str | None = None) -> None:
        import uuid
        self.conversation_id: str = conversation_id or str(uuid.uuid4())[:12]
        self._log: list[ToolCallRecord] = []
        self._index: dict[str, ToolCallRecord] = {}   # call_id → record
        self.slots = SlotStore()
        self.metadata: dict[str, Any] = {}

    # ------------------------------------------------------------------
    # Recording calls
    # ------------------------------------------------------------------

    def record_call(
        self,
        turn: int,
        tool_name: str,
        args: dict[str, Any],
        call_index: int = 0,
    ) -> ToolCallRecord:
        """
        Append a new PENDING ToolCallRecord and return it.

        call_index is used when multiple tools are called in parallel
        within the same turn (fan-out, fan-in patterns).
        """
        rec = ToolCallRecord(
            turn=turn,
            call_index=call_index,
            tool_name=tool_name,
            args=args,
        )
        self._log.append(rec)
        self._index[rec.call_id] = rec
        return rec

    def resolve_call(
        self,
        call_id: str,
        result_payload: dict[str, Any],
        auto_slot: bool = True,
    ) -> ToolCallRecord:
        """
        Resolve a PENDING call with a result payload.

        Parameters
        ----------
        call_id        : The call_id returned by record_call().
        result_payload : Dict from ToolMocker.mock_result() (or real API).
        auto_slot      : If True, automatically populate slots from the
                         top-level keys of a success result.

        Returns
        -------
        The resolved ToolCallRecord.
        """
        rec = self.require(call_id)
        rec.resolve(result_payload)
        if auto_slot and rec.is_success and isinstance(rec.result, dict):
            self.slots.update_from_result(rec.result, prefix=rec.tool_name)
            # Also store top-level keys without prefix for convenience
            self.slots.update_from_result(rec.result)
        return rec

    # ------------------------------------------------------------------
    # Lookup
    # ------------------------------------------------------------------

    def require(self, call_id: str) -> ToolCallRecord:
        if call_id not in self._index:
            raise KeyError(f"No call with id {call_id!r}")
        return self._index[call_id]

    def calls_for_turn(self, turn: int) -> list[ToolCallRecord]:
        return [r for r in self._log if r.turn == turn]

    def calls_for_tool(self, tool_name: str) -> list[ToolCallRecord]:
        return [r for r in self._log if r.tool_name == tool_name]

    @property
    def last_call(self) -> ToolCallRecord | None:
        return self._log[-1] if self._log else None

    @property
    def last_result(self) -> Any:
        lc = self.last_call
        return lc.result if lc else None

    # ------------------------------------------------------------------
    # Aggregates
    # ------------------------------------------------------------------

    @property
    def n_turns(self) -> int:
        if not self._log:
            return 0
        return max(r.turn for r in self._log) + 1

    @property
    def n_calls(self) -> int:
        return len(self._log)

    @property
    def n_success(self) -> int:
        return sum(1 for r in self._log if r.is_success)

    @property
    def n_errors(self) -> int:
        return sum(1 for r in self._log if r.is_error)

    @property
    def all_tool_names(self) -> list[str]:
        """Ordered list of tool names, one per call."""
        return [r.tool_name for r in self._log]

    # ------------------------------------------------------------------
    # Serialisation
    # ------------------------------------------------------------------

    def to_dict(self) -> dict[str, Any]:
        return {
            "conversation_id": self.conversation_id,
            "n_turns":         self.n_turns,
            "n_calls":         self.n_calls,
            "n_success":       self.n_success,
            "n_errors":        self.n_errors,
            "slots":           self.slots.as_dict(),
            "metadata":        self.metadata,
            "calls":           [r.to_dict() for r in self._log],
        }

    def __repr__(self) -> str:
        return (
            f"ConversationState(id={self.conversation_id!r}, "
            f"turns={self.n_turns}, calls={self.n_calls}, "
            f"success={self.n_success}, errors={self.n_errors})"
        )
