import React from 'react';
import { Calendar, Award, ExternalLink } from 'lucide-react';
import { ExperienceSection } from '@/components/portfolio/ExperienceSection';
import { SkillsSection } from '@/components/portfolio/SkillsSection';
import { ProjectsSection } from '@/components/portfolio/ProjectsSection';
import { ContactSection } from '@/components/portfolio/ContactSection';
import { HeroSection } from '@/components/portfolio/HeroSection';
import { AboutSection } from '@/components/portfolio/AboutSection';
import { CustomSectionDisplay } from '@/components/portfolio/CustomSectionDisplay';
import { AnimatedBackground, CursorEffects } from '@/components/portfolio/effects';
import { format } from 'date-fns';
import type { FullPortfolioData } from '@/pages/PublicPortfolio';

interface BoldThemeProps {
  data: FullPortfolioData;
}

type SectionType = 'about' | 'projects' | 'experience' | 'skills' | 'certifications' | 'custom_sections' | 'contact';

export function BoldTheme({ data }: BoldThemeProps) {
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

  // Content-first section header - left-aligned, clear hierarchy
  const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div className="mb-12 max-w-2xl">
      <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-2">{title}</h2>
      {subtitle && <p className="text-lg text-muted-foreground leading-relaxed">{subtitle}</p>}
    </div>
  );

  const renderSection = (type: SectionType): React.ReactNode => {
    switch (type) {
      case 'about':
        if (!portfolio.bio) return null;
        return (
          <AboutSection 
            portfolio={portfolio} 
            experiences={experiences} 
            skills={skills} 
            variant="bold" 
          />
        );
      case 'projects':
        if (!sections.show_projects || projects.length === 0) return null;
        return (
          <section id="projects">
            <SectionHeader title="Selected Work" subtitle="Projects I'm proud of" />
            <ProjectsSection projects={projects} variant="bold" />
          </section>
        );
      case 'experience':
        if (!sections.show_experience || experiences.length === 0) return null;
        return (
          <section>
            <SectionHeader title="Experience" subtitle="Where I've contributed" />
            <div className="max-w-3xl">
              <ExperienceSection experiences={experiences} variant="minimal" />
            </div>
          </section>
        );
      case 'skills':
        if (!sections.show_skills || skills.length === 0) return null;
        return (
          <section>
            <SectionHeader title="Expertise" subtitle="Technologies and tools" />
            <SkillsSection skills={skills} variant="minimal" />
          </section>
        );
      case 'certifications':
        if (!sections.show_certifications || certifications.length === 0) return null;
        return (
          <section>
            <SectionHeader title="Credentials" />
            <div className="max-w-3xl space-y-4">
              {certifications.map((cert) => (
                <div 
                  key={cert.id} 
                  className="flex items-start gap-4 py-4 border-b border-border/50 last:border-0"
                >
                  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Award className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{cert.name}</h3>
                    <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                    <div className="flex items-center gap-4 mt-1">
                      {cert.issue_date && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {formatDate(cert.issue_date)}
                        </span>
                      )}
                      {cert.credential_url && (
                        <a 
                          href={cert.credential_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-accent hover:underline flex items-center gap-1"
                        >
                          Verify <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
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
                <SectionHeader title={section.title} />
                <div className="max-w-3xl">
                  <CustomSectionDisplay section={section} variant="bold" />
                </div>
              </section>
            ))}
          </>
        );
      case 'contact':
        if (!sections.show_contact) return null;
        return (
          <section id="contact">
            <SectionHeader title="Get in Touch" subtitle="Let's discuss your next project" />
            <ContactSection portfolio={portfolio} variant="bold" />
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-foreground relative bg-background">
      {/* Subtle background - supports content, doesn't overpower */}
      <AnimatedBackground variant="bold" backgroundStyle={portfolio.background_style} />
      
      {/* Cursor Effects */}
      <CursorEffects />

      {/* Hero Section - Authority and clarity */}
      <HeroSection 
        portfolio={portfolio} 
        variant="bold" 
        showProjectsCTA={sections.show_projects && projects.length > 0}
        showContactCTA={sections.show_contact}
      />

      {/* Main Content - Readable column with proper framing */}
      <main className="relative z-10 max-w-4xl mx-auto py-20 md:py-28 px-6">
        <div className="space-y-24 md:space-y-32">
          {orderedSections.map(({ type }) => {
            const content = renderSection(type);
            if (!content) return null;
            return <React.Fragment key={type}>{content}</React.Fragment>;
          })}
        </div>
      </main>

      {/* Footer - Simple and grounded */}
      <footer className="relative z-10 border-t border-border/50 py-10 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {portfolio.title}
          </p>
          <p className="text-xs text-muted-foreground/60">
            Built with intention
          </p>
        </div>
      </footer>
    </div>
  );
}
