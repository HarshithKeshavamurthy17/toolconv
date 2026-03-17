"""
loader.py — load raw tool definitions from disk into RegistryEntry objects.

Supported source formats
------------------------
- JSON file containing a single tool object
- JSON file containing a list of tool objects
- JSONL file (one tool object per line)
- Directory of any of the above

All raw payloads are passed through normalizer.normalize() before being
stored, so the caller always receives provider-agnostic RegistryEntry objects.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Iterator

from .models import RegistryEntry
from .normalizer import normalize

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Low-level helpers
# ---------------------------------------------------------------------------

def _iter_json_file(path: Path) -> Iterator[dict]:
    """Yield raw dicts from a .json file (single object or list)."""
    with path.open(encoding="utf-8") as fh:
        data = json.load(fh)
    if isinstance(data, list):
        yield from data
    elif isinstance(data, dict):
        yield data
    else:
        raise ValueError(f"{path}: expected a JSON object or array, got {type(data)}")


def _iter_jsonl_file(path: Path) -> Iterator[dict]:
    """Yield raw dicts from a .jsonl file (one JSON object per line)."""
    with path.open(encoding="utf-8") as fh:
        for lineno, line in enumerate(fh, 1):
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(f"{path}:{lineno}: invalid JSON — {exc}") from exc
            if not isinstance(obj, dict):
                raise ValueError(f"{path}:{lineno}: expected a JSON object, got {type(obj)}")
            yield obj


def _iter_file(path: Path) -> Iterator[dict]:
    """Dispatch to the right loader based on file extension."""
    suffix = path.suffix.lower()
    if suffix == ".json":
        yield from _iter_json_file(path)
    elif suffix == ".jsonl":
        yield from _iter_jsonl_file(path)
    else:
        raise ValueError(f"Unsupported file type: {path.suffix!r} ({path})")


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def load_file(path: str | Path, provider: str = "unknown") -> list[RegistryEntry]:
    """
    Load all tool definitions from a single JSON or JSONL file.

    Parameters
    ----------
    path     : Path to the .json or .jsonl file.
    provider : Label stored on each RegistryEntry (e.g. "openai", "custom").

    Returns
    -------
    List of RegistryEntry objects in file order.
    """
    path = Path(path)
    if not path.is_file():
        raise FileNotFoundError(f"Tool file not found: {path}")

    entries: list[RegistryEntry] = []
    for raw in _iter_file(path):
        try:
            entry = normalize(raw, provider=provider, source=str(path))
            entries.append(entry)
        except Exception as exc:
            logger.warning("Skipping malformed tool in %s: %s", path, exc)

    logger.debug("Loaded %d tool(s) from %s", len(entries), path)
    return entries


def load_directory(
    directory: str | Path,
    provider: str = "unknown",
    recursive: bool = False,
) -> list[RegistryEntry]:
    """
    Load all tool definitions from every .json / .jsonl file in a directory.

    Parameters
    ----------
    directory : Root directory to scan.
    provider  : Label stored on each RegistryEntry.
    recursive : If True, recurse into sub-directories.

    Returns
    -------
    Flat list of RegistryEntry objects from all discovered files.
    """
    directory = Path(directory)
    if not directory.is_dir():
        raise NotADirectoryError(f"Not a directory: {directory}")

    glob = "**/*" if recursive else "*"
    pattern_json = directory.glob(f"{glob}.json") if recursive else directory.glob("*.json")
    pattern_jsonl = directory.glob(f"{glob}.jsonl") if recursive else directory.glob("*.jsonl")

    files = sorted(set(pattern_json) | set(pattern_jsonl))

    entries: list[RegistryEntry] = []
    for file in files:
        try:
            entries.extend(load_file(file, provider=provider))
        except Exception as exc:
            logger.warning("Skipping file %s: %s", file, exc)

    logger.debug("Loaded %d tool(s) from directory %s", len(entries), directory)
    return entries


def load(
    source: str | Path,
    provider: str = "unknown",
    recursive: bool = False,
) -> list[RegistryEntry]:
    """
    Unified entry point: accepts a file path or a directory path.

    Parameters
    ----------
    source    : Path to a .json/.jsonl file, or a directory.
    provider  : Label stored on each RegistryEntry.
    recursive : Passed through to load_directory when source is a directory.

    Returns
    -------
    List of RegistryEntry objects.
    """
    source = Path(source)
    if source.is_dir():
        return load_directory(source, provider=provider, recursive=recursive)
    return load_file(source, provider=provider)
