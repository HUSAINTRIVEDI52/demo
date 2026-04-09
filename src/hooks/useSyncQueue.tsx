import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNetworkStatus } from './useNetworkStatus';
import { 
  getSyncQueue, 
  processSyncQueue, 
  getQueueStats,
  queueOperation,
  clearSyncQueue,
  SyncOperation
} from '@/lib/syncQueue';
import { toast } from 'sonner';

interface UseSyncQueueResult {
  pendingCount: number;
  failedCount: number;
  isSyncing: boolean;
  lastSyncAt: Date | null;
  queue: SyncOperation[];
  queueOperation: typeof queueOperation;
  syncNow: () => Promise<void>;
  clearQueue: () => void;
}

export function useSyncQueue(): UseSyncQueueResult {
  const { isOnline } = useNetworkStatus();
  const queryClient = useQueryClient();
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const [queue, setQueue] = useState<SyncOperation[]>([]);
  const previousOnlineState = useRef(isOnline);
  const syncInProgress = useRef(false);

  // Update queue stats
  const refreshStats = useCallback(() => {
    const stats = getQueueStats();
    setPendingCount(stats.pending);
    setFailedCount(stats.failed);
    setQueue(getSyncQueue());
  }, []);

  // Process the sync queue
  const syncNow = useCallback(async () => {
    if (syncInProgress.current || !isOnline) return;
    
    syncInProgress.current = true;
    setIsSyncing(true);

    try {
      const result = await processSyncQueue();
      setLastSyncAt(new Date());
      
      if (result.processed > 0) {
        // Invalidate all relevant queries to refresh data after sync
        await queryClient.invalidateQueries({ queryKey: ['projects'] });
        await queryClient.invalidateQueries({ queryKey: ['skills'] });
        await queryClient.invalidateQueries({ queryKey: ['experiences'] });
        await queryClient.invalidateQueries({ queryKey: ['certifications'] });
        await queryClient.invalidateQueries({ queryKey: ['custom_sections'] });
        
        toast.success(`Synced ${result.processed} change${result.processed > 1 ? 's' : ''}`, {
          description: result.failed > 0 
            ? `${result.failed} failed, will retry later.`
            : undefined,
          duration: 3000,
        });
      }
      
      if (result.failed > 0 && result.processed === 0) {
        toast.error('Sync failed', {
          description: `${result.failed} operation${result.failed > 1 ? 's' : ''} could not be synced.`,
          duration: 4000,
        });
      }

      refreshStats();
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
      syncInProgress.current = false;
    }
  }, [isOnline, refreshStats, queryClient]);

  // Clear the queue
  const clearQueue = useCallback(() => {
    clearSyncQueue();
    refreshStats();
    toast.info('Sync queue cleared');
  }, [refreshStats]);

  // Refresh stats on mount and when storage changes
  useEffect(() => {
    refreshStats();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'portfolio_sync_queue') {
        refreshStats();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshStats]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && !previousOnlineState.current) {
      // Just came back online
      const stats = getQueueStats();
      if (stats.pending > 0) {
        toast.info(`${stats.pending} pending change${stats.pending > 1 ? 's' : ''} to sync`, {
          description: 'Syncing now...',
          duration: 2000,
        });
        syncNow();
      }
    }
    previousOnlineState.current = isOnline;
  }, [isOnline, syncNow]);

  // Periodic sync attempt when online with pending items
  useEffect(() => {
    if (!isOnline || pendingCount === 0) return;

    const interval = setInterval(() => {
      if (pendingCount > 0 && !isSyncing) {
        syncNow();
      }
    }, 30000); // Try every 30 seconds

    return () => clearInterval(interval);
  }, [isOnline, pendingCount, isSyncing, syncNow]);

  return {
    pendingCount,
    failedCount,
    isSyncing,
    lastSyncAt,
    queue,
    queueOperation,
    syncNow,
    clearQueue,
  };
}
