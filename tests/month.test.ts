import { describe, it, expect } from 'vitest';
import { month } from '../src/month';

describe('month', () => {
  describe('gregorian month', () => {
    it('should return all days in a gregorian month', async () => {
      const result = await month(2026, 8, 'gregorian');
      expect(result.count).toBe(31);
      expect(result.items).toHaveLength(31);
    });

    it('should return correct hijri dates', async () => {
      const result = await month(2026, 8, 'gregorian');
      expect(result.items[0].gregorian).toBe('2026-08-01');
      expect(result.items[0].hijri).toBeDefined();
    });

    it('should handle february', async () => {
      const result = await month(2026, 2, 'gregorian');
      expect(result.count).toBe(28);
    });

    it('should use bundled data', async () => {
      const result = await month(2026, 8, 'gregorian');
      expect(result.warnings).toHaveLength(0);
    });
  });
});
