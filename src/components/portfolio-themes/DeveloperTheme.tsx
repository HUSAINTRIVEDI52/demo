import React from 'react';
import { ExternalLink, Calendar, Award, MapPin, Github, Linkedin, Twitter, Mail, Phone, Globe, ArrowDown, ArrowUpRight, Briefcase, Code2, Terminal, Zap, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ContactForm } from '@/components/portfolio/ContactForm';
import type { FullPortfolioData, Project, Experience, Skill } from '@/pages/PublicPortfolio';
import { CursorEffects, AnimatedBackground } from '@/components/portfolio/effects';

interface DeveloperThemeProps {
  data: FullPortfolioData;
}

type SectionType = 'about' | 'projects' | 'experience' | 'skills' | 'certifications' | 'custom_sections' | 'contact';

// Behance icon component
const BehanceIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 1.898 1.459 2.584 2.85 2.584 1.037 0 1.879-.388 2.345-1.055h2.561zm-7.677-4.166h4.91c-.056-1.291-.661-2.164-2.404-2.164-1.63 0-2.344.921-2.506 2.164zM4.5 15.5h-.061V8.5H.5V19h4.061c2.865 0 4.939-1.016 4.939-3.625 0-1.875-1.25-2.875-4-2.875zm-1 5H3V14h.5c1.812 0 2.5.563 2.5 1.875 0 1.5-.938 1.625-2.5 1.625zm1-7h-.5V11h.5c1.25 0 2-.25 2-1.5S5.75 8 4.5 8H3v3.5h.5c1.25 0 2 .25 2 1.5s-.75 1.5-2 1.5z"/>
  </svg>
);

// Medium icon component
const MediumIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
  </svg>
);

