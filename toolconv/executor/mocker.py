"""
executor/mocker.py — generate realistic fake tool-call results.

The mocker never calls a real API.  Instead it synthesises plausible return
values by combining three signals (in priority order):

  1. Semantic name hints  — parameter / field names like "email", "price",
                            "user_id", "latitude" map to specific Faker providers.
  2. JSON-Schema type     — falls back to the declared ParamType when no name
                            hint matches.
  3. Schema structure     — recursively mocks object / array schemas.

Special cases
-------------
  • Error mocking  — pass error=True to get a structured error payload instead
                     of a success result (used by RETRY pattern).
  • Partial results — pass partial=True to return an incomplete object
                      (some fields omitted), modelling a real-world partial
                      success.
"""

from __future__ import annotations

import random
import uuid
from typing import Any

from faker import Faker

from toolconv.registry.models import ParamSchema, ParamType, ToolDef


# ---------------------------------------------------------------------------
# Semantic name → Faker provider mapping
# ---------------------------------------------------------------------------

# Keys are lowercased substrings matched against field names.
# Values are callables that take a Faker instance and return a value.
_NAME_HINTS: list[tuple[str, Any]] = [
    # Identity
    ("user_id",     lambda f: str(uuid.uuid4())),
    ("order_id",    lambda f: f"ORD-{f.numerify('######')}"),
    ("product_id",  lambda f: f"PROD-{f.numerify('######')}"),
    ("cart_id",     lambda f: f"CART-{f.numerify('######')}"),
    ("session_id",  lambda f: str(uuid.uuid4())),
    ("_id",         lambda f: str(uuid.uuid4())),
    ("id",          lambda f: str(uuid.uuid4())),
    ("uuid",        lambda f: str(uuid.uuid4())),
    ("slug",        lambda f: f.slug()),
    # People
    ("first_name",  lambda f: f.first_name()),
    ("last_name",   lambda f: f.last_name()),
    ("full_name",   lambda f: f.name()),
    ("name",        lambda f: f.name()),
    ("username",    lambda f: f.user_name()),
    ("handle",      lambda f: f"@{f.user_name()}"),
    # Contact
    ("email",       lambda f: f.email()),
    ("phone",       lambda f: f.phone_number()),
    ("mobile",      lambda f: f.phone_number()),
    # Location
    ("address",     lambda f: f.address()),
    ("street",      lambda f: f.street_address()),
    ("city",        lambda f: f.city()),
    ("state",       lambda f: f.state()),
    ("country",     lambda f: f.country()),
    ("zip",         lambda f: f.postcode()),
    ("postal",      lambda f: f.postcode()),
    ("latitude",    lambda f: float(f.latitude())),
    ("longitude",   lambda f: float(f.longitude())),
    ("lat",         lambda f: float(f.latitude())),
    ("lon",         lambda f: float(f.longitude())),
    ("lng",         lambda f: float(f.longitude())),
    # Finance
    ("price",       lambda f: round(random.uniform(0.99, 999.99), 2)),
    ("amount",      lambda f: round(random.uniform(1.00, 5000.00), 2)),
    ("total",       lambda f: round(random.uniform(1.00, 5000.00), 2)),
    ("balance",     lambda f: round(random.uniform(0.00, 10000.00), 2)),
    ("currency",    lambda f: f.currency_code()),
    ("discount",    lambda f: round(random.uniform(0.0, 0.5), 2)),
    # Dates / times
    ("timestamp",   lambda f: f.iso8601()),
    ("created_at",  lambda f: f.iso8601()),
    ("updated_at",  lambda f: f.iso8601()),
    ("date",        lambda f: f.date()),
    ("time",        lambda f: f.time()),
    ("duration",    lambda f: random.randint(1, 3600)),
    # Web / tech
    ("url",         lambda f: f.url()),
    ("uri",         lambda f: f.uri()),
    ("domain",      lambda f: f.domain_name()),
    ("ip",          lambda f: f.ipv4()),
    ("token",       lambda f: f.sha256()[:32]),
    ("api_key",     lambda f: f.sha256()),
    ("hash",        lambda f: f.sha256()),
    ("version",     lambda f: f.numerify("#.#.#")),
    # Content
    ("title",       lambda f: f.sentence(nb_words=4).rstrip(".")),
    ("description", lambda f: f.sentence(nb_words=12)),
    ("summary",     lambda f: f.sentence(nb_words=8)),
    ("body",        lambda f: f.paragraph()),
    ("message",     lambda f: f.sentence()),
    ("text",        lambda f: f.sentence()),
    ("content",     lambda f: f.paragraph()),
    ("query",       lambda f: f.sentence(nb_words=5)),
    ("keyword",     lambda f: f.word()),
    ("tag",         lambda f: f.word()),
    ("category",    lambda f: f.word()),
    # Status / flags
    ("status",      lambda f: random.choice(["active", "inactive", "pending", "completed"])),
    ("state",       lambda f: random.choice(["open", "closed", "processing"])),
    ("enabled",     lambda f: random.choice([True, False])),
    ("active",      lambda f: True),
    ("verified",    lambda f: True),
    ("count",       lambda f: random.randint(0, 100)),
    ("total_count", lambda f: random.randint(0, 1000)),
    ("page",        lambda f: random.randint(1, 20)),
    ("limit",       lambda f: random.choice([10, 20, 50, 100])),
    ("score",       lambda f: round(random.uniform(0.0, 1.0), 4)),
    ("rating",      lambda f: round(random.uniform(1.0, 5.0), 1)),
]


