// SPDX-License-Identifier: MIT
/**
 * src/tests/accuracy/ayanamsaCore.golden.test.ts
 *
 * Independent golden/regression tests for `src/lib/vedic/ayanamsaCore.ts`.
 *
 * WHY: an independent audit found that the ayanamsa core — the module the whole
 * sidereal stack delegates to — had no direct unit coverage. `deltaTSeconds`
 * out-of-range behaviour, `boundaryMargins`, the anchor table, the throw
 * contracts and the tropical↔sidereal round-trip were all untested. A single
 * wrong anchor (historically the Fagan-Bradley 24.0440 typo) would have passed
 * every existing suite.
 *
 * These tests pin *observable invariants and locked anchors*, not a
 * re-derivation of the polynomial, so they fail loudly if an anchor or a
 * boundary rule drifts.
 */

import { describe, it, expect } from 'vitest';
import {
  AYANAMSA_ANCHORS,
  AYANAMSA_ENGINE_VERSION,
  AYANAMSA_SYSTEMS,
  ayanamsaAt,
  ayanamsaDegrees,
  boundaryMargins,
  deltaTSeconds,
  jdTTFromUT,
  pendingAnchors,
  siderealFromTropical,
  systemsDisagreeAcrossBoundary,
  tropicalFromSidereal,
} from '../../lib/vedic/ayanamsaCore';
import { validateLahiriFormula } from '../../lib/vedic/ayanamsaEngine';

// Reference Julian Days (UT).
const JD_1900 = 2415020.5;
const JD_J2000 = 2451545.0;
const JD_2026 = 2461288.0; // 2026-09-04

describe('ayanamsaCore — engine identity', () => {
  it('reports a fixed engine version', () => {
    expect(AYANAMSA_ENGINE_VERSION).toBe('2.0.0');
  });

  it('exposes exactly the six documented systems with SE_SIDM ids', () => {
    expect(AYANAMSA_SYSTEMS).toEqual([
      'Lahiri',
      'Raman',
      'KP',
      'Yukteshwar',
      'FaganBradley',
      'TrueCitra',
    ]);
    expect(AYANAMSA_ANCHORS.Lahiri.seSidMode).toBe(1);
    expect(AYANAMSA_ANCHORS.Raman.seSidMode).toBe(3);
    expect(AYANAMSA_ANCHORS.KP.seSidMode).toBe(5);
    expect(AYANAMSA_ANCHORS.Yukteshwar.seSidMode).toBe(7);
    expect(AYANAMSA_ANCHORS.FaganBradley.seSidMode).toBe(0);
    expect(AYANAMSA_ANCHORS.TrueCitra.seSidMode).toBe(27);
  });

  it('only Lahiri is golden-locked; the rest are pending', () => {
    const pending = pendingAnchors();
    expect(pending).not.toContain('Lahiri');
    expect(pending.sort()).toEqual(
      ['Raman', 'KP', 'Yukteshwar', 'FaganBradley', 'TrueCitra'].sort(),
    );
  });

  it('FaganBradley is NOT the historically defective 24.0440 value', () => {
    // Guard against the regression this whole module exists to prevent.
    expect(Math.abs(AYANAMSA_ANCHORS.FaganBradley.valueAtJ2000 - 24.74261)).toBeLessThan(1e-5);
    expect(Math.abs(AYANAMSA_ANCHORS.FaganBradley.valueAtJ2000 - 24.044)).toBeGreaterThan(0.5);
  });

  it('TrueCitra is flagged as a true-star system', () => {
    expect(AYANAMSA_ANCHORS.TrueCitra.trueStar).toBe(true);
    expect(AYANAMSA_ANCHORS.Lahiri.trueStar).toBe(false);
  });
});

describe('ayanamsaCore — Lahiri anchor & monotonicity', () => {
  it('evaluates at the locked J2000 anchor', () => {
    // ayanamsaAt takes UT and internally moves to TT, so the value is the anchor
    // plus a ~1e-7 deg precession increment over delta-T.
    expect(Math.abs(ayanamsaDegrees(JD_J2000, 'Lahiri') - AYANAMSA_ANCHORS.Lahiri.valueAtJ2000)).toBeLessThan(1e-6);
  });

  it('is monotonically increasing 1900 -> 2000 -> 2026', () => {
    const y1900 = ayanamsaDegrees(JD_1900, 'Lahiri');
    const y2000 = ayanamsaDegrees(JD_J2000, 'Lahiri');
    const y2026 = ayanamsaDegrees(JD_2026, 'Lahiri');
    expect(y1900).toBeLessThan(y2000);
    expect(y2000).toBeLessThan(y2026);
  });

  it('places FaganBradley ~0.89 deg above Lahiri and Raman ~1.39 deg below it', () => {
    const lahiri = ayanamsaDegrees(JD_2026, 'Lahiri');
    const fb = ayanamsaDegrees(JD_2026, 'FaganBradley');
    const raman = ayanamsaDegrees(JD_2026, 'Raman');
    // All three share the same precession term, so the J2000 anchors set the gap.
    expect(fb - lahiri).toBeGreaterThan(0.85);
    expect(fb - lahiri).toBeLessThan(0.93);
    expect(lahiri - raman).toBeGreaterThan(1.38);
    expect(lahiri - raman).toBeLessThan(1.41);
  });

  it('structural self-check passes end to end', () => {
    const results = validateLahiriFormula();
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.pass, `${r.check} (${r.detail})`).toBe(true);
    }
  });
});

