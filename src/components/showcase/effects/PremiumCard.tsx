import { ReactNode, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ThemePreset } from '../PremiumShowcase';
import { useCinematicMode } from './CinematicModeContext';

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  theme: ThemePreset;
  themeConfig: any;
  enableTilt?: boolean;
  enableGlow?: boolean;
  glowColor?: string;
}

export function PremiumCard({
  children,
  className,
  theme,
  themeConfig,
  enableTilt = true,
  enableGlow = true,
  glowColor
}: PremiumCardProps) {
  const { cinematicMode, reducedMotion } = useCinematicMode();
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || reducedMotion || !cinematicMode) return;

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rotateXValue = (mouseY / (rect.height / 2)) * -8;
    const rotateYValue = (mouseX / (rect.width / 2)) * 8;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovering(false);
  };

  const glowColorValue = glowColor || themeConfig.colors.primary;

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "relative transition-all duration-300",
        theme === 'cyber-neon' && "bg-[#0A0F14] border border-[#00FFE1]/20",
        theme === 'minimal-dark' && "bg-white/5 border border-white/10",
        theme === 'glassmorphism' && "glass-card",
        className
      )}
      style={{
        transform: enableTilt && cinematicMode
          ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
          : undefined,
        transformStyle: 'preserve-3d',
        boxShadow: isHovering && enableGlow && cinematicMode
          ? `0 0 40px ${glowColorValue}30, 0 20px 40px rgba(0,0,0,0.3)`
          : isHovering
          ? '0 20px 40px rgba(0,0,0,0.3)'
          : '0 4px 20px rgba(0,0,0,0.1)'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={{
        scale: reducedMotion ? 1 : 1.02,
        borderColor: theme === 'cyber-neon' 
          ? 'rgba(0, 255, 225, 0.6)' 
          : theme === 'minimal-dark'
          ? 'rgba(255, 255, 255, 0.3)'
          : 'rgba(168, 85, 247, 0.6)'
      }}
    >
      {/* Gradient border glow effect */}
      {enableGlow && cinematicMode && isHovering && (
        <div
          className="absolute -inset-px rounded-[inherit] pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${themeConfig.colors.primary}40, ${themeConfig.colors.secondary}40)`,
            filter: 'blur(1px)',
            opacity: 0.5
          }}
        />
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

// Hover overlay for project cards
interface ProjectCardOverlayProps {
  theme: ThemePreset;
  themeConfig: any;
}

export function ProjectCardOverlay({ theme, themeConfig }: ProjectCardOverlayProps) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
      style={{
        background: `linear-gradient(135deg, ${themeConfig.colors.primary}90, ${themeConfig.colors.secondary}90)`
      }}
    >
      <motion.span
        initial={{ scale: 0.8 }}
        whileHover={{ scale: 1 }}
        className="text-white font-bold text-lg"
      >
        View Project
      </motion.span>
    </motion.div>
  );
}
