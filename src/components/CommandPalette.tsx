import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { cn } from '../lib/cn';

export type CommandItem = {
  id: string;
  title: string;
  description?: string;
  action: () => void;
};

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
  commands: CommandItem[];
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 12 },
};

export default function CommandPalette({ open, onClose, commands }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<Element | null>(null);

  const isBrowser = typeof window !== 'undefined';

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return commands;
    }
    return commands.filter((command) =>
      `${command.title} ${command.description ?? ''}`.toLowerCase().includes(normalized),
    );
  }, [commands, query]);

  useEffect(() => {
    if (!open) {
      return;
    }
    previousFocusRef.current = document.activeElement;
    const timeout = window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 80);
    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) {
        event.preventDefault();
      }

      if (event.key === 'ArrowDown') {
        setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      }

      if (event.key === 'ArrowUp') {
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }

      if (event.key === 'Enter') {
        const item = filtered[activeIndex];
        if (item) {
          item.action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, filtered, activeIndex, onClose]);

  useEffect(() => {
    if (!open && previousFocusRef.current instanceof HTMLElement) {
      previousFocusRef.current.focus({ preventScroll: true });
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const container = listRef.current;
    const active = container?.querySelector('[data-active="true"]');
    if (container && active instanceof HTMLElement) {
      const top = active.offsetTop;
      const height = active.offsetHeight;
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      if (top < scrollTop) {
        container.scrollTo({ top });
      } else if (top + height > scrollTop + containerHeight) {
        container.scrollTo({ top: top + height - containerHeight });
      }
    }
  }, [activeIndex, open, filtered]);

  if (!isBrowser || !document.body) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-start justify-center bg-slate-950/40 backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="mt-28 w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-[0_40px_100px_rgba(15,23,42,0.55)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <Search className="size-4 text-cyan-200" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                placeholder="Type a command…"
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-neutral-500"
              />
              <kbd className="rounded border border-white/10 px-2 py-1 text-[11px] text-neutral-400">Esc</kbd>
            </div>

            <div ref={listRef} className="max-h-80 overflow-y-auto bg-slate-950/95">
              {filtered.length === 0 ? (
                <div className="px-4 py-6 text-sm text-neutral-500">No commands found.</div>
              ) : (
                filtered.map((command, index) => (
                  <button
                    key={command.id}
                    type="button"
                    data-active={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => {
                      command.action();
                      onClose();
                    }}
                    className={cn(
                      'flex w-full flex-col items-start gap-1 px-4 py-3 text-left transition',
                      index === activeIndex
                        ? 'bg-cyan-500/10 text-white'
                        : 'text-neutral-300 hover:bg-white/5',
                    )}
                  >
                    <span className="text-sm font-medium">{command.title}</span>
                    {command.description ? (
                      <span className="text-xs text-neutral-400">{command.description}</span>
                    ) : null}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

