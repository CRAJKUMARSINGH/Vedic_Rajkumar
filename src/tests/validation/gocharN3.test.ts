/**
 * src/tests/validation/gocharN3.test.ts
 *
 * N3 · Gochar (Transit Engine) — closes the two gaps N3 found in the runtime
 * transit service (dynamicTransitService):
 *   (1) transit houses were computed ONLY from the natal Moon — no Lagna frame;
 *   (2) Sade Sati / Ashtama Shani / Kantaka Shani were not in the transit output.
 * Also verifies the classical Vedha table is complete for all nine planets.
 *
 * Run: npx vitest run src/tests/validation/gocharN3.test.ts
 */

import { describe, it, expect } from 'vitest';
import {
  computeTransitFrame,
  computeShaniStatus,
  calculateDynamicTransits,
  computeAshtakavargaTransitPoints,
  findSignBoundary,
  computeSignWindows,
  getTransitSignWindows,
} from '../../services/dynamicTransitService';
import { calculateAshtakavarga } from '../../services/ashtakavargaService';
import { PLANETS, VEDHA_PAIRS } from '../../data/transitData';

/** All-nines rashi map with named overrides. */
function rashiMap(overrides: Record<string, number> = {}): Record<string, number> {
  const m: Record<string, number> = {};
  for (const p of PLANETS) m[p.en] = 0;
  return { ...m, ...overrides };
}

