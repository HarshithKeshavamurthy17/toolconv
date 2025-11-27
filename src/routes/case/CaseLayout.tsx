import { motion, useReducedMotion } from 'framer-motion';
import { Section } from '../../components/layout/Section';
import { fadeIn, slideUp, stagger } from '../../components/layout/Motion';
import { cn } from '../../lib/cn';
import { SEO } from '../../components/layout/SEO';

type CaseLayoutProps = {
  title: string;
  summary: string;
  tags?: string[];
  timeline?: string;
  caseRole?: string;
  slug: string;
  sections: {
    problem: React.ReactNode;
    data: React.ReactNode;
    approach: React.ReactNode;
    architecture: React.ReactNode;
    decisions: React.ReactNode;
    results: React.ReactNode;
    improvements: React.ReactNode;
    links: React.ReactNode;
  };
};

const SECTION_ORDER: Array<{ key: keyof CaseLayoutProps['sections']; title: string }> = [
  { key: 'problem', title: 'Problem' },
  { key: 'data', title: 'Data' },
  { key: 'approach', title: 'Approach' },
  { key: 'architecture', title: 'Architecture' },
  { key: 'decisions', title: 'Key Decisions' },
  { key: 'results', title: 'Results' },
  { key: 'improvements', title: 'Improvements' },
  { key: 'links', title: 'Links' },
];

export function CaseLayout({
  title,
  summary,
  tags,
  timeline,
  caseRole,
  slug,
  sections,
}: CaseLayoutProps) {
  const canonical = `${BASE_URL}/case/${slug}`;
  const shouldReduceMotion = useReducedMotion();
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${BASE_URL}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: title,
        item: canonical,
      },
    ],
  };

  return (
    <main className="flex flex-col gap-10 pb-20">
      <SEO
        title={`${title} — Case Study`}
        description={summary}
        canonical={canonical}
        ogType="article"
        jsonLd={breadcrumbJsonLd}
      />

      <Section className="pt-24">
        <motion.div
          className="flex flex-col gap-6"
          {...(!shouldReduceMotion
            ? { variants: fadeIn({ duration: 0.4 }), initial: 'hidden', animate: 'show' }
            : {})}
        >
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.4em] text-accent">Case Study</p>
            <h1 className="font-heading text-4xl font-semibold text-foreground sm:text-5xl">
              {title}
            </h1>
            <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">{summary}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {caseRole ? (
              <span className="font-medium text-foreground">Role: {caseRole}</span>
            ) : null}
            {timeline ? (
              <span className="font-medium text-foreground">Timeline: {timeline}</span>
            ) : null}
            {tags && tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </motion.div>
      </Section>

      <Section className="pt-0">
        <motion.div
          className="flex flex-col gap-10"
          {...(!shouldReduceMotion
            ? { variants: stagger(0.18, 0.12), initial: 'hidden', animate: 'show' }
            : {})}
        >
          {SECTION_ORDER.map(({ key, title: sectionTitle }) => {
            const content = sections[key];
            if (!content) {
              return null;
            }

            return (
              <motion.section
                key={sectionTitle}
                variants={
                  shouldReduceMotion ? undefined : slideUp({ distance: 20, duration: 0.45 })
                }
                aria-labelledby={slugify(sectionTitle)}
                className="rounded-xl border border-border/30 bg-surface/60 p-6 shadow-sm"
              >
                <header className="flex items-center justify-between gap-4">
                  <h2
                    id={slugify(sectionTitle)}
                    className="font-heading text-2xl font-semibold text-foreground"
                  >
                    {sectionTitle}
                  </h2>
                </header>
                <div className={cn('mt-4 space-y-4 text-sm text-muted-foreground')}>{content}</div>
              </motion.section>
            );
          })}
        </motion.div>
      </Section>
    </main>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

const BASE_URL = 'https://harinik.dev';
