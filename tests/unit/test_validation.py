"""
tests/unit/test_validation.py — unit tests for ValidatorAgent and ToolCallValidator.
"""

from __future__ import annotations

from unittest.mock import MagicMock

import pytest

from toolconv.agents.validator_agent import CheckResult, ValidatorAgent, ValidationReport
from toolconv.executor.validator import ToolCallValidator
from toolconv.registry.models import ParamSchema, ParamType, ToolDef


# ---------------------------------------------------------------------------
# Fixtures and helpers
# ---------------------------------------------------------------------------

def _make_tool(
    name: str = "search",
    params: dict | None = None,
    required: list[str] | None = None,
) -> ToolDef:
    props = params or {"query": {"type": "string"}}
    req = required if required is not None else list(props.keys())
    return ToolDef(
        name=name,
        description=f"Test tool {name}",
        parameters=ParamSchema(
            type=ParamType.OBJECT,
            properties={k: ParamSchema(**v) for k, v in props.items()},
            required=req,
        ),
    )


def _make_assistant_result(
    tool_calls: list[dict] | None = None,
    tool_outputs: list[dict] | None = None,
    messages: list[dict] | None = None,
    grounded_steps: list[int] | None = None,
    n_clarification_questions: int = 0,
):
    """Create a mock AssistantResult."""
    from toolconv.agents.assistant_agent import AssistantResult
    from toolconv.executor.state import ConversationState

    tcs = tool_calls or [
        {"endpoint_id": "tool_a", "arguments": {"x": "1"}},
        {"endpoint_id": "tool_b", "arguments": {"y": "2"}},
        {"endpoint_id": "tool_c", "arguments": {"z": "3"}},
    ]
    tos = tool_outputs or [
        {"endpoint_id": "tool_a", "output": {"val": "result_a"}},
        {"endpoint_id": "tool_b", "output": {"val": "result_b"}},
        {"endpoint_id": "tool_c", "output": {"val": "result_c"}},
    ]
    msgs = messages or [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Let me help."},
        {"role": "tool", "content": '{"val": "result_a"}'},
    ]
    state = ConversationState(conversation_id="test-conv-001")
    result = AssistantResult(
        messages=msgs,
        tool_calls=tcs,
        tool_outputs=tos,
        state=state,
        grounded_steps=grounded_steps or [1, 2],
        n_clarification_questions=n_clarification_questions,
    )
    return result


def _make_plan(pattern_type: str = "sequential", domain: str = "travel"):
    """Create a mock ConversationPlan."""
    plan = MagicMock()
    plan.pattern_type = pattern_type
    plan.domain = domain
    plan.user_goal = "Book a flight to Paris"
    return plan


def _make_sampler_result():
    """Create a minimal mock SamplerResult."""
    sr = MagicMock()
    sr.tool_names = ["tool_a", "tool_b", "tool_c"]
    return sr


def _make_metadata(
    seed: int = 42,
    tool_ids_used: list[str] | None = None,
    num_turns: int = 3,
    num_clarification_questions: int = 0,
    memory_grounding_rate: float | None = 1.0,
    corpus_memory_enabled: bool = True,
) -> dict:
    return {
        "seed": seed,
        "tool_ids_used": tool_ids_used or ["tool_a", "tool_b", "tool_c"],
        "num_turns": num_turns,
        "num_clarification_questions": num_clarification_questions,
        "memory_grounding_rate": memory_grounding_rate,
        "corpus_memory_enabled": corpus_memory_enabled,
    }


# ---------------------------------------------------------------------------
# CheckResult and ValidationReport
# ---------------------------------------------------------------------------

class TestCheckResult:
    def test_passed_repr(self):
        cr = CheckResult("REQ-1", passed=True)
        assert "PASS" in repr(cr)

    def test_failed_repr(self):
        cr = CheckResult("REQ-1", passed=False, message="found 2")
        assert "FAIL" in repr(cr)
        assert "found 2" in repr(cr)


