import { CaseLayout } from './CaseLayout';

const placeholder = (label: string) => (
  <p className="text-muted-foreground">TODO: Document {label} for Uber ETL case study.</p>
);

export function UberETL() {
  return (
    <CaseLayout
      title="Uber ETL"
      summary="Streaming data engineering pipeline handling rider telemetry, anomalies, and contract-driven transformations."
      timeline="2023"
      caseRole="Data Engineering Lead"
      slug="uber-etl"
      tags={['Streaming', 'Kafka', 'Analytics']}
      sections={{
        problem: placeholder('problem statement'),
        data: placeholder('data sources'),
        approach: placeholder('approach'),
        architecture: placeholder('architecture'),
        decisions: placeholder('key decisions'),
        results: placeholder('results'),
        improvements: placeholder('improvements'),
        links: placeholder('links/resources'),
      }}
    />
  );
}

export default UberETL;
