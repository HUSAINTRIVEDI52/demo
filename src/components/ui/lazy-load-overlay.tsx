import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PremiumSkeleton } from './premium-skeleton';
import { usePerformanceMode } from '@/hooks/usePerformanceMode';

interface LazyLoadOverlayProps {
  variant?: 'page' | 'dashboard' | 'content';
  className?: string;
}

/**
 * Skeleton overlay shown when lazy-loaded components are being fetched
 * Provides visual continuity during code splitting loads
 */
export function LazyLoadOverlay({ variant = 'page', className }: LazyLoadOverlayProps) {
  const performanceMode = usePerformanceMode();
  
  return (
    <div
      className={cn(
        'min-h-screen bg-background relative overflow-hidden',
        className
      )}
    >
      {/* Subtle gradient overlay - static, no animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5" />
      
      {/* Content based on variant */}
      {variant === 'page' && <PageSkeleton performanceMode={performanceMode} />}
      {variant === 'dashboard' && <DashboardLoadingSkeleton performanceMode={performanceMode} />}
      {variant === 'content' && <ContentSkeleton performanceMode={performanceMode} />}
      
      {/* Simple loading indicator - no infinite animations */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <LoadingDots performanceMode={performanceMode} />
      </div>
    </div>
  );
}

/**
 * Full page skeleton with header and content areas
 */
function PageSkeleton({ performanceMode }: { performanceMode: boolean }) {
  return (
    <div className="container py-8 space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <PremiumSkeleton variant="title" className="w-48 h-8" />
          <PremiumSkeleton variant="text" className="w-72 h-4" />
        </div>
        <PremiumSkeleton className="h-10 w-28 rounded-xl" />
      </div>
      
      {/* Content grid - use simple divs in performance mode, skip staggered animations */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          performanceMode ? (
            <CardSkeleton key={i} />
          ) : (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <CardSkeleton />
            </motion.div>
          )
        ))}
      </div>
    </div>
  );
}

/**
 * Dashboard-specific loading skeleton
 */
function DashboardLoadingSkeleton({ performanceMode }: { performanceMode: boolean }) {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <PremiumSkeleton variant="title" className="w-32 h-8" />
          <PremiumSkeleton variant="text" className="w-64 h-4" />
        </div>
        <PremiumSkeleton className="h-7 w-20 rounded-full" />
      </div>
      
      {/* Stats row - simplified */}
      <div className="rounded-2xl border border-border/50 bg-card/30 p-6">
        <PremiumSkeleton variant="title" className="w-28 h-5 mb-4" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <PremiumSkeleton variant="text" className="w-16 h-3" />
                <PremiumSkeleton variant="text" className="w-12 h-3" />
              </div>
              <PremiumSkeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Content cards - simplified, no staggered motion */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/50 bg-card/30 p-6 space-y-4"
          >
            <PremiumSkeleton variant="title" className="w-40 h-5" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center gap-4">
                  <PremiumSkeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <PremiumSkeleton variant="text" className="w-3/4 h-4" />
                    <PremiumSkeleton variant="text" className="w-1/2 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Simple content skeleton for smaller sections
 */
function ContentSkeleton({ performanceMode }: { performanceMode: boolean }) {
  return (
    <div className="container py-8 max-w-4xl mx-auto space-y-6">
      <PremiumSkeleton variant="title" className="w-64 h-10" />
      <PremiumSkeleton variant="text" className="w-full h-4" />
      <PremiumSkeleton variant="text" className="w-5/6 h-4" />
      <PremiumSkeleton variant="text" className="w-4/6 h-4" />
      
      <div className="pt-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/50 bg-card/30 p-4"
          >
            <div className="flex items-start gap-4">
              <PremiumSkeleton className="h-12 w-12 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <PremiumSkeleton variant="title" className="w-48 h-5" />
                <PremiumSkeleton variant="text" className="w-full h-3" />
                <PremiumSkeleton variant="text" className="w-2/3 h-3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Card skeleton component
 */
function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/30 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <PremiumSkeleton className="h-10 w-10 rounded-lg" />
        <PremiumSkeleton variant="text" className="w-16 h-3" />
      </div>
      <div className="space-y-2">
        <PremiumSkeleton variant="title" className="w-3/4 h-5" />
        <PremiumSkeleton variant="text" className="w-full h-3" />
        <PremiumSkeleton variant="text" className="w-5/6 h-3" />
      </div>
      <div className="flex gap-2 pt-2">
        <PremiumSkeleton className="h-6 w-16 rounded-full" />
        <PremiumSkeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Loading dots - static in performance mode, simple animation otherwise
 */
function LoadingDots({ performanceMode }: { performanceMode: boolean }) {
  // In performance mode, just show static dots to avoid infinite animations
  if (performanceMode) {
    return (
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-accent"
            style={{ opacity: 0.4 + i * 0.3 }}
          />
        ))}
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1.5">
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
    </div>
  );
}

/**
 * Inline suspense boundary with skeleton
 */
export function InlineSuspenseSkeleton({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn('space-y-3 p-4', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-3">
        <PremiumSkeleton className="h-8 w-8 rounded-lg" />
        <PremiumSkeleton variant="text" className="w-32 h-4" />
      </div>
      <PremiumSkeleton variant="text" className="w-full h-3" />
      <PremiumSkeleton variant="text" className="w-3/4 h-3" />
    </motion.div>
  );
}
