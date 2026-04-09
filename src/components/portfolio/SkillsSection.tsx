import type { Skill } from '@/pages/PublicPortfolio';

interface SkillsSectionProps {
  skills: Skill[];
  variant?: 'minimal' | 'modern' | 'default' | 'cyberpunk' | 'corporate' | 'neon' | 'editorial' | 'warm';
}

// Group skills by category
function groupSkillsByCategory(skills: Skill[]): Record<string, Skill[]> {
  return skills.reduce((acc, skill) => {
    const category = skill.category || 'Core Skills';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);
}

export function SkillsSection({ skills, variant = 'default' }: SkillsSectionProps) {
  if (skills.length === 0) return null;

  const groupedSkills = groupSkillsByCategory(skills);
  const categories = Object.entries(groupedSkills);
  const nonEmptyCategories = categories.filter(([, categorySkills]) => categorySkills.length > 0);
  
  if (nonEmptyCategories.length === 0) return null;

  // ═══════════════════════════════════════════════════════════════════════════
  // MINIMAL / DARK ELITE - Clean grouped expertise
  // ═══════════════════════════════════════════════════════════════════════════
  if (variant === 'minimal') {
    return (
      <div className="space-y-10">
        {nonEmptyCategories.map(([category, categorySkills]) => (
          <div key={category}>
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">{category}</h3>
            <div className="flex flex-wrap gap-3">
              {categorySkills.map((skill) => (
                <span 
                  key={skill.id} 
                  className="text-sm text-foreground/80 px-4 py-2 rounded-full border border-border/50 hover:border-accent/50 hover:text-foreground transition-colors"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODERN - Card-based categories
  // ═══════════════════════════════════════════════════════════════════════════
  if (variant === 'modern') {
    return (
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {nonEmptyCategories.map(([category, categorySkills]) => (
          <div key={category} className="p-6 rounded-xl bg-muted/30 border border-border/50">
            <h3 className="text-sm font-semibold text-accent uppercase tracking-wider mb-4">{category}</h3>
            <div className="flex flex-wrap gap-2">
              {categorySkills.map((skill) => (
                <span 
                  key={skill.id} 
                  className="text-sm text-foreground/70 px-3 py-1.5 rounded-md bg-background border border-border/30"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DEFAULT / BOLD - Simple flowing tags
  // ═══════════════════════════════════════════════════════════════════════════
  if (variant === 'default') {
    return (
      <div className="space-y-8">
        {nonEmptyCategories.map(([category, categorySkills]) => (
          <div key={category}>
            <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">{category}</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {categorySkills.map((skill) => (
                <span 
                  key={skill.id} 
                  className="text-sm font-medium px-5 py-2.5 rounded-full border border-border hover:border-accent hover:text-accent transition-colors"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CYBERPUNK - Terminal-style grouped
  // ═══════════════════════════════════════════════════════════════════════════
  if (variant === 'cyberpunk') {
    return (
      <div className="space-y-8 font-mono">
        {nonEmptyCategories.map(([category, categorySkills]) => (
          <div key={category}>
            <h3 className="text-sm text-[#8A2EFF] mb-4">// {category.toUpperCase()}</h3>
            <div className="flex flex-wrap gap-3">
              {categorySkills.map((skill) => (
                <span 
                  key={skill.id} 
                  className="text-sm text-[#00FFE1]/80 px-4 py-2 border border-[#00FFE1]/30 hover:border-[#00FFE1] hover:text-[#00FFE1] transition-colors"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CORPORATE - Professional categorized list
  // ═══════════════════════════════════════════════════════════════════════════
  if (variant === 'corporate') {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {nonEmptyCategories.map(([category, categorySkills]) => (
          <div key={category} className="p-5 rounded-lg bg-white border border-[#E2E8F0] shadow-sm">
            <h3 className="text-sm font-semibold text-[#1E3A8A] uppercase tracking-wider mb-4">{category}</h3>
            <ul className="space-y-2">
              {categorySkills.map((skill) => (
                <li key={skill.id} className="text-sm text-[#334155] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                  {skill.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NEON - Gradient tags
  // ═══════════════════════════════════════════════════════════════════════════
  if (variant === 'neon') {
    return (
      <div className="space-y-10">
        {nonEmptyCategories.map(([category, categorySkills]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-[#FF3CAC] mb-4 text-center">{category}</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {categorySkills.map((skill) => (
                <span 
                  key={skill.id} 
                  className="text-sm text-white/80 px-4 py-2 rounded-full border border-[#FF3CAC]/30 hover:border-[#FF3CAC] hover:text-white transition-colors bg-[#FF3CAC]/5"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EDITORIAL - Refined inline list
  // ═══════════════════════════════════════════════════════════════════════════
  if (variant === 'editorial') {
    return (
      <div className="space-y-10">
        {nonEmptyCategories.map(([category, categorySkills]) => (
          <div key={category}>
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#9CA3AF] mb-4">{category}</h3>
            <p className="text-[#374151] leading-loose">
              {categorySkills.map((skill, idx) => (
                <span key={skill.id}>
                  <span className="hover:text-[#111827] transition-colors cursor-default">{skill.name}</span>
                  {idx < categorySkills.length - 1 && <span className="text-[#D1D5DB] mx-2">·</span>}
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WARM - Friendly rounded tags
  // ═══════════════════════════════════════════════════════════════════════════
  if (variant === 'warm') {
    return (
      <div className="space-y-8">
        {nonEmptyCategories.map(([category, categorySkills]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-[#EA580C] mb-4">{category}</h3>
            <div className="flex flex-wrap gap-2">
              {categorySkills.map((skill) => (
                <span 
                  key={skill.id} 
                  className="text-sm text-[#7C2D12] px-4 py-2 rounded-full bg-[#FED7AA]/50 hover:bg-[#FED7AA] transition-colors"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Fallback
  return (
    <div className="flex flex-wrap gap-3">
      {skills.map((skill) => (
        <span key={skill.id} className="text-sm px-4 py-2 rounded-full border border-border">
          {skill.name}
        </span>
      ))}
    </div>
  );
}
