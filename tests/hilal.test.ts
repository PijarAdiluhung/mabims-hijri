import { describe, it, expect } from 'vitest';
import { hilal } from '../src/hilal';

describe('hilal.info()', () => {
  it('should return hilal visibility data for a valid Hijri month', async () => {
    const result = await hilal.info(9, 1447);

    expect(result.input).toEqual({ month: 9, year: 1447 });
    expect(result.month.name).toBe('Ramadhan');
    expect(result.month.number).toBe(9);
    expect(result.month.year).toBe(1447);
    expect(result.month.start).toBe('2026-02-19');
  });

  it('should return previous month info', async () => {
    const result = await hilal.info(9, 1447);

    expect(result.previous_month.name).toBe("Sya'ban");
    expect(result.previous_month.number).toBe(8);
    expect(result.previous_month.length).toBe(30);
  });

  it('should return evening observation data', async () => {
    const result = await hilal.info(9, 1447);

    expect(result.evening.hijri_date).toBe('29 Sya\'ban 1447 H');
    expect(result.evening.gregorian_date).toBe('2026-02-17');
    expect(typeof result.evening.moon_alt_deg).toBe('number');
    expect(typeof result.evening.elongation_deg).toBe('number');
    expect(typeof result.evening.illumination_pct).toBe('number');
    expect(typeof result.evening.age_hours).toBe('number');
  });

  it('should have visible boolean based on criteria', async () => {
    const result = await hilal.info(9, 1447);

    expect(typeof result.evening.alt_ok).toBe('boolean');
    expect(typeof result.evening.elong_ok).toBe('boolean');
    expect(typeof result.evening.visible).toBe('boolean');
  });

  it('should include source and warnings', async () => {
    const result = await hilal.info(9, 1447);

    expect(result.source).toBeDefined();
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it('should work for different months', async () => {
    const result = await hilal.info(1, 1447);

    expect(result.month.name).toBe('Muharram');
    expect(result.month.number).toBe(1);
  });
});