describe('ayanamsaCore — time scales', () => {
  it('delta-T is in range for the modern era and flagged out of range for 1800', () => {
    expect(deltaTSeconds(JD_J2000).inRange).toBe(true);
    expect(deltaTSeconds(JD_1900).inRange).toBe(true);
    // ~1800-01-01: outside the 1900–2150 polynomial window -> fail-visible.
    expect(deltaTSeconds(2378496.5).inRange).toBe(false);
    expect(deltaTSeconds(2378496.5).seconds).toBe(0);
  });

  it('jdTTFromUT advances the Julian Day by a positive delta-T', () => {
    const { jdTT, inRange } = jdTTFromUT(JD_J2000);
    expect(inRange).toBe(true);
    expect(jdTT).toBeGreaterThan(JD_J2000);
    // ~64 s in 2000 -> ~0.00074 day.
    expect(jdTT - JD_J2000).toBeGreaterThan(0.0006);
    expect(jdTT - JD_J2000).toBeLessThan(0.0009);
  });
});

describe('ayanamsaCore — throw contracts (fail closed)', () => {
  it('rejects non-positive / non-finite Julian Days', () => {
    expect(() => ayanamsaAt(0)).toThrow(RangeError);
    expect(() => ayanamsaAt(-1)).toThrow(RangeError);
    expect(() => ayanamsaAt(Number.NaN)).toThrow(RangeError);
    expect(() => ayanamsaAt(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });

  it('rejects an unknown ayanamsa system', () => {
    // @ts-expect-error — deliberately invalid system string
    expect(() => ayanamsaAt(JD_J2000, 'NotASystem')).toThrow(RangeError);
  });

  it('boundaryMargins rejects a non-finite longitude', () => {
    expect(() => boundaryMargins(Number.NaN)).toThrow(RangeError);
  });
});

describe('ayanamsaCore — boundary margins', () => {
  it('is exactly zero on a rashi/nakshatra/pada boundary', () => {
    const m = boundaryMargins(0);
    expect(m.toRashi).toBe(0);
    expect(m.toNakshatra).toBe(0);
    expect(m.toPada).toBe(0);
    expect(m.nearest).toBe(0);
  });

  it('returns non-negative margins, each no larger than half its span', () => {
    const m = boundaryMargins(15.0);
    expect(m.toRashi).toBeGreaterThanOrEqual(0);
    expect(m.toRashi).toBeLessThanOrEqual(15);
    expect(m.toNakshatra).toBeLessThanOrEqual(360 / 27 / 2);
    expect(m.toPada).toBeLessThanOrEqual(360 / 108 / 2);
    expect(m.nearest).toBe(Math.min(m.toRashi, m.toNakshatra, m.toPada));
  });
});

describe('ayanamsaCore — sidereal conversion is exact and reversible', () => {
  it('round-trips tropical -> sidereal -> tropical', () => {
    for (const lon of [0, 13.5, 123.456, 359.9]) {
      const sid = siderealFromTropical(lon, JD_J2000, 'Lahiri');
      const back = tropicalFromSidereal(sid, JD_J2000, 'Lahiri');
      const wrapped = (((back - lon) % 360) + 360) % 360;
      expect(Math.min(wrapped, 360 - wrapped)).toBeLessThan(1e-9);
    }
  });

  it('subtracts the ayanamsa exactly once', () => {
    const ayan = ayanamsaDegrees(JD_J2000, 'Lahiri');
    const expected = (360 - ayan) % 360; // tropical 0 -> sidereal -ayanamsa
    expect(Math.abs(siderealFromTropical(0, JD_J2000, 'Lahiri') - expected)).toBeLessThan(1e-9);
  });

  it('systemsDisagreeAcrossBoundary returns a boolean and is deterministic', () => {
    expect(typeof systemsDisagreeAcrossBoundary(15, JD_J2000)).toBe('boolean');
    expect(systemsDisagreeAcrossBoundary(15, JD_J2000)).toBe(
      systemsDisagreeAcrossBoundary(15, JD_J2000),
    );
  });
});
