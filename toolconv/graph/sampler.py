"""
graph/sampler.py — sample tool chains and subgraphs from a DiGraph.

Provides two main strategies:

Chain sampling
--------------
  A chain is an ordered sequence of tool names [t0, t1, ..., tk] where
  each consecutive pair (ti → ti+1) is an edge in the graph.  Chains model
  multi-turn conversations where one tool's output informs the next call.

  Two walk modes:
    "weighted"  — at each step, pick the next node proportional to edge weight.
    "uniform"   — at each step, pick uniformly among successors.

Subgraph sampling
-----------------
  A subgraph is an induced DiGraph over k nodes selected by BFS/random
  expansion from a seed node.  Useful for generating conversation clusters
  that share thematic context (same domain, same tag group, etc.).

Both are reproducible via an integer seed.
"""

from __future__ import annotations

import random
from dataclasses import dataclass, field
from typing import Sequence

import networkx as nx


# ---------------------------------------------------------------------------
# Data containers
# ---------------------------------------------------------------------------

@dataclass
class ToolChain:
    """An ordered list of tool names representing one conversation plan."""
    tools: list[str]
    total_weight: float = 0.0       # sum of edge weights along the chain
    reasons: list[str] = field(default_factory=list)  # reason label per edge

    def __len__(self) -> int:
        return len(self.tools)

    def __iter__(self):
        return iter(self.tools)

    def __repr__(self) -> str:
        return " → ".join(self.tools)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _weighted_choice(rng: random.Random, successors: list[str], weights: list[float]) -> str:
    """Pick one successor proportional to weights."""
    total = sum(weights)
    r = rng.uniform(0, total)
    cumulative = 0.0
    for node, w in zip(successors, weights):
        cumulative += w
        if r <= cumulative:
            return node
    return successors[-1]


def _entry_nodes(G: nx.DiGraph) -> list[str]:
    """
    Return nodes with in-degree 0 (natural conversation starters).
    Falls back to all nodes if every node has predecessors (cyclic graph).
    """
    roots = [n for n in G.nodes if G.in_degree(n) == 0]
    return roots if roots else list(G.nodes)


# ---------------------------------------------------------------------------
# ChainSampler
# ---------------------------------------------------------------------------

