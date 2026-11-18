/**
 * shadbala.analytic.test.ts
 *
 * Closed-form checks on the independent Shadbala oracle
 * (tools/accuracy/shadbalaReference.mjs). These assert the *rules*, not the
 * engine: every expectation below is an arithmetic identity that follows from
 * BPHS's Graha Bala chapter, so a failure here means the oracle itself drifted —
 * which would silently invalidate every value comparison built on top of it.
 *
 * Units: virupas (shashtiamsas). 60 virupas = 1 rupa.
 *
 * No `@/` imports on purpose — the oracle is deliberately independent of src/.
 */

import { describe, it, expect } from 'vitest';
import * as R from '../../../tools/accuracy/shadbalaReference.mjs';

const ALL_LON = 360;

describe('Shadbala oracle — Sthana Bala closed forms', () => {
  it('Uchcha Bala is 60 at exaltation, 0 at debilitation, 30 at ±90°', () => {
    for (const planet of R.PLANETS) {
      const exalt = R.EXALTATION[planet];
      const debil = (exalt + 180) % 360;
      expect(R.uchchaBala(planet, exalt), `${planet} at exaltation`).toBeCloseTo(60, 9);
      expect(R.uchchaBala(planet, debil), `${planet} at debilitation`).toBeCloseTo(0, 9);
      expect(R.uchchaBala(planet, (exalt + 90) % 360), `${planet} +90°`).toBeCloseTo(30, 9);
      expect(R.uchchaBala(planet, (exalt + 270) % 360), `${planet} -90°`).toBeCloseTo(30, 9);
    }
  });

  it('Kendradi Bala is 60 / 30 / 15 by house class', () => {
    for (const h of [1, 4, 7, 10]) expect(R.kendradiBala(h), `house ${h}`).toBe(60);
    for (const h of [2, 5, 8, 11]) expect(R.kendradiBala(h), `house ${h}`).toBe(30);
    for (const h of [3, 6, 9, 12]) expect(R.kendradiBala(h), `house ${h}`).toBe(15);
  });

  it('Ojhayugmarasyamsa Bala is 15 or 0, and school B withholds it from neuters', () => {
    // Aries (lon 0) is the first/odd sign.
    for (const p of ['Sun', 'Mars', 'Jupiter']) {
      expect(R.ojhayugmarasyamsaBala(p, 0), `${p} odd sign`).toBe(15);
      expect(R.ojhayugmarasyamsaBala(p, 30), `${p} even sign`).toBe(0);
    }
    for (const p of ['Moon', 'Venus']) {
      expect(R.ojhayugmarasyamsaBala(p, 30), `${p} even sign`).toBe(15);
      expect(R.ojhayugmarasyamsaBala(p, 0), `${p} odd sign`).toBe(0);
    }
    // Mercury/Saturn are neuters: school A grants odd-sign bala, school B does not.
    expect(R.ojhayugmarasyamsaBala('Mercury', 0, 'A')).toBe(15);
    expect(R.ojhayugmarasyamsaBala('Mercury', 0, 'B')).toBe(0);
    expect(R.ojhayugmarasyamsaBala('Saturn', 0, 'A')).toBe(15);
    expect(R.ojhayugmarasyamsaBala('Saturn', 0, 'B')).toBe(0);
  });

  it('Drekkana Bala is 15 when the planet owns the decanate, else 0', () => {
    // Decanate 0 (0°–10° in sign) → Sun/Mars/Jupiter; 1 → Mercury/Saturn; 2 → Moon/Venus.
    expect(R.drekkanaBala('Sun', 5)).toBe(15);
    expect(R.drekkanaBala('Sun', 15)).toBe(0);
    expect(R.drekkanaBala('Saturn', 15)).toBe(15);
    expect(R.drekkanaBala('Moon', 25)).toBe(15);
    expect(R.drekkanaBala('Jupiter', 25)).toBe(0);
  });

  it('DIGNITY_POINTS.moolatrikona × 7 equals the Saptavargaja ceiling', () => {
    expect(R.DIGNITY_POINTS.moolatrikona * 7).toBe(315);
    expect(R.MAXIMA.saptavargaja).toBe(315);
  });

  it('every Sthana component stays inside its declared ceiling', () => {
    for (const planet of R.PLANETS) {
      for (let lon = 0; lon < ALL_LON; lon += 3) {
        expect(R.uchchaBala(planet, lon)).toBeLessThanOrEqual(R.MAXIMA.uchcha + 1e-9);
        expect(R.uchchaBala(planet, lon)).toBeGreaterThanOrEqual(-1e-9);
        expect(R.ojhayugmarasyamsaBala(planet, lon)).toBeLessThanOrEqual(R.MAXIMA.ojhayugmarasyamsa);
        expect(R.drekkanaBala(planet, lon)).toBeLessThanOrEqual(R.MAXIMA.drekkana);
        expect(R.saptavargajaBala(planet, lon)).toBeLessThanOrEqual(R.MAXIMA.saptavargaja + 1e-9);
        expect(R.saptavargajaBala(planet, lon)).toBeGreaterThanOrEqual(0);
      }
      for (let h = 1; h <= 12; h++) {
        expect(R.kendradiBala(h)).toBeLessThanOrEqual(R.MAXIMA.kendradi);
      }
    }
  });
});

