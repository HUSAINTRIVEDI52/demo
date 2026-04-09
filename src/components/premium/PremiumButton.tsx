import { forwardRef, ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  glow?: boolean;
}

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ 
    children, 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading, 
    leftIcon, 
    rightIcon,
    glow = true,
    disabled,
    ...props 
  }, ref) => {

    const sizeStyles = {
      sm: 'h-9 px-4 text-sm rounded-lg',
      md: 'h-11 px-6 text-sm rounded-xl',
      lg: 'h-13 px-8 text-base rounded-xl',
      xl: 'h-14 px-10 text-lg rounded-2xl',
    };

    const variantStyles = {
      primary: `bg-accent text-accent-foreground hover:bg-accent/90`,
      secondary: `bg-secondary text-secondary-foreground hover:bg-secondary/80`,
      outline: `border-2 border-accent/50 bg-transparent text-accent hover:bg-accent/10 hover:border-accent`,
      ghost: `bg-transparent text-foreground hover:bg-accent/10`,
      gradient: `bg-gradient-to-r from-accent via-accent/80 to-accent text-accent-foreground`,
    };

    return (
      <button
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:opacity-50 disabled:pointer-events-none',
          'hover:scale-[1.02] active:scale-[0.98]',
          sizeStyles[size],
          variantStyles[variant],
          glow && variant === 'primary' && 'shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

PremiumButton.displayName = 'PremiumButton';
