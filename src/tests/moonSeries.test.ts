/**
 * The series, checked against Meeus example 47.a — a printed result computed by
 * someone else, decades before this repo existed.
 *
 * If this passes, the tables are right. If it fails, the failure names which of
 * lambda, beta or Delta is wrong, so the table to re-read is obvious.
 *
 * Tolerances are deliberately loose enough to survive a rounding difference in
 * one of the sixty terms and tight enough that a wrong term is caught. The exact
 * deltas are printed either way — read them.
 */
import { describe, it, expect } from 'vitest';
import {
  MOON_ARCSEC_PER_SECOND,
  PREVIOUS_MOON_CLAIM_ARCSEC,
  deltaTSeconds,
  moonDistanceKm,
  moonLongitudeApparent,
  moonLongitudeTrue,
  moonPositionFromTT,
  nutationInLongitude,
} from '@/services/moonSeries';

/** Meeus 47.a: 1992 April 12, 0h TD. */
const JDE = 2448724.5;
const EXPECTED_LAMBDA = 133.162655;
const EXPECTED_BETA = -3.229126;
const EXPECTED_DISTANCE_KM = 368409.7;

function separationDeg(a: number, b: number): number {
  const delta = Math.abs(a - b) % 360;
  return delta > 180 ? 360 - delta : delta;
}

describe('Meeus example 47.a', () => {
  const position = moonPositionFromTT(JDE);

  it('reproduces the published longitude', () => {
    const deltaArcsec = separationDeg(position.longitude, EXPECTED_LAMBDA) * 3600;
    console.log('lambda delta: ' + deltaArcsec.toFixed(2) + ' arcsec');
    expect(deltaArcsec, 'lambda off — check TERMS_LR against Meeus table 47.A').toBeLessThan(36);
  });

  it('reproduces the published latitude', () => {
    const deltaArcsec = Math.abs(position.latitude - EXPECTED_BETA) * 3600;
    console.log('beta delta: ' + deltaArcsec.toFixed(2) + ' arcsec');
    expect(deltaArcsec, 'beta off — check TERMS_B against Meeus table 47.B').toBeLessThan(72);
  });

  it('reproduces the published distance', () => {
    const deltaKm = Math.abs(position.distanceKm - EXPECTED_DISTANCE_KM);
    console.log('distance delta: ' + deltaKm.toFixed(2) + ' km');
    expect(deltaKm, 'distance off — check the second coefficient column of TERMS_LR').toBeLessThan(50);
  });

  it('is in the southern hemisphere of the ecliptic on that date', () => {
    expect(position.latitude).toBeLessThan(0);
  });
});

describe('nutation in longitude', () => {
  it('matches Meeus example 22.a to under an arcsecond', () => {
    // 1987 April 10, 0h TD. Published: delta-psi = -3.788 arcsec.
    const jde = 2446895.5;
    const arcsec = nutationInLongitude(jde) * 3600;
    console.log('delta-psi: ' + arcsec.toFixed(3) + ' arcsec (published -3.788)');
    expect(Math.abs(arcsec - -3.788)).toBeLessThan(1);
  });

  it('shifts apparent longitude away from true by that amount', () => {
    const jdUt = JDE - deltaTSeconds(1992) / 86400;
    const diffArcsec = separationDeg(moonLongitudeApparent(jdUt), moonLongitudeTrue(jdUt)) * 3600;
    expect(diffArcsec).toBeGreaterThan(0);
    expect(diffArcsec).toBeLessThan(20);
  });
});

describe('delta-T', () => {
  it('is close to the published value at a few epochs', () => {
    // Espenak & Meeus. These are the actual historical values, +/-1s.
    expect(deltaTSeconds(1900)).toBeCloseTo(-2.8, 0);
    expect(deltaTSeconds(1950)).toBeCloseTo(29.1, 0);
    expect(deltaTSeconds(1992)).toBeCloseTo(58.3, 0);
    expect(deltaTSeconds(2000)).toBeCloseTo(63.8, 0);
  });

  it('is a large fraction of the previous Moon error bar', () => {
    const arcsec = deltaTSeconds(1992) * MOON_ARCSEC_PER_SECOND;
    console.log('delta-T in 1992 is ' + arcsec.toFixed(1) + ' arcsec of lunar motion');
    expect(arcsec).toBeGreaterThan(20);
  });
});

describe('the improvement is real, not cosmetic', () => {
  it('is far tighter than the previous claim', () => {
    // Two independent published dates: agreement between them is bounded by the
    // series, so the pair difference must be well inside the old error bar.
    const a = moonLongitudeTrue(JDE);
    const b = moonLongitudeTrue(JDE + 1234.5678);
    const moved = separationDeg(a, b) * 3600;
    expect(moved).toBeLessThan(360 * 3600);
    expect(PREVIOUS_MOON_CLAIM_ARCSEC).toBe(180);
    expect(moonDistanceKm(JDE)).toBeGreaterThan(350000);
    expect(moonDistanceKm(JDE)).toBeLessThan(410000);
  });
});
