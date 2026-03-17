"""
memory/mem0_store.py — scoped memory interface + mem0ai and in-memory backends.

This is the ONLY file in the codebase that may import mem0.

Public API (used by all agents)
--------------------------------
All backends expose exactly two methods:

    def add(self, content: str, scope: str, metadata: dict) -> None
    def search(self, query: str, scope: str, top_k: int = 5) -> list[dict]

Scope isolation
---------------
  scope="session"  — per-conversation working memory (tool outputs, context)
  scope="corpus"   — cross-conversation long-term memory (domain summaries)

Mem0Store uses user_id=scope so mem0's vector index partitions entries by
scope automatically.  Two calls with different scopes never share results.

ScopedInMemoryStore
-------------------
Drop-in test double: no network, no API keys, same interface.
Used by unit tests and local dry-runs.

Factory
-------
    store = make_memory_store()   # respects MEM0_ENABLED env var
"""

from __future__ import annotations

import logging
import os
import uuid
from abc import ABC, abstractmethod
from collections import defaultdict
from typing import Any

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Abstract scoped interface (the only contract the rest of the codebase sees)
# ---------------------------------------------------------------------------

class ScopedMemoryStore(ABC):
    """
    Minimal memory interface used by every agent in toolconv.

    Scope is a first-class parameter so backends can enforce namespace
    isolation without callers managing user_ids or prefixes.
    """

    @abstractmethod
    def add(
        self,
        content: str,
        scope: str,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        """
        Store a memory entry in the given scope.

        Parameters
        ----------
        content  : Text to remember (tool output summary, domain hint, …).
        scope    : Namespace key — e.g. "session", "corpus", or
                   "session:conv-id" for per-conversation isolation.
        metadata : Arbitrary tags stored alongside the entry.
        """

    @abstractmethod
    def search(
        self,
        query: str,
        scope: str,
        top_k: int = 5,
    ) -> list[dict[str, Any]]:
        """
        Retrieve the top-k most relevant entries from the given scope.

        Parameters
        ----------
        query  : Natural-language or keyword query.
        scope  : Must match the scope used when entries were added.
        top_k  : Maximum number of results to return.

        Returns
        -------
        List of dicts, each containing at minimum:
            { "id": str, "content": str, "metadata": dict, "score": float }
        Results are ordered by descending relevance.
        """


# ---------------------------------------------------------------------------
# Mem0Store — mem0ai backend
# ---------------------------------------------------------------------------

class Mem0Store(ScopedMemoryStore):
    """
    ScopedMemoryStore backed by mem0ai.

    Scope isolation is achieved by passing scope as user_id to mem0.
    mem0 partitions its vector store by user_id, guaranteeing that a
    search in scope="session" never surfaces corpus entries and vice versa.

    Parameters
    ----------
    config : Optional dict forwarded to mem0.Memory() constructor.
             Useful for pointing at a custom vector DB or LLM provider.
    """

    def __init__(self, config: dict[str, Any] | None = None) -> None:
        # Import here — this is the only place in the codebase that does so.
        from mem0 import Memory  # noqa: PLC0415

        self._client: Memory = Memory(config) if config else Memory()
        logger.info("Mem0Store initialised (config=%s)", bool(config))

    # ------------------------------------------------------------------
    # ScopedMemoryStore interface
    # ------------------------------------------------------------------

    def add(
        self,
        content: str,
        scope: str,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        """Add *content* to mem0 under *scope* (mapped to user_id)."""
        try:
            self._client.add(
                messages=[{"role": "user", "content": content}],
                user_id=scope,
                metadata=metadata or {},
                infer=False,   # store verbatim — no LLM extraction
            )
            logger.debug("mem0.add scope=%r len=%d", scope, len(content))
        except Exception as exc:
            logger.warning("mem0.add failed (scope=%r): %s", scope, exc)

    def search(
        self,
        query: str,
        scope: str,
        top_k: int = 5,
    ) -> list[dict[str, Any]]:
        """Search *scope* for entries relevant to *query*."""
        try:
            raw = self._client.search(
                query=query,
                user_id=scope,
                limit=top_k,
            )
            # mem0 wraps results in {"results": [...]} in newer versions
            items = raw.get("results", raw) if isinstance(raw, dict) else raw
            return [self._normalise(r) for r in items if isinstance(r, dict)]
        except Exception as exc:
            logger.warning("mem0.search failed (scope=%r): %s", scope, exc)
            return []

    # ------------------------------------------------------------------
    # Internal
    # ------------------------------------------------------------------

    @staticmethod
    def _normalise(raw: dict[str, Any]) -> dict[str, Any]:
        """Convert a mem0 result dict to the canonical toolconv shape."""
        return {
            "id":       raw.get("id", str(uuid.uuid4())),
            "content":  raw.get("memory", raw.get("content", "")),
            "metadata": raw.get("metadata", {}),
            "score":    float(raw.get("score", 0.0)),
        }


# ---------------------------------------------------------------------------
# ScopedInMemoryStore — test double, no external dependencies
# ---------------------------------------------------------------------------

class ScopedInMemoryStore(ScopedMemoryStore):
    """
    Dict-backed scoped store.  Fully self-contained — no API keys required.

    Search is case-insensitive substring matching; results are returned in
    reverse-insertion order (most-recent first).

    Use this in unit tests and local dry-runs:

        store = ScopedInMemoryStore()
    """

    def __init__(self) -> None:
        # scope → list of entry dicts
        self._buckets: dict[str, list[dict[str, Any]]] = defaultdict(list)

    def add(
        self,
        content: str,
        scope: str,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        entry = {
            "id":       str(uuid.uuid4()),
            "content":  content,
            "metadata": metadata or {},
            "score":    1.0,
        }
        self._buckets[scope].append(entry)
        logger.debug(
            "ScopedInMemoryStore.add scope=%r total=%d",
            scope, len(self._buckets[scope]),
        )

    def search(
        self,
        query: str,
        scope: str,
        top_k: int = 5,
    ) -> list[dict[str, Any]]:
        q = query.lower()
        bucket = self._buckets.get(scope, [])
        # Empty query → return most-recent top_k entries from this scope
        if not q:
            return list(reversed(bucket))[:top_k]
        matches = [e for e in bucket if q in e["content"].lower()]
        return list(reversed(matches))[:top_k]

    # ------------------------------------------------------------------
    # Test / introspection helpers (not part of ScopedMemoryStore interface)
    # ------------------------------------------------------------------

    def count(self, scope: str | None = None) -> int:
        """Return total entries, optionally restricted to one scope."""
        if scope is not None:
            return len(self._buckets.get(scope, []))
        return sum(len(v) for v in self._buckets.values())

    def scopes(self) -> list[str]:
        """Return all scopes that have at least one entry."""
        return list(self._buckets.keys())

    def clear(self, scope: str | None = None) -> None:
        """Clear one scope or all scopes."""
        if scope is not None:
            self._buckets.pop(scope, None)
        else:
            self._buckets.clear()

    def __repr__(self) -> str:
        summary = {s: len(v) for s, v in self._buckets.items()}
        return f"ScopedInMemoryStore({summary})"


# ---------------------------------------------------------------------------
# Factory — respects MEM0_ENABLED env var
# ---------------------------------------------------------------------------

def make_memory_store(
    config: dict[str, Any] | None = None,
    force_inmemory: bool = False,
) -> ScopedMemoryStore:
    """
    Return a ScopedMemoryStore appropriate for the current environment.

    Resolution order
    ----------------
    1. force_inmemory=True               → ScopedInMemoryStore (always)
    2. MEM0_ENABLED=false/0/no in env   → ScopedInMemoryStore
    3. OPENAI_API_KEY or ANTHROPIC_API_KEY present → Mem0Store
    4. No key found                      → ScopedInMemoryStore (with warning)

    Parameters
    ----------
    config        : Optional mem0 config dict forwarded to Mem0Store.
    force_inmemory: Skip all env checks, always return the in-memory store.
    """
    if force_inmemory:
        logger.info("make_memory_store: using ScopedInMemoryStore (forced)")
        return ScopedInMemoryStore()

    enabled = os.getenv("MEM0_ENABLED", "true").lower()
    if enabled in ("false", "0", "no"):
        logger.info("make_memory_store: MEM0_ENABLED=false → ScopedInMemoryStore")
        return ScopedInMemoryStore()

    has_key = bool(
        os.getenv("OPENAI_API_KEY") or os.getenv("ANTHROPIC_API_KEY")
    )
    if not has_key:
        logger.warning(
            "make_memory_store: no API key found → ScopedInMemoryStore. "
            "Set OPENAI_API_KEY or ANTHROPIC_API_KEY to use Mem0Store."
        )
        return ScopedInMemoryStore()

    try:
        store = Mem0Store(config=config)
        logger.info("make_memory_store: using Mem0Store")
        return store
    except Exception as exc:
        logger.warning(
            "make_memory_store: Mem0Store init failed (%s) → falling back to ScopedInMemoryStore",
            exc,
        )
        return ScopedInMemoryStore()
