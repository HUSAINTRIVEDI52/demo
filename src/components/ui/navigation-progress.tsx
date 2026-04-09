import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePerformanceMode } from '@/hooks/usePerformanceMode';

interface NavigationProgressProps {
  className?: string;
  color?: 'accent' | 'primary' | 'gradient';
}

/**
 * Navigation progress bar that shows during route transitions
 * Displays at the top of the viewport with a smooth animation
 */
export function NavigationProgress({ className, color = 'accent' }: NavigationProgressProps) {
  const location = useLocation();
  const performanceMode = usePerformanceMode();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Keep this snappy: no artificial 500ms delay on every navigation.
    setIsNavigating(true);
    setProgress(0);

    const timer1 = setTimeout(() => setProgress(70), 30);
    const timer2 = setTimeout(() => setProgress(100), 90);
    const timer3 = setTimeout(() => {
      setIsNavigating(false);
      setProgress(0);
    }, 160);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [location.pathname]);

  const colorClasses = {
    accent: 'bg-accent',
    primary: 'bg-primary',
    gradient: 'bg-gradient-to-r from-accent via-primary to-accent',
  };

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          className={cn(
            'fixed top-0 left-0 right-0 z-[100] h-0.5',
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          {/* Background track */}
          <div className="absolute inset-0 bg-border/30" />
          
          {/* Progress bar */}
          <motion.div
            className={cn(
              'h-full relative',
              colorClasses[color]
            )}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ 
              duration: 0.15, 
              ease: [0.22, 1, 0.36, 1] 
            }}
          >
            {/* Glow effect - only on desktop */}
            {!performanceMode && (
              <div 
                className={cn(
                  'absolute right-0 top-1/2 -translate-y-1/2 w-24 h-4 blur-md opacity-60',
                  colorClasses[color]
                )}
              />
            )}
            
            {/* Skip infinite shimmer animation entirely - it was causing constant repaints */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Minimal progress bar variant for portfolio themes
 * Uses theme-aware colors
 */
export function PortfolioNavigationProgress({ className }: { className?: string }) {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIsNavigating(true);
    setProgress(0);

    const timer1 = setTimeout(() => setProgress(80), 35);
    const timer2 = setTimeout(() => setProgress(100), 90);
    const timer3 = setTimeout(() => {
      setIsNavigating(false);
      setProgress(0);
    }, 150);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          className={cn(
            'fixed top-0 left-0 right-0 z-[100] h-[2px]',
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          <motion.div
            className="h-full bg-current"
            style={{ color: 'hsl(var(--accent))' }}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
