"""
memory/interface.py — abstract memory interface + lightweight in-memory store.

Architecture
------------
  MemoryStore (ABC)          — defines the contract every backend must satisfy
  InMemoryStore              — dict-backed store with simple substring search;
                               no external dependencies, used for testing and
                               local runs where mem0 is not configured

Memory entries
--------------
  Each entry is a MemoryEntry dataclass:
    id       : unique string key
    content  : the text or structured data being remembered
    metadata : arbitrary key-value tags (agent_id, conversation_id, turn, ...)
    created_at / updated_at : ISO-8601 timestamps

The interface is intentionally minimal so that mem0_store.py can implement it
by delegating to the mem0ai client without any adapter boilerplate.
"""

from __future__ import annotations

import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


# ---------------------------------------------------------------------------
# Entry model
# ---------------------------------------------------------------------------

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class MemoryEntry:
    """One unit of stored memory."""
    id: str
    content: str
    metadata: dict[str, Any] = field(default_factory=dict)
    created_at: str = field(default_factory=_now_iso)
    updated_at: str = field(default_factory=_now_iso)

    def to_dict(self) -> dict[str, Any]:
        return {
            "id":         self.id,
            "content":    self.content,
            "metadata":   self.metadata,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> MemoryEntry:
        return cls(
            id=d["id"],
            content=d["content"],
            metadata=d.get("metadata", {}),
            created_at=d.get("created_at", _now_iso()),
            updated_at=d.get("updated_at", _now_iso()),
        )


# ---------------------------------------------------------------------------
# Abstract interface
# ---------------------------------------------------------------------------

class MemoryStore(ABC):
    """
    Abstract base class for all memory backends.

    Every method is synchronous.  Async backends should wrap calls
    in asyncio.run() or expose an awaitable subclass.
    """

    @abstractmethod
    def add(
        self,
        content: str,
        metadata: dict[str, Any] | None = None,
        entry_id: str | None = None,
    ) -> MemoryEntry:
        """
        Store a new memory entry.

        Parameters
        ----------
        content  : Text content to remember.
        metadata : Arbitrary tags (agent_id, conversation_id, …).
        entry_id : Use this id instead of auto-generating one.

        Returns
        -------
        The created MemoryEntry.
        """

    @abstractmethod
    def get(self, entry_id: str) -> MemoryEntry | None:
        """Return the entry with *entry_id*, or None if not found."""

    @abstractmethod
    def update(self, entry_id: str, content: str) -> MemoryEntry | None:
        """
        Replace the content of an existing entry.

        Returns the updated entry, or None if *entry_id* doesn't exist.
        """

    @abstractmethod
    def delete(self, entry_id: str) -> bool:
        """Delete an entry.  Returns True if it existed, False otherwise."""

    @abstractmethod
    def search(
        self,
        query: str,
        limit: int = 10,
        filters: dict[str, Any] | None = None,
    ) -> list[MemoryEntry]:
        """
        Return up to *limit* entries whose content contains *query*.

        filters : optional key-value pairs that must match the entry's metadata.
        """

    @abstractmethod
    def list_all(
        self,
        filters: dict[str, Any] | None = None,
        limit: int | None = None,
    ) -> list[MemoryEntry]:
        """
        Return all entries, optionally filtered by metadata key-value pairs.
        """

    @abstractmethod
    def clear(self) -> int:
        """Delete all entries.  Returns count of deleted entries."""

    # ------------------------------------------------------------------
    # Convenience helpers (non-abstract)
    # ------------------------------------------------------------------

    def add_many(
        self,
        entries: list[tuple[str, dict[str, Any] | None]],
    ) -> list[MemoryEntry]:
        """Bulk-add a list of (content, metadata) tuples."""
        return [self.add(content, meta) for content, meta in entries]

    def get_or_raise(self, entry_id: str) -> MemoryEntry:
        entry = self.get(entry_id)
        if entry is None:
            raise KeyError(f"Memory entry {entry_id!r} not found")
        return entry

    def __len__(self) -> int:
        return len(self.list_all())

    def __contains__(self, entry_id: str) -> bool:
        return self.get(entry_id) is not None


# ---------------------------------------------------------------------------
# In-memory implementation
# ---------------------------------------------------------------------------

class InMemoryStore(MemoryStore):
    """
    Simple dict-backed store.

    Search is case-insensitive substring matching over content.
    Metadata filtering uses exact equality per key.

    Thread safety: not guaranteed — use a single-threaded context or
    wrap with a lock if needed.
    """

    def __init__(self) -> None:
        self._store: dict[str, MemoryEntry] = {}

    # ------------------------------------------------------------------
    # MemoryStore interface
    # ------------------------------------------------------------------

    def add(
        self,
        content: str,
        metadata: dict[str, Any] | None = None,
        entry_id: str | None = None,
    ) -> MemoryEntry:
        eid = entry_id or str(uuid.uuid4())
        entry = MemoryEntry(
            id=eid,
            content=content,
            metadata=metadata or {},
        )
        self._store[eid] = entry
        return entry

    def get(self, entry_id: str) -> MemoryEntry | None:
        return self._store.get(entry_id)

    def update(self, entry_id: str, content: str) -> MemoryEntry | None:
        entry = self._store.get(entry_id)
        if entry is None:
            return None
        entry.content = content
        entry.updated_at = _now_iso()
        return entry

    def delete(self, entry_id: str) -> bool:
        if entry_id in self._store:
            del self._store[entry_id]
            return True
        return False

    def search(
        self,
        query: str,
        limit: int = 10,
        filters: dict[str, Any] | None = None,
    ) -> list[MemoryEntry]:
        q = query.lower()
        results = []
        for entry in self._store.values():
            if q not in entry.content.lower():
                continue
            if not self._matches_filters(entry, filters):
                continue
            results.append(entry)
            if len(results) >= limit:
                break
        return results

    def list_all(
        self,
        filters: dict[str, Any] | None = None,
        limit: int | None = None,
    ) -> list[MemoryEntry]:
        entries = [
            e for e in self._store.values()
            if self._matches_filters(e, filters)
        ]
        if limit is not None:
            entries = entries[:limit]
        return entries

    def clear(self) -> int:
        count = len(self._store)
        self._store.clear()
        return count

    # ------------------------------------------------------------------
    # Internal
    # ------------------------------------------------------------------

    @staticmethod
    def _matches_filters(entry: MemoryEntry, filters: dict[str, Any] | None) -> bool:
        if not filters:
            return True
        return all(entry.metadata.get(k) == v for k, v in filters.items())

    def __repr__(self) -> str:
        return f"InMemoryStore({len(self._store)} entries)"
