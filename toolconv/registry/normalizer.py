"""
normalizer.py — convert vendor-specific tool payloads into RegistryEntry.

Supported input formats
-----------------------
1. OpenAI function-calling (wrapped)
   { "type": "function", "function": { "name": ..., "description": ..., "parameters": {...} } }

2. OpenAI function-calling (unwrapped / legacy)
   { "name": ..., "description": ..., "parameters": { "type": "object", "properties": {...} } }

3. Anthropic tool_use
   { "name": ..., "description": ..., "input_schema": { "type": "object", "properties": {...} } }

4. Generic / custom (already in ToolDef shape)
   { "name": ..., "description": ..., "parameters": {...} }

Detection is done heuristically — callers can also pass `provider` explicitly
to skip detection and force a specific normalisation path.
"""

from __future__ import annotations

import logging
from typing import Any

from .models import ParamSchema, ParamType, RegistryEntry, ToolDef

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# JSON-Schema → ParamSchema (recursive)
# ---------------------------------------------------------------------------

def _build_param_schema(raw: dict[str, Any]) -> ParamSchema:
    """
    Recursively convert a raw JSON-Schema dict into a ParamSchema.

    Handles nested properties, items, anyOf/oneOf/allOf, and passes
    any unrecognised keys through to ParamSchema.extra.
    """
    if not isinstance(raw, dict):
        return ParamSchema()

    known = {
        "type", "description", "enum",
        "minimum", "maximum",
        "minLength", "maxLength", "pattern",
        "items", "minItems", "maxItems",
        "properties", "required", "additionalProperties",
        "anyOf", "oneOf", "allOf",
    }

    kwargs: dict[str, Any] = {}
    extra: dict[str, Any] = {}

    for key, value in raw.items():
        if key not in known:
            extra[key] = value
            continue

        if key == "properties" and isinstance(value, dict):
            kwargs["properties"] = {k: _build_param_schema(v) for k, v in value.items()}
        elif key == "items" and isinstance(value, dict):
            kwargs["items"] = _build_param_schema(value)
        elif key == "additionalProperties" and isinstance(value, dict):
            kwargs["additional_properties"] = _build_param_schema(value)
        elif key == "anyOf" and isinstance(value, list):
            kwargs["any_of"] = [_build_param_schema(s) for s in value]
        elif key == "oneOf" and isinstance(value, list):
            kwargs["one_of"] = [_build_param_schema(s) for s in value]
        elif key == "allOf" and isinstance(value, list):
            kwargs["all_of"] = [_build_param_schema(s) for s in value]
        elif key == "minLength":
            kwargs["min_length"] = value
        elif key == "maxLength":
            kwargs["max_length"] = value
        elif key == "minItems":
            kwargs["min_items"] = value
        elif key == "maxItems":
            kwargs["max_items"] = value
        elif key == "additionalProperties" and isinstance(value, bool):
            kwargs["additional_properties"] = value
        else:
            kwargs[key] = value

    if extra:
        kwargs["extra"] = extra

    return ParamSchema(**kwargs)


# ---------------------------------------------------------------------------
# Format detection
# ---------------------------------------------------------------------------

def _detect_provider(raw: dict[str, Any]) -> str:
    """
    Heuristically identify the vendor format of a raw tool payload.

    Returns one of: "openai_wrapped", "anthropic", "openai", "generic".
    """
    # OpenAI wrapped: { "type": "function", "function": {...} }
    if raw.get("type") == "function" and isinstance(raw.get("function"), dict):
        return "openai_wrapped"

    # Anthropic: uses "input_schema" instead of "parameters"
    if "input_schema" in raw and "name" in raw:
        return "anthropic"

    # OpenAI unwrapped / generic: has "parameters" with JSON-schema
    if "parameters" in raw and "name" in raw:
        return "openai"

    return "generic"


# ---------------------------------------------------------------------------
# Per-format extractors
# ---------------------------------------------------------------------------

def _extract_openai_wrapped(raw: dict[str, Any]) -> tuple[str, str, dict, list[str]]:
    """Extract (name, description, params_schema_dict, tags) from OpenAI wrapped format."""
    fn = raw["function"]
    name = fn["name"]
    description = fn.get("description", "")
    params = fn.get("parameters", {"type": "object", "properties": {}})
    tags = fn.get("tags", raw.get("tags", []))
    return name, description, params, tags


def _extract_anthropic(raw: dict[str, Any]) -> tuple[str, str, dict, list[str]]:
    """Extract from Anthropic tool_use format (input_schema key)."""
    name = raw["name"]
    description = raw.get("description", "")
    params = raw.get("input_schema", {"type": "object", "properties": {}})
    tags = raw.get("tags", [])
    return name, description, params, tags


def _extract_generic(raw: dict[str, Any]) -> tuple[str, str, dict, list[str]]:
    """Extract from OpenAI-unwrapped or generic format (parameters key)."""
    name = raw["name"]
    description = raw.get("description", "")
    params = raw.get("parameters", {"type": "object", "properties": {}})
    tags = raw.get("tags", [])
    return name, description, params, tags


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def normalize(
    raw: dict[str, Any],
    provider: str = "unknown",
    source: str | None = None,
) -> RegistryEntry:
    """
    Convert any supported vendor payload into a RegistryEntry.

    Parameters
    ----------
    raw      : The raw tool dict as loaded from disk or an API response.
    provider : Label to store on the RegistryEntry (auto-detected if "unknown").
    source   : File path or URL the payload came from (stored on ToolDef).

    Returns
    -------
    A fully populated RegistryEntry with a provider-agnostic ToolDef inside.

    Raises
    ------
    ValueError  : If the payload is missing required fields (name).
    """
    if not isinstance(raw, dict):
        raise ValueError(f"Expected a dict, got {type(raw)}")

    fmt = _detect_provider(raw)
    logger.debug("Detected format %r for tool %r", fmt, raw.get("name") or raw.get("function", {}).get("name"))

    if fmt == "openai_wrapped":
        name, description, params_raw, tags = _extract_openai_wrapped(raw)
        detected_provider = "openai"
    elif fmt == "anthropic":
        name, description, params_raw, tags = _extract_anthropic(raw)
        detected_provider = "anthropic"
    else:  # "openai" or "generic"
        name, description, params_raw, tags = _extract_generic(raw)
        detected_provider = "openai" if fmt == "openai" else "custom"

    if not name:
        raise ValueError(f"Tool payload is missing a 'name' field: {raw}")

    # Use caller-supplied provider if it isn't the default sentinel
    resolved_provider = provider if provider != "unknown" else detected_provider

    parameters = _build_param_schema(params_raw)

    # Ensure top-level is always typed as object (some schemas omit this)
    if parameters.type is None:
        parameters = parameters.model_copy(update={"type": ParamType.OBJECT})

    # Optional return schema
    returns_raw = raw.get("returns") or raw.get("return_schema")
    returns = _build_param_schema(returns_raw) if isinstance(returns_raw, dict) else None

    tool = ToolDef(
        name=name,
        description=description,
        parameters=parameters,
        returns=returns,
        tags=tags,
        source=source,
        raw=raw,
    )
    return RegistryEntry(tool=tool, provider=resolved_provider)
