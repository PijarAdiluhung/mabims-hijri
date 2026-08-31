import { TodayResponse } from './types';
import { fetchToday } from './api';
import { createCache } from './cache';
import { getBundledDate, isBundledDateAvailable } from './bundled';
import { init } from './table';

const CACHE_KEY = 'today';
const cache = createCache();
let initialized = false;

function getTodayKey(date: Date, tz: string): string {
  return `${date.toISOString().split('T')[0]}_${tz}`;
}

function getLocalDate(tz: string): Date {
  const now = new Date();
  const formatted = now.toLocaleDateString('en-CA', { timeZone: tz });
  return new Date(formatted);
}

async function ensureInit(): Promise<void> {
  if (!initialized) {
    initialized = true;
    await init();
  }
}

/**
 * Get today's Hijri date based on timezone.
 *
 * Works offline using bundled MABIMS data (2024–2026).
 * Falls back to API for dates outside bundled range.
 *
 * @param options - Configuration options
 * @param options.tz - IANA timezone (default: 'Asia/Jakarta')
 * @param options.forceRefresh - Bypass cache and fetch from API (default: false)
 * @returns Today's Hijri date with metadata
 *
 * @example
 * ```typescript
 * import { today } from 'mabims-hijri';
 *
 * const date = await today();
 * console.log(date.output);
 * // { date: '1448-03-18', calendar: 'hijri', month_name: 'Rabiul Awal', ... }
 *
 * // Custom timezone
 * const kl = await today({ tz: 'Asia/Kuala_Lumpur' });
 * ```
 */
export async function today(
  options: { tz?: string; forceRefresh?: boolean } = {}
): Promise<TodayResponse> {
  const { tz = 'Asia/Jakarta', forceRefresh = false } = options;
  
  await ensureInit();
  
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

  if (isBundledDateAvailable(dateStr, 'gregorian')) {
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