class ChainSampler:
    """
    Samples tool chains and subgraphs from a NetworkX DiGraph.

    Parameters
    ----------
    G    : Directed graph produced by ToolGraphBuilder.build().
    seed : Global RNG seed; individual sample calls can override per-call.
    """

    def __init__(self, G: nx.DiGraph, seed: int | None = None) -> None:
        self._G = G
        self._base_seed = seed
        self._rng = random.Random(seed)

    def _make_rng(self, seed: int | None) -> random.Random:
        return random.Random(seed) if seed is not None else self._rng

    # ------------------------------------------------------------------
    # Chain sampling
    # ------------------------------------------------------------------

    def sample_chain(
        self,
        length: int,
        start: str | None = None,
        mode: str = "weighted",
        allow_revisit: bool = False,
        seed: int | None = None,
    ) -> ToolChain:
        """
        Sample a single chain of *length* tools via random walk.

        Parameters
        ----------
        length       : Number of tools in the chain (>= 1).
        start        : Starting tool name; if None, chosen from entry nodes.
        mode         : "weighted" (edge-weight proportional) or "uniform".
        allow_revisit: If False, already-visited nodes are excluded from next
                       steps; the walk terminates early if no new successor
                       exists.
        seed         : Per-call seed (overrides global seed).

        Returns
        -------
        ToolChain with len(chain) <= length.
        """
        if length < 1:
            raise ValueError("length must be >= 1")
        rng = self._make_rng(seed)

        # Pick starting node
        if start is not None:
            if start not in self._G:
                raise ValueError(f"Node {start!r} not in graph")
            current = start
        else:
            candidates = _entry_nodes(self._G)
            current = rng.choice(candidates)

        visited: set[str] = {current}
        chain_nodes = [current]
        total_w = 0.0
        reasons: list[str] = []

        for _ in range(length - 1):
            succs = list(self._G.successors(current))
            if not allow_revisit:
                succs = [s for s in succs if s not in visited]
            if not succs:
                break  # dead end — return shorter chain

            if mode == "weighted":
                weights = [self._G[current][s]["weight"] for s in succs]
                nxt = _weighted_choice(rng, succs, weights)
                total_w += self._G[current][nxt]["weight"]
                reasons.append(self._G[current][nxt].get("reason", ""))
            else:  # uniform
                nxt = rng.choice(succs)
                total_w += self._G[current][nxt]["weight"]
                reasons.append(self._G[current][nxt].get("reason", ""))

            chain_nodes.append(nxt)
            visited.add(nxt)
            current = nxt

        return ToolChain(tools=chain_nodes, total_weight=round(total_w, 4), reasons=reasons)

    def sample_chains(
        self,
        n: int,
        length: int,
        mode: str = "weighted",
        allow_revisit: bool = False,
        min_length: int = 1,
        seed: int | None = None,
    ) -> list[ToolChain]:
        """
        Sample *n* chains, each up to *length* tools long.

        Chains shorter than *min_length* are discarded and resampled
        (up to 10× attempts before giving up).

        Returns
        -------
        List of up to *n* ToolChain objects.
        """
        rng = self._make_rng(seed)
        results: list[ToolChain] = []
        attempts = 0
        max_attempts = n * 10

        while len(results) < n and attempts < max_attempts:
            chain = self.sample_chain(
                length=length,
                mode=mode,
                allow_revisit=allow_revisit,
                seed=rng.randint(0, 2**31),
            )
            attempts += 1
            if len(chain) >= min_length:
                results.append(chain)

        return results

    # ------------------------------------------------------------------
    # Subgraph sampling
    # ------------------------------------------------------------------

    def sample_subgraph(
        self,
        k: int,
        start: str | None = None,
        seed: int | None = None,
    ) -> nx.DiGraph:
        """
        Sample an induced subgraph of *k* nodes via BFS expansion.

        Starting from *start* (or a random entry node), neighbours are
        explored in random order until *k* nodes are collected.  The
        returned graph contains all edges between the selected nodes.

        Parameters
        ----------
        k     : Number of nodes to include.
        start : Seed node; if None, chosen randomly from entry nodes.
        seed  : Per-call RNG seed.

        Returns
        -------
        nx.DiGraph induced on the selected nodes.
        """
        if k < 1:
            raise ValueError("k must be >= 1")
        if k > self._G.number_of_nodes():
            raise ValueError(
                f"k={k} exceeds graph size ({self._G.number_of_nodes()} nodes)"
            )

        rng = self._make_rng(seed)

        if start is not None:
            if start not in self._G:
                raise ValueError(f"Node {start!r} not in graph")
            origin = start
        else:
            origin = rng.choice(_entry_nodes(self._G))

        selected: list[str] = [origin]
        frontier: list[str] = list(self._G.neighbors(origin))
        rng.shuffle(frontier)

        while len(selected) < k and frontier:
            node = frontier.pop(0)
            if node in selected:
                continue
            selected.append(node)
            neighbours = list(self._G.neighbors(node))
            rng.shuffle(neighbours)
            frontier.extend(n for n in neighbours if n not in selected)

        # If BFS exhausted before k, fall back to random remaining nodes
        if len(selected) < k:
            remaining = [n for n in self._G.nodes if n not in selected]
            rng.shuffle(remaining)
            selected.extend(remaining[: k - len(selected)])

        return self._G.subgraph(selected).copy()

    # ------------------------------------------------------------------
    # Convenience
    # ------------------------------------------------------------------

    def entry_nodes(self) -> list[str]:
        """Tools with no predecessors — natural conversation starters."""
        return _entry_nodes(self._G)

    def reachable_from(self, start: str) -> set[str]:
        """All nodes reachable from *start* via directed edges."""
        return nx.descendants(self._G, start)

    def longest_path(self) -> list[str]:
        """
        Return one of the longest paths in the graph (DAG only).
        Returns empty list if the graph has cycles.
        """
        if not nx.is_directed_acyclic_graph(self._G):
            return []
        return nx.dag_longest_path(self._G)
