import { useState, lazy, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check, Eye, Lock, Sparkles, Zap, Film, Stars, Palette, Layers, Image, ImageOff, Play } from 'lucide-react';
import { useWorkspace, type BackgroundStyle } from '@/hooks/useWorkspace';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useEventTracking } from '@/hooks/useEventTracking';
import { useCinematicMode, CinematicModeProvider } from '@/components/showcase/effects/CinematicModeContext';
import { usePortfolioVersions } from '@/hooks/usePortfolioVersions';
import { useAvailableThemes } from '@/hooks/usePlatformSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { UpgradeBanner } from '@/components/plan/UpgradeBanner';
import { UpgradeModal } from '@/components/plan/UpgradeModal';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LogoSpinner } from '@/components/brand/LogoSpinner';

// Lazy-load the heavy LiveThemePreview component
const LiveThemePreview = lazy(() => import('@/components/themes/LiveThemePreview').then(m => ({ default: m.LiveThemePreview })));

// Fallback for lazy-loaded preview
function PreviewFallback() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0 flex items-center justify-center h-[400px] bg-muted/30">
        <div className="text-center">
          <LogoSpinner size="md" />
          <p className="text-sm text-muted-foreground mt-3">Loading preview...</p>
        </div>
      </CardContent>
    </Card>
  );
}

const themeDetails: Record<string, { name: string; description: string; category: string; features: string[]; accent: string; }> = {
  'minimal': { name: 'Minimal', description: 'Clean and simple layout with focus on content', category: 'Classic', features: ['Clean typography', 'Subtle borders', 'Timeline experience'], accent: 'emerald' },
  'modern': { name: 'Modern', description: 'Contemporary design with cards and gradients', category: 'Classic', features: ['Card layouts', 'Hero image support', 'Alternating rows'], accent: 'blue' },
  'bold': { name: 'Bold', description: 'Dramatic and eye-catching with large typography', category: 'Classic', features: ['Large typography', 'Gradient effects', 'Animated hovers'], accent: 'violet' },
  'cyberpunk': { name: 'Cyberpunk Terminal', description: 'Neon-lit tech aesthetic for developers', category: 'Tech', features: ['Glassmorphism', 'Neon glow', 'Animated grid'], accent: 'cyan' },
  'developer': { name: 'Developer Portfolio', description: 'Modern dark theme for developers with clean layout', category: 'Tech', features: ['Full-screen hero', 'Project cards', 'Skills grid', 'Timeline'], accent: 'blue' },
  'hacker': { name: 'Hacker Terminal', description: 'Terminal-inspired theme with neon green accents', category: 'Tech', features: ['Terminal aesthetics', 'Code-style nav', 'Monospace fonts'], accent: 'green' },
  'terminal': { name: 'Terminal Pro', description: 'Premium developer portfolio with orbiting elements and 3D effects', category: 'Tech', features: ['Orbiting circles', '3D wireframe', 'Particles', 'Typewriter'], accent: 'green' },
  'corporate': { name: 'Corporate Executive', description: 'Professional and refined for business', category: 'Business', features: ['Elegant typography', 'Minimal shadows', 'Professional'], accent: 'slate' },
  'neon-creative': { name: 'Neon Creative', description: 'Vibrant and artistic for designers', category: 'Creative', features: ['Aurora gradients', 'Vibrant animations', 'Creative layouts'], accent: 'pink' },
  'editorial': { name: 'Editorial Minimal', description: 'Typography-focused for writers', category: 'Editorial', features: ['Sharp typography', 'Thin dividers', 'Editorial spacing'], accent: 'stone' },
  'warm-sunset': { name: 'Warm Sunset', description: 'Friendly and inviting for personal brands', category: 'Personal', features: ['Warm gradients', 'Bokeh effects', 'Rounded edges'], accent: 'orange' },
};

