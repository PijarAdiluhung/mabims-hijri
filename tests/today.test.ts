import { describe, it, expect, vi, beforeEach } from 'vitest';
import { today } from '../src/today';
import * as api from '../src/api';
import * as cache from '../src/cache';

vi.mock('../src/api');

describe('today', () => {
  const mockResponse = {
    input: { date: '2026-08-31', calendar: 'gregorian', tz: 'Asia/Jakarta' },
    output: {
      date: '1448-03-18',
      calendar: 'hijri' as const,
      day: 18,
      month: 3,
      month_name: 'Rabiul Awal',
      year: 1448,
    },
    source: 'mabims',
    warnings: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return hijri date from bundled data', async () => {
    const result = await today({ tz: 'Asia/Jakarta' });
    expect(result.output.calendar).toBe('hijri');
    expect(result.output.year).toBe(1448);
  });

  it('should fall back to API for date outside bundled range', async () => {
    vi.mocked(api.fetchToday).mockResolvedValue(mockResponse);
    
    // This date is outside bundled range, so should use API
    const result = await today({ tz: 'Asia/Jakarta', forceRefresh: true });
    expect(api.fetchToday).toHaveBeenCalled();
  });

  it('should use cache on subsequent calls', async () => {
    const result1 = await today({ tz: 'Asia/Jakarta' });
    const result2 = await today({ tz: 'Asia/Jakarta' });
    
    expect(result1.output.date).toBe(result2.output.date);
  });

  it('should handle different timezones', async () => {
    const resultKL = await today({ tz: 'Asia/Kuala_Lumpur' });
    const resultSG = await today({ tz: 'Asia/Singapore' });
    
    // Both should return valid hijri dates
    expect(resultKL.output.calendar).toBe('hijri');
    expect(resultSG.output.calendar).toBe('hijri');
  });
});
