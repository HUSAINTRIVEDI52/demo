import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface ParallaxContainerProps {
  children: ReactNode;
  className?: string;
  speed?: number;
}

export function ParallaxContainer({ children, className, speed = 0.5 }: ParallaxContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  const prefersReducedMotion = useReducedMotion();
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 30}%`]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}

// Floating animation for avatars and elements
interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
}

export function FloatingElement({ 
  children, 
  className, 
  amplitude = 10, 
  duration = 4 
}: FloatingElementProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={{ 
        y: [-amplitude, amplitude, -amplitude]
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
}

// Glow ring effect for avatars
interface GlowRingProps {
  children: ReactNode;
  className?: string;
  color?: string;
  pulseSpeed?: number;
}

export function GlowRing({ 
  children, 
  className, 
  color = 'hsl(var(--accent))',
  pulseSpeed = 2
}: GlowRingProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={`relative ${className}`}>
      {/* Animated glow ring */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: `0 0 40px ${color}40, 0 0 80px ${color}20`,
            border: `2px solid ${color}60`
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.98, 1.02, 0.98]
          }}
          transition={{
            duration: pulseSpeed,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
      {children}
    </div>
  );
}

// Gradient text with animation
interface AnimatedGradientTextProps {
  children: ReactNode;
  className?: string;
  gradient?: string;
}

export function AnimatedGradientText({ 
  children, 
  className,
  gradient = 'from-accent via-primary to-accent'
}: AnimatedGradientTextProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.span
      className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent bg-[length:200%_auto] ${className}`}
      animate={prefersReducedMotion ? {} : {
        backgroundPosition: ['0% center', '200% center']
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'linear'
      }}
    >
      {children}
    </motion.span>
  );
}

// Typing cursor effect
export function TypingCursor({ className }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.span
      className={`inline-block w-[2px] h-[1em] bg-current ml-1 ${className}`}
      animate={prefersReducedMotion ? {} : { opacity: [1, 0, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
    />
  );
}

// Scroll indicator with animation
export function ScrollIndicator({ className }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={`flex flex-col items-center gap-2 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
    >
      <motion.div
        className="w-6 h-10 rounded-full border-2 border-current/30 flex justify-center pt-2"
        animate={prefersReducedMotion ? {} : { y: [0, 5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <motion.div
          className="w-1 h-2 rounded-full bg-current"
          animate={prefersReducedMotion ? {} : { y: [0, 8, 0], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
      <span className="text-xs uppercase tracking-widest opacity-50">Scroll</span>
    </motion.div>
  );
}
