"""
executor/validator.py — validate tool call arguments against ParamSchema.

Validation covers:
  • Required field presence
  • Type conformance  (string, number, integer, boolean, array, object, null)
  • Enum membership
  • Numeric constraints   (minimum, maximum)
  • String constraints    (minLength, maxLength, pattern)
  • Array constraints     (minItems, maxItems, items schema)
  • Object constraints    (properties, required, additionalProperties)
  • Composition           (anyOf, oneOf, allOf)

A ValidationResult is always returned — exceptions are never raised for
schema violations.  Only internal programming errors (wrong argument types)
raise exceptions.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

from toolconv.registry.models import ParamSchema, ParamType, ToolDef


# ---------------------------------------------------------------------------
# Result types
# ---------------------------------------------------------------------------

@dataclass
class ValidationError:
    """One schema violation."""
    path: str          # JSON-pointer-style path, e.g. "args.address.city"
    message: str       # human-readable description


@dataclass
class ValidationResult:
    """Outcome of validating one tool call."""
    valid: bool
    errors: list[ValidationError] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    def add_error(self, path: str, message: str) -> None:
        self.errors.append(ValidationError(path=path, message=message))
        self.valid = False

    def add_warning(self, message: str) -> None:
        self.warnings.append(message)

    def __repr__(self) -> str:
        if self.valid:
            return "ValidationResult(valid=True)"
        msgs = "; ".join(f"{e.path}: {e.message}" for e in self.errors)
        return f"ValidationResult(valid=False, errors=[{msgs}])"


# ---------------------------------------------------------------------------
# Type-checking helpers
# ---------------------------------------------------------------------------

_PYTHON_TYPES: dict[str, type | tuple[type, ...]] = {
    ParamType.STRING.value:  str,
    ParamType.NUMBER.value:  (int, float),
    ParamType.INTEGER.value: int,
    ParamType.BOOLEAN.value: bool,
    ParamType.ARRAY.value:   list,
    ParamType.OBJECT.value:  dict,
    ParamType.NULL.value:    type(None),
}

def _type_matches(value: Any, type_str: str) -> bool:
    """Return True if *value* matches the JSON-Schema *type_str*."""
    expected = _PYTHON_TYPES.get(type_str)
    if expected is None:
        return True  # unknown type → permissive
    # JSON has no distinct boolean/integer distinction at the Python level;
    # bool is a subclass of int, so we must exclude bools from integer checks.
    if type_str == ParamType.INTEGER.value and isinstance(value, bool):
        return False
    if type_str == ParamType.NUMBER.value and isinstance(value, bool):
        return False
    return isinstance(value, expected)


def _resolve_type(schema: ParamSchema) -> list[str]:
    """Return a flat list of type strings from a schema's type field."""
    t = schema.type
    if t is None:
        return []
    if isinstance(t, list):
        return [x.value if isinstance(x, ParamType) else str(x) for x in t]
    return [t.value if isinstance(t, ParamType) else str(t)]


# ---------------------------------------------------------------------------
# Core recursive validator
# ---------------------------------------------------------------------------

def _validate_value(
    value: Any,
    schema: ParamSchema,
    path: str,
    result: ValidationResult,
) -> None:
    """
    Recursively validate *value* against *schema*, appending errors to *result*.
    """
    # --- anyOf ---
    if schema.any_of:
        if not any(_passes(value, s) for s in schema.any_of):
            result.add_error(path, f"value does not match any of the anyOf schemas")
        return

    # --- oneOf ---
    if schema.one_of:
        matches = sum(1 for s in schema.one_of if _passes(value, s))
        if matches != 1:
            result.add_error(path, f"value must match exactly one oneOf schema (matched {matches})")
        return

    # --- allOf ---
    if schema.all_of:
        for i, sub in enumerate(schema.all_of):
            _validate_value(value, sub, f"{path}[allOf/{i}]", result)

    # --- Type check ---
    types = _resolve_type(schema)
    if types:
        if not any(_type_matches(value, t) for t in types):
            result.add_error(
                path,
                f"expected type {'|'.join(types)}, got {type(value).__name__!r}"
            )
            return  # no point checking constraints if type is wrong

    # --- Enum ---
    if schema.enum is not None and value not in schema.enum:
        result.add_error(path, f"value {value!r} not in enum {schema.enum}")
        return

    # --- Type-specific constraints ---
    if isinstance(value, str):
        _validate_string(value, schema, path, result)
    elif isinstance(value, bool):
        pass  # no constraints beyond type
    elif isinstance(value, (int, float)):
        _validate_number(value, schema, path, result)
    elif isinstance(value, list):
        _validate_array(value, schema, path, result)
    elif isinstance(value, dict):
        _validate_object(value, schema, path, result)


