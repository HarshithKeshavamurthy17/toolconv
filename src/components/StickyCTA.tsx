import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function StickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === 'undefined' || typeof document === 'undefined') return;
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (height <= 0) {
        setVisible(false);
        return;
      }
      setVisible(scrollTop / height > 0.3);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={variants}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className="pointer-events-auto flex max-w-3xl flex-1 items-center justify-between gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-3 shadow-[0_16px_60px_rgba(15,23,42,0.35)] backdrop-blur">
            <span className="text-sm font-medium text-white">Like what you see?</span>
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              <a
                href="#projects"
                className="rounded-full border border-cyan-300/60 bg-cyan-500/20 px-4 py-1.5 text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1720]"
              >
                See Projects
              </a>
              <a
                href="/hk-portfolio/assets/Harshith_Keshavamurthy_Resume.pdf"
                className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-white transition hover:border-cyan-300/40 hover:bg-cyan-200/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1720]"
              >
                Download Resume
              </a>
              <a
                href="mailto:hk17@bu.edu"
                className="rounded-full border border-white/10 px-4 py-1.5 text-white transition hover:border-cyan-300/40 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1720]"
              >
                Contact
              </a>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}


