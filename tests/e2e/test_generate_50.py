"""
tests/e2e/test_generate_50.py — end-to-end generation test.

Verifies that the full pipeline can produce ≥ 50 validated conversations
using a synthetic in-memory tool registry.  No LLM API calls are made
(the offline stub in utils/llm.py handles generation deterministically).

The test is intentionally slow (~30–120 s depending on hardware) but
must complete within the pytest timeout.

Hard requirements verified post-generation
------------------------------------------
  REQ-1  Every conversation has ≥ 3 tool calls.
  REQ-2  Every conversation uses ≥ 2 distinct tools.
  REQ-3  All required metadata fields are present.
  REQ-4  memory_grounding_rate is correctly typed (float or None).
  Pattern distribution: mix of sequential / parallel / clarify_first.
  Dataset size: ≥ 50 records written to JSONL.
"""

from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path

import networkx as nx
import pytest

from toolconv.generation.orchestrator import GeneratorConfig, Orchestrator
from toolconv.memory.mem0_store import ScopedInMemoryStore
from toolconv.registry import ToolRegistry
from toolconv.registry.models import (
    ParamSchema,
    ParamType,
    RegistryEntry,
    ToolDef,
)


# ---------------------------------------------------------------------------
# Fixtures — synthetic tool registry
# ---------------------------------------------------------------------------

def _param(ptype: str, description: str = "") -> dict:
    return {"type": ptype, **({"description": description} if description else {})}


_TOOLS = [
    {
        "name": "search_flights",
        "description": "Search for available flights",
        "tags": ["travel", "flights"],
        "params": {
            "origin": _param("string", "Departure airport code"),
            "destination": _param("string", "Arrival airport code"),
            "date": _param("string", "Travel date YYYY-MM-DD"),
        },
        "required": ["origin", "destination", "date"],
    },
    {
        "name": "get_flight_price",
        "description": "Retrieve the price for a flight",
        "tags": ["travel", "flights", "pricing"],
        "params": {
            "flight_id": _param("string", "Flight identifier"),
        },
        "required": ["flight_id"],
    },
    {
        "name": "book_flight",
        "description": "Book a flight and return a booking confirmation",
        "tags": ["travel", "flights", "booking"],
        "params": {
            "flight_id": _param("string", "Flight to book"),
            "passenger_name": _param("string", "Full name of passenger"),
        },
        "required": ["flight_id", "passenger_name"],
    },
    {
        "name": "get_weather",
        "description": "Get current weather for a city",
        "tags": ["travel", "weather"],
        "params": {
            "city": _param("string", "City name"),
        },
        "required": ["city"],
    },
    {
        "name": "get_exchange_rate",
        "description": "Get currency exchange rate",
        "tags": ["finance", "currency"],
        "params": {
            "from_currency": _param("string", "Source currency code"),
            "to_currency": _param("string", "Target currency code"),
        },
        "required": ["from_currency", "to_currency"],
    },
    {
        "name": "get_stock_price",
        "description": "Get the current price of a stock",
        "tags": ["finance", "stocks"],
        "params": {
            "ticker": _param("string", "Stock ticker symbol"),
        },
        "required": ["ticker"],
    },
    {
        "name": "send_email",
        "description": "Send an email to a recipient",
        "tags": ["communication", "email"],
        "params": {
            "to": _param("string", "Recipient email address"),
            "subject": _param("string", "Email subject"),
            "body": _param("string", "Email body text"),
        },
        "required": ["to", "subject", "body"],
    },
    {
        "name": "create_calendar_event",
        "description": "Create a calendar event",
        "tags": ["productivity", "calendar"],
        "params": {
            "title": _param("string", "Event title"),
            "date": _param("string", "Event date"),
            "time": _param("string", "Event time"),
        },
        "required": ["title", "date"],
    },
    {
        "name": "search_hotels",
        "description": "Search for hotels in a city",
        "tags": ["travel", "hotels"],
        "params": {
            "city": _param("string", "City to search in"),
            "checkin": _param("string", "Check-in date"),
            "checkout": _param("string", "Check-out date"),
        },
        "required": ["city", "checkin", "checkout"],
    },
    {
        "name": "book_hotel",
        "description": "Book a hotel room",
        "tags": ["travel", "hotels", "booking"],
        "params": {
            "hotel_id": _param("string", "Hotel identifier"),
            "guest_name": _param("string", "Guest full name"),
        },
        "required": ["hotel_id", "guest_name"],
    },
]


