import { TodayResponse, MetaResponse } from './types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface CacheStore {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  has(key: string): boolean;
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
}

export function createCache(): CacheStore {
  if (typeof window !== 'undefined' && window.localStorage) {
    return new BrowserCache();
  }
  return new NodeCache();
}

export function isCacheValid(
  cache: CacheStore,
  key: string,
  maxAgeMs: number
): boolean {
  if (!cache.has(key)) return false;
  const entry = cache.get<CacheEntry<any>>(key);
  if (!entry || !entry.timestamp) return false;
  return Date.now() - entry.timestamp < maxAgeMs;
}