class TestValidationReport:
    def test_passed_when_all_checks_pass(self):
        report = ValidationReport(conversation_id="c1", checks=[
            CheckResult("REQ-1", True),
            CheckResult("REQ-2", True),
        ])
        assert report.passed is True

    def test_failed_when_any_check_fails(self):
        report = ValidationReport(conversation_id="c1", checks=[
            CheckResult("REQ-1", True),
            CheckResult("REQ-2", False, "only 1 distinct tool"),
        ])
        assert report.passed is False

    def test_failures_list(self):
        report = ValidationReport(conversation_id="c1", checks=[
            CheckResult("REQ-1", True),
            CheckResult("REQ-2", False),
            CheckResult("REQ-3", False),
        ])
        assert len(report.failures) == 2

    def test_failure_summary(self):
        report = ValidationReport(conversation_id="c1", checks=[
            CheckResult("REQ-1", False, "only 1"),
        ])
        assert "REQ-1" in report.failure_summary

    def test_all_passed_summary(self):
        report = ValidationReport(conversation_id="c1", checks=[
            CheckResult("REQ-1", True),
        ])
        assert report.failure_summary == "all checks passed"


# ---------------------------------------------------------------------------
# ValidatorAgent — validate() (from agent objects)
# ---------------------------------------------------------------------------

class TestValidatorAgentValidate:
    def test_valid_conversation_passes(self):
        validator = ValidatorAgent()
        result = _make_assistant_result()
        plan = _make_plan()
        sr = _make_sampler_result()
        meta = _make_metadata()

        report = validator.validate(result, plan, sr, meta)
        assert report.passed, report.failure_summary

    def test_fails_req1_too_few_tool_calls(self):
        validator = ValidatorAgent(min_tool_calls=3)
        result = _make_assistant_result(
            tool_calls=[{"endpoint_id": "tool_a", "arguments": {}}],
            tool_outputs=[{"endpoint_id": "tool_a", "output": {}}],
        )
        report = validator.validate(result, _make_plan(), _make_sampler_result(), _make_metadata())
        failures = {f.name for f in report.failures}
        assert any("REQ-1" in f for f in failures)

    def test_fails_req2_not_distinct_tools(self):
        validator = ValidatorAgent(min_distinct_tools=3)
        result = _make_assistant_result(
            tool_calls=[
                {"endpoint_id": "tool_a", "arguments": {}},
                {"endpoint_id": "tool_a", "arguments": {}},
                {"endpoint_id": "tool_a", "arguments": {}},
            ],
            tool_outputs=[
                {"endpoint_id": "tool_a", "output": {}},
                {"endpoint_id": "tool_a", "output": {}},
                {"endpoint_id": "tool_a", "output": {}},
            ],
        )
        report = validator.validate(result, _make_plan(), _make_sampler_result(), _make_metadata())
        failures = {f.name for f in report.failures}
        assert any("REQ-2" in f for f in failures)

    def test_fails_req3_missing_metadata_field(self):
        validator = ValidatorAgent()
        meta = _make_metadata()
        del meta["seed"]
        result = _make_assistant_result()
        report = validator.validate(result, _make_plan(), _make_sampler_result(), meta)
        failures = {f.name for f in report.failures}
        assert any("REQ-3" in f for f in failures)

    def test_fails_req4_mgr_mismatch(self):
        validator = ValidatorAgent()
        result = _make_assistant_result(grounded_steps=[1, 2])
        # MGR should be 2/2 = 1.0 but we store 0.5
        meta = _make_metadata(memory_grounding_rate=0.5)
        report = validator.validate(result, _make_plan(), _make_sampler_result(), meta)
        failures = {f.name for f in report.failures}
        assert any("REQ-4" in f for f in failures)

    def test_fails_req6_empty_message_content(self):
        validator = ValidatorAgent()
        result = _make_assistant_result(
            messages=[
                {"role": "user", "content": ""},  # empty content
                {"role": "assistant", "content": "Response"},
            ]
        )
        report = validator.validate(result, _make_plan(), _make_sampler_result(), _make_metadata())
        failures = {f.name for f in report.failures}
        assert any("REQ-6" in f for f in failures)

    def test_fails_req6_invalid_role(self):
        validator = ValidatorAgent()
        result = _make_assistant_result(
            messages=[{"role": "robot", "content": "Hello"}]
        )
        report = validator.validate(result, _make_plan(), _make_sampler_result(), _make_metadata())
        failures = {f.name for f in report.failures}
        assert any("REQ-6" in f for f in failures)

    def test_fails_req7_tool_call_missing_keys(self):
        validator = ValidatorAgent()
        result = _make_assistant_result(
            tool_calls=[{"endpoint_id": "tool_a"}]  # missing "arguments"
        )
        report = validator.validate(result, _make_plan(), _make_sampler_result(), _make_metadata())
        failures = {f.name for f in report.failures}
        assert any("REQ-7" in f for f in failures)

    def test_fails_req8_tool_output_missing_keys(self):
        validator = ValidatorAgent()
        result = _make_assistant_result(
            tool_outputs=[
                {"endpoint_id": "tool_a"},          # missing "output"
                {"endpoint_id": "tool_b", "output": {}},
                {"endpoint_id": "tool_c", "output": {}},
            ]
        )
        report = validator.validate(result, _make_plan(), _make_sampler_result(), _make_metadata())
        failures = {f.name for f in report.failures}
        assert any("REQ-8" in f for f in failures)

    def test_fails_req9_clarify_first_no_question(self):
        validator = ValidatorAgent()
        result = _make_assistant_result(n_clarification_questions=0)
        plan = _make_plan(pattern_type="clarify_first")
        report = validator.validate(result, plan, _make_sampler_result(), _make_metadata())
        failures = {f.name for f in report.failures}
        assert any("REQ-9" in f for f in failures)

    def test_passes_req9_clarify_first_with_question(self):
        validator = ValidatorAgent()
        result = _make_assistant_result(n_clarification_questions=1)
        plan = _make_plan(pattern_type="clarify_first")
        meta = _make_metadata(num_clarification_questions=1)
        report = validator.validate(result, plan, _make_sampler_result(), meta)
        clarify_checks = [c for c in report.checks if "REQ-9" in c.name]
        assert all(c.passed for c in clarify_checks)

    def test_req9_na_for_sequential(self):
        validator = ValidatorAgent()
        result = _make_assistant_result(n_clarification_questions=0)
        plan = _make_plan(pattern_type="sequential")
        report = validator.validate(result, plan, _make_sampler_result(), _make_metadata())
        clarify_check = next(c for c in report.checks if "REQ-9" in c.name)
        assert clarify_check.passed  # N/A → pass


