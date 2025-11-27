import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Download, Menu, X, Sparkles } from 'lucide-react';
import { cn } from '../../lib/cn';

const navLinks = [
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

export function Navbar() {
  const location = useLocation();
  const { pathname, hash } = location;
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  
  const navOpacity = useTransform(scrollYProgress, [0, 0.1], [0.8, 1]);
  const navBlur = useTransform(scrollYProgress, [0, 0.1], [8, 20]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle hash navigation on page load
  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [hash]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update URL hash without triggering navigation
      window.history.pushState(null, '', `#${id}`);
      setMobileMenuOpen(false);
    }
  };

  const isActive = (id: string) => {
    // Check if we're on the home page (with or without base path)
    const isHomePage = pathname === '/' || pathname === '/hk-portfolio/' || pathname.startsWith('/hk-portfolio');
    if (!isHomePage) return false;
    return hash === `#${id}`;
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ 
          backdropFilter: `blur(${navBlur.get()}px)`,
        }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300',
          scrolled
            ? 'border-white/10 bg-[#0f172a]/90 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
            : 'border-white/5 bg-[#0f172a]/70'
        )}
      >
        {/* Gradient line at top */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-4 md:px-8 lg:px-12">
          {/* Logo */}
          <motion.button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              const basePath = import.meta.env.BASE_URL || '/hk-portfolio/';
              window.history.pushState(null, '', basePath);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative rounded-lg cursor-pointer"
          >
            <div className="relative flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="size-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-1.5"
              >
                <Sparkles className="size-full text-cyan-400" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Harshith K
              </span>
            </div>
          </motion.button>

          {/* Desktop Navigation */}
          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link, index) => (
              <motion.li
                key={link.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <button
                  onClick={() => scrollToSection(link.id)}
                  className={cn(
                    'group relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 cursor-pointer',
                    isActive(link.id)
                      ? 'text-cyan-400'
                      : 'text-neutral-400 hover:text-white'
                  )}
                >
                  <span className="relative z-10">{link.label}</span>
                  {isActive(link.id) && (
                    <motion.div
                      layoutId="navbar-pill"
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {!isActive(link.id) && (
                    <motion.div
                      className="absolute inset-0 rounded-lg bg-white/5 opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  )}
                </button>
              </motion.li>
            ))}
          </ul>

          {/* CTA Button */}
          <div className="flex items-center gap-3">
            <motion.a
              href="/hk-portfolio/assets/Harshith_Keshavamurthy_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-cyan-500/50 transition-all hover:shadow-xl hover:shadow-cyan-500/70"
            >
              <Download className="size-4" />
              <span>Resume</span>
            </motion.a>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="size-5 text-white" />
              ) : (
                <Menu className="size-5 text-white" />
              )}
            </motion.button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{
          opacity: mobileMenuOpen ? 1 : 0,
          y: mobileMenuOpen ? 0 : -20,
          pointerEvents: mobileMenuOpen ? 'auto' : 'none',
        }}
        transition={{ duration: 0.3 }}
        className="fixed inset-x-0 top-[73px] z-40 border-b border-white/10 bg-[#0f172a]/95 p-6 backdrop-blur-2xl md:hidden"
      >
        <ul className="space-y-2">
          {navLinks.map((link, index) => (
            <motion.li
              key={link.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: mobileMenuOpen ? 1 : 0,
                x: mobileMenuOpen ? 0 : -20,
              }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                onClick={() => {
                  scrollToSection(link.id);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  'block w-full text-left rounded-lg px-4 py-3 text-base font-medium transition-all cursor-pointer',
                  isActive(link.id)
                    ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border border-cyan-400/30'
                    : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                )}
              >
                {link.label}
              </button>
            </motion.li>
          ))}
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: mobileMenuOpen ? 1 : 0,
              x: mobileMenuOpen ? 0 : -20,
            }}
            transition={{ delay: navLinks.length * 0.05 }}
          >
            <a
              href="/hk-portfolio/assets/Harshith_Keshavamurthy_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-black"
            >
              <Download className="size-4" />
              <span>Download Resume</span>
            </a>
          </motion.li>
        </ul>
      </motion.div>
    </>
  );
}
