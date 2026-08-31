import { YearResponse, RangeItem } from './types';
import { month } from './month';
import { createCache } from './cache';

const cache = createCache();

function getCacheKey(year: number, calendar: string): string {
  return `year_${year}_${calendar}`;
}

/**
 * Get all days in a year with Hijri conversion.
 *
 * Returns 12 months of calendar data. Useful for building year-long calendar views.
 *
 * @param year - Gregorian year
 * @param calendar - Input calendar type ('gregorian' or 'hijri')
 * @param options - Configuration options
 * @param options.forceRefresh - Bypass cache (default: false)
 * @returns Year data with all 12 months
 *
 * @example
 * ```typescript
 * import { year } from 'mabims-hijri';
 *
 * const data = await year(2026);
 * console.log(data.count);  // 365
 * console.log(Object.keys(data.months));  // ['1', '2', ..., '12']
 * ```
 */
export async function year(
  year: number,
  calendar: 'gregorian' | 'hijri' = 'gregorian',
  options: { forceRefresh?: boolean } = {}
): Promise<YearResponse> {
  const { forceRefresh = false } = options;
  const cacheKey = getCacheKey(year, calendar);

  if (!forceRefresh && cache.has(cacheKey)) {
    return cache.get<YearResponse>(cacheKey)!;
  }

  const months: Record<number, RangeItem[]> = {};
  const allWarnings: string[] = [];

  for (let m = 1; m <= 12; m++) {
    const monthData = await month(year, m, calendar, options);
    months[m] = monthData.items;
    allWarnings.push(...monthData.warnings);
  }

  const result: YearResponse = {
    input: { year, calendar },
    count: Object.values(months).reduce((sum, items) => sum + items.length, 0),
    months,
    warnings: [...new Set(allWarnings)],
  };

  cache.set(cacheKey, result);
  return result;
}
