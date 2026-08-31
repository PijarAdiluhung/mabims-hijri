import { ConvertResponse, HijriDate, GregorianDate } from './types';
import { fetchConvert } from './api';
import { getBundledDate, getBundledHijriDate, isBundledDateAvailable } from './bundled';
import { createCache } from './cache';

const cache = createCache();

function getCacheKey(date: string, calendar: string): string {
  return `convert_${date}_${calendar}`;
}

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
