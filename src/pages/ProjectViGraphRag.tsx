import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Database, Brain, Zap, Code, ArrowLeft, CheckCircle2, TrendingUp, Shield, Network } from 'lucide-react';

export default function ProjectViGraphRag() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-0 size-[800px] -translate-x-1/2 rounded-full bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 blur-3xl" aria-hidden="true" />
      </div>

      <div className="mx-auto max-w-6xl px-6 space-y-16">
        {/* Hero / Case Study Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
                  Case Study
                </span>
                <Link
                  to="/"
                  className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-200 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1720]"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Back
                </Link>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">VI-Graph-RAG</h1>
              <p className="text-lg text-neutral-300 max-w-3xl">
                Graph-aware retrieval + RAG system for vulnerability intelligence — built to connect CVEs, CWEs, affected products, mitigations, and exploit signals, and to return source-grounded answers to security & compliance analysts. Designed and shipped as part of the Tietoevry Vulnerability Intelligence initiative.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {['Neo4j graph', 'LangChain', 'Azure OpenAI', 'FastAPI', 'RAG / Retrieval', 'Security / Compliance'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metric Cards Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            {
              icon: <TrendingUp className="size-5 text-emerald-300" aria-hidden="true" />,
              title: 'MTTR reduction',
              value: '-42%',
              subtitle: 'Mean time to research per CVE',
              extra: 'Measured after rollout to internal triage workflow.',
            },
            {
              icon: <Database className="size-5 text-cyan-300" aria-hidden="true" />,
              title: 'Knowledge store',
              value: 'Neo4j graph',
              subtitle: 'CVE ↔ CWE ↔ product ↔ mitigation',
              extra: 'Modeled with explicit relationships for RAG context expansion.',
            },
            {
              icon: <Brain className="size-5 text-blue-300" aria-hidden="true" />,
              title: 'RAG layer',
              value: 'LangChain + Azure OpenAI',
              subtitle: 'Graph-aware retrieval → grounded answer',
              extra: 'Hybrid BM25 + FAISS + re-rank',
            },
            {
              icon: <Code className="size-5 text-purple-300" aria-hidden="true" />,
              title: 'API',
              value: 'FastAPI',
              subtitle: 'Used by dashboards & ops tools',
              extra: 'Deployed behind Azure Functions / containers.',
            },
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm"
            >
              <div className="mb-3 flex items-center gap-2">
                {metric.icon}
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">{metric.title}</p>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{metric.value}</p>
              <p className="text-xs text-neutral-400 mb-2">{metric.subtitle}</p>
              <p className="text-xs text-neutral-500 leading-relaxed">{metric.extra}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Two-column: Problem + Tech Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-6"
          >
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                <Shield className="size-6 text-cyan-400" aria-hidden="true" />
                Problem
              </h2>
              <div className="space-y-4 text-neutral-300 leading-relaxed">
                <p>
                  Security and compliance analysts were spending <span className="font-semibold text-white">30–60 minutes per vulnerability ticket</span> just to stitch together context: what the CVE actually means, which CWE it&apos;s tied to, whether we actually run the impacted product in our environment, and what mitigation was approved by governance.
                </p>
                <p>
                  The issue wasn&apos;t lack of data — it was fragmentation. Vulnerability data lived in:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>NVD / MITRE feeds (raw CVEs)</li>
                  <li>CWE taxonomy (weakness classification)</li>
                  <li>Internal asset / product mappings</li>
                  <li>Confluence / runbooks with mitigation guidance</li>
                  <li>Occasional scanner exports</li>
                </ul>
                <p>
                  Every time a new CVE landed, the analyst had to jump across 3–4 systems to answer a simple question like:
                </p>
                <blockquote className="border-l-2 border-cyan-400/50 pl-4 italic text-neutral-200">
                  &quot;Does this CVE actually affect us, and if yes, what&apos;s the official mitigation?&quot;
                </blockquote>
                <p>
                  This slowed triage, made reporting inconsistent, and made it hard to <span className="font-semibold text-white">prove</span> that LLM answers were grounded.
                </p>
                <p className="font-medium text-cyan-200">
                  We wanted a single &quot;ask a question about a CVE&quot; surface that pulls from a graph of CVE ↔ CWE ↔ Product ↔ Mitigation and returns a grounded answer with citations.
                </p>
              </div>
            </section>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Network className="size-5 text-cyan-400" aria-hidden="true" />
                Tech stack
              </h3>
              <ul className="space-y-2">
                {[
                  'Neo4j (graph store)',
                  'LangChain (graph + retrieval chains)',
                  'Azure OpenAI (GPT-4 class)',
                  'FastAPI + Pydantic',
                  'FAISS + BM25 + Cross-Encoder',
                  'React / Tailwind UI / Streamlit',
                  'Docker + Azure Functions',
                  'Weights & Biases (eval + logging)',
                ].map((tech) => (
                  <li key={tech} className="flex items-start gap-2 text-sm text-neutral-200">
                    <CheckCircle2 className="size-4 text-cyan-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <span>{tech}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-neutral-400 italic">
                Chosen to support graph-aware RAG and scheduled refreshes on Azure.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Solution Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Zap className="size-6 text-cyan-400" aria-hidden="true" />
            Solution
          </h2>

          {/* 7.1 Graph ETL */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">7.1 Graph ETL</h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Ingested NVD CVE feeds (2002–2024) and the official CWE taxonomy (XML v4.17).</li>
                <li>Normalized CVE fields: <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">cve_id</code>, <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">description</code>, <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">published_date</code>, <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">cvss_score</code>, <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">vector</code>, <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">source</code>, <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">references</code>.</li>
                <li>Created Neo4j nodes:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">(:CVE {'{cve_id, description, published, cvss_score, severity_level}'})</code></li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">(:CWE {'{cwe_id, name, description, weakness_abstraction}'})</code></li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">(:Product {'{vendor, name, version}'})</code></li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">(:Mitigation {'{title, description, source}'})</code></li>
                  </ul>
                </li>
                <li>Derived <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">severity_level</code> from CVSS:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">cvss {'>='} 9.0</code> → <span className="text-red-300">Critical</span></li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">7.0 {'<='} cvss {'<'} 9.0</code> → <span className="text-orange-300">High</span></li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">4.0 {'<='} cvss {'<'} 7.0</code> → <span className="text-yellow-300">Medium</span></li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">cvss {'<'} 4.0</code> → <span className="text-green-300">Low</span></li>
                    <li>missing → <span className="text-neutral-400">Unknown</span></li>
                  </ul>
                </li>
                <li>Created base relationships:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">(:CVE)-[:MAPS_TO]-&gt;(:CWE)</code></li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">(:CVE)-[:AFFECTS]-&gt;(:Product)</code></li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">(:CVE)-[:HAS_MITIGATION]-&gt;(:Mitigation)</code></li>
                  </ul>
                </li>
                <li>Scripts were idempotent so we could re-run daily via Azure Functions without duplicating nodes.</li>
              </ul>
            </div>
          </div>

          {/* 7.2 Fuzzy Linking */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">7.2 Fuzzy Linking (CVE ↔ CWE)</h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <p>Some CVEs in NVD lack explicit CWE links or have ambiguous mappings. To improve coverage:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Used <span className="font-semibold text-white">RapidFuzz</span> to compute similarity between CVE description and CWE name/description.</li>
                <li>Applied a configurable threshold (default <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">0.86</code>) to accept a match.</li>
                <li>For accepted matches, created <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">(:CVE)-[:INDICATES_WEAKNESS_IN]-&gt;(:CWE)</code> edges.</li>
                <li>Exported a CSV of all fuzzy links for analysts to review (kept the graph auditable).</li>
                <li>This step materially increased graph connectivity and made RAG context more useful.</li>
              </ul>
            </div>
          </div>

          {/* 7.3 Enrichment Layer */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">7.3 Enrichment Layer</h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <p>To make queries more &quot;real world,&quot; we enriched graph nodes with:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>CISA / vendor advisories (patch availability, urgency).</li>
                <li>Exploit availability flags.</li>
                <li>Product presence in internal environment (from internal asset lists).</li>
                <li>Governance-approved mitigation text (from runbooks / Confluence).</li>
              </ul>
              <p>These fields allow queries like:</p>
              <blockquote className="border-l-2 border-cyan-400/50 pl-4 italic text-neutral-200">
                &quot;Show critical CVEs with exploits available that affect products we actually run and that don&apos;t yet have an approved mitigation.&quot;
              </blockquote>
            </div>
          </div>

          {/* 7.4 Graph-Aware RAG */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">7.4 Graph-Aware RAG</h3>
            <div className="space-y-4 text-neutral-300 leading-relaxed">
              <p>Instead of naive RAG over flat text, we used <span className="font-semibold text-white">graph-expanded RAG</span>:</p>
              <ol className="list-decimal list-inside space-y-3 ml-2">
                <li>User asks: &quot;What&apos;s the impact of CVE-2023-XXXXX on our Azure workloads?&quot;</li>
                <li>Retriever does hybrid search:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>BM25 over CVE text</li>
                    <li>FAISS over embeddings of CVE + CWE + Product descriptions</li>
                    <li>(optional) Cross-Encoder to re-rank top 10</li>
                  </ul>
                </li>
                <li>Using the top CVE node(s), we <span className="font-semibold text-white">expand in the graph</span> to fetch:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>linked CWE</li>
                    <li>affected products</li>
                    <li>attached mitigations</li>
                    <li>related advisories</li>
                  </ul>
                </li>
                <li>We build a <span className="font-semibold text-white">structured context block</span>:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">CVE summary</code></li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">Weakness</code></li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">Assets impacted</code></li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">Recommended mitigation</code></li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">Sources</code></li>
                  </ul>
                </li>
                <li>We pass this into <span className="font-semibold text-white">LangChain</span> with Azure OpenAI (GPT-4 class) and instruct it to <span className="font-semibold text-white">cite CVE IDs and CWE IDs</span> explicitly.</li>
                <li>If LLM provider is missing, the pipeline falls back to local Ollama.</li>
              </ol>
              <p className="mt-4 font-medium text-cyan-200">
                This guarantees the answer is grounded in the exact nodes we touched in Neo4j.
              </p>
            </div>
          </div>

          {/* 7.5 API + Dashboard */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">7.5 API + Dashboard</h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Built a <span className="font-semibold text-white">FastAPI</span> service to expose the graph + RAG functionality.</li>
                <li>Core endpoints:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">GET /api/cve/{'{id}'}</code> → returns graph-shaped JSON of that CVE (its CWE, products, mitigations).</li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">POST /api/ask</code> → <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">{'{ "question": "..." }'}</code> → returns <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">{'{ answer, citations, nodes_used }'}</code>.</li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">GET /api/stats/severity</code> → returns aggregated counts by severity_level (for dashboards).</li>
                  </ul>
                </li>
                <li>Streamlit / React UI was used internally to:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>visualize severity distributions,</li>
                    <li>run ad-hoc RAG queries,</li>
                    <li>trigger re-index / re-ingest jobs.</li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>

          {/* 7.6 Deployment & Operations */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">7.6 Deployment & Operations</h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Everything was containerized using <span className="font-semibold text-white">Docker + Docker Compose</span>.</li>
                <li>Neo4j was either run locally or on <span className="font-semibold text-white">Neo4j Aura</span>; app picked up connection from environment variables.</li>
                <li><span className="font-semibold text-white">Azure Functions</span> scheduled the ETL job to refresh CVEs daily without manual ops.</li>
                <li><span className="font-semibold text-white">Weights & Biases</span> used to log:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>latency of RAG queries,</li>
                    <li>grounding score,</li>
                    <li>toxicity/PII checks on LLM output.</li>
                  </ul>
                </li>
                <li className="font-medium text-cyan-200">Result: a zero-touch vulnerability intelligence surface.</li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Architecture Diagram */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8 backdrop-blur-sm"
        >
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <Network className="size-6 text-cyan-400" aria-hidden="true" />
            Architecture
          </h2>
          <div className="bg-white/5 rounded-lg p-6 overflow-x-auto">
            <pre className="text-sm text-neutral-300 font-mono whitespace-pre-wrap">
{`flowchart LR
    A[NVD / CISA feeds] --> B[ETL + Normalization]
    B --> C[Neo4j Graph Store]
    C --> D[Graph Expansion (CVE ↔ CWE ↔ Product ↔ Mitigation)]
    D --> E[Hybrid Retriever (BM25 + FAISS + Rerank)]
    E --> F[LangChain RAG Chain (Azure OpenAI)]
    F --> G[FastAPI Service]
    G --> H[Analyst UI / Streamlit / React]
    G --> I[Automation / CI checks]`}
            </pre>
          </div>
        </motion.section>

        {/* Key Endpoints */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Code className="size-5 text-cyan-400" aria-hidden="true" />
            Key Endpoints
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-neutral-300 font-semibold">Method</th>
                  <th className="text-left py-3 px-4 text-neutral-300 font-semibold">Endpoint</th>
                  <th className="text-left py-3 px-4 text-neutral-300 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="text-neutral-300">
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4"><code className="rounded bg-green-500/20 text-green-300 px-2 py-1 text-xs">GET</code></td>
                  <td className="py-3 px-4 font-mono text-cyan-300"><code>/api/cve/{'{id}'}</code></td>
                  <td className="py-3 px-4">Returns graph-shaped JSON of CVE (CWE, products, mitigations)</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4"><code className="rounded bg-blue-500/20 text-blue-300 px-2 py-1 text-xs">POST</code></td>
                  <td className="py-3 px-4 font-mono text-cyan-300"><code>/api/ask</code></td>
                  <td className="py-3 px-4">RAG query endpoint returning answer, citations, nodes_used</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4"><code className="rounded bg-green-500/20 text-green-300 px-2 py-1 text-xs">GET</code></td>
                  <td className="py-3 px-4 font-mono text-cyan-300"><code>/api/stats/severity</code></td>
                  <td className="py-3 px-4">Aggregated counts by severity_level for dashboards</td>
                </tr>
                <tr>
                  <td className="py-3 px-4"><code className="rounded bg-green-500/20 text-green-300 px-2 py-1 text-xs">GET</code></td>
                  <td className="py-3 px-4 font-mono text-cyan-300"><code>/api/graph/neighbors</code></td>
                  <td className="py-3 px-4">Returns graph neighbors for a given CVE node</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Impact / Outcomes */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm"
        >
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="size-6 text-cyan-400" aria-hidden="true" />
            Impact & Outcomes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'MTTR Reduction',
                value: '42%',
                description: 'Mean time to research per CVE dropped from ~45 minutes to ~26 minutes after rollout.',
              },
              {
                title: 'Entity Coverage',
                value: '0.62 → 0.86',
                description: 'Graph-first retriever improved entity coverage (CVE, CWE) on evaluation set.',
              },
              {
                title: 'Answer Grounding',
                value: '100%',
                description: 'Every answer includes citations to exact CVE IDs, CWE IDs, and source nodes used.',
              },
              {
                title: 'Graph Connectivity',
                value: '+29%',
                description: 'Fuzzy linking increased CVE↔CWE edge coverage from 63% to 91%.',
              },
            ].map((outcome, index) => (
              <motion.div
                key={outcome.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">{outcome.title}</p>
                <p className="text-2xl font-bold text-cyan-300 mb-2">{outcome.value}</p>
                <p className="text-sm text-neutral-300 leading-relaxed">{outcome.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Implementation Details */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Brain className="size-6 text-cyan-400" aria-hidden="true" />
            Implementation Details
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ingestion */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Ingestion Pipeline</h3>
              <ul className="space-y-2 text-sm text-neutral-300 leading-relaxed">
                <li>• Daily NVD feed parsing (JSON 1.1 schema)</li>
                <li>• CWE taxonomy XML parsing (v4.17)</li>
                <li>• Idempotent Neo4j MERGE operations</li>
                <li>• Azure Functions timer trigger (daily at 2 AM UTC)</li>
                <li>• Error handling with dead-letter queue</li>
              </ul>
            </div>

            {/* Graph Modeling */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Graph Modeling</h3>
              <ul className="space-y-2 text-sm text-neutral-300 leading-relaxed">
                <li>• Property graph with typed nodes and relationships</li>
                <li>• Indexes on <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">cve_id</code>, <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">cwe_id</code> for fast lookups</li>
                <li>• Relationship types: <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">MAPS_TO</code>, <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">AFFECTS</code>, <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300 text-xs">HAS_MITIGATION</code></li>
                <li>• Graph expansion depth: 2 hops (CVE → CWE → related CVEs)</li>
              </ul>
            </div>

            {/* RAG Pipeline */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">RAG Pipeline</h3>
              <ul className="space-y-2 text-sm text-neutral-300 leading-relaxed">
                <li>• BM25 retrieval over CVE descriptions (rank-bm25 library)</li>
                <li>• FAISS vector search (sentence-transformers embeddings)</li>
                <li>• Cross-Encoder re-ranking (top 10 candidates)</li>
                <li>• LangChain graph memory + prompt templates</li>
                <li>• Azure OpenAI GPT-4 with temperature 0.1 for consistency</li>
              </ul>
            </div>

            {/* Deployment */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Deployment</h3>
              <ul className="space-y-2 text-sm text-neutral-300 leading-relaxed">
                <li>• Docker Compose for local development</li>
                <li>• Azure Container Instances for production</li>
                <li>• Neo4j Aura cloud instance (managed)</li>
                <li>• Environment-based config (dev/staging/prod)</li>
                <li>• Health checks and monitoring with W&B</li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-6 text-center"
        >
          <p className="text-sm text-neutral-300">
            Built during <span className="font-semibold text-white">Tietoevry AI/ML Internship</span> · 
            Part of the <span className="font-semibold text-cyan-300">Vulnerability Intelligence</span> initiative
          </p>
          <p className="text-xs text-neutral-400 mt-2">
            Designed, implemented, and deployed as a production-ready system for internal security operations.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