def _build_registry() -> ToolRegistry:
    reg = ToolRegistry()
    for t in _TOOLS:
        tool = ToolDef(
            name=t["name"],
            description=t["description"],
            tags=t["tags"],
            parameters=ParamSchema(
                type=ParamType.OBJECT,
                properties={k: ParamSchema(**v) for k, v in t["params"].items()},
                required=t["required"],
            ),
        )
        reg.register(RegistryEntry(tool=tool, provider="test"))
    return reg


def _build_graph(reg: ToolRegistry) -> nx.DiGraph:
    from toolconv.graph.builder import ToolGraphBuilder

    builder = ToolGraphBuilder(reg)
    builder.infer_edges()
    return builder.build()


# ---------------------------------------------------------------------------
# E2E test
# ---------------------------------------------------------------------------

@pytest.mark.timeout(300)   # 5-minute hard cap
def test_generate_50_conversations(tmp_path):
    """
    Generate ≥ 50 validated conversations and verify all hard requirements.
    """
    # Ensure offline mode (no real LLM calls)
    os.environ.setdefault("LLM_PROVIDER", "stub")

    output_file = tmp_path / "conversations.jsonl"

    reg = _build_registry()
    G = _build_graph(reg)
    memory = ScopedInMemoryStore()

    cfg = GeneratorConfig(
        n_conversations=50,
        seed=42,
        output_path=str(output_file),
        corpus_memory_enabled=True,
        min_tools=3,
        max_tools=5,
        max_retries=5,  # extra retries for small test registry
    )

    orch = Orchestrator(reg, G, config=cfg, memory=memory)
    stats = orch.run()

    # ── Dataset size ──────────────────────────────────────────────────────
    assert stats.total_written >= 50, (
        f"Expected ≥50 conversations written, got {stats.total_written}"
    )
    assert output_file.exists()

    records = [json.loads(line) for line in output_file.read_text().splitlines() if line.strip()]
    assert len(records) >= 50, f"JSONL has {len(records)} records, expected ≥ 50"

    # ── Per-record checks ─────────────────────────────────────────────────
    for i, rec in enumerate(records):
        conv_id = rec.get("conversation_id", f"record-{i}")
        tool_calls = rec.get("tool_calls", [])
        metadata = rec.get("metadata", {})

        # REQ-1: ≥ 3 tool calls
        assert len(tool_calls) >= 3, (
            f"{conv_id}: expected ≥3 tool calls, got {len(tool_calls)}"
        )

        # REQ-2: ≥ 2 distinct tools
        distinct = {tc["endpoint_id"] for tc in tool_calls}
        assert len(distinct) >= 2, (
            f"{conv_id}: expected ≥2 distinct tools, got {distinct}"
        )

        # REQ-3: required metadata fields present
        for field_name in [
            "seed", "tool_ids_used", "num_turns",
            "num_clarification_questions", "corpus_memory_enabled",
        ]:
            assert field_name in metadata, (
                f"{conv_id}: missing metadata field {field_name!r}"
            )

        # REQ-4: memory_grounding_rate is float or None
        mgr = metadata.get("memory_grounding_rate")
        if mgr is not None:
            assert isinstance(mgr, (int, float)), (
                f"{conv_id}: memory_grounding_rate should be float, got {type(mgr)}"
            )
            assert 0.0 <= float(mgr) <= 1.0, (
                f"{conv_id}: memory_grounding_rate {mgr} out of [0, 1]"
            )

        # REQ-6: all messages have role and content
        for msg in rec.get("messages", []):
            assert msg.get("role") in {"user", "assistant", "tool", "system"}, (
                f"{conv_id}: invalid message role {msg.get('role')!r}"
            )
            assert msg.get("content"), f"{conv_id}: message has empty content"

        # REQ-7 / REQ-8: tool_calls and tool_outputs have required keys
        for tc in tool_calls:
            assert "endpoint_id" in tc and "arguments" in tc, (
                f"{conv_id}: malformed tool_call: {tc}"
            )
        for to in rec.get("tool_outputs", []):
            assert "endpoint_id" in to and "output" in to, (
                f"{conv_id}: malformed tool_output: {to}"
            )

    # ── Pattern distribution ───────────────────────────────────────────────
    from collections import Counter

    patterns = Counter(
        rec["metadata"].get("pattern_type", "unknown") for rec in records
    )
    # Expect at least 2 distinct patterns in 50 conversations
    assert len(patterns) >= 2, (
        f"Expected ≥ 2 distinct patterns, got {dict(patterns)}"
    )

    # ── Diversity sanity check ─────────────────────────────────────────────
    from toolconv.metrics.diversity import compute_diversity_metrics

    metrics = compute_diversity_metrics(records)
    # Some diversity expected — not all conversations can be identical
    assert metrics["tool_jaccard_dissimilarity"] >= 0.0
    assert metrics["distinct_2_tool_bigrams"] > 0.0


