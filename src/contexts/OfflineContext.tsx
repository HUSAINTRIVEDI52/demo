import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { toast } from 'sonner';

interface OfflineContextValue {
  isOffline: boolean;
  wasOffline: boolean;
  isReconnecting: boolean;
  retryConnection: () => Promise<void>;
  lastOnlineAt: Date | null;
}

const OfflineContext = createContext<OfflineContextValue | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const { isOnline } = useNetworkStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(null);
  const [previousOnlineState, setPreviousOnlineState] = useState(isOnline);

  // Track online/offline transitions
  useEffect(() => {
    if (isOnline && !previousOnlineState) {
      // Just came back online
      setWasOffline(true);
      toast.success('Connection restored', {
        description: 'Your data will sync automatically.',
        duration: 3000,
      });
      // Reset wasOffline flag after a delay
      const timeout = setTimeout(() => setWasOffline(false), 5000);
      return () => clearTimeout(timeout);
    } else if (!isOnline && previousOnlineState) {
      // Just went offline
      setLastOnlineAt(new Date());
      toast.warning('You\'re offline', {
        description: 'Showing cached data. Some features may be limited.',
        duration: 5000,
      });
    }
    setPreviousOnlineState(isOnline);
  }, [isOnline, previousOnlineState]);

  // Update lastOnlineAt when online
  useEffect(() => {
    if (isOnline) {
      setLastOnlineAt(new Date());
    }
  }, [isOnline]);

  const retryConnection = useCallback(async () => {
    setIsReconnecting(true);
    try {
      // Try to fetch a small resource to check connectivity
      const response = await fetch('/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-store' 
      });
      if (response.ok) {
        toast.success('Connection restored!');
      }
    } catch {
      toast.error('Still offline', {
        description: 'Please check your internet connection.',
      });
    } finally {
      setIsReconnecting(false);
    }
  }, []);

  return (
    <OfflineContext.Provider
      value={{
        isOffline: !isOnline,
        wasOffline,
        isReconnecting,
        retryConnection,
        lastOnlineAt,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}