describe('Shadbala oracle — Dig, Kala, Cheshta, Naisargika, Drik', () => {
  // Equal-house cusps: cusp i sits at i × 30°.
  const cusps = Array.from({ length: 12 }, (_, i) => i * 30);

  it('Dig Bala is 60 at the strongest bhava, 0 directly opposite', () => {
    for (const planet of R.PLANETS) {
      const best = cusps[R.DIG_BEST_BHAVA[planet] - 1];
      expect(R.digBala(planet, best, cusps), `${planet} at best bhava`).toBeCloseTo(60, 9);
      expect(R.digBala(planet, (best + 180) % 360, cusps), `${planet} opposite`).toBeCloseTo(0, 9);
    }
  });

  it('Nathonnatha Bala peaks at noon for the Sun and midnight for the Moon', () => {
    expect(R.nathonnathaBala('Sun', 12)).toBeCloseTo(60, 9);
    expect(R.nathonnathaBala('Sun', 0)).toBeCloseTo(0, 9);
    expect(R.nathonnathaBala('Moon', 0)).toBeCloseTo(60, 9);
    expect(R.nathonnathaBala('Moon', 12)).toBeCloseTo(0, 9);
    expect(R.nathonnathaBala('Mars', 12)).toBe(0);
  });

  it('Paksha Bala rewards benefics at full moon and malefics at new moon', () => {
    expect(R.pakshaBala('Jupiter', 180, 'A')).toBeCloseTo(60, 9); // benefic at full
    expect(R.pakshaBala('Jupiter', 0, 'A')).toBeCloseTo(0, 9);
    expect(R.pakshaBala('Sun', 0, 'A')).toBeCloseTo(60, 9);       // malefic at new
    expect(R.pakshaBala('Sun', 180, 'A')).toBeCloseTo(0, 9);
    // School B doubles the Moon's Paksha Bala and caps it at 120.
    expect(R.pakshaBala('Moon', 0, 'A')).toBeCloseTo(60, 9);
    expect(R.pakshaBala('Moon', 0, 'B')).toBeCloseTo(120, 9);
  });

  it('Tribhaga Bala is 60 to the lord of the third, and always 60 to Jupiter', () => {
    expect(R.tribhagaBala('Mercury', true, 0)).toBe(60);  // day, first third
    expect(R.tribhagaBala('Sun', true, 1)).toBe(60);      // day, second third
    expect(R.tribhagaBala('Saturn', true, 2)).toBe(60);   // day, third third
    expect(R.tribhagaBala('Sun', true, 0)).toBe(0);
    expect(R.tribhagaBala('Moon', false, 0)).toBe(60);    // night, first third
    expect(R.tribhagaBala('Venus', false, 1)).toBe(60);
    expect(R.tribhagaBala('Mars', false, 2)).toBe(60);
    expect(R.tribhagaBala('Jupiter', true, 0)).toBe(60);  // unconditional
  });

  it('Varsha/Masa/Dina/Hora Bala go only to the lord, 15/30/45/60', () => {
    expect(R.lordBala('Sun', 'varsha', 'Sun')).toBe(15);
    expect(R.lordBala('Sun', 'masa', 'Sun')).toBe(30);
    expect(R.lordBala('Sun', 'dina', 'Sun')).toBe(45);
    expect(R.lordBala('Sun', 'hora', 'Sun')).toBe(60);
    expect(R.lordBala('Moon', 'hora', 'Sun')).toBe(0);
  });

  it('Ayana Bala is 30 at 0° declination, 60/0 at ±24° (inverted for Moon/Saturn)', () => {
    expect(R.ayanaBala('Sun', 0)).toBeCloseTo(30, 9);
    expect(R.ayanaBala('Sun', 24)).toBeCloseTo(60, 9);
    expect(R.ayanaBala('Sun', -24)).toBeCloseTo(0, 9);
    expect(R.ayanaBala('Moon', -24)).toBeCloseTo(60, 9);
    expect(R.ayanaBala('Saturn', -24)).toBeCloseTo(60, 9);
    expect(R.ayanaBala('Moon', 24)).toBeCloseTo(0, 9);
  });

  it('Cheshta Bala is 60 retrograde, 30 stationary, 0 direct', () => {
    expect(R.cheshtaBala(-0.5)).toBe(60);
    expect(R.cheshtaBala(0)).toBe(30);
    expect(R.cheshtaBala(0.5)).toBe(0);
  });

  it('Naisargika Bala is a fixed table in classical descending order, summing to 240', () => {
    expect(R.naisargikaBala('Sun')).toBe(60);
    expect(R.naisargikaBala('Saturn')).toBe(8.57);
    const order = [...R.PLANETS].sort((a, b) => R.naisargikaBala(b) - R.naisargikaBala(a));
    expect(order).toEqual(['Sun', 'Moon', 'Venus', 'Jupiter', 'Mercury', 'Mars', 'Saturn']);
    const total = R.PLANETS.reduce((s, p) => s + R.naisargikaBala(p), 0);
    expect(total).toBeCloseTo(240, 9);
  });

  it('Drik Bala is +30 for a malefic and 0 for a benefic when all grahas coincide', () => {
    const same = Object.fromEntries(R.PLANETS.map((p) => [p, 123]));
    expect(R.drikBala('Sun', same)).toBeCloseTo(30, 9);
    expect(R.drikBala('Mars', same)).toBeCloseTo(30, 9);
    expect(R.drikBala('Saturn', same)).toBeCloseTo(30, 9);
    expect(R.drikBala('Moon', same)).toBeCloseTo(0, 9);
    expect(R.drikBala('Mercury', same)).toBeCloseTo(0, 9);
  });
});

