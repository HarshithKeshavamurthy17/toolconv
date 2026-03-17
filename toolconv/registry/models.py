"""
Pydantic models representing tool definitions and their components.

A ToolDef is the canonical in-memory representation of a single callable tool.
It is provider-agnostic: normalizer.py maps vendor-specific schemas (OpenAI
function-calling JSON, Anthropic tool_use blocks, etc.) into this form.
"""

from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Parameter schema types
# ---------------------------------------------------------------------------

class ParamType(str, Enum):
    """JSON-Schema primitive types supported for tool parameters."""
    STRING = "string"
    NUMBER = "number"
    INTEGER = "integer"
    BOOLEAN = "boolean"
    ARRAY = "array"
    OBJECT = "object"
    NULL = "null"


class ParamSchema(BaseModel):
    """
    Recursive model for a single parameter's JSON Schema.

    Covers the common subset used across OpenAI and Anthropic tool specs.
    Unknown vendor extensions are captured in `extra`.
    """
    type: ParamType | list[ParamType] | None = None
    description: str | None = None
    enum: list[Any] | None = None

    # Numeric constraints
    minimum: float | None = None
    maximum: float | None = None

    # String constraints
    min_length: int | None = Field(None, alias="minLength")
    max_length: int | None = Field(None, alias="maxLength")
    pattern: str | None = None

    # Array constraints
    items: ParamSchema | None = None
    min_items: int | None = Field(None, alias="minItems")
    max_items: int | None = Field(None, alias="maxItems")

    # Object constraints
    properties: dict[str, ParamSchema] | None = None
    required: list[str] | None = None
    additional_properties: bool | ParamSchema | None = Field(
        None, alias="additionalProperties"
    )

    # Composition
    any_of: list[ParamSchema] | None = Field(None, alias="anyOf")
    one_of: list[ParamSchema] | None = Field(None, alias="oneOf")
    all_of: list[ParamSchema] | None = Field(None, alias="allOf")

    # Catch-all for vendor-specific fields
    extra: dict[str, Any] = Field(default_factory=dict)

    model_config = {"populate_by_name": True, "extra": "allow"}

    def required_params(self) -> list[str]:
        """Return the list of required property names for object schemas."""
        return self.required or []

    def is_optional(self, name: str) -> bool:
        return name not in self.required_params()


# ---------------------------------------------------------------------------
# Top-level tool definition
# ---------------------------------------------------------------------------

class ToolDef(BaseModel):
    """
    Provider-agnostic definition of a callable tool.

    Fields
    ------
    name        : snake_case identifier, unique within a registry.
    description : Human-readable explanation used in LLM prompts.
    parameters  : JSON-Schema object describing all accepted parameters.
    returns     : Optional JSON-Schema describing the return value.
    tags        : Free-form labels for grouping / filtering (e.g. "finance").
    source      : Where this definition came from (filename, URL, etc.).
    raw         : Original vendor payload, preserved for round-trip fidelity.
    """
    name: str
    description: str
    parameters: ParamSchema = Field(
        default_factory=lambda: ParamSchema(type=ParamType.OBJECT, properties={})
    )
    returns: ParamSchema | None = None
    tags: list[str] = Field(default_factory=list)
    source: str | None = None
    raw: dict[str, Any] = Field(default_factory=dict)

    model_config = {"extra": "forbid"}

    # ------------------------------------------------------------------
    # Convenience helpers
    # ------------------------------------------------------------------

    def param_names(self) -> list[str]:
        """All top-level parameter names."""
        if self.parameters.properties:
            return list(self.parameters.properties.keys())
        return []

    def required_param_names(self) -> list[str]:
        """Top-level parameter names that are required."""
        return self.parameters.required_params()

    def optional_param_names(self) -> list[str]:
        all_p = self.param_names()
        req = set(self.required_param_names())
        return [p for p in all_p if p not in req]

    def get_param(self, name: str) -> ParamSchema | None:
        if self.parameters.properties:
            return self.parameters.properties.get(name)
        return None


# ---------------------------------------------------------------------------
# Registry entry — wraps a ToolDef with registry-level metadata
# ---------------------------------------------------------------------------

class RegistryEntry(BaseModel):
    """
    A ToolDef plus registry bookkeeping fields.

    The registry stores one RegistryEntry per unique tool name.
    """
    tool: ToolDef
    provider: str = "unknown"       # e.g. "openai", "anthropic", "custom"
    version: str = "1.0.0"
    deprecated: bool = False
    aliases: list[str] = Field(default_factory=list)

    model_config = {"extra": "forbid"}

    @property
    def name(self) -> str:
        return self.tool.name

    def all_names(self) -> list[str]:
        """Returns the canonical name plus any aliases."""
        return [self.name] + self.aliases
