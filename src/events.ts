import { EventsResponse, EventItem, EventDateRange } from './types';
import { fetchEvents } from './api';
import { createCache } from './cache';
import { getTable } from './table';
import { isBundledDateAvailable } from './bundled';

const cache = createCache();

export type EventsIncludeToken =
  | 'extra'
  | 'ayyamul_bidh'
  | 'all'
  | 'isra_miraj'
  | 'nuzulul_quran'
  | 'arafah'
  | 'tasua'
  | 'asyura'
  | 'tasyrik';

export interface EventsOptions {
  forceRefresh?: boolean;
  /**
   * Optional extras, comma-joined when sent to the API: 'extra'
   * (tier-2 observances), 'ayyamul_bidh', individual slugs, or 'all'.
   * The 5 base events are always included.
   * Accepts a single token or an array of them.
   */
  include?: EventsIncludeToken | (EventsIncludeToken | string)[] | string;
}

interface EventDef {
  slug: string;
  name: string;
  month: number;
  day: number;
  dayEnd?: number;
}

const BASE_DEFINITIONS: EventDef[] = [
  { slug: '1_muharram', name: 'Tahun Baru Islam', month: 1, day: 1 },
  { slug: 'maulid_nabi', name: 'Maulid Nabi Muhammad Shallallahu Alaihi Wasallam', month: 3, day: 12 },
  { slug: 'awal_ramadan', name: 'Awal Ramadan', month: 9, day: 1 },
  { slug: 'idul_fitri', name: 'Idul Fitri', month: 10, day: 1 },
  { slug: 'idul_adha', name: 'Idul Adha', month: 12, day: 10 },
];

const EXTRA_DEFINITIONS: EventDef[] = [
  { slug: 'isra_miraj', name: "Isra Mi'raj Nabi Muhammad Shallallahu Alaihi Wasallam", month: 7, day: 27 },
  { slug: 'nuzulul_quran', name: 'Nuzulul Quran', month: 9, day: 17 },
  { slug: 'arafah', name: 'Puasa Arafah', month: 12, day: 9 },
  { slug: 'tasua', name: "Puasa Tasu'a", month: 1, day: 9 },
  { slug: 'asyura', name: 'Puasa Asyura', month: 1, day: 10 },
  { slug: 'tasyrik', name: 'Hari Tasyrik', month: 12, day: 11, dayEnd: 13 },
];

const AYYAMUL_BIDH_NAME = 'Puasa Ayyamul Bidh';

/**
 * Start and end day of Ayyamul Bidh for a Hijri month. The series is 13-15
 * of every month, except Dzulhijjah: day 13 is the last day of Tasyrik
 * (fasting is prohibited), so the white days there shift to 14-16.
 */
function ayyamulBidhSpan(month: number): { start: number; end: number } {
  return month === 12 ? { start: 14, end: 16 } : { start: 13, end: 15 };
}

function normalizeInclude(include: EventsOptions['include']): string[] {
  if (!include) return [];
  const list = Array.isArray(include) ? include : [include];
  const tokens: string[] = [];
  for (const raw of list) {
    for (const token of String(raw).split(',')) {
      const trimmed = token.trim();
      if (trimmed && !tokens.includes(trimmed)) tokens.push(trimmed);
    }
  }
  return tokens;
}

function getCacheKey(year: number, calendar: string, include: string[]): string {
  const includeSuffix = include.length ? `_${[...include].sort().join('+')}` : '';
  return `events_${year}_${calendar}${includeSuffix}`;
}

function hasToken(include: string[], token: string): boolean {
  return include.includes(token) || include.includes('all');
}

