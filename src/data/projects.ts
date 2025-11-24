export type Project = {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  impact: string[];
  tech: string[];
  links: { label: string; href: string; kind: 'code' | 'demo' | 'pdf' | 'case' }[];
  badges?: string[];
  thumb?: string;
  darkThumb?: string;
  preview?: {
    src: string;
    type: 'video' | 'gif';
  };
  metrics?: Record<string, string>;
  imageFit?: 'cover' | 'contain';
};

export const projects: Project[] = [
  {
    id: 'posture-analytics',
    title: 'AI 3D Posture & Motion Analytics',
    subtitle: 'Real-time biomechanical analysis using computer vision',
    summary: 'A production-ready AI platform that transforms 2D video into interactive 3D biomechanical analytics for injury prevention and performance optimization.',
    impact: [
      'Reduced memory footprint by 90% using streaming generator pattern',
      'Optimized real-time health checks with thread pool offloading',
      'Implemented robust CORS for secure cross-origin data transfer'
    ],
    tech: ['React', 'Python', 'OpenCV', 'Three.js', 'MediaPipe'],
    links: [
      { label: 'Demo', kind: 'demo', href: 'https://3d-posture-analytics-ai.vercel.app' },
      { label: 'Code', kind: 'code', href: 'https://github.com/HarshithKeshavamurthy17/3d-posture-analytics' }
    ],
    badges: ['AI/ML', 'Computer Vision', 'HealthTech'],
    thumb: '/thumbs/posture_analytics_logo.png',
    darkThumb: '/thumbs/posture_analytics_logo.png',
    preview: { src: '/thumbs/posture_analytics.png', type: 'gif' },
    metrics: {
      'Memory Usage': '-90%',
      'Accuracy': '98%',
      'Latency': '<100ms'
    },
    imageFit: 'cover'
  },
  {
    id: 'vi-graph-rag',
    title: 'VI-Graph-RAG',
    subtitle: 'Graph-aware retrieval for vulnerability triage',
    summary: 'Graph-aware retrieval system that connects CVEs, CWEs, and mitigations using Neo4j and LangChain to provide grounded answers for security analysts.',
    impact: [
      'Graph-aware retrieval for vulnerability triage',
      'Neo4j + LangChain + Azure',
      'Evaluation harness for answer grounding',
    ],
    tech: ['Python', 'Neo4j', 'LangChain', 'Azure', 'FastAPI'],
    links: [
      { label: 'Code', kind: 'code', href: 'https://github.com/HarshithKeshavamurthy17/VI-Graph-RAG' },
    ],
    badges: ['Cybersecurity', 'Graph RAG'],
    thumb: '/hk-portfolio/thumbs/vi-graph-rag.png',
    darkThumb: '/hk-portfolio/thumbs/vi-graph-rag.png',
    preview: { src: '/assets/projects/vi-graph-rag-preview.png', type: 'gif' },
  },
  {
    id: 'f1-race-win-predictor',
    title: 'F1 Race Win Predictor',
    subtitle: 'ML model predicting F1 race winners',
    summary: 'ML model predicting F1 race winners with 95.3% accuracy using 30 years of historical data, 25 engineered features, and Random Forest ensemble.',
    impact: [
      '95.3% accuracy on test set',
      '30 years of historical data processed',
      'Random Forest ensemble model',
    ],
    tech: ['Python', 'Scikit-learn', 'Random Forest', 'Streamlit', 'Pandas', 'Plotly'],
    links: [
      { label: 'Code', kind: 'code', href: 'https://github.com/HarshithKeshavamurthy17/F1-Race-Win-Predictor' },
      { label: 'Demo', kind: 'demo', href: 'https://f1-win-predictor-app.streamlit.app/' },
    ],
    badges: ['Machine Learning', 'Sports Analytics'],
    thumb: '/hk-portfolio/thumbs/f1-predictor.png',
    darkThumb: '/hk-portfolio/thumbs/f1-predictor.png',
    preview: { src: '/assets/projects/f1-preview.png', type: 'gif' },
    metrics: {
      accuracy: '95.3%',
      features: '25',
    },
  },
  {
    id: 'oncovision',
    title: 'OncoVision',
    subtitle: 'Deep learning for ultrasound analysis',
    summary: 'Deep learning system for automated breast ultrasound analysis using U-Net with attention mechanisms to segment and classify tissue types.',
    impact: [
      'U-Net with attention mechanisms',
      'Automated tissue segmentation',
      'Early detection support tool',
    ],
    tech: ['PyTorch', 'U-Net', 'ResNet50', 'Streamlit', 'Albumentations'],
    links: [
      { label: 'Code', kind: 'code', href: 'https://github.com/HarshithKeshavamurthy17/OncoVision' },
      { label: 'Demo', kind: 'demo', href: 'https://oncovision-akj8dwacntroekz8qxa7gs.streamlit.app/' },
    ],
    badges: ['Deep Learning', 'Healthcare AI'],
    thumb: '/hk-portfolio/thumbs/oncovision.png',
    darkThumb: '/hk-portfolio/thumbs/oncovision.png',
    preview: { src: '/assets/projects/oncovision-preview.png', type: 'gif' },
    metrics: {
      iou: '0.85',
      precision: '0.89',
    },
  },
  {
    id: 'autokpi',
    title: 'AutoKPI',
    subtitle: 'Automated KPI extraction & visualization',
    summary: 'Automated KPI extraction and visualization tool that processes unstructured business reports to generate interactive dashboards.',
    impact: [
      'Automated extraction from unstructured text',
      'Interactive dashboard generation',
      'Reduced reporting time by 80%',
    ],
    tech: ['Python', 'NLP', 'React', 'D3.js', 'Flask'],
    links: [
      { label: 'Code', kind: 'code', href: 'https://github.com/HarshithKeshavamurthy17/AutoKPI' },
      { label: 'Demo', kind: 'demo', href: 'https://autokpi-hk-app.streamlit.app/' },
    ],
    badges: ['NLP', 'Business Intelligence'],
    thumb: '/hk-portfolio/thumbs/autokpi.png',
    darkThumb: '/hk-portfolio/thumbs/autokpi.png',
    preview: { src: '/assets/projects/autokpi-preview.png', type: 'gif' },
    metrics: {
      efficiency: '+80%',
      accuracy: '92%',
    },
  },
  {
    id: 'lexguard',
    title: 'LexGuard',
    subtitle: 'AI Legal Assistant',
    summary: 'Democratizing legal accessibility with Agentic AI and RAG-powered contract analysis. An advanced platform for deep semantic analysis and risk scoring.',
    impact: [
      'Automated risk scoring & classification',
      'Deep semantic analysis of contracts',
      'Interactive AI legal assistant',
    ],
    tech: ['FastAPI', 'Streamlit', 'LangChain', 'ChromaDB', 'OpenAI'],
    links: [
      { label: 'Code', kind: 'code', href: 'https://github.com/HarshithKeshavamurthy17/lexguard' },
      { label: 'Demo', kind: 'demo', href: 'https://lexguard-app.streamlit.app/' },
    ],
    badges: ['LegalTech', 'Agentic AI'],
    thumb: '/hk-portfolio/thumbs/lexguard.png',
    darkThumb: '/hk-portfolio/thumbs/lexguard.png',
    preview: { src: '/assets/projects/lexguard-preview.png', type: 'gif' },
    metrics: {
      speed: '10x',
      clarity: 'High',
    },
    imageFit: 'contain',
  },
];

export default projects;
