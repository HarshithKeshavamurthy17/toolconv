"""
agents/validator_agent.py — enforces all hard requirements on a conversation.

The ValidatorAgent is the last agent to run.  It inspects the assembled
conversation record and rejects it if any hard requirement is violated.
Rejected conversations are NOT written to the output dataset.

Hard requirements checked
-------------------------
REQ-1  ≥ 3 tool calls in the conversation.
REQ-2  ≥ 2 distinct tool names used.
REQ-3  All required metadata fields are present and correctly typed.
REQ-4  memory_grounding_rate is correctly computed (or None for single-call).
REQ-5  Chain consistency: a value produced by step N must appear in the
       arguments of step N+1 when a slot dependency exists.
REQ-6  Every message has a valid "role" and non-empty "content".
REQ-7  Every tool_call has "endpoint_id" and "arguments" keys.
REQ-8  Every tool_output has "endpoint_id" and "output" keys.
REQ-9  clarify_first conversations must have ≥ 1 clarification question.

Usage
-----
    report = ValidatorAgent().validate(record)
    if report.passed:
        write_to_dataset(record)
    else:
        logger.warning("Rejected: %s", report.failure_summary)
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any

from toolconv.agents.assistant_agent import AssistantResult
from toolconv.agents.planner_agent import ConversationPlan
from toolconv.agents.sampler_agent import SamplerResult

logger = logging.getLogger(__name__)

# Required top-level metadata keys and their expected Python types
_REQUIRED_METADATA: dict[str, type | tuple[type, ...]] = {
    "seed":                        int,
    "tool_ids_used":               list,
    "num_turns":                   int,
    "num_clarification_questions": int,
    "memory_grounding_rate":       (float, type(None)),
    "corpus_memory_enabled":       bool,
}


# ---------------------------------------------------------------------------
# Result types
# ---------------------------------------------------------------------------

@dataclass
class CheckResult:
    """Outcome of one individual requirement check."""
    name: str
    passed: bool
    message: str = ""

    def __repr__(self) -> str:
        status = "PASS" if self.passed else "FAIL"
        suffix = f" — {self.message}" if self.message else ""
        return f"[{status}] {self.name}{suffix}"


@dataclass
class ValidationReport:
    """
    Aggregate report from ValidatorAgent.validate().

    Attributes
    ----------
    passed          : True iff every check passed.
    checks          : One CheckResult per requirement.
    conversation_id : ID of the inspected conversation.
    """
    conversation_id: str
    checks: list[CheckResult] = field(default_factory=list)

    @property
    def passed(self) -> bool:
        return all(c.passed for c in self.checks)

    @property
    def failures(self) -> list[CheckResult]:
        return [c for c in self.checks if not c.passed]

    @property
    def failure_summary(self) -> str:
        if self.passed:
            return "all checks passed"
        return "; ".join(f.name for f in self.failures)

    def __repr__(self) -> str:
        status = "PASSED" if self.passed else f"FAILED({len(self.failures)} checks)"
        return f"ValidationReport({self.conversation_id!r}, {status})"


# ---------------------------------------------------------------------------
# ValidatorAgent
# ---------------------------------------------------------------------------

class ValidatorAgent:
    """
    Validates one assembled conversation record against all hard requirements.

    Parameters
    ----------
    min_tool_calls     : Minimum number of tool calls (default 3 — REQ-1).
    min_distinct_tools : Minimum distinct tool names (default 2 — REQ-2).
    """

    def __init__(
        self,
        min_tool_calls: int = 3,
        min_distinct_tools: int = 2,
    ) -> None:
        self._min_tool_calls = min_tool_calls
        self._min_distinct_tools = min_distinct_tools

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def validate(
        self,
        assistant_result: AssistantResult,
        plan: ConversationPlan,
        sampler_result: SamplerResult,
        metadata: dict[str, Any],
    ) -> ValidationReport:
        """
        Run all requirement checks on the assembled conversation.

        Parameters
        ----------
        assistant_result : Output from AssistantAgent.run().
        plan             : ConversationPlan used to generate the conversation.
        sampler_result   : SamplerResult that seeded the plan.
        metadata         : The metadata dict that will be written to the record.

        Returns
        -------
        ValidationReport — call .passed to decide whether to keep the record.
        """
        conv_id = assistant_result.state.conversation_id
        report = ValidationReport(conversation_id=conv_id)

        report.checks.extend([
            self._check_min_tool_calls(assistant_result),
            self._check_distinct_tools(assistant_result),
            self._check_metadata_fields(metadata),
            self._check_mgr(assistant_result, metadata),
            self._check_chain_consistency(assistant_result),
            self._check_message_structure(assistant_result),
            self._check_tool_call_structure(assistant_result),
            self._check_tool_output_structure(assistant_result),
            self._check_clarification_requirement(plan, assistant_result),
        ])

        if report.passed:
            logger.info("ValidatorAgent: conversation %r PASSED", conv_id)
        else:
            logger.warning(
                "ValidatorAgent: conversation %r FAILED — %s",
                conv_id, report.failure_summary,
            )
        return report

    def validate_record(self, record: dict[str, Any]) -> ValidationReport:
        """
        Validate a fully assembled record dict (for the --validate CLI command).

        Checks structural requirements only (no AssistantResult available).
        """
        conv_id = record.get("conversation_id", "unknown")
        report = ValidationReport(conversation_id=conv_id)
        meta = record.get("metadata", {})
        tool_calls = record.get("tool_calls", [])
        tool_outputs = record.get("tool_outputs", [])
        messages = record.get("messages", [])

        n_calls = len(tool_calls)
        distinct = len({tc.get("endpoint_id") for tc in tool_calls})

        report.checks.append(CheckResult(
            "REQ-1: ≥ 3 tool calls",
            n_calls >= self._min_tool_calls,
            f"found {n_calls}",
        ))
        report.checks.append(CheckResult(
            "REQ-2: ≥ 2 distinct tools",
            distinct >= self._min_distinct_tools,
            f"found {distinct}",
        ))
        report.checks.append(self._check_metadata_fields(meta))
        report.checks.append(self._check_message_structure_raw(messages))
        report.checks.append(self._check_tool_call_structure_raw(tool_calls))
        report.checks.append(self._check_tool_output_structure_raw(tool_outputs))

        # MGR range check
        mgr = meta.get("memory_grounding_rate")
        if mgr is not None:
            ok = isinstance(mgr, (int, float)) and 0.0 <= mgr <= 1.0
            report.checks.append(CheckResult(
                "REQ-4: MGR in [0,1] or None",
                ok,
                f"mgr={mgr}",
            ))

        return report

    # ------------------------------------------------------------------
    # Individual requirement checks
    # ------------------------------------------------------------------

    def _check_min_tool_calls(self, r: AssistantResult) -> CheckResult:
        n = len(r.tool_calls)
        return CheckResult(
            "REQ-1: ≥ 3 tool calls",
            n >= self._min_tool_calls,
            f"found {n}",
        )

    def _check_distinct_tools(self, r: AssistantResult) -> CheckResult:
        distinct = len({tc["endpoint_id"] for tc in r.tool_calls})
        return CheckResult(
            "REQ-2: ≥ 2 distinct tools",
            distinct >= self._min_distinct_tools,
            f"found {distinct}",
        )

    def _check_metadata_fields(self, meta: dict[str, Any]) -> CheckResult:
        missing = []
        wrong_type = []
        for key, expected_type in _REQUIRED_METADATA.items():
            if key not in meta:
                missing.append(key)
            elif not isinstance(meta[key], expected_type):
                wrong_type.append(f"{key}={type(meta[key]).__name__}")
        if missing or wrong_type:
            parts = []
            if missing:
                parts.append(f"missing={missing}")
            if wrong_type:
                parts.append(f"wrong_type={wrong_type}")
            return CheckResult("REQ-3: required metadata", False, "; ".join(parts))
        return CheckResult("REQ-3: required metadata", True)

    def _check_mgr(
        self, r: AssistantResult, meta: dict[str, Any]
    ) -> CheckResult:
        """REQ-4: MGR stored in metadata must match computed value."""
        computed = r.memory_grounding_rate
        stored = meta.get("memory_grounding_rate")
        # Allow small floating-point tolerance
        if computed is None and stored is None:
            return CheckResult("REQ-4: MGR correct", True, "both None")
        if computed is None or stored is None:
            return CheckResult(
                "REQ-4: MGR correct", False,
                f"computed={computed}, stored={stored}",
            )
        ok = abs(float(computed) - float(stored)) < 1e-6
        return CheckResult(
            "REQ-4: MGR correct",
            ok,
            f"computed={computed}, stored={stored}",
        )

    def _check_chain_consistency(self, r: AssistantResult) -> CheckResult:
        """
        REQ-5: a value produced by step N must appear in step N+1's arguments
        when the same field name exists in both output and arguments.
        Checks the top-level string values only (deep nesting not required).
        """
        violations: list[str] = []
        for i in range(1, len(r.tool_calls)):
            prev_output = r.tool_outputs[i - 1].get("output", {})
            curr_args   = r.tool_calls[i].get("arguments", {})
            if not isinstance(prev_output, dict):
                continue
            for key, val in prev_output.items():
                if not isinstance(val, str):
                    continue
                # If the same key appears in curr_args, values must match
                if key in curr_args and isinstance(curr_args[key], str):
                    if curr_args[key] != val and not curr_args[key].startswith("${"):
                        violations.append(
                            f"step {i}: {key}={curr_args[key]!r} "
                            f"≠ step {i-1} output {val!r}"
                        )
        return CheckResult(
            "REQ-5: chain consistency",
            len(violations) == 0,
            "; ".join(violations[:3]),  # report first 3
        )

    def _check_message_structure(self, r: AssistantResult) -> CheckResult:
        return self._check_message_structure_raw(r.messages)

    def _check_message_structure_raw(
        self, messages: list[dict[str, Any]]
    ) -> CheckResult:
        bad = []
        valid_roles = {"user", "assistant", "tool", "system"}
        for i, m in enumerate(messages):
            if not isinstance(m, dict):
                bad.append(f"msg[{i}] not a dict")
                continue
            if m.get("role") not in valid_roles:
                bad.append(f"msg[{i}] invalid role={m.get('role')!r}")
            if not m.get("content"):
                bad.append(f"msg[{i}] empty content")
        return CheckResult(
            "REQ-6: message structure",
            len(bad) == 0,
            "; ".join(bad[:3]),
        )

    def _check_tool_call_structure(self, r: AssistantResult) -> CheckResult:
        return self._check_tool_call_structure_raw(r.tool_calls)

    def _check_tool_call_structure_raw(
        self, tool_calls: list[dict[str, Any]]
    ) -> CheckResult:
        bad = [
            f"tc[{i}] missing keys"
            for i, tc in enumerate(tool_calls)
            if "endpoint_id" not in tc or "arguments" not in tc
        ]
        return CheckResult("REQ-7: tool_call structure", len(bad) == 0, "; ".join(bad))

    def _check_tool_output_structure(self, r: AssistantResult) -> CheckResult:
        return self._check_tool_output_structure_raw(r.tool_outputs)

    def _check_tool_output_structure_raw(
        self, tool_outputs: list[dict[str, Any]]
    ) -> CheckResult:
        bad = [
            f"to[{i}] missing keys"
            for i, to in enumerate(tool_outputs)
            if "endpoint_id" not in to or "output" not in to
        ]
        return CheckResult("REQ-8: tool_output structure", len(bad) == 0, "; ".join(bad))

    def _check_clarification_requirement(
        self, plan: ConversationPlan, r: AssistantResult
    ) -> CheckResult:
        """REQ-9: clarify_first conversations must have ≥ 1 clarification Q."""
        if plan.pattern_type != "clarify_first":
            return CheckResult("REQ-9: clarification (N/A)", True, "pattern not clarify_first")
        ok = r.n_clarification_questions >= 1
        return CheckResult(
            "REQ-9: clarify_first has ≥1 question",
            ok,
            f"found {r.n_clarification_questions}",
        )
