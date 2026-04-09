import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Crown, GripVertical } from 'lucide-react';
import { BRAND } from '@/config/branding';
import { cn } from '@/lib/utils';

interface ComparisonSliderProps {
  className?: string;
}

/**
 * An interactive before/after comparison slider showing Free vs Pro portfolio appearance
 */
export function ComparisonSlider({ className }: ComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isAutoAnimating, setIsAutoAnimating] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoAnimateRef = useRef<number | null>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const stopAutoAnimate = useCallback(() => {
    setIsAutoAnimating(false);
    setHasInteracted(true);
    if (autoAnimateRef.current) {
      cancelAnimationFrame(autoAnimateRef.current);
      autoAnimateRef.current = null;
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    stopAutoAnimate();
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    stopAutoAnimate();
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  };

  // Auto-animate effect - gentle oscillation when modal opens
  useEffect(() => {
    if (hasInteracted || !isAutoAnimating) return;

    let startTime: number | null = null;
    const duration = 3000; // 3 seconds for one full cycle
    const minPos = 30;
    const maxPos = 70;
    const amplitude = (maxPos - minPos) / 2;
    const center = (maxPos + minPos) / 2;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      
      // Smooth sine wave oscillation
      const progress = (elapsed % duration) / duration;
      const position = center + amplitude * Math.sin(progress * Math.PI * 2);
      
      setSliderPosition(position);
      
      // Stop after 2 full cycles (6 seconds)
      if (elapsed < duration * 2) {
        autoAnimateRef.current = requestAnimationFrame(animate);
      } else {
        setIsAutoAnimating(false);
        setSliderPosition(50); // Reset to center
      }
    };

    // Start animation after a brief delay
    const timeoutId = setTimeout(() => {
      autoAnimateRef.current = requestAnimationFrame(animate);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      if (autoAnimateRef.current) {
        cancelAnimationFrame(autoAnimateRef.current);
      }
    };
  }, [hasInteracted, isAutoAnimating]);

  // Attach global listeners for drag
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    };
    const onMouseUp = () => setIsDragging(false);
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    };
    const onTouchEnd = () => setIsDragging(false);
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
    
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, handleMove]);

  return (
    <div className={cn('space-y-2', className)}>
      {/* Labels */}
      <div className="flex justify-between text-xs font-medium">
        <span className="text-muted-foreground">Free Plan</span>
        <span className="text-amber-500">Pro Plan</span>
      </div>
      
      {/* Comparison Container */}
      <div
        ref={containerRef}
        className="relative h-40 rounded-lg overflow-hidden cursor-ew-resize select-none border border-border"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* FREE Side (Left/Background) */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted">
          {/* Mock portfolio content */}
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-muted-foreground/20" />
              <div className="space-y-1">
                <div className="h-2.5 w-20 rounded bg-muted-foreground/20" />
                <div className="h-2 w-14 rounded bg-muted-foreground/10" />
              </div>
            </div>
            <div className="h-2 w-3/4 rounded bg-muted-foreground/15" />
            <div className="h-2 w-1/2 rounded bg-muted-foreground/10" />
            <div className="flex gap-2 mt-3">
              <div className="h-12 w-16 rounded bg-muted-foreground/10" />
              <div className="h-12 w-16 rounded bg-muted-foreground/10" />
              <div className="h-12 w-16 rounded bg-muted-foreground/10" />
            </div>
          </div>
          
          {/* Watermark Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-2 right-2"
          >
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-sm">
              <div className="h-4 w-4 rounded bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Sparkles className="h-2.5 w-2.5 text-white" />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">
                Made with <span className="text-foreground font-semibold">{BRAND.shortName}</span>
              </span>
            </div>
          </motion.div>
          
          {/* Free overlay label */}
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted-foreground/20 text-muted-foreground">
              FREE
            </span>
          </div>
        </div>

        {/* PRO Side (Right/Overlay) */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-background to-accent/5"
          style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
        >
          {/* Enhanced mock portfolio content */}
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-accent/60" />
              <div className="space-y-1">
                <div className="h-2.5 w-20 rounded bg-foreground/30" />
                <div className="h-2 w-14 rounded bg-foreground/20" />
              </div>
            </div>
            <div className="h-2 w-3/4 rounded bg-foreground/25" />
            <div className="h-2 w-1/2 rounded bg-foreground/15" />
            <div className="flex gap-2 mt-3">
              <div className="h-12 w-16 rounded bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/20" />
              <div className="h-12 w-16 rounded bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/20" />
              <div className="h-12 w-16 rounded bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/20" />
            </div>
          </div>
          
          {/* Pro badge */}
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center gap-1">
              <Crown className="h-2.5 w-2.5" />
              PRO
            </span>
          </div>
          
          {/* No watermark indicator */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute bottom-2 right-2"
          >
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <Sparkles className="h-3 w-3 text-emerald-500" />
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">No Watermark</span>
            </div>
          </motion.div>
        </div>

        {/* Slider Handle */}
        <motion.div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-10"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
          animate={{ 
            boxShadow: isDragging 
              ? '0 0 20px rgba(255,255,255,0.5)' 
              : '0 0 10px rgba(0,0,0,0.3)'
          }}
        >
          {/* Handle Grip */}
          <div className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "h-8 w-6 rounded-full bg-white shadow-lg border border-border/50",
            "flex items-center justify-center",
            "transition-transform duration-200",
            isDragging && "scale-110"
          )}>
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </motion.div>
      </div>
      
      {/* Instruction */}
      <p className="text-[10px] text-center text-muted-foreground">
        Drag to compare • Upgrade removes watermark & unlocks premium features
      </p>
    </div>
  );
}
