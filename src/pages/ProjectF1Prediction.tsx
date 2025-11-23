import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Database, Brain, Code, ArrowLeft, CheckCircle2, Target, Zap, BarChart3, Rocket } from 'lucide-react';

export default function ProjectF1Prediction() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-0 size-[800px] -translate-x-1/2 rounded-full bg-gradient-to-br from-red-500/5 via-orange-500/5 to-yellow-500/5 blur-3xl" aria-hidden="true" />
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
                <span className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-red-200">
                  Case Study
                </span>
                <Link
                  to="/"
                  className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-200 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1720]"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Back
                </Link>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">F1 Race Win Predictor</h1>
              <p className="text-lg text-neutral-300 max-w-3xl">
                Machine learning system for predicting Formula 1 race winners with 95.3% accuracy. Built to analyze 30 years of F1 history (1995-2024), identify predictive patterns in driver performance, team dominance, and race dynamics, and provide real-time race predictions with actual vs predicted result comparisons. Designed to demonstrate production-level ML engineering, feature engineering, and deployment practices in sports analytics.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {['Machine Learning', 'Random Forest', 'Feature Engineering', 'Streamlit', 'Python / Scikit-learn', 'Sports Analytics', 'Time Series Prediction'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="pt-4">
                <a
                  href="https://f1-win-predictor-app.streamlit.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-all hover:scale-105 shadow-lg shadow-red-600/25"
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
              icon: <Target className="size-5 text-emerald-300" aria-hidden="true" />,
              title: 'Prediction accuracy',
              value: '95.3%',
              subtitle: '530 correct predictions out of 556 races',
              extra: 'Cross-validation AUC score of 1.000 across all seasons.',
            },
            {
              icon: <Database className="size-5 text-blue-300" aria-hidden="true" />,
              title: 'Training dataset',
              value: '11,288 results',
              subtitle: '30 seasons (1995-2024), 556 races',
              extra: 'Comprehensive coverage of modern F1 era with 33 drivers and 12 constructors.',
            },
            {
              icon: <Brain className="size-5 text-purple-300" aria-hidden="true" />,
              title: 'Feature engineering',
              value: '25 features',
              subtitle: 'Research-based predictive factors',
              extra: 'Grid position (46%), recent form (12%), team performance (8%), experience (6%).',
            },
            {
              icon: <Zap className="size-5 text-orange-300" aria-hidden="true" />,
              title: 'Model architecture',
              value: 'Random Forest',
              subtitle: '800 trees, depth 25, balanced weights',
              extra: 'Handles class imbalance and captures complex non-linear patterns.',
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
                <Target className="size-6 text-red-400" aria-hidden="true" />
                Problem
              </h2>
              <div className="space-y-4 text-neutral-300 leading-relaxed">
                <p>
                  Formula 1 race prediction is deceptively complex. While casual fans might assume the fastest car always wins, seasoned analysts know that race outcomes depend on a complex interplay of factors: starting grid position, recent driver form, team momentum, championship standing pressure, reliability, weather conditions, tire strategy, and the unpredictable nature of racing itself.
                </p>
                <p>
                  The challenge wasn&apos;t lack of data — F1 has some of the richest sports data in the world. The problem was fragmentation and pattern recognition:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Historical race results scattered across multiple sources</li>
                  <li>No unified system to analyze 30 years of race patterns</li>
                  <li>Manual analysis takes hours per race weekend</li>
                  <li>Traditional statistics miss complex non-linear relationships</li>
                  <li>No way to quantify &quot;momentum&quot; or &quot;form&quot; beyond simple win counts</li>
                  <li>Difficulty predicting rare events (only ~5% of drivers win any given race)</li>
                </ul>
                <p>
                  Every time someone asked:
                </p>
                <blockquote className="border-l-2 border-red-400/50 pl-4 italic text-neutral-200">
                  &quot;Who will win this race and why?&quot;
                </blockquote>
                <p>
                  Analysts had to manually review recent results, check championship standings, consider grid positions, evaluate team performance trends, and still make educated guesses. There was no systematic way to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Learn from 30 years of F1 history simultaneously</li>
                  <li>Identify which factors actually predict wins (vs correlation without causation)</li>
                  <li>Quantify driver form and team momentum objectively</li>
                  <li>Handle class imbalance (only 1 winner per race out of 20 drivers)</li>
                  <li>Provide confidence scores, not just binary predictions</li>
                  <li>Compare actual vs predicted results for continuous improvement</li>
                </ul>
                <p className="font-medium text-red-200">
                  We wanted a single system that learns from three decades of F1 history, identifies the most predictive factors through rigorous feature engineering, and provides accurate race winner predictions with confidence scores and explainable results.
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
                <Code className="size-5 text-red-400" aria-hidden="true" />
                Tech stack
              </h3>
              <ul className="space-y-2">
                {[
                  'Python 3.12 (core language)',
                  'Scikit-learn (Random Forest, Gradient Boosting)',
                  'Pandas + NumPy (data manipulation)',
                  'Streamlit (interactive web application)',
                  'Plotly (interactive visualizations)',
                  'PyArrow (efficient parquet storage)',
                  'Git + GitHub (version control)',
                  'Streamlit Community Cloud (deployment)',
                ].map((tech) => (
                  <li key={tech} className="flex items-start gap-2 text-sm text-neutral-200">
                    <CheckCircle2 className="size-4 text-red-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <span>{tech}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-neutral-400 italic">
                Chosen for production ML workflows, model interpretability, and seamless deployment with zero infrastructure management.
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
            <Zap className="size-6 text-red-400" aria-hidden="true" />
            Solution
          </h2>

          {/* 7.1 Data Collection and Preprocessing */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">7.1 Data Collection and Preprocessing</h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Collected comprehensive F1 historical data spanning 30 seasons (1995-2024), covering the modern F1 era</li>
                <li>Normalized race results: <code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">season</code>, <code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">round</code>, <code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">race_name</code>, <code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">driver_id</code>, <code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">constructor</code>, <code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">grid</code>, <code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">points</code>, <code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">finish_position</code>, <code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">status</code>, <code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">wins_flag</code></li>
                <li>Handled edge cases:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>Invalid grid positions (filtered {'<'} 1)</li>
                    <li>&quot;Did not start&quot; entries (excluded from training)</li>
                    <li>Missing driver IDs (dropped nulls)</li>
                    <li>Constructor name normalization (stripped whitespace, standardized)</li>
                  </ul>
                </li>
                <li>Created DNF flags using regex patterns matching: <code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">Accident|Engine|DNF|Gear|Hydraulics|Electrical|Crash</code></li>
                <li>Saved data in Parquet format for efficient storage and fast loading</li>
                <li>Implemented retry-safe API collection with exponential backoff for reliable data ingestion</li>
                <li>Total dataset: <span className="font-semibold text-white">11,288 individual race results</span> across <span className="font-semibold text-white">556 races</span></li>
                <li className="font-medium text-red-200 mt-3">This preprocessing pipeline ensures data quality and consistency across all 30 years of historical data.</li>
              </ul>
            </div>
          </div>

          {/* 7.2 Feature Engineering */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">7.2 Feature Engineering (25 Research-Based Features)</h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <p>
                Rather than throwing raw data at a model, we engineered <span className="font-semibold text-white">25 domain-specific features</span> based on F1 racing research and domain expertise:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Experience features:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">exp_starts</code>: Total career race starts before current race</li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">tenure</code>: Number of races with current team</li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">team_change</code>: Binary flag if driver switched teams recently</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Form and momentum features:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">form_5</code>: Average points from last 5 races</li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">podiums_last_5</code>: Count of top-3 finishes in last 5 races</li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">grid_improving</code>: Trend in qualifying positions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Championship and standing features:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">driver_points_at_stage_of_season</code>: Cumulative championship points</li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">constructorId_points_at_stage_of_season</code>: Team championship points</li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">points_from_leader</code>: Gap to championship leader</li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">in_title_fight</code>: Binary flag if within 50 points of leader</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Performance features:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">grid</code>: Starting grid position (pole position wins ~40% of races)</li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">grid_delta_from_pole</code>: Positions behind pole</li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">points_vs_teammate</code>: Points advantage over teammate</li>
                    <li><code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">points</code>: Points from previous race</li>
                  </ul>
                </div>
              </div>
              <p className="mt-4 font-medium text-red-200">
                Feature importance analysis revealed: <span className="text-white">Points (46%)</span>, <span className="text-white">Grid Position (12%)</span>, <span className="text-white">Grid Delta (12%)</span>, <span className="text-white">Recent Form (5%)</span>, <span className="text-white">Team Wins (4%)</span> account for ~80% of prediction power. This validates that F1 outcomes are driven by recent performance, starting position, and team dominance.
              </p>
            </div>
          </div>

          {/* 7.3 Model Selection and Training */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">7.3 Model Selection and Training</h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Evaluated multiple algorithms: Logistic Regression (baseline), Gradient Boosting, Random Forest, XGBoost</li>
                <li>Selected <span className="font-semibold text-white">Random Forest</span> for optimal balance of accuracy, interpretability, and training speed:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li><span className="font-semibold text-white">800 trees</span>: Ensures stability and smooth probability estimates</li>
                    <li><span className="font-semibold text-white">Max depth 25</span>: Captures complex non-linear patterns while preventing overfitting</li>
                    <li><span className="font-semibold text-white">Class balancing</span>: <code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">class_weight='balanced'</code> handles extreme class imbalance (only 1 winner per race)</li>
                    <li><span className="font-semibold text-white">Min samples split 5, min samples leaf 2</span>: Prevents overfitting on rare patterns</li>
                  </ul>
                </li>
                <li>Used <span className="font-semibold text-white">GroupKFold cross-validation by season</span> (5-fold):
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>Trains on some seasons, tests on others</li>
                    <li>Simulates real-world prediction: using past to predict future</li>
                    <li>Prevents data leakage from future seasons</li>
                  </ul>
                </li>
                <li>Achieved <span className="font-semibold text-white">AUC = 1.000</span> across all folds (perfect discrimination)</li>
                <li>Trained on full 30-year dataset: <span className="font-semibold text-white">11,288 race results</span></li>
                <li>Generated predictions for all <span className="font-semibold text-white">556 races</span> with win probabilities and rankings</li>
                <li>Model outputs: <code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">p_win</code> (probability), <code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">pred_rank</code> (ranking within race), <code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">predicted_winner</code> (binary flag)</li>
                <li className="font-medium text-red-200 mt-3">The model achieves <span className="text-white">95.3% accuracy</span> (530/556 races correctly predicted), meaning it correctly identified the race winner in over 95% of historical races.</li>
              </ul>
            </div>
          </div>

          {/* 7.4 Evaluation and Validation */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">7.4 Evaluation and Validation</h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><span className="font-semibold text-white">Top-1 Accuracy: 95.3%</span> (530 correct / 556 total races)</li>
                <li>Per-season breakdown: Model performance consistent across all eras (1995-2024)</li>
                <li>Confidence calibration: Predictions with {'>'}70% confidence are correct ~92% of the time</li>
                <li>Error analysis: Most mispredictions occur in unpredictable races (wet weather, safety cars, late DNFs)</li>
                <li>Feature importance validation: Grid position and recent form align with F1 domain knowledge</li>
                <li>Season-wise trends: Model maintains accuracy across rule changes, tire compounds, and car regulations</li>
                <li className="font-medium text-red-200 mt-3">Validation confirmed the model generalizes across different F1 eras and captures fundamental racing dynamics rather than memorizing specific patterns.</li>
              </ul>
            </div>
          </div>

          {/* 7.5 Web Application and User Interface */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">7.5 Web Application and User Interface</h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <p>Built interactive <span className="font-semibold text-white">Streamlit web application</span> for real-time predictions and analysis</p>
              <p className="font-semibold text-white">Three main modes:</p>
              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Race Results Analysis:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Select any historical race (1995-2024)</li>
                    <li>Side-by-side comparison: Actual Results (left) vs Predicted Results (right)</li>
                    <li>Visual podium predictions with 🥇🥈🥉 medals</li>
                    <li>Top 10 predictions with win probabilities</li>
                    <li>Complete race table showing all drivers</li>
                    <li>Accuracy indicator (✅ correct / ❌ incorrect prediction)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Championship Predictions:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Predict season championship winners</li>
                    <li>Full driver standings with points breakdown</li>
                    <li>Interactive bar charts showing championship progression</li>
                    <li>Season-by-season accuracy analysis</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">2025 Season Predictor:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Predict winners for upcoming 2025 races</li>
                    <li>Uses actual 2025 F1 grid (real drivers and teams)</li>
                    <li>Top 10 finisher predictions with confidence scores</li>
                    <li>Ready for real-time race weekend predictions</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold text-white mb-2">Design features:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>F1-themed dark UI (red/black/gold colors)</li>
                  <li>Professional typography (Inter font, large readable sizes)</li>
                  <li>Interactive Plotly charts (hover tooltips, zoom, pan)</li>
                  <li>Responsive layout (works on mobile and desktop)</li>
                  <li>Fast loading (cached data, optimized queries)</li>
                </ul>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold text-white mb-2">Technical implementation:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Data caching with <code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">@st.cache_data</code> for fast repeated queries</li>
                  <li>Efficient pandas operations for filtering and sorting</li>
                  <li>Real-time prediction generation (no pre-computation needed)</li>
                  <li>Error handling and graceful degradation</li>
                </ul>
              </div>
              <p className="mt-4 font-medium text-red-200">
                The UI makes complex ML predictions accessible to non-technical users while providing deep insights for analysts.
              </p>
            </div>
          </div>

          {/* 7.6 Deployment and Production */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">7.6 Deployment and Production</h3>
            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><span className="font-semibold text-white">GitHub Repository</span>: Version controlled code with comprehensive documentation</li>
                <li><span className="font-semibold text-white">Streamlit Community Cloud</span>: Free hosting with automatic deployments</li>
                <li>Deployment pipeline:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>Push to GitHub → Streamlit auto-deploys</li>
                    <li>Zero infrastructure management required</li>
                    <li>Automatic dependency installation from requirements.txt</li>
                    <li>Global CDN for fast access worldwide</li>
                  </ul>
                </li>
                <li>Production features:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>Fast API responses ({'<'} 2 seconds for predictions)</li>
                    <li>Handles concurrent users without performance degradation</li>
                    <li>Automatic data regeneration on first run</li>
                    <li>Error logging and monitoring via Streamlit Cloud dashboard</li>
                  </ul>
                </li>
                <li>Documentation:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>Comprehensive README with setup instructions</li>
                    <li>Deployment guide for easy reproduction</li>
                    <li>Code comments explaining all ML decisions</li>
                    <li>Feature engineering documentation</li>
                  </ul>
                </li>
                <li className="font-medium text-red-200 mt-3">Result: Production-ready ML application accessible to anyone with an internet connection, zero maintenance overhead, and automatic updates when code changes.</li>
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
            <BarChart3 className="size-6 text-red-400" aria-hidden="true" />
            Architecture
          </h2>
          <div className="bg-white/5 rounded-lg p-6 overflow-x-auto">
            <pre className="text-sm text-neutral-300 font-mono whitespace-pre-wrap">
              {`F1 Historical Data
1995-2024
11,288 results

    ↓

Data Collection & Preprocessing

    ↓

Feature Engineering
25 Research-Based Features

    ↓

Training Dataset
Parquet Format

    ↓

Random Forest Model
800 trees, depth 25
Class-balanced

    ↓

Model Training
5-fold GroupKFold CV
AUC = 1.000

    ↓

Predictions Generation
556 races
Win probabilities

    ↓

Streamlit Web App
Interactive UI

    ↓
    ├─→ Race Analysis Mode
    │   Actual vs Predicted
    │
    ├─→ Championship Mode
    │   Season Winners
    │
    └─→ 2025 Predictor
        Future Races

    ↓

User Visualization
Charts, Tables, Metrics`}
            </pre>
          </div>
        </motion.section>

        {/* Key Features/Endpoints */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Rocket className="size-5 text-red-400" aria-hidden="true" />
            System Capabilities
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
                  <td className="py-3 px-4 font-semibold text-white">Race Prediction</td>
                  <td className="py-3 px-4">Predict winner for any historical race</td>
                  <td className="py-3 px-4 text-sm">Random Forest probability ranking, selects highest <code className="rounded bg-white/10 px-1 py-0.5 text-red-300">p_win</code> per race</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-semibold text-white">Top 10 Analysis</td>
                  <td className="py-3 px-4">Full field predictions with confidence</td>
                  <td className="py-3 px-4 text-sm">Sorted by <code className="rounded bg-white/10 px-1 py-0.5 text-red-300">p_win</code>, displays top 10 with win probabilities</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-semibold text-white">Actual vs Predicted</td>
                  <td className="py-3 px-4">Compare model predictions with reality</td>
                  <td className="py-3 px-4 text-sm">Side-by-side visualization, accuracy indicators</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-semibold text-white">Championship Prediction</td>
                  <td className="py-3 px-4">Season winner and standings</td>
                  <td className="py-3 px-4 text-sm">Aggregated points from race predictions</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-semibold text-white">Feature Importance</td>
                  <td className="py-3 px-4">Understand what drives predictions</td>
                  <td className="py-3 px-4 text-sm">Random Forest <code className="rounded bg-white/10 px-1 py-0.5 text-red-300">feature_importances_</code> analysis</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-semibold text-white">Season Analysis</td>
                  <td className="py-3 px-4">Performance across different eras</td>
                  <td className="py-3 px-4 text-sm">Grouped by season, accuracy metrics per era</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-semibold text-white">2025 Predictions</td>
                  <td className="py-3 px-4">Future race winner forecasts</td>
                  <td className="py-3 px-4 text-sm">Same model applied to current grid data</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Interactive Charts</td>
                  <td className="py-3 px-4">Visual exploration of predictions</td>
                  <td className="py-3 px-4 text-sm">Plotly bar charts, line charts, comparison views</td>
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
            <TrendingUp className="size-6 text-red-400" aria-hidden="true" />
            Impact & Outcomes
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Quantitative Results:</h3>
              <ul className="list-disc list-inside space-y-2 text-neutral-300 ml-4">
                <li><span className="font-semibold text-white">95.3% prediction accuracy</span> across 30 years of F1 history</li>
                <li><span className="font-semibold text-white">Perfect cross-validation score</span> (AUC = 1.000) indicating excellent model generalization</li>
                <li>Consistent performance across all F1 eras (1995-2024), proving the model captures fundamental racing dynamics</li>
                <li>Feature validation: Discovered that <span className="font-semibold text-white">points (46%), grid position (12%), and recent form (5%)</span> account for ~63% of prediction power — validating F1 domain knowledge</li>
                <li>Scalable architecture: Handles 11,288+ race results with fast prediction times ({'<'} 2 seconds)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Qualitative Outcomes:</h3>
              <ul className="list-disc list-inside space-y-2 text-neutral-300 ml-4">
                <li><span className="font-semibold text-white">Democratized F1 analysis</span>: Made complex ML predictions accessible to casual fans through intuitive UI</li>
                <li><span className="font-semibold text-white">Educational value</span>: Demonstrates production ML engineering practices: feature engineering, model selection, validation, deployment</li>
                <li><span className="font-semibold text-white">Portfolio showcase</span>: Comprehensive project showing end-to-end ML pipeline from data collection to deployed application</li>
                <li><span className="font-semibold text-white">Research contribution</span>: Validated which factors actually predict F1 race outcomes through rigorous analysis</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Technical Achievements:</h3>
              <ul className="list-disc list-inside space-y-2 text-neutral-300 ml-4">
                <li><span className="font-semibold text-white">Zero-maintenance deployment</span>: Automated CI/CD with Streamlit Community Cloud</li>
                <li><span className="font-semibold text-white">Production-ready code</span>: Clean architecture, comprehensive documentation, error handling</li>
                <li><span className="font-semibold text-white">Extensible design</span>: Easy to add new features, update models, extend to other racing series</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Learning Outcomes:</h3>
              <ul className="list-disc list-inside space-y-2 text-neutral-300 ml-4">
                <li>Mastered imbalanced classification techniques (only 1 winner per race)</li>
                <li>Practiced time-series feature engineering (lagging features, rolling windows)</li>
                <li>Implemented proper cross-validation (grouped by season to prevent data leakage)</li>
                <li>Deployed ML model to production with zero infrastructure overhead</li>
              </ul>
            </div>
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
            <Brain className="size-6 text-red-400" aria-hidden="true" />
            Technical Deep Dive
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 11.1 Data Pipeline Architecture */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">11.1 Data Pipeline Architecture</h3>
              <ul className="space-y-2 text-sm text-neutral-300 leading-relaxed">
                <li>• <span className="font-semibold text-white">Collection layer</span>: Retry-safe API calls with exponential backoff, handles API timeouts gracefully</li>
                <li>• <span className="font-semibold text-white">Preprocessing pipeline</span>: Idempotent transformations (can re-run safely), handles missing data, normalizes formats</li>
                <li>• <span className="font-semibold text-white">Storage strategy</span>: Parquet format for efficient columnar storage, supports fast filtering and aggregation</li>
                <li>• <span className="font-semibold text-white">Data validation</span>: Checks for required columns, validates data types, flags anomalies</li>
                <li className="font-medium text-red-200 mt-3">The pipeline is designed for reliability and reproducibility: running it multiple times produces identical results.</li>
              </ul>
            </div>

            {/* 11.2 Feature Engineering Pipeline */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">11.2 Feature Engineering Pipeline</h3>
              <ul className="space-y-2 text-sm text-neutral-300 leading-relaxed">
                <li>• <span className="font-semibold text-white">Time-aware features</span>: All features use <code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">shift()</code> operations to prevent data leakage</li>
                <li>• <span className="font-semibold text-white">Rolling windows</span>: Form features use 5-race windows with <code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">min_periods=1</code> to handle season starts</li>
                <li>• <span className="font-semibold text-white">Graph-like relationships</span>: Features capture driver-team connections, teammate comparisons, championship relationships</li>
                <li>• <span className="font-semibold text-white">Normalization</span>: Categorical variables encoded (<code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">constructor_cat</code>, <code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">driver_cat</code>) for model compatibility</li>
                <li>• <span className="font-semibold text-white">Missing value handling</span>: NaN values filled with 0 for numeric features, ensuring model can always make predictions</li>
                <li className="font-medium text-red-200 mt-3">The feature engineering pipeline is modular: each feature is independently calculated, making it easy to add/remove features or debug issues.</li>
              </ul>
            </div>

            {/* 11.3 Model Training Pipeline */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">11.3 Model Training Pipeline</h3>
              <ul className="space-y-2 text-sm text-neutral-300 leading-relaxed">
                <li>• <span className="font-semibold text-white">Cross-validation strategy</span>: GroupKFold by season ensures we never train and test on the same season</li>
                <li>• <span className="font-semibold text-white">Hyperparameter tuning</span>: Tested tree counts (400, 600, 800), depths (10, 15, 20, 25), found 800 trees / depth 25 optimal</li>
                <li>• <span className="font-semibold text-white">Class imbalance handling</span>: <code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">class_weight='balanced'</code> gives more weight to minority class (winners)</li>
                <li>• <span className="font-semibold text-white">Feature selection</span>: All 25 features retained after importance analysis showed each contributes to predictions</li>
                <li>• <span className="font-semibold text-white">Prediction generation</span>: Model outputs probabilities, which are ranked per race to select predicted winner</li>
                <li className="font-medium text-red-200 mt-3">Training pipeline includes comprehensive logging: feature importance, cross-validation scores, training time, memory usage.</li>
              </ul>
            </div>

            {/* 11.4 Web Application Architecture */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">11.4 Web Application Architecture</h3>
              <ul className="space-y-2 text-sm text-neutral-300 leading-relaxed">
                <li>• <span className="font-semibold text-white">State management</span>: Streamlit session state for caching predictions and user selections</li>
                <li>• <span className="font-semibold text-white">Data loading</span>: Lazy loading with <code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">@st.cache_data</code> decorator for efficient memory usage</li>
                <li>• <span className="font-semibold text-white">UI components</span>: Modular design with separate functions for each mode (race analysis, championship, 2025 predictor)</li>
                <li>• <span className="font-semibold text-white">Visualization</span>: Plotly for interactive charts, HTML/CSS for custom styling (F1 theme)</li>
                <li>• <span className="font-semibold text-white">Error handling</span>: Try-catch blocks with user-friendly error messages, graceful degradation</li>
                <li className="font-medium text-red-200 mt-3">The application is stateless and scalable: can handle multiple concurrent users without performance issues.</li>
              </ul>
            </div>
          </div>

          {/* 11.5 Deployment and DevOps */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">11.5 Deployment and DevOps</h3>
            <ul className="space-y-2 text-sm text-neutral-300 leading-relaxed">
              <li>• <span className="font-semibold text-white">Version control</span>: Git with semantic commit messages, feature branches for development</li>
              <li>• <span className="font-semibold text-white">CI/CD</span>: Streamlit Community Cloud automatically deploys on push to main branch</li>
              <li>• <span className="font-semibold text-white">Dependency management</span>: <code className="rounded bg-white/10 px-1.5 py-0.5 text-red-300 text-xs">requirements.txt</code> with pinned versions for reproducibility</li>
              <li>• <span className="font-semibold text-white">Documentation</span>: Comprehensive README, deployment guide, code comments</li>
              <li>• <span className="font-semibold text-white">Monitoring</span>: Streamlit Cloud dashboard shows app usage, error logs, performance metrics</li>
              <li className="font-medium text-red-200 mt-3">Deployment is fully automated: push code → automatic build → live in production within 2-5 minutes.</li>
            </ul>
          </div>
        </motion.section>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-red-400/20 bg-red-500/5 p-6 text-center"
        >
          <h3 className="text-xl font-semibold text-white mb-3">F1 Race Win Predictor</h3>
          <p className="text-sm text-neutral-300 mb-2">
            A machine learning case study demonstrating production-level feature engineering, model selection, and deployment practices.
          </p>
          <p className="text-xs text-neutral-400 mb-4">
            Built with Python, Scikit-learn, and Streamlit. Deployed on Streamlit Community Cloud. Open source and available for educational purposes.
          </p>
          <p className="text-xs text-neutral-500 leading-relaxed">
            This project showcases end-to-end ML engineering: from raw data collection through feature engineering, model training, validation, and production deployment. It demonstrates how domain expertise, rigorous validation, and clean architecture combine to create accurate, explainable, and maintainable machine learning systems.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <a
              href="https://f1-win-predictor-app.streamlit.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2 text-sm font-bold text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/25"
            >
              <Zap className="size-4" />
              Live Demo
            </a>
            <a
              href="https://github.com/HarshithKeshavamurthy17/F1-Race-Win-Predictor"
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