def _match_hint(field_name: str, fake: Faker, rng: random.Random) -> tuple[bool, Any]:
    """
    Try each name hint in order; return (True, value) on first match.
    Matching is substring-based on the lowercased field name.
    """
    lower = field_name.lower()
    for hint, provider in _NAME_HINTS:
        if hint in lower:
            # Hints that use random.* need the seeded rng
            val = provider(fake)
            # Re-apply rng for numeric hints that used module-level random
            if isinstance(val, float) and hint in ("price", "amount", "total", "balance", "discount", "score", "rating"):
                lo, hi = {
                    "price": (0.99, 999.99), "amount": (1.0, 5000.0),
                    "total": (1.0, 5000.0),  "balance": (0.0, 10000.0),
                    "discount": (0.0, 0.5),  "score": (0.0, 1.0),
                    "rating": (1.0, 5.0),
                }.get(hint, (0.0, 100.0))
                val = round(rng.uniform(lo, hi), 4 if hint == "score" else 2)
            return True, val
    return False, None


# ---------------------------------------------------------------------------
# Core value generator
# ---------------------------------------------------------------------------

def _mock_value(
    field_name: str,
    schema: ParamSchema | None,
    fake: Faker,
    rng: random.Random,
    depth: int = 0,
) -> Any:
    """
    Recursively generate a mock value for one field.

    Priority: name hint → schema type → generic string.
    depth caps recursion at 3 levels.
    """
    # 1. Name-hint (highest priority)
    matched, value = _match_hint(field_name, fake, rng)
    if matched:
        return value

    if schema is None or depth > 3:
        return fake.word()

    # Normalise type to a single ParamType (or None)
    raw_type = schema.type
    if isinstance(raw_type, list):
        raw_type = raw_type[0] if raw_type else None
    type_str = raw_type.value if isinstance(raw_type, ParamType) else (str(raw_type) if raw_type else None)

    # 2. Enum
    if schema.enum:
        return rng.choice(schema.enum)

    # 3. anyOf / oneOf — pick one branch
    if schema.any_of or schema.one_of:
        branch = rng.choice(schema.any_of or schema.one_of)
        return _mock_value(field_name, branch, fake, rng, depth)

    # 4. Dispatch by type
    if type_str == ParamType.OBJECT.value:
        return _mock_object(schema, fake, rng, depth + 1)

    if type_str == ParamType.ARRAY.value:
        items_schema = schema.items
        length = rng.randint(
            schema.min_items or 1,
            min(schema.max_items or 5, 5),
        )
        return [_mock_value(field_name, items_schema, fake, rng, depth + 1) for _ in range(length)]

    if type_str == ParamType.BOOLEAN.value:
        return rng.choice([True, False])

    if type_str == ParamType.INTEGER.value:
        lo = int(schema.minimum or 0)
        hi = int(schema.maximum or 100)
        return rng.randint(lo, hi)

    if type_str == ParamType.NUMBER.value:
        lo = schema.minimum or 0.0
        hi = schema.maximum or 100.0
        return round(rng.uniform(lo, hi), 2)

    if type_str == ParamType.NULL.value:
        return None

    # STRING or unknown
    if schema.pattern:
        return fake.bothify(text="??##??##")
    min_l = schema.min_length or 3
    max_l = schema.max_length or 40
    return fake.bothify("?" * min(max_l, 20))


