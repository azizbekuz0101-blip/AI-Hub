import { AIModel } from './types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTTL: number = 10 * 60 * 1000; // 10 minutes in milliseconds

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > this.defaultTTL;
    if (isExpired) {
      // Don't delete immediately so we can use as fallback if network fails
      return null;
    }

    return entry.data as T;
  }

  getExpiredFallback<T>(key: string): T | null {
    const entry = this.cache.get(key);
    return entry ? (entry.data as T) : null;
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

export const modelCache = new SimpleCache();
