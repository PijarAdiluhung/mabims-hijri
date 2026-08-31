interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface CacheStore {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  has(key: string): boolean;
  getTimestamp(key: string): number | null;
  clear(): void;
}

class NodeCache implements CacheStore {
  private store = new Map<string, CacheEntry<any>>();
  
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    return entry.data as T;
  }
  
  set<T>(key: string, value: T): void {
    this.store.set(key, {
      data: value,
      timestamp: Date.now(),
    });
  }
  
  has(key: string): boolean {
    return this.store.has(key);
  }
  
  getTimestamp(key: string): number | null {
    const entry = this.store.get(key);
    return entry?.timestamp ?? null;
  }
  
  clear(): void {
    this.store.clear();
  }
}

class BrowserCache implements CacheStore {
  constructor(private prefix: string = 'mabims_') {}
  
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;
      const entry: CacheEntry<T> = JSON.parse(item);
      return entry.data;
    } catch {
      return null;
    }
  }
  
  set<T>(key: string, value: T): void {
    try {
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch {
      // localStorage might be full or disabled
    }
  }
  
  has(key: string): boolean {
    return localStorage.getItem(this.prefix + key) !== null;
  }
  
  getTimestamp(key: string): number | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;
      const entry: CacheEntry<any> = JSON.parse(item);
      return entry.timestamp ?? null;
    } catch {
      return null;
    }
  }
  
  clear(): void {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this.prefix));
    keys.forEach(k => localStorage.removeItem(k));
  }
}

/** Default cache TTL: 24 hours */
const DEFAULT_TTL = 24 * 60 * 60 * 1000;

/** Global cache TTL setting */
let cacheTTL = DEFAULT_TTL;

/**
 * Set the cache TTL (time-to-live) for all cached data.
 *
 * @param ttlMs - TTL in milliseconds (default: 24 hours)
 *
 * @example
 * ```typescript
 * import { setCacheTTL } from 'mabims-hijri';
 *
 * // Set cache to 1 hour
 * setCacheTTL(60 * 60 * 1000);
 *
 * // Set cache to 7 days
 * setCacheTTL(7 * 24 * 60 * 60 * 1000);
 * ```
 */
export function setCacheTTL(ttlMs: number): void {
  cacheTTL = ttlMs;
}

/**
 * Get the current cache TTL.
 *
 * @returns Current TTL in milliseconds
 */
export function getCacheTTL(): number {
  return cacheTTL;
}

/**
 * Create a new cache store.
 *
 * @returns Cache store instance
 */
export function createCache(): CacheStore {
  if (typeof window !== 'undefined' && window.localStorage) {
    return new BrowserCache();
  }
  return new NodeCache();
}

/**
 * Check if a cache entry is valid (not expired).
 *
 * @param cache - Cache store instance
 * @param key - Cache key
 * @param maxAgeMs - Maximum age in milliseconds (uses global TTL if not specified)
 * @returns True if entry exists and is not expired
 */
export function isCacheValid(
  cache: CacheStore,
  key: string,
  maxAgeMs: number = cacheTTL
): boolean {
  if (!cache.has(key)) return false;
  const timestamp = cache.getTimestamp(key);
  if (timestamp === null) return false;
  return Date.now() - timestamp < maxAgeMs;
}
