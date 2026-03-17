"""
toolconv/cli.py — command-line interface.

Commands
--------
  toolconv build     — load tool definitions, build graph, save artefacts
  toolconv generate  — run generation pipeline, write JSONL dataset
  toolconv validate  — verify every record in a JSONL against hard requirements
  toolconv metrics   — compute diversity metrics; optionally compare two runs

Usage examples
--------------
  toolconv build   --input data/raw/  --registry data/processed/registry.json \\
                   --graph   data/processed/graph.pkl

  toolconv generate --registry data/processed/registry.json \\
                    --graph    data/processed/graph.pkl \\
                    --output   outputs/conversations.jsonl \\
                    --n 50 --seed 42

  toolconv generate ... --no-corpus-memory   # diversity experiment run B

  toolconv validate --input outputs/conversations.jsonl

  toolconv metrics  --input outputs/conversations.jsonl
  toolconv metrics  --input outputs/run_a.jsonl --compare outputs/run_b.jsonl
"""

from __future__ import annotations

import json
import logging
import os
import pickle
import sys
from pathlib import Path

import click
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("toolconv")


# ---------------------------------------------------------------------------
# CLI group
# ---------------------------------------------------------------------------

@click.group()
@click.option("--verbose", "-v", is_flag=True, help="Enable debug logging.")
def main(verbose: bool) -> None:
    """toolconv — synthetic tool-call conversation generator."""
    if verbose:
        logging.getLogger().setLevel(logging.DEBUG)


# ---------------------------------------------------------------------------
# build
# ---------------------------------------------------------------------------

@main.command()
@click.option(
    "--input", "-i", "input_path",
    required=True,
    help="Path to raw tool definitions (file or directory of .json/.jsonl).",
)
@click.option(
    "--registry", "-r", "registry_path",
    default="data/processed/registry.json",
    show_default=True,
    help="Output path for the serialised registry.",
)
@click.option(
    "--graph", "-g", "graph_path",
    default="data/processed/graph.pkl",
    show_default=True,
    help="Output path for the serialised NetworkX graph (.pkl).",
)
@click.option(
    "--provider", default="unknown",
    show_default=True,
    help="Provider label stored on each RegistryEntry.",
)
def build(
    input_path: str,
    registry_path: str,
    graph_path: str,
    provider: str,
) -> None:
    """Load tool definitions, normalise, build dependency graph, save artefacts."""
    from toolconv.graph.builder import ToolGraphBuilder
    from toolconv.registry import ToolRegistry

    click.echo(f"Loading tools from {input_path!r} …")
    reg = ToolRegistry()
    n = reg.load(input_path, provider=provider, recursive=True)
    click.echo(f"  Loaded {n} tools  ({len(reg)} total in registry)")

    if len(reg) == 0:
        click.echo("No tools loaded — check the input path.", err=True)
        sys.exit(1)

    # Save registry
    reg_path = Path(registry_path)
    reg_path.parent.mkdir(parents=True, exist_ok=True)
    entries = [e.tool.model_dump() for e in reg]
    reg_path.write_text(json.dumps(entries, indent=2))
    click.echo(f"  Registry saved → {registry_path}")

    # Build graph
    click.echo("Building dependency graph …")
    builder = ToolGraphBuilder(reg)
    n_edges = builder.infer_edges()
    G = builder.build()
    summary = builder.summary()
    click.echo(
        f"  Graph: {summary['nodes']} nodes, {summary['edges']} edges "
        f"(inferred {n_edges}), density={summary['density']}"
    )

    graph_path_obj = Path(graph_path)
    graph_path_obj.parent.mkdir(parents=True, exist_ok=True)
    with graph_path_obj.open("wb") as fh:
        pickle.dump(G, fh)
    click.echo(f"  Graph saved → {graph_path}")
    click.echo("build complete.")


# ---------------------------------------------------------------------------
# generate
# ---------------------------------------------------------------------------

@main.command()
@click.option(
    "--registry", "-r", "registry_path",
    default="data/processed/registry.json",
    show_default=True,
    help="Path to registry JSON produced by `build`.",
)
@click.option(
    "--graph", "-g", "graph_path",
    default="data/processed/graph.pkl",
    show_default=True,
    help="Path to graph pickle produced by `build`.",
)
@click.option(
    "--output", "-o", "output_path",
    default="outputs/conversations.jsonl",
    show_default=True,
    help="Output JSONL path.",
)
@click.option("--n", "n_conversations", default=50, show_default=True,
              help="Number of conversations to generate.")
