import { useState } from 'react';
import { ArrowUpRight, ExternalLink, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgressiveImage } from '@/components/ui/progressive-image';
import { ProjectDetailModal } from './ProjectDetailModal';
import type { Project } from '@/pages/PublicPortfolio';

interface ProjectsSectionProps {
  projects: Project[];
  variant?: 'minimal' | 'modern' | 'bold' | 'cyberpunk' | 'corporate' | 'neon' | 'editorial' | 'warm';
}

export function ProjectsSection({ projects, variant = 'minimal' }: ProjectsSectionProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  if (projects.length === 0) return null;

  // Sort: featured first
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MINIMAL - Clean case study style
  // ═══════════════════════════════════════════════════════════════════════════
  const renderMinimal = () => (
    <div className="space-y-16">
      {sortedProjects.map((project, index) => (
        <article 
          key={project.id}
          className="group cursor-pointer"
          onClick={() => setSelectedProject(project)}
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {project.image_url && (
              <div className={index % 2 !== 0 ? 'md:order-2' : ''}>
                <ProgressiveImage
                  src={project.image_url}
                  alt={project.title}
                  aspectRatio="auto"
                  className="aspect-[4/3] rounded-lg group-hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
            )}
            
            <div className={index % 2 !== 0 ? 'md:order-1' : ''}>
              {project.featured && (
                <p className="text-xs uppercase tracking-widest text-accent mb-3">Featured Project</p>
              )}
              
              <h3 className="text-2xl md:text-3xl font-display font-bold mb-4 group-hover:text-accent transition-colors">
                {project.title}
              </h3>
              
              {(project.short_description || project.description) && (
                <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-3">
                  {project.short_description || project.description}
                </p>
              )}
              
              {project.technologies && project.technologies.length > 0 && (
                <p className="text-sm text-muted-foreground/70 mb-6">
                  {project.technologies.slice(0, 5).join(' · ')}
                </p>
              )}
              
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium group-hover:underline">View Project</span>
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // MODERN - Alternating layout with strong visual presence
  // ═══════════════════════════════════════════════════════════════════════════
  const renderModern = () => (
    <div className="space-y-20">
      {sortedProjects.map((project, index) => (
        <article 
          key={project.id}
          className="group cursor-pointer"
          onClick={() => setSelectedProject(project)}
        >
          <div className={`grid gap-8 lg:gap-12 ${index % 2 === 0 ? 'lg:grid-cols-[1.5fr_1fr]' : 'lg:grid-cols-[1fr_1.5fr]'} items-center`}>
            {project.image_url && (
              <div className={index % 2 !== 0 ? 'lg:order-2' : ''}>
                <ProgressiveImage
                  src={project.image_url}
                  alt={project.title}
                  aspectRatio="video"
                  className="rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            )}
            
            <div className={index % 2 !== 0 ? 'lg:order-1' : ''}>
              <div className="flex items-center gap-3 mb-4">
                {project.featured && (
                  <span className="text-xs font-medium uppercase tracking-wider text-accent">Featured</span>
                )}
                {project.project_type && (
                  <span className="text-xs text-muted-foreground">· {project.project_type}</span>
                )}
              </div>
              
              <h3 className="text-3xl md:text-4xl font-display font-bold mb-4 group-hover:text-accent transition-colors">
                {project.title}
              </h3>
              
              {(project.short_description || project.description) && (
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  {project.short_description || project.description}
                </p>
              )}
              
              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.slice(0, 5).map((tech) => (
                    <span key={tech} className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-2 text-accent font-medium">
                <span>View Details</span>
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // BOLD - Editorial case-study style, content-first
  // ═══════════════════════════════════════════════════════════════════════════
  const renderBold = () => (
    <div className="space-y-20">
      {sortedProjects.slice(0, 6).map((project, index) => (
        <article 
          key={project.id}
          className="group cursor-pointer"
          onClick={() => setSelectedProject(project)}
        >
          {/* Alternating layout for visual rhythm */}
          <div className={`grid gap-8 md:gap-12 ${index % 2 === 0 ? 'md:grid-cols-[1.2fr_1fr]' : 'md:grid-cols-[1fr_1.2fr]'} items-center`}>
            {/* Image - Constrained, professional */}
            {project.image_url && (
              <div className={index % 2 !== 0 ? 'md:order-2' : ''}>
                <ProgressiveImage
                  src={project.image_url}
                  alt={project.title}
                  aspectRatio="auto"
                  className="aspect-[4/3] rounded-xl group-hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
            )}
            
            {/* Content - Clear hierarchy */}
            <div className={index % 2 !== 0 ? 'md:order-1' : ''}>
              {/* Featured badge - Subtle */}
              {project.featured && (
                <p className="text-xs uppercase tracking-widest text-accent mb-3 font-medium">Featured Project</p>
              )}
              
              {/* Title - Dominant */}
              <h3 className="text-2xl md:text-3xl font-display font-bold mb-4 group-hover:text-accent transition-colors leading-tight">
                {project.title}
              </h3>
              
              {/* Description - Readable */}
              {(project.short_description || project.description) && (
                <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-3">
                  {project.short_description || project.description}
                </p>
              )}
              
              {/* Technologies - Secondary, not overwhelming */}
              {project.technologies && project.technologies.length > 0 && (
                <p className="text-sm text-muted-foreground/70 mb-6">
                  {project.technologies.slice(0, 4).join(' · ')}
                </p>
              )}
              
              {/* CTA - Clear action */}
              <div className="flex items-center gap-2 text-sm font-medium group-hover:text-accent transition-colors">
                <span>View Case Study</span>
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // CYBERPUNK - Terminal interface style
  // ═══════════════════════════════════════════════════════════════════════════
  const renderCyberpunk = () => (
    <div className="space-y-6">
      {sortedProjects.map((project) => (
        <article 
          key={project.id}
          className="group cursor-pointer border border-[#00FFE1]/20 hover:border-[#00FFE1]/60 transition-colors bg-black/30"
          onClick={() => setSelectedProject(project)}
        >
          <div className="grid md:grid-cols-[1fr_2fr] gap-0">
            {project.image_url && (
              <ProgressiveImage
                src={project.image_url}
                alt={project.title}
                aspectRatio="video"
                className="md:aspect-auto opacity-80 group-hover:opacity-100 transition-opacity"
              />
            )}
            
            <div className="p-6 border-l border-[#00FFE1]/20">
              <div className="flex items-center gap-3 mb-3 font-mono text-xs">
                {project.featured && <span className="text-[#8A2EFF]">[FEATURED]</span>}
                <span className="text-[#00FF88]/60">{project.project_type || 'PROJECT'}</span>
              </div>
              
              <h3 className="text-xl font-mono text-[#00FFE1] mb-3 group-hover:text-shadow-glow transition-all">
                {'>'} {project.title}
              </h3>
              
              {(project.short_description || project.description) && (
                <p className="text-sm text-[#E5FFF9]/60 font-mono mb-4 line-clamp-2">
                  {project.short_description || project.description}
                </p>
              )}
              
              {project.technologies && project.technologies.length > 0 && (
                <p className="text-xs font-mono text-[#00FF88]/50 mb-4">
                  stack: [{project.technologies.slice(0, 4).join(', ')}]
                </p>
              )}
              
              <span className="text-sm font-mono text-[#00FFE1]/70 group-hover:text-[#00FFE1]">
                [OPEN →]
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // CORPORATE - Professional grid
  // ═══════════════════════════════════════════════════════════════════════════
  const renderCorporate = () => (
    <div className="grid gap-8 md:grid-cols-2">
      {sortedProjects.map((project) => (
        <article 
          key={project.id}
          className="group cursor-pointer bg-white rounded-lg border border-[#E2E8F0] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          onClick={() => setSelectedProject(project)}
        >
          {project.image_url && (
            <ProgressiveImage
              src={project.image_url}
              alt={project.title}
              aspectRatio="video"
              className="group-hover:scale-105 transition-transform duration-500"
            />
          )}
          
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              {project.project_type && (
                <span className="text-xs font-medium text-[#2563EB] uppercase tracking-wider">{project.project_type}</span>
              )}
              {project.featured && (
                <span className="text-xs font-medium text-[#EA580C]">· Featured</span>
              )}
            </div>
            
            <h3 className="text-xl font-semibold text-[#0F172A] mb-3 group-hover:text-[#1E3A8A] transition-colors">
              {project.title}
            </h3>
            
            {(project.short_description || project.description) && (
              <p className="text-sm text-[#64748B] mb-4 line-clamp-2">
                {project.short_description || project.description}
              </p>
            )}
            
            <div className="flex items-center gap-2 text-[#1E3A8A] text-sm font-medium">
              <span>View Details</span>
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // NEON - Vibrant cards
  // ═══════════════════════════════════════════════════════════════════════════
  const renderNeon = () => (
    <div className="grid gap-8 md:grid-cols-2">
      {sortedProjects.map((project) => (
        <article 
          key={project.id}
          className="group cursor-pointer rounded-2xl border border-[#FF3CAC]/20 overflow-hidden bg-[#15151F]/80 hover:border-[#FF3CAC]/50 transition-colors"
          onClick={() => setSelectedProject(project)}
        >
          {project.image_url && (
            <ProgressiveImage
              src={project.image_url}
              alt={project.title}
              aspectRatio="video"
              className="group-hover:scale-105 transition-transform duration-500"
            />
          )}
          
          <div className="p-6">
            {project.featured && (
              <span className="text-xs font-medium text-[#FF3CAC] mb-2 block">Featured</span>
            )}
            
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#FF3CAC] transition-colors">
              {project.title}
            </h3>
            
            {(project.short_description || project.description) && (
              <p className="text-sm text-white/60 mb-4 line-clamp-2">
                {project.short_description || project.description}
              </p>
            )}
            
            {project.technologies && project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies.slice(0, 3).map((tech) => (
                  <span key={tech} className="text-xs px-2 py-1 rounded border border-[#FF3CAC]/30 text-[#FF3CAC]/70">
                    {tech}
                  </span>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-2 text-[#FF3CAC] text-sm font-medium">
              <span>View Project</span>
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // EDITORIAL - Refined magazine style
  // ═══════════════════════════════════════════════════════════════════════════
  const renderEditorial = () => (
    <div className="space-y-16">
      {sortedProjects.map((project, index) => (
        <article 
          key={project.id}
          className="group cursor-pointer border-b border-[#E5E7EB] pb-16 last:border-0"
          onClick={() => setSelectedProject(project)}
        >
          <div className={`grid gap-8 lg:gap-16 ${index % 2 === 0 ? 'lg:grid-cols-[2fr_1fr]' : 'lg:grid-cols-[1fr_2fr]'} items-center`}>
            {project.image_url && (
              <div className={index % 2 !== 0 ? 'lg:order-2' : ''}>
                <ProgressiveImage
                  src={project.image_url}
                  alt={project.title}
                  aspectRatio="auto"
                  className="aspect-[4/3] grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>
            )}
            
            <div className={index % 2 !== 0 ? 'lg:order-1 lg:text-right' : ''}>
              <div className={`flex items-center gap-3 mb-4 ${index % 2 !== 0 ? 'lg:justify-end' : ''}`}>
                {project.featured && <span className="text-xs uppercase tracking-widest text-[#9CA3AF]">Featured</span>}
                {project.project_type && <span className="text-xs uppercase tracking-widest text-[#9CA3AF]">· {project.project_type}</span>}
              </div>
              
              <h3 className="text-3xl md:text-4xl font-serif font-light text-[#111827] mb-4 group-hover:italic transition-all">
                {project.title}
              </h3>
              
              {(project.short_description || project.description) && (
                <p className="text-[#6B7280] leading-relaxed mb-6 line-clamp-3">
                  {project.short_description || project.description}
                </p>
              )}
              
              <span className={`text-xs uppercase tracking-widest text-[#374151] group-hover:tracking-[0.3em] transition-all ${index % 2 !== 0 ? 'lg:block' : ''}`}>
                Read More →
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // WARM - Friendly rounded cards
  // ═══════════════════════════════════════════════════════════════════════════
  const renderWarm = () => (
    <div className="grid gap-8 md:grid-cols-2">
      {sortedProjects.map((project) => (
        <article 
          key={project.id}
          className="group cursor-pointer bg-white rounded-2xl border border-[#FED7AA]/50 overflow-hidden shadow-md hover:shadow-xl transition-all"
          onClick={() => setSelectedProject(project)}
        >
          {project.image_url && (
            <ProgressiveImage
              src={project.image_url}
              alt={project.title}
              aspectRatio="video"
              className="group-hover:scale-105 transition-transform duration-500"
            />
          )}
          
          <div className="p-6">
            {project.featured && (
              <span className="text-xs font-medium text-[#EA580C] mb-2 block">Featured</span>
            )}
            
            <h3 className="text-xl font-semibold text-[#7C2D12] mb-3 group-hover:text-[#EA580C] transition-colors">
              {project.title}
            </h3>
            
            {(project.short_description || project.description) && (
              <p className="text-sm text-[#9A3412]/70 mb-4 line-clamp-2">
                {project.short_description || project.description}
              </p>
            )}
            
            <div className="flex items-center gap-2 text-[#EA580C] text-sm font-medium">
              <span>View Project</span>
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );

  // Render based on variant
  const renderProjects = () => {
    switch (variant) {
      case 'minimal': return renderMinimal();
      case 'modern': return renderModern();
      case 'bold': return renderBold();
      case 'cyberpunk': return renderCyberpunk();
      case 'corporate': return renderCorporate();
      case 'neon': return renderNeon();
      case 'editorial': return renderEditorial();
      case 'warm': return renderWarm();
      default: return renderMinimal();
    }
  };

  return (
    <>
      {renderProjects()}
      <ProjectDetailModal 
        project={selectedProject} 
        open={selectedProject !== null}
        onClose={() => setSelectedProject(null)} 
      />
    </>
  );
}
