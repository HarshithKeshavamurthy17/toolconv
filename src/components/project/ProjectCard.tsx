import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

export type Project = {
  title: string;
  summary: string;
  tech: string[];
  metric: {
    label: string;
    value: string;
  };
  links: {
    code: string;
    demo: string;
    pdf: string;
    caseStudy: string;
  };
};

type ProjectCardProps = {
  project: Project;
  onCaseStudyHover?: (href: string) => void;
};

export function ProjectCard({ project, onCaseStudyHover }: ProjectCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const caseStudyHref = project.links.caseStudy;
  const isInternalCaseStudy = caseStudyHref.startsWith('/');
  const handlePrefetch =
    isInternalCaseStudy && onCaseStudyHover ? () => onCaseStudyHover(caseStudyHref) : undefined;
  const motionProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -16 },
        transition: { duration: 0.35, ease: 'easeOut' as const },
      };

  return (
    <motion.article
      layout
      {...motionProps}
      className="flex h-full flex-col gap-5 rounded-xl border border-border/50 bg-surface/60 p-6 shadow-sm transition hover:border-accent/60 hover:shadow-lg"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-heading text-2xl font-semibold text-foreground">{project.title}</h3>
          <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
            {project.metric.value}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{project.summary}</p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {project.tech.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-border/60 bg-background/60 px-3 py-1 font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
        <div className="rounded-lg border border-border/40 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{project.metric.label}:</span>{' '}
          <span>{project.metric.value}</span>
        </div>
      </div>
      <div className="mt-auto flex flex-wrap gap-3">
        <Button asChild size="sm" className="gap-2">
          <a href={project.links.code} target="_blank" rel="noreferrer">
            View Code
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-2">
          <a href={project.links.demo} target="_blank" rel="noreferrer">
            See Demo
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </Button>
        <Button asChild size="sm" variant="ghost" className="gap-2">
          <a href={project.links.pdf} target="_blank" rel="noreferrer">
            One-Pager PDF
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </Button>
        {isInternalCaseStudy ? (
          <Button asChild size="sm" variant="ghost" className="gap-2">
            <Link
              to={caseStudyHref}
              aria-label={`Read case study for ${project.title}`}
              onMouseEnter={handlePrefetch}
              onFocus={handlePrefetch}
            >
              Read Case Study
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        ) : (
          <Button asChild size="sm" variant="ghost" className="gap-2">
            <a
              href={caseStudyHref}
              target="_blank"
              rel="noreferrer"
              aria-label={`Read case study for ${project.title}`}
              onMouseEnter={handlePrefetch}
              onFocus={handlePrefetch}
            >
              Read Case Study
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </Button>
        )}
      </div>
    </motion.article>
  );
}
