import { lazy, Suspense, ComponentType } from 'react';
import { LogoSpinner } from '@/components/brand/LogoSpinner';
import type { FullPortfolioData } from '@/pages/PublicPortfolio';

// Lazy-load all theme components to reduce initial bundle size
const MinimalTheme = lazy(() => import('@/components/portfolio-themes/MinimalTheme').then(m => ({ default: m.MinimalTheme })));
const ModernTheme = lazy(() => import('@/components/portfolio-themes/ModernTheme').then(m => ({ default: m.ModernTheme })));
const BoldTheme = lazy(() => import('@/components/portfolio-themes/BoldTheme').then(m => ({ default: m.BoldTheme })));
const CyberpunkTheme = lazy(() => import('@/components/portfolio-themes/CyberpunkTheme').then(m => ({ default: m.CyberpunkTheme })));
const CorporateTheme = lazy(() => import('@/components/portfolio-themes/CorporateTheme').then(m => ({ default: m.CorporateTheme })));
const NeonCreativeTheme = lazy(() => import('@/components/portfolio-themes/NeonCreativeTheme').then(m => ({ default: m.NeonCreativeTheme })));
const EditorialTheme = lazy(() => import('@/components/portfolio-themes/EditorialTheme').then(m => ({ default: m.EditorialTheme })));
const WarmSunsetTheme = lazy(() => import('@/components/portfolio-themes/WarmSunsetTheme').then(m => ({ default: m.WarmSunsetTheme })));
const DeveloperTheme = lazy(() => import('@/components/portfolio-themes/DeveloperTheme').then(m => ({ default: m.DeveloperTheme })));
const HackerTheme = lazy(() => import('@/components/portfolio-themes/HackerTheme').then(m => ({ default: m.HackerTheme })));
const CyberRajTheme = lazy(() => import('@/components/portfolio-themes/CyberRajTheme').then(m => ({ default: m.CyberRajTheme })));

const DEFAULT_THEME = 'minimal';

// Registry of lazy-loaded theme components
const lazyThemeComponents: Record<string, ComponentType<{ data: FullPortfolioData }>> = {
  minimal: MinimalTheme,
  modern: ModernTheme,
  bold: BoldTheme,
  cyberpunk: CyberpunkTheme,
  corporate: CorporateTheme,
  'neon-creative': NeonCreativeTheme,
  editorial: EditorialTheme,
  'warm-sunset': WarmSunsetTheme,
  developer: DeveloperTheme,
  hacker: HackerTheme,
  terminal: CyberRajTheme,
};

export const themeNames: Record<string, string> = {
  minimal: 'Minimal',
  modern: 'Modern',
  bold: 'Bold',
  cyberpunk: 'Cyberpunk Terminal',
  corporate: 'Corporate Executive',
  'neon-creative': 'Neon Creative',
  editorial: 'Editorial Minimal',
  'warm-sunset': 'Warm Sunset',
  developer: 'Developer Portfolio',
  hacker: 'Hacker Terminal',
  terminal: 'Terminal Pro',
};

function ThemeLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full min-h-[300px] bg-background">
      <LogoSpinner size="md" />
    </div>
  );
}

interface LazyThemeRendererProps {
  themeId: string;
  data: FullPortfolioData;
}

/**
 * Renders a theme component lazily with Suspense boundary.
 * This ensures theme code is only loaded when needed.
 */
export function LazyThemeRenderer({ themeId, data }: LazyThemeRendererProps) {
  const ThemeComponent = lazyThemeComponents[themeId] || lazyThemeComponents[DEFAULT_THEME];
  
  return (
    <Suspense fallback={<ThemeLoadingFallback />}>
      <ThemeComponent data={data} />
    </Suspense>
  );
}

/**
 * Get the lazy theme component for a given theme ID.
 * Returns null if theme doesn't exist.
 */
export function getLazyThemeComponent(themeId: string): ComponentType<{ data: FullPortfolioData }> | null {
  return lazyThemeComponents[themeId] || null;
}