def _mock_object(schema: ParamSchema, fake: Faker, rng: random.Random, depth: int) -> dict[str, Any]:
    """Generate a dict for an object schema, respecting required vs optional."""
    if not schema.properties:
        return {}

    result: dict[str, Any] = {}
    required = set(schema.required or [])

    for prop_name, prop_schema in schema.properties.items():
        # Always include required fields; include optional 70% of the time
        if prop_name in required or rng.random() < 0.7:
            result[prop_name] = _mock_value(prop_name, prop_schema, fake, rng, depth)

    return result


# ---------------------------------------------------------------------------
# ToolMocker — public interface
# ---------------------------------------------------------------------------

class ToolMocker:
    """
    Generates realistic fake results for tool calls.

    Parameters
    ----------
    seed : RNG seed for reproducible outputs.
    """

    def __init__(self, seed: int | None = None) -> None:
        self._seed = seed
        self._rng = random.Random(seed)
        self._fake = Faker()

    # ------------------------------------------------------------------
    # Primary API
    # ------------------------------------------------------------------

    def mock_result(
        self,
        tool: ToolDef,
        call_args: dict[str, Any] | None = None,
        error: bool = False,
        partial: bool = False,
    ) -> dict[str, Any]:
        """
        Generate a fake result for one tool call.

        Parameters
        ----------
        tool      : The tool whose return schema we mock against.
        call_args : The arguments passed in the tool call (unused for now;
                    reserved for future argument-conditional mocking).
        error     : If True, return a structured error payload instead.
        partial   : If True, omit some fields to simulate partial success.

        Returns
        -------
        A dict representing the tool's JSON response.
        """
        # Reseed Faker from the instance rng so two ToolMocker(seed=N) instances
        # produce identical sequences regardless of interleaving.
        Faker.seed(self._rng.randint(0, 2**32))

        if error:
            return self._mock_error(tool)

        if tool.returns is not None:
            base_result = _mock_value(tool.name, tool.returns, self._fake, self._rng)
        else:
            # Infer a plausible return object from the tool's own parameters
            base_result = self._infer_return(tool)

        # Echo inputs first, then overlay generated fields for any missing keys
        if isinstance(base_result, dict):
            result: Any = dict(call_args or {})
            result.update({k: v for k, v in base_result.items() if k not in result})
        else:
            result = base_result

        if partial and isinstance(result, dict) and len(result) > 1:
            # Drop ~half the keys to simulate partial response
            keys = list(result.keys())
            keep = self._rng.sample(keys, max(1, len(keys) // 2))
            result = {k: result[k] for k in keep}

        return {"result": result, "status": "success", "tool": tool.name}

    def mock_args(
        self,
        tool: ToolDef,
        override: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Generate plausible fake *input* arguments for a tool call.

        Parameters
        ----------
        tool     : The tool whose parameter schema we mock against.
        override : Key-value pairs that replace generated values.

        Returns
        -------
        A dict of argument name → value.
        """
        args = _mock_object(tool.parameters, self._fake, self._rng, depth=0)
        if override:
            args.update(override)
        return args

    # ------------------------------------------------------------------
    # Error / partial helpers
    # ------------------------------------------------------------------

    def _mock_error(self, tool: ToolDef) -> dict[str, Any]:
        error_codes = [400, 401, 403, 404, 422, 429, 500, 503]
        messages = [
            "Invalid input parameter.",
            "Resource not found.",
            "Permission denied.",
            "Rate limit exceeded. Please retry after 60 seconds.",
            "Internal server error.",
            "Service temporarily unavailable.",
            "Validation failed: required field missing.",
        ]
        return {
            "result": None,
            "status": "error",
            "tool": tool.name,
            "error": {
                "code": self._rng.choice(error_codes),
                "message": self._rng.choice(messages),
                "request_id": str(uuid.uuid4()),
            },
        }

    def _infer_return(self, tool: ToolDef) -> Any:
        """
        When no `returns` schema exists, synthesise a plausible result dict
        by echoing / transforming the tool's own parameter names.
        """
        fake = self._fake
        result: dict[str, Any] = {}

        # Always include a canonical id
        result["id"] = str(uuid.uuid4())

        # Mirror each parameter with a generated value
        for param_name in tool.param_names():
            matched, value = _match_hint(param_name, fake, self._rng)
            result[param_name] = value if matched else fake.word()

        # Add a timestamp
        result["created_at"] = fake.iso8601()
        return result
