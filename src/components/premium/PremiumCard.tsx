import { ReactNode, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAppTheme } from '@/contexts/AppThemeContext';

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  enableTilt?: boolean;
  enableGlow?: boolean;
  glowColor?: string;
  variant?: 'default' | 'glass' | 'solid' | 'outline';
}

export function PremiumCard({
  children,
  className,
  enableTilt = true,
  enableGlow = true,
  glowColor,
  variant = 'default',
}: PremiumCardProps) {
  const { theme, config } = useAppTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !enableTilt) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'glass':
        return 'bg-card/40 backdrop-blur-xl border border-border/50';
      case 'solid':
        return 'bg-card border border-border';
      case 'outline':
        return 'bg-transparent border border-border hover:border-accent/50';
      default:
        return 'bg-card/60 backdrop-blur-lg border border-border/50';
    }
  };

  const glow = glowColor || config.colors.accentGlow;

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'relative rounded-2xl overflow-hidden transition-all duration-300',
        getVariantStyles(),
        isHovered && enableGlow && 'shadow-lg',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: enableTilt ? mousePosition.y * -10 : 0,
        rotateY: enableTilt ? mousePosition.x * 10 : 0,
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        transformStyle: 'preserve-3d',
        boxShadow: isHovered && enableGlow 
          ? `0 20px 40px -10px ${glow}, 0 0 0 1px hsl(${config.colors.accent} / 0.2)` 
          : undefined,
      }}
    >
      {/* Gradient border effect on hover */}
      {isHovered && enableGlow && (
        <div 
          className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, hsl(${config.colors.accent} / 0.2), transparent 50%)`,
          }}
        />
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { value: number; isPositive: boolean };
  className?: string;
}

export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  const { config } = useAppTheme();
  
  return (
    <PremiumCard className={cn('p-6', className)} variant="glass">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-display font-bold">{value}</p>
          {trend && (
            <p className={cn(
              'text-sm font-medium mt-2',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div 
            className="h-12 w-12 rounded-xl flex items-center justify-center"
            style={{ background: `hsl(${config.colors.accent} / 0.15)` }}
          >
            {icon}
          </div>
        )}
      </div>
    </PremiumCard>
  );
}
