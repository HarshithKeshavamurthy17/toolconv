"""
metrics/diversity.py — diversity metrics for a JSONL conversation dataset.

Metrics computed
----------------
  tool_jaccard_dissimilarity
      Average pairwise Jaccard distance between tool-sets of any two
      conversations.  Range [0, 1].  Higher = more diverse tool usage.

  pattern_entropy
      Shannon entropy (nats) of the pattern_type distribution.
      Higher = more balanced mix of sequential / parallel / clarify_first.

  domain_entropy
      Shannon entropy of the domain distribution.

  distinct_2_tool_bigrams
      Ratio of unique ordered tool-call bigrams to total bigrams across
      all conversations.  Inspired by distinct-n from NLG evaluation.
      Range [0, 1].  Higher = less repetitive tool sequences.

  avg_tools_per_conversation
      Mean number of distinct tools used per conversation.

  tool_type_ratio
      Fraction of conversations that use ≥ 2 distinct tools (REQ-2 proxy).

Usage
-----
    from toolconv.metrics.diversity import compute_diversity_metrics
    records = [json.loads(line) for line in open("outputs/conversations.jsonl")]
    metrics = compute_diversity_metrics(records)
    # metrics is a plain dict[str, float]
"""

from __future__ import annotations

import math
from collections import Counter
from typing import Any


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def compute_diversity_metrics(records: list[dict[str, Any]]) -> dict[str, float]:
    """
    Compute diversity metrics for a list of conversation records.

    Parameters
    ----------
    records : List of dicts — each must have a ``metadata`` key with at
              least ``tool_ids_used``, ``pattern_type``, and ``domain``.

    Returns
    -------
    dict[str, float] — metric name → value.  Returns zeros for an empty list.
    """
    if not records:
        return _zero_metrics()

    tool_sets: list[frozenset[str]] = []
    pattern_labels: list[str] = []
    domain_labels: list[str] = []
    all_bigrams: list[tuple[str, str]] = []

    for rec in records:
        meta = rec.get("metadata", {})
        tools = meta.get("tool_ids_used", [])
        pattern = meta.get("pattern_type", "unknown")
        domain = meta.get("domain", "unknown")

        tool_sets.append(frozenset(tools))
        pattern_labels.append(pattern)
        domain_labels.append(domain)

        # Bigrams from tool_calls (ordered)
        tool_calls = rec.get("tool_calls", [])
        names = [tc.get("endpoint_id", "") for tc in tool_calls]
        for i in range(len(names) - 1):
            all_bigrams.append((names[i], names[i + 1]))

    return {
        "tool_jaccard_dissimilarity": _avg_jaccard_dissimilarity(tool_sets),
        "pattern_entropy":            _entropy(pattern_labels),
        "domain_entropy":             _entropy(domain_labels),
        "distinct_2_tool_bigrams":    _distinct_n(all_bigrams),
        "avg_tools_per_conversation": _avg_set_size(tool_sets),
        "tool_type_ratio":            _tool_type_ratio(tool_sets),
    }


# ---------------------------------------------------------------------------
# Individual metric helpers
# ---------------------------------------------------------------------------

def _avg_jaccard_dissimilarity(sets: list[frozenset[str]]) -> float:
    """
    Average pairwise Jaccard distance = 1 - |A ∩ B| / |A ∪ B|.
    Uses O(n²) comparison; fine for typical dataset sizes (≤ 1 000).
    Returns 0.0 for fewer than 2 conversations.
    """
    n = len(sets)
    if n < 2:
        return 0.0

    total = 0.0
    pairs = 0
    for i in range(n):
        for j in range(i + 1, n):
            a, b = sets[i], sets[j]
            union = len(a | b)
            if union == 0:
                continue
            intersection = len(a & b)
            total += 1.0 - intersection / union
            pairs += 1

    return round(total / pairs, 4) if pairs > 0 else 0.0


def _entropy(labels: list[str]) -> float:
    """Shannon entropy in nats.  Higher = more uniform distribution."""
    if not labels:
        return 0.0
    counts = Counter(labels)
    n = len(labels)
    h = 0.0
    for c in counts.values():
        p = c / n
        if p > 0:
            h -= p * math.log(p)
    return round(h, 4)


def _distinct_n(bigrams: list[tuple[str, str]]) -> float:
    """
    Fraction of unique bigrams: |unique bigrams| / |total bigrams|.
    Returns 1.0 if there are no bigrams (vacuously maximally diverse).
    """
    if not bigrams:
        return 1.0
    return round(len(set(bigrams)) / len(bigrams), 4)


def _avg_set_size(sets: list[frozenset[str]]) -> float:
    if not sets:
        return 0.0
    return round(sum(len(s) for s in sets) / len(sets), 4)


def _tool_type_ratio(sets: list[frozenset[str]]) -> float:
    """Fraction of conversations using ≥ 2 distinct tools."""
    if not sets:
        return 0.0
    return round(sum(1 for s in sets if len(s) >= 2) / len(sets), 4)


def _zero_metrics() -> dict[str, float]:
    return {
        "tool_jaccard_dissimilarity": 0.0,
        "pattern_entropy":            0.0,
        "domain_entropy":             0.0,
        "distinct_2_tool_bigrams":    0.0,
        "avg_tools_per_conversation": 0.0,
        "tool_type_ratio":            0.0,
    }
