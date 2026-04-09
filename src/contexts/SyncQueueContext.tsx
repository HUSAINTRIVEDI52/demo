import React, { createContext, useContext } from 'react';
import { useSyncQueue } from '@/hooks/useSyncQueue';
import { SyncOperation, queueOperation } from '@/lib/syncQueue';

interface SyncQueueContextValue {
  pendingCount: number;
  failedCount: number;
  isSyncing: boolean;
  lastSyncAt: Date | null;
  queue: SyncOperation[];
  queueOperation: typeof queueOperation;
  syncNow: () => Promise<void>;
  clearQueue: () => void;
}

const SyncQueueContext = createContext<SyncQueueContextValue | undefined>(undefined);

export function SyncQueueProvider({ children }: { children: React.ReactNode }) {
  const syncQueue = useSyncQueue();

  return (
    <SyncQueueContext.Provider value={syncQueue}>
      {children}
    </SyncQueueContext.Provider>
  );
}

export function useSyncQueueContext() {
  const context = useContext(SyncQueueContext);
  if (!context) {
    throw new Error('useSyncQueueContext must be used within a SyncQueueProvider');
  }
  return context;
}
