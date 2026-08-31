import { EventsResponse, EventItem } from './types';
import { fetchEvents } from './api';
import { createCache } from './cache';

const cache = createCache();

function getCacheKey(year: number, calendar: string): string {
  return `events_${year}_${calendar}`;
}

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
