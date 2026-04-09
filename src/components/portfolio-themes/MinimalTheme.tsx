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

interface MinimalThemeProps {
  data: FullPortfolioData;
}

type SectionType = 'about' | 'projects' | 'experience' | 'skills' | 'certifications' | 'custom_sections' | 'contact';

export function MinimalTheme({ data }: MinimalThemeProps) {
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
      <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">{title}</h2>
      {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
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
            variant="minimal" 
          />
        );
      case 'projects':
        if (!sections.show_projects || projects.length === 0) return null;
        return (
          <section id="projects">
            <SectionHeader title="Selected Work" subtitle="Projects I'm proud of" />
            <ProjectsSection projects={projects} variant="minimal" />
          </section>
        );
      case 'experience':
        if (!sections.show_experience || experiences.length === 0) return null;
        return (
          <section>
            <SectionHeader title="Experience" subtitle="Where I've worked" />
            <ExperienceSection experiences={experiences} variant="minimal" />
          </section>
        );
      case 'skills':
        if (!sections.show_skills || skills.length === 0) return null;
        return (
          <section>
            <SectionHeader title="Expertise" subtitle="Technologies & skills" />
            <SkillsSection skills={skills} variant="minimal" />
          </section>
        );
      case 'certifications':
        if (!sections.show_certifications || certifications.length === 0) return null;
        return (
          <section>
            <SectionHeader title="Certifications" />
            <div className="grid gap-6 sm:grid-cols-2">
              {certifications.map((cert) => (
                <div key={cert.id} className="p-5 border border-border/50 rounded-lg hover:border-accent/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Award className="h-6 w-6 text-muted-foreground" />
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
                        {cert.credential_id && (
                          <span className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {cert.credential_id}
                          </span>
                        )}
                      </div>
                      {cert.credential_url && (
                        <a 
                          href={cert.credential_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-3"
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
                <CustomSectionDisplay section={section} variant="minimal" />
              </section>
            ))}
          </>
        );
      case 'contact':
        if (!sections.show_contact) return null;
        return (
          <section id="contact">
            <SectionHeader title="Get in Touch" subtitle="I'd love to hear from you" />
            <ContactSection portfolio={portfolio} variant="minimal" />
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-foreground relative">
      {/* Animated Background */}
      <AnimatedBackground variant="minimal" backgroundStyle={portfolio.background_style} />
      
      {/* Cursor Effects */}
      <CursorEffects />

      {/* Hero Section */}
      <HeroSection 
        portfolio={portfolio} 
        variant="minimal" 
        showProjectsCTA={sections.show_projects && projects.length > 0}
        showContactCTA={sections.show_contact}
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-20 px-6">
        <div className="space-y-24">
          {orderedSections.map(({ type }) => {
            const content = renderSection(type);
            if (!content) return null;
            return <React.Fragment key={type}>{content}</React.Fragment>;
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {portfolio.title}
        </p>
      </footer>
    </div>
  );
}
