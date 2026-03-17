"""
tests/unit/test_registry.py — unit tests for ToolRegistry and related models.
"""

from __future__ import annotations

import json
import tempfile
from pathlib import Path

import pytest

from toolconv.registry import ToolRegistry
from toolconv.registry.models import (
    ParamSchema,
    ParamType,
    RegistryEntry,
    ToolDef,
)
from toolconv.registry.normalizer import normalize


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

def _make_tool(
    name: str = "get_weather",
    description: str = "Fetch current weather",
    tags: list[str] | None = None,
    provider: str = "unknown",
    params: dict | None = None,
) -> RegistryEntry:
    """Build a minimal RegistryEntry for tests."""
    props = params or {"location": {"type": "string", "description": "City name"}}
    tool = ToolDef(
        name=name,
        description=description,
        parameters=ParamSchema(
            type=ParamType.OBJECT,
            properties={k: ParamSchema(**v) for k, v in props.items()},
            required=list(props.keys()),
        ),
        tags=tags or ["weather"],
    )
    return RegistryEntry(tool=tool, provider=provider)


# ---------------------------------------------------------------------------
# ToolDef helpers
# ---------------------------------------------------------------------------

class TestToolDef:
    def test_param_names(self):
        entry = _make_tool(params={"city": {"type": "string"}, "units": {"type": "string"}})
        assert set(entry.tool.param_names()) == {"city", "units"}

    def test_required_param_names(self):
        tool = ToolDef(
            name="search",
            description="Search the web",
            parameters=ParamSchema(
                type=ParamType.OBJECT,
                properties={
                    "query": ParamSchema(type=ParamType.STRING),
                    "limit": ParamSchema(type=ParamType.INTEGER),
                },
                required=["query"],
            ),
        )
        assert tool.required_param_names() == ["query"]
        assert tool.optional_param_names() == ["limit"]

    def test_get_param_returns_schema(self):
        entry = _make_tool()
        schema = entry.tool.get_param("location")
        assert schema is not None
        assert schema.type == ParamType.STRING

    def test_get_param_missing_returns_none(self):
        entry = _make_tool()
        assert entry.tool.get_param("nonexistent") is None

    def test_param_names_empty(self):
        tool = ToolDef(name="ping", description="Ping a server")
        assert tool.param_names() == []


# ---------------------------------------------------------------------------
# ToolRegistry — basic CRUD
# ---------------------------------------------------------------------------

class TestToolRegistryCRUD:
    def test_register_and_get(self):
        reg = ToolRegistry()
        entry = _make_tool()
        reg.register(entry)
        assert "get_weather" in reg
        assert reg.get("get_weather") is entry

    def test_get_missing_returns_none(self):
        reg = ToolRegistry()
        assert reg.get("does_not_exist") is None

    def test_require_raises_on_missing(self):
        reg = ToolRegistry()
        with pytest.raises(KeyError):
            reg.require("nonexistent")

    def test_len(self):
        reg = ToolRegistry()
        assert len(reg) == 0
        reg.register(_make_tool("a"))
        reg.register(_make_tool("b"))
        assert len(reg) == 2

    def test_iter(self):
        reg = ToolRegistry()
        e1 = _make_tool("tool_a")
        e2 = _make_tool("tool_b")
        reg.register(e1)
        reg.register(e2)
        names = {e.name for e in reg}
        assert names == {"tool_a", "tool_b"}

    def test_names_sorted(self):
        reg = ToolRegistry()
        reg.register(_make_tool("z_tool"))
        reg.register(_make_tool("a_tool"))
        assert reg.names() == ["a_tool", "z_tool"]

    def test_contains_alias(self):
        reg = ToolRegistry()
        tool = ToolDef(name="send_email", description="Send an email")
        entry = RegistryEntry(tool=tool, aliases=["email", "mail"])
        reg.register(entry)
        assert "email" in reg
        assert "mail" in reg
        assert reg.get("email") is entry

    def test_register_no_overwrite(self):
        reg = ToolRegistry()
        e1 = _make_tool("tool_x")
        e2 = _make_tool("tool_x")
        e2.tool.description  # just verify both exist
        reg.register(e1)
        added = reg.register(e2, overwrite=False)
        assert added is False
        assert reg.get("tool_x") is e1  # original kept

    def test_register_overwrite(self):
        reg = ToolRegistry()
        e1 = _make_tool("tool_x")
        reg.register(e1)
        # Create a new entry with same name but different description
        tool2 = ToolDef(name="tool_x", description="Updated description")
        e2 = RegistryEntry(tool=tool2)
        reg.register(e2, overwrite=True)
        assert reg.get("tool_x").tool.description == "Updated description"


# ---------------------------------------------------------------------------
# ToolRegistry — filtering
# ---------------------------------------------------------------------------

class TestToolRegistryFiltering:
    def setup_method(self):
        self.reg = ToolRegistry()
        self.reg.register(_make_tool("get_weather", tags=["weather", "outdoor"]))
        self.reg.register(_make_tool("get_forecast", tags=["weather"]))
        self.reg.register(_make_tool("get_stock_price", tags=["finance"], provider="openai"))
        self.reg.register(_make_tool("send_email", tags=["communication"], provider="anthropic"))

    def test_by_tag(self):
        results = self.reg.by_tag("weather")
        names = {e.name for e in results}
        assert names == {"get_weather", "get_forecast"}

    def test_by_tag_no_match(self):
        assert self.reg.by_tag("nonexistent") == []

    def test_by_tags_any(self):
        results = self.reg.by_tags(["weather", "finance"], match="any")
        names = {e.name for e in results}
        assert names == {"get_weather", "get_forecast", "get_stock_price"}

    def test_by_tags_all(self):
        results = self.reg.by_tags(["weather", "outdoor"], match="all")
        assert len(results) == 1
        assert results[0].name == "get_weather"

    def test_by_provider(self):
        results = self.reg.by_provider("openai")
        assert len(results) == 1
        assert results[0].name == "get_stock_price"

    def test_search_by_name(self):
        results = self.reg.search("get_weather", field="name")
        names = {e.name for e in results}
        assert "get_weather" in names

    def test_search_by_description(self):
        results = self.reg.search("Fetch current", field="description")
        # All our test tools have "Fetch current weather" description
        assert len(results) >= 1

    def test_tags_aggregate(self):
        all_tags = self.reg.tags()
        assert "weather" in all_tags
        assert "finance" in all_tags

    def test_providers_aggregate(self):
        providers = self.reg.providers()
        assert "openai" in providers
        assert "anthropic" in providers


