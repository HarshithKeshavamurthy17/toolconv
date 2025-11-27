import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Database, LineChart, Cloud, Terminal, Sparkles, Zap } from 'lucide-react';
import { MagneticButton } from '../components/MagneticButton';

type Skill = {
  name: string;
  level: number;
  category: string;
};

const skills: Skill[] = [
  // AI & LLM
  { name: 'LangChain', level: 5, category: 'AI & LLM' },
  { name: 'Azure OpenAI', level: 5, category: 'AI & LLM' },
  { name: 'LlamaIndex', level: 4, category: 'AI & LLM' },
  { name: 'Vector DBs', level: 4, category: 'AI & LLM' },
  { name: 'RAG Systems', level: 5, category: 'AI & LLM' },
  { name: 'Neo4j', level: 4, category: 'AI & LLM' },
  
  // ML & Data Science
  { name: 'Python', level: 5, category: 'ML & Data Science' },
  { name: 'Scikit-learn', level: 5, category: 'ML & Data Science' },
  { name: 'TensorFlow', level: 4, category: 'ML & Data Science' },
  { name: 'PyTorch', level: 4, category: 'ML & Data Science' },
  { name: 'MLflow', level: 5, category: 'ML & Data Science' },
  { name: 'Weights & Biases', level: 5, category: 'ML & Data Science' },
  
  // Data Engineering
  { name: 'AWS Glue', level: 5, category: 'Data Engineering' },
  { name: 'dbt', level: 5, category: 'Data Engineering' },
  { name: 'Apache Kafka', level: 4, category: 'Data Engineering' },
  { name: 'Snowflake', level: 5, category: 'Data Engineering' },
  { name: 'Airflow', level: 4, category: 'Data Engineering' },
  { name: 'Spark', level: 4, category: 'Data Engineering' },
  
  // Cloud & DevOps
  { name: 'AWS', level: 5, category: 'Cloud & DevOps' },
  { name: 'Azure', level: 5, category: 'Cloud & DevOps' },
  { name: 'Docker', level: 5, category: 'Cloud & DevOps' },
  { name: 'Kubernetes', level: 4, category: 'Cloud & DevOps' },
  { name: 'Terraform', level: 4, category: 'Cloud & DevOps' },
  { name: 'CI/CD', level: 5, category: 'Cloud & DevOps' },
  
  // Analytics & BI
  { name: 'SQL', level: 5, category: 'Analytics & BI' },
  { name: 'Tableau', level: 5, category: 'Analytics & BI' },
  { name: 'Power BI', level: 5, category: 'Analytics & BI' },
  { name: 'Looker', level: 4, category: 'Analytics & BI' },
  { name: 'BigQuery', level: 4, category: 'Analytics & BI' },
  { name: 'Redshift', level: 4, category: 'Analytics & BI' },
];

const categories = [
  { name: 'All', icon: Sparkles, gradient: 'from-white to-neutral-400' },
  { name: 'AI & LLM', icon: Sparkles, gradient: 'from-violet-400 to-purple-400' },
  { name: 'ML & Data Science', icon: Zap, gradient: 'from-cyan-400 to-blue-400' },
  { name: 'Data Engineering', icon: Database, gradient: 'from-emerald-400 to-green-400' },
  { name: 'Cloud & DevOps', icon: Cloud, gradient: 'from-orange-400 to-red-400' },
  { name: 'Analytics & BI', icon: LineChart, gradient: 'from-pink-400 to-rose-400' },
];

