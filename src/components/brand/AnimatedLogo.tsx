import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: { icon: 'h-12 w-12', text: 'text-lg' },
  md: { icon: 'h-16 w-16', text: 'text-xl' },
  lg: { icon: 'h-24 w-24', text: 'text-2xl' },
  xl: { icon: 'h-32 w-32', text: 'text-3xl' },
};

export function AnimatedLogo({ size = 'lg', showText = true, className }: AnimatedLogoProps) {
  const { icon, text } = sizeClasses[size];

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Animated Logo Mark */}
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Glow ring */}
        <motion.div
          className={cn('absolute inset-0 rounded-2xl bg-accent/30 blur-xl', icon)}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn('relative z-10', icon)}
        >
          <defs>
            <linearGradient id="animLogoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--accent))" />
              <stop offset="100%" stopColor="hsl(var(--accent) / 0.7)" />
            </linearGradient>
            <linearGradient id="animLogoGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--accent))" />
              <stop offset="50%" stopColor="hsl(var(--accent) / 0.8)" />
              <stop offset="100%" stopColor="hsl(var(--primary))" />
            </linearGradient>
          </defs>

          {/* Background */}
          <motion.rect
            x="2"
            y="2"
            width="36"
            height="36"
            rx="10"
            fill="url(#animLogoGrad1)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, ease: 'backOut' }}
          />

          {/* Inner glow */}
          <rect
            x="2"
            y="2"
            width="36"
            height="36"
            rx="10"
            fill="url(#animLogoGrad2)"
            opacity="0.3"
          />

          {/* Left bar - animates first */}
          <motion.rect
            x="9"
            y="11"
            width="4"
            height="18"
            rx="2"
            fill="white"
            opacity="0.95"
            initial={{ scaleY: 0, originY: 1 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.3, delay: 0.2, ease: 'easeOut' }}
          />

          {/* Middle peak - animates second */}
          <motion.path
            d="M16 11L20 7L24 11L24 29L20 25L16 29Z"
            fill="white"
            opacity="0.95"
            initial={{ scaleY: 0, originY: 1 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.4, delay: 0.35, ease: 'backOut' }}
          />

          {/* Right bar - animates third */}
          <motion.rect
            x="27"
            y="11"
            width="4"
            height="18"
            rx="2"
            fill="white"
            opacity="0.95"
            initial={{ scaleY: 0, originY: 1 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.3, delay: 0.5, ease: 'easeOut' }}
          />

          {/* Shine sweep */}
          <motion.path
            d="M6 12C6 8.68629 8.68629 6 12 6H20C20 6 10 8 6 12Z"
            fill="white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 1.5, delay: 0.7, repeat: Infinity, repeatDelay: 2 }}
          />
        </svg>
      </motion.div>

      {/* Animated Text */}
      {showText && (
        <motion.div
          className={cn('font-display font-bold tracking-tight', text)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <span className="text-foreground">Make</span>
          <span className="text-accent">Portfolio</span>
        </motion.div>
      )}

      {/* Loading dots */}
      <motion.div
        className="flex items-center gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-accent"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

/**
 * Full-screen splash loader with the animated logo
 */
export function SplashScreen({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-background',
        className
      )}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <AnimatedLogo size="lg" />
    </motion.div>
  );
}

/**
 * Inline loader for smaller loading states
 */
export function LogoLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <AnimatedLogo size="md" showText={false} />
    </div>
  );
}
