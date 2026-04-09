// Centralized theme configuration system
export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  fonts: {
    heading: string;
    body: string;
  };
  colors: {
    background: string;
    foreground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    card: string;
    cardForeground: string;
  };
  features: string[];
  backgroundStyle: 'solid' | 'gradient' | 'pattern' | 'animated';
}

export const themes: ThemeConfig[] = [
  // Existing themes
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple layout with focus on content',
    category: 'Classic',
    fonts: { heading: 'Inter', body: 'Inter' },
    colors: {
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%',
      primary: '222.2 47.4% 11.2%',
      primaryForeground: '210 40% 98%',
      secondary: '210 40% 96.1%',
      secondaryForeground: '222.2 47.4% 11.2%',
      accent: '210 40% 96.1%',
      accentForeground: '222.2 47.4% 11.2%',
      muted: '210 40% 96.1%',
      mutedForeground: '215.4 16.3% 46.9%',
      border: '214.3 31.8% 91.4%',
      card: '0 0% 100%',
      cardForeground: '222.2 84% 4.9%',
    },
    features: ['Clean typography', 'Subtle borders', 'Timeline experience'],
    backgroundStyle: 'solid',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design with cards and gradients',
    category: 'Classic',
    fonts: { heading: 'Inter', body: 'Inter' },
    colors: {
      background: '222.2 84% 4.9%',
      foreground: '210 40% 98%',
      primary: '217.2 91.2% 59.8%',
      primaryForeground: '222.2 47.4% 11.2%',
      secondary: '217.2 32.6% 17.5%',
      secondaryForeground: '210 40% 98%',
      accent: '217.2 91.2% 59.8%',
      accentForeground: '222.2 47.4% 11.2%',
      muted: '217.2 32.6% 17.5%',
      mutedForeground: '215 20.2% 65.1%',
      border: '217.2 32.6% 17.5%',
      card: '222.2 84% 4.9%',
      cardForeground: '210 40% 98%',
    },
    features: ['Card layouts', 'Hero image support', 'Alternating project rows'],
    backgroundStyle: 'gradient',
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Dramatic and eye-catching with large typography',
    category: 'Classic',
    fonts: { heading: 'Inter', body: 'Inter' },
    colors: {
      background: '0 0% 3.9%',
      foreground: '0 0% 98%',
      primary: '0 72.2% 50.6%',
      primaryForeground: '0 85.7% 97.3%',
      secondary: '0 0% 14.9%',
      secondaryForeground: '0 0% 98%',
      accent: '0 72.2% 50.6%',
      accentForeground: '0 85.7% 97.3%',
      muted: '0 0% 14.9%',
      mutedForeground: '0 0% 63.9%',
      border: '0 0% 14.9%',
      card: '0 0% 3.9%',
      cardForeground: '0 0% 98%',
    },
    features: ['Large typography', 'Gradient effects', 'Animated hovers'],
    backgroundStyle: 'gradient',
  },

  // New themes
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Terminal',
    description: 'Neon-lit tech aesthetic for developers and hackers',
    category: 'Tech',
    fonts: { heading: 'JetBrains Mono', body: 'Inter' },
    colors: {
      background: '220 50% 3%', // #05070B
      foreground: '166 100% 95%', // #E5FFF9
      primary: '174 100% 50%', // #00FFE1 neon cyan
      primaryForeground: '220 50% 3%',
      secondary: '270 100% 59%', // #8A2EFF electric purple
      secondaryForeground: '166 100% 95%',
      accent: '150 100% 50%', // #00FF88
      accentForeground: '220 50% 3%',
      muted: '220 30% 10%',
      mutedForeground: '166 30% 70%',
      border: '174 100% 50% / 0.3',
      card: '220 40% 6%',
      cardForeground: '166 100% 95%',
    },
    features: ['Glassmorphism cards', 'Neon glow effects', 'Animated grid background'],
    backgroundStyle: 'animated',
  },
  {
    id: 'corporate',
    name: 'Corporate Executive',
    description: 'Professional and refined for business portfolios',
    category: 'Business',
    fonts: { heading: 'Playfair Display', body: 'Inter' },
    colors: {
      background: '220 14% 97%', // #F7F9FC
      foreground: '222 47% 11%', // #0F172A
      primary: '222 47% 33%', // #1E3A8A navy blue
      primaryForeground: '210 40% 98%',
      secondary: '215 19% 81%', // #CBD5E1 cool gray
      secondaryForeground: '222 47% 11%',
      accent: '221 83% 53%', // #2563EB
      accentForeground: '210 40% 98%',
      muted: '215 19% 91%',
      mutedForeground: '215.4 16.3% 46.9%',
      border: '215 19% 88%',
      card: '0 0% 100%',
      cardForeground: '222 47% 11%',
    },
    features: ['Elegant typography', 'Minimal shadows', 'Professional styling'],
    backgroundStyle: 'gradient',
  },
  {
    id: 'neon-creative',
    name: 'Neon Creative',
    description: 'Vibrant and artistic for designers and creators',
    category: 'Creative',
    fonts: { heading: 'Poppins', body: 'Inter' },
    colors: {
      background: '240 20% 4%', // #0A0A0F
      foreground: '210 40% 98%', // #F8FAFC
      primary: '330 100% 62%', // #FF3CAC neon pink
      primaryForeground: '240 20% 4%',
      secondary: '276 38% 49%', // #784BA0 violet
      secondaryForeground: '210 40% 98%',
      accent: '202 70% 47%', // #2B86C5 electric blue
      accentForeground: '210 40% 98%',
      muted: '240 15% 12%',
      mutedForeground: '215 20% 65%',
      border: '330 100% 62% / 0.2',
      card: '240 20% 7%',
      cardForeground: '210 40% 98%',
    },
    features: ['Aurora gradients', 'Vibrant animations', 'Creative layouts'],
    backgroundStyle: 'animated',
  },
  {
    id: 'editorial',
    name: 'Editorial Minimal',
    description: 'Typography-focused for writers and researchers',
    category: 'Editorial',
    fonts: { heading: 'Merriweather', body: 'Source Serif Pro' },
    colors: {
      background: '0 0% 100%', // #FFFFFF
      foreground: '220 14% 14%', // #1F2937
      primary: '220 13% 9%', // #111827
      primaryForeground: '0 0% 100%',
      secondary: '220 9% 46%', // #6B7280
      secondaryForeground: '0 0% 100%',
      accent: '218 11% 27%', // #374151
      accentForeground: '0 0% 100%',
      muted: '220 14% 96%',
      mutedForeground: '220 9% 46%',
      border: '220 13% 91%',
      card: '0 0% 100%',
      cardForeground: '220 14% 14%',
    },
    features: ['Sharp typography', 'Thin dividers', 'Editorial spacing'],
    backgroundStyle: 'pattern',
  },
  {
    id: 'warm-sunset',
    name: 'Warm Sunset',
    description: 'Friendly and inviting for personal brands',
    category: 'Personal',
    fonts: { heading: 'DM Serif Display', body: 'Inter' },
    colors: {
      background: '27 100% 55%', // Gradient base
      foreground: '15 64% 15%', // #3F1D0B
      primary: '18 59% 25%', // #7C2D12
      primaryForeground: '33 100% 96%',
      secondary: '33 93% 86%', // #FED7AA
      secondaryForeground: '15 64% 15%',
      accent: '21 91% 48%', // #EA580C
      accentForeground: '33 100% 96%',
      muted: '33 60% 90%',
      mutedForeground: '15 40% 35%',
      border: '33 50% 80%',
      card: '0 0% 100% / 0.9',
      cardForeground: '15 64% 15%',
    },
    features: ['Warm gradients', 'Bokeh effects', 'Rounded edges'],
    backgroundStyle: 'gradient',
  },
  {
    id: 'developer',
    name: 'Developer Portfolio',
    description: 'Modern dark theme for developers with clean layout',
    category: 'Tech',
    fonts: { heading: 'Inter', body: 'Inter' },
    colors: {
      background: '240 20% 4%', // #0a0a0f
      foreground: '0 0% 100%', // white
      primary: '217 91% 60%', // blue-500
      primaryForeground: '0 0% 100%',
      secondary: '270 60% 55%', // purple
      secondaryForeground: '0 0% 100%',
      accent: '160 84% 39%', // emerald
      accentForeground: '0 0% 100%',
      muted: '220 14% 15%',
      mutedForeground: '220 9% 65%',
      border: '220 14% 20%',
      card: '220 20% 8%',
      cardForeground: '0 0% 100%',
    },
    features: ['Full-screen hero', 'Project cards', 'Skills grid', 'Timeline experience'],
    backgroundStyle: 'gradient',
  },
  {
    id: 'hacker',
    name: 'Hacker Terminal',
    description: 'Terminal-inspired theme with neon green accents for developers',
    category: 'Tech',
    fonts: { heading: 'JetBrains Mono', body: 'JetBrains Mono' },
    colors: {
      background: '0 0% 4%', // #0a0a0a
      foreground: '0 0% 100%', // white
      primary: '120 100% 50%', // #00FF41 neon green
      primaryForeground: '0 0% 0%',
      secondary: '0 0% 10%', // #1a1a1a
      secondaryForeground: '0 0% 100%',
      accent: '120 100% 50%', // neon green
      accentForeground: '0 0% 0%',
      muted: '0 0% 6%',
      mutedForeground: '0 0% 50%',
      border: '120 100% 50% / 0.2',
      card: '0 0% 10%',
      cardForeground: '0 0% 100%',
    },
    features: ['Terminal aesthetics', 'Code-style navigation', 'Monospace fonts', 'Neon accents'],
    backgroundStyle: 'solid',
  },
  {
    id: 'terminal',
    name: 'Terminal Pro',
    description: 'Premium developer portfolio with orbiting elements and 3D effects',
    category: 'Tech',
    fonts: { heading: 'Inter', body: 'JetBrains Mono' },
    colors: {
      background: '0 0% 4%', // #0a0a0a
      foreground: '0 0% 100%', // white
      primary: '142 100% 50%', // #00FF41 neon green
      primaryForeground: '0 0% 0%',
      secondary: '199 89% 48%', // #38bdf8 sky blue
      secondaryForeground: '0 0% 100%',
      accent: '142 100% 50%', // neon green
      accentForeground: '0 0% 0%',
      muted: '0 0% 6%',
      mutedForeground: '0 0% 50%',
      border: '142 100% 50% / 0.2',
      card: '0 0% 6%',
      cardForeground: '0 0% 100%',
    },
    features: ['Orbiting circles', '3D wireframe sphere', 'Particle background', 'Typewriter effect', 'Glassmorphism'],
    backgroundStyle: 'animated',
  },
];

export const getThemeById = (id: string): ThemeConfig => {
  return themes.find(t => t.id === id) || themes[0];
};

export const getThemesByCategory = (): Record<string, ThemeConfig[]> => {
  return themes.reduce((acc, theme) => {
    if (!acc[theme.category]) acc[theme.category] = [];
    acc[theme.category].push(theme);
    return acc;
  }, {} as Record<string, ThemeConfig[]>);
};