function definitionsForInclude(include: string[]): EventDef[] {
  const selectedExtra =
    include.includes('extra') || include.includes('all')
      ? EXTRA_DEFINITIONS
      : EXTRA_DEFINITIONS.filter((d) => include.includes(d.slug));
  return [...BASE_DEFINITIONS, ...selectedExtra];
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Every Hijri date the request needs (start and end of ranged events). */
function neededHijriDates(year: number, calendar: 'hijri' | 'gregorian', include: string[]): string[] {
  const defs = definitionsForInclude(include);
  const wantBidh = hasToken(include, 'ayyamul_bidh');
  if (calendar === 'hijri') {
    const dates: string[] = [];
    for (const def of defs) {
      dates.push(`${year}-${pad2(def.month)}-${pad2(def.day)}`);
      if (def.dayEnd !== undefined) {
        dates.push(`${year}-${pad2(def.month)}-${pad2(def.dayEnd)}`);
      }
    }
    if (wantBidh) {
      for (let month = 1; month <= 12; month++) {
        const { start, end } = ayyamulBidhSpan(month);
        dates.push(`${year}-${pad2(month)}-${pad2(start)}`, `${year}-${pad2(month)}-${pad2(end)}`);
      }
    }
    return dates;
  }

  // Gregorian: a gregorian year overlaps ~3-4 hijri years — the API scans
  // year-581 .. year-577. Every event landing in that gregorian year must be
  // resolvable, so check each candidate month/day across the scanned years.
  const dates: string[] = [];
  for (let hy = year - 581; hy <= year - 577; hy++) {
    for (const def of defs) {
      dates.push(`${hy}-${pad2(def.month)}-${pad2(def.day)}`);
      if (def.dayEnd !== undefined) {
        dates.push(`${hy}-${pad2(def.month)}-${pad2(def.dayEnd)}`);
      }
    }
    if (wantBidh) {
      for (let month = 1; month <= 12; month++) {
        const { start, end } = ayyamulBidhSpan(month);
        dates.push(`${hy}-${pad2(month)}-${pad2(start)}`, `${hy}-${pad2(month)}-${pad2(end)}`);
      }
    }
  }
  return dates;
}

function bundledCovers(year: number, calendar: 'hijri' | 'gregorian', include: string[]): boolean {
  return neededHijriDates(year, calendar, include).every((iso) => isBundledDateAvailable(iso, 'hijri'));
}

function computeBundledEvents(
  year: number,
  calendar: 'hijri' | 'gregorian',
  include: string[]
): EventsResponse | null {
  if (!bundledCovers(year, calendar, include)) return null;
  const table = getTable();
  const h2g = table.hijri_to_gregorian;
  const defs = definitionsForInclude(include);
  const wantBidh = hasToken(include, 'ayyamul_bidh');

  const items: EventItem[] = [];
  const dateRange = (hIso: string, gIso: string, dayEnd: number): EventDateRange | null => {
    const hEndIso = `${hIso.slice(0, 7)}-${pad2(dayEnd)}`;
    const gEnd = h2g[hEndIso];
    if (!gEnd) return null;
    return {
      hijri_start: hIso,
      hijri_end: hEndIso,
      gregorian_start: gIso,
      gregorian_end: gEnd,
    };
  };

  const pushDef = (def: EventDef, hIso: string) => {
    const gIso = h2g[hIso];
    if (!gIso) return;
    // For a gregorian request keep only events landing in that year: a
    // gregorian year can span parts of 3-4 hijri years.
    if (calendar === 'gregorian' && !gIso.startsWith(`${year}-`)) return;
    items.push({
      event: def.slug,
      name: def.name,
      hijri: hIso,
      gregorian: gIso,
      source: 'mabims',
      date_range: def.dayEnd !== undefined ? dateRange(hIso, gIso, def.dayEnd) : null,
    });
  };

  const pushBidh = (month: number, hy: number) => {
    const { start, end } = ayyamulBidhSpan(month);
    const hIso = `${hy}-${pad2(month)}-${pad2(start)}`;
    const gIso = h2g[hIso];
    if (!gIso) return;
    if (calendar === 'gregorian' && !gIso.startsWith(`${year}-`)) return;
    items.push({
      event: 'ayyamul_bidh',
      name: AYYAMUL_BIDH_NAME,
      hijri: hIso,
      gregorian: gIso,
      source: 'mabims',
      date_range: dateRange(hIso, gIso, end),
    });
  };

  if (calendar === 'hijri') {
    for (const def of defs) {
      pushDef(def, `${year}-${pad2(def.month)}-${pad2(def.day)}`);
    }
    if (wantBidh) {
      for (let month = 1; month <= 12; month++) pushBidh(month, year);
    }
  } else {
    for (let hy = year - 581; hy <= year - 577; hy++) {
      for (const def of defs) {
        pushDef(def, `${hy}-${pad2(def.month)}-${pad2(def.day)}`);
      }
      if (wantBidh) {
        for (let month = 1; month <= 12; month++) pushBidh(month, hy);
      }
    }
  }

  items.sort((a, b) => (a.gregorian < b.gregorian ? -1 : a.gregorian > b.gregorian ? 1 : 0));

  return {
    input: { year, calendar, include: include.length ? include : null },
    count: items.length,
    events: items,
    warnings: [],
  };
}

/**
 * Get Islamic events for a year.
 *
 * Base events: Ramadan start, Idul Fitri, Idul Adha, 1 Muharram, Maulid Nabi.
 * Optional extras via `include`: 'extra' (Isra Mi'raj, Nuzulul Quran, Arafah,
 * Tasu'a, Asyura, Tasyrik), 'ayyamul_bidh' (13-15 of every Hijri month),
 * individual slugs, or 'all'. Works offline within the bundled MABIMS range.
 *
 * @param year - Hijri or Gregorian year
 * @param calendar - Input calendar type ('hijri' or 'gregorian')
 * @param options - Configuration options
 * @param options.include - 'extra' | 'ayyamul_bidh' | 'all' | single slug | array of them
 * @param options.forceRefresh - Bypass cache (default: false)
 * @returns Events with both Hijri and Gregorian dates; multi-day events carry `date_range`
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
 *
 * // tier 2 + tier 3
 * const all = await events(2025, 'gregorian', { include: ['extra', 'ayyamul_bidh'] });
 * const tasyrik = all.events.find(e => e.event === 'tasyrik');
 * tasyrik?.date_range; // { hijri_start: '1446-12-11', hijri_end: '1446-12-13', ... }
 * ```
 */
export async function events(
  year: number,
  calendar: 'hijri' | 'gregorian' = 'hijri',
  options: EventsOptions = {}
): Promise<EventsResponse> {
  const { forceRefresh = false } = options;
  const include = normalizeInclude(options.include);
  const cacheKey = getCacheKey(year, calendar, include);

  if (!forceRefresh && cache.has(cacheKey)) {
    return cache.get<EventsResponse>(cacheKey)!;
  }

  const bundled = computeBundledEvents(year, calendar as 'hijri' | 'gregorian', include);
  const response = bundled ?? (await fetchEvents(year, calendar, include.join(',')));
  cache.set(cacheKey, response);
  return response;
}
