import React from 'react';
import { ExternalLink, Calendar, Award } from 'lucide-react';
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

interface CorporateThemeProps {
  data: FullPortfolioData;
}

type SectionType = 'about' | 'projects' | 'experience' | 'skills' | 'certifications' | 'custom_sections' | 'contact';

export function CorporateTheme({ data }: CorporateThemeProps) {
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
          <AboutSection 
            portfolio={portfolio} 
            experiences={experiences} 
            skills={skills} 
            variant="corporate" 
          />
        );
      case 'projects':
        if (!sections.show_projects || projects.length === 0) return null;
        return (
          <section id="projects" className="space-y-10">
            <h2 className="text-2xl md:text-3xl font-serif font-semibold text-slate-900">
              Selected Work
            </h2>
            <ProjectsSection projects={projects} variant="corporate" />
          </section>
        );
      case 'experience':
        if (!sections.show_experience || experiences.length === 0) return null;
        return (
          <section className="space-y-10">
            <h2 className="text-2xl md:text-3xl font-serif font-semibold text-slate-900">
              Professional Experience
            </h2>
            <ExperienceSection experiences={experiences} variant="corporate" />
          </section>
        );
      case 'skills':
        if (!sections.show_skills || skills.length === 0) return null;
        return (
          <section className="space-y-10">
            <h2 className="text-2xl md:text-3xl font-serif font-semibold text-slate-900">
              Core Competencies
            </h2>
            <SkillsSection skills={skills} variant="corporate" />
          </section>
        );
      case 'certifications':
        if (!sections.show_certifications || certifications.length === 0) return null;
        return (
          <section className="space-y-10">
            <h2 className="text-2xl md:text-3xl font-serif font-semibold text-slate-900">
              Credentials
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {certifications.map((cert) => (
                <article 
                  key={cert.id} 
                  className="p-6 bg-white border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 flex items-center justify-center bg-slate-100 flex-shrink-0">
                      <Award className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900">{cert.name}</h3>
                      <p className="text-slate-600 mt-1">{cert.issuer}</p>
                      {cert.issue_date && (
                        <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(cert.issue_date)}
                        </p>
                      )}
                      {cert.credential_url && (
                        <a 
                          href={cert.credential_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 mt-3 transition-colors"
                        >
                          Verify <ExternalLink className="h-3.5 w-3.5" />
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
              <section key={section.id} className="space-y-10">
                <h2 className="text-2xl md:text-3xl font-serif font-semibold text-slate-900">
                  {section.title}
                </h2>
                <CustomSectionDisplay section={section} variant="corporate" />
              </section>
            ))}
          </>
        );
      case 'contact':
        if (!sections.show_contact) return null;
        return (
          <section id="contact" className="space-y-10">
            <h2 className="text-2xl md:text-3xl font-serif font-semibold text-slate-900">
              Get in Touch
            </h2>
            <ContactSection portfolio={portfolio} variant="corporate" />
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-slate-900 font-sans relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
      `}</style>

      {/* Animated Background */}
      <AnimatedBackground variant="corporate" backgroundStyle={portfolio.background_style} />
      
      {/* Cursor Effects */}
      <CursorEffects primaryColor="#1e40af" />

      {/* Hero Section */}
      <HeroSection 
        portfolio={portfolio} 
        variant="corporate" 
        showProjectsCTA={sections.show_projects && projects.length > 0}
        showContactCTA={sections.show_contact}
      />

      <main className="max-w-4xl mx-auto px-6 py-24 space-y-24">
        {orderedSections.map(({ type }) => {
          const content = renderSection(type);
          if (!content) return null;
          return <React.Fragment key={type}>{content}</React.Fragment>;
        })}
      </main>

      {/* Simple footer */}
      <footer className="border-t border-slate-200 py-12 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} {portfolio.title}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
