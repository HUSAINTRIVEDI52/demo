import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface PremiumAuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const PremiumAuthInput = forwardRef<HTMLInputElement, PremiumAuthInputProps>(
  ({ className, label, error, icon, type, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative group">
          {/* Glow effect on focus */}
          <motion.div
            className="absolute -inset-0.5 rounded-xl opacity-0 blur-sm transition-opacity duration-300"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--accent) / 0.5) 100%)',
            }}
            animate={{ opacity: isFocused && !error ? 0.3 : 0 }}
          />
          
          {/* Input container */}
          <div className="relative">
            {icon && (
              <div className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200",
                isFocused ? "text-accent" : "text-muted-foreground"
              )}>
                {icon}
              </div>
            )}
            
            <input
              type={inputType}
              className={cn(
                'relative flex h-12 w-full rounded-xl border bg-card/50 backdrop-blur-sm px-4 py-2 text-sm',
                'transition-all duration-200',
                'placeholder:text-muted-foreground/60',
                'focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent',
                'disabled:cursor-not-allowed disabled:opacity-50',
                icon && 'pl-11',
                isPassword && 'pr-11',
                error 
                  ? 'border-destructive focus:ring-destructive/30 focus:border-destructive' 
                  : 'border-border hover:border-border/80',
                className
              )}
              ref={ref}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              {...props}
            />
            
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200",
                  "text-muted-foreground hover:text-foreground focus:outline-none"
                )}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>
        
        {error && (
          <motion.p 
            className="text-sm text-destructive"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

PremiumAuthInput.displayName = 'PremiumAuthInput';
