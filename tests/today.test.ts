import { describe, it, expect, vi, beforeEach } from 'vitest';
import { today } from '../src/today';
import * as api from '../src/api';
import * as cache from '../src/cache';
import { getBundledDate, isBundledDateAvailable } from '../src/bundled';

vi.mock('../src/api');

function tomorrowInJakarta(): string {
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
  const d = new Date(`${todayStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().split('T')[0];
}

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

  it('should return the following Hijri date from bundled data when next is true', async () => {
    const tomorrow = tomorrowInJakarta();
    if (!isBundledDateAvailable(tomorrow, 'gregorian')) {
      return; // tomorrow outside bundled range — covered by the API test below
    }
    const expected = getBundledDate(tomorrow);
    const result = await today({ tz: 'Asia/Jakarta', forceRefresh: true, next: true });
    expect(result.next).toBeDefined();
    expect(result.next?.date).toBe(expected?.date);
    expect(result.next?.calendar).toBe('hijri');
    expect(result.next?.source).toBe('mabims');
  });

  it('should omit next unless requested', async () => {
    const result = await today({ tz: 'Asia/Jakarta', forceRefresh: true });
    expect(result.next).toBeUndefined();
  });

  it('should keep next and non-next responses in separate cache entries', async () => {
    const plain = await today({ tz: 'Asia/Jakarta', forceRefresh: true });
    const withNext = await today({ tz: 'Asia/Jakarta', forceRefresh: true, next: true });
    expect(plain.next).toBeUndefined();
    expect(withNext.next).toBeDefined();
  });

  it('should request next from the API when today is outside bundled range', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2027-06-01T10:00:00Z'));
    vi.mocked(api.fetchToday).mockResolvedValue({
      ...mockResponse,
      next: {
        date: '1449-01-01',
        calendar: 'hijri' as const,
        day: 1,
        month: 1,
        month_name: 'Muharram',
        year: 1449,
        source: 'mabims-computed',
      },
    });
    try {
      const result = await today({ tz: 'Asia/Jakarta', forceRefresh: true, next: true });
      expect(api.fetchToday).toHaveBeenCalledWith('Asia/Jakarta', true);
      expect(result.next?.date).toBe('1449-01-01');
    } finally {
      vi.useRealTimers();
    }
  });
});
