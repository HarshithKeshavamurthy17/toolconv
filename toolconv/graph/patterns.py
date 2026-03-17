"""
graph/patterns.py — named conversation topology patterns.

Each pattern describes *how* tools are called in a conversation, not which
specific tools are used.  The generation layer maps a pattern + a set of
sampled tools into a concrete conversation.

Patterns
--------
  SINGLE        — one tool call, one result.
  LINEAR        — sequential chain  A → B → C …
  FAN_OUT       — one tool triggers multiple parallel calls.
  FAN_IN        — multiple tools aggregate into one final call.
  DIAMOND       — fan-out then fan-in  (A → [B, C] → D).
  CONDITIONAL   — A, then exactly one of B or C depending on result.
  RETRY         — same tool attempted twice (first call may fail/return partial).
  PIPELINE      — strict linear with an intermediate transform step.

Usage
-----
    from toolconv.graph.patterns import PatternType, ConversationPattern, PatternSampler

    ps = PatternSampler(sampler, registry, seed=42)
    pattern = ps.sample(PatternType.LINEAR, chain_length=3)
    print(pattern)
"""

from __future__ import annotations

import random
from dataclasses import dataclass, field
from enum import Enum
from typing import TYPE_CHECKING

import networkx as nx

if TYPE_CHECKING:
    from toolconv.graph.sampler import ChainSampler
    from toolconv.registry import ToolRegistry


# ---------------------------------------------------------------------------
# Pattern taxonomy
# ---------------------------------------------------------------------------

class PatternType(str, Enum):
    SINGLE      = "single"
    LINEAR      = "linear"
    FAN_OUT     = "fan_out"
    FAN_IN      = "fan_in"
    DIAMOND     = "diamond"
    CONDITIONAL = "conditional"
    RETRY       = "retry"
    PIPELINE    = "pipeline"


# Approximate number of tools each pattern requires
_PATTERN_MIN_TOOLS: dict[PatternType, int] = {
    PatternType.SINGLE:      1,
    PatternType.LINEAR:      2,
    PatternType.FAN_OUT:     3,   # 1 root + ≥2 branches
    PatternType.FAN_IN:      3,   # ≥2 inputs + 1 aggregator
    PatternType.DIAMOND:     4,   # root + 2 branches + sink
    PatternType.CONDITIONAL: 3,   # trigger + 2 alternatives
    PatternType.RETRY:       1,   # single tool called twice
    PatternType.PIPELINE:    3,   # source + transform + sink
}


# ---------------------------------------------------------------------------
# ConversationPattern
# ---------------------------------------------------------------------------

@dataclass
class ConversationPattern:
    """
    A resolved pattern: topology type + the concrete tool names assigned to
    each structural role.

    Attributes
    ----------
    pattern_type : Which pattern shape this is.
    steps        : Ordered list of steps; each step is a list of tool names
                   called in parallel at that turn.
                   - SINGLE:       [[tool]]
                   - LINEAR:       [[A], [B], [C], ...]
                   - FAN_OUT:      [[root], [b1, b2, ...]]
                   - FAN_IN:       [[a1, a2, ...], [sink]]
                   - DIAMOND:      [[root], [b1, b2], [sink]]
                   - CONDITIONAL:  [[trigger], [branch]]   (one branch chosen)
                   - RETRY:        [[tool], [tool]]
                   - PIPELINE:     [[source], [transform], [sink]]
    metadata     : Freeform dict for extra context (e.g. which branch taken).
    """
    pattern_type: PatternType
    steps: list[list[str]]
    metadata: dict = field(default_factory=dict)

    # ------------------------------------------------------------------
    # Convenience views
    # ------------------------------------------------------------------

    @property
    def all_tools(self) -> list[str]:
        """Flat, ordered list of all tool names (duplicates preserved)."""
        return [t for step in self.steps for t in step]

    @property
    def unique_tools(self) -> list[str]:
        """Unique tool names in first-appearance order."""
        seen: set[str] = set()
        result = []
        for t in self.all_tools:
            if t not in seen:
                seen.add(t)
                result.append(t)
        return result

    @property
    def n_turns(self) -> int:
        """Number of conversational turns (steps)."""
        return len(self.steps)

    @property
    def n_tool_calls(self) -> int:
        """Total number of tool invocations."""
        return sum(len(s) for s in self.steps)

    def __repr__(self) -> str:
        steps_str = " | ".join(" + ".join(s) for s in self.steps)
        return f"ConversationPattern({self.pattern_type.value}: {steps_str})"


