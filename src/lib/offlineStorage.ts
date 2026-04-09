// Offline storage utilities for caching data locally

const CACHE_PREFIX = 'portfolio_cache_';
const CACHE_TIMESTAMP_SUFFIX = '_timestamp';
const DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export function setCacheItem<T>(key: string, data: T, duration = DEFAULT_CACHE_DURATION): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + duration,
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch (error) {
    console.warn('Failed to cache data:', error);
  }
}

export function getCacheItem<T>(key: string): CacheEntry<T> | null {
  try {
    const item = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!item) return null;

    const entry: CacheEntry<T> = JSON.parse(item);
    
    // Return cached data even if expired (for offline mode)
    return entry;
  } catch (error) {
    console.warn('Failed to retrieve cached data:', error);
    return null;
  }
}

export function isCacheValid(key: string): boolean {
  const entry = getCacheItem(key);
  if (!entry) return false;
  return Date.now() < entry.expiresAt;
}

export function isCacheExpired(key: string): boolean {
  const entry = getCacheItem(key);
  if (!entry) return true;
  return Date.now() >= entry.expiresAt;
}

export function clearCacheItem(key: string): void {
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch (error) {
    console.warn('Failed to clear cache item:', error);
  }
}

export function clearAllCache(): void {
  try {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(CACHE_PREFIX));
    keys.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Failed to clear all cache:', error);
  }
}

export function getCacheAge(key: string): number | null {
  const entry = getCacheItem(key);
  if (!entry) return null;
  return Date.now() - entry.timestamp;
}

// Format cache age for display
export function formatCacheAge(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}
