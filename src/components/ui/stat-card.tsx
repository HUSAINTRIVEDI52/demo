import { LucideIcon, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  isLoading?: boolean;
  loadingStartTime?: number;
  error?: boolean;
  className?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  isLoading = false,
  loadingStartTime,
  error = false,
  className,
}: StatCardProps) {
  // Calculate how long we've been loading
  const loadingDuration = loadingStartTime 
    ? Math.floor((Date.now() - loadingStartTime) / 1000)
    : 0;

  const isSlowLoading = loadingDuration > 5;
  const isVerySlowLoading = loadingDuration > 15;

  return (
    <Card className={cn('transition-all', className)}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            'h-10 w-10 rounded-lg flex items-center justify-center transition-colors',
            error ? 'bg-destructive/10' : 'bg-accent/10'
          )}>
            <Icon className={cn(
              'h-5 w-5',
              error ? 'text-destructive' : 'text-accent'
            )} />
          </div>
          <div className="min-w-0 flex-1">
            {isLoading ? (
              <div className="space-y-1">
                {/* Animated skeleton with pulse */}
                <div className="flex items-center gap-2">
                  <motion.div
                    className="h-7 w-12 rounded bg-muted"
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  {isSlowLoading && (
                    <span className="text-xs text-muted-foreground">
                      {isVerySlowLoading ? 'Still loading...' : 'Loading...'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ) : error ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <span className="text-sm text-destructive">Failed</span>
                </div>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading skeleton variant that matches the card layout
export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <motion.div
            className="h-10 w-10 rounded-lg bg-muted"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="flex-1 space-y-2">
            <motion.div
              className="h-7 w-16 rounded bg-muted"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
            />
            <motion.div
              className="h-4 w-24 rounded bg-muted"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
