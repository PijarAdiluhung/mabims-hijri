import { MetaResponse } from './types';
import { fetchMeta } from './api';
import { createStorage, StorageAdapter } from './storage';
import bundledData from './data.json';

const STORAGE_KEY = 'table';
const VERSION_KEY = 'table_version';
const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

interface StoredTable {
  gregorian_to_hijri: Record<string, string>;
  hijri_to_gregorian: Record<string, string>;
  version: string;
  timestamp: number;
}

let storage: StorageAdapter | null = null;
let lastCheck = 0;

function getStorage(): StorageAdapter {
  if (!storage) {
    storage = createStorage();
  }
  return storage;
}

export function getStoredTable(): StoredTable | null {
  const store = getStorage();
  const raw = store.get(STORAGE_KEY);
  if (!raw) return null;
  
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getTable(): { gregorian_to_hijri: Record<string, string>; hijri_to_gregorian: Record<string, string> } {
  const stored = getStoredTable();
  
  if (stored) {
    return {
      gregorian_to_hijri: stored.gregorian_to_hijri,
      hijri_to_gregorian: stored.hijri_to_gregorian,
    };
  }
  
  return bundledData;
}

export async function checkForUpdate(force: boolean = false): Promise<boolean> {
  const now = Date.now();
  
  if (!force && now - lastCheck < CHECK_INTERVAL) {
    return false;
  }
  
  lastCheck = now;
  
  try {
    const meta = await fetchMeta();
    const store = getStorage();
    const currentVersion = store.get(VERSION_KEY);
    
    if ((meta as any).data_version === currentVersion) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

export async function updateTable(): Promise<boolean> {
  try {
    const meta = await fetchMeta();
    const store = getStorage();
    
    store.set(VERSION_KEY, (meta as any).data_version);
    
    return true;
  } catch {
    return false;
  }
}

export async function init(): Promise<void> {
  const needsUpdate = await checkForUpdate();
  if (needsUpdate) {
    await updateTable();
  }
}
