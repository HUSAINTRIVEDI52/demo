import { motion } from 'framer-motion';
import { ExternalLink, Github, ArrowRight, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemePreset } from '../PremiumShowcase';
import { ScrollReveal, StaggerChildren, StaggerItem } from '../effects/ScrollReveal';
import { PremiumCard } from '../effects/PremiumCard';

interface ProjectsSectionProps {
  data: {
    projects: Array<{
      title: string;
      description: string;
      technologies: string[];
      imageUrl: string;
      liveUrl?: string;
      githubUrl?: string;
      featured?: boolean;
    }>;
  };
  theme: ThemePreset;
  themeConfig: any;
}

const defaultProjects = [
  {
    title: 'Cloud Infrastructure Platform',
    description: 'Designed and implemented a multi-region AWS infrastructure supporting 10M+ daily active users with 99.99% uptime. Reduced infrastructure costs by 40% through optimization.',
    technologies: ['AWS', 'Terraform', 'Kubernetes', 'Python'],
    imageUrl: '',
    featured: true,
  },
  {
    title: 'CI/CD Pipeline Automation',
    description: 'Built an enterprise-grade CI/CD pipeline reducing deployment time from hours to minutes.',
    technologies: ['Jenkins', 'Docker', 'ArgoCD', 'Helm'],
    imageUrl: '',
  },
  {
    title: 'Monitoring & Observability Stack',
    description: 'Implemented comprehensive monitoring solution with custom alerting and dashboards.',
    technologies: ['Prometheus', 'Grafana', 'ELK Stack', 'PagerDuty'],
    imageUrl: '',
  },
  {
    title: 'Disaster Recovery System',
    description: 'Designed and tested multi-region disaster recovery with RTO < 15 minutes.',
    technologies: ['AWS', 'Terraform', 'Route53', 'RDS'],
    imageUrl: '',
  },
];

