import { Briefcase, Code, Building2, Trophy, Sparkles, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { PortfolioData, Experience, Skill } from '@/pages/PublicPortfolio';

type AboutVariant = 'minimal' | 'modern' | 'bold' | 'cyberpunk' | 'corporate' | 'neon' | 'editorial' | 'warm';

interface AboutSectionProps {
  portfolio: PortfolioData;
  experiences?: Experience[];
  skills?: Skill[];
  variant?: AboutVariant;
}

// Calculate years of experience from experiences array
function calculateYearsOfExperience(experiences: Experience[]): number {
  if (!experiences.length) return 0;
  
  const sortedExperiences = [...experiences].sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );
  
  const earliestDate = new Date(sortedExperiences[0].start_date);
  const now = new Date();
  const years = Math.floor((now.getTime() - earliestDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  
  return Math.max(1, years);
}

// Extract primary expertise from skills
function getPrimaryExpertise(skills: Skill[]): string[] {
  const topSkills = skills
    .filter(s => s.proficiency && s.proficiency >= 80)
    .slice(0, 4)
    .map(s => s.name);
  
  return topSkills.length > 0 ? topSkills : skills.slice(0, 4).map(s => s.name);
}

// Get unique categories from skills
function getSkillCategories(skills: Skill[]): string[] {
  const categories = [...new Set(skills.map(s => s.category).filter(Boolean))] as string[];
  return categories.slice(0, 4);
}

interface HighlightCard {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export function AboutSection({ portfolio, experiences = [], skills = [], variant = 'minimal' }: AboutSectionProps) {
  if (!portfolio.bio) return null;

  const yearsExp = calculateYearsOfExperience(experiences);
  const primaryExpertise = getPrimaryExpertise(skills);
  const categories = getSkillCategories(skills);
  
  // Build highlight cards dynamically
  const highlights: HighlightCard[] = [];
  
  if (yearsExp > 0 && experiences.length > 0) {
    highlights.push({
      icon: <Briefcase className="h-5 w-5" />,
      label: 'Experience',
      value: `${yearsExp}+ Years`,
    });
  }
  
  if (primaryExpertise.length > 0) {
    highlights.push({
      icon: <Code className="h-5 w-5" />,
      label: 'Expertise',
      value: primaryExpertise.slice(0, 2).join(' & '),
    });
  }
  
  if (experiences.length > 0) {
    const companies = [...new Set(experiences.map(e => e.company))];
    highlights.push({
      icon: <Building2 className="h-5 w-5" />,
      label: 'Companies',
      value: `${companies.length}+ Organizations`,
    });
  }
  
  if (skills.length >= 5) {
    highlights.push({
      icon: <Trophy className="h-5 w-5" />,
      label: 'Skills',
      value: `${skills.length}+ Technologies`,
    });
  }

  // Minimal Theme
  if (variant === 'minimal') {
    return (
      <section id="about" className="scroll-mt-20">
        <h2 className="text-2xl font-display font-bold mb-6">About</h2>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap max-w-prose">
              {portfolio.bio}
            </p>
            
            {categories.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-muted-foreground mb-2">Focus Areas</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Badge key={cat} variant="secondary" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {highlights.length > 0 && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              {highlights.slice(0, 4).map((h, i) => (
                <div key={i} className="border border-border rounded-lg p-4 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-2 text-accent mb-1">
                    {h.icon}
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">{h.label}</span>
                  </div>
                  <p className="font-semibold">{h.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Modern Theme
  if (variant === 'modern') {
    return (
      <section id="about" className="scroll-mt-20 max-w-3xl">
        <h2 className="text-sm font-semibold text-accent uppercase tracking-wider mb-4">About Me</h2>
        <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap mb-8">
          {portfolio.bio}
        </p>
        
        {highlights.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {highlights.map((h, i) => (
              <div key={i} className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 text-accent mb-2">
                  {h.icon}
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{h.label}</p>
                <p className="font-semibold text-sm mt-1">{h.value}</p>
              </div>
            ))}
          </div>
        )}
        
        {primaryExpertise.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {primaryExpertise.map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" /> {skill}
              </Badge>
            ))}
          </div>
        )}
      </section>
    );
  }

  // Bold Theme - Content-first, readable, clear hierarchy
  if (variant === 'bold') {
    return (
      <section id="about" className="scroll-mt-20 max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 tracking-tight">About</h2>
        
        {/* Bio - Readable paragraph width, good line-height, high contrast */}
        <p className="text-lg text-foreground/90 leading-[1.8] whitespace-pre-wrap mb-10">
          {portfolio.bio}
        </p>
        
        {/* Metrics - Support credibility, don't overpower */}
        {highlights.length > 0 && (
          <div className="flex flex-wrap gap-8 mb-8 py-6 border-t border-border/50">
            {highlights.slice(0, 4).map((h, i) => (
              <div key={i} className="min-w-[120px]">
                <p className="text-2xl font-bold text-foreground">{h.value}</p>
                <p className="text-sm text-muted-foreground">{h.label}</p>
              </div>
            ))}
          </div>
        )}
        
        {/* Categories - Simple, calm */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span key={cat} className="text-sm text-muted-foreground px-3 py-1 rounded-full border border-border/50">
                {cat}
              </span>
            ))}
          </div>
        )}
      </section>
    );
  }

  // Cyberpunk Theme
  if (variant === 'cyberpunk') {
    return (
      <section id="about" className="scroll-mt-20">
        <h2 className="text-2xl font-['JetBrains_Mono'] font-bold mb-6 text-[#00FFE1]">
          <span className="text-[#8A2EFF]">$</span> about --me
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-lg p-6 bg-[#0A0F14]/80 backdrop-blur-sm" style={{ border: '1px solid rgba(0, 255, 225, 0.3)', boxShadow: '0 0 20px rgba(0, 255, 225, 0.1)' }}>
            <p className="text-[#E5FFF9]/80 leading-relaxed whitespace-pre-wrap">{portfolio.bio}</p>
            
            {primaryExpertise.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {primaryExpertise.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-[#00FFE1]/10 border border-[#00FFE1]/30 rounded text-xs text-[#00FFE1] font-mono">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {highlights.length > 0 && (
            <div className="grid gap-3">
              {highlights.map((h, i) => (
                <div key={i} className="rounded-lg p-4 bg-[#0A0F14]/80 backdrop-blur-sm" style={{ border: '1px solid rgba(138, 46, 255, 0.3)' }}>
                  <div className="flex items-center gap-3">
                    <div className="text-[#00FF88]">{h.icon}</div>
                    <div>
                      <p className="text-xs text-[#8A2EFF] font-mono uppercase">{h.label}</p>
                      <p className="font-['JetBrains_Mono'] font-semibold text-[#E5FFF9]">{h.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Corporate Theme
  if (variant === 'corporate') {
    return (
      <section id="about" className="scroll-mt-20">
        <h2 className="text-2xl font-['Playfair_Display'] font-bold mb-6 text-[#1E3A8A]">About</h2>
        <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] overflow-hidden">
          <div className="p-6">
            <p className="text-[#475569] leading-relaxed whitespace-pre-wrap max-w-prose">
              {portfolio.bio}
            </p>
          </div>
          
          {highlights.length > 0 && (
            <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {highlights.map((h, i) => (
                  <div key={i} className="text-center">
                    <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-[#1E3A8A]/10 text-[#1E3A8A] mb-2">
                      {h.icon}
                    </div>
                    <p className="text-lg font-semibold text-[#0F172A]">{h.value}</p>
                    <p className="text-xs text-[#64748B] uppercase tracking-wide">{h.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {categories.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge key={cat} className="bg-[#F1F5F9] text-[#475569] border-0 text-xs">
                {cat}
              </Badge>
            ))}
          </div>
        )}
      </section>
    );
  }

  // Neon Creative Theme
  if (variant === 'neon') {
    return (
      <section id="about" className="scroll-mt-20">
        <h2 className="text-3xl font-['Poppins'] font-bold mb-6 bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] bg-clip-text text-transparent">
          About Me
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-[#15151F]/80 backdrop-blur-lg rounded-2xl p-8 border border-[#FF3CAC]/20">
            <p className="text-[#F8FAFC]/80 leading-relaxed text-lg whitespace-pre-wrap">{portfolio.bio}</p>
            
            {primaryExpertise.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {primaryExpertise.map((skill) => (
                  <Badge key={skill} className="bg-gradient-to-r from-[#FF3CAC]/20 to-[#784BA0]/20 text-[#FF3CAC] border border-[#FF3CAC]/30 rounded-full">
                    <Zap className="h-3 w-3 mr-1" /> {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {highlights.length > 0 && (
            <div className="grid gap-4">
              {highlights.map((h, i) => (
                <div key={i} className="bg-[#15151F]/80 backdrop-blur-lg rounded-xl p-5 border border-[#784BA0]/20 hover:border-[#FF3CAC]/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#FF3CAC]/20 to-[#784BA0]/20 flex items-center justify-center text-[#FF3CAC]">
                      {h.icon}
                    </div>
                    <div>
                      <p className="text-xs text-[#784BA0] uppercase tracking-wide">{h.label}</p>
                      <p className="font-['Poppins'] font-semibold text-[#F8FAFC]">{h.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Editorial Theme
  if (variant === 'editorial') {
    return (
      <section id="about" className="scroll-mt-20">
        <p className="text-xl md:text-2xl text-[#374151] leading-relaxed whitespace-pre-wrap first-letter:text-5xl first-letter:font-['Merriweather'] first-letter:font-black first-letter:mr-2 first-letter:float-left first-letter:leading-none max-w-prose">
          {portfolio.bio}
        </p>
        
        {highlights.length > 0 && (
          <div className="mt-10 pt-8 border-t border-[#E5E7EB]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {highlights.map((h, i) => (
                <div key={i}>
                  <p className="text-2xl font-['Merriweather'] font-bold text-[#111827]">{h.value}</p>
                  <p className="text-xs text-[#9CA3AF] uppercase tracking-[0.2em] mt-1">{h.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {categories.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            {categories.map((cat) => (
              <span key={cat} className="text-xs uppercase tracking-wider text-[#9CA3AF] border-b border-[#D1D5DB] pb-1">
                {cat}
              </span>
            ))}
          </div>
        )}
      </section>
    );
  }

  // Warm Sunset Theme
  if (variant === 'warm') {
    return (
      <section id="about" className="scroll-mt-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
          <h2 className="text-2xl font-['DM_Serif_Display'] mb-4 text-[#7C2D12]">About Me</h2>
          <p className="text-[#5C3317] leading-relaxed whitespace-pre-wrap max-w-prose">{portfolio.bio}</p>
          
          {highlights.length > 0 && (
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {highlights.map((h, i) => (
                <div key={i} className="bg-gradient-to-br from-[#FED7AA] to-[#FFEDD5] rounded-2xl p-4 text-center">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#FF7A18] to-[#EA580C] flex items-center justify-center mx-auto mb-2 text-white shadow-lg">
                    {h.icon}
                  </div>
                  <p className="font-['DM_Serif_Display'] text-lg text-[#7C2D12]">{h.value}</p>
                  <p className="text-xs text-[#5C3317]/70 mt-0.5">{h.label}</p>
                </div>
              ))}
            </div>
          )}
          
          {categories.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Badge key={cat} className="bg-[#FED7AA] text-[#7C2D12] border-0 rounded-full text-xs">
                  {cat}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return null;
}
