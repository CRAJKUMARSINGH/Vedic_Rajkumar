import { describe, expect, it } from 'vitest';
import {
  approxJupiterRashi,
  approxSaturnRashi,
  buildApproxMoonDoubleTransitInput,
  buildExactMoonDoubleTransitInput,
  checkCareerMoonDoubleTransit,
  checkChildMoonDoubleTransit,
  checkForeignMoonDoubleTransit,
  checkMarriageMoonDoubleTransit,
  checkMoonDoubleTransit,
  checkWealthMoonDoubleTransit,
  DOUBLE_TRANSIT_RASHI_NAMES,
  houseFromMoon,
  type MoonDoubleTransitInput,
} from '@/services/doubleTransitService';

describe('doubleTransitService (Week 08)', () => {
  describe('DOUBLE_TRANSIT_RASHI_NAMES', () => {
    it('contains all 12 zodiac rashis in order', () => {
      expect(DOUBLE_TRANSIT_RASHI_NAMES).toHaveLength(12);
      expect(DOUBLE_TRANSIT_RASHI_NAMES[0]).toBe('Aries');
      expect(DOUBLE_TRANSIT_RASHI_NAMES[11]).toBe('Pisces');
    });
  });

  describe('houseFromMoon', () => {
    it('calculates same rashi as 1st house', () => {
      expect(houseFromMoon(0, 0)).toBe(1);
      expect(houseFromMoon(5, 5)).toBe(1);
    });

    it('calculates 7th house opposition correctly', () => {
      expect(houseFromMoon(6, 0)).toBe(7); // Libra from Aries
      expect(houseFromMoon(0, 6)).toBe(7); // Aries from Libra
    });

    it('calculates 10th house correctly with wrap around', () => {
      expect(houseFromMoon(9, 0)).toBe(10); // Capricorn from Aries
      expect(houseFromMoon(3, 6)).toBe(10); // Cancer from Libra
    });
  });

  describe('approximate transit rashis', () => {
    it('returns valid rashi integers 0-11 for Jupiter across years', () => {
      const dates = [
        new Date(2024, 1, 1),
        new Date(2024, 5, 1),
        new Date(2025, 6, 1),
        new Date(2026, 6, 1),
        new Date(2030, 0, 1),
      ];
      dates.forEach((d) => {
        const rashi = approxJupiterRashi(d);
        expect(rashi).toBeGreaterThanOrEqual(0);
        expect(rashi).toBeLessThanOrEqual(11);
      });
    });

    it('returns valid rashi integers 0-11 for Saturn across years', () => {
      const dates = [
        new Date(2024, 0, 1),
        new Date(2025, 5, 1),
        new Date(2028, 0, 1),
        new Date(2032, 0, 1),
      ];
      dates.forEach((d) => {
        const rashi = approxSaturnRashi(d);
        expect(rashi).toBeGreaterThanOrEqual(0);
        expect(rashi).toBeLessThanOrEqual(11);
      });
    });
  });

  describe('buildExactMoonDoubleTransitInput', () => {
    it('uses explicit planetary signs when available', () => {
      const planets = [
        { name: 'Sun', sign: 0 },
        { name: 'Jupiter', sign: 1 }, // Taurus
        { name: 'Saturn', sign: 10 }, // Aquarius
      ];
      const result = buildExactMoonDoubleTransitInput(0, planets, 0);
      expect(result.transitJupiterRashi).toBe(1);
      expect(result.transitSaturnRashi).toBe(10);
      expect(result.natalMoonRashi).toBe(0);
    });

    it('derives sign from longitude when sign property is missing', () => {
      const planets = [
        { name: 'Guru', longitude: 75.5 }, // Gemini (sign index 2)
        { name: 'Shani', longitude: 335.2 }, // Pisces (sign index 11)
      ];
      const result = buildExactMoonDoubleTransitInput(3, planets);
      expect(result.transitJupiterRashi).toBe(2);
      expect(result.transitSaturnRashi).toBe(11);
      expect(result.natalMoonRashi).toBe(3);
    });

    it('falls back to approx date-based rashis when planets array is empty', () => {
      const date = new Date(2025, 6, 1);
      const result = buildExactMoonDoubleTransitInput(4, [], undefined, date);
      expect(result.transitJupiterRashi).toBe(approxJupiterRashi(date));
      expect(result.transitSaturnRashi).toBe(approxSaturnRashi(date));
      expect(result.natalMoonRashi).toBe(4);
    });
  });

  describe('buildApproxMoonDoubleTransitInput', () => {
    it('constructs input based on given date and natal moon', () => {
      const date = new Date(2026, 0, 1);
      const input = buildApproxMoonDoubleTransitInput(2, date, 5);
      expect(input.natalMoonRashi).toBe(2);
      expect(input.ascendantRashi).toBe(5);
      expect(input.transitJupiterRashi).toBe(approxJupiterRashi(date));
      expect(input.transitSaturnRashi).toBe(approxSaturnRashi(date));
    });
  });

  describe('checkMarriageMoonDoubleTransit', () => {
    it('flags active when Jupiter in 7th and Saturn in 7th from Moon with high confidence', () => {
      // Moon in Aries (0), Jupiter in Libra (6) -> 7th house
      // Saturn in Libra (6) -> 7th house
      const input: MoonDoubleTransitInput = {
        natalMoonRashi: 0,
        transitJupiterRashi: 6,
        transitSaturnRashi: 6,
      };
      const result = checkMarriageMoonDoubleTransit(input);
      expect(result.isActive).toBe(true);
      expect(result.confidence).toBe('high');
      expect(result.jupiterHouse).toBe(7);
      expect(result.saturnHouse).toBe(7);
      expect(result.narrative).toContain('favourable for marriage events');
      expect(result.thereforeVerdict).toContain('structurally supported');
    });

    it('flags active with moderate confidence when Jupiter in 1st and Saturn in 3rd (different houses)', () => {
      // Jupiter target: [1, 7, 11]. Saturn target: [3, 7].
      // Moon in Aries (0), Jupiter in Aries (0) -> 1st house
      // Saturn in Gemini (2) -> 3rd house
      const input: MoonDoubleTransitInput = {
        natalMoonRashi: 0,
        transitJupiterRashi: 0,
        transitSaturnRashi: 2,
      };
      const result = checkMarriageMoonDoubleTransit(input);
      expect(result.isActive).toBe(true);
      expect(result.confidence).toBe('moderate');
      expect(result.jupiterHouse).toBe(1);
      expect(result.saturnHouse).toBe(3);
    });

    it('flags incomplete when one or both planets are off target', () => {
      // Moon in Aries (0), Jupiter in Taurus (1) -> 2nd house (not in 1, 7, 11)
      // Saturn in Libra (6) -> 7th house
      const input: MoonDoubleTransitInput = {
        natalMoonRashi: 0,
        transitJupiterRashi: 1,
        transitSaturnRashi: 6,
      };
      const result = checkMarriageMoonDoubleTransit(input);
      expect(result.isActive).toBe(false);
      expect(result.confidence).toBe('low');
      expect(result.narrative).toContain('Double transit incomplete');
      expect(result.thereforeVerdict).toContain('not structurally certified');
    });
  });

  describe('checkCareerMoonDoubleTransit', () => {
    it('flags active when Jupiter in 10th and Saturn in 10th from Moon', () => {
      // Moon in Aries (0), Jupiter in Capricorn (9) -> 10th house
      // Saturn in Capricorn (9) -> 10th house
      const input: MoonDoubleTransitInput = {
        natalMoonRashi: 0,
        transitJupiterRashi: 9,
        transitSaturnRashi: 9,
      };
      const result = checkCareerMoonDoubleTransit(input);
      expect(result.isActive).toBe(true);
      expect(result.type).toBe('career');
      expect(result.jupiterHouse).toBe(10);
      expect(result.saturnHouse).toBe(10);
      expect(result.confidence).toBe('high');
    });
  });

  describe('checkWealthMoonDoubleTransit', () => {
    it('flags active when Jupiter in 2nd and Saturn in 11th from Moon', () => {
      // Moon in Aries (0), Jupiter in Taurus (1) -> 2nd house
      // Saturn in Aquarius (10) -> 11th house
      const input: MoonDoubleTransitInput = {
        natalMoonRashi: 0,
        transitJupiterRashi: 1,
        transitSaturnRashi: 10,
      };
      const result = checkWealthMoonDoubleTransit(input);
      expect(result.isActive).toBe(true);
      expect(result.type).toBe('wealth');
      expect(result.jupiterHouse).toBe(2);
      expect(result.saturnHouse).toBe(11);
      expect(result.confidence).toBe('moderate');
    });
  });

  describe('checkChildMoonDoubleTransit & checkForeignMoonDoubleTransit', () => {
    it('correctly evaluates child double transit', () => {
      // Jupiter target: [1, 5, 9, 11], Saturn target: [3, 5, 11]
      // Moon in Cancer (3), Jupiter in Scorpio (7) -> 5th house
      // Saturn in Scorpio (7) -> 5th house
      const input: MoonDoubleTransitInput = {
        natalMoonRashi: 3,
        transitJupiterRashi: 7,
        transitSaturnRashi: 7,
      };
      const result = checkChildMoonDoubleTransit(input);
      expect(result.isActive).toBe(true);
      expect(result.type).toBe('child');
      expect(result.jupiterHouse).toBe(5);
      expect(result.saturnHouse).toBe(5);
    });

    it('correctly evaluates foreign travel double transit', () => {
      // Jupiter target: [9, 12], Saturn target: [9, 12]
      // Moon in Leo (4), Jupiter in Aries (0) -> 9th house
      // Saturn in Cancer (3) -> 12th house
      const input: MoonDoubleTransitInput = {
        natalMoonRashi: 4,
        transitJupiterRashi: 0,
        transitSaturnRashi: 3,
      };
      const result = checkForeignMoonDoubleTransit(input);
      expect(result.isActive).toBe(true);
      expect(result.type).toBe('foreign');
      expect(result.jupiterHouse).toBe(9);
      expect(result.saturnHouse).toBe(12);
    });
  });

  describe('checkMoonDoubleTransit with custom type', () => {
    it('supports custom target houses and sets custom type', () => {
      const input: MoonDoubleTransitInput = {
        natalMoonRashi: 0,
        transitJupiterRashi: 4, // 5th house
        transitSaturnRashi: 8, // 9th house
      };
      const result = checkMoonDoubleTransit(input, 'custom', {
        jupiter: [5],
        saturn: [9],
      });
      expect(result.isActive).toBe(true);
      expect(result.type).toBe('custom');
      expect(result.narrative).toContain('Double transit active');
    });
  });
});
