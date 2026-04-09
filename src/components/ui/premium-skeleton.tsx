import { cn } from "@/lib/utils";
import { usePerformanceMode } from "@/hooks/usePerformanceMode";

interface PremiumSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'avatar' | 'button' | 'text' | 'title';
}

export function PremiumSkeleton({ 
  className, 
  variant = 'default',
  ...props 
}: PremiumSkeletonProps) {
  const performanceMode = usePerformanceMode();
  
  // Use simpler static gradient when in performance mode (mobile/low-end)
  const baseClasses = performanceMode 
    ? "bg-muted/60 rounded-md"
    : "bg-gradient-to-r from-muted via-muted/50 to-muted rounded-md animate-pulse";
  
  const variantClasses = {
    default: "",
    card: "rounded-2xl",
    avatar: "rounded-full aspect-square",
    button: "rounded-xl h-10",
    text: "h-4 rounded",
    title: "h-7 rounded-lg",
  };

  return (
    <div 
      className={cn(
        baseClasses, 
        variantClasses[variant],
        // Only add overflow-hidden + shimmer container when NOT in performance mode
        !performanceMode && "relative overflow-hidden",
        className
      )} 
      {...props}
    >
      {/* Skip the expensive infinite shimmer animation on mobile/slow devices */}
      {!performanceMode && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent animate-shimmer" />
      )}
    </div>
  );
}

// Card skeleton for dashboard cards
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card/50 p-6 space-y-4", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <PremiumSkeleton variant="text" className="w-24" />
          <PremiumSkeleton variant="title" className="w-16" />
        </div>
        <PremiumSkeleton className="h-12 w-12 rounded-xl" />
      </div>
      <PremiumSkeleton variant="text" className="w-20" />
    </div>
  );
}

// Stats card skeleton
export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card/50 backdrop-blur-lg p-6", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <PremiumSkeleton variant="text" className="w-20 h-3" />
          <PremiumSkeleton variant="title" className="w-24 h-8" />
          <PremiumSkeleton variant="text" className="w-16 h-3" />
        </div>
        <PremiumSkeleton className="h-12 w-12 rounded-xl" />
      </div>
    </div>
  );
}

// Table row skeleton
export function TableRowSkeleton({ columns = 4, className }: { columns?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 p-4 border-b border-border/30", className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <PremiumSkeleton 
          key={i} 
          variant="text" 
          className={cn(
            i === 0 ? "w-32" : "flex-1",
            i === columns - 1 && "w-24"
          )} 
        />
      ))}
    </div>
  );
}

// List item skeleton
export function ListItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 p-4 rounded-xl border border-border/30 bg-card/30", className)}>
      <PremiumSkeleton variant="avatar" className="h-12 w-12" />
      <div className="flex-1 space-y-2">
        <PremiumSkeleton variant="text" className="w-3/4 h-4" />
        <PremiumSkeleton variant="text" className="w-1/2 h-3" />
      </div>
      <PremiumSkeleton className="h-8 w-20 rounded-lg" />
    </div>
  );
}

