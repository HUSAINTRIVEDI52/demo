import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Zap, Sparkles, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppTheme, AppTheme, appThemeConfig } from '@/contexts/AppThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const themeIcons: Record<AppTheme, typeof Zap> = {
  'cyber-neon': Zap,
  'clean-light': Sun,
  'glassmorphism': Sparkles,
};

const themeColors: Record<AppTheme, string> = {
  'cyber-neon': 'from-emerald-500 to-cyan-500',
  'clean-light': 'from-amber-400 to-orange-400',
  'glassmorphism': 'from-purple-500 to-pink-500',
};

// Quick toggle between light and dark
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, config } = useAppTheme();
  const isDark = config.isDark;

  const toggleTheme = () => {
    // Toggle between clean-light and cyber-neon (primary dark theme)
    setTheme(isDark ? 'clean-light' : 'cyber-neon');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        'h-10 w-10 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm',
        'hover:bg-card hover:border-accent/50',
        'transition-all duration-200 relative overflow-hidden',
        className
      )}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? 'dark' : 'light'}
          initial={{ y: -20, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 20, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {isDark ? (
            <Moon className="h-5 w-5 text-accent" />
          ) : (
            <Sun className="h-5 w-5 text-accent" />
          )}
        </motion.div>
      </AnimatePresence>
    </Button>
  );
}

// Full theme switcher with all options
export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useAppTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-10 w-10 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm',
            'hover:bg-card hover:border-accent/50',
            'transition-all duration-200',
            className
          )}
        >
          <Palette className="h-5 w-5 text-accent" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 bg-card/95 backdrop-blur-xl border-border/50">
        <div className="px-2 py-1.5 mb-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            App Theme
          </p>
        </div>
        {(Object.keys(appThemeConfig) as AppTheme[]).map((themeKey) => {
          const Icon = themeIcons[themeKey];
          const isActive = theme === themeKey;
          
          return (
            <DropdownMenuItem
              key={themeKey}
              onClick={() => setTheme(themeKey)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer',
                'transition-all duration-200',
                isActive && 'bg-accent/10'
              )}
            >
              <div className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center',
                `bg-gradient-to-br ${themeColors[themeKey]}`
              )}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className={cn(
                  'text-sm font-medium',
                  isActive && 'text-accent'
                )}>
                  {appThemeConfig[themeKey].name}
                </p>
              </div>
              {isActive && (
                <motion.div
                  layoutId="activeTheme"
                  className="h-2 w-2 rounded-full bg-accent"
                  transition={{ type: 'spring', duration: 0.3 }}
                />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Inline theme selector for settings pages
export function ThemeSelector({ className }: { className?: string }) {
  const { theme, setTheme } = useAppTheme();

  return (
    <div className={cn('grid grid-cols-3 gap-4', className)}>
      {(Object.keys(appThemeConfig) as AppTheme[]).map((themeKey) => {
        const Icon = themeIcons[themeKey];
        const isActive = theme === themeKey;
        
        return (
          <motion.button
            key={themeKey}
            onClick={() => setTheme(themeKey)}
            className={cn(
              'relative p-4 rounded-2xl border-2 transition-all duration-200',
              'flex flex-col items-center gap-3',
              isActive 
                ? 'border-accent bg-accent/10' 
                : 'border-border/50 bg-card/50 hover:border-border'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={cn(
              'h-12 w-12 rounded-xl flex items-center justify-center',
              `bg-gradient-to-br ${themeColors[themeKey]}`
            )}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <span className={cn(
              'text-sm font-medium',
              isActive && 'text-accent'
            )}>
              {appThemeConfig[themeKey].name}
            </span>
            {isActive && (
              <motion.div
                layoutId="activeThemeSelector"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent flex items-center justify-center"
                transition={{ type: 'spring', duration: 0.3 }}
              >
                <svg className="h-3 w-3 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
