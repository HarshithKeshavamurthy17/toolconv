import { motion, useScroll, useSpring, useTransform, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  
  // Transform scroll progress to percentage (0-100) and update state
  const percentage = useTransform(scrollYProgress, (value) => Math.round(value * 100));
  const [percentageText, setPercentageText] = useState(0);
  
  useMotionValueEvent(percentage, 'change', (latest) => {
    setPercentageText(latest);
  });

  return (
    <>
      {/* Top progress bar */}
      <motion.div
        className="fixed left-0 right-0 top-0 z-[100] h-1 origin-left bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
        style={{ scaleX }}
      />
      
      {/* Percentage indicator */}
      <motion.div
        className="fixed bottom-8 right-8 z-50 hidden lg:block"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          className="relative flex size-16 items-center justify-center rounded-full border-2 border-cyan-400/30 bg-[#0f172a]/80 backdrop-blur-xl"
          whileHover={{ scale: 1.1 }}
        >
          {/* Progress ring */}
          <svg className="absolute inset-0 size-full -rotate-90">
            <motion.circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              style={{
                pathLength: scrollYProgress,
              }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Percentage text */}
          <motion.span 
            className="relative text-xs font-bold text-cyan-400"
            style={{ opacity: useSpring(scrollYProgress, { stiffness: 100, damping: 30 }) }}
          >
            {percentageText}%
          </motion.span>
        </motion.div>
      </motion.div>
    </>
  );
}

