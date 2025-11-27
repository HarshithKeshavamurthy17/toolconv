import { motion, useInView } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

type ScrollRevealProps = {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'rotate';
  className?: string;
};

export function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: '-100px' });

  const variants = {
    up: {
      hidden: { opacity: 0, y: 50, scale: 0.95 },
      visible: { opacity: 1, y: 0, scale: 1 },
    },
    down: {
      hidden: { opacity: 0, y: -50, scale: 0.95 },
      visible: { opacity: 1, y: 0, scale: 1 },
    },
    left: {
      hidden: { opacity: 0, x: 50, rotateY: 15 },
      visible: { opacity: 1, x: 0, rotateY: 0 },
    },
    right: {
      hidden: { opacity: 0, x: -50, rotateY: -15 },
      visible: { opacity: 1, x: 0, rotateY: 0 },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8, rotate: -10 },
      visible: { opacity: 1, scale: 1, rotate: 0 },
    },
    rotate: {
      hidden: { opacity: 0, rotate: -180, scale: 0.5 },
      visible: { opacity: 1, rotate: 0, scale: 1 },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants[direction]}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

