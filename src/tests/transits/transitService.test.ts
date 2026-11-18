import { describe, it, expect } from 'vitest';
import { transitService } from '@/services/transits/transitService';

const natal = {
  lagnaSign: 0,
  planets: {
    Sun: 15,
    Moon: 45,
    Mars: 80,
    Mercury: 20,
    Jupiter: 210,
    Venus: 40,
    Saturn: 300,
    Rahu: 120,
    Ketu: 300,
  },
};

describe('TransitService', () => {
  it('builds a sidereal snapshot with panchang and SAV', async () => {
    const snap = await transitService.snapshot(natal, new Date('2026-10-07T06:00:00Z'));
    expect(snap.positions.length).toBeGreaterThan(0);
    expect(snap.sav).toHaveLength(12);
    expect(snap.panchang.nakshatra.name).toBeTruthy();
    expect(snap.panchang.tithi.paksha).toMatch(/Shukla|Krishna/);
  });

  it('detects at least one Moon ingress over two weeks', async () => {
    const from = new Date('2026-10-01T00:00:00Z');
    const to = new Date('2026-10-15T00:00:00Z');
    const events = await transitService.ingressCalendar(natal, from, to);
    expect(events.some((e) => e.graha === 'Moon')).toBe(true);
  });
});
