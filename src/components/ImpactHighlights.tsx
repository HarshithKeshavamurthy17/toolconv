import { memo } from 'react';
import { BadgeCheck, Server, ScrollText, Network } from 'lucide-react';

type Highlight = {
  title: string;
  description: string;
  icon: JSX.Element;
};

const HIGHLIGHTS: Highlight[] = [
  {
    title: 'Shipped ML products',
    description: 'LLM eval + RAG triage at Tietoevry',
    icon: <BadgeCheck className="size-4 text-cyan-300" aria-hidden="true" />,
  },
  {
    title: 'Streaming data platforms',
    description: 'Kafka + dbt + Snowflake ingestion',
    icon: <Server className="size-4 text-cyan-300" aria-hidden="true" />,
  },
  {
    title: 'Interpretable AI',
    description: 'SHAP dashboards, model cards & governance',
    icon: <ScrollText className="size-4 text-cyan-300" aria-hidden="true" />,
  },
  {
    title: 'Graph-RAG',
    description: 'Neo4j + LangChain retrievers',
    icon: <Network className="size-4 text-cyan-300" aria-hidden="true" />,
  },
];

function ImpactHighlights() {
  return (
    <div
      className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-center"
      role="list"
    >
      {HIGHLIGHTS.map((highlight) => (
        <div
          key={highlight.title}
          className="group flex w-full items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition duration-200 hover:border-cyan-200/40 hover:bg-white/10 hover:shadow-[0_10px_36px_rgba(45,212,191,0.16)] sm:w-[calc(50%-0.75rem)] lg:w-auto"
          role="listitem"
        >
          <span className="mt-0.5 flex size-8 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-200 shadow-[0_8px_30px_rgba(45,212,191,0.18)]">
            {highlight.icon}
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">{highlight.title}</span>
            <span className="text-xs text-neutral-400">{highlight.description}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(ImpactHighlights);

