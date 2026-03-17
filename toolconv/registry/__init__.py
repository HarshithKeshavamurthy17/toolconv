"""
toolconv.registry — queryable store of ToolDef objects.

Usage
-----
    from toolconv.registry import ToolRegistry

    reg = ToolRegistry()
    reg.load("data/raw/tools.json")
    reg.load("data/raw/anthropic_tools.jsonl", provider="anthropic")

    tool = reg.get("get_weather")
    finance_tools = reg.by_tag("finance")
    sample = reg.sample(5, seed=42)
"""

from __future__ import annotations

import random
from pathlib import Path
from typing import Iterator

from .loader import load
from .models import RegistryEntry, ToolDef
from .normalizer import normalize


class ToolRegistry:
    """
    In-memory registry of tools, keyed by canonical name.

    Supports:
    - Loading from files / directories via load()
    - Manual registration via register() / register_raw()
    - Lookup by name, tag, provider
    - Random sampling with optional seeding
    - Iteration and length
    """

    def __init__(self) -> None:
        # Primary store: canonical name → RegistryEntry
        self._store: dict[str, RegistryEntry] = {}
        # Alias map: alias → canonical name
        self._aliases: dict[str, str] = {}

    # ------------------------------------------------------------------
    # Loading
    # ------------------------------------------------------------------

    def load(
        self,
        source: str | Path,
        provider: str = "unknown",
        recursive: bool = False,
    ) -> int:
        """
        Load tools from a file or directory and add them to the registry.

        Returns the number of newly registered tools.
        """
        entries = load(source, provider=provider, recursive=recursive)
        added = 0
        for entry in entries:
            added += self._add(entry, overwrite=False)
        return added

    # ------------------------------------------------------------------
    # Manual registration
    # ------------------------------------------------------------------

    def register(self, entry: RegistryEntry, overwrite: bool = False) -> bool:
        """
        Add a pre-built RegistryEntry.

        Returns True if the entry was added, False if it was skipped
        (duplicate name and overwrite=False).
        """
        if entry.name in self._store and not overwrite:
            return False
        self._add(entry, overwrite=overwrite)
        return True

    def register_raw(
        self,
        raw: dict,
        provider: str = "unknown",
        source: str | None = None,
        overwrite: bool = False,
    ) -> bool:
        """
        Normalize a raw vendor dict and register it.

        Returns True if added, False if skipped.
        """
        entry = normalize(raw, provider=provider, source=source)
        return self.register(entry, overwrite=overwrite)

    # ------------------------------------------------------------------
    # Lookup
    # ------------------------------------------------------------------

    def get(self, name: str) -> RegistryEntry | None:
        """Return the entry for *name* (or alias), or None if not found."""
        canonical = self._aliases.get(name, name)
        return self._store.get(canonical)

    def get_tool(self, name: str) -> ToolDef | None:
        """Convenience: return just the ToolDef, or None."""
        entry = self.get(name)
        return entry.tool if entry else None

    def require(self, name: str) -> RegistryEntry:
        """Like get(), but raises KeyError if the tool is not found."""
        entry = self.get(name)
        if entry is None:
            raise KeyError(f"Tool {name!r} not found in registry")
        return entry

    # ------------------------------------------------------------------
    # Filtering
    # ------------------------------------------------------------------

    def by_tag(self, tag: str) -> list[RegistryEntry]:
        """Return all entries that carry the given tag."""
        return [e for e in self._store.values() if tag in e.tool.tags]

    def by_provider(self, provider: str) -> list[RegistryEntry]:
        """Return all entries from a specific provider."""
        return [e for e in self._store.values() if e.provider == provider]

    def by_tags(self, tags: list[str], match: str = "any") -> list[RegistryEntry]:
        """
        Filter entries by multiple tags.

        match="any"  → entry must have at least one of the given tags.
        match="all"  → entry must have every given tag.
        """
        tag_set = set(tags)
        if match == "all":
            return [e for e in self._store.values() if tag_set.issubset(e.tool.tags)]
        return [e for e in self._store.values() if tag_set & set(e.tool.tags)]

    def search(self, query: str, field: str = "name") -> list[RegistryEntry]:
        """
        Case-insensitive substring search over tool name or description.

        field: "name" | "description" | "both"
        """
        q = query.lower()
        results = []
        for e in self._store.values():
            if field in ("name", "both") and q in e.tool.name.lower():
                results.append(e)
            elif field in ("description", "both") and q in e.tool.description.lower():
                results.append(e)
        return results

    # ------------------------------------------------------------------
    # Sampling
    # ------------------------------------------------------------------

    def sample(self, k: int, seed: int | None = None) -> list[RegistryEntry]:
        """
        Return *k* randomly chosen entries (without replacement).

        Raises ValueError if k > len(registry).
        """
        entries = list(self._store.values())
        if k > len(entries):
            raise ValueError(
                f"Cannot sample {k} tools from a registry of {len(entries)}"
            )
        rng = random.Random(seed)
        return rng.sample(entries, k)

    def sample_tools(self, k: int, seed: int | None = None) -> list[ToolDef]:
        """Like sample(), but returns ToolDef objects."""
        return [e.tool for e in self.sample(k, seed=seed)]

    # ------------------------------------------------------------------
    # Introspection
    # ------------------------------------------------------------------

    def names(self) -> list[str]:
        """Sorted list of all canonical tool names."""
        return sorted(self._store)

    def tags(self) -> set[str]:
        """Set of all tags across all registered tools."""
        result: set[str] = set()
        for e in self._store.values():
            result.update(e.tool.tags)
        return result

    def providers(self) -> set[str]:
        """Set of all provider labels in the registry."""
        return {e.provider for e in self._store.values()}

    def __len__(self) -> int:
        return len(self._store)

    def __contains__(self, name: str) -> bool:
        canonical = self._aliases.get(name, name)
        return canonical in self._store

    def __iter__(self) -> Iterator[RegistryEntry]:
        return iter(self._store.values())

    def __repr__(self) -> str:
        return f"ToolRegistry({len(self)} tools)"

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _add(self, entry: RegistryEntry, overwrite: bool = True) -> int:
        """
        Insert entry into _store and register its aliases.

        Returns 1 if newly added, 0 if it was already present and overwrite=False.
        """
        if entry.name in self._store and not overwrite:
            return 0
        self._store[entry.name] = entry
        for alias in entry.aliases:
            self._aliases[alias] = entry.name
        return 1
