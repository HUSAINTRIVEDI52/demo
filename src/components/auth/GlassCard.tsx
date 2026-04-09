import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAppTheme } from '@/contexts/AppThemeContext';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
  const { config } = useAppTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        className
      )}
    >
      {/* Glass background */}
      <div 
        className={cn(
          "absolute inset-0 backdrop-blur-xl",
          config.isDark 
            ? "bg-card/60 border border-border/50" 
            : "bg-card/80 border border-border/30 shadow-xl shadow-black/5"
        )}
      />
      
      {/* Gradient border effect */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-50"
        style={{
          background: `linear-gradient(135deg, hsl(${config.colors.accent} / 0.1) 0%, transparent 50%, hsl(${config.colors.accent} / 0.05) 100%)`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 p-6 md:p-8">
        {children}
      </div>
      
      {/* Subtle shine effect */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)',
        }}
      />
    </motion.div>
  );
}
