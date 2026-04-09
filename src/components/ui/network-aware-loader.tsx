import { useNetworkStatus, type ConnectionSpeed } from '@/hooks/useNetworkStatus';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff, Signal, SignalLow, SignalMedium, Loader2, Database, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

interface NetworkAwareLoaderProps {
  isLoading: boolean;
  className?: string;
  variant?: 'minimal' | 'detailed' | 'inline';
  showMessage?: boolean;
}

const connectionMessages: Record<ConnectionSpeed, string> = {
  fast: 'Loading...',
  moderate: 'Loading on slower connection...',
  slow: 'Slow connection detected. Please wait...',
  offline: 'You appear to be offline',
};

const connectionIcons: Record<ConnectionSpeed, React.ReactNode> = {
  fast: <Signal className="h-4 w-4" />,
  moderate: <SignalMedium className="h-4 w-4" />,
  slow: <SignalLow className="h-4 w-4" />,
  offline: <WifiOff className="h-4 w-4" />,
};

const connectionColors: Record<ConnectionSpeed, string> = {
  fast: 'text-green-500',
  moderate: 'text-amber-500',
  slow: 'text-orange-500',
  offline: 'text-red-500',
};

export function NetworkAwareLoader({ 
  isLoading, 
  className,
  variant = 'minimal',
  showMessage = true 
}: NetworkAwareLoaderProps) {
  const { connectionSpeed, isOnline } = useNetworkStatus();

  if (!isLoading && isOnline) return null;

  const effectiveSpeed = isOnline ? connectionSpeed : 'offline';

  if (variant === 'inline') {
    return (
      <AnimatePresence>
        {(isLoading || !isOnline) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "flex items-center gap-2 text-sm",
              connectionColors[effectiveSpeed],
              className
            )}
          >
            {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
            {connectionIcons[effectiveSpeed]}
            {showMessage && (
              <span className="text-muted-foreground">
                {connectionMessages[effectiveSpeed]}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (variant === 'detailed') {
    return (
      <AnimatePresence>
        {(isLoading || !isOnline) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
              className
            )}
          >
            <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-card border shadow-lg max-w-sm mx-4">
              <div className="relative">
                <div className={cn(
                  "h-16 w-16 rounded-full flex items-center justify-center",
                  effectiveSpeed === 'offline' ? 'bg-red-500/10' : 'bg-primary/10'
                )}>
                  {isOnline ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  ) : (
                    <WifiOff className="h-8 w-8 text-red-500" />
                  )}
                </div>
                
                {/* Connection indicator badge */}
                <div className={cn(
                  "absolute -bottom-1 -right-1 p-1.5 rounded-full bg-card border",
                  connectionColors[effectiveSpeed]
                )}>
                  {connectionIcons[effectiveSpeed]}
                </div>
              </div>
              
              <div className="text-center space-y-1">
                <p className="font-medium">{connectionMessages[effectiveSpeed]}</p>
                {effectiveSpeed === 'slow' && (
                  <p className="text-xs text-muted-foreground">
                    Large content may take longer to load
                  </p>
                )}
                {effectiveSpeed === 'offline' && (
                  <p className="text-xs text-muted-foreground">
                    Check your internet connection
                  </p>
                )}
              </div>

              {/* Progress indicator for slow connections */}
              {effectiveSpeed === 'slow' && isLoading && (
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Minimal variant (default)
  return (
    <AnimatePresence>
      {(isLoading || !isOnline) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "fixed top-16 left-1/2 -translate-x-1/2 z-50",
            className
          )}
        >
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border",
            "bg-card/95 backdrop-blur-sm",
            effectiveSpeed === 'offline' && "border-red-500/50",
            effectiveSpeed === 'slow' && "border-orange-500/50",
            effectiveSpeed === 'moderate' && "border-amber-500/50",
            effectiveSpeed === 'fast' && "border-border"
          )}>
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            )}
            <span className={cn("text-sm", connectionColors[effectiveSpeed])}>
              {connectionIcons[effectiveSpeed]}
            </span>
            {showMessage && (
              <span className="text-sm text-muted-foreground">
                {connectionMessages[effectiveSpeed]}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Standalone connection status indicator for use in navbars/headers
interface ConnectionStatusIndicatorProps {
  className?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function ConnectionStatusIndicator({ 
  className,
  onRetry,
  isRetrying 
}: ConnectionStatusIndicatorProps) {
  const { connectionSpeed, isOnline } = useNetworkStatus();
  
  // Only show for slow/offline connections
  if (isOnline && connectionSpeed === 'fast') return null;

  const effectiveSpeed = isOnline ? connectionSpeed : 'offline';
  const isOffline = !isOnline;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs cursor-default",
            effectiveSpeed === 'offline' && "bg-warning/10 text-warning",
            effectiveSpeed === 'slow' && "bg-orange-500/10 text-orange-500",
            effectiveSpeed === 'moderate' && "bg-amber-500/10 text-amber-500",
            className
          )}
        >
          {isOffline ? (
            <>
              <WifiOff className="h-3.5 w-3.5" />
              <Database className="h-3 w-3" />
            </>
          ) : (
            connectionIcons[effectiveSpeed]
          )}
          <span className="hidden sm:inline">
            {isOffline ? 'Offline (Cached)' : 'Slow'}
          </span>
          {isOffline && onRetry && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 ml-1 text-warning hover:text-warning"
              onClick={onRetry}
              disabled={isRetrying}
            >
              <RefreshCw className={cn("h-3 w-3", isRetrying && "animate-spin")} />
            </Button>
          )}
        </motion.div>
      </TooltipTrigger>
      <TooltipContent>
        {isOffline 
          ? "You're offline. Showing cached data." 
          : "Slow connection detected"
        }
      </TooltipContent>
    </Tooltip>
  );
}

// Inline skeleton for suspense boundaries
export function InlineSuspenseSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse space-y-3", className)}>
      <div className="h-4 w-3/4 rounded bg-muted" />
      <div className="h-4 w-1/2 rounded bg-muted" />
    </div>
  );
}
