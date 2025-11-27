import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import projectsData from '../data/projects';
import { ProjectCard } from '../components/ProjectCard';

export default function Projects() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll position
  const checkScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', checkScroll);
      return () => carousel.removeEventListener('scroll', checkScroll);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = carouselRef.current.clientWidth * 0.8;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section id="projects" className="relative py-20 overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute right-[10%] top-[20%] size-[350px] rounded-full bg-gradient-to-br from-blue-500/15 to-transparent blur-3xl" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <motion.div
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/5 px-3 py-1 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="size-3 text-blue-400" />
            <span className="text-xs font-medium text-blue-300 uppercase tracking-wider">Showcase</span>
          </motion.div>

          <h2 className="mb-4 text-3xl md:text-4xl lg:text-5xl font-bold">
            Recent <span className="text-gradient-primary">Work</span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Production systems and research projects that solve real-world problems.
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Scroll Buttons */}
          <AnimatePresence>
            {canScrollLeft && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 z-20 -translate-y-1/2 flex size-12 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-xl transition-all hover:border-cyan-400/60 hover:bg-black/80 hover:scale-110"
                aria-label="Scroll left"
              >
                <ChevronLeft className="size-6" />
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {canScrollRight && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 z-20 -translate-y-1/2 flex size-12 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-xl transition-all hover:border-cyan-400/60 hover:bg-black/80 hover:scale-110"
                aria-label="Scroll right"
              >
                <ChevronRight className="size-6" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Scrollable Area */}
          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {projectsData.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="min-w-[350px] md:min-w-[450px] snap-center"
              >
                <Link to={`/projects/${project.id}`} className="block h-full">
                  <ProjectCard
                    title={project.title}
                    subtitle={project.subtitle}
                    description={project.summary}
                    tags={project.tech}
                    image={project.thumb || '/placeholder.png'}
                    githubUrl={project.links.find(l => l.kind === 'code')?.href}
                    liveUrl={project.links.find(l => l.kind === 'demo')?.href}
                    impact={project.impact}
                    metrics={project.metrics}
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

