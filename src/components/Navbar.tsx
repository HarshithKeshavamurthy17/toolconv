import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Github, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'About', href: '#about' },
        { name: 'Experience', href: '#experience' },
        { name: 'Projects', href: '#projects' },
        { name: 'Skills', href: '#skills' },
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-4 glass' : 'py-6 bg-transparent'
                }`}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                <Link to="/" className="text-2xl font-bold tracking-tighter hover:text-cyan-400 transition-colors">
                    HK<span className="text-cyan-400">.</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <ul className="flex items-center gap-8">
                        {navLinks.map((link) => (
                            <li key={link.name}>
                                <a
                                    href={link.href}
                                    className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                                >
                                    {link.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <div className="flex items-center gap-4 border-l border-white/10 pl-8">
                        <a href="https://github.com/HarshithKeshavamurthy17" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors">
                            <Github className="w-5 h-5" />
                        </a>
                        <a href="https://www.linkedin.com/in/harshith-k-bu/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors">
                            <Linkedin className="w-5 h-5" />
                        </a>
                        <a href="mailto:harshithk17@gmail.com" className="text-muted-foreground hover:text-white transition-colors">
                            <Mail className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden glass border-t border-white/10 overflow-hidden"
                    >
                        <ul className="flex flex-col p-4 gap-4">
                            {navLinks.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className="block text-lg font-medium text-muted-foreground hover:text-white transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                            <div className="flex gap-6 pt-4 border-t border-white/10">
                                <a href="https://github.com/HarshithKeshavamurthy17" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white">
                                    <Github className="w-6 h-6" />
                                </a>
                                <a href="https://www.linkedin.com/in/harshith-k-bu/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white">
                                    <Linkedin className="w-6 h-6" />
                                </a>
                                <a href="mailto:harshithk17@gmail.com" className="text-muted-foreground hover:text-white">
                                    <Mail className="w-6 h-6" />
                                </a>
                            </div>
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
