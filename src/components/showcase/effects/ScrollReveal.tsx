import { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';
import { useCinematicMode } from './CinematicModeContext';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';
  duration?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  duration = 0.6,
  once = true
}: ScrollRevealProps) {
  const { cinematicMode, reducedMotion } = useCinematicMode();

  const getVariants = (): Variants => {
    if (reducedMotion) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
      };
    }

    const distance = cinematicMode ? 50 : 30;

    switch (direction) {
      case 'up':
        return {
          hidden: { opacity: 0, y: distance },
          visible: { opacity: 1, y: 0 }
        };
      case 'down':
        return {
          hidden: { opacity: 0, y: -distance },
          visible: { opacity: 1, y: 0 }
        };
      case 'left':
        return {
          hidden: { opacity: 0, x: distance },
          visible: { opacity: 1, x: 0 }
        };
      case 'right':
        return {
          hidden: { opacity: 0, x: -distance },
          visible: { opacity: 1, x: 0 }
        };
      case 'scale':
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: { opacity: 1, scale: 1 }
        };
      case 'fade':
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        };
    }
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-100px' }}
      variants={getVariants()}
      transition={{
        duration: reducedMotion ? 0.2 : duration,
        delay: reducedMotion ? 0 : delay,
        ease: cinematicMode ? [0.22, 1, 0.36, 1] : 'easeOut'
      }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerChildrenProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerChildren({ children, className, staggerDelay = 0.1 }: StaggerChildrenProps) {
  const { cinematicMode, reducedMotion } = useCinematicMode();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={{
        visible: {
          transition: {
            staggerChildren: reducedMotion ? 0 : staggerDelay
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const { cinematicMode, reducedMotion } = useCinematicMode();

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: reducedMotion ? 0 : 20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{
        duration: reducedMotion ? 0.2 : 0.5,
        ease: cinematicMode ? [0.22, 1, 0.36, 1] : 'easeOut'
      }}
    >
      {children}
    </motion.div>
  );
}
