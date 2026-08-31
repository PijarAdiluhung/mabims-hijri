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

function getMemoryStorage(): MemoryStorage {
  if (!memoryStorage) {
    memoryStorage = new MemoryStorage();
  }
  return memoryStorage;
}

export function createStorage(): StorageAdapter {
  if (typeof window !== 'undefined' && window.localStorage) {
    return new BrowserStorage();
  }
  
  return getMemoryStorage();
}
