import { motion } from 'framer-motion';
import { ExternalLink, Github, Trophy, Target } from 'lucide-react';

interface ProjectCardProps {
  title: string;
  subtitle?: string;
  description: string;
  tags: string[];
  image: string;
  githubUrl?: string;
  liveUrl?: string;
  impact?: string[];
  metrics?: Record<string, string>;
  imageFit?: 'cover' | 'contain';
}

export function ProjectCard({ title, subtitle, description, tags, image, githubUrl, liveUrl, impact, metrics, imageFit = 'cover' }: ProjectCardProps) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="group relative rounded-xl overflow-hidden bg-card border border-white/10 flex flex-col h-full"
    >
      <div className="aspect-video overflow-hidden relative bg-black/20">
        <img
          src={image}
          alt={title}
          className={`w-full h-full transition-transform duration-500 group-hover:scale-110 ${imageFit === 'contain' ? 'object-contain p-8' : 'object-cover'
            }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-60" />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-sm">
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Github className="w-6 h-6" />
            </a>
          )}
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-6 h-6" />
            </a>
          )}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-1 group-hover:text-cyan-400 transition-colors">{title}</h3>
          {subtitle && <p className="text-sm text-cyan-400/80 font-medium">{subtitle}</p>}
        </div>

        <p className="text-muted-foreground mb-6 text-sm leading-relaxed">{description}</p>

        {impact && impact.length > 0 && (
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
              <Target className="w-3 h-3 text-cyan-400" />
              <span>Key Impact</span>
            </div>
            <ul className="space-y-1">
              {impact.map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-cyan-400/50 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 text-[10px] font-medium rounded-full bg-white/5 border border-white/10 text-cyan-200/60"
              >
                {tag}
              </span>
            ))}
          </div>

          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/20 transition-colors shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3" />
              Live Demo
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
