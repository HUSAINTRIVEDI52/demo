import { motion, type Easing } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonBlockProps {
  className?: string;
  delay?: number;
}

function SkeletonBlock({ className, delay = 0 }: SkeletonBlockProps) {
  return (
    <motion.div
      className={cn('bg-muted rounded', className)}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut' as Easing,
        delay,
      }}
    />
  );
}

// Hero Section Skeleton
export function HeroSectionSkeleton() {
  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center text-center py-20 px-4">
      {/* Avatar */}
      <SkeletonBlock className="h-32 w-32 rounded-full mb-8" />
      
      {/* Name */}
      <SkeletonBlock className="h-12 w-64 mb-4" delay={0.1} />
      
      {/* Tagline */}
      <SkeletonBlock className="h-6 w-96 max-w-full mb-6" delay={0.2} />
      
      {/* Location */}
      <SkeletonBlock className="h-4 w-32 mb-8" delay={0.3} />
      
      {/* Social Links */}
      <div className="flex items-center gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-10 w-10 rounded-lg" delay={0.4 + i * 0.05} />
        ))}
      </div>
    </section>
  );
}

// About Section Skeleton
export function AboutSectionSkeleton() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <SkeletonBlock className="h-8 w-32 mb-8" />
        
        {/* Bio Text */}
        <div className="space-y-3">
          <SkeletonBlock className="h-5 w-full" delay={0.1} />
          <SkeletonBlock className="h-5 w-full" delay={0.15} />
          <SkeletonBlock className="h-5 w-3/4" delay={0.2} />
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-10">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center">
              <SkeletonBlock className="h-10 w-16 mx-auto mb-2" delay={0.3 + i * 0.1} />
              <SkeletonBlock className="h-4 w-24 mx-auto" delay={0.35 + i * 0.1} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Projects Section Skeleton
export function ProjectsSectionSkeleton({ count = 3 }: { count?: number }) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <SkeletonBlock className="h-8 w-40 mb-4" />
        <SkeletonBlock className="h-5 w-64 mb-12" delay={0.05} />
        
        {/* Project Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/50 overflow-hidden">
              {/* Project Image */}
              <SkeletonBlock className="h-48 w-full rounded-none" delay={0.1 + i * 0.1} />
              
              {/* Content */}
              <div className="p-5 space-y-3">
                <SkeletonBlock className="h-6 w-3/4" delay={0.15 + i * 0.1} />
                <SkeletonBlock className="h-4 w-full" delay={0.2 + i * 0.1} />
                <SkeletonBlock className="h-4 w-2/3" delay={0.25 + i * 0.1} />
                
                {/* Tech Tags */}
                <div className="flex gap-2 pt-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <SkeletonBlock key={j} className="h-6 w-16 rounded-full" delay={0.3 + i * 0.1} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Experience Section Skeleton
export function ExperienceSectionSkeleton({ count = 3 }: { count?: number }) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <SkeletonBlock className="h-8 w-36 mb-4" />
        <SkeletonBlock className="h-5 w-48 mb-12" delay={0.05} />
        
        {/* Timeline */}
        <div className="space-y-8 relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-border/50" />
          
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex gap-6 relative">
              {/* Timeline dot */}
              <SkeletonBlock className="h-4 w-4 rounded-full shrink-0 z-10" delay={0.1 + i * 0.15} />
              
              {/* Content Card */}
              <div className="flex-1 p-5 rounded-xl border border-border/50 space-y-3">
                <div className="flex items-center justify-between">
                  <SkeletonBlock className="h-6 w-48" delay={0.15 + i * 0.15} />
                  <SkeletonBlock className="h-4 w-24" delay={0.2 + i * 0.15} />
                </div>
                <SkeletonBlock className="h-5 w-36" delay={0.25 + i * 0.15} />
                <SkeletonBlock className="h-4 w-full" delay={0.3 + i * 0.15} />
                <SkeletonBlock className="h-4 w-3/4" delay={0.35 + i * 0.15} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Skills Section Skeleton
