import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface UsageCounterProps {
  current: number;
  max: number;
  label: string;
  showProgress?: boolean;
  className?: string;
}

export function UsageCounter({ current, max, label, showProgress = false, className }: UsageCounterProps) {
  const isAtLimit = current >= max;
  const percentage = Math.min((current / max) * 100, 100);
  const isUnlimited = max >= 1000;
  
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn(
          'font-medium',
          isAtLimit && !isUnlimited && 'text-destructive'
        )}>
          {current} / {isUnlimited ? '∞' : max}
        </span>
      </div>
      {showProgress && !isUnlimited && (
        <Progress 
          value={percentage} 
          className={cn(
            'h-2',
            isAtLimit && '[&>div]:bg-destructive'
          )} 
        />
      )}
    </div>
  );
}