describe('Shadbala oracle — aggregation', () => {
  const cusps = Array.from({ length: 12 }, (_, i) => i * 30);

  // Every graha placed at its exaltation degree and in its strongest bhava, so
  // Uchcha and Dig are at their closed-form maxima.
  const sky = {
    lon: { ...R.EXALTATION },
    house: { ...R.DIG_BEST_BHAVA },
    speed: { Sun: 1, Moon: 13, Mars: -0.5, Mercury: 1.2, Jupiter: 0.1, Venus: 1.1, Saturn: 0.05 },
    declination: { Sun: 20, Moon: -10, Mars: 15, Mercury: 5, Jupiter: 10, Venus: 18, Saturn: -22 },
  };
  const ctx = {
    cusps,
    localHours: 9,
    isDay: true,
    third: 0,
    lords: { varsha: 'Sun', masa: 'Moon', dina: 'Mars', hora: 'Jupiter' },
  };

  it('totalVirupas is the exact sum of its six components', () => {
    const out = R.shadbala(sky, ctx, 'A');
    for (const planet of R.PLANETS) {
      const r = out[planet];
      const sthana =
        r.sthana.uchcha + r.sthana.kendradi + r.sthana.ojhayugmarasyamsa +
        r.sthana.drekkana + r.sthana.saptavargaja;
      const sum = sthana + r.dig + r.kala + r.cheshta + r.naisargika + r.drik;
      expect(r.totalVirupas, `${planet} total`).toBeCloseTo(sum, 9);
      expect(r.rupas, `${planet} rupas = virupas/60`).toBeCloseTo(sum / 60, 12);
      expect(r.meetsMinimum, `${planet} minimum`).toBe(
        sum / 60 >= R.REQUIRED_MIN_RUPAS[planet],
      );
    }
  });

  it('places Uchcha and Kendradi at their maxima and wires Dig to the cusps', () => {
    const out = R.shadbala(sky, ctx, 'A');
    for (const planet of R.PLANETS) {
      expect(out[planet].sthana.uchcha, `${planet} uchcha`).toBeCloseTo(60, 9);
      expect(out[planet].sthana.kendradi, `${planet} kendradi`).toBe(60);
      // Dig depends on the planet's longitude relative to its strongest cusp,
      // not on exaltation — at 10° the Sun sits 100° from its 10th cusp. This
      // pins that the aggregator forwards the right longitude and cusp set.
      expect(out[planet].dig, `${planet} dig wiring`).toBeCloseTo(
        R.digBala(planet, sky.lon[planet], cusps), 9,
      );
    }
  });

  it('every aggregate component stays inside its declared ceiling', () => {
    const out = R.shadbala(sky, ctx, 'A');
    for (const planet of R.PLANETS) {
      const r = out[planet];
      expect(r.sthana.uchcha).toBeLessThanOrEqual(R.MAXIMA.uchcha + 1e-9);
      expect(r.sthana.kendradi).toBeLessThanOrEqual(R.MAXIMA.kendradi);
      expect(r.sthana.ojhayugmarasyamsa).toBeLessThanOrEqual(R.MAXIMA.ojhayugmarasyamsa);
      expect(r.sthana.drekkana).toBeLessThanOrEqual(R.MAXIMA.drekkana);
      expect(r.sthana.saptavargaja).toBeLessThanOrEqual(R.MAXIMA.saptavargaja + 1e-9);
      expect(r.dig).toBeLessThanOrEqual(R.MAXIMA.dig + 1e-9);
      expect(r.naisargika).toBeLessThanOrEqual(R.MAXIMA.naisargika + 1e-9);
    }
  });
});

