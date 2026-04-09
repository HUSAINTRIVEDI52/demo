import { useState } from 'react';
import { X, ExternalLink, Github, Play, Calendar, Users, Briefcase, Target, Lightbulb, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { format } from 'date-fns';
import type { Project } from '@/pages/PublicPortfolio';

interface ProjectDetailModalProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
  variant?: 'minimal' | 'modern' | 'bold' | 'cyberpunk' | 'corporate' | 'neon' | 'editorial' | 'warm';
}

export function ProjectDetailModal({ project, open, onClose, variant = 'minimal' }: ProjectDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!project) return null;

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  // Combine cover image with gallery images
  const allImages = [
    project.image_url,
    ...(project.gallery_images || [])
  ].filter(Boolean) as string[];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Theme-specific styles
  const themeStyles = {
    minimal: {
      accent: 'text-accent',
      accentBg: 'bg-accent/10',
      badge: 'bg-secondary text-secondary-foreground',
      techBadge: 'bg-muted text-muted-foreground',
    },
    modern: {
      accent: 'text-accent',
      accentBg: 'bg-accent/10',
      badge: 'bg-accent text-accent-foreground',
      techBadge: 'border border-border text-foreground',
    },
    bold: {
      accent: 'text-accent',
      accentBg: 'bg-accent/20',
      badge: 'bg-accent text-accent-foreground font-bold',
      techBadge: 'bg-accent/20 text-accent',
    },
    cyberpunk: {
      accent: 'text-[hsl(var(--cyberpunk-accent,142_76%_56%))]',
      accentBg: 'bg-[hsl(var(--cyberpunk-accent,142_76%_56%)/0.1)]',
      badge: 'bg-[hsl(var(--cyberpunk-accent,142_76%_56%))] text-black font-mono',
      techBadge: 'border border-[hsl(var(--cyberpunk-accent,142_76%_56%)/0.5)] text-[hsl(var(--cyberpunk-accent,142_76%_56%))] font-mono',
    },
    corporate: {
      accent: 'text-accent',
      accentBg: 'bg-accent/5',
      badge: 'bg-accent text-accent-foreground',
      techBadge: 'bg-muted text-muted-foreground',
    },
    neon: {
      accent: 'text-[hsl(var(--neon-primary,300_100%_60%))]',
      accentBg: 'bg-[hsl(var(--neon-primary,300_100%_60%)/0.1)]',
      badge: 'bg-[hsl(var(--neon-primary,300_100%_60%))] text-black',
      techBadge: 'border border-[hsl(var(--neon-primary,300_100%_60%)/0.5)] text-[hsl(var(--neon-primary,300_100%_60%))]',
    },
    editorial: {
      accent: 'text-foreground',
      accentBg: 'bg-muted',
      badge: 'bg-foreground text-background',
      techBadge: 'border border-border text-muted-foreground',
    },
    warm: {
      accent: 'text-accent',
      accentBg: 'bg-accent/10',
      badge: 'bg-accent text-accent-foreground',
      techBadge: 'bg-accent/10 text-accent',
    },
  };

  const styles = themeStyles[variant] || themeStyles.minimal;

  const isVideoUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('loom.com') || url.includes('vimeo.com');
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('loom.com/share')) {
      return url.replace('/share/', '/embed/');
    }
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <VisuallyHidden>
          <DialogTitle>{project.title}</DialogTitle>
        </VisuallyHidden>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 rounded-full bg-background/80 backdrop-blur-sm p-2 hover:bg-background transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Media Section */}
        {allImages.length > 0 && (
          <div className="relative">
            <div className="aspect-video bg-muted">
              <img
                src={allImages[currentImageIndex]}
                alt={project.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm p-2 hover:bg-background transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm p-2 hover:bg-background transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-8 space-y-8">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {project.project_type && (
                <Badge className={styles.badge}>{project.project_type}</Badge>
              )}
              {project.category && (
                <Badge variant="outline">{project.category}</Badge>
              )}
              {project.status && (
                <Badge variant={project.status === 'Completed' ? 'default' : 'secondary'}>
                  {project.status}
                </Badge>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">{project.title}</h2>
            
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-4">
              {project.role && (
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4" />
                  {project.role}
                </span>
              )}
              {(project.start_date || project.end_date) && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {project.start_date && formatDate(project.start_date)}
                  {project.end_date && ` – ${formatDate(project.end_date)}`}
                </span>
              )}
              {project.team_size && (
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {project.team_size}
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              {project.project_url && (
                <Button asChild>
                  <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Live Demo
                  </a>
                </Button>
              )}
              {project.github_url && (
                <Button variant="outline" asChild>
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-2" />
                    Repository
                  </a>
                </Button>
              )}
              {project.case_study_url && (
                <Button variant="outline" asChild>
                  <a href={project.case_study_url} target="_blank" rel="noopener noreferrer">
                    Case Study
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Demo Video */}
          {project.demo_video_url && isVideoUrl(project.demo_video_url) && (
            <div>
              <h3 className={`flex items-center gap-2 text-lg font-semibold mb-4 ${styles.accent}`}>
                <Play className="h-5 w-5" />
                Demo Video
              </h3>
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <iframe
                  src={getEmbedUrl(project.demo_video_url)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Overview */}
          {(project.short_description || project.full_description) && (
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${styles.accent}`}>Overview</h3>
              {project.short_description && (
                <p className="text-muted-foreground mb-3">{project.short_description}</p>
              )}
              {project.full_description && (
                <p className="text-muted-foreground whitespace-pre-wrap">{project.full_description}</p>
              )}
            </div>
          )}

          {/* Problem & Solution */}
          {(project.problem_statement || project.solution_summary) && (
            <div className="grid md:grid-cols-2 gap-6">
              {project.problem_statement && (
                <div className={`p-5 rounded-lg ${styles.accentBg}`}>
                  <h3 className={`flex items-center gap-2 text-lg font-semibold mb-3 ${styles.accent}`}>
                    <Target className="h-5 w-5" />
                    The Problem
                  </h3>
                  <p className="text-muted-foreground">{project.problem_statement}</p>
                </div>
              )}
              {project.solution_summary && (
                <div className={`p-5 rounded-lg ${styles.accentBg}`}>
                  <h3 className={`flex items-center gap-2 text-lg font-semibold mb-3 ${styles.accent}`}>
                    <Lightbulb className="h-5 w-5" />
                    The Solution
                  </h3>
                  <p className="text-muted-foreground">{project.solution_summary}</p>
                </div>
              )}
            </div>
          )}

          {/* Key Achievements */}
          {project.key_achievements && project.key_achievements.length > 0 && (
            <div>
              <h3 className={`flex items-center gap-2 text-lg font-semibold mb-4 ${styles.accent}`}>
                <Trophy className="h-5 w-5" />
                Key Achievements
              </h3>
              <ul className="space-y-2">
                {project.key_achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full ${styles.accentBg} ${styles.accent} flex items-center justify-center text-sm font-semibold`}>
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Metrics */}
          {project.metrics && (
            <div className={`p-5 rounded-lg ${styles.accentBg}`}>
              <h3 className={`text-lg font-semibold mb-3 ${styles.accent}`}>Impact & Metrics</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{project.metrics}</p>
            </div>
          )}

          {/* Technology Stack */}
          {((project.technologies && project.technologies.length > 0) || 
            (project.tools_used && project.tools_used.length > 0)) && (
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${styles.accent}`}>Technology Stack</h3>
              <div className="space-y-4">
                {project.technologies && project.technologies.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Technologies</p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} className={styles.techBadge} variant="outline">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {project.tools_used && project.tools_used.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Tools</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tools_used.map((tool) => (
                        <Badge key={tool} variant="secondary">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
