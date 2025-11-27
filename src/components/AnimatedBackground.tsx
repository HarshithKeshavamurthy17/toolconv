import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    let rafId: number;
    let lastX = 0.5;
    let lastY = 0.5;

    // Throttle updates using requestAnimationFrame (max 60fps)
    const handleMouseMove = (e: MouseEvent) => {
      lastX = e.clientX / window.innerWidth;
      lastY = e.clientY / window.innerHeight;

      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          setMousePosition({ x: lastX, y: lastY });
          rafId = 0;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
      {/* Floating orbs that follow mouse - reduced from 20 to 8 */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${100 + i * 30}px`,
            height: `${100 + i * 30}px`,
            left: `${10 + i * 10}%`,
            top: `${20 + (i % 4) * 20}%`,
            background: `radial-gradient(circle, ${
              i % 3 === 0
                ? 'rgba(34, 211, 238, 0.12)'
                : i % 3 === 1
                ? 'rgba(139, 92, 246, 0.12)'
                : 'rgba(59, 130, 246, 0.12)'
            }, transparent)`,
            filter: 'blur(50px)',
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
          animate={{
            x: [0, (mousePosition.x - 0.5) * 80, 0],
            y: [0, (mousePosition.y - 0.5) * 80, 0],
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 12 + i * 0.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Floating particles - reduced from 50 to 15 */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute size-1 rounded-full bg-cyan-400/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            willChange: 'transform, opacity',
            transform: 'translateZ(0)',
          }}
          animate={{
            y: [0, -120, 0],
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 6 + Math.random() * 6,
            repeat: Infinity,
            delay: Math.random() * 6,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Grid lines - static instead of pulsing for better performance */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          willChange: 'auto',
        }}
      />

      {/* Radial gradient that follows mouse - optimized */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x * 100}% ${
            mousePosition.y * 100
          }%, rgba(34, 211, 238, 0.12), transparent 50%)`,
          willChange: 'auto',
        }}
      />
    </div>
  );
}

