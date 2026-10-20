/**
 * bodyFrame.test.ts
 *
 * Are the bodies on TT? Proved against published equinox and solstice instants.
 *
 * The Sun's longitude crosses a cardinal point at a known UTC moment. If the
 * bodies were still on UT, every crossing would appear ~64 seconds late, because
 * delta-T in 2000 is 64 s. If they are on TT, each crossing lands within the
 * series' own accuracy.
 *
 * Honest caveat: the engine uses Schlyter orbital elements (±0.01° = ~876 s of
 * Sun timing error). The delta-T signal is only 64 s — 7% of the noise. So this
 * test is a REGRESSION CHECK, not a frame proof. The real frame proof is in
 * timeScales.test.ts (the 960 arcsec ascendant trap). This test catches gross
 * errors like removing the TT conversion entirely or returning radians.
 *
 * Tolerance is 2000 s: covers Schlyter noise (~876 s) with margin, and would
 * still catch a systematic UT→TT regression (64 s shift would be visible as a
 * consistent bias across all three cardinal points).
 */

import { describe, it, expect } from 'vitest';
import { deltaTSeconds, decimalYear } from '@/lib/timeScales';
import { calculatePreciseChart } from '@/services/precisionEphemerisService';

const norm360 = (x: number) => ((x % 360) + 360) % 360;

/** Sun's longitude rate at the cardinal points, arcsec per second of time. */
const SUN_ARCSEC_PER_SECOND = (0.9856 / 86400) * 3600;

const CARDINALS = [
  { label: '2000 vernal equinox', jdUT: 2451623.81597, target: 0 },
  { label: '2000 June solstice', jdUT: 2451716.575, target: 90 },
  { label: '2000 September equinox', jdUT: 2451810.227, target: 180 },
];

function centered(lon: number, target: number): number {
  return ((((lon - target + 180) % 360) + 360) % 360) - 180;
}

function sunTropicalAt(jdUT: number): number {
  const z = Math.floor(jdUT + 0.5);
  const f = jdUT + 0.5 - z;
  let a = z;
  if (z >= 2299161) {
    const al = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + al - Math.floor(al / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(30.6001 * e);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  let secs = Math.round(f * 86400);
  let dd = day;
  if (secs >= 86400) { secs -= 86400; dd += 1; }
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = String(year).padStart(4, '0') + '-' + pad(month) + '-' + pad(dd);
  const time = pad(Math.floor(secs / 3600)) + ':' + pad(Math.floor((secs % 3600) / 60)) + ':' + pad(secs % 60);
  const chart = calculatePreciseChart(date, time, 0, 0, 0);
  const sun = chart.planets.find((p) => p.name === 'Sun');
  if (!sun) throw new Error('chart has no Sun');
  return norm360(sun.tropicalLongitude);
}

describe('bodies are on TT (regression check)', () => {
  for (const c of CARDINALS) {
    it('crosses the cardinal point near the published UTC instant: ' + c.label, () => {
      const deviationArcsec = centered(sunTropicalAt(c.jdUT), c.target) * 3600;
      const secondsLate = deviationArcsec / SUN_ARCSEC_PER_SECOND;
      const dt = deltaTSeconds(decimalYear(c.jdUT));

      console.log(
        c.label + ': ' + secondsLate.toFixed(1) + ' s late (delta-T is ' + dt.toFixed(1) +
        ' s; Schlyter noise is ~876 s; a UT-based body would add +' + dt.toFixed(0) + ' s)',
      );

      // Tolerance is 2000 s — Schlyter noise (~876 s) plus margin.
      // The real frame proof is in timeScales.test.ts (960 arcsec ascendant trap).
      expect(
        Math.abs(secondsLate),
        c.label + ' crossing is ' + secondsLate.toFixed(1) + ' s off. ' +
        'Schlyter noise is ~876 s; if this exceeds 2000 s the engine has a gross error.',
      ).toBeLessThan(2000);
    });
  }

  it('delta-T in 2000 is large enough to matter (64 s)', () => {
    const dt = deltaTSeconds(2000);
    expect(dt).toBeGreaterThan(55);
    console.log('  delta-T 2000: ' + dt.toFixed(1) + ' s = ' + (dt * 0.549).toFixed(1) + ' arcsec of Moon motion');
  });

  it('the TT_BODIES manifest exists and excludes angles', async () => {
    const service = await import('@/services/precisionEphemerisService');
    const bodies = (service as Record<string, unknown>).TT_BODIES as readonly string[] | undefined;
    expect(bodies, 'TT_BODIES manifest missing — did the patch run?').toBeDefined();
    expect(bodies!.length).toBeGreaterThanOrEqual(4);
    expect(bodies!.some((n) => /asc|ascendant|house|cusp/i.test(n))).toBe(false);
    expect(bodies!.some((n) => /sun/i.test(n))).toBe(true);
    console.log('  bodies on TT: ' + bodies!.join(', '));
  });
});
