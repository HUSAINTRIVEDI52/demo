import { useState, useEffect, useRef } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { cn } from '@/lib/utils';
import { Loader2, ImageOff, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface NetworkAwareImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: React.ReactNode;
  showLoadingState?: boolean;
  aspectRatio?: string;
  variant?: 'default' | 'rounded' | 'card';
}

export function NetworkAwareImage({
  src,
  alt,
  fallback,
  showLoadingState = true,
  aspectRatio = 'aspect-video',
  variant = 'default',
  className,
  ...props
}: NetworkAwareImageProps) {
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [showSlowWarning, setShowSlowWarning] = useState(false);
  const { connectionSpeed, isOnline } = useNetworkStatus();
  const loadStartTime = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Reset state when src changes
    setLoadState('loading');
    setShowSlowWarning(false);
    loadStartTime.current = Date.now();

    // Show slow connection warning based on connection type
    if (connectionSpeed === 'slow') {
      timeoutRef.current = setTimeout(() => {
        if (loadState === 'loading') {
          setShowSlowWarning(true);
        }
      }, 1000);
    } else if (connectionSpeed === 'moderate') {
      timeoutRef.current = setTimeout(() => {
        if (loadState === 'loading') {
          setShowSlowWarning(true);
        }
      }, 2000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [src, connectionSpeed]);

  const handleLoad = () => {
    setLoadState('loaded');
    setShowSlowWarning(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleError = () => {
    setLoadState('error');
    setShowSlowWarning(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const variantClasses = {
    default: '',
    rounded: 'rounded-xl overflow-hidden',
    card: 'rounded-2xl overflow-hidden shadow-lg',
  };

  // Offline state
  if (!isOnline && loadState === 'loading') {
    return (
      <div className={cn(
        aspectRatio,
        'bg-muted/50 flex flex-col items-center justify-center gap-2',
        variantClasses[variant],
        className
      )}>
        <WifiOff className="h-8 w-8 text-muted-foreground/50" />
        <span className="text-xs text-muted-foreground">Offline</span>
      </div>
    );
  }

  // Error state
  if (loadState === 'error') {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className={cn(
        aspectRatio,
        'bg-muted/30 flex flex-col items-center justify-center gap-2',
        variantClasses[variant],
        className
      )}>
        <ImageOff className="h-8 w-8 text-muted-foreground/30" />
        <span className="text-xs text-muted-foreground/50">Failed to load</span>
      </div>
    );
  }

  return (
    <div className={cn('relative', aspectRatio, variantClasses[variant], className)}>
      {/* Loading overlay */}
      {loadState === 'loading' && showLoadingState && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-muted/50 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-10"
        >
          <Loader2 className={cn(
            "h-6 w-6 animate-spin",
            showSlowWarning ? "text-amber-500" : "text-muted-foreground"
          )} />
          {showSlowWarning && (
            <motion.span
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-amber-500 text-center px-4"
            >
              {connectionSpeed === 'slow' ? 'Slow connection...' : 'Loading...'}
            </motion.span>
          )}
        </motion.div>
      )}

      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          loadState === 'loading' ? 'opacity-0' : 'opacity-100'
        )}
        loading="lazy"
        {...props}
      />
    </div>
  );
}

// Simpler variant for inline use
export function NetworkAwareImageSimple({
  src,
  alt,
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) {
    return null;
  }

  return (
    <div className={cn('relative', className)}>
      {!loaded && (
        <div className="absolute inset-0 bg-muted/30 animate-pulse rounded" />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={cn(
          'transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
        loading="lazy"
        {...props}
      />
    </div>
  );
}