describe('Shadbala oracle — varga rules', () => {
  it('exposes the Saptavarga and the extended D4/D20/D60 surface', () => {
    expect(R.SAPTAVARGA).toEqual(['D1', 'D2', 'D3', 'D7', 'D9', 'D12', 'D30']);
    expect(R.VARGA_ALL).toContain('D4');
    expect(R.VARGA_ALL).toContain('D20');
    expect(R.VARGA_ALL).toContain('D60');
  });

  it('D1 is the identity and every division lands in 0–11', () => {
    for (let lon = 0; lon < 360; lon += 7) {
      expect(R.vargaSign(lon, 'D1')).toBe(Math.floor(lon / 30));
      for (const v of R.VARGA_ALL) {
        const s = R.vargaSign(lon, v);
        expect(Number.isInteger(s), `${v} integer at ${lon}`).toBe(true);
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(11);
      }
    }
  });

  it('D2 (Hora) returns only Cancer or Leo', () => {
    for (let lon = 0; lon < 360; lon += 3) {
      expect([3, 4]).toContain(R.vargaSign(lon, 'D2'));
    }
  });

  it('D9 (Navamsa) is continuous at the sign boundary', () => {
    // Aries' nine navamsas run Aries…Sagittarius (0…8); Taurus' run Capricorn…
    // (9…), so the value steps 8 → 9 at 30° rather than wrapping.
    expect(R.vargaSign(29.999, 'D9')).toBe(8);
    expect(R.vargaSign(30, 'D9')).toBe(9);
  });

  it('D4 (Chaturthamsha) counts four 7°30′ parts from the sign, then +3 each', () => {
    expect(R.vargaSign(0, 'D4')).toBe(0);      // Aries, part 0
    expect(R.vargaSign(7.5, 'D4')).toBe(3);    // part 1 → 4th from Aries
    expect(R.vargaSign(15, 'D4')).toBe(6);     // part 2 → 7th from Aries
    expect(R.vargaSign(22.5, 'D4')).toBe(9);   // part 3 → 10th from Aries
    expect(R.vargaSign(30, 'D4')).toBe(1);     // Taurus, part 0
  });

  it('D7 (Saptamsha) counts from the sign in odd signs and the 7th in even signs', () => {
    // Odd sign (Aries): first saptamsha is Aries; fourth is Cancer (3).
    expect(R.vargaSign(0, 'D7')).toBe(0);
    expect(R.vargaSign(15, 'D7')).toBe(3);
    // Even sign (Taurus, s=1): first saptamsha is the 7th from Taurus = Scorpio (7).
    expect(R.vargaSign(30, 'D7')).toBe(7);
    expect(R.vargaSign(45, 'D7')).toBe(10);
  });

  it('D20 (Vimshamsha) starts movable signs at Aries, fixed at Leo, dual at Sagittarius', () => {
    expect(R.vargaSign(0, 'D20')).toBe(0);    // movable sign, part 0 → Aries
    expect(R.vargaSign(30, 'D20')).toBe(4);   // fixed sign (Taurus), part 0 → Leo
    expect(R.vargaSign(60, 'D20')).toBe(8);   // dual sign (Gemini), part 0 → Sagittarius
    expect(R.vargaSign(1.5, 'D20')).toBe(1);  // movable, part 1
  });

  it('D60 (Shashtiamsha) counts sixty 0°30′ parts from the sign', () => {
    expect(R.vargaSign(0, 'D60')).toBe(0);
    expect(R.vargaSign(0.5, 'D60')).toBe(1);
    expect(R.vargaSign(29.5, 'D60')).toBe(11); // 59th part of Aries → Pisces
    expect(R.vargaSign(30, 'D60')).toBe(1);    // resets at the next sign
  });

  it('rejects an unknown division rather than guessing', () => {
    expect(() => R.vargaSign(0, 'D11')).toThrow();
  });
});
