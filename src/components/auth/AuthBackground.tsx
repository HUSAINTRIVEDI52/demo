import { motion } from 'framer-motion';
import { useAppTheme } from '@/contexts/AppThemeContext';

export function AuthBackground() {
  const { config } = useAppTheme();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return (
      <div 
        className="fixed inset-0 -z-10"
        style={{ background: `hsl(${config.colors.background})` }}
      />
    );
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div 
        className="absolute inset-0"
        style={{ background: `hsl(${config.colors.background})` }}
      />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full opacity-30 blur-3xl"
        style={{ 
          background: `radial-gradient(circle, hsl(${config.colors.accent} / 0.4) 0%, transparent 70%)` 
        }}
        animate={{
          x: [0, 100, 50, 0],
          y: [0, 50, 100, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full opacity-20 blur-3xl"
        style={{ 
          background: `radial-gradient(circle, hsl(${config.colors.primary} / 0.3) 0%, transparent 70%)` 
        }}
        animate={{
          x: [0, -80, -40, 0],
          y: [0, -60, -120, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Grid pattern overlay */}
      {config.effects.grid && (
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(${config.colors.accent} / 0.5) 1px, transparent 1px),
              linear-gradient(90deg, hsl(${config.colors.accent} / 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      )}

      {/* Subtle noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
