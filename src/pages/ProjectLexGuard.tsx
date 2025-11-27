import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Brain, Zap, Code, ArrowLeft, CheckCircle2, TrendingUp, Scale, FileText, MessageSquare } from 'lucide-react';

export default function ProjectLexGuard() {
    return (
        <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
            {/* Background decoration */}
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute left-1/2 top-0 size-[800px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-900/10 via-indigo-900/10 to-slate-900/10 blur-3xl" aria-hidden="true" />
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
                                <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-blue-200">
                                    Case Study
                                </span>
                                <Link
                                    to="/"
                                    className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-200 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1720]"
                                >
                                    <ArrowLeft className="size-4" aria-hidden="true" />
                                    Back
                                </Link>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white">LexGuard – AI Legal Assistant</h1>
                            <p className="text-lg text-neutral-300 max-w-3xl">
                                Democratizing legal accessibility with Agentic AI and RAG-powered contract analysis. An advanced platform that orchestrates LLMs to perform deep semantic analysis, risk scoring, and interactive Q&A on complex legal documents.
                            </p>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {['FastAPI', 'Streamlit', 'LangChain', 'ChromaDB', 'OpenAI / Ollama', 'NLP'].map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <div className="pt-4">
                                <a
                                    href="https://lexguard-app.streamlit.app/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-600 transition-all hover:scale-105 shadow-lg shadow-blue-500/25"
                                >
                                    <Zap className="size-4" />
                                    Try Live Demo
                                </a>
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
                            icon: <Shield className="size-5 text-emerald-300" aria-hidden="true" />,
                            title: 'Risk Detection',
                            value: 'Automated',
                            subtitle: 'High/Medium/Low Scoring',
                            extra: 'Instantly categorizes clauses with explainable AI reasoning.',
                        },
                        {
                            icon: <Brain className="size-5 text-blue-300" aria-hidden="true" />,
                            title: 'Analysis Depth',
                            value: 'Semantic',
                            subtitle: 'Beyond Keyword Matching',
                            extra: 'Understands context, obligations, and rights.',
                        },
                        {
                            icon: <MessageSquare className="size-5 text-purple-300" aria-hidden="true" />,
                            title: 'Interaction',
                            value: 'Context-Aware',
                            subtitle: 'AI Chat Assistant',
                            extra: 'Answers specific questions about the uploaded contract.',
                        },
                        {
                            icon: <FileText className="size-5 text-cyan-300" aria-hidden="true" />,
                            title: 'Reporting',
                            value: 'Comprehensive',
                            subtitle: 'Executive Summaries',
                            extra: 'Generates detailed reports with actionable tips.',
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
                                <Scale className="size-6 text-blue-400" aria-hidden="true" />
                                The Problem
                            </h2>
                            <div className="space-y-4 text-neutral-300 leading-relaxed">
                                <p>
                                    Legal documents are notoriously dense, complex, and expensive to review. For non-lawyers, signing a contract often means navigating a minefield of legalese where missing a single clause can lead to hidden liabilities or unfavorable terms.
                                </p>
                                <p>
                                    Manual review is slow, error-prone, and often inaccessible to individuals or small businesses who cannot afford expensive legal counsel. The challenge was to build a system that could:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Parse complex legal language into plain English.</li>
                                    <li>Identify potential risks and red flags automatically.</li>
                                    <li>Provide instant, accurate answers to specific questions about the document.</li>
                                </ul>
                                <blockquote className="border-l-2 border-blue-400/50 pl-4 italic text-neutral-200">
                                    &quot;How can we use AI to level the playing field and make expert-level contract analysis accessible to everyone?&quot;
                                </blockquote>
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
                                <Code className="size-5 text-blue-400" aria-hidden="true" />
                                Tech Stack
                            </h3>
                            <ul className="space-y-2">
                                {[
                                    'Python 3.10+',
                                    'FastAPI (Backend)',
                                    'Streamlit (Frontend)',
                                    'LangChain (Orchestration)',
                                    'ChromaDB (Vector Store)',
                                    'OpenAI GPT-4o / Ollama',
                                    'PyPDF2 & Tesseract OCR',
                                    'Poetry & Git',
                                ].map((tech) => (
                                    <li key={tech} className="flex items-start gap-2 text-sm text-neutral-200">
                                        <CheckCircle2 className="size-4 text-blue-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                                        <span>{tech}</span>
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-4 text-xs text-neutral-400 italic">
                                Engineered for performance, scalability, and deep semantic understanding.
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
                        <Zap className="size-6 text-blue-400" aria-hidden="true" />
                        The Solution
                    </h2>

                    {/* Core Architecture */}
                    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
                        <h3 className="text-lg font-semibold text-white mb-4">Core Architecture</h3>
                        <div className="space-y-3 text-neutral-300 leading-relaxed">
                            <p>
                                LexGuard is built as a full-stack application leveraging <strong>FastAPI</strong> for a robust backend and <strong>Streamlit</strong> for a custom-engineered, interactive frontend.
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-2">
                                <li><strong>Hybrid RAG Pipeline:</strong> Utilizes <strong>ChromaDB</strong> for vector storage and semantic search, ensuring that the AI retrieves the most relevant context from the document.</li>
                                <li><strong>LLM Orchestration:</strong> Seamlessly integrates <strong>OpenAI GPT-4o</strong> for high-fidelity analysis and <strong>Ollama</strong> for local, privacy-focused processing.</li>
                                <li><strong>Custom NLP Pipeline:</strong> A specialized pipeline designed for clause classification, entity extraction (parties, dates, monetary values), and automated risk scoring.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Key Features */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
                            <h3 className="text-lg font-semibold text-white mb-4">🛡️ Automated Risk Scoring</h3>
                            <p className="text-neutral-300 leading-relaxed">
                                Instantly categorizes clauses into High, Medium, or Low risk. The system provides explainable AI reasoning for each score, helping users understand <em>why</em> a clause is flagged.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
                            <h3 className="text-lg font-semibold text-white mb-4">🧠 Deep Semantic Analysis</h3>
                            <p className="text-neutral-300 leading-relaxed">
                                Goes beyond simple keyword matching. LexGuard extracts and visualizes Key Terms, Obligations, Rights, and Critical Deadlines in a structured, easy-to-read dashboard.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
                            <h3 className="text-lg font-semibold text-white mb-4">💬 Interactive AI Chat</h3>
                            <p className="text-neutral-300 leading-relaxed">
                                A context-aware legal assistant that allows users to ask specific questions about their contract (e.g., "What happens if I terminate early?") and get grounded answers.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
                            <h3 className="text-lg font-semibold text-white mb-4">📊 Comprehensive Reporting</h3>
                            <p className="text-neutral-300 leading-relaxed">
                                Generates detailed in-app reports including executive summaries, risk heatmaps, and actionable negotiation tips to empower users during contract discussions.
                            </p>
                        </div>
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
                        <TrendingUp className="size-6 text-blue-400" aria-hidden="true" />
                        Impact
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                title: 'Accessibility',
                                value: 'Democratized',
                                description: 'Makes expert-level legal analysis available to non-lawyers.',
                            },
                            {
                                title: 'Efficiency',
                                value: '10x Faster',
                                description: 'Reduces contract review time from hours to minutes.',
                            },
                            {
                                title: 'Clarity',
                                value: 'Enhanced',
                                description: 'Transforms complex legalese into plain, actionable English.',
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
                                <p className="text-2xl font-bold text-blue-300 mb-2">{outcome.value}</p>
                                <p className="text-sm text-neutral-300 leading-relaxed">{outcome.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Footer Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="rounded-2xl border border-blue-400/20 bg-blue-500/5 p-6 text-center"
                >
                    <p className="text-sm text-neutral-300">
                        LexGuard represents a significant step forward in <span className="font-semibold text-white">LegalTech</span>, combining advanced NLP with user-centric design to solve real-world problems.
                    </p>
                    <div className="mt-4 flex justify-center gap-4">
                        <a
                            href="https://lexguard-app.streamlit.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 py-2 text-sm font-bold text-white hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/25"
                        >
                            <Zap className="size-4" />
                            Live Demo
                        </a>
                        <a
                            href="https://github.com/HarshithKeshavamurthy17/lexguard"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2 text-sm font-semibold text-black hover:bg-gray-200 transition-colors"
                        >
                            <Code className="size-4" />
                            View Source
                        </a>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
