export interface HijriDate {
  date: string;
  calendar: 'hijri';
  day: number;
  month: number;
  month_name: string;
  year: number;
}

export interface GregorianDate {
  date: string;
  calendar: 'gregorian';
  day?: number;
  month?: number;
  month_name?: string;
  year?: number;
}

export interface TodayResponse {
  input: {
    date: string;
    calendar: string;
    tz: string;
  };
  output: HijriDate;
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

export interface EventItem {
  event: string;
  name: string;
  hijri: string;
  gregorian: string;
  source: string;
}

export interface EventsInput {
  year: number;
  calendar: string;
}

export interface EventsResponse {
  input: EventsInput;
  count: number;
  events: EventItem[];
  warnings: string[];
}
