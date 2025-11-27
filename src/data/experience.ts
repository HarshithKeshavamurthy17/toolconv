export type Experience = {
  id: string;
  company: string;
  role: string;
  start: string;
  end: string;
  summary: string;
  description?: string;
  impact: string[];
  impactSummary?: string;
  tech: string[];
  logo?: string;
  featured?: boolean;
};

export const experiences: Experience[] = [
  {
    id: 'tietoevry-ai-ml-intern',
    company: 'Tietoevry',
    role: 'AI/ML Engineer Intern',
    start: 'Jun 2025',
    end: 'Aug 2025',
    summary: 'Large-scale retrieval-augmented intelligence platform for cybersecurity',
    description: 'Built a large-scale retrieval-augmented intelligence platform for cybersecurity.',
    impact: [
      'Designed and deployed a Neo4j-based Knowledge Graph linking 200K+ CVE and CWE entities',
      'Engineered a hybrid RAG pipeline using BM25, FAISS, and Cross-Encoder reranking',
      'Automated evaluation via FastAPI microservices on Azure Functions',
      'Enabled natural-language querying and citation-aware LLM responses with LangChain',
    ],
    tech: ['Python', 'Neo4j', 'LangChain', 'Azure Functions', 'FAISS', 'FastAPI', 'Docker', 'Streamlit'],
    impactSummary: 'Reduced research time by 42%, transforming vulnerability analysis into a scalable, explainable workflow.',
    logo: '/hk-portfolio/logos/tietoevry_logo.png',
    featured: true,
  },
  {
    id: 'build-fellowship',
    company: 'Build Fellowship',
    role: 'Student Consultant',
    start: 'Jul 2025',
    end: 'Aug 2025',
    summary: 'International Growth Strategy',
    description: 'Collaborated with the founding team of a U.S.-based online school to craft a real-world international expansion strategy across 15+ countries.',
    impact: [
      'Led the research and analytics track — designing a market scoring model combining 30+ macro variables (internet access, income levels, education demand, pricing trends)',
      'Identified high-potential markets using data-driven segmentation, competitive benchmarking, and PESTEL analysis',
      'Built a centralized market intelligence dashboard used by stakeholders for investment decisions and go-to-market prioritization',
      'Presented the final strategy to client leadership — several key recommendations were adopted for their 2025 global launch plan',
    ],
    tech: ['Python', 'Tableau', 'Excel', 'Market Analytics', 'PESTEL Analysis'],
    logo: '/hk-portfolio/logos/build_fellowship.png',
  },
  {
    id: 'uber-nineleaps',
    company: 'Uber (via Nineleaps)',
    role: 'Data Analyst',
    start: 'Aug 2023',
    end: 'May 2024',
    summary: 'Partnered with Uber India Ops to scale the Uber Bus service across metro cities',
    description: 'Partnered with Uber India Ops to scale the Uber Bus service across metro cities.',
    impact: [
      'Designed KPI frameworks (utilization, efficiency, occupancy) improving route planning by 30%',
      'Built geospatial clustering and demand-forecasting models (K-Means, DBSCAN) to optimize fleet deployment',
      'Owned analytics foundation for Chennai & Kolkata, enabling pilot success and operational rollout',
      'Automated dashboards and daily reporting using Python + SQL + Tableau',
    ],
    tech: ['Python', 'SQL', 'Tableau', 'K-Means', 'DBSCAN', 'Google Apps Script'],
    impactSummary: 'Shortened expansion timelines and increased operational transparency through analytics.',
    logo: '/hk-portfolio/logos/uber.png',
    featured: true,
  },
  {
    id: 'nineleaps-data-science',
    company: 'Nineleaps',
    role: 'Data Science Intern',
    start: 'Feb 2023',
    end: 'Aug 2023',
    summary: 'Large-scale ETL workflows and analytics automation',
    description: 'Processed 10M+ records using PySpark and Hive for large-scale ETL workflows.',
    impact: [
      'Built automated data pipelines for transformation and model input preparation',
      'Created data visualizations and collaborated on pipeline optimization and validation',
    ],
    tech: ['Python', 'SQL', 'PySpark', 'Hive', 'Tableau', 'Excel'],
    impactSummary: 'Increased automation efficiency and improved team throughput on analytics tasks.',
    logo: '/hk-portfolio/logos/nineleaps.png',
  },
  {
    id: 'nastech-ai-ml',
    company: 'NASTECH',
    role: 'AI & Machine Learning Intern',
    start: 'Jun 2022',
    end: 'Sep 2022',
    summary: 'CNN-based driver drowsiness detection model achieving 98% accuracy',
    description: 'Designed a CNN-based driver drowsiness detection model achieving 98% accuracy.',
    impact: [
      'Implemented real-time eye-tracking and alert systems with OpenCV and dlib',
      'Developed the full ML lifecycle—from dataset preparation to deployment and performance tuning',
    ],
    tech: ['Python', 'OpenCV', 'dlib', 'TensorFlow', 'Keras', 'NumPy'],
    impactSummary: 'Created a real-time safety solution combining computer vision with applied AI.',
    logo: '/hk-portfolio/logos/nastech.png',
  },
];

export default experiences;
