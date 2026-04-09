import { memo, useMemo } from 'react';
import { useAppTheme, AppTheme } from '@/contexts/AppThemeContext';

interface PremiumBackgroundProps {
  variant?: 'default' | 'hero' | 'subtle';
}

export const PremiumBackground = memo(function PremiumBackground({ variant = 'default' }: PremiumBackgroundProps) {
  const { theme, config } = useAppTheme();

  // Reduce motion for performance - check once on mount
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // For subtle variant, just use static background for performance
  if (variant === 'subtle' || prefersReducedMotion) {
    return <StaticBackground theme={theme} />;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Base gradient */}
      <div 
        className="absolute inset-0 transition-colors duration-500"
        style={{ background: `hsl(${config.colors.background})` }}
      />

      {/* Theme-specific effects - static for performance */}
      {theme === 'cyber-neon' && <CyberNeonEffects variant={variant} config={config} />}
      {theme === 'clean-light' && <CleanLightEffects variant={variant} config={config} />}
      {theme === 'glassmorphism' && <GlassmorphismEffects variant={variant} config={config} />}
    </div>
  );
});

function StaticBackground({ theme }: { theme: AppTheme }) {
  const { config } = useAppTheme();
  return (
    <div 
      className="fixed inset-0 pointer-events-none" 
      style={{ 
        background: `hsl(${config.colors.background})`,
        zIndex: 0 
      }} 
    />
  );
}

// Static effects - no animations for performance
function CyberNeonEffects({ variant, config }: { variant: string; config: any }) {
  return (
    <>
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(${config.colors.accent}) 1px, transparent 1px),
            linear-gradient(90deg, hsl(${config.colors.accent}) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Static glowing orbs - CSS transitions only on hover, no constant animation */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[150px] opacity-40"
        style={{ 
          background: config.colors.accentGlow,
          top: '10%',
          left: '10%',
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-30"
        style={{ 
          background: 'rgba(59, 130, 246, 0.2)',
          bottom: '10%',
          right: '10%',
        }}
      />
      <div
        className="absolute w-[300px] h-[300px] rounded-full blur-[100px] opacity-25"
        style={{ 
          background: config.colors.accentGlow,
          top: '50%',
          right: '30%',
        }}
      />

      {/* Noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  );
}

function CleanLightEffects({ variant, config }: { variant: string; config: any }) {
  return (
    <>
      {/* Subtle gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, hsl(${config.colors.accent} / 0.05) 0%, transparent 50%)`,
        }}
      />

      {/* Static gradient orb for hero */}
      {variant === 'hero' && (
        <div
          className="absolute w-[800px] h-[800px] rounded-full opacity-80"
          style={{
            background: `radial-gradient(circle, hsl(${config.colors.accent} / 0.08) 0%, transparent 70%)`,
            top: '-30%',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
      )}

      {/* Static decorative shapes */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-40"
        style={{ 
          background: `hsl(${config.colors.accent} / 0.1)`,
          top: '20%',
          right: '10%',
        }}
      />
      <div
        className="absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-30"
        style={{ 
          background: 'hsl(38 92% 50% / 0.08)',
          bottom: '10%',
          left: '15%',
        }}
      />
    </>
  );
}

function GlassmorphismEffects({ variant, config }: { variant: string; config: any }) {
  return (
    <>
      {/* Static gradient blobs */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[180px] opacity-100"
        style={{ 
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(236, 72, 153, 0.3))',
          top: '-10%',
          left: '-10%',
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[150px] opacity-100"
        style={{ 
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(168, 85, 247, 0.3))',
          bottom: '-10%',
          right: '-10%',
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-100"
        style={{ 
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25), rgba(6, 182, 212, 0.25))',
          top: '40%',
          left: '30%',
        }}
      />

      {/* Frosted overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, hsl(260 20% 8% / 0.5) 100%)',
        }}
      />

      {/* Noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  );
}