describe('N3 — Gochar transit engine', () => {
  // ── Reference-frame independence ───────────────────────────────────────────

  describe('computeTransitFrame — dual reference frames', () => {
    it('computes house = ((rashi − reference + 12) % 12) + 1', () => {
      const map = rashiMap({ Sun: 9 }); // Sun in Capricorn
      const fromMoon = computeTransitFrame(map, 11); // ref Pisces → house 11
      const sun = fromMoon.find(r => r.planet.en === 'Sun')!;
      expect(sun.house).toBe(11);
      expect(sun.currentRashi).toBe(9);
    });

    it('the same planet occupies different houses in the Moon vs Lagna frames', () => {
      const map = rashiMap({ Sun: 9 });
      const fromMoon = computeTransitFrame(map, 3).find(r => r.planet.en === 'Sun')!;
      const fromLagna = computeTransitFrame(map, 11).find(r => r.planet.en === 'Sun')!;
      expect(fromMoon.house).toBe(7);   // (9−3)+1
      expect(fromLagna.house).toBe(11); // (9−11+12)+1
      expect(fromMoon.house).not.toBe(fromLagna.house);
    });

    it('Vedha blocks a favorable planet when the obstructing planet sits in the vedha house', () => {
      // Sun in Capricorn(9) → 11th from Pisces(11) is favorable; Sun@11 vedha house = 5.
      // Put Moon so that it lands in house 5 from reference 11 → rashi = (11+4)%12 = 3.
      const map = rashiMap({ Sun: 9, Moon: 3 });
      const sun = computeTransitFrame(map, 11).find(r => r.planet.en === 'Sun')!;
      expect(sun.baseFavorable).toBe(true);
      expect(sun.vedhaActive).toBe(true);
      expect(sun.effectiveStatus).toBe('mixed');
      expect(sun.vedhaNote).toContain('Moon');

      // Move Moon out of house 5 → vedha clears.
      const map2 = rashiMap({ Sun: 9, Moon: 0 });
      const sun2 = computeTransitFrame(map2, 11).find(r => r.planet.en === 'Sun')!;
      expect(sun2.vedhaActive).toBe(false);
      expect(sun2.effectiveStatus).toBe('favorable');
      expect(sun2.scoreContribution).toBe(1);
    });

    it('Vedha table is complete for all nine planets', () => {
      for (const p of PLANETS) {
        const fav = [...p.favorableHouses].sort((a, b) => a - b);
        const vedhaKeys = Object.keys(VEDHA_PAIRS[p.en] ?? {}).map(Number).sort((a, b) => a - b);
        expect(vedhaKeys).toEqual(fav);
      }
    });
  });

  // ── Sade Sati / Ashtama / Kantaka ──────────────────────────────────────────

  describe('computeShaniStatus — Saturn vs natal Moon', () => {
    const moon = 3; // Cancer

    it('rising: Saturn in 12th from Moon (Gemini)', () => {
      const s = computeShaniStatus(2 * 30 + 15, moon); // Gemini
      expect(s.sadeSati.phase).toBe('rising');
      expect(s.sadeSati.active).toBe(true);
    });

    it('peak: Saturn over the Moon sign (Cancer)', () => {
      const s = computeShaniStatus(3 * 30 + 15, moon);
      expect(s.sadeSati.phase).toBe('peak');
      expect(s.sadeSati.severity).toBe('high');
    });

    it('setting: Saturn in 2nd from Moon (Leo)', () => {
      const s = computeShaniStatus(4 * 30 + 15, moon);
      expect(s.sadeSati.phase).toBe('setting');
    });

    it('none: Saturn in the 9th from Moon (Pisces) — the Rajkumar anchor', () => {
      const s = computeShaniStatus(11 * 30 + 15, moon); // Pisces
      expect(s.sadeSati.active).toBe(false);
      expect(s.sadeSati.phase).toBe('none');
      expect(s.ashtamaShani).toBe(false);
      expect(s.kantakaShani).toBe(false);
    });

    it('Ashtama Shani: Saturn in 8th from Moon (Aquarius)', () => {
      const s = computeShaniStatus(10 * 30 + 15, moon);
      expect(s.ashtamaShani).toBe(true);
      expect(s.sadeSati.active).toBe(false);
    });

    it('Kantaka Shani: Saturn in 4th from Moon (Libra)', () => {
      const s = computeShaniStatus(6 * 30 + 15, moon);
      expect(s.kantakaShani).toBe(true);
      expect(s.sadeSati.active).toBe(false);
    });
  });

  // ── Integration through calculateDynamicTransits ────────────────────────────

  describe('calculateDynamicTransits — output wiring', () => {
    it('always reports Shani status; adds the Lagna frame only when requested', async () => {
      const base = await calculateDynamicTransits({
        moonRashiIndex: 3,
        date: new Date('2026-10-20'),
      });
      expect(base.shaniStatus).toBeDefined();
      expect(base.transitsFromLagna).toBeUndefined();
      expect(base.lagnaRashiIndex).toBeUndefined();

      const both = await calculateDynamicTransits({
        moonRashiIndex: 3,
        lagnaRashiIndex: 4, // Leo
        date: new Date('2026-10-20'),
      });
      expect(both.lagnaRashiIndex).toBe(4);
      expect(both.transitsFromLagna).toHaveLength(9);

      // Moon and Lagna frames genuinely differ.
      const moonSun = both.transits.find(t => t.planet.en === 'Sun')!;
      const lagnaSun = both.transitsFromLagna!.find(r => r.planet.en === 'Sun')!;
      expect(moonSun.currentRashi).toBe(lagnaSun.currentRashi); // same sky
      expect(moonSun.houseFromMoon).not.toBe(lagnaSun.house);   // different frame
    });

    it('Rajkumar anchor (Oct 2026): Saturn in Pisces → 9th from Moon, no Sade Sati', async () => {
      const out = await calculateDynamicTransits({
        moonRashiIndex: 3, // Cancer
        date: new Date('2026-10-20'),
      });
      const saturn = out.transits.find(t => t.planet.en === 'Saturn')!;
      expect(saturn.houseFromMoon).toBe(9); // Pisces is 9th from Cancer
      expect(out.shaniStatus!.sadeSati.saturnSign).toBe('Pisces');
      expect(out.shaniStatus!.sadeSati.active).toBe(false);
    });
  });

  // ── Ashtakavarga transit points (BAV/SAV on the transiting sign) ────────────

  describe('computeAshtakavargaTransitPoints — BAV/SAV on the transiting sign', () => {
    const natal = {
      Sun: 0, Moon: 3, Mars: 5, Mercury: 6, Jupiter: 9, Venus: 10, Saturn: 11, Rahu: 1, Ketu: 7,
    };
    const lagna = 2;

    it('scores every transiting planet from the natal BAV table and SAV', () => {
      const transit = {
        Sun: 4, Moon: 7, Mars: 1, Mercury: 2, Jupiter: 3, Venus: 8, Saturn: 5, Rahu: 6, Ketu: 11,
      };
      const points = computeAshtakavargaTransitPoints(natal, lagna, transit);
      const ref = calculateAshtakavarga(natal, lagna);
      const bavByPlanet = new Map(ref.tables.map(t => [t.planet, t.bavPoints]));

      expect(points).toHaveLength(9);
      for (const p of points) {
        expect(p.transitRashi).toBe(transit[p.planet as keyof typeof transit]);
        expect(p.savPoints).toBe(ref.savPoints[p.transitRashi]);
        expect(p.savPoints).toBeGreaterThanOrEqual(0);
        expect(p.savPoints).toBeLessThanOrEqual(56);
        const bav = bavByPlanet.get(p.planet);
        if (bav) {
          expect(p.bavPoints).toBe(bav[p.transitRashi]);
          expect(p.bavPoints!).toBeGreaterThanOrEqual(0);
          expect(p.bavPoints!).toBeLessThanOrEqual(8);
        } else {
          expect(p.bavPoints).toBeUndefined();
        }
      }
    });

    it('Rahu/Ketu carry no BAV (classical 7-planet Ashtakavarga)', () => {
      const points = computeAshtakavargaTransitPoints(natal, lagna, { Rahu: 3, Ketu: 9 });
      expect(points).toHaveLength(2);
      expect(points.every(p => p.bavPoints === undefined)).toBe(true);
    });

    it('strength follows the BAV thresholds (≥5 Strong · 4 Moderate · else Weak)', () => {
      const points = computeAshtakavargaTransitPoints(natal, lagna, {
        Sun: 0, Moon: 1, Mars: 2, Mercury: 3, Jupiter: 4, Venus: 5, Saturn: 6,
      });
      for (const p of points) {
        const expected = p.bavPoints! >= 5 ? 'Strong' : p.bavPoints! >= 4 ? 'Moderate' : 'Weak';
        expect(p.strength).toBe(expected);
      }
    });

    it('is surfaced on the transit output only when the natal chart is supplied', async () => {
      const without = await calculateDynamicTransits({ moonRashiIndex: 3, date: new Date('2026-10-20') });
      expect(without.ashtakavargaTransit).toBeUndefined();

      const withNatal = await calculateDynamicTransits({
        moonRashiIndex: 3,
        lagnaRashiIndex: lagna,
        natalPlanetRashis: natal,
        natalAscendantRashi: lagna,
        date: new Date('2026-10-20'),
      });
      expect(withNatal.ashtakavargaTransit).toHaveLength(9);
      expect(withNatal.ashtakavargaTransit!.every(p => p.savPoints >= 0)).toBe(true);
    });
  });

  // ── Per-planet ingress / egress dates ───────────────────────────────────────

  describe('findSignBoundary / computeSignWindows — ingress & egress dates', () => {
    const DAY = 86_400_000;
    const SIGN_DAYS = 10;
    // Synthetic linear motion: one sign every 10 days from the epoch.
    const linearSampler = (ms: number) => Math.floor(ms / (SIGN_DAYS * DAY)) % 12;

    it('finds the exact ingress and egress of the current sign (synthetic clock)', async () => {
      const at = 105 * DAY; // inside sign 10, which spans [100d, 110d)
      expect(linearSampler(at)).toBe(10);

      const ingress = await findSignBoundary(linearSampler, at, -1, 1200, 1000);
      const egress = await findSignBoundary(linearSampler, at, 1, 1200, 1000);

      expect(ingress).not.toBeNull();
      expect(egress).not.toBeNull();
      expect(Math.abs(ingress! - 100 * DAY)).toBeLessThanOrEqual(1000);
      expect(Math.abs(egress! - 110 * DAY)).toBeLessThanOrEqual(1000);
    });

    it('returns null when no boundary is crossed within the window', async () => {
      const constant = () => 5;
      expect(await findSignBoundary(constant, 0, 1, 30)).toBeNull();
    });

    it('computeSignWindows brackets the instant for each requested planet', async () => {
      const at = 105 * DAY;
      const windows = await computeSignWindows(['A', 'B'], () => linearSampler, at);
      expect(windows).toHaveLength(2);
      for (const w of windows) {
        expect(w.rashi).toBe(10);
        expect(w.ingressMs!).toBeLessThan(at);
        expect(w.egressMs!).toBeGreaterThan(at);
      }
    });

    it('getTransitSignWindows returns a real Moon window that brackets the instant', async () => {
      const at = Date.UTC(2026, 9, 20, 0, 0);
      const windows = await getTransitSignWindows(new Date(at), '00:00', ['Moon']);
      expect(windows).toHaveLength(1);
      const w = windows[0];
      expect(w.planet).toBe('Moon');
      expect(w.ingressMs).not.toBeNull();
      expect(w.egressMs).not.toBeNull();
      expect(w.ingressMs!).toBeLessThanOrEqual(at);
      expect(w.egressMs!).toBeGreaterThanOrEqual(at);
      const spanDays = (w.egressMs! - w.ingressMs!) / DAY;
      expect(spanDays).toBeGreaterThan(1);
      expect(spanDays).toBeLessThan(4);
    }, 30000);
  });
});
