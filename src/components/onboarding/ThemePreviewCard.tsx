import { useState } from 'react';
import { Check, User, Briefcase, Code, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ThemeConfig } from '@/config/themes';

interface ThemePreviewCardProps {
  theme: ThemeConfig;
  isSelected: boolean;
  onSelect: () => void;
}

export function ThemePreviewCard({ theme, isSelected, onSelect }: ThemePreviewCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getBackgroundStyle = () => {
    if (theme.backgroundStyle === 'gradient') {
      return {
        background: `linear-gradient(135deg, hsl(${theme.colors.background}), hsl(${theme.colors.muted}))`,
      };
    }
    if (theme.backgroundStyle === 'animated') {
      return {
        background: `hsl(${theme.colors.background})`,
      };
    }
    return {
      background: `hsl(${theme.colors.background})`,
    };
  };

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative rounded-xl border-2 transition-all duration-300 text-left overflow-hidden group",
        isSelected 
          ? "border-accent ring-2 ring-accent/20" 
          : "border-muted hover:border-accent/50"
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-20 bg-accent text-accent-foreground rounded-full p-1">
          <Check className="h-3 w-3" />
        </div>
      )}

      {/* Mini Portfolio Mockup */}
      <div 
        className="relative w-full h-40 overflow-hidden"
        style={getBackgroundStyle()}
      >
        {/* Animated accent elements for certain themes */}
        {theme.backgroundStyle === 'animated' && (
          <>
            <div 
              className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-30 animate-pulse"
              style={{ background: `hsl(${theme.colors.accent})` }}
            />
            <div 
              className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full blur-2xl opacity-20 animate-pulse"
              style={{ 
                background: `hsl(${theme.colors.primary})`,
                animationDelay: '1s' 
              }}
            />
          </>
        )}

        {/* Pattern overlay for pattern themes */}
        {theme.backgroundStyle === 'pattern' && (
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(hsl(${theme.colors.foreground}) 1px, transparent 1px)`,
              backgroundSize: '8px 8px'
            }}
          />
        )}

        {/* Hero Section Mockup */}
        <div className="relative p-3 h-full flex flex-col">
          {/* Nav bar */}
          <div className="flex items-center justify-between mb-2">
            <div 
              className="w-6 h-1.5 rounded-full"
              style={{ background: `hsl(${theme.colors.foreground})` }}
            />
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className="w-4 h-1 rounded-full opacity-50"
                  style={{ background: `hsl(${theme.colors.foreground})` }}
                />
              ))}
            </div>
          </div>

          {/* Hero content */}
          <div className={cn(
            "flex-1 flex flex-col justify-center transition-transform duration-500",
            isHovered ? "translate-y-0" : "translate-y-0"
          )}>
            {/* Avatar */}
            <div 
              className={cn(
                "w-8 h-8 rounded-full mb-2 flex items-center justify-center transition-all duration-300",
                isHovered ? "scale-110" : "scale-100"
              )}
              style={{ background: `hsl(${theme.colors.accent} / 0.2)` }}
            >
              <User 
                className="w-4 h-4" 
                style={{ color: `hsl(${theme.colors.accent})` }}
              />
            </div>

            {/* Title lines */}
            <div 
              className={cn(
                "h-2 rounded-full mb-1.5 transition-all duration-300",
                isHovered ? "w-20" : "w-16"
              )}
              style={{ background: `hsl(${theme.colors.foreground})` }}
            />
            <div 
              className="w-24 h-1.5 rounded-full opacity-60"
              style={{ background: `hsl(${theme.colors.mutedForeground})` }}
            />

            {/* CTA buttons */}
            <div className={cn(
              "flex gap-1.5 mt-3 transition-all duration-500",
              isHovered ? "opacity-100 translate-y-0" : "opacity-70 translate-y-1"
            )}>
              <div 
                className="px-2 py-1 rounded text-[6px] font-medium"
                style={{ 
                  background: `hsl(${theme.colors.accent})`,
                  color: `hsl(${theme.colors.accentForeground})`
                }}
              >
                Projects
              </div>
              <div 
                className="px-2 py-1 rounded text-[6px] font-medium border"
                style={{ 
                  borderColor: `hsl(${theme.colors.border})`,
                  color: `hsl(${theme.colors.foreground})`
                }}
              >
                Contact
              </div>
            </div>
          </div>
        </div>

        {/* Scrolling content preview on hover */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out",
          isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        )}>
          <div 
            className="p-2 backdrop-blur-sm"
            style={{ background: `hsl(${theme.colors.card} / 0.95)` }}
          >
            {/* Section icons */}
            <div className="flex justify-around">
              {[
                { icon: Briefcase, label: 'Work' },
                { icon: Code, label: 'Skills' },
                { icon: Mail, label: 'Contact' },
              ].map(({ icon: Icon, label }) => (
                <div 
                  key={label}
                  className="flex flex-col items-center gap-0.5"
                >
                  <div 
                    className="w-5 h-5 rounded flex items-center justify-center"
                    style={{ background: `hsl(${theme.colors.accent} / 0.1)` }}
                  >
                    <Icon 
                      className="w-2.5 h-2.5"
                      style={{ color: `hsl(${theme.colors.accent})` }}
                    />
                  </div>
                  <span 
                    className="text-[5px] font-medium"
                    style={{ color: `hsl(${theme.colors.mutedForeground})` }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Theme info */}
      <div className="p-3 border-t border-border">
        <h3 className="font-medium text-sm">{theme.name}</h3>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
          {theme.description}
        </p>
        
        {/* Color palette preview */}
        <div className="flex gap-1 mt-2">
          {[
            theme.colors.primary,
            theme.colors.accent,
            theme.colors.secondary,
            theme.colors.muted,
          ].map((color, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full border border-border/50"
              style={{ background: `hsl(${color})` }}
            />
          ))}
        </div>
      </div>
    </button>
  );
}
