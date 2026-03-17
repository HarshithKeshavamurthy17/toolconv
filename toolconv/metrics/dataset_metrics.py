"""
metrics/dataset_metrics.py — dataset-level aggregate metrics.

Metrics computed
----------------
  total_conversations
      Total number of records in the dataset.

  acceptance_rate
      Fraction of records where ``metadata.validation_passed`` is True.

  avg_tool_calls_per_conversation
      Mean number of tool calls per record.

  avg_turns_per_conversation
      Mean value of ``metadata.num_turns``.

  avg_clarification_questions
      Mean value of ``metadata.num_clarification_questions``.

  avg_memory_grounding_rate
      Mean MGR (excluding None values — single-tool-call conversations).

  corpus_memory_enabled_fraction
      Fraction of records where corpus memory was enabled.

  pattern_distribution
      Dict mapping pattern_type → fraction.

  domain_distribution
      Dict mapping domain → fraction.

  clarify_first_fraction
      Fraction of conversations with pattern_type == "clarify_first".

Usage
-----
    from toolconv.metrics.dataset_metrics import compute_dataset_metrics
    records = [json.loads(line) for line in open("outputs/conversations.jsonl")]
    stats = compute_dataset_metrics(records)
    # stats is a dict[str, int | float | dict]
"""

from __future__ import annotations

from collections import Counter
from typing import Any


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def compute_dataset_metrics(records: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Compute dataset-level aggregate metrics.

    Parameters
    ----------
    records : List of dicts — each must have ``tool_calls`` and ``metadata``.

    Returns
    -------
    dict[str, Any] — flat dict of metric name → value.
    """
    if not records:
        return _empty_metrics()

    n = len(records)

    tool_call_counts: list[int] = []
    turn_counts: list[int] = []
    clarification_counts: list[int] = []
    mgr_values: list[float] = []
    corpus_enabled: list[bool] = []
    pattern_labels: list[str] = []
    domain_labels: list[str] = []
    validation_passed: list[bool] = []

    for rec in records:
        meta = rec.get("metadata", {})
        tool_calls = rec.get("tool_calls", [])

        tool_call_counts.append(len(tool_calls))
        turn_counts.append(meta.get("num_turns", 0))
        clarification_counts.append(meta.get("num_clarification_questions", 0))

        mgr = meta.get("memory_grounding_rate")
        if mgr is not None:
            mgr_values.append(float(mgr))

        corpus_enabled.append(bool(meta.get("corpus_memory_enabled", False)))
        pattern_labels.append(meta.get("pattern_type", "unknown"))
        domain_labels.append(meta.get("domain", "unknown"))
        validation_passed.append(bool(meta.get("validation_passed", False)))

    pattern_dist = _distribution(pattern_labels)
    domain_dist = _distribution(domain_labels)

    return {
        "total_conversations":              n,
        "acceptance_rate":                  round(sum(validation_passed) / n, 4),
        "avg_tool_calls_per_conversation":  round(_mean(tool_call_counts), 4),
        "avg_turns_per_conversation":       round(_mean(turn_counts), 4),
        "avg_clarification_questions":      round(_mean(clarification_counts), 4),
        "avg_memory_grounding_rate":        round(_mean(mgr_values), 4) if mgr_values else None,
        "corpus_memory_enabled_fraction":   round(sum(corpus_enabled) / n, 4),
        "clarify_first_fraction":           pattern_dist.get("clarify_first", 0.0),
        "pattern_distribution":             pattern_dist,
        "domain_distribution":              domain_dist,
    }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _mean(values: list[float | int]) -> float:
    if not values:
        return 0.0
    return sum(values) / len(values)


def _distribution(labels: list[str]) -> dict[str, float]:
    """Return a normalised frequency distribution as a dict."""
    if not labels:
        return {}
    counter = Counter(labels)
    n = len(labels)
    return {k: round(v / n, 4) for k, v in sorted(counter.items())}


def _empty_metrics() -> dict[str, Any]:
    return {
        "total_conversations":              0,
        "acceptance_rate":                  0.0,
        "avg_tool_calls_per_conversation":  0.0,
        "avg_turns_per_conversation":       0.0,
        "avg_clarification_questions":      0.0,
        "avg_memory_grounding_rate":        None,
        "corpus_memory_enabled_fraction":   0.0,
        "clarify_first_fraction":           0.0,
        "pattern_distribution":             {},
        "domain_distribution":              {},
    }