export function SkillsSectionSkeleton({ count = 12 }: { count?: number }) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <SkeletonBlock className="h-8 w-32 mb-4" />
        <SkeletonBlock className="h-5 w-56 mb-12" delay={0.05} />
        
        {/* Skills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="p-4 rounded-lg border border-border/50">
              <SkeletonBlock className="h-5 w-full" delay={0.1 + (i % 4) * 0.05} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Certifications Section Skeleton
export function CertificationsSectionSkeleton({ count = 4 }: { count?: number }) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <SkeletonBlock className="h-8 w-40 mb-12" />
        
        {/* Certifications Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="p-5 rounded-lg border border-border/50">
              <div className="flex items-start gap-4">
                <SkeletonBlock className="h-12 w-12 rounded-lg shrink-0" delay={0.1 + i * 0.1} />
                <div className="flex-1 space-y-2">
                  <SkeletonBlock className="h-5 w-3/4" delay={0.15 + i * 0.1} />
                  <SkeletonBlock className="h-4 w-1/2" delay={0.2 + i * 0.1} />
                  <SkeletonBlock className="h-3 w-24" delay={0.25 + i * 0.1} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Contact Section Skeleton
export function ContactSectionSkeleton() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Section Title */}
        <SkeletonBlock className="h-10 w-48 mx-auto mb-4" />
        <SkeletonBlock className="h-5 w-80 mx-auto mb-12" delay={0.1} />
        
        {/* Contact Form */}
        <div className="space-y-6 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-16" delay={0.15} />
              <SkeletonBlock className="h-10 w-full rounded-lg" delay={0.2} />
            </div>
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-16" delay={0.15} />
              <SkeletonBlock className="h-10 w-full rounded-lg" delay={0.2} />
            </div>
          </div>
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-20" delay={0.25} />
            <SkeletonBlock className="h-10 w-full rounded-lg" delay={0.3} />
          </div>
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-20" delay={0.35} />
            <SkeletonBlock className="h-32 w-full rounded-lg" delay={0.4} />
          </div>
          <SkeletonBlock className="h-12 w-full rounded-lg" delay={0.45} />
        </div>
      </div>
    </section>
  );
}

// Full Portfolio Skeleton - combines all sections
interface PortfolioSkeletonProps {
  variant?: 'minimal' | 'modern' | 'bold' | 'dark';
  className?: string;
}

export function PortfolioSkeleton({ variant = 'minimal', className }: PortfolioSkeletonProps) {
  const bgClasses = {
    minimal: 'bg-background',
    modern: 'bg-background',
    bold: 'bg-gradient-to-br from-background to-muted/30',
    dark: 'bg-zinc-950',
  };

  return (
    <div className={cn('min-h-screen', bgClasses[variant], className)}>
      <HeroSectionSkeleton />
      <AboutSectionSkeleton />
      <ProjectsSectionSkeleton count={3} />
      <ExperienceSectionSkeleton count={2} />
      <SkillsSectionSkeleton count={8} />
      <CertificationsSectionSkeleton count={2} />
      <ContactSectionSkeleton />
    </div>
  );
}

// Compact skeleton for section-level loading (when only one section is loading)
export function SectionLoadingSkeleton({ type }: { type: 'hero' | 'about' | 'projects' | 'experience' | 'skills' | 'certifications' | 'contact' }) {
  switch (type) {
    case 'hero':
      return <HeroSectionSkeleton />;
    case 'about':
      return <AboutSectionSkeleton />;
    case 'projects':
      return <ProjectsSectionSkeleton />;
    case 'experience':
      return <ExperienceSectionSkeleton />;
    case 'skills':
      return <SkillsSectionSkeleton />;
    case 'certifications':
      return <CertificationsSectionSkeleton />;
    case 'contact':
      return <ContactSectionSkeleton />;
    default:
      return null;
  }
}