export function ProjectsSection({ data, theme, themeConfig }: ProjectsSectionProps) {
  const projects = data.projects.length > 0 ? data.projects : defaultProjects;
  const featuredProject = projects.find(p => p.featured) || projects[0];
  const otherProjects = projects.filter(p => p !== featuredProject).slice(0, 3);

  return (
    <section 
      className={cn(
        "py-24 px-6",
        theme === 'cyber-neon' && "bg-[#0A0F14]/50",
        theme === 'minimal-dark' && "bg-white/[0.02]",
        theme === 'glassmorphism' && "bg-white/[0.02]"
      )}
    >
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p 
              className="text-sm uppercase tracking-widest mb-4"
              style={{ color: themeConfig.colors.primary }}
            >
              Portfolio
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-['Space_Grotesk']">
              Featured <span className="gradient-text">Projects</span>
            </h2>
          </div>
        </ScrollReveal>

        {/* Featured Project - Large Card with hover effects */}
        {featuredProject && (
          <ScrollReveal delay={0.2}>
            <PremiumCard
              theme={theme}
              themeConfig={themeConfig}
              className="rounded-2xl overflow-hidden mb-12 group"
              enableTilt={true}
              enableGlow={true}
            >
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image Side with overlay effect */}
                <div className="relative overflow-hidden">
                  <div 
                    className="aspect-video md:aspect-auto md:h-full min-h-[300px] relative transition-transform duration-700 group-hover:scale-110"
                    style={{ 
                      background: featuredProject.imageUrl 
                        ? `url(${featuredProject.imageUrl}) center/cover`
                        : `linear-gradient(135deg, ${themeConfig.colors.primary}20, ${themeConfig.colors.secondary}20)`
                    }}
                  />
                  
                  {/* Hover Overlay */}
                  <div 
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                    style={{ background: `${themeConfig.colors.background}90` }}
                  >
                    <motion.div
                      initial={{ scale: 0.8 }}
                      whileHover={{ scale: 1.1 }}
                      className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold"
                      style={{ 
                        background: `linear-gradient(135deg, ${themeConfig.colors.primary}, ${themeConfig.colors.secondary})`,
                        color: theme === 'cyber-neon' ? '#05070B' : '#FFFFFF'
                      }}
                    >
                      <Eye className="h-5 w-5" />
                      View Project
                    </motion.div>
                  </div>
                  
                  {/* Gradient overlay */}
                  <div 
                    className="absolute inset-0 pointer-events-none hidden md:block"
                    style={{ background: `linear-gradient(90deg, transparent 50%, ${themeConfig.colors.background})` }}
                  />
                  
                  {/* Featured Badge */}
                  <motion.div 
                    className={cn(
                      "absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                      theme === 'cyber-neon' && "bg-[#00FFE1] text-[#05070B]",
                      theme === 'minimal-dark' && "bg-white text-black",
                      theme === 'glassmorphism' && "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    )}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Star className="h-4 w-4" />
                    Featured
                  </motion.div>
                </div>

                {/* Content Side */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <h3 
                    className="text-2xl md:text-3xl font-bold mb-4"
                    style={{ color: themeConfig.colors.text }}
                  >
                    {featuredProject.title}
                  </h3>
                  <p 
                    className="text-lg mb-6 leading-relaxed"
                    style={{ color: themeConfig.colors.muted }}
                  >
                    {featuredProject.description}
                  </p>

                  {/* Animated Tech Stack */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {featuredProject.technologies.map((tech, index) => (
                      <motion.span
                        key={tech}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.1, y: -2 }}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300",
                          theme === 'cyber-neon' && "bg-[#00FFE1]/10 text-[#00FFE1] border border-[#00FFE1]/30 hover:shadow-[0_0_15px_rgba(0,255,225,0.3)]",
                          theme === 'minimal-dark' && "bg-white/10 text-white border border-white/20",
                          theme === 'glassmorphism' && "glass-card text-white"
                        )}
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>

                  {/* Buttons with enhanced hover */}
                  <div className="flex flex-wrap gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.98 }}
                      className="relative group/btn"
                    >
                      <div 
                        className="absolute -inset-1 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity blur-lg"
                        style={{ background: themeConfig.colors.primary }}
                      />
                      <Button
                        className={cn(
                          "relative gap-2",
                          theme === 'cyber-neon' && "bg-[#00FFE1] text-[#05070B] hover:bg-[#00FFE1]/90",
                          theme === 'minimal-dark' && "bg-white text-black hover:bg-white/90",
                          theme === 'glassmorphism' && "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        )}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Live Demo
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        className={cn(
                          "gap-2",
                          theme === 'cyber-neon' && "border-[#00FFE1]/50 text-[#00FFE1] hover:bg-[#00FFE1]/10",
                          theme === 'minimal-dark' && "border-white/30 text-white hover:bg-white/10",
                          theme === 'glassmorphism' && "border-purple-500/50 text-white hover:bg-purple-500/10"
                        )}
                      >
                        <Github className="h-4 w-4" />
                        GitHub
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </PremiumCard>
          </ScrollReveal>
        )}

        {/* Other Projects Grid with staggered animation */}
        <StaggerChildren className="grid md:grid-cols-3 gap-6" staggerDelay={0.15}>
          {otherProjects.map((project, index) => (
            <StaggerItem key={project.title}>
              <PremiumCard
                theme={theme}
                themeConfig={themeConfig}
                className="p-6 rounded-xl cursor-pointer group h-full"
                enableTilt={true}
                enableGlow={true}
              >
                <h4 
                  className="text-xl font-semibold mb-3 transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text"
                  style={{ 
                    color: themeConfig.colors.text,
                    backgroundImage: `linear-gradient(135deg, ${themeConfig.colors.primary}, ${themeConfig.colors.secondary})`
                  }}
                >
                  {project.title}
                </h4>
                <p 
                  className="text-sm mb-4 line-clamp-3"
                  style={{ color: themeConfig.colors.muted }}
                >
                  {project.description}
                </p>
                
                {/* Tech chips with hover animation */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.technologies.slice(0, 3).map((tech) => (
                    <motion.span
                      key={tech}
                      whileHover={{ scale: 1.1 }}
                      className="px-2 py-1 rounded text-xs font-medium transition-all duration-300"
                      style={{ 
                        backgroundColor: `${themeConfig.colors.primary}15`,
                        color: themeConfig.colors.primary
                      }}
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
                
                {/* Animated view details */}
                <motion.div 
                  className="flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300"
                  style={{ color: themeConfig.colors.primary }}
                  initial={{ x: -10 }}
                  whileInView={{ x: 0 }}
                >
                  View Details
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </motion.div>
              </PremiumCard>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