def _passes(value: Any, schema: ParamSchema) -> bool:
    """Return True if value passes schema with no errors (used for anyOf/oneOf)."""
    tmp = ValidationResult(valid=True)
    _validate_value(value, schema, "", tmp)
    return tmp.valid


def _validate_string(
    value: str, schema: ParamSchema, path: str, result: ValidationResult
) -> None:
    if schema.min_length is not None and len(value) < schema.min_length:
        result.add_error(path, f"string length {len(value)} < minLength {schema.min_length}")
    if schema.max_length is not None and len(value) > schema.max_length:
        result.add_error(path, f"string length {len(value)} > maxLength {schema.max_length}")
    if schema.pattern is not None:
        try:
            if not re.search(schema.pattern, value):
                result.add_error(path, f"string {value!r} does not match pattern {schema.pattern!r}")
        except re.error as exc:
            result.add_warning(f"invalid pattern at {path}: {exc}")


def _validate_number(
    value: int | float, schema: ParamSchema, path: str, result: ValidationResult
) -> None:
    if schema.minimum is not None and value < schema.minimum:
        result.add_error(path, f"value {value} < minimum {schema.minimum}")
    if schema.maximum is not None and value > schema.maximum:
        result.add_error(path, f"value {value} > maximum {schema.maximum}")


def _validate_array(
    value: list, schema: ParamSchema, path: str, result: ValidationResult
) -> None:
    if schema.min_items is not None and len(value) < schema.min_items:
        result.add_error(path, f"array length {len(value)} < minItems {schema.min_items}")
    if schema.max_items is not None and len(value) > schema.max_items:
        result.add_error(path, f"array length {len(value)} > maxItems {schema.max_items}")
    if schema.items is not None:
        for i, item in enumerate(value):
            _validate_value(item, schema.items, f"{path}[{i}]", result)


def _validate_object(
    value: dict, schema: ParamSchema, path: str, result: ValidationResult
) -> None:
    # Required properties
    for req in (schema.required or []):
        if req not in value:
            result.add_error(path, f"missing required property {req!r}")

    # Validate present properties against their schemas
    if schema.properties:
        for prop_name, prop_schema in schema.properties.items():
            if prop_name in value:
                _validate_value(
                    value[prop_name],
                    prop_schema,
                    f"{path}.{prop_name}" if path else prop_name,
                    result,
                )

    # additionalProperties = False → reject unknown keys
    if schema.additional_properties is False and schema.properties:
        known = set(schema.properties)
        for key in value:
            if key not in known:
                result.add_error(path, f"additional property {key!r} not allowed")

    # additionalProperties is a schema → validate each unknown key against it
    if isinstance(schema.additional_properties, ParamSchema) and schema.properties:
        known = set(schema.properties)
        for key, val in value.items():
            if key not in known:
                _validate_value(
                    val,
                    schema.additional_properties,
                    f"{path}.{key}" if path else key,
                    result,
                )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

class ToolCallValidator:
    """
    Validates tool call arguments against a ToolDef's parameter schema.

    Usage
    -----
        validator = ToolCallValidator()
        result = validator.validate(tool, {"city": "London", "units": "kelvin"})
        if not result.valid:
            for err in result.errors:
                print(err.path, err.message)
    """

    def validate(
        self,
        tool: ToolDef,
        args: dict[str, Any],
    ) -> ValidationResult:
        """
        Validate *args* against *tool*'s parameter schema.

        Parameters
        ----------
        tool : The tool definition containing the parameter schema.
        args : The argument dict supplied in the tool call.

        Returns
        -------
        ValidationResult with .valid, .errors, and .warnings.
        """
        result = ValidationResult(valid=True)
        _validate_value(args, tool.parameters, "args", result)
        return result

    def validate_many(
        self,
        tool: ToolDef,
        calls: list[dict[str, Any]],
    ) -> list[ValidationResult]:
        """Validate a batch of argument dicts against the same tool."""
        return [self.validate(tool, args) for args in calls]

    def is_valid(self, tool: ToolDef, args: dict[str, Any]) -> bool:
        """Convenience: return True/False without building the full result."""
        return self.validate(tool, args).valid


# Module-level convenience
_default_validator = ToolCallValidator()

def validate(tool: ToolDef, args: dict[str, Any]) -> ValidationResult:
    """Module-level shortcut for ToolCallValidator().validate(tool, args)."""
    return _default_validator.validate(tool, args)
