import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function CustomCursor() {
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Less aggressive spring for smoother performance
  const springConfig = { damping: 30, stiffness: 400, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    let rafId: number;
    let lastX = 0;
    let lastY = 0;

    // Throttle updates using requestAnimationFrame
    const moveCursor = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;

      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          cursorX.set(lastX);
          cursorY.set(lastY);
          rafId = 0;
        });
      }

      const target = e.target as HTMLElement;
      const isClickable =
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') !== null ||
        target.closest('button') !== null;
      
      if (isClickable !== isPointer) {
        setIsPointer(isClickable);
      }
    };

    const handleMouseEnter = () => setIsHidden(false);
    const handleMouseLeave = () => setIsHidden(true);

    window.addEventListener('mousemove', moveCursor, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [cursorX, cursorY, isPointer]);

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden lg:block"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          willChange: 'transform',
        }}
      >
        <motion.div
          animate={{
            scale: isPointer ? 1.5 : 1,
            opacity: isHidden ? 0 : 1,
          }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="relative -translate-x-1/2 -translate-y-1/2"
          style={{ willChange: 'transform, opacity' }}
        >
          {/* Outer ring */}
          <motion.div
            animate={{
              scale: isPointer ? 1.2 : 1,
            }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="size-8 rounded-full border-2 border-cyan-400/50 bg-cyan-400/10 backdrop-blur-sm"
            style={{ willChange: 'transform' }}
          />
          {/* Inner dot */}
          <motion.div
            animate={{
              scale: isPointer ? 0 : 1,
            }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400"
            style={{ willChange: 'transform' }}
          />
        </motion.div>
      </motion.div>

      {/* Trailing effect */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9998] hidden lg:block"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          willChange: 'transform',
        }}
      >
        <motion.div
          animate={{
            scale: isPointer ? 2 : 1.5,
            opacity: isHidden ? 0 : 0.3,
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="size-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-400/20 blur-xl"
          style={{ willChange: 'transform, opacity' }}
        />
      </motion.div>
    </>
  );
}

