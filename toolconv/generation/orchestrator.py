"""
generation/orchestrator.py — the main generation pipeline.

Wires all agents together to produce a JSONL dataset of synthetic
tool-calling conversations.

Pipeline per conversation
-------------------------
  1. SamplerAgent   → SamplerResult   (tool chain from graph)
  2. PlannerAgent   → ConversationPlan (LLM-planned conversation)
  3. UserProxyAgent → list[UserTurn]   (user messages)
  4. AssistantAgent → AssistantResult  (tool calls + responses)
  5. ValidatorAgent → ValidationReport (hard-requirement checks)
  6. If passed:
       assemble_from_agents() → ConversationRecord
       write line to output JSONL
       write corpus-memory summary
  7. If failed: retry up to max_retries times, then skip

Configuration
-------------
All options are in GeneratorConfig, passed to Orchestrator.__init__().
The --no-corpus-memory flag maps to corpus_memory_enabled=False.
"""

from __future__ import annotations

import json
import logging
import os
import random
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import networkx as nx

from toolconv.agents.assistant_agent import AssistantAgent
from toolconv.agents.planner_agent import PlannerAgent
from toolconv.agents.sampler_agent import SamplerAgent
from toolconv.agents.user_proxy_agent import UserProxyAgent
from toolconv.agents.validator_agent import ValidatorAgent
from toolconv.executor.mocker import ToolMocker
from toolconv.generation.conversation_schema import (
    ConversationRecord,
    assemble_from_agents,
)
from toolconv.memory.mem0_store import ScopedMemoryStore, make_memory_store
from toolconv.registry import ToolRegistry

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

@dataclass
class GeneratorConfig:
    """
    All knobs for one generation run.

    Attributes
    ----------
    n_conversations      : Target number of validated conversations to write.
    seed                 : Master RNG seed (sub-seeds derived from this).
    output_path          : Path to the output .jsonl file.
    corpus_memory_enabled: False disables corpus memory (--no-corpus-memory).
    min_tool_calls       : Hard minimum tool calls per conversation (≥3).
    min_distinct_tools   : Hard minimum distinct tools (≥2).
    max_retries          : Retries per conversation on validation failure.
    min_tools            : Minimum tools in sampled chain.
    max_tools            : Maximum tools in sampled chain.
    extra_metadata       : Optional fields merged into every record's metadata.
    """
    n_conversations: int = 50
    seed: int = 42
    output_path: str = "outputs/conversations.jsonl"
    corpus_memory_enabled: bool = True
    min_tool_calls: int = 3
    min_distinct_tools: int = 2
    max_retries: int = 3
    min_tools: int = 3
    max_tools: int = 5
    extra_metadata: dict[str, Any] = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Generation statistics
# ---------------------------------------------------------------------------

@dataclass
class GenerationStats:
    """Counters updated throughout a generation run."""
    total_attempts: int = 0
    total_written: int = 0
    total_rejected: int = 0
    rejection_reasons: dict[str, int] = field(default_factory=dict)
    pattern_counts: dict[str, int] = field(default_factory=dict)
    domain_counts: dict[str, int] = field(default_factory=dict)
    elapsed_seconds: float = 0.0

    @property
    def acceptance_rate(self) -> float:
        if self.total_attempts == 0:
            return 0.0
        return round(self.total_written / self.total_attempts, 4)

    def record_rejection(self, reasons: list[str]) -> None:
        self.total_rejected += 1
        for r in reasons:
            self.rejection_reasons[r] = self.rejection_reasons.get(r, 0) + 1

    def to_dict(self) -> dict[str, Any]:
        return {
            "total_attempts":    self.total_attempts,
            "total_written":     self.total_written,
            "total_rejected":    self.total_rejected,
            "acceptance_rate":   self.acceptance_rate,
            "rejection_reasons": self.rejection_reasons,
            "pattern_counts":    self.pattern_counts,
            "domain_counts":     self.domain_counts,
            "elapsed_seconds":   round(self.elapsed_seconds, 2),
        }


# ---------------------------------------------------------------------------
# Orchestrator
# ---------------------------------------------------------------------------

