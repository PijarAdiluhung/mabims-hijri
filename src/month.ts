import { MonthResponse, RangeItem } from './types';
import { getBundledDate, isBundledDateAvailable } from './bundled';
import { createCache } from './cache';

const cache = createCache();

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getCacheKey(year: number, month: number, calendar: string): string {
  return `month_${year}_${month}_${calendar}`;
}

/**
 * Get all days in a month with Hijri conversion.
 *
 * Returns a calendar grid suitable for building UIs.
 *
 * @param year - Gregorian year
 * @param month - Gregorian month (1-12)
 * @param calendar - Input calendar type ('gregorian' or 'hijri')
 * @param options - Configuration options
 * @param options.forceRefresh - Bypass cache (default: false)
 * @returns Month data with all days converted
 *
 * @example
 * ```typescript
 * import { month } from 'mabims-hijri';
 *
 * const august = await month(2026, 8);
 * console.log(august.count);  // 31
 * console.log(august.items[0]);
 * // { gregorian: '2026-08-01', hijri: '1448-02-18', source: 'mabims' }
 * ```
 */
export async function month(
  year: number,
  month: number,
  calendar: 'gregorian' | 'hijri' = 'gregorian',
  options: { forceRefresh?: boolean } = {}
): Promise<MonthResponse> {
  const { forceRefresh = false } = options;
  const cacheKey = getCacheKey(year, month, calendar);

  if (!forceRefresh && cache.has(cacheKey)) {
    return cache.get<MonthResponse>(cacheKey)!;
  }

  if (calendar === 'gregorian') {
    const daysInMonth = getDaysInMonth(year, month);
    const days: string[] = [];
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push(dateStr);
    }

    const allInRange = days.every(d => isBundledDateAvailable(d, 'gregorian'));
    
    if (allInRange) {
      const items: RangeItem[] = days.map(day => {
        const hijri = getBundledDate(day);
        return {
          gregorian: day,
          hijri: hijri!.date,
          source: 'mabims' as const,
        };
      });

      const result: MonthResponse = {
        input: { year, month, calendar: 'gregorian' },
        count: items.length,
        items,
        warnings: [],
      };

      cache.set(cacheKey, result);
      return result;
    }
  }

  // Fallback to API
  const { fetchMonth } = await import('./api');
  const response = await fetchMonth(year, month, calendar);
  cache.set(cacheKey, response);
  return response;
}
