import { WifiOff, CloudOff, RefreshCw, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { formatCacheAge } from '@/lib/offlineStorage';

interface OfflineBannerProps {
  cacheAge?: number | null;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export function OfflineBanner({ 
  cacheAge, 
  onRetry, 
  isRetrying,
  className 
}: OfflineBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'flex items-center justify-between gap-3 px-4 py-3 bg-warning/10 border border-warning/30 rounded-xl backdrop-blur-sm',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-warning/20">
          <WifiOff className="h-5 w-5 text-warning" />
        </div>
        <div>
          <p className="text-sm font-medium text-warning">You're offline</p>
          {cacheAge !== null && cacheAge !== undefined && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Database className="h-3 w-3" />
              Showing cached data from {formatCacheAge(cacheAge)}
            </p>
          )}
        </div>
      </div>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
          className="text-warning hover:text-warning hover:bg-warning/10"
        >
          <RefreshCw className={cn('h-4 w-4 mr-1', isRetrying && 'animate-spin')} />
          Retry
        </Button>
      )}
    </motion.div>
  );
}

interface OfflineIndicatorProps {
  variant?: 'minimal' | 'detailed';
  className?: string;
}

export function OfflineIndicator({ variant = 'minimal', className }: OfflineIndicatorProps) {
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-1.5 text-warning', className)}>
        <CloudOff className="h-4 w-4" />
        <span className="text-xs font-medium">Offline</span>
      </div>
    );
  }

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-1.5 rounded-full bg-warning/10 border border-warning/30',
      className
    )}>
      <WifiOff className="h-4 w-4 text-warning" />
      <span className="text-xs font-medium text-warning">No Connection</span>
    </div>
  );
}

interface CachedDataNoticeProps {
  cacheAge: number;
  className?: string;
}

export function CachedDataNotice({ cacheAge, className }: CachedDataNoticeProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 text-muted-foreground text-xs',
        className
      )}
    >
      <Database className="h-3 w-3" />
      <span>Cached {formatCacheAge(cacheAge)}</span>
    </motion.div>
  );
}

interface OfflineOverlayProps {
  isVisible: boolean;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function OfflineOverlay({ isVisible, onRetry, isRetrying }: OfflineOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="max-w-sm w-full mx-4 p-6 rounded-2xl bg-card border border-border/50 shadow-xl text-center"
          >
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
              <WifiOff className="h-8 w-8 text-warning" />
            </div>
            <h3 className="text-lg font-semibold mb-2">You're Offline</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Check your internet connection and try again.
            </p>
            {onRetry && (
              <Button 
                onClick={onRetry} 
                disabled={isRetrying}
                className="w-full"
              >
                <RefreshCw className={cn('h-4 w-4 mr-2', isRetrying && 'animate-spin')} />
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </Button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
