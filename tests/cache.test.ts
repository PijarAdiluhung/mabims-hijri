import { describe, it, expect } from 'vitest';
import { createCache, isCacheValid } from '../src/cache';

describe('cache', () => {
  it('should create a cache instance', () => {
    const cache = createCache();
    expect(cache).toBeDefined();
    expect(typeof cache.get).toBe('function');
    expect(typeof cache.set).toBe('function');
    expect(typeof cache.has).toBe('function');
  });

  it('should store and retrieve values', () => {
    const cache = createCache();
    cache.set('test', { data: 'hello' });
    
    expect(cache.has('test')).toBe(true);
    expect(cache.get('test')).toEqual({ data: 'hello' });
  });

  it('should return null for missing keys', () => {
    const cache = createCache();
    expect(cache.get('missing')).toBeNull();
  });

  it('should check cache validity', () => {
    const cache = createCache();
    cache.set('test', { data: 'hello' });
    
    // Valid within max age
    expect(isCacheValid(cache, 'test', 60000)).toBe(true);
    
    // Invalid for missing key
    expect(isCacheValid(cache, 'missing', 60000)).toBe(false);
  });
});
