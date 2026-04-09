import { memo } from 'react';
import { Award, CheckCircle2, Shield, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemePreset } from '../PremiumShowcase';

interface CertificationMarqueeProps {
  certifications: string[];
  theme: ThemePreset;
  themeConfig: any;
}

const certIcons = [Award, CheckCircle2, Shield, Star];

export const CertificationMarquee = memo(function CertificationMarquee({ certifications, theme, themeConfig }: CertificationMarqueeProps) {
  const displayCerts = certifications.length > 0 
    ? certifications 
    : ['AWS Solutions Architect', 'Kubernetes Administrator', 'Terraform Associate', 'Docker Certified', 'Azure DevOps Expert'];

  return (
    <div className="relative overflow-hidden py-6">
      {/* Gradient masks */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-24 z-10"
        style={{ background: `linear-gradient(90deg, ${themeConfig.colors.background}, transparent)` }}
      />
      <div 
        className="absolute right-0 top-0 bottom-0 w-24 z-10"
        style={{ background: `linear-gradient(270deg, ${themeConfig.colors.background}, transparent)` }}
      />

      {/* CSS-based marquee for better performance */}
      <div className="animate-marquee-slow flex gap-6">
        {[...displayCerts, ...displayCerts].map((cert, index) => {
          const Icon = certIcons[index % certIcons.length];
          return (
            <div
              key={`${cert}-${index}`}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap flex-shrink-0 transition-all duration-300 hover:scale-105",
                theme === 'cyber-neon' && "bg-[#00FFE1]/10 border border-[#00FFE1]/30 hover:border-[#00FFE1]/60",
                theme === 'minimal-dark' && "bg-white/5 border border-white/20 hover:border-white/40",
                theme === 'glassmorphism' && "glass-card hover:bg-white/10"
              )}
            >
              <Icon className="h-4 w-4" style={{ color: themeConfig.colors.primary }} />
              <span className="text-sm font-medium" style={{ color: themeConfig.colors.text }}>
                {cert}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
