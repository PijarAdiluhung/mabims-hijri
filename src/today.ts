import { TodayResponse } from './types';
import { fetchToday, fetchMeta } from './api';
import { createCache, isCacheValid } from './cache';

const CACHE_KEY = 'today';
const META_CACHE_KEY = 'meta';
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

const cache = createCache();

function getTodayKey(date: Date, tz: string): string {
  return `${date.toISOString().split('T')[0]}_${tz}`;
}

export async function today(
  options: { tz?: string; forceRefresh?: boolean } = {}
): Promise<TodayResponse> {
  const { tz = 'Asia/Jakarta', forceRefresh = false } = options;
  const now = new Date();
  const cacheKey = getTodayKey(now, tz);

  if (!forceRefresh && cache.has(cacheKey)) {
    const cached = cache.get<TodayResponse>(cacheKey);
    if (cached) {
      // Trigger background refresh
      backgroundRefresh(tz).catch(() => {});
      return cached;
    }
  }

  try {
    const response = await fetchToday(tz);
    cache.set(cacheKey, response);
    return response;
  } catch (error) {
    // If we have any cached data for today, use it
    if (cache.has(cacheKey)) {
      return cache.get<TodayResponse>(cacheKey)!;
    }
    throw error;
  }
}

async function backgroundRefresh(tz: string): Promise<void> {
  try {
    const response = await fetchToday(tz);
    const now = new Date();
    const cacheKey = getTodayKey(now, tz);
    cache.set(cacheKey, response);
  } catch {
    // Silently fail - we already have valid data
  }
}

export async function shouldRefreshData(): Promise<boolean> {
  try {
    const meta = await fetchMeta();
    cache.set(META_CACHE_KEY, meta);
    
    const cachedMeta = cache.get<any>(META_CACHE_KEY);
    if (!cachedMeta) return true;
    
    // Check if we have newer data available
    return meta.table_version !== cachedMeta.table_version;
  } catch {
    return false;
  }
}
