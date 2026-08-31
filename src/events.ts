import { EventsResponse, EventItem } from './types';
import { fetchEvents } from './api';
import { createCache } from './cache';

const cache = createCache();

function getCacheKey(year: number, calendar: string): string {
  return `events_${year}_${calendar}`;
}

/**
 * Get Islamic events for a year.
 *
 * Returns major observances: Ramadan, Idul Fitri, Idul Adha, etc.
 *
 * @param year - Hijri or Gregorian year
 * @param calendar - Input calendar type ('hijri' or 'gregorian')
 * @param options - Configuration options
 * @param options.forceRefresh - Bypass cache (default: false)
 * @returns Events with both Hijri and Gregorian dates
 *
 * @example
 * ```typescript
 * import { events } from 'mabims-hijri';
 *
 * const evts = await events(1446, 'hijri');
 * console.log(evts.events);
 * // [
 * //   { event: 'awal_ramadan', name: 'Awal Ramadan', hijri: '1446-09-01', gregorian: '2025-03-01' },
 * //   { event: 'idul_fitri', name: 'Idul Fitri', hijri: '1446-10-01', gregorian: '2025-03-31' },
 * //   ...
 * // ]
 * ```
 */
export async function events(
  year: number,
  calendar: 'hijri' | 'gregorian' = 'hijri',
  options: { forceRefresh?: boolean } = {}
): Promise<EventsResponse> {
  const { forceRefresh = false } = options;
  const cacheKey = getCacheKey(year, calendar);

  if (!forceRefresh && cache.has(cacheKey)) {
    return cache.get<EventsResponse>(cacheKey)!;
  }

  const response = await fetchEvents(year, calendar);
  cache.set(cacheKey, response);
  return response;
}
