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
