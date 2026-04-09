import { cn } from '@/lib/utils';
import { forwardRef, useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  iconOnly?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: { icon: 'h-6 w-6', text: 'text-base' },
  md: { icon: 'h-8 w-8', text: 'text-lg' },
  lg: { icon: 'h-10 w-10', text: 'text-xl' },
  xl: { icon: 'h-12 w-12', text: 'text-2xl' },
};

interface LogoMarkProps {
  className?: string;
  isHovered?: boolean;
}

const LogoMark = forwardRef<HTMLDivElement, LogoMarkProps>(
  function LogoMark({ className, isHovered }, ref) {
    return (
      <div className="relative" ref={ref}>
        {/* Glow effect on hover */}
        <div 
          className={cn(
            'absolute inset-0 rounded-xl blur-md transition-all duration-300',
            isHovered ? 'opacity-60 scale-110' : 'opacity-0 scale-100'
          )}
          style={{ backgroundColor: 'hsl(var(--accent) / 0.5)' }}
        />
        
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn('relative transition-transform duration-300', isHovered && 'scale-105', className)}
        >
          <defs>
            <linearGradient id="logoGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--accent))" />
              <stop offset="100%" stopColor="hsl(var(--accent) / 0.7)" />
            </linearGradient>
            <linearGradient id="logoGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--accent))" />
              <stop offset="50%" stopColor="hsl(var(--accent) / 0.8)" />
              <stop offset="100%" stopColor="hsl(var(--primary))" />
            </linearGradient>
          </defs>
          
          {/* Background rounded square */}
          <rect
            x="2"
            y="2"
            width="36"
            height="36"
            rx="10"
            fill="url(#logoGradient1)"
          />
          
          {/* Inner glow effect */}
          <rect
            x="2"
            y="2"
            width="36"
            height="36"
            rx="10"
            fill="url(#logoGradient2)"
            className={cn('transition-opacity duration-300', isHovered ? 'opacity-50' : 'opacity-30')}
          />
          
          {/* Abstract "M" / Portfolio stack design */}
          {/* Left bar */}
          <rect x="9" y="11" width="4" height="18" rx="2" fill="white" opacity="0.95" />
          
          {/* Middle peak / arrow up */}
          <path
            d="M16 11L20 7L24 11L24 29L20 25L16 29Z"
            fill="white"
            opacity="0.95"
          />
          
          {/* Right bar */}
          <rect x="27" y="11" width="4" height="18" rx="2" fill="white" opacity="0.95" />
          
          {/* Highlight shine - pulses on hover */}
          <path
            d="M6 12C6 8.68629 8.68629 6 12 6H20C20 6 10 8 6 12Z"
            fill="white"
            className={cn('transition-opacity duration-300', isHovered ? 'opacity-40' : 'opacity-20')}
          />
        </svg>
      </div>
    );
  }
);

export const Logo = forwardRef<HTMLDivElement, LogoProps>(
  function Logo({ size = 'md', iconOnly = false, className }, ref) {
    const { icon, text } = sizeClasses[size];
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div 
        ref={ref}
        className={cn('flex items-center gap-2.5 cursor-pointer', className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <LogoMark className={icon} isHovered={isHovered} />

        {!iconOnly && (
          <div className={cn('font-display font-bold tracking-tight transition-colors duration-300', text)}>
            <span className="text-foreground">Make</span>
            <span className={cn('transition-all duration-300', isHovered ? 'text-accent drop-shadow-[0_0_8px_hsl(var(--accent)/0.5)]' : 'text-accent')}>Portfolio</span>
          </div>
        )}
      </div>
    );
  }
);

export const LogoIcon = forwardRef<HTMLDivElement, { className?: string }>(
  function LogoIcon({ className }, ref) {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <div
        ref={ref}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <LogoMark className={cn('h-8 w-8', className)} isHovered={isHovered} />
      </div>
    );
  }
);
