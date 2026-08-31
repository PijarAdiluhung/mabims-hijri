import { HijriDate } from './types';
import { convert } from './convert';

/**
 * Result of a calendar comparison.
 */
export interface CompareResult {
  /** Original Gregorian date */
  date: string;
  /** MABIMS Hijri date */
  mabims: HijriDate;
  /** Data source ('mabims' or 'mabims-computed') */
  source: string;
  /** Warnings (e.g., borderline months) */
  warnings: string[];
}

/**
 * Get MABIMS Hijri date for a Gregorian date with source info.
 *
 * Shows where the data came from (curated table vs computed).
 *
 * @param date - Gregorian date (YYYY-MM-DD)
 * @param options - Configuration options
 * @param options.forceRefresh - Bypass cache (default: false)
 * @returns Comparison result with MABIMS date and metadata
 *
 * @example
 * ```typescript
 * import { compare } from 'mabims-hijri';
 *
 * const result = await compare('2026-08-31');
 * console.log(result.mabims);
 * // { date: '1448-03-18', calendar: 'hijri', month_name: 'Rabiul Awal', ... }
 * console.log(result.source);  // 'mabims'
 * ```
 */
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
