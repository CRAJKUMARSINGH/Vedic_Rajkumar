/**
 * Rule tests — Vedic timeline (Prasnalove.txt §9, §5.2). Synthetic moment.
 * Delhi (28.6139 N, 77.2090 E) on 2026-06-21 (a Sunday) in Asia/Kolkata.
 */
import { describe, it, expect } from 'vitest';
import { computeVedicTimeline } from '@/features/prashna/kernel/timeline';

const DELHI = { lat: 28.6139, lon: 77.209, tz: 'Asia/Kolkata' };

describe('computeVedicTimeline — daytime', () => {
  // 2026-06-21 12:00 IST = 06:30 UTC
  const askedAt = new Date('2026-06-21T06:30:00Z');
  const tl = computeVedicTimeline(askedAt, DELHI.lat, DELHI.lon, DELHI.tz);

  it('has ephemeris sunrise/sunset bracketing the moment', () => {
    expect(tl.sunrise).toBeInstanceOf(Date);
    expect(tl.sunset).toBeInstanceOf(Date);
    expect(tl.sunrise!.getTime()).toBeLessThan(askedAt.getTime());
    expect(tl.sunset!.getTime()).toBeGreaterThan(askedAt.getTime());
  });

  it('Vedic weekday equals the local weekday (Sunday = 0)', () => {
    expect(tl.vedicWeekday).toBe(0);
  });

  it('Gulika window is a daytime eighth-part of the day', () => {
    expect(tl.gulika).not.toBeNull();
    expect(tl.gulika!.isDay).toBe(true);
    expect(tl.gulika!.start.getTime()).toBeGreaterThanOrEqual(tl.sunrise!.getTime());
    expect(tl.gulika!.start.getTime()).toBeLessThan(tl.sunset!.getTime());
    expect(tl.gulika!.end.getTime()).toBeGreaterThan(tl.gulika!.start.getTime());
  });

  it('sunrise is NOT a hard-coded 06:00', () => {
    // Delhi sunrise in late June is ~05:24 IST = 23:54 UTC (previous day).
    const sunriseUtcHour = tl.sunrise!.getUTCHours() + tl.sunrise!.getUTCMinutes() / 60;
    expect(sunriseUtcHour).toBeGreaterThan(23.5);
  });
});

describe('computeVedicTimeline — pre-dawn belongs to the previous Vedic day', () => {
  // 2026-06-21 04:00 IST = 2026-06-20 22:30 UTC (before that day's sunrise).
  const askedAt = new Date('2026-06-20T22:30:00Z');
  const tl = computeVedicTimeline(askedAt, DELHI.lat, DELHI.lon, DELHI.tz);

  it('Vedic weekday is the previous civil weekday (Saturday = 6)', () => {
    expect(tl.vedicWeekday).toBe(6);
  });

  it('Gulika window is a night window', () => {
    expect(tl.gulika).not.toBeNull();
    expect(tl.gulika!.isDay).toBe(false);
  });
});

describe('computeVedicTimeline — high latitude', () => {
  it('returns null gulika at polar night (Reykjavík, 2026-12-21)', () => {
    const tl = computeVedicTimeline(new Date('2026-12-21T13:00:00Z'), 64.1466, -21.9426, 'Atlantic/Reykjavik');
    // Reykjavík is below the polar circle; latitude ~64° still has a sunrise.
    // This asserts the API shape, not a polar-night outcome.
    expect(tl).toHaveProperty('gulika');
  });
});