# ---------------------------------------------------------------------------
# ValidatorAgent — validate_record() (from JSONL dict)
# ---------------------------------------------------------------------------

class TestValidatorAgentValidateRecord:
    def _valid_record(self) -> dict:
        return {
            "conversation_id": "conv-0001",
            "messages": [
                {"role": "user", "content": "Book a flight"},
                {"role": "assistant", "content": "I'll help you."},
                {"role": "tool", "content": '{"flight_id": "AA123"}'},
            ],
            "tool_calls": [
                {"endpoint_id": "search_flights", "arguments": {"origin": "NYC"}},
                {"endpoint_id": "get_price", "arguments": {"flight_id": "AA123"}},
                {"endpoint_id": "book_flight", "arguments": {"flight_id": "AA123"}},
            ],
            "tool_outputs": [
                {"endpoint_id": "search_flights", "output": {"flight_id": "AA123"}},
                {"endpoint_id": "get_price", "output": {"price": 350.0}},
                {"endpoint_id": "book_flight", "output": {"confirmed": True}},
            ],
            "metadata": {
                "seed": 42,
                "tool_ids_used": ["search_flights", "get_price", "book_flight"],
                "num_turns": 4,
                "num_clarification_questions": 0,
                "memory_grounding_rate": 1.0,
                "corpus_memory_enabled": True,
                "pattern_type": "sequential",
                "domain": "travel",
                "validation_passed": True,
            },
        }

    def test_valid_record_passes(self):
        validator = ValidatorAgent()
        report = validator.validate_record(self._valid_record())
        assert report.passed, report.failure_summary

    def test_too_few_tool_calls(self):
        validator = ValidatorAgent(min_tool_calls=3)
        record = self._valid_record()
        record["tool_calls"] = record["tool_calls"][:1]
        report = validator.validate_record(record)
        assert not report.passed

    def test_not_distinct_tools(self):
        validator = ValidatorAgent(min_distinct_tools=2)
        record = self._valid_record()
        # All same tool
        record["tool_calls"] = [
            {"endpoint_id": "search_flights", "arguments": {}},
            {"endpoint_id": "search_flights", "arguments": {}},
            {"endpoint_id": "search_flights", "arguments": {}},
        ]
        report = validator.validate_record(record)
        assert not report.passed

    def test_mgr_out_of_range(self):
        validator = ValidatorAgent()
        record = self._valid_record()
        record["metadata"]["memory_grounding_rate"] = 1.5  # > 1.0
        report = validator.validate_record(record)
        assert not report.passed

    def test_missing_metadata_key(self):
        validator = ValidatorAgent()
        record = self._valid_record()
        del record["metadata"]["corpus_memory_enabled"]
        report = validator.validate_record(record)
        assert not report.passed


