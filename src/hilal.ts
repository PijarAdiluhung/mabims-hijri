import { fetchHilalInfo } from './api';
import type { HilalInfoResponse } from './types';

export const hilal = {
  /**
   * Get hilal (moon) visibility data for determining the start of a Hijri month.
   *
   * Uses MABIMS criteria evaluated at coastal observation points across Indonesia —
   * met at any single site → 29-day month. When visible, `evening.deciding_site`
   * reports the site that decided.
   *
   * @param month - Hijri month number (1-12)
   * @param year - Hijri year (e.g. 1447)
   * @returns Hilal visibility data including moon altitude, elongation, the deciding site, and whether criteria are met
   *
   * @example
   * ```typescript
   * const info = await hilal.info(9, 1447);
   * console.log(info.month.name);          // 'Ramadhan'
   * console.log(info.evening.visible);     // true or false
   * console.log(info.evening.moon_alt_deg); // moon altitude in degrees
   * console.log(info.evening.deciding_site?.name); // e.g. 'Sabang / Weh Island'
   * ```
   */
  async info(month: number, year: number): Promise<HilalInfoResponse> {
    return fetchHilalInfo(month, year);
  }
};