class Orchestrator:
    """
    Runs the full generation pipeline and writes a JSONL dataset.

    Parameters
    ----------
    registry : Pre-loaded ToolRegistry.
    G        : NetworkX DiGraph from ToolGraphBuilder.build().
    config   : GeneratorConfig controlling all run parameters.
    memory   : Optional ScopedMemoryStore; auto-created if None.
    """

    def __init__(
        self,
        registry: ToolRegistry,
        G: nx.DiGraph,
        config: GeneratorConfig | None = None,
        memory: ScopedMemoryStore | None = None,
    ) -> None:
        self._registry = registry
        self._G = G
        self._cfg = config or GeneratorConfig()
        self._memory = memory or make_memory_store(
            force_inmemory=not self._cfg.corpus_memory_enabled
        )
        self._rng = random.Random(self._cfg.seed)

        # Initialise agents (shared across conversations)
        self._sampler = SamplerAgent(registry, G, seed=self._cfg.seed)
        self._planner = PlannerAgent(
            self._memory,
            corpus_memory_enabled=self._cfg.corpus_memory_enabled,
        )
        self._user_proxy = UserProxyAgent(seed=self._cfg.seed)
        self._validator = ValidatorAgent(
            min_tool_calls=self._cfg.min_tool_calls,
            min_distinct_tools=self._cfg.min_distinct_tools,
        )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def run(self) -> GenerationStats:
        """
        Generate conversations and write them to the configured output path.

        Returns
        -------
        GenerationStats with counts and timing.
        """
        cfg = self._cfg
        output_path = Path(cfg.output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        stats = GenerationStats()
        t0 = time.monotonic()

        logger.info(
            "Orchestrator: starting — target=%d seed=%d corpus_memory=%s output=%s",
            cfg.n_conversations, cfg.seed, cfg.corpus_memory_enabled, output_path,
        )

        with output_path.open("w", encoding="utf-8") as fh:
            written = 0
            while written < cfg.n_conversations:
                conv_seed = self._rng.randint(0, 2**31)
                record = self._generate_one(conv_seed, stats)
                if record is None:
                    continue
                fh.write(record.to_json() + "\n")
                fh.flush()
                written += 1
                stats.total_written = written

                # Corpus memory: write summary for the next planner
                if cfg.corpus_memory_enabled:
                    self._write_corpus_summary(record)

                if written % 10 == 0 or written == cfg.n_conversations:
                    logger.info(
                        "Progress: %d/%d written  (attempts=%d, rejected=%d)",
                        written, cfg.n_conversations,
                        stats.total_attempts, stats.total_rejected,
                    )

        stats.elapsed_seconds = time.monotonic() - t0
        logger.info("Orchestrator done: %s", stats.to_dict())
        return stats

    def generate_one(self, seed: int | None = None) -> ConversationRecord | None:
        """
        Public single-conversation entry point (for testing / interactive use).

        Returns
        -------
        ConversationRecord if validation passed, None if all retries failed.
        """
        conv_seed = seed if seed is not None else self._rng.randint(0, 2**31)
        stats = GenerationStats()
        return self._generate_one(conv_seed, stats)

    # ------------------------------------------------------------------
    # Internal pipeline
    # ------------------------------------------------------------------

    def _generate_one(
        self,
        conv_seed: int,
        stats: GenerationStats,
    ) -> ConversationRecord | None:
        """
        Attempt to generate one validated conversation.
        Retries up to cfg.max_retries times on validation failure.
        """
        for attempt in range(self._cfg.max_retries + 1):
            attempt_seed = conv_seed + attempt
            stats.total_attempts += 1
            try:
                record, report = self._single_attempt(attempt_seed)
            except Exception as exc:
                logger.warning(
                    "Attempt %d failed with exception: %s", attempt, exc, exc_info=True
                )
                stats.total_rejected += 1
                continue

            if report.passed:
                # Update pattern / domain counts
                meta = record.metadata
                stats.pattern_counts[meta.pattern_type] = (
                    stats.pattern_counts.get(meta.pattern_type, 0) + 1
                )
                stats.domain_counts[meta.domain] = (
                    stats.domain_counts.get(meta.domain, 0) + 1
                )
                return record
            else:
                stats.record_rejection([f.name for f in report.failures])
                logger.debug(
                    "Attempt %d rejected: %s", attempt, report.failure_summary
                )

        logger.warning("All %d retries exhausted for seed %d", self._cfg.max_retries, conv_seed)
        return None

    def _single_attempt(
        self, seed: int
    ) -> tuple[ConversationRecord, Any]:
        """Run the full agent pipeline once and return (record, validation_report)."""
        cfg = self._cfg
        rng = random.Random(seed)

        # ── Step 1: Sample tool chain ──────────────────────────────────
        sampler_result = self._sampler.sample(
            min_tools=cfg.min_tools,
            max_tools=cfg.max_tools,
            seed=seed,
            corpus_memory_enabled=cfg.corpus_memory_enabled,
        )

        # ── Step 2: Plan conversation ──────────────────────────────────
        plan = self._planner.plan(sampler_result, seed=seed)

        # ── Step 3: Generate user messages ────────────────────────────
        user_turns = self._user_proxy.generate_all(plan)
        user_messages = [t.to_message() for t in user_turns]

        # ── Step 4: Run assistant ──────────────────────────────────────
        mocker = ToolMocker(seed=seed)
        assistant = AssistantAgent(
            self._registry,
            self._memory,
            mocker=mocker,
            seed=seed,
        )
        conv_id = f"conv-{seed:010d}"
        assistant_result = assistant.run(
            plan,
            user_messages,
            conversation_id=conv_id,
        )

        # ── Step 5: Build metadata ─────────────────────────────────────
        state = assistant_result.state
        metadata = {
            "seed":                        seed,
            "tool_ids_used":               list(dict.fromkeys(state.all_tool_names)),
            "num_turns":                   state.n_turns,
            "num_clarification_questions": assistant_result.n_clarification_questions,
            "memory_grounding_rate":       assistant_result.memory_grounding_rate,
            "corpus_memory_enabled":       cfg.corpus_memory_enabled,
            "pattern_type":                plan.pattern_type,
            "domain":                      plan.domain,
            "validation_passed":           False,   # updated below after validation
        }
        if cfg.extra_metadata:
            metadata.update(cfg.extra_metadata)

        # ── Step 6: Validate ───────────────────────────────────────────
        report = self._validator.validate(
            assistant_result, plan, sampler_result, metadata
        )
        metadata["validation_passed"] = report.passed

        # ── Step 7: Assemble record ────────────────────────────────────
        record = assemble_from_agents(
            assistant_result=assistant_result,
            plan=plan,
            sampler_result=sampler_result,
            validation_passed=report.passed,
            seed=seed,
            user_messages=user_messages,
            extra_metadata={
                k: v for k, v in metadata.items()
                if k not in {
                    "seed", "tool_ids_used", "num_turns",
                    "num_clarification_questions", "memory_grounding_rate",
                    "corpus_memory_enabled", "pattern_type", "domain",
                    "validation_passed",
                }
            },
        )
        return record, report

    # ------------------------------------------------------------------
    # Corpus memory
    # ------------------------------------------------------------------

    def _write_corpus_summary(self, record: ConversationRecord) -> None:
        """Write a one-line summary of a validated conversation to corpus memory."""
        meta = record.metadata
        tools_str = ", ".join(meta.tool_ids_used)
        content = (
            f"Tools: {tools_str}. "
            f"Domain: {meta.domain}. "
            f"Pattern: {meta.pattern_type}. "
            f"Turns: {meta.num_turns}. "
            f"Clarifications: {meta.num_clarification_questions}."
        )
        try:
            self._memory.add(
                content=content,
                scope="corpus",
                metadata={
                    "conversation_id": record.conversation_id,
                    "tools":           meta.tool_ids_used,
                    "pattern_type":    meta.pattern_type,
                    "domain":          meta.domain,
                    "seed":            meta.seed,
                },
            )
        except Exception as exc:
            logger.warning("Corpus memory write failed: %s", exc)
