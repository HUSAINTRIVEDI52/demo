import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface SyncStatusIndicatorProps {
  isOnline: boolean;
  pendingCount: number;
  failedCount: number;
  isSyncing: boolean;
  lastSyncAt: Date | null;
  onSync: () => void;
  className?: string;
}

export function SyncStatusIndicator({
  isOnline,
  pendingCount,
  failedCount,
  isSyncing,
  lastSyncAt,
  onSync,
  className,
}: SyncStatusIndicatorProps) {
  // Determine status
  const getStatus = () => {
    if (!isOnline) return 'offline';
    if (isSyncing) return 'syncing';
    if (failedCount > 0) return 'error';
    if (pendingCount > 0) return 'pending';
    return 'synced';
  };

  const status = getStatus();

  const statusConfig = {
    offline: {
      icon: CloudOff,
      label: 'Offline',
      description: pendingCount > 0 
        ? `${pendingCount} change${pendingCount > 1 ? 's' : ''} will sync when online`
        : 'Changes will be saved locally',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
    },
    syncing: {
      icon: Loader2,
      label: 'Syncing...',
      description: 'Uploading your changes',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    pending: {
      icon: Cloud,
      label: 'Pending',
      description: `${pendingCount} change${pendingCount > 1 ? 's' : ''} waiting to sync`,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
    },
    error: {
      icon: AlertCircle,
      label: 'Sync Error',
      description: `${failedCount} change${failedCount > 1 ? 's' : ''} failed to sync`,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/30',
    },
    synced: {
      icon: Check,
      label: 'Synced',
      description: lastSyncAt 
        ? `Last synced ${formatDistanceToNow(lastSyncAt, { addSuffix: true })}`
        : 'All changes saved',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      borderColor: 'border-accent/30',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  // Only show when there's something notable
  if (status === 'synced' && pendingCount === 0 && failedCount === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              config.bgColor,
              config.borderColor,
              config.color,
              className
            )}
          >
            <Icon className={cn(
              'h-3.5 w-3.5',
              isSyncing && 'animate-spin'
            )} />
            <span className="hidden sm:inline">{config.label}</span>
            {pendingCount > 0 && status !== 'syncing' && (
              <span className="bg-current/20 px-1.5 py-0.5 rounded-full text-[10px]">
                {pendingCount}
              </span>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">{config.label}</p>
            <p className="text-xs text-muted-foreground">{config.description}</p>
            {isOnline && (pendingCount > 0 || failedCount > 0) && !isSyncing && (
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2"
                onClick={onSync}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Sync Now
              </Button>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Compact version for headers
interface CompactSyncIndicatorProps {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  className?: string;
}

export function CompactSyncIndicator({
  isOnline,
  pendingCount,
  isSyncing,
  className,
}: CompactSyncIndicatorProps) {
  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: 'auto' }}
        exit={{ opacity: 0, width: 0 }}
        className={cn(
          'flex items-center gap-1.5 text-xs',
          !isOnline ? 'text-accent' : 'text-muted-foreground',
          className
        )}
      >
        {isSyncing ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="hidden sm:inline">Syncing...</span>
          </>
        ) : !isOnline ? (
          <>
            <CloudOff className="h-3 w-3" />
            {pendingCount > 0 && (
              <span className="hidden sm:inline">
                {pendingCount} pending
              </span>
            )}
          </>
        ) : pendingCount > 0 ? (
          <>
            <Cloud className="h-3 w-3" />
            <span className="hidden sm:inline">
              {pendingCount} to sync
            </span>
          </>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
