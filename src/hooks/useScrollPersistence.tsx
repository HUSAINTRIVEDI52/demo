import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const SCROLL_STORAGE_KEY = 'route-scroll-positions';

// Get stored scroll positions from sessionStorage
function getScrollPositions(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = sessionStorage.getItem(SCROLL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Save scroll positions to sessionStorage
function saveScrollPositions(positions: Record<string, number>) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Hook to persist and restore scroll position per route
 * Returns a ref to attach to the scrollable container
 */
export function useScrollPersistence() {
  const location = useLocation();
  const scrollRef = useRef<HTMLElement>(null);
  const isRestoring = useRef(false);
  const lastPathname = useRef(location.pathname);

  // Save current scroll position before navigating away
  const saveCurrentScroll = useCallback(() => {
    const element = scrollRef.current;
    if (!element || isRestoring.current) return;

    const positions = getScrollPositions();
    positions[lastPathname.current] = element.scrollTop;
    saveScrollPositions(positions);
  }, []);

  // Restore scroll position when route changes
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    // Save scroll from previous route
    if (lastPathname.current !== location.pathname) {
      saveCurrentScroll();
      lastPathname.current = location.pathname;
    }

    // Restore scroll for new route
    const positions = getScrollPositions();
    const savedPosition = positions[location.pathname];

    if (savedPosition !== undefined && savedPosition > 0) {
      isRestoring.current = true;
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        element.scrollTo({ top: savedPosition, behavior: 'instant' });
        // Reset restoring flag after a short delay
        setTimeout(() => {
          isRestoring.current = false;
        }, 100);
      });
    } else {
      // Scroll to top for new routes
      element.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname, saveCurrentScroll]);

  // Save scroll on unmount or before page unload
  useEffect(() => {
    const handleBeforeUnload = () => saveCurrentScroll();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      saveCurrentScroll();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveCurrentScroll]);

  return scrollRef;
}

// Mobile menu state persistence
const MOBILE_MENU_KEY = 'mobile-menu-open';

export function getMobileMenuState(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(MOBILE_MENU_KEY) === 'true';
  } catch {
    return false;
  }
}

export function saveMobileMenuState(isOpen: boolean) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(MOBILE_MENU_KEY, String(isOpen));
  } catch {
    // Ignore storage errors
  }
}
