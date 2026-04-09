import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  headline: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
  variant?: 'default' | 'minimal' | 'card';
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export function EmptyState({
  icon: Icon,
  headline,
  description,
  actionLabel,
  actionHref,
  onAction,
  className = '',
  variant = 'default',
}: EmptyStateProps) {
  if (variant === 'minimal') {
    return (
      <motion.div 
        className={cn("py-12 text-center", className)}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          variants={itemVariants}
          className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-4"
        >
          <Icon className="h-6 w-6 text-muted-foreground" />
        </motion.div>
        <motion.h3 variants={itemVariants} className="text-base font-medium mb-1">
          {headline}
        </motion.h3>
        <motion.p variants={itemVariants} className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
          {description}
        </motion.p>
        {actionLabel && (actionHref || onAction) && (
          <motion.div variants={itemVariants}>
            {actionHref ? (
              <Button variant="outline" size="sm" asChild>
                <Link to={actionHref}>{actionLabel}</Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={onAction}>
                {actionLabel}
              </Button>
            )}
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={cn(
        "rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm relative overflow-hidden",
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="py-16 px-6 text-center relative z-10">
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.05, rotate: 5 }}
          className="h-20 w-20 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent/10"
        >
          <Icon className="h-10 w-10 text-accent" />
        </motion.div>
        
        <motion.h3 
          variants={itemVariants}
          className="text-xl font-semibold mb-2"
        >
          {headline}
        </motion.h3>
        
        <motion.p 
          variants={itemVariants}
          className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed"
        >
          {description}
        </motion.p>
        
        {actionLabel && (actionHref || onAction) && (
          <motion.div variants={itemVariants}>
            {actionHref ? (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20"
                  asChild
                >
                  <Link to={actionHref}>{actionLabel}</Link>
                </Button>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20"
                  onClick={onAction}
                >
                  {actionLabel}
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Decorative elements */}
      <motion.div 
        className="absolute -top-4 -right-4 w-24 h-24 bg-accent/5 rounded-full blur-2xl pointer-events-none"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </motion.div>
  );
}

// Specialized empty states
export function NoDataEmptyState({ 
  title = "No data yet",
  description = "Get started by adding your first item.",
  actionLabel,
  onAction,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-16 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="relative mb-6"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
          <svg 
            className="h-12 w-12 text-muted-foreground" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
            />
          </svg>
        </div>
        <motion.div 
          className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-accent font-bold">+</span>
        </motion.div>
      </motion.div>
      
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-xs mb-6">{description}</p>
      
      {actionLabel && onAction && (
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={onAction} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

// Error empty state
export function ErrorEmptyState({
  title = "Something went wrong",
  description = "We couldn't load the data. Please try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-16 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <svg 
          className="h-8 w-8 text-destructive" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-xs mb-6">{description}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </motion.div>
  );
}