# ---------------------------------------------------------------------------
# ToolRegistry — sampling
# ---------------------------------------------------------------------------

class TestToolRegistrySampling:
    def test_sample_k(self):
        reg = ToolRegistry()
        for i in range(10):
            reg.register(_make_tool(f"tool_{i}"))
        sampled = reg.sample(3, seed=42)
        assert len(sampled) == 3
        assert len({e.name for e in sampled}) == 3  # no duplicates

    def test_sample_deterministic(self):
        reg = ToolRegistry()
        for i in range(10):
            reg.register(_make_tool(f"tool_{i}"))
        s1 = [e.name for e in reg.sample(5, seed=99)]
        s2 = [e.name for e in reg.sample(5, seed=99)]
        assert s1 == s2

    def test_sample_too_many_raises(self):
        reg = ToolRegistry()
        reg.register(_make_tool("only_one"))
        with pytest.raises(ValueError):
            reg.sample(5)

    def test_sample_tools_returns_tooldef(self):
        reg = ToolRegistry()
        reg.register(_make_tool("weather"))
        tools = reg.sample_tools(1)
        assert all(isinstance(t, ToolDef) for t in tools)


# ---------------------------------------------------------------------------
# ToolRegistry — load from file
# ---------------------------------------------------------------------------

class TestToolRegistryLoad:
    def test_load_json_file(self, tmp_path):
        raw = {
            "name": "search_web",
            "description": "Search the internet",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"}
                },
                "required": ["query"],
            },
        }
        f = tmp_path / "tools.json"
        f.write_text(json.dumps(raw))
        reg = ToolRegistry()
        n = reg.load(str(f))
        assert n == 1
        assert "search_web" in reg

    def test_load_jsonl_file(self, tmp_path):
        tools = [
            {"name": "tool_a", "description": "Tool A",
             "parameters": {"type": "object", "properties": {}, "required": []}},
            {"name": "tool_b", "description": "Tool B",
             "parameters": {"type": "object", "properties": {}, "required": []}},
        ]
        f = tmp_path / "tools.jsonl"
        f.write_text("\n".join(json.dumps(t) for t in tools))
        reg = ToolRegistry()
        n = reg.load(str(f))
        assert n == 2

    def test_load_skips_duplicates(self, tmp_path):
        raw = {"name": "dup", "description": "Duplicate",
               "parameters": {"type": "object", "properties": {}, "required": []}}
        f = tmp_path / "tools.json"
        f.write_text(json.dumps(raw))
        reg = ToolRegistry()
        reg.load(str(f))
        n2 = reg.load(str(f))
        assert n2 == 0     # second load adds 0 new tools
        assert len(reg) == 1

    def test_load_directory_recursive(self, tmp_path):
        sub = tmp_path / "sub"
        sub.mkdir()
        (tmp_path / "a.json").write_text(json.dumps(
            {"name": "tool_top", "description": "Top level",
             "parameters": {"type": "object", "properties": {}, "required": []}}
        ))
        (sub / "b.json").write_text(json.dumps(
            {"name": "tool_sub", "description": "In subdir",
             "parameters": {"type": "object", "properties": {}, "required": []}}
        ))
        reg = ToolRegistry()
        n = reg.load(str(tmp_path), recursive=True)
        assert n == 2


# ---------------------------------------------------------------------------
# Normalizer — smoke test for supported formats
# ---------------------------------------------------------------------------

class TestNormalizer:
    def test_generic_format(self):
        raw = {
            "name": "my_tool",
            "description": "Does something useful",
            "parameters": {
                "type": "object",
                "properties": {
                    "x": {"type": "integer", "description": "Input value"},
                },
                "required": ["x"],
            },
        }
        entry = normalize(raw, provider="custom")
        assert entry.tool.name == "my_tool"
        assert entry.tool.required_param_names() == ["x"]

    def test_openai_wrapped_format(self):
        raw = {
            "type": "function",
            "function": {
                "name": "openai_tool",
                "description": "OpenAI wrapped tool",
                "parameters": {
                    "type": "object",
                    "properties": {"q": {"type": "string"}},
                    "required": ["q"],
                },
            },
        }
        entry = normalize(raw, provider="openai")
        assert entry.tool.name == "openai_tool"

    def test_anthropic_format(self):
        raw = {
            "name": "anthropic_tool",
            "description": "Anthropic-style tool",
            "input_schema": {
                "type": "object",
                "properties": {
                    "city": {"type": "string"},
                },
                "required": ["city"],
            },
        }
        entry = normalize(raw, provider="anthropic")
        assert entry.tool.name == "anthropic_tool"
        assert "city" in entry.tool.param_names()

    def test_register_raw(self):
        reg = ToolRegistry()
        raw = {
            "name": "raw_tool",
            "description": "Registered from raw dict",
            "parameters": {"type": "object", "properties": {}, "required": []},
        }
        added = reg.register_raw(raw)
        assert added is True
        assert "raw_tool" in reg
