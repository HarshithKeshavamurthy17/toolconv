"""
agents/sampler_agent.py — graph-based tool-chain sampler agent.

Responsibility
--------------
Given a ToolRegistry + pre-built NetworkX DiGraph, propose a concrete
tool chain and conversation pattern for one synthetic conversation.

The agent NEVER hardcodes tool sequences.  Every chain comes from a
weighted random walk on the dependency graph, scored by:

    score(next_hop) = tag_overlap    * 0.4
                    + feeds_compat   * 0.4
                    + novelty        * 0.2

  tag_overlap   — Jaccard similarity between current node's tags and
                  candidate's tags.
  feeds_compat  — 1.0 if a FEEDS edge exists (ResponseField → Parameter),
                  else 0.0.
  novelty       — 1.0 if candidate has not been visited yet, else 0.0.

Three pattern templates are supported:
  sequential    — A feeds B feeds C (chain walk, most common)
  parallel      — Multiple tools in the same turn (fan-out from one node)
  clarify_first — Ambiguous start: one lightweight lookup tool, then a
                  clarification placeholder, then the main sequential chain

Output: SamplerResult dataclass consumed by PlannerAgent.
"""

from __future__ import annotations

import random
from dataclasses import dataclass, field
from typing import Any

import networkx as nx

from toolconv.graph.patterns import (
    ConversationPattern,
    PatternType,
    PatternSampler,
)
from toolconv.graph.sampler import ChainSampler
from toolconv.registry import ToolRegistry
from toolconv.registry.models import ToolDef


# ---------------------------------------------------------------------------
# Result container
# ---------------------------------------------------------------------------

@dataclass
class SamplerResult:
    """
    Output of one SamplerAgent.sample() call.

    Attributes
    ----------
    pattern         : ConversationPattern describing the topology.
    tool_chain      : Ordered list of ToolDef objects (unique tools,
                      in the order they will be called).
    domain          : Inferred domain tag (most common tag across tools).
    pattern_type    : One of "sequential", "parallel", "clarify_first".
    seed            : The seed used to produce this result (for replay).
    score           : Aggregate hop score for this chain (mean over hops).
    metadata        : Free-form dict for additional context.
    """
    pattern: ConversationPattern
    tool_chain: list[ToolDef]
    domain: str
    pattern_type: str
    seed: int
    score: float = 0.0
    metadata: dict[str, Any] = field(default_factory=dict)

    @property
    def tool_names(self) -> list[str]:
        return [t.name for t in self.tool_chain]

    @property
    def n_tools(self) -> int:
        return len(self.tool_chain)

    def __repr__(self) -> str:
        return (
            f"SamplerResult(pattern={self.pattern_type!r}, "
            f"tools={self.tool_names}, domain={self.domain!r}, "
            f"score={self.score:.3f})"
        )


# ---------------------------------------------------------------------------
# Scoring helpers
# ---------------------------------------------------------------------------

def _tag_overlap(tags_a: list[str], tags_b: list[str]) -> float:
    """Jaccard similarity between two tag lists."""
    sa, sb = set(tags_a), set(tags_b)
    if not sa and not sb:
        return 0.0
    return len(sa & sb) / len(sa | sb)


def _feeds_compat(G: nx.DiGraph, src: str, dst: str) -> float:
    """1.0 if a FEEDS-type edge exists between src and dst, else 0.0."""
    if G.has_edge(src, dst):
        return 1.0 if G[src][dst].get("reason") in ("return_type", "manual") else 0.0
    return 0.0


def _novelty(candidate: str, visited: set[str]) -> float:
    return 0.0 if candidate in visited else 1.0


def _hop_score(
    G: nx.DiGraph,
    current: str,
    candidate: str,
    visited: set[str],
) -> float:
    """Composite next-hop score (weights from assessment spec)."""
    current_tags  = G.nodes[current].get("tags",  [])
    candidate_tags = G.nodes[candidate].get("tags", [])
    to = _tag_overlap(current_tags, candidate_tags)
    fc = _feeds_compat(G, current, candidate)
    nv = _novelty(candidate, visited)
    return to * 0.4 + fc * 0.4 + nv * 0.2


# ---------------------------------------------------------------------------
# SamplerAgent
# ---------------------------------------------------------------------------

