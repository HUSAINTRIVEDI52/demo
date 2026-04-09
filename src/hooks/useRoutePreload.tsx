import { useCallback, useRef } from 'react';

// Map of route paths to their lazy import functions
const routeModules: Record<string, () => Promise<unknown>> = {
  '/app/dashboard': () => import('@/pages/app/Dashboard'),
  '/app/inbox': () => import('@/pages/app/Inbox'),
  '/app/portfolio': () => import('@/pages/app/Portfolio'),
  '/app/projects': () => import('@/pages/app/Projects'),
  '/app/experience': () => import('@/pages/app/Experience'),
  '/app/skills': () => import('@/pages/app/Skills'),
  '/app/certifications': () => import('@/pages/app/Certifications'),
  '/app/content': () => import('@/pages/app/Content'),
  '/app/themes': () => import('@/pages/app/Themes'),
  '/app/settings': () => import('@/pages/app/Settings'),
  '/app/history': () => import('@/pages/app/History'),
  '/app/preview': () => import('@/pages/app/Preview'),
};

// Track which routes have been preloaded
const preloadedRoutes = new Set<string>();

/**
 * Hook for preloading route modules on hover
 * Reduces navigation delay by loading the page before the user clicks
 */
export function useRoutePreload() {
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const preloadRoute = useCallback((path: string) => {
    // Don't preload if already done
    if (preloadedRoutes.has(path)) return;

    const loader = routeModules[path];
    if (loader) {
      // Mark as preloading immediately to prevent duplicate calls
      preloadedRoutes.add(path);
      
      // Preload the module
      loader().catch(() => {
        // Remove from set if preload fails so it can be retried
        preloadedRoutes.delete(path);
      });
    }
  }, []);

  const handleMouseEnter = useCallback((path: string) => {
    // Add a small delay to avoid preloading on quick mouse movements
    hoverTimeoutRef.current = setTimeout(() => {
      preloadRoute(path);
    }, 100);
  }, [preloadRoute]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  // Preload adjacent routes (commonly navigated together)
  const preloadAdjacentRoutes = useCallback((currentPath: string) => {
    const adjacentRoutes: Record<string, string[]> = {
      '/app/dashboard': ['/app/projects', '/app/portfolio', '/app/inbox'],
      '/app/portfolio': ['/app/dashboard', '/app/projects'],
      '/app/projects': ['/app/portfolio', '/app/experience'],
      '/app/experience': ['/app/projects', '/app/skills'],
      '/app/skills': ['/app/experience', '/app/certifications'],
    };

    const toPreload = adjacentRoutes[currentPath] || [];
    toPreload.forEach(path => {
      // Use requestIdleCallback for low-priority preloading
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => preloadRoute(path));
      } else {
        setTimeout(() => preloadRoute(path), 1000);
      }
    });
  }, [preloadRoute]);

  return {
    preloadRoute,
    handleMouseEnter,
    handleMouseLeave,
    preloadAdjacentRoutes,
  };
}

/**
 * Preload a specific route programmatically
 */
export function preloadRoute(path: string): void {
  if (preloadedRoutes.has(path)) return;

  const loader = routeModules[path];
  if (loader) {
    preloadedRoutes.add(path);
    loader().catch(() => {
      preloadedRoutes.delete(path);
    });
  }
}

/**
 * Check if a route has been preloaded
 */
export function isRoutePreloaded(path: string): boolean {
  return preloadedRoutes.has(path);
}
