import { motion, useReducedMotion } from 'framer-motion';
import type { BackgroundStyle } from '@/hooks/useWorkspace';
import { useCinematicMode } from '@/components/showcase/effects/CinematicModeContext';

export type BackgroundVariant = 'cyber' | 'modern' | 'editorial' | 'dark-elite' | 'warm' | 'bold' | 'minimal' | 'corporate' | 'neon';

interface AnimatedBackgroundProps {
  variant: BackgroundVariant;
  backgroundStyle?: BackgroundStyle;
  className?: string;
}

export function AnimatedBackground({ variant, backgroundStyle = 'animated', className }: AnimatedBackgroundProps) {
  const prefersReducedMotion = useReducedMotion();
  
  // Safely try to use cinematic mode - it may not be available in all contexts
  let cinematicMode = true;
  let particlesEnabled = true;
  try {
    const context = useCinematicMode();
    cinematicMode = context.cinematicMode;
    particlesEnabled = context.particlesEnabled;
  } catch {
    // Context not available, default to enabled
    cinematicMode = true;
    particlesEnabled = true;
  }

  // If style is 'none', render nothing
  if (backgroundStyle === 'none') {
    return null;
  }

  // If style is 'static', user prefers reduced motion, cinematic mode is off, or particles disabled - show static background
  if (backgroundStyle === 'static' || prefersReducedMotion || !cinematicMode || !particlesEnabled) {
    return <StaticBackground variant={variant} className={className} />;
  }

  // Animated backgrounds
  switch (variant) {
    case 'cyber':
      return <CyberBackground className={className} />;
    case 'modern':
      return <ModernBackground className={className} />;
    case 'editorial':
      return <EditorialBackground className={className} />;
    case 'dark-elite':
      return <DarkEliteBackground className={className} />;
    case 'warm':
      return <WarmBackground className={className} />;
    case 'bold':
      return <BoldBackground className={className} />;
    case 'minimal':
      return <MinimalBackground className={className} />;
    case 'corporate':
      return <CorporateBackground className={className} />;
    case 'neon':
      return <NeonBackground className={className} />;
    default:
      return null;
  }
}

// Static fallback for reduced motion
function StaticBackground({ variant, className }: { variant: string; className?: string }) {
  const backgrounds: Record<string, string> = {
    cyber: 'bg-[#05070B]',
    modern: 'bg-gradient-to-br from-background via-background to-accent/5',
    editorial: 'bg-white',
    'dark-elite': 'bg-[#0A0A0C]',
    warm: 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50',
    bold: 'bg-background',
    minimal: 'bg-background',
    corporate: 'bg-slate-50',
    neon: 'bg-[#0A0A0F]'
  };

  return <div className={`fixed inset-0 ${backgrounds[variant] || 'bg-background'} ${className}`} />;
}

