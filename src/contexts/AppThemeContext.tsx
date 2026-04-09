import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppTheme = 'cyber-neon' | 'clean-light' | 'glassmorphism';

interface ThemeConfig {
  name: string;
  isDark: boolean;
  colors: {
    primary: string;
    accent: string;
    accentGlow: string;
    background: string;
    surface: string;
    surfaceHover: string;
    border: string;
    text: string;
    textMuted: string;
  };
  effects: {
    particles: boolean;
    grid: boolean;
    glow: boolean;
    blur: boolean;
    gradient: boolean;
  };
}

export const appThemeConfig: Record<AppTheme, ThemeConfig> = {
  'cyber-neon': {
    name: 'Cyber Neon',
    isDark: true,
    colors: {
      primary: '160 84% 39%',
      accent: '160 84% 39%',
      accentGlow: 'rgba(16, 185, 129, 0.4)',
      background: '222 47% 6%',
      surface: '222 47% 8%',
      surfaceHover: '222 47% 10%',
      border: '215 28% 17%',
      text: '210 40% 98%',
      textMuted: '215 20% 65%',
    },
    effects: {
      particles: true,
      grid: true,
      glow: true,
      blur: true,
      gradient: true,
    },
  },
  'clean-light': {
    name: 'Clean Light',
    isDark: false,
    colors: {
      primary: '222 47% 11%',
      accent: '160 84% 39%',
      accentGlow: 'rgba(16, 185, 129, 0.2)',
      background: '210 20% 98%',
      surface: '0 0% 100%',
      surfaceHover: '210 20% 96%',
      border: '214 32% 91%',
      text: '222 47% 11%',
      textMuted: '215 16% 47%',
    },
    effects: {
      particles: false,
      grid: false,
      glow: false,
      blur: true,
      gradient: true,
    },
  },
  'glassmorphism': {
    name: 'Glassmorphism',
    isDark: true,
    colors: {
      primary: '270 95% 75%',
      accent: '270 95% 75%',
      accentGlow: 'rgba(168, 85, 247, 0.4)',
      background: '260 20% 8%',
      surface: '260 20% 12%',
      surfaceHover: '260 20% 16%',
      border: '260 20% 20%',
      text: '0 0% 98%',
      textMuted: '260 10% 65%',
    },
    effects: {
      particles: true,
      grid: false,
      glow: true,
      blur: true,
      gradient: true,
    },
  },
};

interface AppThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  config: ThemeConfig;
}

const AppThemeContext = createContext<AppThemeContextType | undefined>(undefined);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app-theme') as AppTheme;
      // Migrate old 'minimal-dark' to 'clean-light'
      if (saved === 'minimal-dark' as any) {
        localStorage.setItem('app-theme', 'clean-light');
        return 'clean-light';
      }
      if (saved && appThemeConfig[saved]) {
        return saved;
      }
    }
    return 'clean-light';
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  useEffect(() => {
    const config = appThemeConfig[theme];
    const root = document.documentElement;
    
    // Apply theme colors as CSS variables
    root.style.setProperty('--background', config.colors.background);
    root.style.setProperty('--foreground', config.colors.text);
    root.style.setProperty('--card', config.colors.surface);
    root.style.setProperty('--card-foreground', config.colors.text);
    root.style.setProperty('--popover', config.colors.surface);
    root.style.setProperty('--popover-foreground', config.colors.text);
    root.style.setProperty('--primary', config.colors.primary);
    root.style.setProperty('--primary-foreground', config.isDark ? '222 47% 11%' : '210 40% 98%');
    root.style.setProperty('--secondary', config.colors.surfaceHover);
    root.style.setProperty('--secondary-foreground', config.colors.text);
    root.style.setProperty('--muted', config.colors.surfaceHover);
    root.style.setProperty('--muted-foreground', config.colors.textMuted);
    root.style.setProperty('--accent', config.colors.accent);
    root.style.setProperty('--accent-foreground', config.isDark ? '222 47% 11%' : '0 0% 100%');
    root.style.setProperty('--border', config.colors.border);
    root.style.setProperty('--input', config.colors.border);
    root.style.setProperty('--ring', config.colors.accent);
    root.style.setProperty('--sidebar-background', config.colors.surface);
    root.style.setProperty('--sidebar-foreground', config.colors.text);
    root.style.setProperty('--sidebar-primary', config.colors.accent);
    root.style.setProperty('--sidebar-accent', config.colors.surfaceHover);
    root.style.setProperty('--sidebar-border', config.colors.border);
    
    // Toggle dark class based on theme
    if (config.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <AppThemeContext.Provider value={{ theme, setTheme, config: appThemeConfig[theme] }}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme must be used within an AppThemeProvider');
  }
  return context;
}
