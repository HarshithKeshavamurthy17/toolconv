import { CaseLayout } from './CaseLayout';

const placeholder = (label: string) => (
  <p className="text-muted-foreground">TODO: Document {label} for Breast Cancer ML case study.</p>
);

export function BreastCancerML() {
  return (
    <CaseLayout
      title="Breast Cancer ML"
      summary="Explainable diagnostic workflow highlighting cellular features for breast cancer screening teams."
      timeline="2021"
      caseRole="Machine Learning Engineer"
      slug="breast-cancer-ml"
      tags={['Explainability', 'Healthcare', 'ML']}
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

export default BreastCancerML;
