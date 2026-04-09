import React from 'react';
import { Calendar, Award, Hash, ExternalLink } from 'lucide-react';
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

interface ModernThemeProps {
  data: FullPortfolioData;
}

type SectionType = 'about' | 'projects' | 'experience' | 'skills' | 'certifications' | 'custom_sections' | 'contact';

export function ModernTheme({ data }: ModernThemeProps) {
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

  const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div className="mb-12">
      <p className="text-sm font-medium text-accent uppercase tracking-wider mb-2">{subtitle || 'Section'}</p>
      <h2 className="text-3xl md:text-4xl font-display font-bold">{title}</h2>
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
            variant="modern" 
          />
        );
      case 'projects':
        if (!sections.show_projects || projects.length === 0) return null;
        return (
          <section id="projects">
            <SectionHeader title="Featured Work" subtitle="Portfolio" />
            <ProjectsSection projects={projects} variant="modern" />
          </section>
        );
      case 'experience':
        if (!sections.show_experience || experiences.length === 0) return null;
        return (
          <section>
            <SectionHeader title="Experience" subtitle="Career" />
            <ExperienceSection experiences={experiences} variant="modern" />
          </section>
        );
      case 'skills':
        if (!sections.show_skills || skills.length === 0) return null;
        return (
          <section>
            <SectionHeader title="Skills & Expertise" subtitle="Capabilities" />
            <SkillsSection skills={skills} variant="modern" />
          </section>
        );
      case 'certifications':
        if (!sections.show_certifications || certifications.length === 0) return null;
        return (
          <section>
            <SectionHeader title="Certifications" subtitle="Credentials" />
            <div className="grid gap-6 md:grid-cols-2">
              {certifications.map((cert) => (
                <div key={cert.id} className="bg-muted/30 rounded-xl p-6 border border-border/50 hover:border-accent/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Award className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{cert.name}</h3>
                      <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {cert.issue_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(cert.issue_date)}
                          </span>
                        )}
                      </div>
                      {cert.credential_url && (
                        <a 
                          href={cert.credential_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-accent hover:underline mt-3"
                        >
                          View Credential <ExternalLink className="h-3 w-3" />
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
                <CustomSectionDisplay section={section} variant="modern" />
              </section>
            ))}
          </>
        );
      case 'contact':
        if (!sections.show_contact) return null;
        return (
          <section id="contact">
            <SectionHeader title="Get in Touch" subtitle="Contact" />
            <ContactSection portfolio={portfolio} variant="modern" />
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-foreground relative">
      {/* Animated Background */}
      <AnimatedBackground variant="modern" backgroundStyle={portfolio.background_style} />
      
      {/* Cursor Effects */}
      <CursorEffects />

      {/* Hero Section */}
      <HeroSection 
        portfolio={portfolio} 
        variant="modern" 
        showProjectsCTA={sections.show_projects && projects.length > 0}
        showContactCTA={sections.show_contact}
      />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto py-20 px-6">
        <div className="space-y-28">
          {orderedSections.map(({ type }) => {
            const content = renderSection(type);
            if (!content) return null;
            return <React.Fragment key={type}>{content}</React.Fragment>;
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 text-center bg-muted/30">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {portfolio.title}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
