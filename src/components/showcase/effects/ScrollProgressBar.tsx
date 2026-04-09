import { motion, useScroll, useSpring } from 'framer-motion';
import { ThemePreset } from '../PremiumShowcase';

interface ScrollProgressBarProps {
  theme: ThemePreset;
  themeConfig: any;
}

export function ScrollProgressBar({ theme, themeConfig }: ScrollProgressBarProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 z-[100] origin-left"
      style={{
        scaleX,
        background: theme === 'cyber-neon' 
          ? 'linear-gradient(90deg, #00FFE1, #00FF88)' 
          : theme === 'minimal-dark'
          ? 'linear-gradient(90deg, #FFFFFF, #6366F1)'
          : 'linear-gradient(90deg, #A855F7, #EC4899)',
        boxShadow: theme === 'cyber-neon'
          ? '0 0 20px rgba(0, 255, 225, 0.5)'
          : theme === 'glassmorphism'
          ? '0 0 20px rgba(168, 85, 247, 0.5)'
          : 'none'
      }}
    />
  );
}
