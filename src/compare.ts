import { HijriDate } from './types';
import { convert } from './convert';

export interface CompareResult {
  date: string;
  mabims: HijriDate;
  source: string;
  warnings: string[];
}

export async function compare(
  date: string,
  options: { forceRefresh?: boolean } = {}
): Promise<CompareResult> {
  const result = await convert(date, 'gregorian', options);
  
  return {
    date,
    mabims: result.output as HijriDate,
    source: result.source,
    warnings: result.warnings,
  };
}
