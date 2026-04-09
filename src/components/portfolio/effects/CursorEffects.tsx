import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useCinematicMode } from '@/components/showcase/effects/CinematicModeContext';

interface CursorEffectsProps {
  primaryColor?: string;
}

export function CursorEffects({ primaryColor = 'hsl(var(--primary))' }: CursorEffectsProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const { cinematicMode, cursorEffects, reducedMotion } = useCinematicMode();
  const rippleIdRef = useRef(0);

  useEffect(() => {
    if (reducedMotion || !cinematicMode || !cursorEffects) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button, a, [role="button"], input, textarea, select');
      setIsHovering(!!isInteractive);
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicking(true);
      
      const newRipple = {
        id: rippleIdRef.current++,
        x: e.clientX,
        y: e.clientY
      };
      setRipples(prev => [...prev, newRipple]);

      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 600);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [cinematicMode, cursorEffects, reducedMotion]);

  // Don't render if disabled or on touch devices
  if (reducedMotion || !cinematicMode || !cursorEffects || typeof window === 'undefined') return null;
  if ('ontouchstart' in window) return null;

  return (
    <>
      {/* Cursor Ring */}
      <motion.div
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        animate={{
          x: mousePosition.x - (isHovering ? 24 : 16),
          y: mousePosition.y - (isHovering ? 24 : 16),
          scale: isClicking ? 0.8 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 28,
          mass: 0.5
        }}
      >
        <div
          className="rounded-full transition-all duration-200"
          style={{
            width: isHovering ? 48 : 32,
            height: isHovering ? 48 : 32,
            border: `2px solid ${primaryColor}`,
            boxShadow: `0 0 20px ${primaryColor}40, inset 0 0 20px ${primaryColor}20`,
            opacity: 0.8
          }}
        />
      </motion.div>

      {/* Cursor Dot */}
      <motion.div
        className="fixed pointer-events-none z-[9999]"
        animate={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
        }}
        transition={{
          type: 'spring',
          stiffness: 1000,
          damping: 35,
        }}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: primaryColor,
            boxShadow: `0 0 10px ${primaryColor}`
          }}
        />
      </motion.div>

      {/* Click Ripples */}
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="fixed pointer-events-none z-[9998]"
          initial={{ 
            x: ripple.x - 25, 
            y: ripple.y - 25, 
            scale: 0, 
            opacity: 0.6 
          }}
          animate={{ 
            scale: 2, 
            opacity: 0 
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div
            className="w-[50px] h-[50px] rounded-full"
            style={{
              border: `2px solid ${primaryColor}`,
            }}
          />
        </motion.div>
      ))}
    </>
  );
}
