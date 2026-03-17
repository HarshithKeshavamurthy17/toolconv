# toolconv

**toolconv** is an offline-first synthetic data generator that produces realistic multi-turn conversations in which an AI assistant calls sequences of tools (APIs) to complete user tasks. Each generated conversation is written as a single JSON record to a JSONL dataset file and satisfies hard structural requirements: ≥ 3 tool calls, ≥ 2 distinct tools, well-formed message roles, chain-consistent slot values, and correct metadata. The pipeline is fully deterministic when run without an LLM API key — an MD5-based offline stub is used automatically — and integrates with Anthropic Claude or OpenAI GPT-4 when a key is present. Corpus memory (backed by mem0ai) lets each subsequent planner call see summaries of already-generated conversations, steering the dataset toward greater topical and structural diversity over time.

---

## Installation

```bash
pip install -e ".[dev]"
```

Requires Python ≥ 3.10.

---

## Setup

```bash
cp .env.example .env
# Edit .env and set at least one of:
#   ANTHROPIC_API_KEY=sk-ant-...
#   OPENAI_API_KEY=sk-...
#   LLM_PROVIDER=anthropic   # or openai
```

Without an API key the pipeline runs in **offline stub mode** — fully deterministic, no network traffic, useful for testing.

---

## Getting ToolBench data into `data/raw/`

[ToolBench](https://github.com/OpenBMB/ToolBench) distributes tool definitions as JSON files.

```bash
# Option A — clone and copy
git clone https://github.com/OpenBMB/ToolBench.git /tmp/toolbench
cp -r /tmp/toolbench/data/toolenv/tools/ data/raw/

# Option B — download a single category
mkdir -p data/raw/
curl -L "https://huggingface.co/datasets/ToolBench/ToolBench/resolve/main/data/toolenv/tools/Finance/..." \
     -o data/raw/finance_tools.json
```

toolconv accepts any `.json` (single object or array) or `.jsonl` file containing tool definitions in OpenAI function-call format, Anthropic tool_use format, or plain `{name, description, parameters}` dicts.

---

## End-to-end run

```bash
# 1. Build registry + dependency graph from raw tool definitions
toolconv build \
  --input   data/raw/ \
  --registry data/processed/registry.json \
  --graph    data/processed/graph.pkl \
  --provider toolbench

# 2. Generate 50 conversations (corpus memory ON — Run A)
toolconv generate \
  --registry data/processed/registry.json \
  --graph    data/processed/graph.pkl \
  --output   outputs/run_a.jsonl \
  --n 50 --seed 42

# 3. Generate 50 conversations (corpus memory OFF — Run B)
toolconv generate \
  --registry data/processed/registry.json \
  --graph    data/processed/graph.pkl \
  --output   outputs/run_b.jsonl \
  --n 50 --seed 42 \
  --no-corpus-memory

# 4. Validate both outputs
toolconv validate --input outputs/run_a.jsonl
toolconv validate --input outputs/run_b.jsonl

# 5. Compute diversity metrics and compare
toolconv metrics \
  --input   outputs/run_a.jsonl \
  --compare outputs/run_b.jsonl
```

---

## Running tests

```bash
# Unit tests only (fast, no API key required)
pytest tests/unit/ -v

# End-to-end tests (generates 50 conversations in-memory)
pytest tests/e2e/ -v

# Full suite
pytest tests/ -v
```

All 94 tests pass with no API key via the offline stub.

---

## Project structure

```
toolconv/
  registry/       — ToolDef models, file loader, multi-format normalizer
  graph/          — NetworkX dependency graph builder and chain sampler
  executor/       — ToolMocker (fake results), ToolCallValidator, SlotStore
  memory/         — ScopedMemoryStore interface + mem0ai / in-memory backends
  agents/         — Sampler, Planner, UserProxy, Assistant, Validator agents
  generation/     — Orchestrator, ConversationRecord schema, prompt templates
  metrics/        — Diversity metrics and dataset-level aggregates
  utils/          — LLM provider abstraction (Anthropic / OpenAI / stub)
  cli.py          — Click CLI (build / generate / validate / metrics)
tests/
  unit/           — Registry, memory store, validation unit tests
  e2e/            — Full pipeline test generating ≥ 50 conversations
```
