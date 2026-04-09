import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AppSplashScreenProps {
  isLoading: boolean;
}

/**
 * Performant splash screen with GPU-accelerated animations
 * Uses transform and opacity only for 60fps performance
 */
export function AppSplashScreen({ isLoading }: AppSplashScreenProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Subtle background gradient */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: 'radial-gradient(circle at 50% 50%, hsl(var(--accent) / 0.15) 0%, transparent 60%)',
            }}
          />

          <div className="relative flex flex-col items-center gap-6">
            {/* Animated Logo */}
            <motion.div
              className="relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Glow effect - GPU accelerated */}
              <motion.div
                className="absolute inset-0 rounded-2xl blur-xl"
                style={{ backgroundColor: 'hsl(var(--accent) / 0.3)' }}
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Logo SVG */}
              <svg
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative z-10 h-20 w-20"
              >
                <defs>
                  <linearGradient id="splashGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--accent))" />
                    <stop offset="100%" stopColor="hsl(var(--accent) / 0.7)" />
                  </linearGradient>
                  <linearGradient id="splashGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
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
                  fill="url(#splashGrad1)"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                />

                {/* Inner glow */}
                <rect
                  x="2"
                  y="2"
                  width="36"
                  height="36"
                  rx="10"
                  fill="url(#splashGrad2)"
                  opacity="0.3"
                />

                {/* Left bar */}
                <motion.rect
                  x="9"
                  y="11"
                  width="4"
                  height="18"
                  rx="2"
                  fill="white"
                  opacity="0.95"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  style={{ transformOrigin: 'center bottom' }}
                  transition={{ duration: 0.25, delay: 0.15, ease: 'easeOut' }}
                />

                {/* Middle peak */}
                <motion.path
                  d="M16 11L20 7L24 11L24 29L20 25L16 29Z"
                  fill="white"
                  opacity="0.95"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  style={{ transformOrigin: 'center bottom' }}
                  transition={{ duration: 0.3, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                />

                {/* Right bar */}
                <motion.rect
                  x="27"
                  y="11"
                  width="4"
                  height="18"
                  rx="2"
                  fill="white"
                  opacity="0.95"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  style={{ transformOrigin: 'center bottom' }}
                  transition={{ duration: 0.25, delay: 0.35, ease: 'easeOut' }}
                />

                {/* Shine sweep */}
                <motion.path
                  d="M6 12C6 8.68629 8.68629 6 12 6H20C20 6 10 8 6 12Z"
                  fill="white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.4, 0] }}
                  transition={{ duration: 1.2, delay: 0.5, repeat: Infinity, repeatDelay: 2 }}
                />
              </svg>
            </motion.div>

            {/* Brand text */}
            <motion.div
              className="font-display text-2xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.4 }}
            >
              <span className="text-foreground">Make</span>
              <span className="text-accent">Portfolio</span>
            </motion.div>

            {/* Loading dots */}
            <motion.div
              className="flex items-center gap-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-accent"
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 0.7,
                    repeat: Infinity,
                    delay: i * 0.12,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
