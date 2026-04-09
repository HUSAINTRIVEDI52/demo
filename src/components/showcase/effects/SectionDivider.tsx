import { motion } from 'framer-motion';
import { ThemePreset } from '../PremiumShowcase';

interface SectionDividerProps {
  theme: ThemePreset;
  themeConfig: any;
}

export function SectionDivider({ theme, themeConfig }: SectionDividerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      whileInView={{ opacity: 1, scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative h-px max-w-4xl mx-auto my-0"
    >
      <div
        className="absolute inset-0"
        style={{
          background: theme === 'cyber-neon'
            ? 'linear-gradient(90deg, transparent, #00FFE1, transparent)'
            : theme === 'minimal-dark'
            ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
            : 'linear-gradient(90deg, transparent, #A855F7, transparent)',
          boxShadow: theme === 'cyber-neon'
            ? '0 0 20px rgba(0, 255, 225, 0.5)'
            : theme === 'glassmorphism'
            ? '0 0 20px rgba(168, 85, 247, 0.5)'
            : 'none'
        }}
      />
    </motion.div>
  );
}
