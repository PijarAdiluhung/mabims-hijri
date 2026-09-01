import { fetchHilalInfo } from './api';
import type { HilalInfoResponse } from './types';

export const hilal = {
  /**
   * Get hilal (moon) visibility data for determining the start of a Hijri month.
   *
   * Uses MABIMS criteria based on observations from Sabang, Indonesia.
   *
   * @param month - Hijri month number (1-12)
   * @param year - Hijri year (e.g. 1447)
   * @returns Hilal visibility data including moon altitude, elongation, and whether criteria are met
   *
   * @example
   * ```typescript
   * const info = await hilal.info(9, 1447);
   * console.log(info.month.name);          // 'Ramadhan'
   * console.log(info.evening.visible);     // true or false
   * console.log(info.evening.moon_alt_deg); // moon altitude in degrees
   * ```
   */
  async info(month: number, year: number): Promise<HilalInfoResponse> {
    return fetchHilalInfo(month, year);
  }
};