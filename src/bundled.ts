import { HijriDate, GregorianDate } from './types';
import { getTable } from './table';

const MONTH_NAMES = [
  'Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir',
  'Jumadil Awal', 'Jumadil Akhir', 'Rajab', "Sya'ban",
  'Ramadhan', 'Syawal', "Dzulqa'dah", 'Dzulhijjah'
];

function parseHijri(hijriStr: string): HijriDate {
  const [year, month, day] = hijriStr.split('-').map(Number);
  return {
    date: hijriStr,
    calendar: 'hijri',
    day,
    month,
    month_name: MONTH_NAMES[month - 1] || '',
    year,
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
  };
}

export function getBundledDate(gregorianDate: string): HijriDate | null {
  const table = getTable();
  const hijriStr = table.gregorian_to_hijri[gregorianDate];
  if (!hijriStr) return null;
  return parseHijri(hijriStr);
}

export function getBundledHijriDate(hijriDate: string): GregorianDate | null {
  const table = getTable();
  const gregStr = table.hijri_to_gregorian[hijriDate];
  if (!gregStr) return null;
  return parseGregorian(gregStr);
}

export function isBundledDateAvailable(date: string, calendar: 'gregorian' | 'hijri'): boolean {
  const table = getTable();
  if (calendar === 'gregorian') {
    return date in table.gregorian_to_hijri;
  }
  return date in table.hijri_to_gregorian;
}

export function getBundledRange(): { start: string; end: string } {
  const table = getTable();
  const dates = Object.keys(table.gregorian_to_hijri).sort();
  return {
    start: dates[0],
    end: dates[dates.length - 1],
  };
}

export function getBundledHijriRange(): { start: string; end: string } {
  const table = getTable();
  const dates = Object.keys(table.hijri_to_gregorian).sort();
  return {
    start: dates[0],
    end: dates[dates.length - 1],
  };
}
