import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useCinematicMode } from './CinematicModeContext';

interface CountUpAnimationProps {
  end: number | string;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function CountUpAnimation({
  end,
  duration = 2,
  suffix = '',
  prefix = '',
  className,
  style
}: CountUpAnimationProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const { reducedMotion } = useCinematicMode();

  // Parse the end value - handle strings like "50+" or "99.9%"
  const numericEnd = typeof end === 'string' 
    ? parseFloat(end.replace(/[^0-9.]/g, '')) 
    : end;
  
  const extractedSuffix = typeof end === 'string' 
    ? end.replace(/[0-9.]/g, '') || suffix
    : suffix;

  useEffect(() => {
    if (!isInView || reducedMotion) {
      setCount(numericEnd);
      return;
    }

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setCount(Math.floor(easeOut * numericEnd));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(numericEnd);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isInView, numericEnd, duration, reducedMotion]);

  return (
    <motion.span
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
    >
      {prefix}{count}{extractedSuffix}
    </motion.span>
  );
}
