"""
graph/builder.py — build a directed dependency graph over a ToolRegistry.

Graph semantics
---------------
  Node  : tool name (str)
  Edge  : (A → B) means "A's output can satisfy at least one of B's inputs"
           i.e. call A before B in a conversation chain.

Edge weight
-----------
  weight  : float in [0, 1], estimated strength of the dependency.
             1.0 = explicit / manually added.
             0.x = inferred heuristically.

Edges are inferred by three heuristics (all run in order; manual edges win):
  1. Name-match   — A's name is a prefix/substring of one of B's parameter names
                    (e.g. "get_user" → param "user_id" on "update_user").
  2. Tag-overlap  — A and B share at least one tag; weight proportional to overlap.
  3. Return-type  — A declares a `returns` schema whose type matches a required
                    parameter type on B.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import TYPE_CHECKING

import networkx as nx

if TYPE_CHECKING:
    from toolconv.registry import ToolRegistry
    from toolconv.registry.models import ToolDef

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Edge metadata
# ---------------------------------------------------------------------------

@dataclass
class EdgeMeta:
    """Metadata stored on every graph edge."""
    weight: float = 1.0
    reason: str = "manual"          # "manual" | "name_match" | "tag_overlap" | "return_type"
    param_hint: str | None = None   # which parameter on the target triggered inference


# ---------------------------------------------------------------------------
# Builder
# ---------------------------------------------------------------------------

class ToolGraphBuilder:
    """
    Builds a directed NetworkX DiGraph from a ToolRegistry.

    Usage
    -----
        builder = ToolGraphBuilder(registry)
        builder.infer_edges()
        builder.add_edge("get_user", "update_user", reason="manual")
        G = builder.build()
    """

    def __init__(self, registry: ToolRegistry) -> None:
        self._registry = registry
        self._G: nx.DiGraph = nx.DiGraph()
        self._populate_nodes()

    # ------------------------------------------------------------------
    # Node population
    # ------------------------------------------------------------------

    def _populate_nodes(self) -> None:
        """Add one node per tool; node attrs mirror key ToolDef fields."""
        for entry in self._registry:
            self._G.add_node(
                entry.name,
                description=entry.tool.description,
                tags=list(entry.tool.tags),
                provider=entry.provider,
                n_params=len(entry.tool.param_names()),
                n_required=len(entry.tool.required_param_names()),
            )
        logger.debug("Graph: added %d nodes", self._G.number_of_nodes())

    # ------------------------------------------------------------------
    # Manual edge API
    # ------------------------------------------------------------------

    def add_edge(
        self,
        src: str,
        dst: str,
        weight: float = 1.0,
        reason: str = "manual",
        param_hint: str | None = None,
    ) -> None:
        """
        Add a directed edge src → dst (both must already be nodes).

        Safe to call multiple times — subsequent calls update the weight
        only if the new weight is higher than the existing one.
        """
        if src not in self._G:
            raise ValueError(f"Source tool {src!r} not in graph")
        if dst not in self._G:
            raise ValueError(f"Destination tool {dst!r} not in graph")
        if src == dst:
            return  # no self-loops

        meta = EdgeMeta(weight=weight, reason=reason, param_hint=param_hint)
        if self._G.has_edge(src, dst):
            existing = self._G[src][dst]["weight"]
            if weight <= existing:
                return  # keep stronger edge
        self._G.add_edge(src, dst, **vars(meta))

    # ------------------------------------------------------------------
    # Inference heuristics
    # ------------------------------------------------------------------

    def infer_edges(
        self,
        name_match_weight: float = 0.6,
        tag_overlap_weight: float = 0.4,
        return_type_weight: float = 0.5,
    ) -> int:
        """
        Run all three heuristics and add inferred edges to the graph.

        Returns the total number of new edges added.
        """
        before = self._G.number_of_edges()
        self._infer_name_match(weight=name_match_weight)
        self._infer_tag_overlap(weight=tag_overlap_weight)
        self._infer_return_type(weight=return_type_weight)
        added = self._G.number_of_edges() - before
        logger.debug("Inferred %d edges via heuristics", added)
        return added

    # Common verb prefixes that carry no semantic signal for matching
    _STOP_TOKENS = frozenset({
        "get", "set", "fetch", "create", "update", "delete", "remove",
        "add", "list", "search", "find", "check", "send", "read", "write",
        "build", "run", "call", "use", "make",
    })

    def _infer_name_match(self, weight: float) -> None:
        """
        Heuristic 1 — name match.

        Split A's name on underscores, discard common verb tokens, then check
        whether any remaining token appears in any of B's parameter names.
        E.g. "get_user" → token "user" matches param "user_id" on "update_user".
        """
        tools = list(self._registry)
        for a in tools:
            tokens = [
                t.lower() for t in a.name.split("_")
                if t.lower() not in self._STOP_TOKENS and len(t) > 1
            ]
            if not tokens:
                continue
            for b in tools:
                if a.name == b.name:
                    continue
                for param in b.tool.param_names():
                    param_lower = param.lower()
                    if any(tok in param_lower for tok in tokens):
                        self.add_edge(
                            a.name, b.name,
                            weight=weight,
                            reason="name_match",
                            param_hint=param,
                        )
                        break  # one match per (A, B) pair is enough

    def _infer_tag_overlap(self, weight: float) -> None:
        """
        Heuristic 2 — tag overlap.

        Tools that share tags are likely used together.  Weight is scaled
        by the Jaccard similarity of their tag sets.
        """
        tools = list(self._registry)
        for i, a in enumerate(tools):
            tags_a = set(a.tool.tags)
            if not tags_a:
                continue
            for b in tools[i + 1:]:
                tags_b = set(b.tool.tags)
                if not tags_b:
                    continue
                intersection = tags_a & tags_b
                if not intersection:
                    continue
                jaccard = len(intersection) / len(tags_a | tags_b)
                w = round(weight * jaccard, 4)
                # Add both directions — the sampler will pick direction later
                self.add_edge(a.name, b.name, weight=w, reason="tag_overlap")
                self.add_edge(b.name, a.name, weight=w, reason="tag_overlap")

    def _infer_return_type(self, weight: float) -> None:
        """
        Heuristic 3 — return-type match.

        If A declares a `returns` schema and its type matches the type of a
        *required* parameter on B, infer A → B.
        """
        tools = list(self._registry)
        for a in tools:
            if a.tool.returns is None:
                continue
            return_types = self._type_set(a.tool.returns.type)
            for b in tools:
                if a.name == b.name:
                    continue
                for param_name in b.tool.required_param_names():
                    param = b.tool.get_param(param_name)
                    if param is None:
                        continue
                    param_types = self._type_set(param.type)
                    if return_types & param_types:
                        self.add_edge(
                            a.name, b.name,
                            weight=weight,
                            reason="return_type",
                            param_hint=param_name,
                        )
                        break

    @staticmethod
    def _type_set(t) -> set[str]:
        """Normalise a type field (str | list | None) to a set of strings."""
        if t is None:
            return set()
        if isinstance(t, list):
            return {str(x) for x in t}
        return {str(t)}

    # ------------------------------------------------------------------
    # Build
    # ------------------------------------------------------------------

    def build(self) -> nx.DiGraph:
        """Return the completed DiGraph (can be called multiple times)."""
        return self._G

    # ------------------------------------------------------------------
    # Convenience queries
    # ------------------------------------------------------------------

    def predecessors(self, name: str) -> list[str]:
        """Tools whose output feeds into *name*."""
        return list(self._G.predecessors(name))

    def successors(self, name: str) -> list[str]:
        """Tools that can consume *name*'s output."""
        return list(self._G.successors(name))

    def edge_weight(self, src: str, dst: str) -> float | None:
        if self._G.has_edge(src, dst):
            return self._G[src][dst]["weight"]
        return None

    def strongest_edges(self, n: int = 10) -> list[tuple[str, str, float]]:
        """Return the top-n edges by weight as (src, dst, weight) triples."""
        edges = [
            (u, v, d["weight"])
            for u, v, d in self._G.edges(data=True)
        ]
        return sorted(edges, key=lambda x: x[2], reverse=True)[:n]

    def summary(self) -> dict:
        return {
            "nodes": self._G.number_of_nodes(),
            "edges": self._G.number_of_edges(),
            "density": round(nx.density(self._G), 4),
            "is_dag": nx.is_directed_acyclic_graph(self._G),
            "weakly_connected_components": nx.number_weakly_connected_components(self._G),
        }
