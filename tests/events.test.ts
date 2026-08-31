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
});
