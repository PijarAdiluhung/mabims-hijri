import { describe, it, expect } from 'vitest';
import { compare } from '../src/compare';

describe('compare', () => {
  it('should return MABIMS date for a gregorian date', async () => {
    const result = await compare('2026-08-31');
    expect(result.mabims).toBeDefined();
    expect(result.mabims.calendar).toBe('hijri');
    expect(result.mabims.date).toBe('1448-03-18');
  });

  it('should include source information', async () => {
    const result = await compare('2026-08-31');
    expect(result.source).toBeDefined();
  });

  it('should handle dates outside bundled range', async () => {
    const result = await compare('2030-01-01');
    expect(result.mabims).toBeDefined();
    expect(result.source).toBe('mabims-computed');
  });
});