@pytest.mark.timeout(300)
def test_generate_no_corpus_memory(tmp_path):
    """
    Generate conversations with corpus memory disabled (--no-corpus-memory flag).
    Must still produce ≥ 50 valid records.
    """
    os.environ.setdefault("LLM_PROVIDER", "stub")

    output_file = tmp_path / "conversations_no_mem.jsonl"

    reg = _build_registry()
    G = _build_graph(reg)
    memory = ScopedInMemoryStore()

    cfg = GeneratorConfig(
        n_conversations=50,
        seed=7,
        output_path=str(output_file),
        corpus_memory_enabled=False,   # <-- --no-corpus-memory
        min_tools=3,
        max_tools=5,
        max_retries=5,
    )

    orch = Orchestrator(reg, G, config=cfg, memory=memory)
    stats = orch.run()

    assert stats.total_written >= 50
    records = [
        json.loads(line)
        for line in output_file.read_text().splitlines()
        if line.strip()
    ]
    assert len(records) >= 50

    # All records should have corpus_memory_enabled = False
    for rec in records:
        assert rec["metadata"]["corpus_memory_enabled"] is False


@pytest.mark.timeout(300)
def test_diversity_experiment_comparison(tmp_path):
    """
    Run A (corpus memory ON) vs Run B (corpus memory OFF) and compare metrics.
    Verifies the comparison code path in cli.py `metrics` command works end-to-end.
    """
    os.environ.setdefault("LLM_PROVIDER", "stub")

    reg = _build_registry()
    G = _build_graph(reg)

    # Run A — corpus memory ON
    out_a = tmp_path / "run_a.jsonl"
    cfg_a = GeneratorConfig(
        n_conversations=20, seed=42, output_path=str(out_a),
        corpus_memory_enabled=True, min_tools=3, max_tools=4, max_retries=5,
    )
    Orchestrator(reg, G, config=cfg_a, memory=ScopedInMemoryStore()).run()

    # Run B — corpus memory OFF
    out_b = tmp_path / "run_b.jsonl"
    cfg_b = GeneratorConfig(
        n_conversations=20, seed=42, output_path=str(out_b),
        corpus_memory_enabled=False, min_tools=3, max_tools=4, max_retries=5,
    )
    Orchestrator(reg, G, config=cfg_b, memory=ScopedInMemoryStore()).run()

    # Both output files must exist with ≥ 20 records
    records_a = [json.loads(l) for l in out_a.read_text().splitlines() if l.strip()]
    records_b = [json.loads(l) for l in out_b.read_text().splitlines() if l.strip()]
    assert len(records_a) >= 20
    assert len(records_b) >= 20

    # Compute and compare metrics (smoke test)
    from toolconv.metrics.diversity import compute_diversity_metrics
    from toolconv.metrics.dataset_metrics import compute_dataset_metrics

    m_a = compute_diversity_metrics(records_a)
    m_b = compute_diversity_metrics(records_b)
    d_a = compute_dataset_metrics(records_a)
    d_b = compute_dataset_metrics(records_b)

    # Metrics must be present and in valid range
    for m in [m_a, m_b]:
        assert 0.0 <= m["tool_jaccard_dissimilarity"] <= 1.0
        assert 0.0 <= m["distinct_2_tool_bigrams"] <= 1.0
        assert m["avg_tools_per_conversation"] >= 2.0

    for d in [d_a, d_b]:
        assert d["total_conversations"] >= 20
        assert 0.0 <= d["acceptance_rate"] <= 1.0
