import { describe, it, expect } from 'vitest';
import { convert } from '../src/convert';

describe('convert', () => {
  describe('gregorian to hijri', () => {
    it('should convert gregorian date to hijri', async () => {
      const result = await convert('2026-08-31', 'gregorian');
      expect(result.output.calendar).toBe('hijri');
      expect(result.output.date).toBe('1448-03-18');
    });

    it('should return correct month name', async () => {
      const result = await convert('2026-08-31', 'gregorian');
      expect(result.output.month_name).toBe('Rabiul Awal');
    });

    it('should handle start of hijri year', async () => {
      const result = await convert('2024-07-07', 'gregorian');
      expect(result.output.month_name).toBe('Muharram');
    });
  });

  describe('hijri to gregorian', () => {
    it('should convert hijri date to gregorian', async () => {
      const result = await convert('1448-03-18', 'hijri');
      expect(result.output.calendar).toBe('gregorian');
      expect(result.output.date).toBe('2026-08-31');
    });
  });

  describe('bundled data', () => {
    it('should use bundled data for dates in range', async () => {
      const result = await convert('2026-01-01', 'gregorian');
      expect(result.source).toBe('mabims');
    });

    it('should fall back to API for date outside bundled range', async () => {
      const result = await convert('2030-01-01', 'gregorian');
      expect(result.source).toBe('mabims-computed');
    });
  });
});
