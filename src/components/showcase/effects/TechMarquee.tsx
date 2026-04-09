import { memo } from 'react';
import { 
  Cloud, Server, Database, Container, GitBranch, Terminal,
  Zap, Shield, Globe, Cpu, HardDrive, Network
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemePreset } from '../PremiumShowcase';

interface TechMarqueeProps {
  theme: ThemePreset;
  themeConfig: any;
}

const techItems = [
  { name: 'AWS', icon: Cloud },
  { name: 'Kubernetes', icon: Container },
  { name: 'Docker', icon: Server },
  { name: 'Terraform', icon: GitBranch },
  { name: 'Python', icon: Terminal },
  { name: 'CI/CD', icon: Zap },
  { name: 'Security', icon: Shield },
  { name: 'Cloud', icon: Globe },
  { name: 'Linux', icon: Cpu },
  { name: 'Storage', icon: HardDrive },
  { name: 'Networking', icon: Network },
  { name: 'Database', icon: Database },
];

export const TechMarquee = memo(function TechMarquee({ theme, themeConfig }: TechMarqueeProps) {
  return (
    <div className="relative overflow-hidden py-8">
      {/* Gradient masks */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-32 z-10"
        style={{ background: `linear-gradient(90deg, ${themeConfig.colors.background}, transparent)` }}
      />
      <div 
        className="absolute right-0 top-0 bottom-0 w-32 z-10"
        style={{ background: `linear-gradient(270deg, ${themeConfig.colors.background}, transparent)` }}
      />

      {/* CSS-based marquee for better performance */}
      <div className="animate-marquee flex gap-8">
        {[...techItems, ...techItems].map((tech, index) => (
          <div
            key={`${tech.name}-${index}`}
            className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-full whitespace-nowrap flex-shrink-0",
              theme === 'cyber-neon' && "bg-[#0A0F14] border border-[#00FFE1]/20",
              theme === 'minimal-dark' && "bg-white/5 border border-white/10",
              theme === 'glassmorphism' && "glass-card"
            )}
          >
            <tech.icon className="h-5 w-5" style={{ color: themeConfig.colors.primary }} />
            <span className="font-medium" style={{ color: themeConfig.colors.text }}>
              {tech.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});
