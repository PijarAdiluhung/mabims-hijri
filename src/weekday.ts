/**
 * Indonesian weekday names indexed by Date.getUTCDay() (Sunday=0),
 * mirroring the API's `weekday` field. Sunday is written with the
 * Kemenag convention "Ahad" (not "Minggu").
 */
export const WEEKDAYS_ID = [
  'Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu',
] as const;

export function weekdayOf(gregorianIso: string): string {
  const d = new Date(`${gregorianIso}T00:00:00Z`);
  return WEEKDAYS_ID[d.getUTCDay()];
}