// Instagram icon
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export function DeveloperTheme({ data }: DeveloperThemeProps) {
  const { portfolio, projects, experiences, skills, certifications, customSections, sections, sectionOrder } = data;

  const formatDate = (dateStr: string) => format(new Date(dateStr), 'MMM yyyy');

  const orderedSections: { type: SectionType; order: number }[] = [
    { type: 'about', order: sectionOrder.about_order },
    { type: 'projects', order: sectionOrder.projects_order },
    { type: 'experience', order: sectionOrder.experience_order },
    { type: 'skills', order: sectionOrder.skills_order },
    { type: 'certifications', order: sectionOrder.certifications_order },
    { type: 'custom_sections', order: sectionOrder.custom_sections_order },
    { type: 'contact', order: sectionOrder.contact_order },
  ];
  orderedSections.sort((a, b) => a.order - b.order);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || 'Core Skills';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  // Social links
  const socialLinks = [
    { url: portfolio.github_url, icon: Github, label: 'GitHub', color: '#ffffff' },
    { url: portfolio.linkedin_url, icon: Linkedin, label: 'LinkedIn', color: '#0A66C2' },
    { url: portfolio.twitter_url, icon: Twitter, label: 'Twitter', color: '#1DA1F2' },
    { url: portfolio.instagram_url, icon: InstagramIcon, label: 'Instagram', color: '#E4405F' },
    { url: portfolio.contact_email ? `mailto:${portfolio.contact_email}` : null, icon: Mail, label: 'Email', color: '#EA4335' },
    { url: portfolio.medium_url, icon: MediumIcon, label: 'Medium', color: '#ffffff' },
    { url: portfolio.behance_url, icon: BehanceIcon, label: 'Behance', color: '#1769FF' },
    { url: portfolio.website_url, icon: Globe, label: 'Website', color: '#10B981' },
  ].filter(l => l.url);

  // Hero Section
  const renderHero = () => (
    <header className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0f0f18] to-[#0a0a0f]" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]" 
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} 
      />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] bg-gradient-to-r from-blue-600/20 to-purple-600/10" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] bg-gradient-to-r from-emerald-600/10 to-cyan-600/10" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="order-2 lg:order-1">
            {/* Greeting */}
            <p className="text-lg text-gray-400 mb-4 flex items-center gap-2">
              <span className="text-2xl">👋</span> Hi! I'm
            </p>
            
            {/* Name */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1]">
              {portfolio.title}
            </h1>
            
            {/* Bio text */}
            {portfolio.bio && (
              <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-xl">
                {portfolio.bio.length > 300 ? portfolio.bio.substring(0, 300) + '...' : portfolio.bio}
              </p>
            )}
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-10">
              {sections.show_contact && (
                <Button 
                  onClick={() => scrollToSection('contact')}
                  className="bg-white text-black hover:bg-gray-200 font-semibold px-8 py-6 text-base rounded-full"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Me
                </Button>
              )}
              {sections.show_projects && projects.length > 0 && (
                <Button 
                  onClick={() => scrollToSection('projects')}
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-white/10 font-semibold px-8 py-6 text-base rounded-full"
                >
                  View Projects
                </Button>
              )}
            </div>
            
            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-4 flex-wrap">
                {socialLinks.map(({ url, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={url!}
                    target={url!.startsWith('mailto:') ? undefined : '_blank'}
                    rel={url!.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    className="w-12 h-12 rounded-full border border-gray-700 bg-gray-800/50 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 hover:bg-gray-700/50 transition-all"
                    aria-label={label}
                    title={label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            )}
          </div>
          
          {/* Right side - Avatar */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            {portfolio.avatar_url ? (
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-emerald-500/30 blur-2xl opacity-50" />
                
                {/* Avatar image */}
                <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-4 border-gray-800/50">
                  <img 
                    src={portfolio.avatar_url} 
                    alt={portfolio.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Role badge */}
                {portfolio.tagline && (
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap shadow-lg">
                    {portfolio.tagline.length > 30 ? portfolio.tagline.substring(0, 30) + '...' : portfolio.tagline}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border-4 border-gray-700">
                <Terminal className="h-24 w-24 text-gray-600" />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ArrowDown className="h-6 w-6 text-gray-500" />
      </div>
    </header>
  );

  // Experience Section
  const renderExperience = () => {
    if (!sections.show_experience || experiences.length === 0) return null;
    
    return (
      <section id="experience" className="py-24 bg-[#0f0f18]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-12">
            <Briefcase className="h-8 w-8 text-blue-500" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">Experience</h2>
          </div>
          
          <div className="space-y-0">
            {experiences.map((exp, index) => (
              <div 
                key={exp.id} 
                className="relative grid md:grid-cols-[200px_1fr] gap-4 md:gap-8"
              >
                {/* Date column */}
                <div className="hidden md:block text-right pt-1">
                  <p className="text-sm font-medium text-gray-400">{formatDate(exp.start_date)}</p>
                  <p className="text-sm text-gray-500">{exp.is_current ? 'Present' : exp.end_date ? formatDate(exp.end_date) : ''}</p>
                  {exp.location && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center justify-end gap-1">
                      <MapPin className="h-3 w-3" />
                      {exp.location}
                    </p>
                  )}
                </div>
                
                {/* Timeline + Content */}
                <div className="relative pl-8 pb-12 last:pb-0 border-l-2 border-gray-700">
                  {/* Timeline dot */}
                  <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                  
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{exp.position}</h3>
                        <p className="text-blue-400 font-medium">{exp.company}</p>
                      </div>
                      {exp.employment_type && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 w-fit">
                          {exp.employment_type}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Mobile date/location */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-3 md:hidden">
                      <span>{formatDate(exp.start_date)} – {exp.is_current ? 'Present' : exp.end_date ? formatDate(exp.end_date) : ''}</span>
                      {exp.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {exp.location}
                        </span>
                      )}
                    </div>
                    
                    {/* Achievements */}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="space-y-2 mt-4">
                        {exp.achievements.map((achievement, idx) => (
                          <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-emerald-400 mt-1">•</span>
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {/* Technologies */}
                    {exp.technologies_used && exp.technologies_used.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {exp.technologies_used.map((tech) => (
                          <span key={tech} className="text-xs px-2 py-1 rounded-md bg-gray-700/50 text-gray-300 border border-gray-600/50">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Projects Section
  const renderProjects = () => {
    if (!sections.show_projects || projects.length === 0) return null;
    
    const sortedProjects = [...projects].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
    
    return (
      <section id="projects" className="py-24 bg-[#0a0a0f]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <Code2 className="h-8 w-8 text-purple-500" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">Featured Projects</h2>
          </div>
          <p className="text-gray-400 mb-12 max-w-2xl">
            A collection of projects that showcase my skills and experience in building modern web applications.
          </p>
          
          <div className="grid gap-8 md:grid-cols-2">
            {sortedProjects.map((project) => (
              <article 
                key={project.id}
                className="group bg-gray-800/30 rounded-2xl overflow-hidden border border-gray-700/50 hover:border-gray-600 transition-all"
              >
                {/* Project image */}
                {project.image_url && (
                  <div className="aspect-video overflow-hidden bg-gray-800 relative">
                    <img 
                      src={project.image_url} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {project.featured && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                          Featured
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Featured badge when no image */}
                {!project.image_url && project.featured && (
                  <div className="px-6 pt-6">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                      Featured
                    </Badge>
                  </div>
                )}
                
                {/* Project content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                  
                  {(project.short_description || project.description) && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {project.short_description || project.description}
                    </p>
                  )}
                  
                  {/* Technologies */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.slice(0, 5).map((tech) => (
                        <span key={tech} className="text-xs px-3 py-1 rounded-full bg-gray-700/50 text-gray-300 border border-gray-600/50">
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 5 && (
                        <span className="text-xs px-3 py-1 rounded-full bg-gray-700/30 text-gray-500">
                          +{project.technologies.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Links */}
                  <div className="flex items-center gap-3">
                    {project.project_url && (
                      <a 
                        href={project.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium"
                      >
                        <Globe className="h-4 w-4" />
                        Live Demo
                      </a>
                    )}
                    {project.github_url && (
                      <a 
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
                      >
                        <Github className="h-4 w-4" />
                        Source
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Skills Section
  const renderSkills = () => {
    if (!sections.show_skills || skills.length === 0) return null;
    
    return (
      <section id="skills" className="py-24 bg-[#0f0f18]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-12">
            <Zap className="h-8 w-8 text-emerald-500" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">Skills & Technologies</h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(groupedSkills).map(([category, categorySkills]) => (
              <div key={category} className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => (
                    <span 
                      key={skill.id}
                      className="text-sm text-gray-300 px-3 py-1.5 rounded-lg bg-gray-700/50 border border-gray-600/50 hover:border-blue-500/50 hover:text-white transition-colors"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Certifications Section
  const renderCertifications = () => {
    if (!sections.show_certifications || certifications.length === 0) return null;
    
    return (
      <section id="certifications" className="py-24 bg-[#0a0a0f]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-12">
            <Award className="h-8 w-8 text-amber-500" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">Certifications</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {certifications.map((cert) => (
              <article 
                key={cert.id} 
                className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-500/30 flex-shrink-0">
                    <Award className="h-6 w-6 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white mb-1">{cert.name}</h3>
                    <p className="text-gray-400">{cert.issuer}</p>
                    {cert.issue_date && (
                      <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(cert.issue_date)}
                      </p>
                    )}
                    {cert.credential_url && (
                      <a 
                        href={cert.credential_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 mt-3 transition-colors"
                      >
                        Verify Credential <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Contact Section
  const renderContact = () => {
    if (!sections.show_contact) return null;
    
    return (
      <section id="contact" className="py-24 bg-[#0f0f18]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-6">
            <MessageSquare className="h-8 w-8 text-blue-500" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">Get In Touch</h2>
          </div>
          
          <p className="text-gray-400 mb-12 max-w-2xl">
            I'm always interested in hearing about new opportunities, collaborations, or just a friendly chat. Feel free to reach out!
          </p>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left side - Contact Info */}
            <div className="space-y-8">
              {/* Direct contact options */}
              <div className="space-y-4">
                {portfolio.contact_email && (
                  <a 
                    href={`mailto:${portfolio.contact_email}`}
                    className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-colors group"
                  >
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30">
                      <Mail className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white font-medium group-hover:text-blue-400 transition-colors">{portfolio.contact_email}</p>
                    </div>
                  </a>
                )}
                
                {portfolio.contact_phone && (
                  <a 
                    href={`tel:${portfolio.contact_phone}`}
                    className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-emerald-500/50 transition-colors group"
                  >
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-emerald-500/30">
                      <Phone className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <p className="text-white font-medium group-hover:text-emerald-400 transition-colors">{portfolio.contact_phone}</p>
                    </div>
                  </a>
                )}
                
                {portfolio.location && (
                  <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30">
                      <MapPin className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Location</p>
                      <p className="text-white font-medium">{portfolio.location}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-4">Connect with me</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {socialLinks.map(({ url, icon: Icon, label }) => (
                      <a
                        key={label}
                        href={url!}
                        target={url!.startsWith('mailto:') ? undefined : '_blank'}
                        rel={url!.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                        className="w-12 h-12 rounded-xl border border-gray-700 bg-gray-800/50 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 hover:bg-gray-700/50 transition-all"
                        aria-label={label}
                        title={label}
                      >
                        <Icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Availability badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm text-emerald-400">Available for new opportunities</span>
              </div>
            </div>
            
            {/* Right side - Contact Form */}
            <div className="bg-gray-800/30 rounded-2xl p-6 md:p-8 border border-gray-700/50">
              <h3 className="text-xl font-semibold text-white mb-6">Send a Message</h3>
              <ContactForm
                portfolioId={portfolio.id}
                portfolioTitle={portfolio.title}
                variant="dark"
              />
            </div>
          </div>
        </div>
      </section>
    );
  };

  // About Section
  const renderAbout = () => {
    if (!portfolio.bio) return null;
    
    return (
      <section id="about" className="py-24 bg-[#0a0a0f]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">About Me</h2>
          <div className="prose prose-lg prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed text-lg">
              {portfolio.bio}
            </p>
          </div>
          
          {portfolio.location && (
            <p className="flex items-center gap-2 text-gray-400 mt-6">
              <MapPin className="h-5 w-5" />
              {portfolio.location}
            </p>
          )}
        </div>
      </section>
    );
  };

  // Custom Sections
  const renderCustomSections = () => {
    if (!customSections || customSections.length === 0) return null;
    
    return (
      <>
        {customSections.map((section) => (
          <section key={section.id} className="py-24 bg-[#0f0f18]">
            <div className="max-w-4xl mx-auto px-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">{section.title}</h2>
              {section.content && (
                <div className="prose prose-lg prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{section.content}</p>
                </div>
              )}
            </div>
          </section>
        ))}
      </>
    );
  };

  const renderSection = (type: SectionType): React.ReactNode => {
    switch (type) {
      case 'about': return renderAbout();
      case 'projects': return renderProjects();
      case 'experience': return renderExperience();
      case 'skills': return renderSkills();
      case 'certifications': return renderCertifications();
      case 'custom_sections': return renderCustomSections();
      case 'contact': return renderContact();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* Animated Background - respects background_style setting */}
      <AnimatedBackground variant="dark-elite" backgroundStyle={portfolio.background_style} />

      {/* Cursor Effects */}
      <CursorEffects primaryColor="#ffffff" />

      {/* Hero */}
      {renderHero()}

      {/* Main content */}
      <main>
        {orderedSections.map(({ type }) => {
          const content = renderSection(type);
          if (!content) return null;
          return <React.Fragment key={type}>{content}</React.Fragment>;
        })}
      </main>

      {/* Footer */}
      <footer className="py-12 bg-[#05050a] border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} {portfolio.title}. All rights reserved.
            </p>
            
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-4">
                {socialLinks.slice(0, 5).map(({ url, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={url!}
                    target={url!.startsWith('mailto:') ? undefined : '_blank'}
                    rel={url!.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    className="text-gray-500 hover:text-white transition-colors"
                    aria-label={label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