@click.option("--seed", default=42, show_default=True, help="Master RNG seed.")
@click.option("--min-tools", default=3, show_default=True,
              help="Minimum tools per conversation.")
@click.option("--max-tools", default=5, show_default=True,
              help="Maximum tools per conversation.")
@click.option("--max-retries", default=3, show_default=True,
              help="Retries per conversation on validation failure.")
@click.option(
    "--corpus-memory/--no-corpus-memory", "corpus_memory_enabled",
    default=True,
    help="Enable/disable corpus memory. Use --no-corpus-memory for diversity experiment run B.",
)
def generate(
    registry_path: str,
    graph_path: str,
    output_path: str,
    n_conversations: int,
    seed: int,
    min_tools: int,
    max_tools: int,
    max_retries: int,
    corpus_memory_enabled: bool,
) -> None:
    """Generate synthetic tool-calling conversations and write to JSONL."""
    import pickle

    from toolconv.generation.orchestrator import GeneratorConfig, Orchestrator
    from toolconv.registry import ToolRegistry
    from toolconv.registry.models import ToolDef

    # Load registry
    reg_p = Path(registry_path)
    if not reg_p.exists():
        click.echo(
            f"Registry not found: {registry_path!r}. Run `toolconv build` first.",
            err=True,
        )
        sys.exit(1)

    reg = ToolRegistry()
    raw_tools = json.loads(reg_p.read_text())
    for raw in raw_tools:
        try:
            tool = ToolDef(**raw)
            from toolconv.registry.models import RegistryEntry
            reg.register(RegistryEntry(tool=tool), overwrite=True)
        except Exception as e:
            logger.debug("Skipping malformed registry entry: %s", e)

    click.echo(f"Loaded registry: {len(reg)} tools")

    # Load graph
    graph_p = Path(graph_path)
    if not graph_p.exists():
        click.echo(
            f"Graph not found: {graph_path!r}. Run `toolconv build` first.",
            err=True,
        )
        sys.exit(1)

    with graph_p.open("rb") as fh:
        G = pickle.load(fh)
    click.echo(f"Loaded graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")

    corpus_label = "ON" if corpus_memory_enabled else "OFF (--no-corpus-memory)"
    click.echo(
        f"Generating {n_conversations} conversations  "
        f"seed={seed}  corpus_memory={corpus_label}"
    )

    cfg = GeneratorConfig(
        n_conversations=n_conversations,
        seed=seed,
        output_path=output_path,
        corpus_memory_enabled=corpus_memory_enabled,
        min_tools=min_tools,
        max_tools=max_tools,
        max_retries=max_retries,
    )
    orch = Orchestrator(reg, G, config=cfg)
    stats = orch.run()

    click.echo("\nDone.")
    click.echo(f"  Written:  {stats.total_written}")
    click.echo(f"  Rejected: {stats.total_rejected}")
    click.echo(f"  Attempts: {stats.total_attempts}")
    click.echo(f"  Acceptance rate: {stats.acceptance_rate:.1%}")
    click.echo(f"  Elapsed: {stats.elapsed_seconds:.1f}s")
    click.echo(f"  Output:  {output_path}")


# ---------------------------------------------------------------------------
# validate
# ---------------------------------------------------------------------------

