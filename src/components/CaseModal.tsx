import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

type CaseModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  problem: string;
  approach: string;
  impact: string[];
  stack: string[];
  links: { label: string; href: string }[];
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 16 },
};

export default function CaseModal({ open, onClose, title, problem, approach, impact, stack, links }: CaseModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const isBrowser = typeof window !== 'undefined';

  useEffect(() => {
    if (!open || !isBrowser) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const timeout = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 150);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(timeout);
    };
  }, [open, onClose, isBrowser]);

  if (!isBrowser) {
    return null;
  }

  const portalTarget = document.body;

  if (!portalTarget) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
        >
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur" onClick={onClose} aria-hidden="true" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-modal-title"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative z-10 max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b0f14]/95 shadow-[0_40px_120px_rgba(15,23,42,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-6 border-b border-white/10 px-6 py-5">
              <div className="flex flex-col gap-1 text-left">
                <h2 id="case-modal-title" className="text-2xl font-semibold text-white">
                  {title}
                </h2>
                <p className="text-sm text-cyan-200/80">{approach}</p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-neutral-300 transition hover:border-cyan-300/50 hover:bg-cyan-200/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14]"
                aria-label="Close case modal"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto p-6 text-sm text-neutral-200">
              <section className="space-y-2">
                <h3 className="text-xs uppercase tracking-[0.3em] text-neutral-500">Problem</h3>
                <p className="leading-relaxed text-neutral-300">{problem}</p>
              </section>

              <section className="space-y-2">
                <h3 className="text-xs uppercase tracking-[0.3em] text-neutral-500">Impact</h3>
                <ul className="space-y-2">
                  {impact.map((item) => (
                    <li key={item} className="flex gap-2 text-neutral-200">
                      <span className="mt-1 size-1.5 rounded-full bg-cyan-400" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-xs uppercase tracking-[0.3em] text-neutral-500">Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {stack.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-white/0 px-3 py-1 text-xs font-medium text-neutral-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </section>

              {links.length > 0 ? (
                <section className="space-y-2">
                  <h3 className="text-xs uppercase tracking-[0.3em] text-neutral-500">Links</h3>
                  <div className="flex flex-wrap gap-2">
                    {links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-cyan-300/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14]"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    portalTarget,
  );
}

