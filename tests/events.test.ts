import { describe, it, expect } from 'vitest';
import { events } from '../src/events';

describe('events', () => {
  it('should return events for a hijri year', async () => {
    const result = await events(1446, 'hijri');
    expect(result.count).toBeGreaterThan(0);
    expect(result.events).toBeDefined();
  });

  it('should include major Islamic events', async () => {
    const result = await events(1446, 'hijri');
    const eventNames = result.events.map(e => e.event);
    expect(eventNames).toContain('awal_ramadan');
    expect(eventNames).toContain('idul_fitri');
    expect(eventNames).toContain('idul_adha');
  });

  it('should return gregorian dates for events', async () => {
    const result = await events(1446, 'hijri');
    const firstEvent = result.events[0];
    expect(firstEvent.gregorian).toBeDefined();
    expect(firstEvent.hijri).toBeDefined();
  });

  it('should work offline within the bundled range (cached/table data)', async () => {
    const result = await events(1446, 'hijri');
    expect(result.warnings).toEqual([]);
    expect(result.count).toBe(5);
  });

  it('should return tier-2 events with include=extra (offline)', async () => {
    const result = await events(1446, 'hijri', { forceRefresh: true, include: 'extra' });
    const slugs = result.events.map(e => e.event);
    expect(slugs).toContain('isra_miraj');
    expect(slugs).toContain('arafah');
    expect(slugs).toContain('asyura');
    expect(slugs).toContain('tasyrik');
    expect(result.input.include).toContain('extra');
  });

  it('should accept include as an array', async () => {
    const result = await events(1446, 'hijri', { forceRefresh: true, include: ['asyura', 'arafah'] });
    const slugs = result.events.map(e => e.event);
    expect(slugs).toContain('asyura');
    expect(slugs).toContain('arafah');
    expect(slugs).not.toContain('isra_miraj');
  });

  it('tasyrik should carry a date_range 11-13', async () => {
    const result = await events(1446, 'hijri', { forceRefresh: true, include: 'tasyrik' });
    const tasyrik = result.events.find(e => e.event === 'tasyrik');
    expect(tasyrik).toBeDefined();
    expect(tasyrik!.hijri).toBe('1446-12-11');
    expect(tasyrik!.date_range!.hijri_end).toBe('1446-12-13');
    expect(tasyrik!.date_range!.gregorian_end).toBeDefined();
  });

  it('single-day events should have date_range null', async () => {
    const result = await events(1446, 'hijri', { forceRefresh: true, include: 'arafah' });
    const arafah = result.events.find(e => e.event === 'arafah');
    expect(arafah!.date_range).toBeNull();
  });

  it('ayyamul_bidh should return 12 ranged events per hijri year (offline)', async () => {
    const result = await events(1446, 'hijri', { forceRefresh: true, include: 'ayyamul_bidh' });
    const bidh = result.events.filter(e => e.event === 'ayyamul_bidh');
    expect(bidh).toHaveLength(12);
    expect(bidh[0].date_range!.hijri_end).toBe(`${bidh[0].hijri.slice(0, 7)}-15`);
    const zulhijjah = bidh.find(e => e.hijri.slice(5, 7) === '12')!;
    expect(zulhijjah.hijri).toBe('1446-12-14');
    expect(zulhijjah.date_range!.hijri_end).toBe('1446-12-16');
  });

  it('include=all should contain base, extra and ayyamul_bidh (offline)', async () => {
    const result = await events(1446, 'hijri', { forceRefresh: true, include: 'all' });
    const slugs = new Set(result.events.map(e => e.event));
    expect(slugs.has('idul_adha')).toBe(true);
    expect(slugs.has('asyura')).toBe(true);
    expect(slugs.has('ayyamul_bidh')).toBe(true);
    expect(result.count).toBe(11 + 12);
  });

  it('gregorian year should filter to events landing that year', async () => {
    const result = await events(2025, 'gregorian', { forceRefresh: true });
    for (const e of result.events) {
      expect(e.gregorian.startsWith('2025')).toBe(true);
    }
  });

  it('cache keys should differ per include set', async () => {
    const a = await events(1446, 'hijri');
    const b = await events(1446, 'hijri', { include: 'extra' });
    expect(a.count).toBe(5);
    expect(b.count).toBe(11);
  });
});
