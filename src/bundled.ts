import { HijriDate, GregorianDate } from './types';
import { getTable } from './table';
import { weekdayOf } from './weekday';

const MONTH_NAMES = [
  'Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir',
  'Jumadil Awal', 'Jumadil Akhir', 'Rajab', "Sya'ban",
  'Ramadhan', 'Syawal', "Dzulqa'dah", 'Dzulhijjah'
];

function parseHijri(hijriStr: string, gregorianIso: string): HijriDate {
  const [year, month, day] = hijriStr.split('-').map(Number);
  return {
    date: hijriStr,
    calendar: 'hijri',
    day,
    month,
    month_name: MONTH_NAMES[month - 1] || '',
    year,
    weekday: weekdayOf(gregorianIso),
  };
}

function parseGregorian(gregStr: string): GregorianDate {
  const [year, month, day] = gregStr.split('-').map(Number);
  return {
    date: gregStr,
    calendar: 'gregorian',
    day,
    month,
    month_name: '',
    year,
    weekday: weekdayOf(gregStr),
  };
}

/**
 * Look up a Gregorian date in the bundled MABIMS table.
 *
 * @param gregorianDate - Gregorian date (YYYY-MM-DD)
 * @returns Hijri date or null if outside bundled range
 *
 * @example
 * ```typescript
 * import { getBundledDate } from 'mabims-hijri';
 *
 * const hijri = getBundledDate('2026-08-31');
 * // { date: '1448-03-18', month_name: 'Rabiul Awal', ... }
 *
 * const missing = getBundledDate('2030-01-01');
 * // null
 * ```
 */
export function getBundledDate(gregorianDate: string): HijriDate | null {
  const table = getTable();
  const hijriStr = table.gregorian_to_hijri[gregorianDate];
  if (!hijriStr) return null;
  return parseHijri(hijriStr, gregorianDate);
}

/**
 * Look up a Hijri date in the bundled MABIMS table.
 *
 * @param hijriDate - Hijri date (YYYY-MM-DD)
 * @returns Gregorian date or null if outside bundled range
 *
 * @example
 * ```typescript
 * import { getBundledHijriDate } from 'mabims-hijri';
 *
 * const greg = getBundledHijriDate('1448-03-18');
 * // { date: '2026-08-31', calendar: 'gregorian' }
 * ```
 */
export function getBundledHijriDate(hijriDate: string): GregorianDate | null {
  const table = getTable();
  const gregStr = table.hijri_to_gregorian[hijriDate];
  if (!gregStr) return null;
  return parseGregorian(gregStr);
}

/**
 * Check if a date is available in the bundled MABIMS table.
 *
 * @param date - Date string (YYYY-MM-DD)
 * @param calendar - Calendar type ('gregorian' or 'hijri')
 * @returns True if date is in bundled data
 *
 * @example
 * ```typescript
 * import { isBundledDateAvailable } from 'mabims-hijri';
 *
 * isBundledDateAvailable('2026-08-31', 'gregorian');  // true
 * isBundledDateAvailable('2030-01-01', 'gregorian');  // false
 * ```
 */
export function isBundledDateAvailable(date: string, calendar: 'gregorian' | 'hijri'): boolean {
  const table = getTable();
  if (calendar === 'gregorian') {
    return date in table.gregorian_to_hijri;
  }
  return date in table.hijri_to_gregorian;
}

/**
 * Get the Gregorian date range covered by bundled data.
 *
 * @returns Object with start and end dates
 *
 * @example
 * ```typescript
 * import { getBundledRange } from 'mabims-hijri';
 *
 * getBundledRange();
 * // { start: '2024-01-13', end: '2026-12-31' }
 * ```
 */
export function getBundledRange(): { start: string; end: string } {
  const table = getTable();
  const dates = Object.keys(table.gregorian_to_hijri).sort();
  return {
    start: dates[0],
    end: dates[dates.length - 1],
  };
}

/**
 * Get the Hijri date range covered by bundled data.
 *
 * @returns Object with start and end dates
 *
 * @example
 * ```typescript
 * import { getBundledHijriRange } from 'mabims-hijri';
 *
 * getBundledHijriRange();
 * // { start: '1445-07-01', end: '1448-12-30' }
 * ```
 */
export function getBundledHijriRange(): { start: string; end: string } {
  const table = getTable();
  const dates = Object.keys(table.hijri_to_gregorian).sort();
  return {
    start: dates[0],
    end: dates[dates.length - 1],
  };
}
