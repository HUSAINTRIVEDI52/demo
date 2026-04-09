import { Badge } from '@/components/ui/badge';
import { Crown, Rocket } from 'lucide-react';
import { PlanType } from '@/hooks/usePlanLimits';
import { cn } from '@/lib/utils';

interface PlanBadgeProps {
  plan: PlanType;
  className?: string;
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  if (plan === 'free') {
    return (
      <Badge 
        variant="secondary" 
        className={cn('gap-1', className)}
      >
        Free
      </Badge>
    );
  }
  
  if (plan === 'starter') {
    return (
      <Badge 
        className={cn(
          'gap-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600',
          className
        )}
      >
        <Rocket className="h-3 w-3" />
        Starter
      </Badge>
    );
  }
  
  // Default to Pro badge for any other plan
  return (
    <Badge 
      className={cn(
        'gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600',
        className
      )}
    >
      <Crown className="h-3 w-3" />
      Pro
    </Badge>
  );
}
