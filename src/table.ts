import { fetchMeta, fetchTable } from './api';
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
let currentTable: StoredTable | null = null;

function getStorage(): StorageAdapter {
  if (!storage) {
    storage = createStorage();
  }
  return storage;
}

/**
 * Get the stored table from local storage.
 *
 * @returns Stored table or null if not available
 */
export function getStoredTable(): StoredTable | null {
  if (currentTable) return currentTable;
  
  const store = getStorage();
  const raw = store.get(STORAGE_KEY);
  if (!raw) return null;
  
  try {
    currentTable = JSON.parse(raw);
    return currentTable;
  } catch {
    return null;
  }
}

/**
 * Get the current calendar table (stored or bundled).
 *
 * @returns Calendar data with both Gregorian-Hijri mappings
 */
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

/**
 * Check if a newer table version is available from the API.
 *
 * @param force - Force check even if recently checked
 * @returns True if update is available
 */
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

/**
 * Fetch and store the latest table from the API.
 *
 * @returns True if update was successful
 */
export async function updateTable(): Promise<boolean> {
  try {
    const tableData = await fetchTable();
    const store = getStorage();
    
    const newTable: StoredTable = {
      gregorian_to_hijri: tableData.gregorian_to_hijri,
      hijri_to_gregorian: tableData.hijri_to_gregorian,
      version: tableData.version,
      timestamp: Date.now(),
    };
    
    store.set(STORAGE_KEY, JSON.stringify(newTable));
    store.set(VERSION_KEY, tableData.version);
    currentTable = newTable;
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Initialize the table system.
 *
 * Checks for updates and fetches new data if available.
 */
export async function init(): Promise<void> {
  const needsUpdate = await checkForUpdate();
  if (needsUpdate) {
    await updateTable();
  }
}
