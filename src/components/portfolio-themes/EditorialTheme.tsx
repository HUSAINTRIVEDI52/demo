import React from 'react';
import { ExternalLink, Calendar, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { ExperienceSection } from '@/components/portfolio/ExperienceSection';
import { SkillsSection } from '@/components/portfolio/SkillsSection';
import { ProjectsSection } from '@/components/portfolio/ProjectsSection';
import { ContactSection } from '@/components/portfolio/ContactSection';
import { HeroSection } from '@/components/portfolio/HeroSection';
import { AboutSection } from '@/components/portfolio/AboutSection';
import { CustomSectionDisplay } from '@/components/portfolio/CustomSectionDisplay';
import { ScrollReveal, SectionDivider, AnimatedBackground, CursorEffects } from '@/components/portfolio/effects';
import { format } from 'date-fns';
import type { FullPortfolioData } from '@/pages/PublicPortfolio';

interface EditorialThemeProps {
  data: FullPortfolioData;
}

type SectionType = 'about' | 'projects' | 'experience' | 'skills' | 'certifications' | 'custom_sections' | 'contact';

export function EditorialTheme({ data }: EditorialThemeProps) {
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

  const SectionHeader = ({ title }: { title: string }) => (
    <ScrollReveal>
      <motion.h2 
        className="text-sm uppercase tracking-[0.3em] text-[#6B7280] mb-10 text-center"
        whileHover={{ letterSpacing: '0.35em' }}
        transition={{ duration: 0.3 }}
      >
        {title}
      </motion.h2>
    </ScrollReveal>
  );

  const renderSection = (type: SectionType): React.ReactNode => {
    switch (type) {
      case 'about':
        if (!portfolio.bio) return null;
        return (
          <ScrollReveal>
            <AboutSection 
              portfolio={portfolio} 
              experiences={experiences} 
              skills={skills} 
              variant="editorial" 
            />
          </ScrollReveal>
        );
      case 'projects':
        if (!sections.show_projects || projects.length === 0) return null;
        return (
          <section id="projects">
            <SectionHeader title="Selected Work" />
            <ScrollReveal delay={0.1}>
              <ProjectsSection projects={projects} variant="editorial" />
            </ScrollReveal>
          </section>
        );
      case 'experience':
        if (!sections.show_experience || experiences.length === 0) return null;
        return (
          <section>
            <SectionHeader title="Experience" />
            <ScrollReveal delay={0.1}>
              <ExperienceSection experiences={experiences} variant="editorial" />
            </ScrollReveal>
          </section>
        );
      case 'skills':
        if (!sections.show_skills || skills.length === 0) return null;
        return (
          <section>
            <SectionHeader title="Expertise" />
            <ScrollReveal delay={0.1}>
              <SkillsSection skills={skills} variant="editorial" />
            </ScrollReveal>
          </section>
        );
      case 'certifications':
        if (!sections.show_certifications || certifications.length === 0) return null;
        return (
          <section>
            <SectionHeader title="Credentials" />
            <div className="space-y-6">
              {certifications.map((cert, index) => (
                <ScrollReveal key={cert.id} delay={index * 0.1}>
                  <motion.article 
                    className="flex items-start gap-4 group"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Award className="h-5 w-5 text-[#9CA3AF] mt-1 flex-shrink-0 group-hover:text-[#111827] transition-colors" />
                    <div className="min-w-0">
                      <h3 className="font-['Merriweather'] font-bold text-[#111827] truncate">{cert.name}</h3>
                      <p className="text-sm text-[#6B7280] italic truncate">{cert.issuer}</p>
                      {cert.issue_date && (
                        <p className="text-xs text-[#9CA3AF] mt-1">{formatDate(cert.issue_date)}</p>
                      )}
                      {cert.credential_url && (
                        <motion.a 
                          href={cert.credential_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#111827] mt-2 transition-colors"
                          whileHover={{ x: 3 }}
                        >
                          Verify <ExternalLink className="h-3 w-3" />
                        </motion.a>
                      )}
                    </div>
                  </motion.article>
                </ScrollReveal>
              ))}
            </div>
          </section>
        );
      case 'custom_sections':
        if (!customSections || customSections.length === 0) return null;
        return (
          <>
            {customSections.map((section) => (
              <React.Fragment key={section.id}>
                <section>
                  <SectionHeader title={section.title} />
                  <ScrollReveal delay={0.1}>
                    <CustomSectionDisplay section={section} variant="editorial" />
                  </ScrollReveal>
                </section>
              </React.Fragment>
            ))}
          </>
        );
      case 'contact':
        if (!sections.show_contact) return null;
        return (
          <section id="contact">
            <SectionHeader title="Get in Touch" />
            <ScrollReveal delay={0.1}>
              <ContactSection portfolio={portfolio} variant="editorial" />
            </ScrollReveal>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1F2937] font-['Source_Serif_Pro'] relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&family=Source+Serif+Pro:wght@400;600&display=swap');
      `}</style>

      {/* Editorial background */}
      <AnimatedBackground variant="editorial" backgroundStyle={portfolio.background_style} />
      
      {/* Cursor Effects */}
      <CursorEffects />

      {/* Hero Section */}
      <HeroSection 
        portfolio={portfolio} 
        variant="editorial" 
        showProjectsCTA={sections.show_projects && projects.length > 0}
        showContactCTA={sections.show_contact}
      />

      <main className="relative z-10 max-w-3xl mx-auto py-16 px-6">
        {orderedSections.map(({ type }, index) => {
          const content = renderSection(type);
          if (!content) return null;
          return (
            <React.Fragment key={type}>
              {index > 0 && <SectionDivider variant="editorial" />}
              <div className="py-8">{content}</div>
            </React.Fragment>
          );
        })}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#E5E7EB] py-12 text-center">
        <motion.p 
          className="text-xs uppercase tracking-[0.3em] text-[#9CA3AF]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          © {new Date().getFullYear()} {portfolio.title}
        </motion.p>
      </footer>
    </div>
  );
}
