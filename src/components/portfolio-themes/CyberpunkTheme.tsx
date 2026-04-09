import React, { useState, useEffect } from 'react';
import { ExternalLink, Calendar, Award, Shield, CheckCircle, Zap, Server, Github, Linkedin, Heart, ArrowUp } from 'lucide-react';
import { ExperienceSection } from '@/components/portfolio/ExperienceSection';
import { SkillsSection } from '@/components/portfolio/SkillsSection';
import { ProjectsSection } from '@/components/portfolio/ProjectsSection';
import { ContactSection } from '@/components/portfolio/ContactSection';
import { HeroSection } from '@/components/portfolio/HeroSection';
import { AboutSection } from '@/components/portfolio/AboutSection';
import { CustomSectionDisplay } from '@/components/portfolio/CustomSectionDisplay';
import { AnimatedBackground, CursorEffects } from '@/components/portfolio/effects';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { BRAND } from '@/config/branding';
import { Link } from 'react-router-dom';
import type { FullPortfolioData } from '@/pages/PublicPortfolio';

interface CyberpunkThemeProps {
  data: FullPortfolioData;
}

type SectionType = 'about' | 'projects' | 'experience' | 'skills' | 'certifications' | 'custom_sections' | 'contact';

// Trust strip component
function TrustStrip({ projects, experiences }: { projects: any[]; experiences: any[] }) {
  const yearsExp = experiences.length > 0 
    ? Math.max(1, Math.floor((Date.now() - new Date(experiences.sort((a, b) => 
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      )[0]?.start_date || Date.now()).getTime()) / (365.25 * 24 * 60 * 60 * 1000)))
    : 0;

  const trustItems = [
    { icon: Shield, label: 'Verified Professional', color: '#FF9900' },
    { icon: CheckCircle, label: `${projects.length}+ Projects`, color: '#00FF88' },
    { icon: Zap, label: `${yearsExp}+ Years Exp`, color: '#00FFE1' },
    { icon: Server, label: 'Full Stack', color: '#8A2EFF' },
  ];

  return (
    <section className="py-6 border-y border-[#00FFE1]/20 bg-[#0A0F14]/50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {trustItems.map((item, index) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">
                <item.icon className="h-4 w-4" style={{ color: item.color }} />
              </div>
              <span className="text-sm font-mono text-[#E5FFF9]/80 whitespace-nowrap">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Section divider
function SectionDivider() {
  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-[#00FFE1]/30 to-transparent" />
      </div>
    </div>
  );
}

// Back to top button
function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[#00FFE1]/10 border border-[#00FFE1]/30 flex items-center justify-center text-[#00FFE1] hover:bg-[#00FFE1]/20 transition-all"
      aria-label="Back to top"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}

// Enhanced section header
function SectionHeader({ title, icon }: { title: string; icon?: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-px flex-1 bg-gradient-to-r from-[#8A2EFF]/50 to-transparent" />
        <span className="text-xs font-mono text-[#8A2EFF]">{'<'}{icon || 'section'}{'>'}</span>
        <div className="h-px flex-1 bg-gradient-to-l from-[#8A2EFF]/50 to-transparent" />
      </div>
      <h2 className="text-2xl md:text-3xl font-mono font-bold text-[#00FFE1] text-center">
        {title}
      </h2>
    </div>
  );
}

export function CyberpunkTheme({ data }: CyberpunkThemeProps) {
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

  const renderSection = (type: SectionType): React.ReactNode => {
    switch (type) {
      case 'about':
        if (!portfolio.bio) return null;
        return (
          <section id="about">
            <SectionHeader title="About Me" icon="about" />
            <AboutSection 
              portfolio={portfolio} 
              experiences={experiences} 
              skills={skills} 
              variant="cyberpunk" 
            />
          </section>
        );
      case 'projects':
        if (!sections.show_projects || projects.length === 0) return null;
        return (
          <section id="projects">
            <SectionHeader title="Projects" icon="projects" />
            <ProjectsSection projects={projects} variant="cyberpunk" />
          </section>
        );
      case 'experience':
        if (!sections.show_experience || experiences.length === 0) return null;
        return (
          <section id="experience">
            <SectionHeader title="Experience" icon="work" />
            <ExperienceSection experiences={experiences} variant="cyberpunk" />
          </section>
        );
      case 'skills':
        if (!sections.show_skills || skills.length === 0) return null;
        return (
          <section id="skills">
            <SectionHeader title="Tech Stack" icon="skills" />
            <SkillsSection skills={skills} variant="cyberpunk" />
          </section>
        );
      case 'certifications':
        if (!sections.show_certifications || certifications.length === 0) return null;
        return (
          <section id="certifications">
            <SectionHeader title="Certifications" icon="certs" />
            <div className="grid gap-4 md:grid-cols-2">
              {certifications.map((cert) => (
                <article 
                  key={cert.id} 
                  className="group p-6 border border-[#00FFE1]/20 bg-[#0A0F14]/60 backdrop-blur-sm hover:border-[#00FFE1]/40 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 flex items-center justify-center border border-[#00FF88]/40 bg-[#00FF88]/10 flex-shrink-0">
                      <Award className="h-6 w-6 text-[#00FF88]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-mono font-semibold text-[#E5FFF9] text-lg group-hover:text-[#00FFE1] transition-colors">
                        {cert.name}
                      </h3>
                      <p className="text-[#E5FFF9]/60 mt-1 font-mono text-sm">{cert.issuer}</p>
                      {cert.issue_date && (
                        <p className="text-xs text-[#00FFE1]/60 mt-2 flex items-center gap-2 font-mono">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(cert.issue_date)}
                        </p>
                      )}
                      {cert.credential_url && (
                        <a 
                          href={cert.credential_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-[#00FF88] hover:text-[#00FFE1] mt-3 transition-colors font-mono"
                        >
                          [VERIFY] <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      case 'custom_sections':
        if (!customSections || customSections.length === 0) return null;
        return (
          <>
            {customSections.map((section) => (
              <section key={section.id}>
                <SectionHeader title={section.title} icon="custom" />
                <CustomSectionDisplay section={section} variant="cyberpunk" />
              </section>
            ))}
          </>
        );
      case 'contact':
        if (!sections.show_contact) return null;
        return (
          <section id="contact">
            <SectionHeader title="Get In Touch" icon="contact" />
            <ContactSection portfolio={portfolio} variant="cyberpunk" />
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-[#E5FFF9] font-sans relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
        
        .neon-glow {
          text-shadow: 0 0 10px rgba(0, 255, 225, 0.5), 0 0 20px rgba(0, 255, 225, 0.3);
        }
        
        .neon-border {
          border: 1px solid rgba(0, 255, 225, 0.3);
          box-shadow: 0 0 20px rgba(0, 255, 225, 0.1), inset 0 0 20px rgba(0, 255, 225, 0.05);
        }
      `}</style>

      {/* Animated Background */}
      <AnimatedBackground variant="cyber" backgroundStyle={portfolio.background_style} />
      
      {/* Cursor Effects */}
      <CursorEffects primaryColor="#00FFE1" />

      {/* Hero Section */}
      <HeroSection 
        portfolio={portfolio} 
        variant="cyberpunk" 
        showProjectsCTA={sections.show_projects && projects.length > 0}
        showContactCTA={sections.show_contact}
      />

      {/* Trust Strip */}
      <TrustStrip projects={projects} experiences={experiences} />

      <main className="relative max-w-4xl mx-auto px-6 py-16 space-y-16">
        {orderedSections.map(({ type }, index) => {
          const content = renderSection(type);
          if (!content) return null;
          return (
            <React.Fragment key={type}>
              {index > 0 && <SectionDivider />}
              {content}
            </React.Fragment>
          );
        })}
      </main>

      {/* Premium footer */}
      <footer className="border-t border-[#00FFE1]/20 bg-[#05070B]">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-mono font-bold text-[#00FFE1] neon-glow mb-1">
                {portfolio.title}
              </h3>
              <p className="text-sm text-[#E5FFF9]/50 font-mono">
                {portfolio.tagline || 'Full Stack Developer'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {portfolio.github_url && (
                <a 
                  href={portfolio.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#E5FFF9] hover:text-[#00FFE1] hover:border-[#00FFE1]/50 transition-all"
                >
                  <Github className="h-5 w-5" />
                </a>
              )}
              {portfolio.linkedin_url && (
                <a 
                  href={portfolio.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#E5FFF9] hover:text-[#0A66C2] hover:border-[#0A66C2]/50 transition-all"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
            </div>

            <p className="text-xs text-[#E5FFF9]/40 font-mono">
              © {new Date().getFullYear()} {portfolio.title}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-[#00FFE1]/10 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-[#E5FFF9]/50 hover:text-[#00FFE1] transition-colors font-mono"
            >
              Made with <Heart className="h-3.5 w-3.5 text-red-500" /> using{' '}
              <span className="text-[#00FFE1] font-semibold">{BRAND.name}</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </footer>

      {/* Back to top */}
      <BackToTop />
    </div>
  );
}
