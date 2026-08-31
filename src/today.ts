import { TodayResponse } from './types';
import { fetchToday } from './api';
import { createCache } from './cache';
import { getBundledDate, isBundledDateAvailable } from './bundled';

const CACHE_KEY = 'today';
const cache = createCache();

function getTodayKey(date: Date, tz: string): string {
  return `${date.toISOString().split('T')[0]}_${tz}`;
}

function getLocalDate(tz: string): Date {
  const now = new Date();
  const formatted = now.toLocaleDateString('en-CA', { timeZone: tz });
  return new Date(formatted);
}

export async function today(
  options: { tz?: string; forceRefresh?: boolean } = {}
): Promise<TodayResponse> {
  const { tz = 'Asia/Jakarta', forceRefresh = false } = options;
  const localDate = getLocalDate(tz);
  const dateStr = localDate.toISOString().split('T')[0];
  const cacheKey = getTodayKey(localDate, tz);

  if (!forceRefresh && cache.has(cacheKey)) {
    const cached = cache.get<TodayResponse>(cacheKey);
    if (cached) {
      backgroundRefresh(tz).catch(() => {});
      return cached;
    }
  }

  if (isBundledDateAvailable(dateStr)) {
    const hijri = getBundledDate(dateStr);
    if (hijri) {
      const response: TodayResponse = {
        input: {
          date: dateStr,
          calendar: 'gregorian',
          tz,
        },
        output: hijri,
        source: 'mabims',
        warnings: [],
      };
      cache.set(cacheKey, response);
      backgroundRefresh(tz).catch(() => {});
      return response;
    }
  }

  try {
    const response = await fetchToday(tz);
    cache.set(cacheKey, response);
    return response;
  } catch (error) {
    if (cache.has(cacheKey)) {
      return cache.get<TodayResponse>(cacheKey)!;
    }
    throw error;
  }
}

async function backgroundRefresh(tz: string): Promise<void> {
  try {
    const response = await fetchToday(tz);
    const localDate = getLocalDate(tz);
    const cacheKey = getTodayKey(localDate, tz);
    cache.set(cacheKey, response);
  } catch {
    // Silently fail
  }
}