// Project card skeleton
export function ProjectCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card/50 overflow-hidden", className)}>
      <PremiumSkeleton className="h-40 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <PremiumSkeleton variant="title" className="w-3/4" />
        <PremiumSkeleton variant="text" className="w-full" />
        <PremiumSkeleton variant="text" className="w-2/3" />
        <div className="flex gap-2 pt-2">
          <PremiumSkeleton className="h-6 w-16 rounded-full" />
          <PremiumSkeleton className="h-6 w-20 rounded-full" />
          <PremiumSkeleton className="h-6 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Chart skeleton
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card/50 p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <PremiumSkeleton variant="title" className="w-32" />
        <PremiumSkeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 7 }).map((_, i) => (
          <div 
            key={i} 
            className="flex-1 bg-muted/50 rounded-t-lg animate-pulse"
            style={{ height: `${30 + (i * 10) % 70}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// Form skeleton
export function FormSkeleton({ fields = 3, className }: { fields?: number; className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <PremiumSkeleton variant="text" className="w-24 h-3" />
          <PremiumSkeleton className="h-10 w-full rounded-xl" />
        </div>
      ))}
      <PremiumSkeleton variant="button" className="w-32" />
    </div>
  );
}

// Page header skeleton
export function PageHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="space-y-2">
        <PremiumSkeleton variant="title" className="w-48 h-8" />
        <PremiumSkeleton variant="text" className="w-64 h-4" />
      </div>
      <PremiumSkeleton variant="button" className="w-32" />
    </div>
  );
}

// List page skeleton with header and items
export function ListSkeleton({ 
  count = 3, 
  showHeader = true,
  itemHeight = 'h-24',
  className 
}: { 
  count?: number; 
  showHeader?: boolean;
  itemHeight?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      {showHeader && <PageHeaderSkeleton />}
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <PremiumSkeleton 
            key={i} 
            className={cn("w-full rounded-xl", itemHeight)} 
          />
        ))}
      </div>
    </div>
  );
}

// Plan usage skeleton
export function PlanUsageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card/50 p-6", className)}>
      <PremiumSkeleton variant="title" className="w-28 h-5 mb-4" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <PremiumSkeleton variant="text" className="w-16 h-3" />
              <PremiumSkeleton variant="text" className="w-12 h-3" />
            </div>
            <PremiumSkeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Portfolio status card skeleton
export function PortfolioStatusSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card/50 p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <PremiumSkeleton variant="title" className="w-32 h-5" />
        <PremiumSkeleton variant="text" className="w-20 h-4" />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <PremiumSkeleton variant="button" className="w-32" />
        <PremiumSkeleton variant="button" className="w-40" />
        <PremiumSkeleton variant="button" className="w-44" />
      </div>
      <div className="flex items-center gap-2">
        <PremiumSkeleton className="h-4 w-4 rounded" />
        <PremiumSkeleton variant="text" className="w-48 h-3" />
      </div>
    </div>
  );
}

// Analytics insights skeleton
export function AnalyticsInsightsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card/50 p-6", className)}>
      <div className="flex items-center gap-2 mb-2">
        <PremiumSkeleton className="h-5 w-5 rounded" />
        <PremiumSkeleton variant="title" className="w-36 h-5" />
      </div>
      <PremiumSkeleton variant="text" className="w-64 h-3 mb-4" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg bg-muted/30 space-y-2">
            <div className="flex items-center gap-2">
              <PremiumSkeleton className="h-4 w-4 rounded" />
              <PremiumSkeleton variant="text" className="w-20 h-3" />
            </div>
            <PremiumSkeleton variant="title" className="w-12 h-7" />
            <PremiumSkeleton variant="text" className="w-24 h-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Quick stats grid skeleton
export function QuickStatsGridSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4", className)}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/50 bg-card/50 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <PremiumSkeleton className="h-8 w-8 rounded-lg" />
            <PremiumSkeleton variant="text" className="w-16 h-3" />
          </div>
          <PremiumSkeleton variant="title" className="w-8 h-6" />
        </div>
      ))}
    </div>
  );
}

// Share links skeleton
export function ShareLinksSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card/50 p-6", className)}>
      <div className="flex items-center gap-2 mb-4">
        <PremiumSkeleton className="h-5 w-5 rounded" />
        <PremiumSkeleton variant="title" className="w-40 h-5" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-muted/30">
            <PremiumSkeleton className="h-8 w-8 rounded-lg" />
            <PremiumSkeleton variant="text" className="w-16 h-3" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Dashboard grid skeleton - matches actual dashboard layout
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with plan badge */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <PremiumSkeleton variant="title" className="w-32 h-8" />
          <PremiumSkeleton variant="text" className="w-72 h-4" />
        </div>
        <PremiumSkeleton className="h-7 w-20 rounded-full" />
      </div>
      
      {/* Plan Usage */}
      <PlanUsageSkeleton />
      
      {/* Portfolio Status */}
      <PortfolioStatusSkeleton />
      
      {/* Analytics Insights */}
      <AnalyticsInsightsSkeleton />
      
      {/* Quick Stats */}
      <QuickStatsGridSkeleton />
    </div>
  );
}