// Cyberpunk: Animated grid + neon orbs (no scanning line)
function CyberBackground({ className }: { className?: string }) {
  return (
    <div className={`fixed inset-0 bg-[#05070B] overflow-hidden ${className}`}>
      {/* Animated grid */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 225, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 225, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'cyber-grid-move 20s linear infinite'
        }}
      />
      
      {/* Neon orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px]"
        style={{ background: 'radial-gradient(circle, rgba(0, 255, 225, 0.2) 0%, transparent 70%)' }}
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, 50, 0],
          y: [0, 30, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[150px]"
        style={{ background: 'radial-gradient(circle, rgba(138, 46, 255, 0.2) 0%, transparent 70%)' }}
        animate={{ 
          scale: [1.3, 1, 1.3],
          opacity: [0.5, 0.2, 0.5],
          x: [0, -30, 0],
          y: [0, -50, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(0, 255, 136, 0.15) 0%, transparent 70%)' }}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      
      {/* Noise overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
        }}
      />

      <style>{`
        @keyframes cyber-grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
}

// Modern Creative: Gradient mesh with flowing blobs
function ModernBackground({ className }: { className?: string }) {
  return (
    <div className={`fixed inset-0 bg-gradient-to-b from-background via-background to-muted/20 overflow-hidden ${className}`}>
      {/* Primary blob */}
      <motion.div
        className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full"
        style={{ 
          background: 'radial-gradient(circle, hsl(var(--accent) / 0.2) 0%, transparent 60%)',
          filter: 'blur(80px)'
        }}
        animate={{
          x: [0, 80, 0],
          y: [0, 50, 0],
          scale: [1, 1.15, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Secondary blob */}
      <motion.div
        className="absolute bottom-[-10%] left-[-20%] w-[60vw] h-[60vw] rounded-full"
        style={{ 
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 60%)',
          filter: 'blur(100px)'
        }}
        animate={{
          x: [0, -50, 0],
          y: [0, -70, 0],
          scale: [1.1, 1, 1.1]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Tertiary accent blob */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full"
        style={{ 
          background: 'radial-gradient(circle, hsl(var(--accent) / 0.1) 0%, transparent 50%)',
          filter: 'blur(60px)'
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
      />
      
      {/* Subtle grain */}
      <div 
        className="absolute inset-0 opacity-[0.025]"
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
        }}
      />
    </div>
  );
}

// Editorial: Clean with subtle paper texture and ambient light
function EditorialBackground({ className }: { className?: string }) {
  return (
    <div className={`fixed inset-0 bg-[#FAFAF9] ${className}`}>
      {/* Paper texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(#374151 0.5px, transparent 0.5px)`,
          backgroundSize: '16px 16px'
        }}
      />
      
      {/* Warm ambient light from top */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-amber-50/40 to-transparent"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Side ambient glow */}
      <motion.div
        className="absolute top-1/4 right-0 w-[40vw] h-[60vh] rounded-full blur-[150px]"
        style={{ background: 'radial-gradient(ellipse, rgba(251, 191, 36, 0.08) 0%, transparent 70%)' }}
        animate={{ opacity: [0.4, 0.7, 0.4], x: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.03)_100%)]" />
    </div>
  );
}

// Dark Elite: Deep dark with soft gradients and spotlight
function DarkEliteBackground({ className }: { className?: string }) {
  return (
    <div className={`fixed inset-0 bg-[#0A0A0C] overflow-hidden ${className}`}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-transparent to-blue-950/30" />
      
      {/* Animated spotlight */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[70vh]"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.03) 0%, transparent 50%)'
        }}
        animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Side glow orbs */}
      <motion.div
        className="absolute bottom-1/4 left-0 w-[400px] h-[400px] rounded-full blur-[150px]"
        style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)' }}
        animate={{ x: [-50, 50, -50], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
        }}
      />
    </div>
  );
}

// Warm Personal: Sunset gradient with floating bokeh lights
function WarmBackground({ className }: { className?: string }) {
  return (
    <div className={`fixed inset-0 overflow-hidden ${className}`}>
      {/* Base warm gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100" />
      
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at top right, rgba(251, 146, 60, 0.2) 0%, transparent 50%)' }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Bokeh lights */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-white/30 blur-[100px]"
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 right-1/3 w-56 h-56 rounded-full bg-amber-200/30 blur-[80px]"
        animate={{
          x: [0, -20, 0],
          y: [0, 20, 0],
          scale: [1.2, 0.9, 1.2],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/2 w-64 h-64 rounded-full bg-orange-200/25 blur-[90px]"
        animate={{
          x: [0, 15, 0],
          y: [0, 35, 0],
          scale: [0.9, 1.2, 0.9],
          opacity: [0.25, 0.45, 0.25]
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
      />
      
      {/* Sun rays effect */}
      <div 
        className="absolute top-0 right-0 w-full h-full pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,200,100,0.1) 0%, transparent 40%)'
        }}
      />
    </div>
  );
}

// Bold: Stunning aurora-inspired background with flowing gradients and glow effects
function BoldBackground({ className }: { className?: string }) {
  return (
    <div className={`fixed inset-0 bg-background overflow-hidden ${className}`}>
      {/* Deep base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/10" />
      
      {/* Aurora wave 1 - Primary flowing gradient */}
      <motion.div
        className="absolute -top-1/2 -left-1/4 w-[150%] h-[100%] opacity-60"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--accent) / 0.3) 0%, hsl(var(--primary) / 0.2) 50%, transparent 100%)',
          filter: 'blur(60px)',
          borderRadius: '50%',
        }}
        animate={{
          x: ['-10%', '10%', '-10%'],
          y: ['-5%', '10%', '-5%'],
          rotate: [0, 10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Aurora wave 2 - Secondary flowing gradient */}
      <motion.div
        className="absolute -bottom-1/2 -right-1/4 w-[120%] h-[80%] opacity-50"
        style={{
          background: 'linear-gradient(225deg, hsl(var(--primary) / 0.25) 0%, hsl(var(--accent) / 0.15) 60%, transparent 100%)',
          filter: 'blur(80px)',
          borderRadius: '50%',
        }}
        animate={{
          x: ['5%', '-15%', '5%'],
          y: ['10%', '-5%', '10%'],
          rotate: [0, -15, 0],
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 3,
        }}
      />
      
      {/* Floating orb 1 - Bright accent pulse */}
      <motion.div
        className="absolute top-1/4 left-1/3 w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(var(--accent) / 0.4) 0%, hsl(var(--accent) / 0.1) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.6, 1, 0.6],
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Floating orb 2 - Secondary glow */}
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.35) 0%, hsl(var(--primary) / 0.1) 50%, transparent 70%)',
          filter: 'blur(30px)',
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.9, 0.5],
          x: [0, -80, 0],
          y: [0, 60, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
      
      {/* Spotlight effect from top */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[60vh]"
        style={{
          background: 'radial-gradient(ellipse at top, hsl(var(--accent) / 0.15) 0%, transparent 60%)',
        }}
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-accent/40"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            filter: 'blur(1px)',
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}
      
      {/* Subtle noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Vignette overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_hsl(var(--background)/0.4)_100%)]" />
    </div>
  );
}

// Minimal: Ultra-clean with subtle floating dots
function MinimalBackground({ className }: { className?: string }) {
  return (
    <div className={`fixed inset-0 bg-background overflow-hidden ${className}`}>
      {/* Very subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/10" />
      
      {/* Floating dot pattern */}
      <motion.div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
        animate={{ backgroundPosition: ['0px 0px', '40px 40px'] }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      />
      
      {/* Subtle corner accent */}
      <motion.div
        className="absolute top-0 right-0 w-[40vw] h-[40vh]"
        style={{ 
          background: 'radial-gradient(ellipse at top right, hsl(var(--muted) / 0.3) 0%, transparent 60%)',
        }}
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-muted/5 to-transparent" />
    </div>
  );
}