# ---------------------------------------------------------------------------
# ToolCallValidator (executor/validator.py)
# ---------------------------------------------------------------------------

class TestToolCallValidator:
    def test_valid_args(self):
        tool = _make_tool(params={"query": {"type": "string"}})
        vr = ToolCallValidator().validate(tool, {"query": "hello"})
        assert vr.valid

    def test_missing_required_param(self):
        tool = _make_tool(
            params={"query": {"type": "string"}, "limit": {"type": "integer"}},
            required=["query"],
        )
        vr = ToolCallValidator().validate(tool, {})
        assert not vr.valid
        assert any("query" in e.message.lower() for e in vr.errors)

    def test_wrong_type_string_not_integer(self):
        tool = _make_tool(params={"count": {"type": "integer"}})
        vr = ToolCallValidator().validate(tool, {"count": "not_an_int"})
        assert not vr.valid

    def test_enum_violation(self):
        tool = _make_tool(params={"color": {"type": "string", "enum": ["red", "blue"]}})
        vr = ToolCallValidator().validate(tool, {"color": "green"})
        assert not vr.valid

    def test_enum_valid(self):
        tool = _make_tool(params={"color": {"type": "string", "enum": ["red", "blue"]}})
        vr = ToolCallValidator().validate(tool, {"color": "red"})
        assert vr.valid

    def test_minimum_constraint(self):
        tool = _make_tool(params={"age": {"type": "number", "minimum": 0}})
        vr = ToolCallValidator().validate(tool, {"age": -1})
        assert not vr.valid

    def test_maximum_constraint(self):
        tool = _make_tool(params={"score": {"type": "number", "maximum": 100}})
        vr = ToolCallValidator().validate(tool, {"score": 101})
        assert not vr.valid

    def test_is_valid_shortcut(self):
        tool = _make_tool(params={"q": {"type": "string"}})
        assert ToolCallValidator().is_valid(tool, {"q": "test"}) is True
        assert ToolCallValidator().is_valid(tool, {}) is False

    def test_validate_many(self):
        tool = _make_tool(params={"q": {"type": "string"}})
        results = ToolCallValidator().validate_many(tool, [{"q": "ok"}, {}])
        assert results[0].valid
        assert not results[1].valid

    def test_bool_not_treated_as_int(self):
        """bool is a subclass of int in Python; validator must distinguish them."""
        tool = _make_tool(params={"count": {"type": "integer"}})
        vr = ToolCallValidator().validate(tool, {"count": True})
        # True should NOT be accepted as an integer
        assert not vr.valid
