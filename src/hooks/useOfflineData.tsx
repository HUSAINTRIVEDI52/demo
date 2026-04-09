import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useOffline } from '@/contexts/OfflineContext';
import { setCacheItem, getCacheItem, getCacheAge, isCacheExpired } from '@/lib/offlineStorage';

interface UseOfflineDataOptions<T> {
  queryKey: string[];
  data: T | undefined;
  isLoading: boolean;
  enabled?: boolean;
}

interface UseOfflineDataResult<T> {
  cachedData: T | undefined;
  cacheAge: number | null;
  isUsingCache: boolean;
  isCacheStale: boolean;
  refreshCache: () => void;
}

export function useOfflineData<T>({
  queryKey,
  data,
  isLoading,
  enabled = true,
}: UseOfflineDataOptions<T>): UseOfflineDataResult<T> {
  const { isOffline } = useOffline();
  const queryClient = useQueryClient();
  
  const cacheKey = queryKey.join('_');
  
  // Cache data when online and data is available
  useEffect(() => {
    if (enabled && !isOffline && data && !isLoading) {
      setCacheItem(cacheKey, data);
    }
  }, [cacheKey, data, isOffline, isLoading, enabled]);

  // Get cached data
  const getCachedData = useCallback((): T | undefined => {
    if (!enabled) return undefined;
    const cached = getCacheItem<T>(cacheKey);
    return cached?.data;
  }, [cacheKey, enabled]);

  const cacheAge = getCacheAge(cacheKey);
  const isUsingCache = isOffline && !data;
  const isCacheStale = isCacheExpired(cacheKey);
  
  // Return fresh data when online, cached data when offline
  const effectiveData = isOffline && !data ? getCachedData() : data;

  const refreshCache = useCallback(() => {
    if (!isOffline) {
      queryClient.invalidateQueries({ queryKey });
    }
  }, [isOffline, queryClient, queryKey]);

  return {
    cachedData: effectiveData,
    cacheAge: isUsingCache ? cacheAge : null,
    isUsingCache,
    isCacheStale: isUsingCache && isCacheStale,
    refreshCache,
  };
}

// Hook to sync React Query cache with localStorage for offline access
export function useQueryCacheSync() {
  const queryClient = useQueryClient();
  const { isOffline } = useOffline();

  useEffect(() => {
    if (isOffline) {
      // When going offline, we could restore from localStorage here if needed
      return;
    }

    // When coming back online, invalidate stale queries
    queryClient.invalidateQueries();
  }, [isOffline, queryClient]);
}
