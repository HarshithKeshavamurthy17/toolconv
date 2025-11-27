import { CaseLayout } from './CaseLayout';
import { Button } from '../../components/ui/button';

export function VIGraphRAG() {
  return (
    <CaseLayout
      title="VI-Graph-RAG"
      summary="Graph-aware retrieval augmented generation pipeline powering faster CVE triage and analyst Q&A across multi-vendor advisories."
      timeline="2024"
      caseRole="Lead ML Engineer"
      slug="vi-graph-rag"
      tags={['RAG', 'Graph', 'Security']}
      sections={{
        problem: (
          <div className="space-y-3">
            <p>
              Security analysts were drowning in duplicated CVE writeups, inconsistent CWE mappings,
              and ad-hoc ticket notes. The team needed a single triage assistant that could unify
              vulnerability metadata, surface related weaknesses, and answer remediation questions
              in context.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Correlate CVE → CWE relationships across noisy vendor advisory feeds.</li>
              <li>
                Support conversational triage so analysts could ask impact and remediation
                questions.
              </li>
              <li>Shorten time-to-first-action (MTTR proxy) without degrading precision.</li>
            </ul>
          </div>
        ),
        data: (
          <div className="space-y-3">
            <p>Primary sources feeding the graph and retrieval index:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>National Vulnerability Database CVEs (2002–2024) delivered as JSON feeds.</li>
              <li>Common Weakness Enumeration XML exports updated quarterly.</li>
              <li>Vendor advisory texts (Red Hat, Microsoft, VMware) scraped and normalized.</li>
            </ul>
            <p>
              All artifacts were normalized to internal identifiers and versioned inside an
              ingestion lake (Delta tables) before being projected into Neo4j and FAISS.
            </p>
          </div>
        ),
        approach: (
          <div className="space-y-3">
            <p>
              Hybrid retrieval workflow blending dense embeddings, reranking, and graph traversal:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>BGE-large-en embeddings for paragraph-level chunks (768-dim).</li>
              <li>
                FAISS HNSW index tuned for <code>efSearch=128</code> to balance latency and recall.
              </li>
              <li>
                Cross-Encoder (ms-marco-MiniLM-L-6-v2) reranking top-50 hits down to actionable
                top-10.
              </li>
              <li>
                Graph-RAG expansion across Neo4j using <code>:INDICATES_WEAKNESS_IN</code> and
                vendor adjacency edges to surface related CVEs/CWEs.
              </li>
              <li>
                FastAPI service orchestrating retrieval and answer synthesis; Streamlit UI for
                analyst workflows.
              </li>
            </ul>
          </div>
        ),
        architecture: (
          <div className="space-y-3">
            <ol className="list-decimal space-y-2 pl-6">
              <li>
                Ingestion jobs normalize CVE, CWE, and advisory feeds into a Delta-backed staging
                area.
              </li>
              <li>
                Embedding workers chunk documents (350 tokens, 40-token overlap) and push vectors
                into FAISS.
              </li>
              <li>Query path hits FAISS → top-50 results reranked by cross-encoder.</li>
              <li>
                Top reranked nodes seed Cypher traversal (2–3 hops) across{' '}
                <code>:INDICATES_WEAKNESS_IN</code> edges.
              </li>
              <li>
                Response composer synthesizes findings with templated reasoning and citation
                snippets.
              </li>
            </ol>
            <p className="text-xs text-muted-foreground">
              Deployed on Azure Kubernetes Service with Redis caching for embeddings and rerank
              payloads.
            </p>
          </div>
        ),
        decisions: (
          <div className="space-y-3">
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Settled on 350-token chunk size after ablations balancing context coherence and
                latency.
              </li>
              <li>Normalized CVE/CWE IDs to internal UUIDs to dedupe aliases from vendor feeds.</li>
              <li>
                Evaluation harness tracked precision@k / recall@k on curated triage questions.
              </li>
              <li>
                Latency budget &lt; 1.2s at P95; enforced via FAISS search params and async Cypher
                limits.
              </li>
            </ul>
          </div>
        ),
        results: (
          <div className="space-y-3">
            <ul className="list-disc space-y-2 pl-6">
              <li>Precision@5 improved from 0.42 → 0.68 on analyst benchmark set.</li>
              <li>Median MTTR proxy (time-to-first-action) dropped by 36% in pilot teams.</li>
              <li>
                Avoided costly brute-force reranking by caching FAISS hits and sharing graph
                traversals.
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Trade-off: cross-encoder reranking added ~180ms per query but delivered materially
              better precision.
            </p>
          </div>
        ),
        improvements: (
          <div className="space-y-3">
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Boost entity linking for vendor-specific identifiers (e.g., RHSA IDs) feeding the
                graph.
              </li>
              <li>Ablate E5-large embeddings for higher recall while monitoring latency.</li>
              <li>
                Introduce cached rerank results for frequent CVE patterns to shave additional 120ms.
              </li>
            </ul>
          </div>
        ),
        links: (
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href="https://github.com/harinik/vi-graph-rag" target="_blank" rel="noreferrer">
                View Code
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="https://harinik.dev/demos/vi-graph-rag" target="_blank" rel="noreferrer">
                See Demo
              </a>
            </Button>
            <Button asChild variant="ghost">
              <a
                href="https://harinik.dev/files/vi-graph-rag-one-pager.pdf"
                target="_blank"
                rel="noreferrer"
              >
                One-Pager PDF
              </a>
            </Button>
          </div>
        ),
      }}
    />
  );
}

export default VIGraphRAG;
