import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import experienceData from '../data/experience';
import ExperienceItem from '../components/ExperienceItem';

const containerVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
      staggerChildren: 0.18,
      delayChildren: 0.05,
    },
  },
};

export default function Experience() {
  const prefersReducedMotion = useReducedMotion();
  const data = useMemo(() => experienceData, []);

  return (
    <section id="experience" className="relative py-4 md:py-6 overflow-hidden">
      {/* Background decoration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none absolute left-[10%] top-[30%] size-[350px] rounded-full bg-gradient-to-br from-emerald-500/15 to-transparent blur-3xl"
      />

      <div className="mx-auto max-w-5xl px-3 md:px-5 lg:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-4 text-center"
        >
          <motion.div
            className="mb-2 inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-500/5 px-2.5 py-1 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="size-2.5 text-emerald-400" />
            </motion.div>
            <span className="text-[10px] font-medium text-emerald-300">Professional Journey</span>
          </motion.div>
          
          <h2 className="mb-2 text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-emerald-400 via-green-400 to-cyan-400 bg-clip-text text-transparent">
            Experience
          </h2>
          <p className="mx-auto max-w-2xl text-xs text-neutral-400">
            Hands-on roles building ML platforms, streaming data systems, and interpretable ML
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical animated line */}
          <span
            className="pointer-events-none absolute left-0 top-0 hidden h-full w-px md:left-8 md:block"
            aria-hidden="true"
          >
            <motion.span
              className="absolute inset-0 before:absolute before:left-1/2 before:top-0 before:block before:h-full before:w-[2px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-to-b before:from-cyan-300/60 before:via-cyan-400/30 before:to-transparent before:shadow-[0_0_32px_rgba(34,211,238,0.35)]"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{ transformOrigin: "top" }}
            />
          </span>

          <motion.div
            className="flex flex-col gap-5"
            variants={prefersReducedMotion ? undefined : containerVariants}
            initial={prefersReducedMotion ? undefined : 'initial'}
            whileInView={prefersReducedMotion ? undefined : 'animate'}
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* "Now" indicator */}
            <div className="sticky top-20 hidden h-12 items-center pl-12 text-xs font-semibold uppercase tracking-[0.4em] text-neutral-500 md:flex">
              Now
            </div>

            {data.map((exp) => (
              <div key={exp.id} className="relative md:pl-12">
                {/* Timeline dot with pulsing animation */}
                <div className="pointer-events-none absolute left-0 top-8 hidden md:flex md:translate-x-[-34px] md:flex-col md:items-center">
                  <motion.span
                    className="block size-4 rounded-full border-2 border-cyan-200 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)]"
                    aria-hidden="true"
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <motion.span
                      className="absolute inset-0 rounded-full"
                      animate={{
                        boxShadow: [
                          "0 0 25px rgba(34,211,238,0.6)",
                          "0 0 45px rgba(34,211,238,0.9)",
                          "0 0 25px rgba(34,211,238,0.6)",
                        ],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.span>
                </div>

                {/* Year badge on timeline */}
                <div className="pointer-events-none absolute left-0 top-2 hidden md:block md:translate-x-[calc(-100%-24px)]">
                  <motion.span
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="whitespace-nowrap rounded-full bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/50 backdrop-blur"
                  >
                    {exp.start.includes('2025') ? '2025' : 
                     exp.start.includes('2024') ? '2024' : 
                     exp.start.includes('2023') ? '2023' : 
                     exp.start.includes('2022') ? '2022' : exp.start}
                  </motion.span>
                </div>

                {/* Mobile date */}
                <div className="mb-2 flex items-center gap-2 md:hidden">
                  <span className="size-2 rounded-full bg-cyan-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    {exp.start}
                  </span>
                </div>

                {/* Experience card with ALL detailed content */}
                <ExperienceItem exp={exp} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
