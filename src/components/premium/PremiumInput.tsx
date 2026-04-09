import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { useAppTheme } from '@/contexts/AppThemeContext';

interface PremiumInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ className, label, error, icon, type, ...props }, ref) => {
    const { config } = useAppTheme();

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-12 w-full rounded-xl border bg-card/50 backdrop-blur-sm px-4 py-2 text-sm',
              'transition-all duration-200',
              'placeholder:text-muted-foreground/60',
              'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent',
              'disabled:cursor-not-allowed disabled:opacity-50',
              icon && 'pl-10',
              error 
                ? 'border-destructive focus:ring-destructive/50 focus:border-destructive' 
                : 'border-border hover:border-border/80',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

PremiumInput.displayName = 'PremiumInput';

interface PremiumTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const PremiumTextarea = forwardRef<HTMLTextAreaElement, PremiumTextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            'flex min-h-[120px] w-full rounded-xl border bg-card/50 backdrop-blur-sm px-4 py-3 text-sm',
            'transition-all duration-200',
            'placeholder:text-muted-foreground/60',
            'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent',
            'disabled:cursor-not-allowed disabled:opacity-50 resize-none',
            error 
              ? 'border-destructive focus:ring-destructive/50 focus:border-destructive' 
              : 'border-border hover:border-border/80',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

PremiumTextarea.displayName = 'PremiumTextarea';
