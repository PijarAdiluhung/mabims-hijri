export interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): void;
  has(key: string): boolean;
}

class MemoryStorage implements StorageAdapter {
  private store = new Map<string, string>();

  get(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  set(key: string, value: string): void {
    this.store.set(key, value);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }
}

class BrowserStorage implements StorageAdapter {
  constructor(private prefix: string = 'mabims_') {}

  get(key: string): string | null {
    try {
      return localStorage.getItem(this.prefix + key);
    } catch {
      return null;
    }
  }

  set(key: string, value: string): void {
    try {
      localStorage.setItem(this.prefix + key, value);
    } catch {}
  }

  has(key: string): boolean {
    try {
      return localStorage.getItem(this.prefix + key) !== null;
    } catch {
      return false;
    }
  }
}

let memoryStorage: MemoryStorage | null = null;
let customStorage: StorageAdapter | null = null;

function getMemoryStorage(): MemoryStorage {
  if (!memoryStorage) {
    memoryStorage = new MemoryStorage();
  }
  return memoryStorage;
}

/**
 * Set a custom storage adapter for persistent caching.
 *
 * Useful for React Native (AsyncStorage), custom browser storage, or testing.
 * Must be called before any mabims-hijri functions are used.
 *
 * @param adapter - A StorageAdapter implementation
 *
 * @example
 * ```typescript
 * import { setStorageAdapter } from 'mabims-hijri';
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 *
 * class RNStorage implements StorageAdapter {
 *   private prefix = 'mabims_';
 *   get(key: string) { return AsyncStorage.getItem(this.prefix + key); }
 *   set(key: string, value: string) { return AsyncStorage.setItem(this.prefix + key, value); }
 *   has(key: string) { return AsyncStorage.getItem(this.prefix + key).then(v => v !== null); }
 * }
 *
 * setStorageAdapter(new RNStorage());
 * ```
 */
export function setStorageAdapter(adapter: StorageAdapter): void {
  customStorage = adapter;
}

/**
 * Reset to default storage (auto-detect environment).
 */
export function resetStorage(): void {
  customStorage = null;
  memoryStorage = null;
}

export function createStorage(): StorageAdapter {
  if (customStorage) {
    return customStorage;
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    return new BrowserStorage();
  }
  
  return getMemoryStorage();
}