// Premium theme preview component with cinematic effects
function PremiumThemePreview({ themeId, isHovered }: { themeId: string; isHovered: boolean }) {
  const getThemeStyles = () => {
    switch (themeId) {
      case 'minimal':
        return {
          bg: 'bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950',
          accent: 'bg-emerald-500',
          accentGlow: 'shadow-emerald-500/30',
          border: 'border-slate-200 dark:border-slate-700',
        };
      case 'modern':
        return {
          bg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
          accent: 'bg-blue-500',
          accentGlow: 'shadow-blue-500/40',
          border: 'border-slate-700',
        };
      case 'bold':
        return {
          bg: 'bg-gradient-to-br from-slate-950 via-violet-950/30 to-slate-950',
          accent: 'bg-gradient-to-r from-violet-500 to-fuchsia-500',
          accentGlow: 'shadow-violet-500/50',
          border: 'border-violet-500/30',
        };
      case 'cyberpunk':
        return {
          bg: 'bg-gradient-to-br from-slate-950 via-cyan-950/20 to-slate-950',
          accent: 'bg-cyan-400',
          accentGlow: 'shadow-cyan-400/60',
          border: 'border-cyan-500/40',
        };
      case 'corporate':
        return {
          bg: 'bg-gradient-to-br from-slate-800 to-slate-900',
          accent: 'bg-slate-400',
          accentGlow: 'shadow-slate-400/30',
          border: 'border-slate-600',
        };
      case 'neon-creative':
        return {
          bg: 'bg-gradient-to-br from-purple-950 via-slate-900 to-pink-950',
          accent: 'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400',
          accentGlow: 'shadow-pink-500/50',
          border: 'border-purple-500/40',
        };
      case 'editorial':
        return {
          bg: 'bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-950',
          accent: 'bg-stone-800 dark:bg-stone-200',
          accentGlow: 'shadow-stone-500/20',
          border: 'border-stone-300 dark:border-stone-700',
        };
      case 'warm-sunset':
        return {
          bg: 'bg-gradient-to-br from-orange-100 via-rose-50 to-amber-100 dark:from-orange-950 dark:via-rose-950/50 dark:to-amber-950',
          accent: 'bg-gradient-to-r from-orange-500 to-rose-500',
          accentGlow: 'shadow-orange-500/40',
          border: 'border-orange-300/50 dark:border-orange-600/30',
        };
      case 'developer':
        return {
          bg: 'bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950',
          accent: 'bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500',
          accentGlow: 'shadow-blue-500/40',
          border: 'border-blue-500/30',
        };
      case 'hacker':
        return {
          bg: 'bg-[#0a0a0a]',
          accent: 'bg-[#00FF41]',
          accentGlow: 'shadow-[#00FF41]/50',
          border: 'border-[#00FF41]/40',
        };
      case 'terminal':
        return {
          bg: 'bg-[#0a0a0a]',
          accent: 'bg-[#00FF41]',
          accentGlow: 'shadow-[#00FF41]/50',
          border: 'border-[#00FF41]/40',
        };
      case 'minimal-editorial':
        return {
          bg: 'bg-white',
          accent: 'bg-gray-900',
          accentGlow: 'shadow-gray-900/20',
          border: 'border-gray-200',
        };
      default:
        return {
          bg: 'bg-muted',
          accent: 'bg-accent',
          accentGlow: 'shadow-accent/30',
          border: 'border-border',
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <div className={cn("relative h-48 overflow-hidden", styles.bg)}>
      {/* Animated background effects based on theme */}
      {themeId === 'cyberpunk' && (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#22d3ee10_1px,transparent_1px),linear-gradient(to_bottom,#22d3ee10_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div 
            className={cn(
              "absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent transition-opacity duration-500",
              isHovered ? "opacity-60" : "opacity-30"
            )}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-cyan-500/20 blur-3xl rounded-full" />
        </>
      )}
      
      {themeId === 'neon-creative' && (
        <>
          <div 
            className={cn(
              "absolute -top-20 -left-20 w-60 h-60 bg-purple-500/30 rounded-full blur-3xl transition-transform duration-700",
              isHovered && "scale-110 translate-x-5"
            )}
          />
          <div 
            className={cn(
              "absolute -bottom-20 -right-20 w-60 h-60 bg-pink-500/30 rounded-full blur-3xl transition-transform duration-700",
              isHovered && "scale-90 -translate-x-5"
            )}
          />
        </>
      )}
      
      {themeId === 'warm-sunset' && (
        <>
          <div 
            className={cn(
              "absolute top-6 right-8 w-12 h-12 bg-orange-400/50 rounded-full blur-xl transition-all duration-500",
              isHovered && "-translate-y-2 scale-110"
            )}
          />
          <div 
            className={cn(
              "absolute bottom-8 left-6 w-8 h-8 bg-rose-400/50 rounded-full blur-xl transition-all duration-500",
              isHovered && "translate-y-2 scale-110"
            )}
          />
          <div 
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-amber-300/30 rounded-full blur-2xl transition-transform duration-500",
              isHovered && "scale-125"
            )}
          />
        </>
      )}

      {themeId === 'bold' && (
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-violet-600/10 via-fuchsia-500/10 to-violet-600/10 transition-opacity duration-500",
            isHovered && "opacity-75"
          )}
        />
      )}

      {/* Preview content - Premium layout mockup */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-6">
        {/* Avatar */}
        <div 
          className={cn(
            "w-14 h-14 rounded-full mb-3 transition-all duration-300",
            styles.accent, 
            isHovered && `shadow-lg ${styles.accentGlow} scale-105`
          )}
        />
        
        {/* Name placeholder */}
        <div className={cn("h-4 w-32 rounded-full mb-2", themeId === 'editorial' ? 'bg-stone-700/40 dark:bg-stone-300/40' : 'bg-white/30')} />
        
        {/* Tagline placeholder */}
        <div className={cn("h-2.5 w-40 rounded-full mb-4", themeId === 'editorial' ? 'bg-stone-500/30 dark:bg-stone-400/30' : 'bg-white/20')} />
        
        {/* Action buttons placeholder */}
        <div className="flex gap-3">
          <div 
            className={cn(
              "h-8 w-20 rounded-full transition-all duration-300",
              styles.accent, 
              isHovered && `shadow-md ${styles.accentGlow}`
            )}
          />
          <div className={cn("h-8 w-20 rounded-full border", styles.border, 'bg-transparent')} />
        </div>
        
        {/* Skills preview */}
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "h-6 w-6 rounded transition-transform duration-300",
                themeId === 'cyberpunk' ? 'bg-cyan-500/30 border border-cyan-500/50' : 'bg-white/10',
                isHovered && "scale-110"
              )}
              style={{ transitionDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>
      
      {/* Hover overlay gradient */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}

// Cinematic settings panel - uses context for state management
function CinematicSettingsPanelContent() {
  const { 
    cinematicMode, 
    setCinematicMode, 
    particlesEnabled, 
    setParticlesEnabled, 
    cursorEffects, 
    setCursorEffects 
  } = useCinematicMode();

  const handleCinematicToggle = (enabled: boolean) => {
    setCinematicMode(enabled);
    toast.success(enabled ? 'Cinematic mode enabled' : 'Cinematic mode disabled');
  };

  const handleParticlesToggle = (enabled: boolean) => {
    setParticlesEnabled(enabled);
    toast.success(enabled ? 'Particle effects enabled' : 'Particle effects disabled');
  };

  const handleCursorToggle = (enabled: boolean) => {
    setCursorEffects(enabled);
    toast.success(enabled ? 'Cursor effects enabled' : 'Cursor effects disabled');
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50 overflow-hidden relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
      <CardContent className="relative p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Film className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Cinematic Experience</h3>
            <p className="text-sm text-slate-400">Premium visual effects for your portfolio</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <div>
                <Label htmlFor="cinematic-toggle" className="text-white cursor-pointer">Cinematic Mode</Label>
                <p className="text-xs text-slate-400">Enables all premium animations</p>
              </div>
            </div>
            <Switch id="cinematic-toggle" checked={cinematicMode} onCheckedChange={handleCinematicToggle} />
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <Stars className="h-4 w-4 text-cyan-400" />
              <div>
                <Label htmlFor="particles-toggle" className="text-white cursor-pointer">Particle Effects</Label>
                <p className="text-xs text-slate-400">Floating particles in background</p>
              </div>
            </div>
            <Switch id="particles-toggle" checked={particlesEnabled} onCheckedChange={handleParticlesToggle} disabled={!cinematicMode} />
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-emerald-400" />
              <div>
                <Label htmlFor="cursor-toggle" className="text-white cursor-pointer">Cursor Effects</Label>
                <p className="text-xs text-slate-400">Interactive cursor glow</p>
              </div>
            </div>
            <Switch id="cursor-toggle" checked={cursorEffects} onCheckedChange={handleCursorToggle} disabled={!cinematicMode} />
          </div>
        </div>
        
        <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
          <Layers className="h-3 w-3" />
          Effects are optimized for performance and respect reduced-motion preferences
        </p>
      </CardContent>
    </Card>
  );
}

// Wrapper that provides the context
function CinematicSettingsPanel() {
  return (
    <CinematicModeProvider>
      <CinematicSettingsPanelContent />
    </CinematicModeProvider>
  );
}

// Background Style Settings Panel
function BackgroundStyleSettings() {
  const { portfolio, updatePortfolio } = useWorkspace();
  const [saving, setSaving] = useState(false);
  
  const currentStyle = portfolio?.background_style || 'animated';
  
  const handleStyleChange = async (style: BackgroundStyle) => {
    if (style === currentStyle) return;
    
    setSaving(true);
    const { error } = await updatePortfolio({ background_style: style });
    setSaving(false);
    
    if (!error) {
      const styleNames: Record<BackgroundStyle, string> = {
        animated: 'Animated',
        static: 'Static',
        none: 'No Background'
      };
      toast.success(`Background style changed to "${styleNames[style]}"`);
    } else {
      toast.error('Could not update background style');
    }
  };
  
  const styleOptions: { value: BackgroundStyle; label: string; description: string; icon: typeof Play }[] = [
    { value: 'animated', label: 'Animated', description: 'Full motion backgrounds with effects', icon: Play },
    { value: 'static', label: 'Static', description: 'Gradient backgrounds without motion', icon: Image },
    { value: 'none', label: 'None', description: 'Plain theme colors only', icon: ImageOff },
  ];
  
  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50 overflow-hidden relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
      <CardContent className="relative p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Palette className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Background Style</h3>
            <p className="text-sm text-slate-400">Choose how your portfolio background appears</p>
          </div>
        </div>
        
        <RadioGroup
          value={currentStyle}
          onValueChange={(value) => handleStyleChange(value as BackgroundStyle)}
          className="space-y-3"
          disabled={saving}
        >
          {styleOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = currentStyle === option.value;
            
            return (
              <div
                key={option.value}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
                  isSelected 
                    ? "bg-accent/20 border-accent/50" 
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
                onClick={() => handleStyleChange(option.value)}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn(
                    "h-4 w-4",
                    option.value === 'animated' && "text-emerald-400",
                    option.value === 'static' && "text-blue-400",
                    option.value === 'none' && "text-slate-400"
                  )} />
                  <div>
                    <Label className="text-white cursor-pointer">{option.label}</Label>
                    <p className="text-xs text-slate-400">{option.description}</p>
                  </div>
                </div>
                <RadioGroupItem value={option.value} className="border-white/30 text-accent" />
              </div>
            );
          })}
        </RadioGroup>
        
        {saving && (
          <p className="text-xs text-slate-500 mt-4 flex items-center gap-2">
            <span className="animate-spin h-3 w-3 border-2 border-accent border-t-transparent rounded-full" />
            Saving...
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Themes() {
  const { portfolio, updatePortfolio, loading: workspaceLoading } = useWorkspace();
  const { plan } = usePlanLimits();
  const { trackEvent } = useEventTracking();
  const { createSnapshot } = usePortfolioVersions();
  const { availableThemes, isLoading: themesLoading, getThemeAccessLevel } = useAvailableThemes();
  const [saving, setSaving] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);

  const currentTheme = portfolio?.theme || 'minimal';

  const isThemeAccessible = (themeId: string): boolean => {
    const accessLevel = getThemeAccessLevel(themeId);
    if (accessLevel === null) return false;
    if (accessLevel === 'free') return true;
    return plan !== 'free';
  };

  const handleSelectTheme = async (themeId: string) => {
    if (themeId === currentTheme) return;
    if (!isThemeAccessible(themeId)) {
      setUpgradeModalOpen(true);
      return;
    }
    
    setSaving(true);
    const { error } = await updatePortfolio({ theme: themeId });
    setSaving(false);

    if (!error) {
      await createSnapshot('theme_change');
      trackEvent('theme_change', { from: currentTheme, to: themeId });
      const themeName = themeDetails[themeId]?.name || themeId;
      toast.success(`Theme changed to "${themeName}"`);
    } else {
      toast.error('Could not change theme. Please try again.');
    }
  };

  const handlePreview = () => {
    if (portfolio?.slug) {
      window.open(`/${portfolio.slug}`, '_blank');
    }
  };

  if (workspaceLoading || themesLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      </div>
    );
  }

  const themes = availableThemes.map(t => ({
    id: t.theme_id,
    accessLevel: t.access_level,
    ...themeDetails[t.theme_id],
  })).filter(t => t.name);

  // Group themes by category
  const groupedThemes = themes.reduce((acc, theme) => {
    const category = theme.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(theme);
    return acc;
  }, {} as Record<string, typeof themes>);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold mb-2 flex items-center gap-2">
            <Palette className="h-6 w-6 text-accent" />
            Themes
          </h1>
          <p className="text-muted-foreground">Choose a premium theme for your portfolio with cinematic effects.</p>
        </div>
        {portfolio?.published && (
          <Button variant="outline" onClick={handlePreview} className="gap-2">
            <Eye className="h-4 w-4" />
            Preview Live
          </Button>
        )}
      </div>

      {plan === 'free' && (
        <UpgradeBanner message="Free plan includes 2 themes. Upgrade to Pro to unlock all premium themes with cinematic effects." trigger="themes" />
      )}

      {/* Cinematic Settings Panel */}
      <CinematicSettingsPanel />

      {/* Background Style Settings */}
      <BackgroundStyleSettings />

      {/* Live Theme Preview - Lazy Loaded */}
      <Suspense fallback={<PreviewFallback />}>
        <LiveThemePreview previewTheme={previewTheme || currentTheme} />
      </Suspense>

      {/* Themes Grid by Category */}
      {Object.entries(groupedThemes).map(([category, categoryThemes]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground/80 flex items-center gap-2">
            <span className="h-1 w-6 rounded-full bg-accent" />
            {category}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categoryThemes.map((theme) => {
              const isSelected = currentTheme === theme.id;
              const isLocked = theme.accessLevel === 'pro' && plan === 'free';
              const isHovered = hoveredTheme === theme.id;
              
              return (
                <div key={theme.id} className="transform-gpu">
                  <Card 
                    className={cn(
                      "relative overflow-hidden transition-all duration-200 cursor-pointer group",
                      isSelected ? 'ring-2 ring-accent shadow-xl shadow-accent/20' : '',
                      isLocked ? 'opacity-70' : 'hover:shadow-xl hover:-translate-y-1',
                      !isSelected && !isLocked && 'hover:ring-1 hover:ring-accent/50'
                    )}
                    onClick={() => handleSelectTheme(theme.id)}
                    onMouseEnter={() => {
                      setHoveredTheme(theme.id);
                      if (!isLocked) setPreviewTheme(theme.id);
                    }}
                    onMouseLeave={() => {
                      setHoveredTheme(null);
                      setPreviewTheme(null);
                    }}
                  >
                    {/* Badges */}
                    <div className="absolute top-3 right-3 z-20 flex gap-2">
                      {isLocked && (
                        <Badge variant="secondary" className="gap-1 bg-black/50 backdrop-blur-sm border-white/20">
                          <Lock className="h-3 w-3" /> Pro
                        </Badge>
                      )}
                      {isSelected && !isLocked && (
                        <Badge className="bg-accent text-accent-foreground gap-1 shadow-lg">
                          <Check className="h-3 w-3" /> Active
                        </Badge>
                      )}
                    </div>
                    
                    {/* Premium Theme Preview */}
                    <PremiumThemePreview themeId={theme.id} isHovered={isHovered} />

                    <CardContent className="p-4 bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{theme.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {theme.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{theme.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {theme.features.map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {!portfolio?.published && (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="py-8 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">
              Publish your portfolio in Settings to see it live with cinematic effects.
            </p>
          </CardContent>
        </Card>
      )}

      <UpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} trigger="themes" />
    </div>
  );
}
