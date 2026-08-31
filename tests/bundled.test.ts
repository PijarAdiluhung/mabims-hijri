import { describe, it, expect } from 'vitest';
import { getBundledDate, isBundledDateAvailable, getBundledRange } from '../src/bundled';

describe('bundled', () => {
  describe('getBundledDate', () => {
    it('should return hijri date for valid gregorian date', () => {
      const result = getBundledDate('2026-08-31');
      expect(result).not.toBeNull();
      expect(result?.calendar).toBe('hijri');
      expect(result?.year).toBe(1448);
      expect(result?.month).toBe(3);
      expect(result?.day).toBe(18);
      expect(result?.month_name).toBe('Rabiul Awal');
    });

    it('should return null for date outside bundled range', () => {
      const result = getBundledDate('2030-01-01');
      expect(result).toBeNull();
    });

    it('should handle start of bundled range', () => {
      const result = getBundledDate('2024-01-13');
      expect(result).not.toBeNull();
      expect(result?.year).toBe(1445);
      expect(result?.month).toBe(7);
      expect(result?.day).toBe(1);
    });

    it('should handle end of bundled range', () => {
      const result = getBundledDate('2026-12-31');
      expect(result).not.toBeNull();
    });

    it('should return correct month names', () => {
      // Muharram
      const muharram = getBundledDate('2024-07-07');
      expect(muharram?.month_name).toBe('Muharram');

      // Ramadhan
      const ramadhan = getBundledDate('2025-03-01');
      expect(ramadhan?.month_name).toBe('Ramadhan');

      // Syawal
      const syawal = getBundledDate('2025-03-31');
      expect(syawal?.month_name).toBe('Syawal');
    });
  });

  describe('isBundledDateAvailable', () => {
    it('should return true for date in range', () => {
      expect(isBundledDateAvailable('2026-08-31')).toBe(true);
    });

    it('should return false for date out of range', () => {
      expect(isBundledDateAvailable('2030-01-01')).toBe(false);
    });
  });

  describe('getBundledRange', () => {
    it('should return correct range', () => {
      const range = getBundledRange();
      expect(range.start).toBe('2024-01-13');
      expect(range.end).toBe('2026-12-31');
    });
  });
});
