import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemePreset } from '../PremiumShowcase';
import { useCinematicMode } from './CinematicModeContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface StickyNavbarProps {
  theme: ThemePreset;
  themeConfig: any;
  name: string;
}

const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
];

export function StickyNavbar({ theme, themeConfig, name }: StickyNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cinematicMode, toggleCinematicMode } = useCinematicMode();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Detect active section
      const sections = navItems.map(item => item.href.substring(1));
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.getElementById(href.substring(1));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  // Check if we're in preview mode (has demo banner)
  const isPreviewMode = window.location.pathname.startsWith('/preview/');
  const topOffset = isPreviewMode ? 'top-12' : 'top-0';

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed left-0 right-0 z-40 transition-all duration-500",
          topOffset,
          isScrolled && cn(
            "py-3 backdrop-blur-xl",
            theme === 'cyber-neon' && "bg-[#05070B]/80 border-b border-[#00FFE1]/20 shadow-[0_4px_30px_rgba(0,255,225,0.1)]",
            theme === 'minimal-dark' && "bg-[#0A0A0B]/80 border-b border-white/10",
            theme === 'glassmorphism' && "bg-[#0F0F23]/60 border-b border-purple-500/20 shadow-[0_4px_30px_rgba(168,85,247,0.1)]"
          ),
          !isScrolled && "py-6"
        )}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <motion.a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-xl font-bold font-['Space_Grotesk']"
            whileHover={{ scale: 1.05 }}
            style={{ color: themeConfig.colors.text }}
          >
            {name.split(' ')[0]}
            <span style={{ color: themeConfig.colors.primary }}>.</span>
          </motion.a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <motion.button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className={cn(
                  "text-sm font-medium transition-all duration-300 relative",
                  activeSection === item.href.substring(1)
                    ? "opacity-100"
                    : "opacity-60 hover:opacity-100"
                )}
                style={{ color: activeSection === item.href.substring(1) ? themeConfig.colors.primary : themeConfig.colors.text }}
                whileHover={{ y: -2 }}
              >
                {item.label}
                {activeSection === item.href.substring(1) && (
                  <motion.div
                    layoutId="activeSection"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                    style={{ backgroundColor: themeConfig.colors.primary }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Cinematic Mode Toggle */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles 
                className={cn(
                  "h-4 w-4 transition-colors",
                  cinematicMode ? "text-amber-400" : "text-muted-foreground"
                )}
              />
              <span className="text-xs font-medium" style={{ color: themeConfig.colors.muted }}>
                Cinematic
              </span>
              <Switch
                checked={cinematicMode}
                onCheckedChange={toggleCinematicMode}
                className="data-[state=checked]:bg-amber-500"
              />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" style={{ color: themeConfig.colors.text }} />
            ) : (
              <Menu className="h-5 w-5" style={{ color: themeConfig.colors.text }} />
            )}
          </Button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "fixed inset-x-0 top-[72px] z-40 p-6 md:hidden",
              theme === 'glassmorphism' 
                ? "glass-card backdrop-blur-xl" 
                : "bg-[#0A0F14]/95 backdrop-blur-xl border-b border-white/10"
            )}
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className={cn(
                    "text-left py-2 text-lg font-medium transition-colors",
                    activeSection === item.href.substring(1)
                      ? ""
                      : "opacity-70"
                  )}
                  style={{ color: activeSection === item.href.substring(1) ? themeConfig.colors.primary : themeConfig.colors.text }}
                >
                  {item.label}
                </button>
              ))}
              
              {/* Mobile Cinematic Toggle */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-sm" style={{ color: themeConfig.colors.muted }}>
                  Cinematic Mode
                </span>
                <Switch
                  checked={cinematicMode}
                  onCheckedChange={toggleCinematicMode}
                  className="data-[state=checked]:bg-amber-500"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
