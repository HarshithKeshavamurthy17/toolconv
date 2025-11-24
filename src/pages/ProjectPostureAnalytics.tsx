import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Github, Zap, Activity, Brain, Shield, Layers } from 'lucide-react';
import { Navbar } from '../components/Navbar';

export function ProjectPostureAnalytics() {
    const features = [
        {
            icon: <Activity className="w-6 h-6 text-cyan-400" />,
            title: "AI Injury Risk Prediction",
            description: "Custom ML algorithms analyze joint angles and movement patterns to predict risks for ACL tears, back strain, and shoulder impingement."
        },
        {
            icon: <Layers className="w-6 h-6 text-purple-400" />,
            title: "Interactive 3D Visualization",
            description: "Real-time WebGL rendering of the user's skeleton, rotatable and zoomable in 3D space."
        },
        {
            icon: <Brain className="w-6 h-6 text-pink-400" />,
            title: "Comprehensive Analytics",
            description: "Detailed dashboards showing joint angles, symmetry scores, and movement quality metrics."
        },
        {
            icon: <Shield className="w-6 h-6 text-emerald-400" />,
            title: "Medical-Grade Reporting",
            description: "Generates professional reports with severity levels, warning signs, and preventive recommendations."
        }
    ];

    const challenges = [
        {
            title: "Memory Optimization for Free-Tier Hosting",
            problem: "The backend initially crashed on Render's free tier (512MB RAM) when processing high-res videos, causing 'Memory Limit Exceeded' errors.",
            solution: "I refactored the video processing pipeline from a bulk-load approach to a streaming generator pattern. I also implemented automatic frame resizing (to 480p) before processing. This reduced memory footprint by 90%, allowing the heavy ML workload to run smoothly on minimal hardware."
        },
        {
            title: "Real-Time Health Checks vs. Heavy Processing",
            problem: "Long-running video processing tasks blocked the main thread, causing the backend to fail health checks and timeout during uploads.",
            solution: "I optimized the FastAPI architecture by offloading the processing to a thread pool (switching from async def to def for CPU-bound tasks), ensuring the server remains responsive to health pings even while analyzing complex videos."
        },
        {
            title: "Cross-Origin Resource Sharing (CORS)",
            problem: "Securely connecting a Vercel frontend to a Render backend while handling file uploads.",
            solution: "Implemented a robust CORS configuration that explicitly whitelists the production domain while allowing local development, ensuring secure and seamless data transfer."
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
            <Navbar />

            <main className="pt-24 pb-16">
                {/* Hero Section */}
                <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10" />
                        <img
                            src="/thumbs/posture_analytics.png"
                            alt="AI Posture Analytics"
                            className="w-full h-full object-cover opacity-30"
                        />
                    </div>

                    <div className="container mx-auto px-4 relative z-20 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Link
                                to="/#projects"
                                className="inline-flex items-center gap-2 text-muted-foreground hover:text-cyan-400 transition-colors mb-6"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Projects
                            </Link>

                            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600">
                                AI 3D Posture & Motion Analytics
                            </h1>
                            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
                                A production-ready AI platform that transforms 2D video into interactive 3D biomechanical analytics for injury prevention and performance optimization.
                            </p>

                            <div className="flex flex-wrap justify-center gap-4">
                                <a
                                    href="https://3d-posture-analytics-ai.vercel.app"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-full font-semibold transition-all hover:scale-105"
                                >
                                    <Zap className="w-5 h-5" />
                                    Try Live Demo
                                </a>
                                <a
                                    href="https://github.com/HarshithKeshavamurthy17/3d-posture-analytics"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full font-semibold transition-all hover:scale-105 backdrop-blur-sm"
                                >
                                    <Github className="w-5 h-5" />
                                    View Source
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Content Grid */}
                <div className="container mx-auto px-4 py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-16">
                            {/* Problem & Solution */}
                            <section>
                                <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                                    <span className="w-1 h-8 bg-cyan-500 rounded-full" />
                                    The Challenge & Solution
                                </h2>
                                <div className="space-y-8">
                                    <div className="glass p-8 rounded-2xl border-l-4 border-l-red-500">
                                        <h3 className="text-xl font-bold mb-4 text-red-400">The Problem</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Athletes and patients often lack accessible, real-time feedback on their movement quality. Traditional motion capture is expensive and requires specialized hardware. I wanted to democratize biomechanical analysis using just a standard camera.
                                        </p>
                                    </div>
                                    <div className="glass p-8 rounded-2xl border-l-4 border-l-emerald-500">
                                        <h3 className="text-xl font-bold mb-4 text-emerald-400">The Solution</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            I built a full-stack web application that uses computer vision and machine learning to analyze human movement from any video source. It reconstructs a 3D skeleton in the browser and provides actionable insights on posture, stability, and injury risks.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Key Features */}
                            <section>
                                <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                                    <span className="w-1 h-8 bg-purple-500 rounded-full" />
                                    Key Features
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {features.map((feature, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.1 }}
                                            className="glass p-6 rounded-xl hover:bg-white/5 transition-colors"
                                        >
                                            <div className="mb-4 p-3 bg-white/5 rounded-lg w-fit">
                                                {feature.icon}
                                            </div>
                                            <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>

                            {/* Technical Challenges */}
                            <section>
                                <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                                    <span className="w-1 h-8 bg-pink-500 rounded-full" />
                                    Technical Challenges
                                </h2>
                                <div className="space-y-6">
                                    {challenges.map((challenge, index) => (
                                        <div key={index} className="glass p-8 rounded-2xl">
                                            <h3 className="text-xl font-bold mb-4 text-cyan-400">{challenge.title}</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <span className="text-sm font-bold text-red-400 uppercase tracking-wider">Challenge</span>
                                                    <p className="mt-1 text-muted-foreground">{challenge.problem}</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Solution</span>
                                                    <p className="mt-1 text-muted-foreground">{challenge.solution}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Future Improvements */}
                            <section>
                                <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                                    <span className="w-1 h-8 bg-yellow-500 rounded-full" />
                                    Future Improvements
                                </h2>
                                <ul className="space-y-4 list-disc list-inside text-muted-foreground glass p-8 rounded-2xl">
                                    <li><strong className="text-white">Real-time Webcam Support:</strong> Analyze movement live from the browser camera.</li>
                                    <li><strong className="text-white">User Accounts:</strong> Save history and track progress over time.</li>
                                    <li><strong className="text-white">Comparison Mode:</strong> Overlay pro athlete movements with user data.</li>
                                </ul>
                            </section>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-8">
                            {/* Tech Stack */}
                            <div className="glass p-8 rounded-2xl sticky top-24">
                                <h3 className="text-xl font-bold mb-6">Tech Stack</h3>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-semibold text-cyan-400 mb-3 uppercase tracking-wider">Frontend</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {["React", "Vite", "Three.js", "Recharts", "Tailwind CSS"].map(tag => (
                                                <span key={tag} className="px-3 py-1 bg-cyan-500/10 text-cyan-300 rounded-full text-sm border border-cyan-500/20">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-purple-400 mb-3 uppercase tracking-wider">Backend</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {["Python", "FastAPI", "OpenCV", "MediaPipe"].map(tag => (
                                                <span key={tag} className="px-3 py-1 bg-purple-500/10 text-purple-300 rounded-full text-sm border border-purple-500/20">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-pink-400 mb-3 uppercase tracking-wider">AI / ML</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {["Custom Heuristics", "NumPy", "Scikit-learn"].map(tag => (
                                                <span key={tag} className="px-3 py-1 bg-pink-500/10 text-pink-300 rounded-full text-sm border border-pink-500/20">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-emerald-400 mb-3 uppercase tracking-wider">Deployment</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {["Vercel", "Render", "GitHub Actions"].map(tag => (
                                                <span key={tag} className="px-3 py-1 bg-emerald-500/10 text-emerald-300 rounded-full text-sm border border-emerald-500/20">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                                    <a
                                        href="https://3d-posture-analytics-ai.vercel.app"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl font-semibold transition-all hover:scale-105"
                                    >
                                        <Zap className="w-5 h-5" />
                                        Launch Live Demo
                                    </a>
                                    <a
                                        href="https://github.com/HarshithKeshavamurthy17/3d-posture-analytics"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all hover:scale-105"
                                    >
                                        <Github className="w-5 h-5" />
                                        View Source Code
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
