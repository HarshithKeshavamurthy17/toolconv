import { cn } from '../../lib/cn';

type GlowProps = {
  className?: string;
};

export function Glow({ className }: GlowProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none fixed inset-0 -z-10 overflow-hidden', className)}
    >
      <div className="absolute left-1/2 top-1/2 size-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#22d3ee]/10 blur-3xl" />
      <div className="absolute left-[10%] top-[15%] size-[420px] rounded-full bg-sky-500/10 blur-3xl" />
      <div className="absolute bottom-[10%] right-[5%] size-[380px] rounded-full bg-cyan-400/10 blur-3xl" />
    </div>
  );
}
