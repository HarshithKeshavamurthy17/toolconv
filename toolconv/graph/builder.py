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

        For scalability with large registries, uses an inverted index:
        param_token → list[tool_name].  This reduces the O(n²) double loop to
        O(n × avg_tokens + total_param_tokens) with the same edge semantics.
        """
        from collections import defaultdict

        tools = list(self._registry)

        # Build inverted index: param token → tools that have this param token
        param_token_index: dict[str, list[tuple[str, str]]] = defaultdict(list)
        for b in tools:
            for param in b.tool.param_names():
                for tok in param.lower().split("_"):
                    if len(tok) > 1:
                        param_token_index[tok].append((b.name, param))

        # Skip tokens that appear in too many params (>5% of tools) — these
        # are generic identifiers ("id", "type", "name") with no semantic signal.
        n_tools = len(tools)
        max_token_hits = max(1, int(n_tools * 0.05))

        for a in tools:
            tokens = [
                t.lower() for t in a.name.split("_")
                if t.lower() not in self._STOP_TOKENS and len(t) > 1
            ]
            if not tokens:
                continue
            # Find candidate (b, param) pairs via the inverted index,
            # skipping tokens that are too common to be semantically meaningful.
            seen_b: set[str] = set()
            for tok in tokens:
                hits = param_token_index.get(tok, [])
                if len(hits) > max_token_hits:
                    continue  # too common — skip
                for b_name, param in hits:
                    if b_name == a.name or b_name in seen_b:
                        continue
                    seen_b.add(b_name)
                    self.add_edge(
                        a.name, b_name,
                        weight=weight,
                        reason="name_match",
                        param_hint=param,
                    )

    def _infer_tag_overlap(self, weight: float) -> None:
        """
        Heuristic 2 — tag overlap.

        Tools that share tags are likely used together.  Weight is scaled
        by the Jaccard similarity of their tag sets.

        For scalability, uses a tag → tools inverted index so only tools that
        actually share a tag are compared (avoids the O(n²) double loop when
        most tool pairs share no tags).
        """
        from collections import defaultdict

        tools = list(self._registry)

        # Build inverted index: tag → list of (tool_name, tags_set)
        tag_index: dict[str, list[str]] = defaultdict(list)
        tool_tags: dict[str, frozenset[str]] = {}
        for a in tools:
            tags_a = frozenset(a.tool.tags)
            if not tags_a:
                continue
            tool_tags[a.name] = tags_a
            for tag in tags_a:
                tag_index[tag].append(a.name)

        # Skip tags that are too common (>5% of all tools) — they carry no
        # useful semantic signal for pairing (e.g. a "toolbench" source tag
        # that appears on every tool would create O(n²) edges).
        n_tools = len(tools)
        max_tag_size = max(1, int(n_tools * 0.05))

        # For each tag, connect all pairs of tools that share it.
        # We do NOT maintain a seen_pairs set (it balloons to hundreds of MB
        # at 46k tools).  Instead we rely on add_edge's idempotent keep-max
        # logic to handle duplicate pair visits cheaply.
        for tag, names in tag_index.items():
            if len(names) > max_tag_size:
                continue  # too common — skip
            for i, na in enumerate(names):
                tags_a = tool_tags[na]
                for nb in names[i + 1:]:
                    tags_b = tool_tags[nb]
                    intersection = tags_a & tags_b
                    jaccard = len(intersection) / len(tags_a | tags_b)
                    w = round(weight * jaccard, 4)
                    # Add both directions — the sampler will pick direction later
                    self.add_edge(na, nb, weight=w, reason="tag_overlap")
                    self.add_edge(nb, na, weight=w, reason="tag_overlap")

    def _infer_return_type(self, weight: float) -> None:
        """
        Heuristic 3 — return-type match.

        If A declares a `returns` schema and its type matches the type of a
        *required* parameter on B, infer A → B.

        Uses an inverted index (return_type → tools_that_return_it) so the
        complexity is O(n × avg_params) rather than O(n²).  Types that are
        too common (>5% of all tools) are skipped — they carry no semantic
        signal and would create an unmanageable number of edges.
        """
        from collections import defaultdict

        tools = list(self._registry)
        n_tools = len(tools)

        # Build inverted index: return type string → list of tool names
        return_type_index: dict[str, list[str]] = defaultdict(list)
        for a in tools:
            if a.tool.returns is None:
                continue
            for t in self._type_set(a.tool.returns.type):
                return_type_index[t].append(a.name)

        if not return_type_index:
            return  # no tools declare returns — skip entirely (fast path)

        max_hits = max(1, int(n_tools * 0.05))

        for b in tools:
            for param_name in b.tool.required_param_names():
                param = b.tool.get_param(param_name)
                if param is None:
                    continue
                for pt in self._type_set(param.type):
                    candidates = return_type_index.get(pt, [])
                    if len(candidates) > max_hits:
                        continue  # type too generic — skip
                    for a_name in candidates:
                        if a_name == b.name:
                            continue
                        self.add_edge(
                            a_name, b.name,
                            weight=weight,
                            reason="return_type",
                            param_hint=param_name,
                        )
                break  # first matching required param per B is enough

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
