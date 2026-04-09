import React from 'react';
import { ExternalLink, Calendar, Award, MapPin, Github, Linkedin, Twitter, Mail, Phone, Globe, Terminal, ChevronRight, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ContactForm } from '@/components/portfolio/ContactForm';
import type { FullPortfolioData, Project, Experience, Skill } from '@/pages/PublicPortfolio';
import { AnimatedBackground, CursorEffects } from '@/components/portfolio/effects';
import { motion } from 'framer-motion';

interface HackerThemeProps {
  data: FullPortfolioData;
}

type SectionType = 'about' | 'projects' | 'experience' | 'skills' | 'certifications' | 'custom_sections' | 'contact';

// Instagram icon
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export function HackerTheme({ data }: HackerThemeProps) {
  const { portfolio, projects = [], experiences = [], skills = [], certifications = [], customSections = [], sections, sectionOrder } = data;

  // Safely format date with fallback
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  // Default section order if not provided
  const defaultOrder = {
    hero_order: 0,
    about_order: 1,
    projects_order: 2,
    experience_order: 3,
    skills_order: 4,
    certifications_order: 5,
    custom_sections_order: 6,
    contact_order: 7,
  };

  const safeOrder = sectionOrder || defaultOrder;

  const orderedSections: { type: SectionType; order: number }[] = [
    { type: 'about', order: safeOrder.about_order ?? 1 },
    { type: 'projects', order: safeOrder.projects_order ?? 2 },
    { type: 'experience', order: safeOrder.experience_order ?? 3 },
    { type: 'skills', order: safeOrder.skills_order ?? 4 },
    { type: 'certifications', order: safeOrder.certifications_order ?? 5 },
    { type: 'custom_sections', order: safeOrder.custom_sections_order ?? 6 },
    { type: 'contact', order: safeOrder.contact_order ?? 7 },
  ];
  orderedSections.sort((a, b) => a.order - b.order);

  // Group skills by category (with safe default)
  const groupedSkills = (skills || []).reduce((acc, skill) => {
    const category = skill.category || 'Skills';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  // Social links
  const socialLinks = [
    { url: portfolio.github_url, icon: Github, label: 'GitHub' },
    { url: portfolio.linkedin_url, icon: Linkedin, label: 'LinkedIn' },
    { url: portfolio.twitter_url, icon: Twitter, label: 'Twitter' },
    { url: portfolio.instagram_url, icon: InstagramIcon, label: 'Instagram' },
    { url: portfolio.website_url, icon: Globe, label: 'Website' },
  ].filter(l => l.url);

  // Safe sections flags with defaults (show all if sections not defined)
  const safeSections = sections || {
    show_projects: true,
    show_experience: true,
    show_skills: true,
    show_certifications: true,
    show_contact: true,
  };

  // Navigation links - terminal style
  const navLinks = [
    { id: 'about', label: '<about/>', show: !!portfolio.bio },
    { id: 'skills', label: '<skills/>', show: safeSections.show_skills !== false && skills.length > 0 },
    { id: 'projects', label: '<projects/>', show: safeSections.show_projects !== false && projects.length > 0 },
    { id: 'experience', label: '<experience/>', show: safeSections.show_experience !== false && experiences.length > 0 },
    { id: 'certifications', label: '<certs/>', show: safeSections.show_certifications !== false && certifications.length > 0 },
    { id: 'contact', label: '<contact/>', show: safeSections.show_contact !== false },
  ].filter(l => l.show);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Hero Section
  const renderHero = () => (
    <header className="min-h-screen flex flex-col relative">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#00FF41]/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Terminal className="h-5 w-5 text-[#00FF41]" />
            <span className="font-mono text-[#00FF41] text-sm">
              ~/{portfolio.title.toLowerCase().replace(/\s+/g, '-')}
            </span>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="font-mono text-sm text-gray-500 hover:text-[#00FF41] transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {socialLinks.slice(0, 3).map(({ url, icon: Icon, label }) => (
              <a
                key={label}
                href={url!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#00FF41] transition-colors"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="flex-1 flex items-center pt-20">
        <div className="max-w-6xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              {/* Terminal prompt */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-mono text-sm text-gray-500 mb-4"
              >
                <span className="text-[#00FF41]">$</span> cat profile.json
              </motion.div>

              {/* Name with terminal styling */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 font-mono"
              >
                {portfolio.title}
                <span className="text-[#00FF41] animate-pulse">_</span>
              </motion.h1>

              {/* Tagline */}
              {portfolio.tagline && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl text-[#00FF41] font-mono mb-4"
                >
                  // {portfolio.tagline}
                </motion.p>
              )}

              {/* Location */}
              {portfolio.location && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-2 text-gray-400 font-mono text-sm mb-6"
                >
                  <MapPin className="h-4 w-4 text-[#00FF41]" />
                  <span>{portfolio.location}</span>
                </motion.div>
              )}

              {/* Bio preview */}
              {portfolio.bio && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-400 leading-relaxed mb-8 max-w-lg"
                >
                  {portfolio.bio.length > 200 ? portfolio.bio.substring(0, 200) + '...' : portfolio.bio}
                </motion.p>
              )}

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                {safeSections.show_contact !== false && (
                  <Button
                    onClick={() => scrollToSection('contact')}
                    className="bg-[#00FF41] text-black hover:bg-[#00FF41]/90 font-mono font-semibold"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    ./contact.sh
                  </Button>
                )}
                {safeSections.show_projects !== false && projects.length > 0 && (
                  <Button
                    onClick={() => scrollToSection('projects')}
                    variant="outline"
                    className="border-[#00FF41]/50 text-[#00FF41] hover:bg-[#00FF41]/10 font-mono"
                  >
                    ls ./projects
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </motion.div>
            </div>

            {/* Right side - Avatar in terminal window */}
            {portfolio.avatar_url && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center lg:justify-end"
              >
                <div className="relative">
                  {/* Terminal window frame */}
                  <div className="bg-[#0a0a0a] border border-[#00FF41]/30 rounded-lg overflow-hidden shadow-2xl shadow-[#00FF41]/10">
                    {/* Terminal header */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#111] border-b border-[#00FF41]/20">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                      <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                      <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                      <span className="ml-3 font-mono text-gray-500 text-xs">avatar.png</span>
                    </div>
                    {/* Avatar content */}
                    <div className="p-2">
                      <img
                        src={portfolio.avatar_url}
                        alt={portfolio.title}
                        className="w-64 h-64 md:w-80 md:h-80 object-cover"
                      />
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 border border-[#00FF41]/20 rounded-lg -z-10" />
                  <div className="absolute -top-4 -left-4 w-16 h-16 border border-[#00FF41]/10 rounded-lg -z-10" />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <span className="font-mono text-xs">scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#00FF41] to-transparent" />
        </div>
      </motion.div>
    </header>
  );

  // About Section
  const renderAbout = () => {
    if (!portfolio.bio) return null;

    return (
      <section id="about" className="py-24 border-t border-[#00FF41]/10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <Terminal className="h-5 w-5 text-[#00FF41]" />
            <h2 className="text-2xl font-bold text-white font-mono">
              <span className="text-[#00FF41]">$</span> cat about.md
            </h2>
          </div>

          <div className="bg-[#111] border border-[#00FF41]/20 rounded-lg p-6 md:p-8">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {portfolio.bio}
            </p>
          </div>
        </div>
      </section>
    );
  };

  // Skills Section
  const renderSkills = () => {
    if (safeSections.show_skills === false || skills.length === 0) return null;

    return (
      <section id="skills" className="py-24 border-t border-[#00FF41]/10 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-12">
            <Code2 className="h-5 w-5 text-[#00FF41]" />
            <h2 className="text-2xl font-bold text-white font-mono">
              <span className="text-[#00FF41]">$</span> ls ./skills
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(groupedSkills).map(([category, categorySkills]) => (
              <div
                key={category}
                className="bg-[#111] border border-[#00FF41]/20 rounded-lg overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-[#00FF41]/10 bg-[#0a0a0a]">
                  <h3 className="text-[#00FF41] font-mono text-sm">{`// ${category}`}</h3>
                </div>
                <div className="p-4 space-y-3">
                  {categorySkills.map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between">
                      <span className="text-gray-300 font-mono text-sm">{skill.name}</span>
                      {skill.proficiency && (
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1 bg-[#222] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#00FF41] rounded-full"
                              style={{ width: `${skill.proficiency}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 font-mono w-8">{skill.proficiency}%</span>
                        </div>
                      )}
                    </div>
                  ))}
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
    if (safeSections.show_projects === false || projects.length === 0) return null;

    const sortedProjects = [...projects].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });

    return (
      <section id="projects" className="py-24 border-t border-[#00FF41]/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-12">
            <Terminal className="h-5 w-5 text-[#00FF41]" />
            <h2 className="text-2xl font-bold text-white font-mono">
              <span className="text-[#00FF41]">$</span> ls ./projects
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {sortedProjects.map((project) => (
              <article
                key={project.id}
                className="group bg-[#111] border border-[#00FF41]/20 rounded-lg overflow-hidden hover:border-[#00FF41]/50 transition-colors"
              >
                {project.image_url && (
                  <div className="aspect-video overflow-hidden relative">
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {project.featured && (
                      <Badge className="absolute top-3 left-3 bg-[#00FF41] text-black font-mono text-xs">
                        featured
                      </Badge>
                    )}
                  </div>
                )}

                <div className="p-5">
                  <h3 className="text-lg font-bold text-white font-mono mb-2 group-hover:text-[#00FF41] transition-colors">
                    {project.title}
                  </h3>

                  {(project.short_description || project.description) && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {project.short_description || project.description}
                    </p>
                  )}

                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] text-xs font-mono rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    {project.project_url && (
                      <a
                        href={project.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#00FF41] hover:underline flex items-center gap-1 font-mono"
                      >
                        demo <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-400 hover:text-[#00FF41] flex items-center gap-1 font-mono"
                      >
                        source <Github className="h-3 w-3" />
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

  // Experience Section
  const renderExperience = () => {
    if (safeSections.show_experience === false || experiences.length === 0) return null;

    return (
      <section id="experience" className="py-24 border-t border-[#00FF41]/10 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-12">
            <Terminal className="h-5 w-5 text-[#00FF41]" />
            <h2 className="text-2xl font-bold text-white font-mono">
              <span className="text-[#00FF41]">$</span> history --career
            </h2>
          </div>

          <div className="space-y-6">
            {experiences.map((exp, index) => (
              <div
                key={exp.id}
                className="relative pl-6 border-l-2 border-[#00FF41]/30 pb-6 last:pb-0"
              >
                {/* Timeline dot */}
                <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-[#00FF41]" />

                <div className="bg-[#111] border border-[#00FF41]/20 rounded-lg p-5">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                    <div>
                      {exp.is_current && (
                        <Badge className="bg-[#00FF41]/20 text-[#00FF41] border-0 font-mono text-xs mb-2">
                          current
                        </Badge>
                      )}
                      <h3 className="text-lg font-bold text-white font-mono">{exp.position}</h3>
                      <p className="text-[#00FF41] font-mono text-sm">
                        @ {exp.company}
                        {exp.location && <span className="text-gray-500"> • {exp.location}</span>}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500 font-mono whitespace-nowrap">
                      {formatDate(exp.start_date)} → {exp.is_current ? 'present' : exp.end_date ? formatDate(exp.end_date) : ''}
                    </div>
                  </div>

                  {exp.description && (
                    <p className="text-gray-400 text-sm mb-4">{exp.description}</p>
                  )}

                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="space-y-1 mb-4">
                      {exp.achievements.map((achievement, idx) => (
                        <li
                          key={idx}
                          className="text-gray-400 text-sm flex items-start gap-2 font-mono"
                        >
                          <span className="text-[#00FF41]">→</span>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  )}

                  {exp.technologies_used && exp.technologies_used.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {exp.technologies_used.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 bg-[#00FF41]/10 text-[#00FF41] text-xs font-mono rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
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
    if (safeSections.show_certifications === false || certifications.length === 0) return null;

    return (
      <section id="certifications" className="py-24 border-t border-[#00FF41]/10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-12">
            <Award className="h-5 w-5 text-[#00FF41]" />
            <h2 className="text-2xl font-bold text-white font-mono">
              <span className="text-[#00FF41]">$</span> cat ./certifications
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {certifications.map((cert) => (
              <div
                key={cert.id}
                className="bg-[#111] border border-[#00FF41]/20 rounded-lg p-5 hover:border-[#00FF41]/40 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 flex items-center justify-center bg-[#00FF41]/10 border border-[#00FF41]/30 rounded flex-shrink-0">
                    <Award className="h-5 w-5 text-[#00FF41]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-mono font-medium text-sm truncate">{cert.name}</h3>
                    <p className="text-gray-400 text-xs font-mono">{cert.issuer}</p>
                    {cert.issue_date && (
                      <p className="text-gray-500 text-xs mt-2 flex items-center gap-1 font-mono">
                        <Calendar className="h-3 w-3" />
                        {formatDate(cert.issue_date)}
                      </p>
                    )}
                    {cert.credential_url && (
                      <a
                        href={cert.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#00FF41] hover:underline mt-2 font-mono"
                      >
                        verify <ExternalLink className="h-3 w-3" />
                      </a>
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

  // Contact Section
  const renderContact = () => {
    if (safeSections.show_contact === false) return null;

    return (
      <section id="contact" className="py-24 border-t border-[#00FF41]/10 bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <Mail className="h-5 w-5 text-[#00FF41]" />
            <h2 className="text-2xl font-bold text-white font-mono">
              <span className="text-[#00FF41]">$</span> ./contact.sh
            </h2>
          </div>

          <p className="text-gray-400 mb-8 font-mono text-sm">
            // Ready to connect? Send me a message.
          </p>

          <div className="bg-[#111] border border-[#00FF41]/20 rounded-lg p-6 md:p-8">
            <ContactForm
              portfolioId={portfolio.id}
              portfolioTitle={portfolio.title}
              variant="dark"
            />
          </div>

          {/* Contact info */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {portfolio.contact_email && (
              <a
                href={`mailto:${portfolio.contact_email}`}
                className="flex items-center gap-2 px-4 py-2 bg-[#111] border border-[#00FF41]/20 rounded text-gray-400 hover:text-[#00FF41] hover:border-[#00FF41]/40 transition-colors font-mono text-sm"
              >
                <Mail className="h-4 w-4" />
                {portfolio.contact_email}
              </a>
            )}
            {portfolio.contact_phone && (
              <a
                href={`tel:${portfolio.contact_phone}`}
                className="flex items-center gap-2 px-4 py-2 bg-[#111] border border-[#00FF41]/20 rounded text-gray-400 hover:text-[#00FF41] hover:border-[#00FF41]/40 transition-colors font-mono text-sm"
              >
                <Phone className="h-4 w-4" />
                {portfolio.contact_phone}
              </a>
            )}
          </div>

          {/* Social links */}
          {socialLinks.length > 0 && (
            <div className="mt-6 flex justify-center gap-3">
              {socialLinks.map(({ url, icon: Icon, label }) => (
                <a
                  key={label}
                  href={url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-[#111] border border-[#00FF41]/20 rounded text-gray-400 hover:text-[#00FF41] hover:border-[#00FF41]/40 transition-colors"
                  title={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
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
          <section key={section.id} className="py-24 border-t border-[#00FF41]/10">
            <div className="max-w-4xl mx-auto px-6">
              <div className="flex items-center gap-3 mb-8">
                <Terminal className="h-5 w-5 text-[#00FF41]" />
                <h2 className="text-2xl font-bold text-white font-mono">
                  <span className="text-[#00FF41]">$</span> cat {section.title.toLowerCase().replace(/\s+/g, '-')}.md
                </h2>
              </div>
              {section.content && (
                <div className="bg-[#111] border border-[#00FF41]/20 rounded-lg p-6 md:p-8">
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {section.content}
                  </div>
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
    <div className="min-h-screen bg-[#0d0d0d] text-white relative overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
      `}</style>

      {/* Animated Background */}
      <AnimatedBackground variant="cyber" backgroundStyle={portfolio.background_style} />

      {/* Cursor Effects */}
      <CursorEffects primaryColor="#00FF41" />

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
      <footer className="py-8 border-t border-[#00FF41]/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600 font-mono">
              <span className="text-[#00FF41]">©</span> {new Date().getFullYear()} {portfolio.title}
            </p>
            <p className="text-xs text-gray-700 font-mono">
              // Built with code
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
