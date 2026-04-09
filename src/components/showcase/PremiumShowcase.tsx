import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HeroSection } from './sections/HeroSection';
import { TrustStrip } from './sections/TrustStrip';
import { AboutSection } from './sections/AboutSection';
import { SkillsSection } from './sections/SkillsSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { TestimonialsSection } from './sections/TestimonialsSection';
import { ContactSection } from './sections/ContactSection';
import { Footer } from './sections/Footer';
import { CinematicModeProvider, useCinematicMode } from './effects/CinematicModeContext';
import { AnimatedBackground } from './effects/AnimatedBackground';
import { ScrollProgressBar } from './effects/ScrollProgressBar';
import { StickyNavbar } from './effects/StickyNavbar';
import { BackToTopButton } from './effects/BackToTopButton';
import { CursorEffects } from './effects/CursorEffects';
import { SectionDivider } from './effects/SectionDivider';
import { TechMarquee } from './effects/TechMarquee';
import { CertificationMarquee } from './effects/CertificationMarquee';

export type ThemePreset = 'cyber-neon' | 'minimal-dark' | 'glassmorphism';

interface ShowcaseData {
  name: string;
  role: string;
  tagline: string;
  bio: string;
  location: string;
  avatarUrl: string | null;
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    imageUrl: string;
    liveUrl?: string;
    githubUrl?: string;
    featured?: boolean;
  }>;
  skills: Array<{
    name: string;
    category: string;
    proficiency: number;
  }>;
  experiences: Array<{
    position: string;
    company: string;
    location: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    bullets: string[];
  }>;
  certifications: string[];
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}

interface PremiumShowcaseProps {
  data: ShowcaseData;
}

export const themeConfig: Record<ThemePreset, {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
  };
  effects: {
    particles: boolean;
    grid: boolean;
    glow: boolean;
    blur: boolean;
  };
}> = {
  'cyber-neon': {
    name: 'Cyber DevOps Neon',
    colors: {
      primary: '#00FFE1',
      secondary: '#8A2EFF',
      accent: '#00FF88',
      background: '#05070B',
      surface: '#0A0F14',
      text: '#E5FFF9',
      muted: 'rgba(229, 255, 249, 0.6)',
    },
    effects: {
      particles: true,
      grid: true,
      glow: true,
      blur: false,
    },
  },
  'minimal-dark': {
    name: 'Minimal Premium Dark',
    colors: {
      primary: '#FFFFFF',
      secondary: '#6366F1',
      accent: '#22D3EE',
      background: '#0A0A0B',
      surface: '#18181B',
      text: '#FAFAFA',
      muted: 'rgba(250, 250, 250, 0.6)',
    },
    effects: {
      particles: false,
      grid: false,
      glow: false,
      blur: false,
    },
  },
  'glassmorphism': {
    name: 'Glassmorphism Premium',
    colors: {
      primary: '#A855F7',
      secondary: '#EC4899',
      accent: '#06B6D4',
      background: '#0F0F23',
      surface: 'rgba(255, 255, 255, 0.05)',
      text: '#FFFFFF',
      muted: 'rgba(255, 255, 255, 0.7)',
    },
    effects: {
      particles: true,
      grid: false,
      glow: true,
      blur: true,
    },
  },
};