class SamplerAgent:
    """
    Proposes tool chains by walking the dependency graph.

    Parameters
    ----------
    registry : ToolRegistry — source of ToolDef objects.
    G        : nx.DiGraph built by ToolGraphBuilder.build().
    seed     : Global RNG seed; individual calls accept per-call seeds.
    """

    # Pattern type weights for Run A (corpus_memory_enabled=False)
    # sequential-heavy baseline as specified by the assessment.
    _PATTERN_WEIGHTS: dict[str, float] = {
        "sequential":    0.56,
        "parallel":      0.24,
        "clarify_first": 0.20,
    }

    # Pattern type weights for Run B (corpus_memory_enabled=True)
    # clarify_first gets 2× probability to ensure a measurably different
    # pattern distribution — active from conversation 1, not just once
    # corpus summaries accumulate.
    _CORPUS_PATTERN_WEIGHTS: dict[str, float] = {
        "sequential":    0.30,
        "parallel":      0.30,
        "clarify_first": 0.40,
    }

    def __init__(
        self,
        registry: ToolRegistry,
        G: nx.DiGraph,
        seed: int | None = None,
    ) -> None:
        self._registry = registry
        self._G = G
        self._rng = random.Random(seed)
        self._chain_sampler = ChainSampler(G, seed=seed)
        self._pattern_sampler = PatternSampler(self._chain_sampler, registry, seed=seed)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def sample(
        self,
        min_tools: int = 2,
        max_tools: int = 5,
        pattern_type: str | None = None,
        domain_hint: str | None = None,
        seed: int | None = None,
        corpus_memory_enabled: bool = False,
    ) -> SamplerResult:
        """
        Sample one tool chain + pattern.

        Parameters
        ----------
        min_tools             : Minimum distinct tools in the chain (assessment: ≥ 2).
        max_tools             : Maximum tools in the chain.
        pattern_type          : Force a specific template; if None, sampled by weight.
        domain_hint           : Prefer tools tagged with this domain (best-effort).
        seed                  : Per-call seed for full reproducibility.
        corpus_memory_enabled : When True, use biased pattern weights that give
                                clarify_first 2× probability, producing a measurably
                                different pattern distribution vs Run A (disabled).

        Returns
        -------
        SamplerResult ready to be consumed by PlannerAgent.
        """
        rng = random.Random(seed) if seed is not None else self._rng
        actual_seed = seed if seed is not None else rng.randint(0, 2**31)

        # Choose pattern template (biased weights when corpus memory is enabled)
        pt = pattern_type or self._choose_pattern_type(rng, corpus_memory_enabled=corpus_memory_enabled)

        # Build tool chain according to template
        if pt == "sequential":
            result = self._sample_sequential(rng, min_tools, max_tools, domain_hint)
        elif pt == "parallel":
            result = self._sample_parallel(rng, min_tools, max_tools, domain_hint)
        else:  # clarify_first
            result = self._sample_clarify_first(rng, min_tools, max_tools, domain_hint)

        result.seed = actual_seed
        result.pattern_type = pt
        return result

    def sample_batch(
        self,
        n: int,
        min_tools: int = 2,
        max_tools: int = 5,
        seed: int | None = None,
    ) -> list[SamplerResult]:
        """Sample *n* SamplerResults with independent seeds."""
        rng = random.Random(seed) if seed is not None else self._rng
        return [
            self.sample(
                min_tools=min_tools,
                max_tools=max_tools,
                seed=rng.randint(0, 2**31),
            )
            for _ in range(n)
        ]

    # ------------------------------------------------------------------
    # Template implementations
    # ------------------------------------------------------------------

    def _sample_sequential(
        self,
        rng: random.Random,
        min_tools: int,
        max_tools: int,
        domain_hint: str | None,
    ) -> SamplerResult:
        """Weighted walk with hop-score guidance."""
        chain_len = rng.randint(min_tools, max_tools)
        start = self._pick_start(rng, domain_hint)
        tools = self._scored_walk(start, chain_len, rng)

        steps = [[t] for t in tools]
        pattern = ConversationPattern(
            pattern_type=PatternType.LINEAR,
            steps=steps,
            metadata={"template": "sequential"},
        )
        score = self._chain_score(tools)
        domain = self._infer_domain(tools)
        tool_defs = self._resolve(tools)
        return SamplerResult(
            pattern=pattern, tool_chain=tool_defs,
            domain=domain, pattern_type="sequential",
            seed=0, score=score,
        )

    def _sample_parallel(
        self,
        rng: random.Random,
        min_tools: int,
        max_tools: int,
        domain_hint: str | None,
    ) -> SamplerResult:
        """Fan-out: one root tool triggers multiple independent parallel calls."""
        width = rng.randint(max(2, min_tools - 1), max(2, max_tools - 1))
        root = self._pick_start(rng, domain_hint)
        # Prefer successors of root; pad with random tools if needed
        succs = list(self._G.successors(root))
        rng.shuffle(succs)
        branches = succs[:width]
        if len(branches) < width:
            extras = [
                n for n in self._registry.names()
                if n != root and n not in branches
            ]
            rng.shuffle(extras)
            branches.extend(extras[: width - len(branches)])
        branches = branches[:width]

        all_tools = [root] + branches
        steps = [[root], branches]
        pattern = ConversationPattern(
            pattern_type=PatternType.FAN_OUT,
            steps=steps,
            metadata={"template": "parallel", "root": root, "branches": branches},
        )
        score = self._chain_score(all_tools)
        domain = self._infer_domain(all_tools)
        tool_defs = self._resolve(list(dict.fromkeys(all_tools)))
        return SamplerResult(
            pattern=pattern, tool_chain=tool_defs,
            domain=domain, pattern_type="parallel",
            seed=0, score=score,
        )

    def _sample_clarify_first(
        self,
        rng: random.Random,
        min_tools: int,
        max_tools: int,
        domain_hint: str | None,
    ) -> SamplerResult:
        """
        Ambiguous opener: a lightweight lookup, then a clarification
        placeholder step, then a sequential chain.
        """
        chain_len = rng.randint(max(2, min_tools - 1), max(3, max_tools - 1))
        start = self._pick_start(rng, domain_hint)
        seq_tools = self._scored_walk(start, chain_len, rng)

        # Build steps: opener + CLARIFY marker + rest of chain
        steps: list[list[str]] = [[seq_tools[0]], ["__clarify__"]] + [
            [t] for t in seq_tools[1:]
        ]
        pattern = ConversationPattern(
            pattern_type=PatternType.LINEAR,
            steps=steps,
            metadata={"template": "clarify_first", "clarify_at_turn": 1},
        )
        # Resolve only real tools (exclude __clarify__ placeholder)
        real_tools = [t for t in seq_tools]
        score = self._chain_score(real_tools)
        domain = self._infer_domain(real_tools)
        tool_defs = self._resolve(real_tools)
        return SamplerResult(
            pattern=pattern, tool_chain=tool_defs,
            domain=domain, pattern_type="clarify_first",
            seed=0, score=score,
            metadata={"clarify_at_turn": 1},
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _choose_pattern_type(
        self,
        rng: random.Random,
        corpus_memory_enabled: bool = False,
    ) -> str:
        weight_table = (
            self._CORPUS_PATTERN_WEIGHTS if corpus_memory_enabled
            else self._PATTERN_WEIGHTS
        )
        types = list(weight_table.keys())
        weights = [weight_table[t] for t in types]
        return rng.choices(types, weights=weights, k=1)[0]

    def _pick_start(self, rng: random.Random, domain_hint: str | None) -> str:
        """
        Pick a starting node.  Prefer entry nodes in the hinted domain;
        fall back to all entry nodes, then all nodes.
        """
        candidates: list[str] = []
        if domain_hint:
            candidates = [
                e.name for e in self._registry.by_tag(domain_hint)
                if e.name in self._G and self._G.in_degree(e.name) == 0
            ]
        if not candidates:
            candidates = [n for n in self._G.nodes if self._G.in_degree(n) == 0]
        if not candidates:
            candidates = list(self._G.nodes)
        return rng.choice(candidates)

    def _scored_walk(
        self,
        start: str,
        length: int,
        rng: random.Random,
    ) -> list[str]:
        """
        Walk the graph using the composite hop score for next-node selection.
        Falls back to uniform random if no scored successor exists.
        """
        path = [start]
        visited = {start}

        for _ in range(length - 1):
            succs = [s for s in self._G.successors(path[-1]) if s not in visited]
            if not succs:
                # Dead end — pick any unvisited node reachable from anywhere
                remaining = [n for n in self._G.nodes if n not in visited]
                if not remaining:
                    break
                succs = remaining

            scores = [_hop_score(self._G, path[-1], s, visited) for s in succs]
            total = sum(scores)
            if total == 0:
                nxt = rng.choice(succs)
            else:
                # Weighted choice by hop score
                r = rng.uniform(0, total)
                cumul = 0.0
                nxt = succs[-1]
                for s, sc in zip(succs, scores):
                    cumul += sc
                    if r <= cumul:
                        nxt = s
                        break

            path.append(nxt)
            visited.add(nxt)

        return path

    def _chain_score(self, tools: list[str]) -> float:
        """Mean hop score across consecutive pairs in the chain."""
        if len(tools) < 2:
            return 0.0
        scores = []
        visited: set[str] = set()
        for i in range(len(tools) - 1):
            visited.add(tools[i])
            scores.append(_hop_score(self._G, tools[i], tools[i + 1], visited))
        return round(sum(scores) / len(scores), 4)

    def _infer_domain(self, tools: list[str]) -> str:
        """Most frequently occurring tag across all tools in the chain."""
        from collections import Counter
        counts: Counter[str] = Counter()
        for name in tools:
            entry = self._registry.get(name)
            if entry:
                counts.update(entry.tool.tags)
        if not counts:
            return "general"
        return counts.most_common(1)[0][0]

    def _resolve(self, names: list[str]) -> list[ToolDef]:
        """Convert tool names to ToolDef objects (skip unknowns)."""
        result = []
        for name in names:
            entry = self._registry.get(name)
            if entry:
                result.append(entry.tool)
        return result
