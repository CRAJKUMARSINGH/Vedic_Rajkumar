/**
 * engineTimeScaleSplit.test.ts — the UT/TT rule, enforced on the fallback engine.
 *
 * Rule (src/lib/timeScales.ts):
 *   BODIES  (Sun, Moon, planets, nodes) and the ayanamsa  →  TT  (jdTT)
 *   ANGLES  (ascendant, MC, house cusps, GMST)            →  UT  (jdUT)
 *
 * The engine previously evaluated *everything* at one UT Julian Day. This suite
 * proves the split is now real:
 *   - a ΔT=0 mock must leave the ascendant untouched (angles are UT-fed), while
 *     the Sun/Moon move by exactly ΔT of their own motion (bodies are TT-fed);
 *   - the source feeds jdTT to the bodies and jdUT to the angles.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { deltaTSeconds } from '@/lib/timeScales';

const DATE = '2000-06-15';
const TIME = '12:00';
const LAT = 28.61;
const LON = 77.23;

/**
 * Load the engine with ΔT either live (real) or neutralised (jdTT === jdUT).
 * Neutralising ΔT is the only way to observe the split from outside the module.
 */
async function loadChart(withDeltaT: boolean) {
  vi.resetModules();
  if (withDeltaT) {
    vi.doUnmock('@/lib/timeScales');
  } else {
    const actual = await vi.importActual<typeof import('@/lib/timeScales')>('@/lib/timeScales');
    vi.doMock('@/lib/timeScales', () => ({ ...actual, jdTTFromUT: (jd: number) => jd }));
  }
  const mod = await import('@/services/precisionEphemerisService');
  return mod.calculatePreciseChart(DATE, TIME, LAT, LON, 5.5);
}

afterEach(() => {
  vi.doUnmock('@/lib/timeScales');
  vi.resetModules();
});

const sidOf = (chart: Awaited<ReturnType<typeof loadChart>>, name: string) =>
  chart.planets.find((p) => p.name === name)!.siderealLongitude;

describe('precision engine UT/TT split', () => {
  it('ΔT is non-trivial at the test epoch (~64 s in 2000)', () => {
    expect(deltaTSeconds(2000)).toBeGreaterThan(60);
  });

  it('feeds TT to bodies: Sun & Moon shift by exactly delta-T of their motion', async () => {
    const withDT = await loadChart(true);
    const noDT   = await loadChart(false);

    const sunShift  = Math.abs(sidOf(withDT, 'Sun')  - sidOf(noDT, 'Sun'));
    const moonShift = Math.abs(sidOf(withDT, 'Moon') - sidOf(noDT, 'Moon'));

    // Sun ~0.986°/day → ~7e-4°; Moon ~13°/day → ~1e-2°. Sign is irrelevant.
    expect(sunShift).toBeGreaterThan(0.0003);
    expect(sunShift).toBeLessThan(0.002);
    expect(moonShift).toBeGreaterThan(0.005);
    expect(moonShift).toBeLessThan(0.02);
  });

  it('feeds UT to angles: the ascendant is unchanged by delta-T', async () => {
    const withDT = await loadChart(true);
    const noDT   = await loadChart(false);

    // Same UT instant → same rising degree. If TT leaked into the angle path,
    // this would drift by ~0.27° (the documented "ascendant trap").
    expect(withDT.ascendant.tropicalLongitude).toBeCloseTo(noDT.ascendant.tropicalLongitude, 4);
    expect(withDT.ascendant.siderealLongitude).toBeCloseTo(noDT.ascendant.siderealLongitude, 4);
  });

  it('reports the UT Julian Day, not the TT one', async () => {
    const chart = await loadChart(true);
    const { dateTimeToJD } = await import('@/services/precisionEphemerisService');
    expect(chart.julianDay).toBeCloseTo(dateTimeToJD(DATE, TIME, 5.5), 9);
  });
});

describe('precision engine wiring (source)', () => {
  const src = readFileSync(
    join(process.cwd(), 'src', 'services', 'precisionEphemerisService.ts'),
    'utf8',
  );

  it('imports the UT→TT split', () => {
    expect(src).toMatch(/import\s*\{[^}]*\bjdTTFromUT\b[^}]*\}\s*from\s*'@\/lib\/timeScales'/);
  });

  it('evaluates bodies and the ayanamsa at jdTT', () => {
    expect(src).toMatch(/getLahiriAyanamsa\(jdTT\)/);
    expect(src).toMatch(/getSunLongitude\(jdTT\)/);
    expect(src).toMatch(/getMoonLongitude\(jdTT\)/);
    expect(src).toMatch(/getMeanNode\(jdTT\)/);
  });

  it('evaluates the ascendant at jdUT', () => {
    expect(src).toMatch(/calcAscendant\(jdUT,/);
    expect(src).not.toMatch(/calcAscendant\(jdTT,/);
  });
});