function PremiumShowcaseContent({ data }: PremiumShowcaseProps) {
  const [theme, setTheme] = useState<ThemePreset>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('showcase-theme');
      if (saved && (saved === 'cyber-neon' || saved === 'minimal-dark' || saved === 'glassmorphism')) {
        return saved;
      }
    }
    return 'cyber-neon';
  });

  const [showThemeSwitcher, setShowThemeSwitcher] = useState(false);
  const { cinematicMode } = useCinematicMode();

  useEffect(() => {
    localStorage.setItem('showcase-theme', theme);
  }, [theme]);

  const currentTheme = themeConfig[theme];

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        '--theme-primary': currentTheme.colors.primary,
        '--theme-secondary': currentTheme.colors.secondary,
        '--theme-accent': currentTheme.colors.accent,
        '--theme-background': currentTheme.colors.background,
        '--theme-surface': currentTheme.colors.surface,
        '--theme-text': currentTheme.colors.text,
        '--theme-muted': currentTheme.colors.muted,
        backgroundColor: currentTheme.colors.background,
        color: currentTheme.colors.text,
      } as React.CSSProperties}
    >
      {/* Global Premium Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        * {
          scroll-behavior: smooth;
        }
        
        .theme-primary { color: var(--theme-primary); }
        .theme-secondary { color: var(--theme-secondary); }
        .theme-accent { color: var(--theme-accent); }
        .theme-text { color: var(--theme-text); }
        .theme-muted { color: var(--theme-muted); }
        .theme-bg { background-color: var(--theme-background); }
        .theme-surface { background-color: var(--theme-surface); }
        
        .gradient-text {
          background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .glow-border {
          border: 1px solid rgba(var(--theme-primary-rgb, 0, 255, 225), 0.3);
          box-shadow: 0 0 30px rgba(var(--theme-primary-rgb, 0, 255, 225), 0.1);
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .neon-glow {
          text-shadow: 0 0 20px var(--theme-primary), 0 0 40px var(--theme-primary);
        }
        
        .hover-glow:hover {
          box-shadow: 0 0 30px var(--theme-primary), 0 0 60px rgba(var(--theme-primary-rgb, 0, 255, 225), 0.3);
        }
        
        .grid-overlay {
          background-image: 
            linear-gradient(rgba(var(--theme-primary-rgb, 0, 255, 225), 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(var(--theme-primary-rgb, 0, 255, 225), 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        
        /* Cinematic mode enhancements */
        ${cinematicMode ? `
          .hover-glow:hover {
            box-shadow: 0 0 50px var(--theme-primary), 0 0 100px rgba(var(--theme-primary-rgb, 0, 255, 225), 0.4);
          }
          
          .gradient-text {
            filter: drop-shadow(0 0 20px var(--theme-primary));
          }
        ` : ''}
        
        /* Premium typography */
        h1, h2, h3 {
          letter-spacing: -0.02em;
        }
        
        /* Smooth page transitions */
        section {
          opacity: 1;
          transition: opacity 0.5s ease;
        }
      `}</style>

      {/* Premium Effects Layers */}
      <ScrollProgressBar theme={theme} themeConfig={currentTheme} />
      <AnimatedBackground theme={theme} themeConfig={currentTheme} />
      <CursorEffects theme={theme} themeConfig={currentTheme} />
      <StickyNavbar theme={theme} themeConfig={currentTheme} name={data.name} />
      <BackToTopButton theme={theme} themeConfig={currentTheme} />

      {/* Theme Switcher */}
      <motion.div 
        className="fixed bottom-6 right-6 z-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowThemeSwitcher(!showThemeSwitcher)}
            className={cn(
              "h-12 w-12 rounded-full border-2 transition-all duration-300",
              theme === 'cyber-neon' && "border-[#00FFE1] bg-[#0A0F14] hover:bg-[#0A0F14]/80",
              theme === 'minimal-dark' && "border-white/30 bg-[#18181B] hover:bg-[#18181B]/80",
              theme === 'glassmorphism' && "border-purple-500/50 bg-white/10 backdrop-blur-xl hover:bg-white/20"
            )}
          >
            <Palette className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
          </Button>

          <AnimatePresence>
            {showThemeSwitcher && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className={cn(
                  "absolute bottom-16 right-0 p-3 rounded-xl min-w-[200px]",
                  theme === 'glassmorphism' ? "glass-card" : "bg-[#0A0F14] border border-white/10"
                )}
              >
                <p className="text-xs uppercase tracking-wider mb-3 px-2" style={{ color: currentTheme.colors.muted }}>
                  Theme Presets
                </p>
                {(Object.keys(themeConfig) as ThemePreset[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTheme(t);
                      setShowThemeSwitcher(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-3",
                      theme === t 
                        ? "bg-white/10" 
                        : "hover:bg-white/5"
                    )}
                  >
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: themeConfig[t].colors.primary }}
                    />
                    <span style={{ color: theme === t ? themeConfig[t].colors.primary : currentTheme.colors.text }}>
                      {themeConfig[t].name}
                    </span>
                    {theme === t && <Sparkles className="h-3 w-3 ml-auto" style={{ color: themeConfig[t].colors.primary }} />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main Content with Section Dividers */}
      <div className="relative z-10">
        <HeroSection data={data} theme={theme} themeConfig={currentTheme} />
        
        <TechMarquee theme={theme} themeConfig={currentTheme} />
        
        <TrustStrip data={data} theme={theme} themeConfig={currentTheme} />
        
        <SectionDivider theme={theme} themeConfig={currentTheme} />
        
        <div id="about">
          <AboutSection data={data} theme={theme} themeConfig={currentTheme} />
        </div>
        
        <SectionDivider theme={theme} themeConfig={currentTheme} />
        
        <CertificationMarquee 
          certifications={data.certifications} 
          theme={theme} 
          themeConfig={currentTheme} 
        />
        
        <SectionDivider theme={theme} themeConfig={currentTheme} />
        
        <div id="skills">
          <SkillsSection data={data} theme={theme} themeConfig={currentTheme} />
        </div>
        
        <SectionDivider theme={theme} themeConfig={currentTheme} />
        
        <div id="projects">
          <ProjectsSection data={data} theme={theme} themeConfig={currentTheme} />
        </div>
        
        <SectionDivider theme={theme} themeConfig={currentTheme} />
        
        <div id="experience">
          <ExperienceSection data={data} theme={theme} themeConfig={currentTheme} />
        </div>
        
        <SectionDivider theme={theme} themeConfig={currentTheme} />
        
        <TestimonialsSection theme={theme} themeConfig={currentTheme} />
        
        <SectionDivider theme={theme} themeConfig={currentTheme} />
        
        <div id="contact">
          <ContactSection data={data} theme={theme} themeConfig={currentTheme} />
        </div>
        
        <Footer data={data} theme={theme} themeConfig={currentTheme} />
      </div>
    </div>
  );
}

export function PremiumShowcase({ data }: PremiumShowcaseProps) {
  return (
    <CinematicModeProvider>
      <PremiumShowcaseContent data={data} />
    </CinematicModeProvider>
  );
}
