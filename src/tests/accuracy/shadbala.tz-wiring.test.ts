/**
 * shadbala.tz-wiring.test.ts
 *
 * Proves the *resolved historical* birth offset reaches the Shadbala layer.
 *
 * India ran on UTC+6:30 through most of WWII (1942-09-01 … 1945-10-14) rather
 * than +5:30. If any chart path defaults to a flat +5:30, the ascendant drifts
 * by ~15° for an hour of error and every house-based strength silently changes.
 * `src/tests/chartTimezoneWiring.test.ts` guards the call sites structurally;
 * this test guards the *effect* — that the correction actually moves the
 * interpretive output, and by the expected sign and magnitude.
 *
 * The precision chart is deterministic given its inputs, so these are exact
 * assertions, not probabilistic ones.
 */

import { describe, it, expect } from 'vitest';

import { resolveBirthTimezone } from '@/lib/birthTimezone';
import { calculatePreciseChart } from '@/services/precisionEphemerisService';
import { calculateShadbala, type PlanetData } from '@/services/shadabalaService';
import * as R from '../../../tools/accuracy/shadbalaReference.mjs';

// IN-1943-BOM-002 — the corpus's wartime chart (UTC+6:30, not IST).
const WARTIME = {
  id: 'IN-1943-BOM-002',
  date: '1943-06-15',
  time: '04:27',
  lat: 19.076,
  lon: 72.8777,
  place: 'Mumbai',
};

const FLAT_IST = 5.5;

function skyFor(offsetHours: number): PlanetData[] {
  const chart = calculatePreciseChart(
    WARTIME.date, WARTIME.time, WARTIME.lat, WARTIME.lon, offsetHours,
  );
  const byName = new Map(chart.planets.map((p) => [p.name, p]));
  return R.PLANETS.map((name) => {
    const p = byName.get(name)!;
    return {
      name,
      rashiIndex: p.rashiIndex,
      house: p.house,
      degrees: p.degrees,
      isRetrograde: p.isRetrograde,
      longitude: p.siderealLongitude,
    };
  });
}

describe('birth-offset resolution reaches the Shadbala layer', () => {
  it('resolves the 1943 wartime offset to +6:30, not +5:30', () => {
    const resolved = resolveBirthTimezone({ date: WARTIME.date, location: WARTIME.place });
    expect(resolved).not.toBeNull();
    expect(resolved!.offsetHours).toBe(6.5);
    expect(resolved!.offsetHours).not.toBe(FLAT_IST);
  });

  it('the one-hour offset error moves the ascendant by 10°–20°', () => {
    const wartime = calculatePreciseChart(
      WARTIME.date, WARTIME.time, WARTIME.lat, WARTIME.lon, 6.5,
    );
    const flat = calculatePreciseChart(
      WARTIME.date, WARTIME.time, WARTIME.lat, WARTIME.lon, FLAT_IST,
    );
    let delta = Math.abs(wartime.ascendant.siderealLongitude - flat.ascendant.siderealLongitude);
    if (delta > 180) delta = 360 - delta;
    expect(delta).toBeGreaterThan(10);
    expect(delta).toBeLessThan(20);
  });

  it('the offset changes the Shadbala verdicts — the correction is not decorative', () => {
    const wartime = calculateShadbala(skyFor(6.5), true, 6);
    const flat = calculateShadbala(skyFor(FLAT_IST), true, 6);

    // Same grahas, same order — only the numbers moved.
    expect(wartime.planets.map((r) => r.planet)).toEqual(flat.planets.map((r) => r.planet));

    const changed = wartime.planets.filter((r, i) => r.totalRupas !== flat.planets[i].totalRupas);
    expect(changed.length, 'at least one graha must shift with the offset').toBeGreaterThan(0);

    // The shift is a real recomputation, not a rounding wobble: the total moves
    // by more than a thousandth of a Rupa for at least one graha.
    const moved = changed.some((r) => {
      const before = flat.planets.find((f) => f.planet === r.planet)!;
      return Math.abs(r.totalRupas - before.totalRupas) > 1e-3;
    });
    expect(moved).toBe(true);
  });
});
