import { RangeResponse, DateItem } from './types';
import { getBundledDate, getBundledHijriDate, isBundledDateAvailable, getBundledRange } from './bundled';
import { createCache } from './cache';

const cache = createCache();
const MAX_RANGE_DAYS = 45;

function getCacheKey(start: string, end: string, calendar: string): string {
  return `range_${start}_${end}_${calendar}`;
}

function getDaysInRange(start: string, end: string): string[] {
  const days: string[] = [];
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  while (startDate <= endDate) {
    days.push(startDate.toISOString().split('T')[0]);
    startDate.setDate(startDate.getDate() + 1);
  }
  
  return days;
}

function getHijriDaysInRange(start: string, end: string): string[] {
  const days: string[] = [];
  const [startY, startM, startD] = start.split('-').map(Number);
  const [endY, endM, endD] = end.split('-').map(Number);
  
  let currentYear = startY;
  let currentMonth = startM;
  let currentDay = startD;
  
  while (
    currentYear < endY ||
    (currentYear === endY && currentMonth < endM) ||
    (currentYear === endY && currentMonth === endM && currentDay <= endD)
  ) {
    days.push(`${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`);
    
    currentDay++;
    if (currentDay > 30) {
      currentDay = 1;
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }
  }
  
  return days;
}

export async function range(
  start: string,
  end: string,
  calendar: 'gregorian' | 'hijri' = 'gregorian',
  options: { forceRefresh?: boolean } = {}
): Promise<RangeResponse> {
  const { forceRefresh = false } = options;
  const cacheKey = getCacheKey(start, end, calendar);

  if (!forceRefresh && cache.has(cacheKey)) {
    return cache.get<RangeResponse>(cacheKey)!;
  }

  if (calendar === 'gregorian') {
    const days = getDaysInRange(start, end);
    if (days.length > MAX_RANGE_DAYS) {
      throw new Error(`Range is limited to ${MAX_RANGE_DAYS} days`);
    }

    const allInRange = days.every(d => isBundledDateAvailable(d, 'gregorian'));
    
    if (allInRange) {
      const items: DateItem[] = days.map(day => {
        const hijri = getBundledDate(day);
        return {
          input: day,
          output: hijri!.date,
          calendar: 'hijri',
          day: hijri!.day,
          month: hijri!.month,
          month_name: hijri!.month_name,
          year: hijri!.year,
        };
      });

      const result: RangeResponse = {
        input: { start, end, calendar: 'gregorian' },
        count: items.length,
        items,
        warnings: [],
      };

      cache.set(cacheKey, result);
      return result;
    }
  }

  if (calendar === 'hijri') {
    const days = getHijriDaysInRange(start, end);
    const allInRange = days.every(d => isBundledDateAvailable(d, 'hijri'));
    
    if (allInRange) {
      const items: DateItem[] = days.map(day => {
        const gregorian = getBundledHijriDate(day);
        const [y, m, d] = day.split('-').map(Number);
        return {
          input: day,
          output: gregorian!.date,
          calendar: 'gregorian',
          day: d,
          month: m,
          month_name: '',
          year: y,
        };
      });

      const result: RangeResponse = {
        input: { start, end, calendar: 'hijri' },
        count: items.length,
        items,
        warnings: [],
      };

      cache.set(cacheKey, result);
      return result;
    }
  }

  // Fallback to API for out-of-range dates
  const { fetchRange } = await import('./api');
  const response = await fetchRange(start, end, calendar);
  cache.set(cacheKey, response);
  return response;
}
