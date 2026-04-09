import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ThemePreset } from '../PremiumShowcase';
import { useCinematicMode } from './CinematicModeContext';

interface AnimatedBackgroundProps {
  theme: ThemePreset;
  themeConfig: any;
}

export function AnimatedBackground({ theme, themeConfig }: AnimatedBackgroundProps) {
  const { cinematicMode, particlesEnabled, reducedMotion } = useCinematicMode();

  // Show static background if reduced motion, cinematic off, or particles disabled
  if (reducedMotion || !cinematicMode || !particlesEnabled) {
    return (
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{ backgroundColor: themeConfig.colors.background }}
      />
    );
  }

  if (theme === 'cyber-neon') {
    return <CyberNeonBackground cinematicMode={cinematicMode} themeConfig={themeConfig} />;
  }

  if (theme === 'minimal-dark') {
    return <MinimalDarkBackground cinematicMode={cinematicMode} themeConfig={themeConfig} />;
  }

  if (theme === 'glassmorphism') {
    return <GlassmorphismBackground cinematicMode={cinematicMode} themeConfig={themeConfig} />;
  }

  return null;
}

function CyberNeonBackground({ cinematicMode, themeConfig }: { cinematicMode: boolean; themeConfig: any }) {
  return (
    <>
      {/* Grid Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 225, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 225, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          opacity: cinematicMode ? 0.6 : 0.3
        }}
      />

      {/* Animated scan line */}
      {cinematicMode && (
        <motion.div
          className="fixed left-0 right-0 h-px pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, #00FFE1, transparent)',
            boxShadow: '0 0 20px rgba(0, 255, 225, 0.5)'
          }}
          animate={{
            top: ['0%', '100%', '0%']
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      )}

      {/* Glowing orbs */}
      <motion.div
        className="fixed top-0 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0, 255, 225, 0.15), transparent 70%)',
          filter: 'blur(100px)'
        }}
        animate={cinematicMode ? {
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        } : {}}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      <motion.div
        className="fixed bottom-0 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(138, 46, 255, 0.15), transparent 70%)',
          filter: 'blur(100px)'
        }}
        animate={cinematicMode ? {
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.2, 0.4]
        } : {}}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1
        }}
      />
      <motion.div
        className="fixed top-1/2 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0, 255, 136, 0.1), transparent 70%)',
          filter: 'blur(80px)'
        }}
        animate={cinematicMode ? {
          x: [0, -50, 0],
          opacity: [0.2, 0.4, 0.2]
        } : {}}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2
        }}
      />
    </>
  );
}

function MinimalDarkBackground({ cinematicMode, themeConfig }: { cinematicMode: boolean; themeConfig: any }) {
  return (
    <>
      {/* Subtle gradient */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.1) 0%, transparent 50%)'
        }}
      />

      {/* Spotlight effect */}
      {cinematicMode && (
        <motion.div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.05), transparent 50%)'
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}

      {/* Subtle noise texture */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </>
  );
}

function GlassmorphismBackground({ cinematicMode, themeConfig }: { cinematicMode: boolean; themeConfig: any }) {
  return (
    <>
      {/* Floating blobs */}
      <motion.div
        className="fixed top-0 left-0 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2), transparent 60%)',
          filter: 'blur(120px)'
        }}
        animate={cinematicMode ? {
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1]
        } : {}}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      <motion.div
        className="fixed bottom-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2), transparent 60%)',
          filter: 'blur(120px)'
        }}
        animate={cinematicMode ? {
          x: [0, -80, 0],
          y: [0, -60, 0],
          scale: [1.1, 1, 1.1]
        } : {}}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2
        }}
      />
      <motion.div
        className="fixed top-1/2 left-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15), transparent 60%)',
          filter: 'blur(100px)',
          transform: 'translate(-50%, -50%)'
        }}
        animate={cinematicMode ? {
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3]
        } : {}}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4
        }}
      />

      {/* Frosted overlay */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, transparent, rgba(15, 15, 35, 0.3))'
        }}
      />
    </>
  );
}