@main.command()
@click.argument("input_arg", required=False, default=None)
@click.option(
    "--input", "-i", "input_opt",
    default=None,
    help="Path to JSONL file produced by `generate`.",
)
@click.option(
    "--min-tool-calls", default=3, show_default=True,
    help="Minimum required tool calls per conversation.",
)
@click.option(
    "--min-distinct-tools", default=2, show_default=True,
    help="Minimum required distinct tools per conversation.",
)
def validate(
    input_arg: str | None,
    input_opt: str | None,
    min_tool_calls: int,
    min_distinct_tools: int,
) -> None:
    input_path = input_opt or input_arg
    if not input_path:
        raise click.UsageError("Provide the JSONL path as an argument or via --input.")
    """Validate every record in a JSONL file against all hard requirements."""
    from toolconv.agents.validator_agent import ValidatorAgent

    path = Path(input_path)
    if not path.exists():
        click.echo(f"File not found: {input_path!r}", err=True)
        sys.exit(1)

    validator = ValidatorAgent(
        min_tool_calls=min_tool_calls,
        min_distinct_tools=min_distinct_tools,
    )

    total = passed = failed = 0
    failure_counts: dict[str, int] = {}

    with path.open(encoding="utf-8") as fh:
        for lineno, line in enumerate(fh, 1):
            line = line.strip()
            if not line:
                continue
            try:
                record = json.loads(line)
            except json.JSONDecodeError as exc:
                click.echo(f"  Line {lineno}: invalid JSON — {exc}", err=True)
                failed += 1
                continue

            report = validator.validate_record(record)
            total += 1
            if report.passed:
                passed += 1
            else:
                failed += 1
                for f in report.failures:
                    failure_counts[f.name] = failure_counts.get(f.name, 0) + 1
                if total <= 20 or not report.passed:
                    click.echo(
                        f"  FAIL [{report.conversation_id}]: {report.failure_summary}"
                    )

    click.echo(f"\nValidation summary ({input_path}):")
    click.echo(f"  Total:  {total}")
    click.echo(f"  Passed: {passed}")
    click.echo(f"  Failed: {failed}")
    if failure_counts:
        click.echo("  Failure breakdown:")
        for req, cnt in sorted(failure_counts.items(), key=lambda x: -x[1]):
            click.echo(f"    {req}: {cnt}")

    sys.exit(0 if failed == 0 else 1)


# ---------------------------------------------------------------------------
# metrics
# ---------------------------------------------------------------------------

@main.command()
@click.argument("input_arg", required=False, default=None)
@click.argument("compare_arg", required=False, default=None)
@click.option(
    "--input", "-i", "input_opt",
    default=None,
    help="Primary JSONL file (Run A).",
)
@click.option(
    "--compare", "-c", "compare_opt",
    default=None,
    help="Optional second JSONL file (Run B) for side-by-side comparison.",
)
def metrics(
    input_arg: str | None,
    compare_arg: str | None,
    input_opt: str | None,
    compare_opt: str | None,
) -> None:
    input_path = input_opt or input_arg
    compare_path = compare_opt or compare_arg
    if not input_path:
        raise click.UsageError("Provide the primary JSONL path as an argument or via --input.")
    """Compute diversity metrics; optionally compare two runs (A vs B)."""
    from toolconv.metrics.dataset_metrics import compute_dataset_metrics
    from toolconv.metrics.diversity import compute_diversity_metrics

    def load_records(path: str) -> list[dict]:
        records = []
        with Path(path).open(encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if line:
                    try:
                        records.append(json.loads(line))
                    except json.JSONDecodeError:
                        pass
        return records

    records_a = load_records(input_path)
    click.echo(f"\n── Run A: {input_path} ({len(records_a)} records) ──")
    metrics_a = compute_diversity_metrics(records_a)
    dataset_a = compute_dataset_metrics(records_a)
    _print_metrics(metrics_a, dataset_a)

    if compare_path:
        records_b = load_records(compare_path)
        click.echo(f"\n── Run B: {compare_path} ({len(records_b)} records) ──")
        metrics_b = compute_diversity_metrics(records_b)
        dataset_b = compute_dataset_metrics(records_b)
        _print_metrics(metrics_b, dataset_b)

        click.echo("\n── A vs B comparison ──")
        _print_comparison(metrics_a, metrics_b, dataset_a, dataset_b)


def _print_metrics(div: dict, ds: dict) -> None:
    for k, v in {**div, **ds}.items():
        if isinstance(v, float):
            click.echo(f"  {k:<40} {v:.4f}")
        else:
            click.echo(f"  {k:<40} {v}")


def _print_comparison(div_a: dict, div_b: dict, ds_a: dict, ds_b: dict) -> None:
    all_keys = list({**div_a, **ds_a}.keys())
    combined_a = {**div_a, **ds_a}
    combined_b = {**div_b, **ds_b}
    click.echo(f"  {'Metric':<40} {'Run A':>10}  {'Run B':>10}  {'Delta':>10}")
    click.echo("  " + "-" * 72)
    for k in all_keys:
        va = combined_a.get(k, "N/A")
        vb = combined_b.get(k, "N/A")
        if isinstance(va, float) and isinstance(vb, float):
            delta = vb - va
            click.echo(f"  {k:<40} {va:>10.4f}  {vb:>10.4f}  {delta:>+10.4f}")
        else:
            click.echo(f"  {k:<40} {str(va):>10}  {str(vb):>10}")


if __name__ == "__main__":
    main()
