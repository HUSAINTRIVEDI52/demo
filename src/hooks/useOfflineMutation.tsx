// Offline-aware mutation wrapper that queues operations when offline
import { useCallback } from 'react';
import { useOffline } from '@/contexts/OfflineContext';
import { useSyncQueueContext } from '@/contexts/SyncQueueContext';
import { toast } from 'sonner';
import type { SyncOperation } from '@/lib/syncQueue';

interface OfflineMutationOptions<TData, TVariables> {
  table: string;
  operationType: SyncOperation['type'];
  primaryKey?: string;
  // Function to execute when online
  onlineMutationFn: (variables: TVariables) => Promise<TData>;
  // Function to build the data for offline queue
  buildQueueData: (variables: TVariables) => Record<string, unknown>;
  // Optional: callback for optimistic update
  onOptimisticUpdate?: (variables: TVariables) => void;
  // Optional: callback when queued offline
  onQueued?: (operationId: string, variables: TVariables) => void;
}

export function useOfflineMutation<TData, TVariables>(
  options: OfflineMutationOptions<TData, TVariables>
) {
  const { isOffline } = useOffline();
  const { queueOperation } = useSyncQueueContext();

  const mutate = useCallback(
    async (variables: TVariables): Promise<{ data?: TData; queued?: boolean; error?: string }> => {
      // Apply optimistic update regardless of online status
      options.onOptimisticUpdate?.(variables);

      if (isOffline) {
        // Queue the operation for later sync
        const queueData = options.buildQueueData(variables);
        const operationId = queueOperation(
          options.operationType,
          options.table,
          queueData,
          options.primaryKey
        );

        options.onQueued?.(operationId, variables);

        toast.info('Saved offline', {
          description: 'Your changes will sync when you\'re back online.',
          duration: 3000,
        });

        return { queued: true };
      }

      try {
        const data = await options.onlineMutationFn(variables);
        return { data };
      } catch (error) {
        // If online mutation fails due to network error, queue it
        if (error instanceof Error && error.message.includes('network')) {
          const queueData = options.buildQueueData(variables);
          const operationId = queueOperation(
            options.operationType,
            options.table,
            queueData,
            options.primaryKey
          );

          options.onQueued?.(operationId, variables);

          toast.info('Connection lost - saved offline', {
            description: 'Your changes will sync when connection is restored.',
            duration: 3000,
          });

          return { queued: true };
        }

        return { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },
    [isOffline, queueOperation, options]
  );

  return { mutate, isOffline };
}

// Helper to check if we should use offline mode
export function useIsOffline() {
  const { isOffline } = useOffline();
  return isOffline;
}
