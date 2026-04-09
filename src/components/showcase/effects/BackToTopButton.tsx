import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemePreset } from '../PremiumShowcase';

interface BackToTopButtonProps {
  theme: ThemePreset;
  themeConfig: any;
}

export function BackToTopButton({ theme, themeConfig }: BackToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className={cn(
            "fixed bottom-24 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
            theme === 'cyber-neon' && "bg-[#0A0F14] border-2 border-[#00FFE1]/50 hover:border-[#00FFE1] hover:shadow-[0_0_30px_rgba(0,255,225,0.3)]",
            theme === 'minimal-dark' && "bg-white/10 border border-white/30 hover:bg-white/20",
            theme === 'glassmorphism' && "glass-card border-purple-500/50 hover:border-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]"
          )}
        >
          <ArrowUp className="h-5 w-5" style={{ color: themeConfig.colors.primary }} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
