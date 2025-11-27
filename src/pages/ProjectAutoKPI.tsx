import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Brain,
  BarChart3,
  Code,
  Database,
  Zap,
  TrendingUp,
  Shield,
  CheckCircle2,
  Target,
  Cpu,
  Layers,
  Activity,
  Monitor,
  FileText,
  Download,
  Sparkles,
  LineChart,
  PieChart,
  Search,
  Filter,
  Settings,
  Eye,
  Lightbulb,
  Rocket,
} from 'lucide-react';

export default function ProjectAutoKPI() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-0 size-[800px] -translate-x-1/2 rounded-full bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-violet-500/5 blur-3xl" aria-hidden="true" />
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
                <span className="rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-purple-200">
                  Case Study
                </span>
                <Link
                  to="/"
                  className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-200 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1720]"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Back
                </Link>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">AutoKPI</h1>
              <p className="text-lg text-neutral-300 max-w-3xl">
                AI-powered analytics toolkit that automatically generates 100+ KPIs, SQL queries, visualizations, and dashboard exports from any dataset. Transform your data into compelling stories and actionable insights in seconds with zero manual configuration. Production-ready deployment with beautiful dark theme UI and comprehensive chart explanations.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {['Data Analytics', 'KPI Generation', 'Automation', 'Streamlit', 'Python', 'Pandas', 'Visualization', 'Business Intelligence'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="pt-4">
                <a
                  href="https://autokpi-hk-app.streamlit.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-purple-700 transition-all hover:scale-105 shadow-lg shadow-purple-600/25"
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
              icon: <Sparkles className="size-5 text-purple-300" aria-hidden="true" />,
              title: 'KPI Generation',
              value: '100+ KPIs',
              subtitle: 'Automatically generated from any dataset',
              extra: 'Covers aggregation, time-series, statistical, and creative KPIs.',
            },
            {
              icon: <Database className="size-5 text-blue-300" aria-hidden="true" />,
              title: 'Architecture',
              value: 'Modular Design',
              subtitle: 'Production-ready codebase',
              extra: 'Clean structure with comprehensive error handling and documentation.',
            },
            {
              icon: <BarChart3 className="size-5 text-pink-300" aria-hidden="true" />,
              title: 'Visualizations',
              value: '10+ chart types',
              subtitle: 'Interactive charts with detailed explanations',
              extra: 'Bar, line, histogram, box plot, Pareto, correlation heatmaps.',
            },
            {
              icon: <Rocket className="size-5 text-violet-300" aria-hidden="true" />,
              title: 'Deployment',
              value: '24/7 Uptime',
              subtitle: 'Streamlit Cloud with monitoring',
              extra: 'Production-ready with Uptime Robot integration.',
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
                <Target className="size-6 text-purple-400" aria-hidden="true" />
                Problem
              </h2>
              <div className="space-y-4 text-neutral-300 leading-relaxed">
                <p>
                  Data analysts and business intelligence professionals spend significant time manually creating KPIs, writing SQL queries, and building visualizations for each new dataset. This process is repetitive, time-consuming, and prone to human error. Key challenges include:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><span className="font-semibold text-white">Time-intensive manual work</span>: Creating KPIs, SQL queries, and charts for each dataset takes hours or days</li>
                  <li><span className="font-semibold text-white">Inconsistent analysis</span>: Different analysts may create different KPIs for the same dataset, leading to inconsistent insights</li>
                  <li><span className="font-semibold text-white">Limited creativity</span>: Analysts often focus on basic metrics (SUM, AVG, COUNT) and miss advanced patterns like seasonality, anomalies, and Pareto distributions</li>
                  <li><span className="font-semibold text-white">Poor chart explanations</span>: Visualizations are created but not explained, making it difficult for stakeholders to understand insights</li>
                  <li><span className="font-semibold text-white">Export complexity</span>: Manually creating dashboard specs for BI tools (Power BI, Tableau, Looker) is tedious and error-prone</li>
                  <li><span className="font-semibold text-white">Lack of data quality checks</span>: Datasets are analyzed without first assessing data quality, leading to incorrect insights</li>
                  <li><span className="font-semibold text-white">No storytelling</span>: Data insights are presented as raw numbers without narrative context or business recommendations</li>
                </ul>
                <p className="font-medium text-purple-200">
                  We wanted to create a one-click solution that automatically generates comprehensive analytics, KPIs, visualizations, and exports—transforming any dataset into actionable insights with beautiful storytelling in seconds.
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
                <Code className="size-5 text-purple-400" aria-hidden="true" />
                Tech stack
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Frontend</p>
                  <ul className="space-y-1.5">
                    {['Streamlit', 'Custom CSS', 'Altair', 'Plotly'].map((tech) => (
                      <li key={tech} className="flex items-start gap-2 text-sm text-neutral-200">
                        <CheckCircle2 className="size-4 text-purple-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span>{tech}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Backend</p>
                  <ul className="space-y-1.5">
                    {['Python 3.12', 'Pandas', 'NumPy', 'SciPy'].map((tech) => (
                      <li key={tech} className="flex items-start gap-2 text-sm text-neutral-200">
                        <CheckCircle2 className="size-4 text-purple-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span>{tech}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Deployment</p>
                  <ul className="space-y-1.5">
                    {['Streamlit Cloud', 'Uptime Robot', 'GitHub'].map((tech) => (
                      <li key={tech} className="flex items-start gap-2 text-sm text-neutral-200">
                        <CheckCircle2 className="size-4 text-purple-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span>{tech}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="mt-4 text-xs text-neutral-400 italic">
                Chosen for rapid development, beautiful visualizations, and seamless cloud deployment with zero infrastructure management.
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
            <Zap className="size-6 text-purple-400" aria-hidden="true" />
            Solution
          </h2>

          {/* 1. Automatic Schema Inference */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Search className="size-5 text-purple-300" aria-hidden="true" />
              1. Automatic Schema Inference
            </h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <p>
                Built intelligent column type detection that automatically identifies ID columns, datetime columns, categorical variables, numeric fields, and text columns. The system uses pattern recognition to handle various data formats and edge cases.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Detection Capabilities:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li><span className="font-semibold text-white">ID Columns</span>: Detects unique identifiers and primary keys</li>
                    <li><span className="font-semibold text-white">Datetime Columns</span>: Recognizes various date/time formats</li>
                    <li><span className="font-semibold text-white">Categorical</span>: Identifies discrete categories and enums</li>
                    <li><span className="font-semibold text-white">Numeric</span>: Detects integers, floats, and continuous variables</li>
                    <li><span className="font-semibold text-white">Text</span>: Identifies free-form text fields</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Intelligent Features:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Pattern recognition for datetime formats</li>
                    <li>Handles CSV and Excel files</li>
                    <li>Automatic data type conversion</li>
                    <li>Missing value detection</li>
                    <li>Cardinality analysis for categoricals</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Data Quality Assessment */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="size-5 text-purple-300" aria-hidden="true" />
              2. Data Quality Assessment
            </h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <p>
                Implemented comprehensive data quality checks that run automatically before analysis, ensuring reliable insights and flagging potential data issues.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Quality Checks:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li><span className="font-semibold text-white">Completeness</span>: Missing value analysis per column</li>
                    <li><span className="font-semibold text-white">Uniqueness</span>: Duplicate detection and validation</li>
                    <li><span className="font-semibold text-white">Consistency</span>: Data format and type validation</li>
                    <li><span className="font-semibold text-white">Quality Score</span>: Overall data quality rating</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Reporting:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Detailed quality reports with recommendations</li>
                    <li>Visual indicators (good/warning/critical)</li>
                    <li>Per-column quality metrics</li>
                    <li>Actionable improvement suggestions</li>
                    <li>Data profiling statistics</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Advanced Analytics */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Brain className="size-5 text-purple-300" aria-hidden="true" />
              3. Advanced Analytics
            </h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <p>
                Built a comprehensive analytics engine that goes beyond basic statistics to provide deep insights into data patterns, relationships, and anomalies.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Statistical Analysis:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Mean, median, mode, percentiles</li>
                    <li>Standard deviation and variance</li>
                    <li>Skewness and kurtosis</li>
                    <li>Min/max/range analysis</li>
                    <li>Distribution shape detection</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Advanced Features:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li><span className="font-semibold text-white">Correlation Analysis</span>: Heatmaps showing variable relationships</li>
                    <li><span className="font-semibold text-white">Trend Detection</span>: Statistical significance testing</li>
                    <li><span className="font-semibold text-white">Outlier Detection</span>: Z-score and IQR methods</li>
                    <li><span className="font-semibold text-white">Distribution Analysis</span>: Pareto, skewness, variability</li>
                    <li><span className="font-semibold text-white">Pattern Recognition</span>: Seasonality detection</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Automatic KPI Generation */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="size-5 text-purple-300" aria-hidden="true" />
              4. Automatic KPI Generation (100+ KPIs)
            </h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <p>
                The core feature that automatically generates 30-100+ relevant KPIs from any dataset, covering all major categories and including creative insights beyond basic metrics.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Standard KPIs:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li><span className="font-semibold text-white">Aggregation</span>: SUM, AVG, COUNT, MIN, MAX, MEDIAN</li>
                    <li><span className="font-semibold text-white">Time-Series</span>: Per day/month/year (intelligent granularity)</li>
                    <li><span className="font-semibold text-white">Category Breakdowns</span>: KPIs grouped by categories</li>
                    <li><span className="font-semibold text-white">Statistical</span>: Percentiles, ratios, growth rates</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Creative KPIs:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li><span className="font-semibold text-white">Anomaly Detection</span>: Statistical outliers</li>
                    <li><span className="font-semibold text-white">Pattern Detection</span>: Weekly/monthly seasonality</li>
                    <li><span className="font-semibold text-white">Comparative Analysis</span>: Top vs bottom performers</li>
                    <li><span className="font-semibold text-white">Distribution Analysis</span>: Pareto (80/20), concentration</li>
                    <li><span className="font-semibold text-white">Trend Analysis</span>: Growth/decline detection</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-lg bg-purple-500/10 border border-purple-400/20">
                <p className="text-sm text-purple-200">
                  <span className="font-semibold">Smart Time Detection:</span> Automatically detects if datetime column is year-only and generates "per Year" instead of "per Day" KPIs, ensuring relevant time granularity.
                </p>
              </div>
            </div>
          </div>

          {/* 5. Intelligent Chart Explanations */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Eye className="size-5 text-purple-300" aria-hidden="true" />
              5. Intelligent Chart Explanations
            </h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <p>
                Every visualization includes comprehensive explanations that help users understand what they're seeing, why it matters, and what actions to take.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Explanation Components:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li><span className="font-semibold text-white">What This Chart Shows</span>: Clear description</li>
                    <li><span className="font-semibold text-white">What the Numbers Mean</span>: Context and interpretation</li>
                    <li><span className="font-semibold text-white">How to Read This Chart</span>: Step-by-step guide</li>
                    <li><span className="font-semibold text-white">Strategic Implications</span>: Business recommendations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Additional Features:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Written summaries of numerical data</li>
                    <li>Performance gaps and opportunities</li>
                    <li>Actionable next steps</li>
                    <li>Storytelling format for better understanding</li>
                    <li>Natural language insights</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Interactive Visualizations */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="size-5 text-purple-300" aria-hidden="true" />
              6. Interactive Visualizations
            </h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <p>
                Built 10+ chart types with interactive features, hover tooltips, and beautiful styling that matches the dark theme design.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Chart Types:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Bar charts (aggregations, comparisons)</li>
                    <li>Line charts (trends, time series)</li>
                    <li>Histograms (distributions)</li>
                    <li>Box plots (anomaly detection)</li>
                    <li>Pareto charts (80/20 analysis)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Advanced Charts:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Correlation heatmaps</li>
                    <li>Comparative charts with benchmarks</li>
                    <li>Time-series with trend lines</li>
                    <li>Category breakdowns</li>
                    <li>All with interactive hover tooltips</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 7. Auto-Generated Insights */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="size-5 text-purple-300" aria-hidden="true" />
              7. Auto-Generated Insights
            </h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <p>
                Transforms raw data into compelling narratives with natural language insights, business recommendations, and actionable next steps.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Insight Types:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Natural language insights</li>
                    <li>Business recommendations</li>
                    <li>Key findings summaries</li>
                    <li>Actionable next steps</li>
                    <li>Creative ideas and recommendations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Format:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Storytelling format for better understanding</li>
                    <li>Context-aware explanations</li>
                    <li>Performance highlights</li>
                    <li>Opportunity identification</li>
                    <li>Risk indicators</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 8. SQL Query Generation */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Code className="size-5 text-purple-300" aria-hidden="true" />
              8. SQL Query Generation
            </h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <p>
                Automatically generates human-readable SQL queries for each KPI, ready to use in BI tools and databases.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Features:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Human-readable SQL syntax</li>
                    <li>Database-agnostic (MySQL, PostgreSQL, SQL Server, SQLite)</li>
                    <li>Ready-to-use in BI tools</li>
                    <li>One query per KPI</li>
                    <li>Collapsible by default (expandable on demand)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Use Cases:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Power BI data models</li>
                    <li>Tableau data sources</li>
                    <li>Looker explores</li>
                    <li>Custom dashboards</li>
                    <li>Database views</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 9. Export Options */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Download className="size-5 text-purple-300" aria-hidden="true" />
              9. Export Options
            </h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <p>
                Multiple export formats that make it easy to integrate AutoKPI insights into existing BI tools and workflows.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">JSON Export:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Complete KPI definitions</li>
                    <li>Metadata included</li>
                    <li>Structured format</li>
                    <li>API-ready</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Markdown Export:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Formatted documentation</li>
                    <li>Readable format</li>
                    <li>GitHub-friendly</li>
                    <li>Documentation-ready</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Dashboard Spec:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Power BI ready</li>
                    <li>Tableau ready</li>
                    <li>Looker ready</li>
                    <li>BI tool configuration</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 10. Beautiful Dark Theme UI */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Monitor className="size-5 text-purple-300" aria-hidden="true" />
              10. Beautiful Dark Theme UI
            </h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <p>
                Designed a professional dark theme with custom CSS, animated gradients, and modern UI elements.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Design Elements:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Black background (#000000)</li>
                    <li>Purple/pink gradient accents</li>
                    <li>Glowing effects on interactive elements</li>
                    <li>Animated gradients on headers</li>
                    <li>Modern cards with hover effects</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">UX Features:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Step-by-step workflow (8 steps)</li>
                    <li>Auto-expanded creative KPIs</li>
                    <li>Collapsible technical details</li>
                    <li>Reset functionality</li>
                    <li>Responsive design</li>
                  </ul>
                </div>
              </div>
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
            <Layers className="size-6 text-purple-400" aria-hidden="true" />
            Architecture
          </h2>
          <div className="bg-white/5 rounded-lg p-6 overflow-x-auto">
            <pre className="text-sm text-neutral-300 font-mono whitespace-pre-wrap">
              {`User Uploads Dataset
(CSV, Excel)

    ↓

Automatic Schema Inference
- Column type detection
- Pattern recognition
- Data type conversion

    ↓

Data Quality Assessment
- Completeness checks
- Uniqueness validation
- Consistency checks
- Quality scoring

    ↓

Advanced Analytics Engine
- Statistical analysis
- Correlation analysis
- Trend detection
- Outlier detection
- Distribution analysis

    ↓

Automatic KPI Generation
(30-100+ KPIs)
- Aggregation KPIs
- Time-series KPIs
- Category breakdowns
- Creative KPIs
- Pattern detection

    ↓

Visualization Generation
- 10+ chart types
- Interactive charts
- Detailed explanations
- Storytelling format

    ↓

SQL Query Generation
- Human-readable SQL
- Database-agnostic
- BI tool ready

    ↓

Export Options
- JSON Export
- Markdown Export
- Dashboard Spec
(Power BI, Tableau, Looker)

    ↓

Streamlit Web Application
- Beautiful dark theme UI
- Interactive interface
- Real-time processing
- 24/7 uptime monitoring`}
            </pre>
          </div>
        </motion.section>

        {/* Key Features Table */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="size-5 text-purple-400" aria-hidden="true" />
            Key Features & Capabilities
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-neutral-300 font-semibold">Feature</th>
                  <th className="text-left py-3 px-4 text-neutral-300 font-semibold">Description</th>
                  <th className="text-left py-3 px-4 text-neutral-300 font-semibold">Technical Implementation</th>
                </tr>
              </thead>
              <tbody className="text-neutral-300">
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-semibold text-white">Automatic Schema Inference</td>
                  <td className="py-3 px-4">Detects ID, datetime, categorical, numeric, text columns</td>
                  <td className="py-3 px-4 text-sm">Pattern recognition, data type detection, format handling</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-semibold text-white">Data Quality Assessment</td>
                  <td className="py-3 px-4">Completeness, uniqueness, consistency checks with scoring</td>
                  <td className="py-3 px-4 text-sm">Pandas validation, quality metrics, detailed reports</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-semibold text-white">Advanced Analytics</td>
                  <td className="py-3 px-4">Statistical analysis, correlation, trends, outliers, distributions</td>
                  <td className="py-3 px-4 text-sm">NumPy, SciPy, statistical methods, heatmaps</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-semibold text-white">KPI Generation</td>
                  <td className="py-3 px-4">30-100+ KPIs automatically generated</td>
                  <td className="py-3 px-4 text-sm">Modular KPI engine, intelligent time detection, pattern recognition</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-semibold text-white">Chart Explanations</td>
                  <td className="py-3 px-4">Comprehensive explanations for every visualization</td>
                  <td className="py-3 px-4 text-sm">Template-based explanations, context-aware descriptions</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-semibold text-white">Interactive Visualizations</td>
                  <td className="py-3 px-4">10+ chart types with hover tooltips</td>
                  <td className="py-3 px-4 text-sm">Altair, Plotly, interactive charts, dark theme styling</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-semibold text-white">Auto-Generated Insights</td>
                  <td className="py-3 px-4">Natural language insights and business recommendations</td>
                  <td className="py-3 px-4 text-sm">Template-based storytelling, context-aware narratives</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Export Options</td>
                  <td className="py-3 px-4">JSON, Markdown, Dashboard Spec for BI tools</td>
                  <td className="py-3 px-4 text-sm">Multiple export formats, BI tool integration</td>
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
            <TrendingUp className="size-6 text-purple-400" aria-hidden="true" />
            Impact & Outcomes
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Technical Achievements:</h3>
              <ul className="list-disc list-inside space-y-2 text-neutral-300 ml-4">
                <li><span className="font-semibold text-white">Comprehensive KPI Generation</span>: Automatically generates 30-100+ KPIs covering all major categories</li>
                <li><span className="font-semibold text-white">Advanced Analytics Engine</span>: Correlation analysis, trend detection, outlier detection, distribution analysis</li>
                <li><span className="font-semibold text-white">Beautiful Dark Theme UI</span>: Custom CSS with animated gradients and professional design</li>
                <li><span className="font-semibold text-white">Detailed Chart Explanations</span>: Comprehensive explanations for every chart with context and recommendations</li>
                <li><span className="font-semibold text-white">Production-Ready Deployment</span>: Deployed on Streamlit Cloud with 24/7 uptime monitoring via Uptime Robot</li>
                <li><span className="font-semibold text-white">Export Capabilities</span>: Multiple export formats (JSON, Markdown, Dashboard Spec) ready for BI tools</li>
                <li><span className="font-semibold text-white">Large Dataset Handling</span>: Tested with 50,000+ rows, optimized for performance</li>
                <li><span className="font-semibold text-white">Intelligent Features</span>: Smart time detection, pattern recognition, anomaly detection, comparative analysis</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Real-World Application:</h3>
              <ul className="list-disc list-inside space-y-2 text-neutral-300 ml-4">
                <li><span className="font-semibold text-white">Data Analysts</span>: Quick insights from any dataset in seconds</li>
                <li><span className="font-semibold text-white">Data Scientists</span>: Exploratory data analysis and KPI discovery</li>
                <li><span className="font-semibold text-white">Business Analysts</span>: KPI monitoring and performance metrics</li>
                <li><span className="font-semibold text-white">Product Managers</span>: Feature performance analysis and insights</li>
                <li><span className="font-semibold text-white">Marketing/Sales Teams</span>: Campaign performance and revenue metrics</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Key Differentiators:</h3>
              <ul className="list-disc list-inside space-y-2 text-neutral-300 ml-4">
                <li><span className="font-semibold text-white">Comprehensive Explanations</span>: Every chart has detailed explanations with context</li>
                <li><span className="font-semibold text-white">Creative KPIs</span>: Goes beyond basic metrics to find patterns and anomalies</li>
                <li><span className="font-semibold text-white">Storytelling Format</span>: Data insights presented as narratives</li>
                <li><span className="font-semibold text-white">Zero Configuration</span>: Works out of the box with any dataset</li>
                <li><span className="font-semibold text-white">Production-Ready</span>: Fully deployed and monitored</li>
                <li><span className="font-semibold text-white">Beautiful UI</span>: Professional dark theme design</li>
                <li><span className="font-semibold text-white">Multiple Exports</span>: Ready for BI tools (Power BI, Tableau, Looker)</li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Project Statistics */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="size-5 text-purple-400" aria-hidden="true" />
            Project Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'KPI Categories', value: '12+ categories' },
              { label: 'Chart Types', value: '10+ types' },
              { label: 'Export Formats', value: '3 formats' },
              { label: 'Example Datasets', value: '3 included' },
              { label: 'Uptime', value: '24/7 monitoring' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-purple-300 mb-1">{stat.value}</p>
                <p className="text-xs text-neutral-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Deployment */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Rocket className="size-5 text-purple-400" aria-hidden="true" />
            Deployment
          </h2>
          <div className="space-y-4 text-neutral-300">
            <div>
              <p className="font-semibold text-white mb-2">Platform:</p>
              <p>Streamlit Community Cloud</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">Status:</p>
              <p>Live and accessible with 24/7 uptime monitoring</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">URL:</p>
              <a
                href="https://autokpi-hk-app.streamlit.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-300 hover:text-purple-200 underline"
              >
                https://autokpi-hk-app.streamlit.app
              </a>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">Monitoring:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Uptime Robot integration (pings every 5 minutes)</li>
                <li>Automatic error detection and alerts</li>
                <li>Performance monitoring</li>
                <li>24/7 availability tracking</li>
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
          className="rounded-2xl border border-purple-400/20 bg-purple-500/5 p-6 text-center"
        >
          <h3 className="text-xl font-semibold text-white mb-3">AutoKPI</h3>
          <p className="text-sm text-neutral-300 mb-2">
            A comprehensive data analytics toolkit demonstrating production-level automation, visualization, and deployment practices.
          </p>
          <p className="text-xs text-neutral-400 mb-4">
            Built with Python, Streamlit, Pandas, and Altair. Deployed on Streamlit Cloud. Open source and available for data analysts, data scientists, and business intelligence professionals.
          </p>
          <p className="text-xs text-neutral-500 leading-relaxed">
            This project showcases end-to-end data analytics automation: from automatic schema inference and data quality assessment through KPI generation, visualization, and export. It demonstrates how comprehensive features, beautiful UI design, and production-ready deployment combine to create a powerful, accessible analytics tool that transforms any dataset into actionable insights.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <a
              href="https://autokpi-hk-app.streamlit.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-2 text-sm font-bold text-white hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/25"
            >
              <Zap className="size-4" />
              Live Demo
            </a>
            <a
              href="https://github.com/HarshithKeshavamurthy17/AutoKPI"
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

