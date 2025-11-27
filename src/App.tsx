import { Suspense, lazy, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Glow } from './components/layout/Glow';
import { SEO } from './components/layout/SEO';
import { CustomCursor } from './components/CustomCursor';
import { ScrollProgress } from './components/ScrollProgress';
import { AnimatedBackground } from './components/AnimatedBackground';
import { Hero } from './components/Hero';
import TrustedBy from './components/TrustedBy';
import StickyCTA from './components/StickyCTA';
import CommandPalette, { type CommandItem } from './components/CommandPalette';
import Projects from './sections/Projects';
import Experience from './sections/Experience';
import { Skills } from './sections/Skills';
import { About } from './sections/About';
import { Contact } from './sections/Contact';

const VIGraphRAG = lazy(() => import('./routes/case/VIGraphRAG'));
const UberETL = lazy(() => import('./routes/case/UberETL'));
const F1Prediction = lazy(() => import('./routes/case/F1Prediction'));
const BreastCancerML = lazy(() => import('./routes/case/BreastCancerML'));
const CS699Ensemble = lazy(() => import('./routes/case/CS699Ensemble'));
const ProjectViGraphRag = lazy(() => import('./pages/ProjectViGraphRag'));
const ProjectF1Prediction = lazy(() => import('./pages/ProjectF1Prediction'));
const ProjectOncoVision = lazy(() => import('./pages/ProjectOncoVision'));
const ProjectAutoKPI = lazy(() => import('./pages/ProjectAutoKPI'));
const ProjectLexGuard = lazy(() => import('./pages/ProjectLexGuard'));
const ProjectPostureAnalytics = lazy(() => import('./pages/ProjectPostureAnalytics').then(module => ({ default: module.ProjectPostureAnalytics })));

const HomePage = () => {
  const [commandOpen, setCommandOpen] = useState(false);
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  const handleAnnounce = useCallback((message: string) => {
    if (!liveRegionRef.current) return;
    liveRegionRef.current.textContent = message;
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;

      const idMap: Record<string, string> = {
        g: '#projects',
        e: '#experience',
        s: '#skills',
        c: '#contact',
      };

      if (idMap[event.key]) {
        const anchor = document.querySelector(idMap[event.key]);
        if (anchor) {
          event.preventDefault();
          anchor.scrollIntoView({ behavior: 'smooth' });
          handleAnnounce(`Moved to ${idMap[event.key].replace('#', '')} section`);
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleAnnounce]);

  useEffect(() => {
    const handlePaletteToggle = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') {
        return;
      }
      const target = event.target as HTMLElement;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        return;
      }
      event.preventDefault();
      setCommandOpen((prev) => !prev);
    };

    window.addEventListener('keydown', handlePaletteToggle);
    return () => window.removeEventListener('keydown', handlePaletteToggle);
  }, []);

  const scrollToSection = useCallback(
    (selector: string, announcement: string) => {
      if (typeof document === 'undefined') {
        return;
      }
      const anchor = document.querySelector(selector);
      if (anchor) {
        anchor.scrollIntoView({ behavior: 'smooth' });
        handleAnnounce(announcement);
      }
    },
    [handleAnnounce],
  );

  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: 'go-projects',
        title: 'Go to Projects',
        description: 'Jump to highlighted projects',
        action: () => scrollToSection('#projects', 'Moved to projects section'),
      },
      {
        id: 'go-experience',
        title: 'Go to Experience',
        description: 'Scroll to experience timeline',
        action: () => scrollToSection('#experience', 'Moved to experience section'),
      },
      {
        id: 'go-skills',
        title: 'Go to Skills',
        description: 'Jump to skills stack overview',
        action: () => scrollToSection('#skills', 'Moved to skills section'),
      },
      {
        id: 'go-contact',
        title: 'Go to Contact',
        description: 'Scroll to contact form',
        action: () => scrollToSection('#contact', 'Moved to contact section'),
      },
      {
        id: 'open-resume',
        title: 'Open Resume',
        description: 'Download Harshith’s resume (PDF)',
        action: () => {
          if (typeof window !== 'undefined') {
            window.open('/hk-portfolio/assets/Harshith_Keshavamurthy_Resume.pdf', '_blank', 'noopener');
          }
          handleAnnounce('Opened resume in new tab');
        },
      },
      {
        id: 'email-harshith',
        title: 'Email Harshith',
        description: 'hk17@bu.edu',
        action: () => {
          if (typeof window !== 'undefined') {
            window.location.href = 'mailto:hk17@bu.edu';
          }
          handleAnnounce('Opening email client');
        },
      },
    ],
    [handleAnnounce, scrollToSection],
  );

  return (
    <main className="flex flex-col gap-10 pb-20">
      <div ref={liveRegionRef} aria-live="polite" className="sr-only" />
      <SEO
        title="Harshith K — Data, AI & Analytics Engineer"
        description="Harshith K blends AI/ML, data engineering, and analytics to turn noisy telemetry into reliable decisions."
        canonical="https://harinik.dev"
        jsonLd={homeJsonLd}
      />
      <div id="main-content" className="flex flex-col gap-10">
        <Hero />
        <div className="-mt-16">
          <TrustedBy />
        </div>
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Contact />
      </div>
      <StickyCTA />
      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        commands={commands}
      />
    </main>
  );
};

const homeJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Harshith K',
    url: 'https://harinik.dev/',
    email: 'mailto:hk17@bu.edu',
    sameAs: [
      'https://github.com/HarshithKeshavamurthy17',
      'https://www.linkedin.com/in/harshith-k-bu/',
      'mailto:hk17@bu.edu',
    ],
    jobTitle: 'Data & AI Engineer',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Harshith K Portfolio',
    url: 'https://harinik.dev/',
  },
];

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Page load animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Page Load Animation */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-[#020617]"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="mx-auto mb-4 size-16 rounded-full border-4 border-cyan-400/30 border-t-cyan-400"
              />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
              >
                Harshith K
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex min-h-screen flex-col bg-background text-foreground">
        <AnimatedBackground />
        <CustomCursor />
        <ScrollProgress />
        <Glow />
        <Navbar />
        <div className="flex-1">
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<Navigate to="/#projects" replace />} />
            <Route
              path="/projects/vi-graph-rag"
              element={<CaseFallbackSuspense component={<ProjectViGraphRag />} />}
            />
            <Route
              path="/projects/f1-race-win-predictor"
              element={<CaseFallbackSuspense component={<ProjectF1Prediction />} />}
            />
            <Route
              path="/projects/oncovision"
              element={<CaseFallbackSuspense component={<ProjectOncoVision />} />}
            />
            <Route
              path="/projects/autokpi"
              element={<CaseFallbackSuspense component={<ProjectAutoKPI />} />}
            />
            <Route
              path="/projects/lexguard"
              element={<CaseFallbackSuspense component={<ProjectLexGuard />} />}
            />
            <Route
              path="/case/vi-graph-rag"
              element={<CaseFallbackSuspense component={<VIGraphRAG />} />}
            />
            <Route path="/case/uber-etl" element={<CaseFallbackSuspense component={<UberETL />} />} />
            <Route
              path="/case/f1-prediction"
              element={<CaseFallbackSuspense component={<F1Prediction />} />}
            />
            <Route
              path="/case/breast-cancer-ml"
              element={<CaseFallbackSuspense component={<BreastCancerML />} />}
            />
            <Route
              path="/case/cs699-ensemble"
              element={<CaseFallbackSuspense component={<CS699Ensemble />} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

function CaseFallbackSuspense({ component }: { component: ReactNode }) {
  return <Suspense fallback={<CaseStudyFallback />}>{component}</Suspense>;
}

function CaseStudyFallback() {
  return (
    <main className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
      <div
        className="size-5 animate-spin rounded-full border-2 border-accent border-t-transparent"
        aria-hidden="true"
      />
      <p>Loading case study…</p>
    </main>
  );
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (hash) {
      return;
    }
    window.scrollTo({ top: 0, behavior: shouldReduceMotion ? 'auto' : 'smooth' });
  }, [pathname, hash, shouldReduceMotion]);

  useEffect(() => {
    if (!hash) {
      return;
    }
    const target = document.querySelector(hash);
    if (target) {
      target.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
    }
  }, [hash, shouldReduceMotion, pathname]);

  return null;
}

export default App;
