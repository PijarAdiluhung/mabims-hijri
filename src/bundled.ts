import data from './data.json';
import { HijriDate } from './types';

const gregorianToHijri = data.gregorian_to_hijri;

function parseHijri(hijriStr: string): HijriDate {
  const [year, month, day] = hijriStr.split('-').map(Number);
  const monthNames = [
    'Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir',
    'Jumadil Awal', 'Jumadil Akhir', 'Rajab', "Sya'ban",
    'Ramadhan', 'Syawal', "Dzulqa'dah", 'Dzulhijjah'
  ];
  
  return {
    date: hijriStr,
    calendar: 'hijri',
    day,
    month,
    month_name: monthNames[month - 1] || '',
    year,
  };
}

export function getBundledDate(gregorianDate: string): HijriDate | null {
  const hijriStr = gregorianToHijri[gregorianDate as keyof typeof gregorianToHijri];
  if (!hijriStr) return null;
  return parseHijri(hijriStr);
}

export function isBundledDateAvailable(gregorianDate: string): boolean {
  return gregorianDate in gregorianToHijri;
}

export function getBundledRange(): { start: string; end: string } {
  const dates = Object.keys(gregorianToHijri).sort();
  return {
    start: dates[0],
    end: dates[dates.length - 1],
  };
}
