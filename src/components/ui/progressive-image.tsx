import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  blurAmount?: number;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'auto';
}

/**
 * Progressive image loader with blur-up effect
 * Shows a blurred placeholder while the full image loads
 */
export function ProgressiveImage({
  src,
  alt,
  className,
  placeholderClassName,
  blurAmount = 20,
  aspectRatio = 'auto',
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Preload image when in view
  useEffect(() => {
    if (!isInView || !src) return;

    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setHasError(true);
  }, [isInView, src]);

  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    auto: '',
  };

  if (!src) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-muted',
        aspectClasses[aspectRatio],
        className
      )}
    >
      {/* Blurred placeholder */}
      <AnimatePresence>
        {!isLoaded && !hasError && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={cn(
              'absolute inset-0 bg-gradient-to-br from-muted to-muted/50',
              placeholderClassName
            )}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent animate-shimmer" />
            
            {/* Low-quality blurred preview if in view */}
            {isInView && (
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${src})`,
                  filter: `blur(${blurAmount}px)`,
                  transform: 'scale(1.1)',
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full resolution image */}
      {isInView && (
        <motion.img
          ref={imgRef}
          src={src}
          alt={alt}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ 
            opacity: isLoaded ? 1 : 0,
            scale: isLoaded ? 1 : 1.05 
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn(
            'w-full h-full object-cover',
            hasError && 'hidden'
          )}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-xs text-muted-foreground">Failed to load</span>
        </div>
      )}
    </div>
  );
}

/**
 * Project card image with progressive loading
 */
interface ProjectImageProps {
  src: string | null | undefined;
  title: string;
  className?: string;
  featured?: boolean;
}

export function ProjectImage({ src, title, className, featured }: ProjectImageProps) {
  if (!src) return null;

  return (
    <ProgressiveImage
      src={src}
      alt={title}
      aspectRatio="video"
      className={cn(
        'rounded-xl shadow-lg',
        featured && 'ring-2 ring-accent/20',
        className
      )}
    />
  );
}

/**
 * Avatar/profile image with progressive loading
 */
interface AvatarImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function AvatarImage({ src, alt, className, size = 'md' }: AvatarImageProps) {
  if (!src) return null;

  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32',
  };

  return (
    <ProgressiveImage
      src={src}
      alt={alt}
      aspectRatio="square"
      blurAmount={10}
      className={cn(
        'rounded-full',
        sizeClasses[size],
        className
      )}
    />
  );
}
