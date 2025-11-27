import type { Variants } from 'framer-motion';

type MotionOptions = {
  duration?: number;
  delay?: number;
  distance?: number;
};

export const fadeIn = ({ duration = 0.4, delay = 0 }: MotionOptions = {}): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration,
      delay,
      ease: 'easeOut',
    },
  },
});

export const slideUp = ({
  duration = 0.6,
  delay = 0,
  distance = 32,
}: MotionOptions = {}): Variants => ({
  hidden: { opacity: 0, y: distance },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration,
      delay,
      ease: 'easeOut',
    },
  },
});

export const stagger = (staggerChildren = 0.12, delayChildren = 0.08): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

