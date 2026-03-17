# DESIGN.md — toolconv Architecture & Design Decisions

## Overview

toolconv is a multi-agent pipeline that generates synthetic multi-turn conversations
in which an AI assistant calls sequences of API tools to complete user tasks. The
conversations are written as JSONL records for use as training/evaluation data for
tool-using language models.

---

## Architecture: Full Pipeline

```
 ┌─────────────────────────────────────────────────────────────────────────┐
 │ toolconv build                                                           │
 │                                                                         │
 │  Raw JSON/JSONL  →  Normalizer  →  ToolRegistry  →  ToolGraphBuilder   │
 │  (ToolBench etc)    (4 formats)     (in-memory)      (NetworkX DiGraph) │
 │                                                                         │
 │  Outputs: registry.json + graph.pkl                                     │
 └───────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │ toolconv generate  (Orchestrator loop — once per conversation)          │
 │                                                                         │
 │  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐  │
 │  │ SamplerAgent │    │ PlannerAgent │    │    UserProxyAgent         │  │
 │  │              │    │              │    │                           │  │
 │  │ Weighted walk│───▶│ LLM prompt   │───▶│ opening message          │  │
 │  │ on DiGraph   │    │ + corpus mem │    │ clarification responses   │  │
 │  │              │    │ → JSON plan  │    │                           │  │
 │  └──────────────┘    └──────────────┘    └────────────┬─────────────┘  │
 │                                                        │                │
 │                                                        ▼                │
 │  ┌───────────────────────────────────────────────────────────────────┐  │
 │  │ AssistantAgent                                                    │  │
 │  │                                                                   │  │
 │  │  For each tool step:                                              │  │
 │  │    1. Search session memory → inject context (grounding)         │  │
 │  │    2. Fill args from SlotStore (${placeholder} → prior output)   │  │
 │  │    3. ToolMocker.mock_result() → deterministic fake response     │  │
 │  │    4. Write output to session memory                             │  │
 │  │    5. Emit pre-call message (LLM) + tool message                 │  │
 │  │  Final: generate summary (LLM)                                   │  │
 │  └────────────────────────────────────┬──────────────────────────────┘  │
 │                                       │                                │
 │                                       ▼                                │
 │  ┌────────────────────┐    ┌──────────────────────────┐               │
 │  │  ValidatorAgent    │    │  ScopedMemoryStore       │               │
 │  │                    │    │                           │               │
 │  │  REQ-1 … REQ-9    │    │  session:{conv_id}        │               │
 │  │  pass → write JSONL│    │  corpus  (cross-conv)    │               │
 │  │  fail → retry      │    │                           │               │
 │  └────────────────────┘    └──────────────────────────┘               │
 └─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │ toolconv validate   Load JSONL → ValidatorAgent.validate_record()       │
 │ toolconv metrics    compute_diversity_metrics() + dataset_metrics()     │
 └─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Design Decisions

### Registry (`toolconv/registry/`)

**Normalizer supports four input formats** — OpenAI function-call wrapped
(`{type: "function", function: {...}}`), Anthropic tool_use (`input_schema`),
bare OpenAI (`{name, description, parameters}`), and a generic fallback — so
ToolBench data (which mixes formats) loads without preprocessing.

**Duplicate handling uses `overwrite=False` by default** in `ToolRegistry.load()`.
Loading the same directory twice is idempotent; only the first definition for a
given name is kept, avoiding accidental clobbers of manually patched entries.

**`ToolDef.param_names()` / `required_param_names()` / `get_param()`** are
accessor helpers that keep the rest of the codebase decoupled from the nested
Pydantic schema structure; agents never walk the raw dict.

---

### Dependency Graph (`toolconv/graph/`)

**NetworkX `DiGraph` with weighted edges** allows both structural queries
(predecessors, successors, longest paths) and probabilistic sampling via
weighted random walks. Edge weight reflects how "natural" one tool is to call
after another.

**Three edge-inference heuristics** are applied:
1. *Name match* — if non-trivial tokens from tool A's name appear as parameter
   names in tool B (e.g. `get_flight` → `flight_id` in `book_flight`), add a
   FEEDS edge.
2. *Tag overlap* — bidirectional edges weighted by Jaccard similarity of tag
   sets; tools in the same domain naturally follow each other.
3. *Return-type match* — if tool A's `returns` schema type matches a required
   parameter type in tool B, add a FEEDS edge.

Combining multiple weak signals (rather than requiring exact name matches)
keeps the graph dense enough for productive random walks even on unfamiliar
tool sets.

---

### Tool Mocker (`toolconv/executor/mocker.py`)

**Faker is re-seeded per `mock_result()` call** using a sub-seed derived from
the instance's `random.Random`, not from the global `Faker.seed()`. This
ensures two `ToolMocker(seed=N)` instances interleaved produce identical
outputs — a correctness requirement for deterministic dataset regeneration.

**50+ semantic field hints** (`_NAME_HINTS`) map common parameter name
substrings to Faker providers, so `flight_id` → realistic alphanumeric code,
`email` → valid-looking email, `city` → real city name. Unrecognised fields
fall back to type-appropriate mock values.

---

### Chain Consistency (`toolconv/executor/state.py`)

**SlotStore uses `${field_name}` placeholders.** After each tool call,
`ConversationState.resolve_call()` stores every top-level output key as a
slot. `_infer_args()` inserts `${key}` placeholders for any parameter whose
name matches an available slot; `fill_args()` replaces them just before the
call is recorded. This guarantees `flight_id` produced by `search_flights`
flows automatically into `book_flight`'s arguments without any tool-specific
wiring code.

---

### Memory (`toolconv/memory/`)

**Two-scope isolation:** `session:{conv_id}` stores tool outputs within one
conversation; `corpus` stores cross-conversation summaries. A `search()` call
in one scope never surfaces entries from another — enforced by passing scope as
`user_id` in mem0ai (which partitions its vector index by user) and by separate
dict buckets in `ScopedInMemoryStore`.

**Only `mem0_store.py` imports mem0.** All other modules depend only on the
`ScopedMemoryStore` ABC (`add` / `search`), making the mem0ai backend fully
swappable. Tests use `ScopedInMemoryStore` with no network or API dependency.

---

### Agents

**SamplerAgent** performs a scored random walk on the graph.
Hop score = `tag_overlap×0.4 + feeds_compat×0.4 + novelty×0.2`.
`feeds_compat` (whether a FEEDS edge exists) dominates, so chains follow
natural data flows. `novelty` penalises revisits, encouraging tool variety.

**PlannerAgent** passes the tool chain, domain, pattern type, and up to five
corpus-memory snippets to the LLM. For `clarify_first` conversations it
injects explicit instructions requiring a clarification step at turn 1. If the
LLM returns unparseable JSON (including offline stub mode), the agent falls
back to a default plan rather than crashing.

**ValidatorAgent** enforces nine hard requirements (REQ-1 … REQ-9) post-hoc.
Failing conversations are retried up to `max_retries` times before being
skipped. Validation is also available standalone via `toolconv validate`.

---

## Corpus Memory & Diversity Analysis

### Metrics chosen and why

| Metric | Why chosen |
|---|---|
| **Jaccard dissimilarity** (avg pairwise 1 − |A∩B|/|A∪B| on tool sets) | Directly measures whether different conversations use different tool combinations. A score near 1 means no two conversations share the same toolset. |
| **Pattern entropy** (Shannon entropy of `pattern_type` distribution) | Measures balance across sequential / parallel / clarify_first. Maximum entropy = perfectly uniform distribution. Skew toward only one pattern would indicate a generation bias. |
| **Domain entropy** (Shannon entropy of `domain` distribution) | Analogous measure for topical diversity. |
| **Distinct-2 tool bigrams** (unique ordered pairs / total pairs) | Borrowed from NLG distinct-n evaluation. Measures sequence-level repetition: a score of 1.0 means every consecutive tool pair appears only once across all conversations. |

These four metrics capture orthogonal dimensions of diversity: *which* tools
are used (Jaccard), *how* the conversation is structured (pattern entropy),
*what topic* it covers (domain entropy), and *in what order* tools are called
(distinct-2).

---

### Experiment results (50 conversations, seed=42, synthetic 10-tool registry)

| Metric | Run A (corpus memory OFF) | Run B (corpus memory ON) | Delta |
|---|---|---|---|
| tool_jaccard_dissimilarity | 0.7298 | 0.7298 | 0.0000 |
| pattern_entropy | 0.9891 | 0.9891 | 0.0000 |
| domain_entropy | 0.8255 | 0.8255 | 0.0000 |
| distinct_2_tool_bigrams | 0.4028 | 0.4028 | 0.0000 |
| avg_tools_per_conversation | 3.88 | 3.88 | 0.0000 |
| acceptance_rate | 90.9 % | 90.9 % | — |
| pattern_distribution | sequential 56%, parallel 24%, clarify_first 20% | sequential 56%, parallel 24%, clarify_first 20% | — |

**Analysis.** In offline stub mode (no LLM API key), both runs produce
identical metrics because the stub selects responses by hashing the prompt with
MD5, and the corpus-memory snippets injected into the planner prompt are
consumed by the same deterministic function rather than by a language model
that can reason about them. The RNG seed (42) is identical across runs, so the
sampler draws the same tool chains in the same order, and the stub planner
always falls back to the same default plan.

With a live LLM provider (Anthropic or OpenAI), the expectation is different:
the planner prompt in Run B includes a block listing the patterns, domains, and
tool combinations already seen. A capable LLM would read these snippets and
favour underrepresented domains and patterns for the next conversation —
analogous to how curriculum learning avoids repeatedly rehearsing easy examples.
Over 50+ conversations this steering effect is expected to raise Jaccard
dissimilarity by approximately 0.05–0.15 and push pattern entropy closer to
its theoretical maximum (≈ 1.099 nats for 3 categories), reducing the tendency
of unconstrained generation to collapse onto a single dominant pattern.

The strong baseline scores in Run A (Jaccard 0.73, pattern entropy 0.99) reflect
the graph-based sampler rather than the LLM: because the tool chain is chosen
by a weighted random walk that explicitly penalises revisiting already-seen
tools (`novelty` term), each conversation naturally draws from a different
region of the tool graph, producing high diversity without any memory mechanism.
Corpus memory's role is therefore to act as a *second layer* of diversity
enforcement — guarding against semantic repetition (same goal phrased
differently) that the structural sampler cannot detect.
