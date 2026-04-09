// Offline sync queue for saving pending changes and auto-syncing when online

import { supabase } from '@/integrations/supabase/client';

export interface SyncOperation {
  id: string;
  type: 'insert' | 'update' | 'delete';
  table: string;
  data: Record<string, unknown>;
  primaryKey?: string;
  timestamp: number;
  retryCount: number;
  error?: string;
}

const SYNC_QUEUE_KEY = 'portfolio_sync_queue';
const MAX_RETRIES = 3;

// Get all pending operations from the queue
export function getSyncQueue(): SyncOperation[] {
  try {
    const stored = localStorage.getItem(SYNC_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save the queue to localStorage
function saveSyncQueue(queue: SyncOperation[]): void {
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to save sync queue:', error);
  }
}

// Generate a unique ID for operations
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Add an operation to the sync queue
export function queueOperation(
  type: SyncOperation['type'],
  table: string,
  data: Record<string, unknown>,
  primaryKey?: string
): string {
  const operation: SyncOperation = {
    id: generateId(),
    type,
    table,
    data,
    primaryKey,
    timestamp: Date.now(),
    retryCount: 0,
  };

  const queue = getSyncQueue();
  queue.push(operation);
  saveSyncQueue(queue);

  return operation.id;
}

// Remove an operation from the queue
export function removeOperation(id: string): void {
  const queue = getSyncQueue().filter(op => op.id !== id);
  saveSyncQueue(queue);
}

// Update operation with error
export function markOperationFailed(id: string, error: string): void {
  const queue = getSyncQueue().map(op => {
    if (op.id === id) {
      return { ...op, error, retryCount: op.retryCount + 1 };
    }
    return op;
  });
  saveSyncQueue(queue);
}

// Clear failed operations that exceeded max retries
export function clearFailedOperations(): void {
  const queue = getSyncQueue().filter(op => op.retryCount < MAX_RETRIES);
  saveSyncQueue(queue);
}

// Execute a single sync operation
async function executeOperation(operation: SyncOperation): Promise<{ success: boolean; error?: string }> {
  try {
    const { type, table, data, primaryKey } = operation;

    switch (type) {
      case 'insert': {
        const { error } = await supabase.from(table as any).insert(data as any);
        if (error) throw error;
        break;
      }
      case 'update': {
        if (!primaryKey || !data.id) {
          throw new Error('Update requires primaryKey and id');
        }
        const { error } = await supabase
          .from(table as any)
          .update(data as any)
          .eq(primaryKey, data.id);
        if (error) throw error;
        break;
      }
      case 'delete': {
        if (!primaryKey || !data.id) {
          throw new Error('Delete requires primaryKey and id');
        }
        const { error } = await supabase
          .from(table as any)
          .delete()
          .eq(primaryKey, data.id);
        if (error) throw error;
        break;
      }
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Process all pending operations in the queue
export async function processSyncQueue(): Promise<{
  processed: number;
  failed: number;
  remaining: number;
}> {
  const queue = getSyncQueue();
  let processed = 0;
  let failed = 0;

  for (const operation of queue) {
    if (operation.retryCount >= MAX_RETRIES) {
      continue;
    }

    const result = await executeOperation(operation);
    
    if (result.success) {
      removeOperation(operation.id);
      processed++;
    } else {
      markOperationFailed(operation.id, result.error || 'Unknown error');
      failed++;
    }
  }

  const remaining = getSyncQueue().length;

  return { processed, failed, remaining };
}

// Get queue statistics
export function getQueueStats(): {
  pending: number;
  failed: number;
  oldestTimestamp: number | null;
} {
  const queue = getSyncQueue();
  const pending = queue.filter(op => op.retryCount < MAX_RETRIES).length;
  const failed = queue.filter(op => op.retryCount >= MAX_RETRIES).length;
  const oldestTimestamp = queue.length > 0 
    ? Math.min(...queue.map(op => op.timestamp)) 
    : null;

  return { pending, failed, oldestTimestamp };
}

// Clear all operations from the queue
export function clearSyncQueue(): void {
  localStorage.removeItem(SYNC_QUEUE_KEY);
}
