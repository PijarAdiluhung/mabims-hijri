import { describe, it, expect } from 'vitest';
import { range } from '../src/range';

describe('range', () => {
  describe('gregorian range', () => {
    it('should convert a range of gregorian dates', async () => {
      const result = await range('2026-08-31', '2026-09-02', 'gregorian');
      expect(result.count).toBe(3);
      expect(result.items).toHaveLength(3);
      expect(result.items[0].input).toBe('2026-08-31');
      expect(result.items[2].input).toBe('2026-09-02');
    });

    it('should return correct hijri dates', async () => {
      const result = await range('2026-08-31', '2026-09-02', 'gregorian');
      expect(result.items[0].output).toBe('1448-03-18');
    });

    it('should handle single day range', async () => {
      const result = await range('2026-08-31', '2026-08-31', 'gregorian');
      expect(result.count).toBe(1);
    });
  });

  describe('hijri range', () => {
    it('should convert a range of hijri dates', async () => {
      const result = await range('1448-03-18', '1448-03-20', 'hijri');
      expect(result.count).toBe(3);
      expect(result.items[0].calendar).toBe('gregorian');
    });
  });

  describe('validation', () => {
    it('should throw for range exceeding 45 days', async () => {
      await expect(range('2026-01-01', '2026-02-20', 'gregorian')).rejects.toThrow();
    });

    it('should use bundled data for dates in range', async () => {
      const result = await range('2026-01-01', '2026-01-05', 'gregorian');
      expect(result.warnings).toHaveLength(0);
    });
  });
});