export function Skills() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  const filteredSkills = activeCategory === 'All' 
    ? skills 
    : skills.filter(s => s.category === activeCategory);

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.name === category);
    return cat?.gradient || 'from-white to-neutral-400';
  };

  const getCategoryBorderColor = (category: string) => {
    switch (category) {
      case 'AI & LLM':
        return 'border-violet-400/60 hover:border-violet-400';
      case 'ML & Data Science':
        return 'border-cyan-400/60 hover:border-cyan-400';
      case 'Data Engineering':
        return 'border-emerald-400/60 hover:border-emerald-400';
      case 'Cloud & DevOps':
        return 'border-orange-400/60 hover:border-orange-400';
      case 'Analytics & BI':
        return 'border-pink-400/60 hover:border-pink-400';
      default:
        return 'border-white/10 hover:border-white/20';
    }
  };

  return (
    <section id="skills" className="relative py-6 md:py-8 overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute left-[15%] top-[25%] size-[350px] rounded-full bg-gradient-to-br from-violet-500/15 to-transparent blur-3xl" />

      <div className="mx-auto max-w-5xl px-3 md:px-5 lg:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-6 text-center"
        >
          <motion.div
            className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-violet-400/20 bg-violet-500/5 px-2.5 py-1 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Code2 className="size-2.5 text-violet-400" />
            </motion.div>
            <span className="text-[10px] font-medium text-violet-300">Technical Arsenal</span>
          </motion.div>
          
          <h2 className="mb-3 text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Skills & Tech
          </h2>
          <p className="mx-auto max-w-2xl text-xs text-neutral-400">
            Comprehensive toolkit spanning AI/ML, data engineering, cloud, and analytics
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex flex-wrap justify-center gap-2"
        >
          {categories.map((cat, index) => {
            const isActive = activeCategory === cat.name;
            return (
              <MagneticButton key={cat.name} strength={0.2}>
                <motion.button
                  onClick={() => setActiveCategory(cat.name)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative overflow-hidden rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'border border-white/10 bg-white/5 text-neutral-400 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="relative z-10 flex items-center gap-1.5">
                    <cat.icon className="size-3" />
                    <span>{cat.name}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeCategory"
                      className={`absolute inset-0 bg-gradient-to-r ${cat.gradient}`}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              </MagneticButton>
            );
          })}
        </motion.div>

        {/* Skills Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill, index) => {
              return (
                <motion.div
                  key={skill.name}
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ 
                    layout: { type: "spring", stiffness: 200, damping: 40 },
                    delay: index * 0.02
                  }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
                  className={`group relative overflow-hidden rounded-xl border-2 ${getCategoryBorderColor(skill.category)} bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-4 backdrop-blur-xl transition-all duration-200 hover:shadow-lg`}
                >
                  {/* Gradient overlay on hover */}
                  <motion.div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(135deg, ${
                        skill.category === 'AI & LLM'
                          ? 'rgba(139, 92, 246, 0.15)'
                          : skill.category === 'ML & Data Science'
                          ? 'rgba(34, 211, 238, 0.15)'
                          : skill.category === 'Data Engineering'
                          ? 'rgba(34, 197, 94, 0.15)'
                          : skill.category === 'Cloud & DevOps'
                          ? 'rgba(251, 146, 60, 0.15)'
                          : 'rgba(236, 72, 153, 0.15)'
                      }, transparent)`,
                    }}
                  />
                  
                  {/* Category-colored shadow on hover */}
                  <motion.div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      boxShadow: skill.category === 'AI & LLM'
                        ? '0 0 20px rgba(139, 92, 246, 0.3)'
                        : skill.category === 'ML & Data Science'
                        ? '0 0 20px rgba(34, 211, 238, 0.3)'
                        : skill.category === 'Data Engineering'
                        ? '0 0 20px rgba(34, 197, 94, 0.3)'
                        : skill.category === 'Cloud & DevOps'
                        ? '0 0 20px rgba(251, 146, 60, 0.3)'
                        : '0 0 20px rgba(236, 72, 153, 0.3)',
                    }}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Category badge */}
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                      {skill.category}
                    </div>

                    {/* Skill name */}
                    <div className="text-sm font-semibold text-white">
                      {skill.name}
                    </div>
                  </div>

                  {/* Hover shine effect */}
                  <motion.div
                    className="pointer-events-none absolute inset-0"
                    initial={{ x: '-100%', opacity: 0 }}
                    whileHover={{
                      x: '100%',
                      opacity: [0, 0.5, 0],
                      transition: { duration: 0.6 },
                    }}
                    style={{
                      background:
                        'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                    }}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
}
