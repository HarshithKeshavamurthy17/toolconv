import Marquee from 'react-fast-marquee';

const LOGOS = [
  { name: 'tietoevry_logo.png', alt: 'Tietoevry' },
  { name: 'uber.png', alt: 'Uber' },
  { name: 'nineleaps.png', alt: 'Nineleaps' },
  { name: 'nastech.png', alt: 'NASTECH' },
  { name: 'build_fellowship.png', alt: 'Build Fellowship' },
  { name: 'bu.png', alt: 'Boston University' },
] as const;

export default function TrustedBy() {
  return (
    <section className="mx-auto w-full max-w-[1920px] px-6 md:px-8 lg:px-12 xl:px-16">
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8 backdrop-blur-xl lg:flex-row lg:gap-8">
        <span className="text-sm font-semibold uppercase tracking-[0.35em] text-neutral-400">
          Built solutions for
        </span>
        <div className="flex-1 overflow-hidden">
          <Marquee gradient={false} speed={30} pauseOnHover>
            <div className="flex items-center gap-12 px-6">
              {LOGOS.map((logo) => (
                <div
                  key={logo.name}
                  className="flex h-12 items-center justify-center px-4 text-lg font-bold uppercase tracking-wider text-white/60 transition duration-300 ease-out hover:text-white/100"
                >
                  {logo.alt}
                </div>
              ))}
            </div>
          </Marquee>
        </div>
      </div>
    </section>
  );
}

