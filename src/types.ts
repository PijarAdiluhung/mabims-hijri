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
