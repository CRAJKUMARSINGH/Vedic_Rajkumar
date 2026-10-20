/**
 * timeScales.test.ts
 *
 * Verifies delta-T values, the UT/TT split, and the "ascendant trap":
 * passing TT where UT is required moves the ascendant by ~960 arcsec (0.27°).
 */
import { describe, it, expect } from 'vitest';
import {
  deltaTSeconds,
  jdTTFromUT,
  timeScalesFromJD,
  ascendantTrapArcsec,
  assertJulianDay,
  ARCSEC_PER_SECOND_OF_ROTATION,
} from '@/lib/timeScales';
import { dateTimeToJD } from '@/services/precisionEphemerisService';

describe('deltaTSeconds', () => {
  it('matches published Espenak & Meeus values at key epochs', () => {
    expect(deltaTSeconds(1900)).toBeCloseTo(-2.8, 0);
    expect(deltaTSeconds(1950)).toBeCloseTo(29.1, 0);
    expect(deltaTSeconds(1992)).toBeCloseTo(58.3, 0);
    expect(deltaTSeconds(2000)).toBeCloseTo(63.8, 0);
  });

  it('is continuous: no jump > 5 s at boundary years', () => {
    const boundaries = [1600, 1700, 1800, 1860, 1900, 1920, 1941, 1961, 1986, 2005, 2050];
    for (const y of boundaries) {
      const diff = Math.abs(deltaTSeconds(y + 0.001) - deltaTSeconds(y - 0.001));
      expect(diff, `discontinuity at year ${y}`).toBeLessThan(5);
    }
  });

  it('is positive in 2000 (clocks ran fast relative to Earth rotation)', () => {
    expect(deltaTSeconds(2000)).toBeGreaterThan(60);
  });
});

describe('timeScalesFromJD', () => {
  const jd = dateTimeToJD('2000-10-26', '00:50', 5.5);

  it('jdTT - jdUT = deltaT / 86400', () => {
    const s = timeScalesFromJD(jd);
    // (jdTT - jdUT) * 86400 === deltaT by construction; 4 dp is the float
    // limit after the ~2.45e6-magnitude JD subtraction (catastrophic cancellation).
    expect((s.jdTT - s.jdUT) * 86400).toBeCloseTo(s.deltaT, 4);
  });

  it('rejects a non-JD value', () => {
    expect(() => assertJulianDay(51544, 'jd')).toThrow(/not a Julian Day/);
    expect(() => assertJulianDay(1698000000, 'jd')).toThrow(/not a Julian Day/);
  });

  it('accepts a valid JD', () => {
    expect(() => assertJulianDay(2451545.0, 'jd')).not.toThrow();
  });
});

describe('the ascendant trap', () => {
  it('would be ~960 arcsec if TT were passed to the LST formula in 2000', () => {
    const jd     = dateTimeToJD('2000-10-26', '00:50', 5.5);
    const jdTT   = jdTTFromUT(jd);
    const dtSec  = (jdTT - jd) * 86400;
    const trapAs = dtSec * ARCSEC_PER_SECOND_OF_ROTATION;
    expect(trapAs).toBeGreaterThan(800);
    expect(ascendantTrapArcsec(jd)).toBeCloseTo(trapAs, 1);
  });

  it('is near zero in 1900 (delta-T ≈ 0 then)', () => {
    const jd = dateTimeToJD('1900-06-15', '12:00', 0);
    expect(ascendantTrapArcsec(jd)).toBeLessThan(100); // ~45 arcsec at 1900
  });
});

describe('the patch reached the bodies and only the bodies', () => {
  it('records which functions now take TT, and never an angle', async () => {
    const service = await import('@/services/precisionEphemerisService');
    const bodies = (service as Record<string, unknown>).TT_BODIES as string[] | undefined;

    expect(bodies, 'TT_BODIES manifest missing — did the slice-9 patch run?').toBeDefined();
    expect(bodies!.length).toBeGreaterThanOrEqual(4);
    expect(bodies!.some((n) => /sun/i.test(n))).toBe(true);
    expect(
      bodies!.some((n) => /asc|ascendant|midheaven|house|cusp/i.test(n)),
      'an angle function is on the TT path — this is the 960 arcsec trap',
    ).toBe(false);

    console.log('bodies on TT: ' + bodies!.join(', '));
  });

  it('rotation is 15 arcsec per second, which is why this slice exists', () => {
    expect(ARCSEC_PER_SECOND_OF_ROTATION).toBe(15);
  });
});
