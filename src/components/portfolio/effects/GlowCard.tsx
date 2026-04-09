import { useRef, useState, ReactNode, CSSProperties } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: 'low' | 'medium' | 'high';
  enableTilt?: boolean;
  borderRadius?: string;
}

export function GlowCard({
  children,
  className,
  glowColor = 'hsl(var(--accent))',
  intensity = 'medium',
  enableTilt = true,
  borderRadius = '1rem'
}: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const intensityMap = {
    low: { blur: '60px', opacity: 0.15 },
    medium: { blur: '80px', opacity: 0.25 },
    high: { blur: '100px', opacity: 0.35 }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || prefersReducedMotion) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPosition({ x, y });
  };

  const tiltStyle: CSSProperties = enableTilt && !prefersReducedMotion && isHovering ? {
    transform: `perspective(1000px) rotateX(${(position.y - (cardRef.current?.offsetHeight || 0) / 2) * -0.02}deg) rotateY(${(position.x - (cardRef.current?.offsetWidth || 0) / 2) * 0.02}deg)`
  } : {};

  return (
    <motion.div
      ref={cardRef}
      className={cn("relative overflow-hidden transition-transform duration-200", className)}
      style={{ 
        borderRadius,
        ...tiltStyle
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setPosition({ x: 0, y: 0 });
      }}
      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Glow effect that follows cursor */}
      {isHovering && !prefersReducedMotion && (
        <div
          className="absolute pointer-events-none transition-opacity duration-300"
          style={{
            left: position.x - 100,
            top: position.y - 100,
            width: 200,
            height: 200,
            background: glowColor,
            filter: `blur(${intensityMap[intensity].blur})`,
            opacity: intensityMap[intensity].opacity,
            borderRadius: '50%'
          }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

// Magnetic button effect
interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function MagneticButton({ children, className, strength = 0.3 }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || prefersReducedMotion) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setPosition({
      x: (e.clientX - centerX) * strength,
      y: (e.clientY - centerY) * strength
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}
