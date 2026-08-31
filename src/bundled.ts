import data from './data.json';
import { HijriDate, GregorianDate } from './types';

const gregorianToHijri = data.gregorian_to_hijri;
const hijriToGregorian = data.hijri_to_gregorian;

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
  return {
    date: gregStr,
    calendar: 'gregorian',
  };
}

export function getBundledDate(gregorianDate: string): HijriDate | null {
  const hijriStr = gregorianToHijri[gregorianDate as keyof typeof gregorianToHijri];
  if (!hijriStr) return null;
  return parseHijri(hijriStr);
}

export function getBundledHijriDate(hijriDate: string): GregorianDate | null {
  const gregStr = hijriToGregorian[hijriDate as keyof typeof hijriToGregorian];
  if (!gregStr) return null;
  return parseGregorian(gregStr);
}

export function isBundledDateAvailable(date: string, calendar: 'gregorian' | 'hijri'): boolean {
  if (calendar === 'gregorian') {
    return date in gregorianToHijri;
  }
  return date in hijriToGregorian;
}

export function getBundledRange(): { start: string; end: string } {
  const dates = Object.keys(gregorianToHijri).sort();
  return {
    start: dates[0],
    end: dates[dates.length - 1],
  };
}

export function getBundledHijriRange(): { start: string; end: string } {
  const dates = Object.keys(hijriToGregorian).sort();
  return {
    start: dates[0],
    end: dates[dates.length - 1],
  };
}
