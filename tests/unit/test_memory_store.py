"""
tests/unit/test_memory_store.py — unit tests for ScopedInMemoryStore.

Key requirement: scope isolation — entries added to one scope must not
appear when searching a different scope.
"""

from __future__ import annotations

import pytest

from toolconv.memory.mem0_store import ScopedInMemoryStore, make_memory_store


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture()
def store() -> ScopedInMemoryStore:
    return ScopedInMemoryStore()


# ---------------------------------------------------------------------------
# Basic add / search
# ---------------------------------------------------------------------------

class TestBasicAddSearch:
    def test_add_and_search_returns_entry(self, store):
        store.add("flight_id: AA123", scope="session:c1")
        results = store.search("flight_id", scope="session:c1")
        assert len(results) == 1
        assert "flight_id" in results[0]["content"]

    def test_search_empty_store_returns_empty(self, store):
        results = store.search("anything", scope="session:c1")
        assert results == []

    def test_search_no_match_returns_empty(self, store):
        store.add("booking confirmed", scope="session:c1")
        results = store.search("weather", scope="session:c1")
        assert results == []

    def test_search_case_insensitive(self, store):
        store.add("User prefers Celsius units", scope="session:c1")
        results = store.search("celsius", scope="session:c1")
        assert len(results) == 1

    def test_empty_query_returns_all(self, store):
        store.add("entry one", scope="session:c1")
        store.add("entry two", scope="session:c1")
        results = store.search("", scope="session:c1")
        assert len(results) == 2

    def test_search_respects_top_k(self, store):
        for i in range(10):
            store.add(f"item {i}", scope="session:c1")
        results = store.search("item", scope="session:c1", top_k=3)
        assert len(results) == 3

    def test_search_returns_most_recent_first(self, store):
        store.add("first entry", scope="session:c1")
        store.add("second entry", scope="session:c1")
        results = store.search("entry", scope="session:c1")
        assert results[0]["content"] == "second entry"

    def test_result_has_required_keys(self, store):
        store.add("some content", scope="session:c1", metadata={"step": 1})
        result = store.search("some", scope="session:c1")[0]
        assert "id" in result
        assert "content" in result
        assert "metadata" in result
        assert "score" in result

    def test_metadata_stored_and_returned(self, store):
        store.add("tool output", scope="session:c1", metadata={"endpoint": "get_weather"})
        result = store.search("tool output", scope="session:c1")[0]
        assert result["metadata"]["endpoint"] == "get_weather"


# ---------------------------------------------------------------------------
# Scope isolation (critical requirement)
# ---------------------------------------------------------------------------

class TestScopeIsolation:
    def test_session_scope_isolated_from_corpus(self, store):
        """
        Entries added to session scope must NOT appear in corpus scope search.
        """
        store.add(
            "flight_id: AA123 returned from get_flight_status",
            scope="session:conv-001",
        )
        store.add(
            "Tools: get_weather, get_forecast. Domain: travel. Pattern: sequential.",
            scope="corpus",
        )

        # Search for the session-only term in corpus scope → must return empty
        session_in_corpus = store.search("flight_id", scope="corpus")
        assert session_in_corpus == [], (
            "session entry leaked into corpus scope"
        )

        # Search for corpus-only term in session scope → must return empty
        corpus_in_session = store.search("sequential", scope="session:conv-001")
        assert corpus_in_session == [], (
            "corpus entry leaked into session scope"
        )

    def test_different_session_scopes_are_isolated(self, store):
        store.add("conv_001_data", scope="session:conv-001")
        store.add("conv_002_data", scope="session:conv-002")

        results_001 = store.search("conv_001_data", scope="session:conv-002")
        assert results_001 == []

        results_002 = store.search("conv_002_data", scope="session:conv-001")
        assert results_002 == []

    def test_search_in_correct_scope_finds_entry(self, store):
        store.add("unique_token_xyz", scope="session:conv-abc")
        assert store.search("unique_token_xyz", scope="session:conv-abc") != []
        assert store.search("unique_token_xyz", scope="corpus") == []

    def test_multiple_scopes_coexist(self, store):
        store.add("session data", scope="session:c1")
        store.add("corpus data", scope="corpus")
        store.add("other session", scope="session:c2")

        assert len(store.search("data", scope="session:c1")) == 1
        assert len(store.search("data", scope="corpus")) == 1
        assert store.search("data", scope="session:c2") == []


# ---------------------------------------------------------------------------
# Introspection helpers
# ---------------------------------------------------------------------------

class TestIntrospection:
    def test_count_total(self, store):
        store.add("a", scope="s1")
        store.add("b", scope="s1")
        store.add("c", scope="s2")
        assert store.count() == 3

    def test_count_per_scope(self, store):
        store.add("a", scope="s1")
        store.add("b", scope="s1")
        store.add("c", scope="s2")
        assert store.count("s1") == 2
        assert store.count("s2") == 1
        assert store.count("nonexistent") == 0

    def test_scopes(self, store):
        store.add("x", scope="alpha")
        store.add("y", scope="beta")
        assert set(store.scopes()) == {"alpha", "beta"}

    def test_clear_one_scope(self, store):
        store.add("x", scope="alpha")
        store.add("y", scope="beta")
        store.clear("alpha")
        assert store.count("alpha") == 0
        assert store.count("beta") == 1

    def test_clear_all(self, store):
        store.add("x", scope="alpha")
        store.add("y", scope="beta")
        store.clear()
        assert store.count() == 0

    def test_repr(self, store):
        store.add("x", scope="alpha")
        r = repr(store)
        assert "ScopedInMemoryStore" in r


# ---------------------------------------------------------------------------
# make_memory_store factory
# ---------------------------------------------------------------------------

class TestMakeMemoryStore:
    def test_force_inmemory_always_returns_inmemory(self, monkeypatch):
        monkeypatch.setenv("MEM0_ENABLED", "true")
        monkeypatch.setenv("OPENAI_API_KEY", "sk-fake-key")
        store = make_memory_store(force_inmemory=True)
        assert isinstance(store, ScopedInMemoryStore)

    def test_mem0_disabled_env_returns_inmemory(self, monkeypatch):
        monkeypatch.setenv("MEM0_ENABLED", "false")
        store = make_memory_store()
        assert isinstance(store, ScopedInMemoryStore)

    def test_no_api_key_returns_inmemory(self, monkeypatch):
        monkeypatch.delenv("OPENAI_API_KEY", raising=False)
        monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
        monkeypatch.setenv("MEM0_ENABLED", "true")
        store = make_memory_store()
        assert isinstance(store, ScopedInMemoryStore)
