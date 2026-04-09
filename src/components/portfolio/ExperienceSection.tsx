import { MapPin, Calendar, Briefcase, CheckCircle2, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Experience {
  id: string;
  company: string;
  position: string;
  employment_type?: string | null;
  location?: string | null;
  role_summary?: string | null;
  description?: string | null;
  responsibilities?: string[] | null;
  achievements?: string[] | null;
  technologies_used?: string[] | null;
  start_date: string;
  end_date?: string | null;
  is_current?: boolean | null;
}

interface ExperienceSectionProps {
  experiences: Experience[];
  variant?: 'default' | 'minimal' | 'modern' | 'cyberpunk' | 'corporate' | 'neon' | 'editorial' | 'warm';
  className?: string;
}

const variantStyles = {
  default: {
    timeline: 'border-primary',
    dot: 'bg-primary',
    card: 'bg-card border border-border hover:border-primary/50',
    title: 'text-foreground',
    company: 'text-primary',
    badge: 'bg-secondary text-secondary-foreground',
    techBadge: 'bg-primary/10 text-primary border-primary/20',
    text: 'text-muted-foreground',
    achievement: 'text-primary',
  },
  minimal: {
    timeline: 'border-border',
    dot: 'bg-accent',
    card: 'bg-transparent',
    title: 'text-foreground',
    company: 'text-muted-foreground',
    badge: 'bg-secondary text-secondary-foreground',
    techBadge: 'bg-secondary text-secondary-foreground',
    text: 'text-muted-foreground',
    achievement: 'text-accent',
  },
  modern: {
    timeline: 'border-border group-hover:border-accent',
    dot: 'border-2 border-accent bg-background',
    card: 'bg-transparent',
    title: 'text-foreground',
    company: 'text-accent',
    badge: 'bg-accent/10 text-accent',
    techBadge: 'bg-secondary text-secondary-foreground',
    text: 'text-muted-foreground',
    achievement: 'text-accent',
  },
  cyberpunk: {
    timeline: 'border-[#8A2EFF]/50',
    dot: 'bg-[#8A2EFF] shadow-[0_0_10px_rgba(138,46,255,0.5)]',
    card: 'neon-border bg-[#0A0F14]/80 backdrop-blur-sm',
    title: 'text-[#00FF88] font-mono',
    company: 'text-[#E5FFF9]/70',
    badge: 'bg-[#8A2EFF]/20 text-[#8A2EFF] border-[#8A2EFF]/30',
    techBadge: 'bg-[#00FFE1]/10 text-[#00FFE1] border-[#00FFE1]/30',
    text: 'text-[#E5FFF9]/60',
    achievement: 'text-[#00FF88]',
  },
  corporate: {
    timeline: 'border-[#CBD5E1]',
    dot: 'bg-[#1E3A8A]',
    card: 'bg-white border border-[#CBD5E1] shadow-sm hover:shadow-md',
    title: 'text-[#0F172A]',
    company: 'text-[#1E3A8A]',
    badge: 'bg-[#1E3A8A]/10 text-[#1E3A8A]',
    techBadge: 'bg-[#F1F5F9] text-[#0F172A] border-[#CBD5E1]',
    text: 'text-[#475569]',
    achievement: 'text-[#2563EB]',
  },
  neon: {
    timeline: 'border-[#784BA0]/50',
    dot: 'bg-gradient-to-br from-[#FF3CAC] to-[#784BA0] shadow-[0_0_15px_rgba(255,60,172,0.4)]',
    card: 'bg-[#0A0A0F]/80 backdrop-blur-sm border border-[#784BA0]/30 hover:border-[#FF3CAC]/50',
    title: 'text-[#F8FAFC]',
    company: 'text-[#FF3CAC]',
    badge: 'bg-[#FF3CAC]/20 text-[#FF3CAC] border-[#FF3CAC]/30',
    techBadge: 'bg-[#2B86C5]/20 text-[#2B86C5] border-[#2B86C5]/30',
    text: 'text-[#F8FAFC]/70',
    achievement: 'text-[#FF3CAC]',
  },
  editorial: {
    timeline: 'border-[#E5E7EB]',
    dot: 'bg-[#111827]',
    card: 'bg-transparent border-b border-[#E5E7EB] pb-8',
    title: 'text-[#111827] font-serif',
    company: 'text-[#6B7280]',
    badge: 'bg-[#F3F4F6] text-[#374151]',
    techBadge: 'bg-transparent text-[#6B7280] border border-[#D1D5DB]',
    text: 'text-[#4B5563]',
    achievement: 'text-[#111827]',
  },
  warm: {
    timeline: 'border-[#FED7AA]',
    dot: 'bg-gradient-to-br from-[#EA580C] to-[#FF7A18]',
    card: 'bg-white/80 backdrop-blur-sm border border-[#FED7AA] shadow-sm hover:shadow-md',
    title: 'text-[#7C2D12]',
    company: 'text-[#EA580C]',
    badge: 'bg-[#FED7AA]/50 text-[#7C2D12]',
    techBadge: 'bg-[#EA580C]/10 text-[#EA580C] border-[#EA580C]/20',
    text: 'text-[#3F1D0B]/70',
    achievement: 'text-[#EA580C]',
  },
};

export function ExperienceSection({ experiences, variant = 'default', className }: ExperienceSectionProps) {
  if (!experiences || experiences.length === 0) return null;

  const styles = variantStyles[variant];

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  const getDateRange = (exp: Experience) => {
    const start = formatDate(exp.start_date);
    const end = exp.is_current ? 'Present' : exp.end_date ? formatDate(exp.end_date) : '';
    return `${start} – ${end}`;
  };

  return (
    <div className={cn("space-y-0", className)}>
      {experiences.map((exp, index) => (
        <div 
          key={exp.id} 
          className="group relative grid md:grid-cols-[180px_1fr] gap-4 md:gap-8"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Desktop: Date column */}
          <div className="hidden md:block text-sm pt-1">
            <p className={cn("font-medium", styles.text)}>{formatDate(exp.start_date)}</p>
            <p className={styles.text}>{exp.is_current ? 'Present' : exp.end_date ? formatDate(exp.end_date) : ''}</p>
          </div>

          {/* Timeline + Content */}
          <div className={cn("relative pl-8 pb-10 last:pb-0 border-l-2 transition-colors", styles.timeline)}>
            {/* Timeline dot */}
            <div className={cn(
              "absolute -left-[9px] top-1 h-4 w-4 rounded-full transition-transform group-hover:scale-110",
              styles.dot
            )} />

            {/* Card content */}
            <div className={cn("rounded-lg p-5 transition-all", styles.card)}>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                <div className="flex-1">
                  <h3 className={cn("text-lg font-semibold", styles.title)}>{exp.position}</h3>
                  <p className={cn("font-medium", styles.company)}>{exp.company}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {exp.employment_type && (
                    <Badge className={cn("text-xs", styles.badge)}>{exp.employment_type}</Badge>
                  )}
                </div>
              </div>

              {/* Mobile: Date + Location */}
              <div className="flex flex-wrap items-center gap-3 text-sm mb-3 md:hidden">
                <span className={cn("flex items-center gap-1", styles.text)}>
                  <Calendar className="h-3.5 w-3.5" />
                  {getDateRange(exp)}
                </span>
                {exp.location && (
                  <span className={cn("flex items-center gap-1", styles.text)}>
                    <MapPin className="h-3.5 w-3.5" />
                    {exp.location}
                  </span>
                )}
              </div>

              {/* Desktop: Location only */}
              {exp.location && (
                <p className={cn("hidden md:flex items-center gap-1 text-sm mb-3", styles.text)}>
                  <MapPin className="h-3.5 w-3.5" />
                  {exp.location}
                </p>
              )}

              {/* Role Summary */}
              {(exp.role_summary || exp.description) && (
                <p className={cn("text-sm leading-relaxed mb-4", styles.text)}>
                  {exp.role_summary || exp.description}
                </p>
              )}

              {/* Responsibilities */}
              {exp.responsibilities && exp.responsibilities.length > 0 && (
                <div className="mb-4">
                  <h4 className={cn("text-xs font-semibold uppercase tracking-wider mb-2", styles.text)}>
                    Responsibilities
                  </h4>
                  <ul className="space-y-1.5">
                    {exp.responsibilities.map((item, idx) => (
                      <li key={idx} className={cn("flex items-start gap-2 text-sm", styles.text)}>
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5 opacity-60" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Achievements */}
              {exp.achievements && exp.achievements.length > 0 && (
                <div className="mb-4">
                  <h4 className={cn("text-xs font-semibold uppercase tracking-wider mb-2", styles.achievement)}>
                    Key Achievements
                  </h4>
                  <ul className="space-y-1.5">
                    {exp.achievements.map((item, idx) => (
                      <li key={idx} className={cn("flex items-start gap-2 text-sm", styles.text)}>
                        <Trophy className={cn("h-4 w-4 flex-shrink-0 mt-0.5", styles.achievement)} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Technologies */}
              {exp.technologies_used && exp.technologies_used.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {exp.technologies_used.map((tech) => (
                    <Badge key={tech} variant="outline" className={cn("text-xs", styles.techBadge)}>
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
