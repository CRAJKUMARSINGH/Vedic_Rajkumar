import { describe, it, expect } from 'vitest';
import { FUNNEL_STEPS } from '@/analytics/funnels/funnels';
import { findRegressions } from '@/analytics/funnels/regressions';

describe('activation funnel', () => {
  it('defines the core visit-to-return steps', () => {
    expect(FUNNEL_STEPS).toEqual([
      'page_view',
      'signup',
      'chart_created',
      'insight_viewed',
      'session_return',
    ]);
  });
});

describe('findRegressions', () => {
  it('flags routes whose p75 LCP exceeds the baseline by the threshold', () => {
    const current = [
      { route: '/kundli', lcp: 1000, release: 'b' },
      { route: '/kundli', lcp: 1200, release: 'b' },
      { route: '/kundli', lcp: 2600, release: 'b' },
      { route: '/kundli', lcp: 2800, release: 'b' },
      { route: '/panchang', lcp: 800, release: 'b' },
    ];
    const out = findRegressions(current, { '/kundli': 1000, '/panchang': 900 }, 20);
    expect(out).toHaveLength(1);
    expect(out[0].route).toBe('/kundli');
    expect(out[0].deltaPct).toBeGreaterThan(20);
  });

  it('returns an empty list when no route exceeds the threshold', () => {
    const current = [{ route: '/kundli', lcp: 1100, release: 'b' }];
    expect(findRegressions(current, { '/kundli': 1000 }, 20)).toEqual([]);
  });
});
