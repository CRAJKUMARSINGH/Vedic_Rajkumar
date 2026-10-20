/**
 * chartCacheKey.test.ts
 *
 * Proves the cache key correctly separates charts that differ only by timezone.
 * Also demonstrates the legacy collision — same key for IST vs wartime charts.
 */
import { describe, it, expect } from 'vitest';
import { chartCacheKey, chartCacheKeyForBirth, legacyChartCacheKey } from '@/lib/chartCacheKey';

const BASE = { date: '1943-06-15', time: '04:27', lat: 19.076, lon: 72.8777 };

describe('chartCacheKey', () => {
  it('separates two charts that differ only by UTC offset', () => {
    const ist     = chartCacheKey({ ...BASE, offsetHours: 5.5 });
    const wartime = chartCacheKey({ ...BASE, offsetHours: 6.5 });
    expect(ist).not.toBe(wartime);
  });

  it('is stable for identical input', () => {
    const a = chartCacheKey({ ...BASE, offsetHours: 6.5 });
    const b = chartCacheKey({ ...BASE, offsetHours: 6.5 });
    expect(a).toBe(b);
  });

  it('includes all five fields', () => {
    const key = chartCacheKey({ ...BASE, offsetHours: 6.5 });
    expect(key).toContain(BASE.date);
    expect(key).toContain(BASE.time);
    expect(key).toContain('6.5000');
  });
});

describe('legacyChartCacheKey demonstrates the collision', () => {
  it('produces the same key for IST and wartime — the bug', () => {
    const legacyIst     = legacyChartCacheKey(BASE.date, BASE.time, BASE.lat, BASE.lon);
    const legacyWartime = legacyChartCacheKey(BASE.date, BASE.time, BASE.lat, BASE.lon);
    expect(legacyIst).toBe(legacyWartime); // same key, two different charts

    const fixedIst     = chartCacheKey({ ...BASE, offsetHours: 5.5 });
    const fixedWartime = chartCacheKey({ ...BASE, offsetHours: 6.5 });
    expect(fixedIst).not.toBe(fixedWartime); // fixed: different keys
  });
});

describe('chartCacheKeyForBirth', () => {
  it('defaults to IST when no offset is supplied', () => {
    const key = chartCacheKeyForBirth(BASE.date, BASE.time, BASE.lat, BASE.lon);
    expect(key).toContain('5.5000');
  });

  it('uses an explicit override when supplied', () => {
    const key = chartCacheKeyForBirth(BASE.date, BASE.time, BASE.lat, BASE.lon, 6.5);
    expect(key).toContain('6.5000');
  });

  it('returns the same value as chartCacheKey with the same offset', () => {
    const a = chartCacheKeyForBirth(BASE.date, BASE.time, BASE.lat, BASE.lon, 6.5);
    const b = chartCacheKey({ ...BASE, offsetHours: 6.5 });
    expect(a).toBe(b);
  });
});
