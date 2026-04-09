import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LogoSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

const sizeConfig = {
  sm: { icon: 'h-6 w-6', text: 'text-xs', gap: 'gap-1.5', dots: 'h-1 w-1' },
  md: { icon: 'h-8 w-8', text: 'text-sm', gap: 'gap-2', dots: 'h-1.5 w-1.5' },
  lg: { icon: 'h-12 w-12', text: 'text-base', gap: 'gap-3', dots: 'h-2 w-2' },
};

/**
 * Compact logo-based loading spinner
 * Replaces circular Loader2 with brand identity
 */
export function LogoSpinner({ size = 'md', className, showText = false }: LogoSpinnerProps) {
  const config = sizeConfig[size];

  return (
    <div className={cn('flex flex-col items-center', config.gap, className)}>
      <motion.div
        className="relative"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Glow effect */}
        <motion.div
          className={cn('absolute inset-0 rounded-lg blur-md', config.icon)}
          style={{ backgroundColor: 'hsl(var(--accent) / 0.4)' }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Logo SVG */}
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn('relative z-10', config.icon)}
        >
          <defs>
            <linearGradient id="spinnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--accent))" />
              <stop offset="100%" stopColor="hsl(var(--accent) / 0.7)" />
            </linearGradient>
          </defs>

          {/* Background */}
          <rect
            x="2"
            y="2"
            width="36"
            height="36"
            rx="10"
            fill="url(#spinnerGrad)"
          />

          {/* Left bar - animated */}
          <motion.rect
            x="9"
            y="11"
            width="4"
            height="18"
            rx="2"
            fill="white"
            opacity="0.95"
            animate={{ scaleY: [1, 0.6, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
            style={{ transformOrigin: 'center center' }}
          />

          {/* Middle peak - animated */}
          <motion.path
            d="M16 11L20 7L24 11L24 29L20 25L16 29Z"
            fill="white"
            opacity="0.95"
            animate={{ scaleY: [1, 0.7, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.15 }}
            style={{ transformOrigin: 'center center' }}
          />

          {/* Right bar - animated */}
          <motion.rect
            x="27"
            y="11"
            width="4"
            height="18"
            rx="2"
            fill="white"
            opacity="0.95"
            animate={{ scaleY: [1, 0.6, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.3 }}
            style={{ transformOrigin: 'center center' }}
          />
        </svg>
      </motion.div>

      {showText && (
        <motion.span
          className={cn('font-medium text-muted-foreground', config.text)}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading...
        </motion.span>
      )}
    </div>
  );
}

/**
 * Full-page centered loader with logo
 */
export function PageLoader({ className }: { className?: string }) {
  return (
    <div className={cn('min-h-screen flex items-center justify-center bg-background', className)}>
      <LogoSpinner size="lg" showText />
    </div>
  );
}

/**
 * Inline/section loader
 */
export function SectionLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center h-64', className)}>
      <LogoSpinner size="md" />
    </div>
  );
}

/**
 * Small inline button/form loader
 */
export function InlineLoader({ className }: { className?: string }) {
  return <LogoSpinner size="sm" className={className} />;
}