# ---------------------------------------------------------------------------
# PatternSampler
# ---------------------------------------------------------------------------

class PatternSampler:
    """
    Instantiates ConversationPattern objects by drawing tools from a
    ChainSampler / ToolRegistry.

    Parameters
    ----------
    chain_sampler : ChainSampler wrapping the tool dependency graph.
    registry      : ToolRegistry for fallback random tool selection.
    seed          : Global RNG seed.
    """

    def __init__(
        self,
        chain_sampler: ChainSampler,
        registry: ToolRegistry,
        seed: int | None = None,
    ) -> None:
        self._cs = chain_sampler
        self._reg = registry
        self._rng = random.Random(seed)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def sample(
        self,
        pattern_type: PatternType | None = None,
        chain_length: int = 3,
        fan_width: int = 2,
        seed: int | None = None,
    ) -> ConversationPattern:
        """
        Sample one ConversationPattern.

        Parameters
        ----------
        pattern_type : Which pattern to build; if None, chosen randomly.
        chain_length : Used by LINEAR / PIPELINE (number of sequential tools).
        fan_width    : Used by FAN_OUT / FAN_IN / DIAMOND (branch count).
        seed         : Per-call RNG seed.

        Returns
        -------
        ConversationPattern
        """
        rng = random.Random(seed) if seed is not None else self._rng
        if pattern_type is None:
            pattern_type = rng.choice(list(PatternType))

        dispatch = {
            PatternType.SINGLE:      self._single,
            PatternType.LINEAR:      self._linear,
            PatternType.FAN_OUT:     self._fan_out,
            PatternType.FAN_IN:      self._fan_in,
            PatternType.DIAMOND:     self._diamond,
            PatternType.CONDITIONAL: self._conditional,
            PatternType.RETRY:       self._retry,
            PatternType.PIPELINE:    self._pipeline,
        }
        return dispatch[pattern_type](rng, chain_length=chain_length, fan_width=fan_width)

    def sample_batch(
        self,
        n: int,
        weights: dict[PatternType, float] | None = None,
        chain_length: int = 3,
        fan_width: int = 2,
        seed: int | None = None,
    ) -> list[ConversationPattern]:
        """
        Sample *n* patterns, optionally with type-level sampling weights.

        weights : Maps PatternType → relative probability; if None, uniform.
        """
        rng = random.Random(seed) if seed is not None else self._rng
        types = list(PatternType)
        w_vals = [weights.get(t, 1.0) for t in types] if weights else None

        results = []
        for _ in range(n):
            pt = rng.choices(types, weights=w_vals, k=1)[0]
            pattern = self.sample(
                pattern_type=pt,
                chain_length=chain_length,
                fan_width=fan_width,
                seed=rng.randint(0, 2**31),
            )
            results.append(pattern)
        return results

    # ------------------------------------------------------------------
    # Per-pattern builders
    # ------------------------------------------------------------------

    def _pick_tools(self, rng: random.Random, k: int) -> list[str]:
        """Draw k distinct tool names at random from the registry."""
        names = self._reg.names()
        if k > len(names):
            # repeat if necessary
            names = names * (k // len(names) + 1)
        return rng.sample(names, k)

    def _walk(self, rng: random.Random, length: int) -> list[str]:
        """Try a weighted chain walk; fall back to random picks on short graphs."""
        chain = self._cs.sample_chain(
            length=length, mode="weighted",
            allow_revisit=False, seed=rng.randint(0, 2**31),
        )
        tools = list(chain)
        # Pad with random tools if walk ended early
        if len(tools) < length:
            extra = self._pick_tools(rng, length - len(tools))
            tools.extend(extra)
        return tools[:length]

    def _single(self, rng: random.Random, **_) -> ConversationPattern:
        tool = self._pick_tools(rng, 1)[0]
        return ConversationPattern(
            pattern_type=PatternType.SINGLE,
            steps=[[tool]],
        )

    def _linear(self, rng: random.Random, chain_length: int, **_) -> ConversationPattern:
        length = max(2, chain_length)
        tools = self._walk(rng, length)
        steps = [[t] for t in tools]
        return ConversationPattern(pattern_type=PatternType.LINEAR, steps=steps)

    def _fan_out(self, rng: random.Random, fan_width: int, **_) -> ConversationPattern:
        width = max(2, fan_width)
        tools = self._pick_tools(rng, width + 1)
        root, branches = tools[0], tools[1:]
        return ConversationPattern(
            pattern_type=PatternType.FAN_OUT,
            steps=[[root], branches],
            metadata={"root": root, "branches": branches},
        )

    def _fan_in(self, rng: random.Random, fan_width: int, **_) -> ConversationPattern:
        width = max(2, fan_width)
        tools = self._pick_tools(rng, width + 1)
        inputs, sink = tools[:-1], tools[-1]
        return ConversationPattern(
            pattern_type=PatternType.FAN_IN,
            steps=[inputs, [sink]],
            metadata={"inputs": inputs, "sink": sink},
        )

    def _diamond(self, rng: random.Random, fan_width: int, **_) -> ConversationPattern:
        width = max(2, fan_width)
        tools = self._pick_tools(rng, width + 2)
        root, branches, sink = tools[0], tools[1:-1], tools[-1]
        return ConversationPattern(
            pattern_type=PatternType.DIAMOND,
            steps=[[root], branches, [sink]],
            metadata={"root": root, "branches": branches, "sink": sink},
        )

    def _conditional(self, rng: random.Random, **_) -> ConversationPattern:
        tools = self._pick_tools(rng, 3)
        trigger, branch_a, branch_b = tools
        chosen = rng.choice([branch_a, branch_b])
        return ConversationPattern(
            pattern_type=PatternType.CONDITIONAL,
            steps=[[trigger], [chosen]],
            metadata={
                "trigger": trigger,
                "branch_taken": chosen,
                "branch_not_taken": branch_b if chosen == branch_a else branch_a,
            },
        )

    def _retry(self, rng: random.Random, **_) -> ConversationPattern:
        tool = self._pick_tools(rng, 1)[0]
        return ConversationPattern(
            pattern_type=PatternType.RETRY,
            steps=[[tool], [tool]],
            metadata={"tool": tool, "note": "second call retries after partial result"},
        )

    def _pipeline(self, rng: random.Random, chain_length: int, **_) -> ConversationPattern:
        length = max(3, chain_length)
        tools = self._walk(rng, length)
        source, *transforms, sink = tools
        steps = [[source]] + [[t] for t in transforms] + [[sink]]
        return ConversationPattern(
            pattern_type=PatternType.PIPELINE,
            steps=steps,
            metadata={"source": source, "transforms": transforms, "sink": sink},
        )


# ---------------------------------------------------------------------------
# Registry of default sampling weights (used by generation orchestrator)
# ---------------------------------------------------------------------------

DEFAULT_PATTERN_WEIGHTS: dict[PatternType, float] = {
    PatternType.SINGLE:      0.10,
    PatternType.LINEAR:      0.25,
    PatternType.FAN_OUT:     0.10,
    PatternType.FAN_IN:      0.10,
    PatternType.DIAMOND:     0.10,
    PatternType.CONDITIONAL: 0.15,
    PatternType.RETRY:       0.10,
    PatternType.PIPELINE:    0.10,
}
