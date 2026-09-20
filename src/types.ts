export interface HijriDate {
  date: string;
  calendar: 'hijri';
  day: number;
  month: number;
  month_name: string;
  year: number;
  weekday: string;
}

export interface GregorianDate {
  date: string;
  calendar: 'gregorian';
  day?: number;
  month?: number;
  month_name?: string;
  year?: number;
  weekday?: string;
}

export interface NextDate extends HijriDate {
  source: string;
}

export interface TodayResponse {
  input: {
    date: string;
    calendar: string;
    tz: string;
  };
  output: HijriDate;
  /**
   * The Hijri date that becomes current after this evening's maghrib (the next
   * civil day's mapping). Present only when `today({ next: true })` is used.
   */
  next?: NextDate;
  source: string;
  warnings: string[];
}

export interface ConvertResponse {
  input: {
    date: string;
    calendar: string;
    tz: string | null;
  };
  output: HijriDate | GregorianDate;
  source: string;
  warnings: string[];
}

export interface MetaResponse {
  method: string;
  computed_active: boolean;
  computed_months: number;
  table_version: string;
  coverage: {
    hijri_start: string;
    hijri_end: string;
    gregorian_start: string;
    gregorian_end: string;
  };
}

export interface DateItem {
  input: string;
  output: string;
  calendar: string;
  day: number;
  month: number;
  month_name: string;
  year: number;
  weekday: string;
}

export interface RangeResponse {
  input: {
    start: string;
    end: string;
    calendar: string;
  };
  count: number;
  items: DateItem[];
  warnings: string[];
}

export interface TableResponse {
  version: string;
  gregorian_to_hijri: Record<string, string>;
  hijri_to_gregorian: Record<string, string>;
}

export interface RangeItem {
  gregorian: string;
  hijri: string;
  weekday: string;
  source: string;
}

export interface MonthInput {
  year: number;
  month: number;
  calendar: string;
}

export interface MonthResponse {
  input: MonthInput;
  count: number;
  items: RangeItem[];
  warnings: string[];
}

export interface YearInput {
  year: number;
  calendar: string;
}

export interface YearResponse {
  input: YearInput;
  count: number;
  months: Record<number, RangeItem[]>;
  warnings: string[];
}

export interface EventDateRange {
  hijri_start: string;
  hijri_end: string;
  gregorian_start: string;
  gregorian_end: string;
}

export interface EventItem {
  event: string;
  name: string;
  hijri: string;
  gregorian: string;
  source: string;
  /**
   * Inclusive span of a multi-day event (Tasyrik 11-13 Dzulhijjah,
   * Ayyamul Bidh 13-15 of a month). null for single-day events.
   */
  date_range?: EventDateRange | null;
}

export interface EventsInput {
  year: number;
  calendar: string;
  /**
   * Echo of the `include` option; null/undefined when not requested.
   */
  include?: string[] | null;
}

export interface EventsResponse {
  input: EventsInput;
  count: number;
  events: EventItem[];
  warnings: string[];
}

export interface HilalInfoInput {
  month: number;
  year: number;
}

export interface HilalMonth {
  name: string;
  number: number;
  year: number;
  start: string;
}

export interface HilalPrevMonth {
  name: string;
  number: number;
  year: number;
  length: number;
}

export interface DecidingSite {
  name: string;
  lat: number;
  lon: number;
  elev_m: number;
  tz: string;
}

export interface HilalEvening {
  hijri_date: string;
  hijri_day: number;
  gregorian_date: string;
  sunset: string;
  moonset: string;
  moon_alt_deg: number;
  moon_az_deg: number;
  sun_alt_deg: number;
  elongation_deg: number;
  illumination_pct: number;
  age_hours: number;
  /** Coastal observation site the reported values describe — the deciding site when visible, otherwise the best-margin site. Added in API v1.5. */
  deciding_site?: DecidingSite;
  /** Number of coastal observation sites evaluated. Added in API v1.5. */
  sites_checked?: number;
  alt_ok: boolean;
  elong_ok: boolean;
  visible: boolean;
}

export interface HilalInfoResponse {
  input: HilalInfoInput;
  month: HilalMonth;
  previous_month: HilalPrevMonth;
  evening: HilalEvening;
  source: string;
  warnings: string[];
}
