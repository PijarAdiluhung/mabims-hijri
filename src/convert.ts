import { ConvertResponse, HijriDate, GregorianDate } from './types';
import { fetchConvert } from './api';
import { getBundledDate, getBundledHijriDate, isBundledDateAvailable } from './bundled';
import { createCache } from './cache';
import { weekdayOf } from './weekday';

const cache = createCache();

function getCacheKey(date: string, calendar: string): string {
  return `convert_${date}_${calendar}`;
}

/**
 * Convert a date between Gregorian and Hijri calendars.
 *
 * Uses bundled MABIMS data when available, falls back to API.
 *
 * @param date - ISO date string (YYYY-MM-DD)
 * @param calendar - Input calendar type ('gregorian' or 'hijri')
 * @param options - Configuration options
 * @param options.forceRefresh - Bypass cache (default: false)
 * @returns Converted date with metadata
 *
 * @example
 * ```typescript
 * import { convert } from 'mabims-hijri';
 *
 * // Gregorian → Hijri
 * const hijri = await convert('2026-08-31');
 * console.log(hijri.output);
 * // { date: '1448-03-18', calendar: 'hijri', month_name: 'Rabiul Awal', ... }
 *
 * // Hijri → Gregorian
 * const greg = await convert('1448-03-18', 'hijri');
 * console.log(greg.output);
 * // { date: '2026-08-31', calendar: 'gregorian' }
 * ```
 */
export async function convert(
  date: string,
  calendar: 'gregorian' | 'hijri' = 'gregorian',
  options: { forceRefresh?: boolean } = {}
): Promise<ConvertResponse> {
  const { forceRefresh = false } = options;
  const cacheKey = getCacheKey(date, calendar);

  if (!forceRefresh && cache.has(cacheKey)) {
    return cache.get<ConvertResponse>(cacheKey)!;
  }

  if (isBundledDateAvailable(date, calendar)) {
    let result: ConvertResponse;

    if (calendar === 'gregorian') {
      const hijri = getBundledDate(date);
      if (hijri) {
        result = {
          input: { date, calendar: 'gregorian', tz: null },
          output: hijri,
          source: 'mabims',
          warnings: [],
        };
      } else {
        throw new Error(`Date ${date} not found in bundled data`);
      }
    } else {
      const gregorian = getBundledHijriDate(date);
      if (gregorian) {
        const parts = gregorian.date.split('-');
        result = {
          input: { date, calendar: 'hijri', tz: null },
          output: {
            date: gregorian.date,
            calendar: 'gregorian',
            day: parseInt(parts[2]),
            month: parseInt(parts[1]),
            month_name: '',
            year: parseInt(parts[0]),
            weekday: weekdayOf(gregorian.date),
          },
          source: 'mabims',
          warnings: [],
        };
      } else {
        throw new Error(`Hijri date ${date} not found in bundled data`);
      }
    }

    cache.set(cacheKey, result);
    return result;
  }

  const response = await fetchConvert(date, calendar);
  cache.set(cacheKey, response);
  return response;
}
