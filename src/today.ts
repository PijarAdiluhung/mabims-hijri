import { TodayResponse, NextDate } from './types';
import { fetchToday } from './api';
import { createCache } from './cache';
import { getBundledDate, isBundledDateAvailable } from './bundled';
import { init } from './table';

const cache = createCache();
let initialized = false;

function getTodayKey(date: Date, tz: string, next: boolean): string {
  return `${date.toISOString().split('T')[0]}_${tz}${next ? '_next' : ''}`;
}

function getLocalDate(tz: string): Date {
  const now = new Date();
  const formatted = now.toLocaleDateString('en-CA', { timeZone: tz });
  return new Date(formatted);
}

function getNextGregorianDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().split('T')[0];
}

function getBundledNext(dateStr: string): NextDate | null {
  const tomorrow = getNextGregorianDate(dateStr);
  if (!isBundledDateAvailable(tomorrow, 'gregorian')) {
    return null;
  }
  const hijri = getBundledDate(tomorrow);
  return hijri ? { ...hijri, source: 'mabims' } : null;
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
 * @param options.next - Also return `next`: the Hijri date that begins after this
 *   evening's maghrib (the next civil day's mapping). The SDK does not compute
 *   sunset — gate the flip on your own maghrib-time clock (default: false)
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
 *
 * // Also get the date that begins after maghrib
 * const withNext = await today({ next: true });
 * console.log(withNext.next?.date); // '1448-03-19'
 * ```
 */
export async function today(
  options: { tz?: string; forceRefresh?: boolean; next?: boolean } = {}
): Promise<TodayResponse> {
  const { tz = 'Asia/Jakarta', forceRefresh = false, next = false } = options;
  
  await ensureInit();
  
  const localDate = getLocalDate(tz);
  const dateStr = localDate.toISOString().split('T')[0];
  const cacheKey = getTodayKey(localDate, tz, next);

  if (!forceRefresh && cache.has(cacheKey)) {
    const cached = cache.get<TodayResponse>(cacheKey);
    if (cached) {
      backgroundRefresh(tz, next).catch(() => {});
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
      if (next) {
        const bundledNext = getBundledNext(dateStr);
        if (bundledNext) {
          response.next = bundledNext;
        } else {
          // Tomorrow is outside the bundled table — try the API; omit offline.
          try {
            const apiResponse = await fetchToday(tz, true);
            if (apiResponse.next) {
              response.next = apiResponse.next;
            }
          } catch {
            // Offline-first: leave `next` absent rather than fail.
          }
        }
      }
      cache.set(cacheKey, response);
      backgroundRefresh(tz, next).catch(() => {});
      return response;
    }
  }

  try {
    const response = await fetchToday(tz, next);
    cache.set(cacheKey, response);
    return response;
  } catch (error) {
    if (cache.has(cacheKey)) {
      return cache.get<TodayResponse>(cacheKey)!;
    }
    throw error;
  }
}

async function backgroundRefresh(tz: string, next: boolean): Promise<void> {
  try {
    const response = await fetchToday(tz, next);
    const localDate = getLocalDate(tz);
    const cacheKey = getTodayKey(localDate, tz, next);
    cache.set(cacheKey, response);
  } catch {
    // Silently fail
  }
}
