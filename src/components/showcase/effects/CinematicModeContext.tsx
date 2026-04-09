import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CinematicModeContextType {
  cinematicMode: boolean;
  toggleCinematicMode: () => void;
  setCinematicMode: (value: boolean) => void;
  particlesEnabled: boolean;
  setParticlesEnabled: (value: boolean) => void;
  cursorEffects: boolean;
  setCursorEffects: (value: boolean) => void;
  reducedMotion: boolean;
}

const CinematicModeContext = createContext<CinematicModeContextType | undefined>(undefined);

export function CinematicModeProvider({ children }: { children: ReactNode }) {
  const [cinematicMode, setCinematicModeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cinematic-mode');
      return saved !== null ? saved === 'true' : true; // ON by default
    }
    return true;
  });

  const [particlesEnabled, setParticlesEnabledState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('particles-enabled');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const [cursorEffects, setCursorEffectsState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cursor-effects');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  // Detect reduced motion preference
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Persist cinematic mode
  const setCinematicMode = (value: boolean) => {
    setCinematicModeState(value);
    localStorage.setItem('cinematic-mode', String(value));
  };

  // Persist particles enabled
  const setParticlesEnabled = (value: boolean) => {
    setParticlesEnabledState(value);
    localStorage.setItem('particles-enabled', String(value));
  };

  // Persist cursor effects
  const setCursorEffects = (value: boolean) => {
    setCursorEffectsState(value);
    localStorage.setItem('cursor-effects', String(value));
  };

  const toggleCinematicMode = () => setCinematicMode(!cinematicMode);

  return (
    <CinematicModeContext.Provider value={{ 
      cinematicMode, 
      toggleCinematicMode, 
      setCinematicMode, 
      particlesEnabled,
      setParticlesEnabled,
      cursorEffects,
      setCursorEffects,
      reducedMotion 
    }}>
      {children}
    </CinematicModeContext.Provider>
  );
}

export function useCinematicMode() {
  const context = useContext(CinematicModeContext);
  if (!context) {
    throw new Error('useCinematicMode must be used within CinematicModeProvider');
  }
  return context;
}