// Corporate: Professional with clean lines and subtle motion
function CorporateBackground({ className }: { className?: string }) {
  return (
    <div className={`fixed inset-0 bg-slate-50 overflow-hidden ${className}`}>
      {/* Horizontal line pattern */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 79px, #334155 80px)',
          backgroundSize: '100% 80px'
        }}
      />
      
      {/* Subtle blue accent glow */}
      <motion.div
        className="absolute top-0 right-1/4 w-[50vw] h-[40vh]"
        style={{ 
          background: 'radial-gradient(ellipse at top, rgba(59, 130, 246, 0.06) 0%, transparent 60%)',
        }}
        animate={{ opacity: [0.4, 0.7, 0.4], y: [0, 10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Side accent */}
      <motion.div
        className="absolute bottom-1/4 left-0 w-[30vw] h-[50vh] rounded-r-full"
        style={{ 
          background: 'radial-gradient(ellipse at left, rgba(71, 85, 105, 0.04) 0%, transparent 70%)',
        }}
        animate={{ x: [-20, 0, -20], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Clean gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-slate-100/30" />
    </div>
  );
}

// Neon Creative: Aurora waves with vibrant gradients
function NeonBackground({ className }: { className?: string }) {
  return (
    <div className={`fixed inset-0 bg-[#0A0A0F] overflow-hidden ${className}`}>
      {/* Aurora wave effect */}
      <motion.div
        className="absolute top-0 left-0 w-full h-[60vh]"
        style={{
          background: 'linear-gradient(180deg, rgba(255, 60, 172, 0.1) 0%, rgba(120, 75, 160, 0.05) 50%, transparent 100%)'
        }}
        animate={{ 
          y: [0, 30, 0],
          opacity: [0.6, 0.9, 0.6]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Primary neon orb */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px]"
        style={{ background: 'radial-gradient(circle, rgba(255, 60, 172, 0.2) 0%, transparent 60%)' }}
        animate={{ 
          scale: [1, 1.3, 1],
          x: [0, 60, 0],
          y: [0, -40, 0],
          opacity: [0.4, 0.7, 0.4]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Secondary orb */}
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[130px]"
        style={{ background: 'radial-gradient(circle, rgba(120, 75, 160, 0.2) 0%, transparent 60%)' }}
        animate={{ 
          scale: [1.2, 1, 1.2],
          x: [0, -50, 0],
          y: [0, 50, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      
      {/* Accent orb */}
      <motion.div
        className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(43, 134, 197, 0.15) 0%, transparent 60%)' }}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />
      
      {/* Noise overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
        }}
      />
    </div>
  );
}
