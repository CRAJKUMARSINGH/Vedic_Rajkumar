/**
 * Tests for Jaimini Astrology Service
 */
import { describe, it, expect } from 'vitest';
import {
  calculateCharaKarakas,
  calculateRashiAspects,
  calculatePadaLagna,
  detectJaiminiYogas,
  calculateCharaDasha,
  analyzeJaimini,
  type JaiminiPlanet,
} from '@/services/jaiminiService';

// Sample planetary positions (Aries ascendant chart)
const SAMPLE_PLANETS: JaiminiPlanet[] = [
  { name: 'Sun',     rashiIndex: 0,  degrees: 15, house: 1 },
  { name: 'Moon',    rashiIndex: 3,  degrees: 10, house: 4 },
  { name: 'Mars',    rashiIndex: 0,  degrees: 5,  house: 1 },
  { name: 'Mercury', rashiIndex: 1,  degrees: 20, house: 2 },
  { name: 'Jupiter', rashiIndex: 3,  degrees: 25, house: 4 },
  { name: 'Venus',   rashiIndex: 11, degrees: 12, house: 12 },
  { name: 'Saturn',  rashiIndex: 6,  degrees: 8,  house: 7 },
  { name: 'Rahu',    rashiIndex: 2,  degrees: 18, house: 3 },
  { name: 'Ketu',    rashiIndex: 8,  degrees: 18, house: 9 },
];

describe('calculateCharaKarakas', () => {
  it('returns exactly 7 karakas', () => {
    const karakas = calculateCharaKarakas(SAMPLE_PLANETS);
    expect(karakas).toHaveLength(7);
  });

  it('first karaka is Atmakaraka', () => {
    const karakas = calculateCharaKarakas(SAMPLE_PLANETS);
    expect(karakas[0].karaka).toBe('Atmakaraka');
  });

  it('last karaka is Darakaraka', () => {
    const karakas = calculateCharaKarakas(SAMPLE_PLANETS);
    expect(karakas[6].karaka).toBe('Darakaraka');
  });

  it('Atmakaraka has highest degrees among eligible planets', () => {
    const karakas = calculateCharaKarakas(SAMPLE_PLANETS);
    const ak = karakas[0];
    // Jupiter has 25° — highest among Sun(15), Moon(10), Mars(5), Mercury(20), Jupiter(25), Venus(12), Saturn(8)
    expect(ak.planet).toBe('Jupiter');
    expect(ak.degrees).toBeCloseTo(25, 0);
  });

  it('each karaka has a planet, degrees, and meaning', () => {
    const karakas = calculateCharaKarakas(SAMPLE_PLANETS);
    karakas.forEach(k => {
      expect(k.planet).toBeTruthy();
      expect(k.degrees).toBeGreaterThanOrEqual(0);
      expect(k.meaning.en).toBeTruthy();
      expect(k.meaning.hi).toBeTruthy();
    });
  });

  it('no two karakas share the same planet', () => {
    const karakas = calculateCharaKarakas(SAMPLE_PLANETS);
    const planets = karakas.map(k => k.planet);
    const unique = new Set(planets);
    expect(unique.size).toBe(planets.length);
  });
});

describe('calculateRashiAspects', () => {
  it('returns a non-empty list of aspects', () => {
    const aspects = calculateRashiAspects();
    expect(aspects.length).toBeGreaterThan(0);
  });

  it('Aries (Chara) aspects Taurus (Sthira) — but not adjacent', () => {
    const aspects = calculateRashiAspects();
    // Aries(0) to Taurus(1) is adjacent — should NOT aspect
    const ariesTaurus = aspects.find(a => a.fromRashi === 0 && a.toRashi === 1);
    expect(ariesTaurus).toBeUndefined();
  });

  it('Aries (Chara) aspects Leo (Sthira, non-adjacent)', () => {
    const aspects = calculateRashiAspects();
    const ariesLeo = aspects.find(a => a.fromRashi === 0 && a.toRashi === 4);
    expect(ariesLeo).toBeDefined();
  });

  it('no self-aspects', () => {
    const aspects = calculateRashiAspects();
    const selfAspects = aspects.filter(a => a.fromRashi === a.toRashi);
    expect(selfAspects).toHaveLength(0);
  });
});

describe('calculatePadaLagna', () => {
  it('returns a PadaLagna object for valid input', () => {
    const result = calculatePadaLagna(0, 5, SAMPLE_PLANETS);
    expect(result).not.toBeNull();
    expect(result!.rashiIndex).toBeGreaterThanOrEqual(0);
    expect(result!.rashiIndex).toBeLessThan(12);
  });

  it('pada lagna has a meaning in both languages', () => {
    const result = calculatePadaLagna(0, 5, SAMPLE_PLANETS);
    expect(result!.meaning.en).toBeTruthy();
    expect(result!.meaning.hi).toBeTruthy();
  });

  it('returns null if lagna lord not in planet list', () => {
    // Aries lagna lord is Mars — remove Mars
    const planetsNoMars = SAMPLE_PLANETS.filter(p => p.name !== 'Mars');
    const result = calculatePadaLagna(0, 5, planetsNoMars);
    expect(result).toBeNull();
  });
});

describe('detectJaiminiYogas', () => {
  it('returns an array of yoga results', () => {
    const karakas = calculateCharaKarakas(SAMPLE_PLANETS);
    const yogas = detectJaiminiYogas(karakas, SAMPLE_PLANETS, 0);
    expect(Array.isArray(yogas)).toBe(true);
    expect(yogas.length).toBeGreaterThan(0);
  });

  it('each yoga has name, isPresent, strength, and bilingual description', () => {
    const karakas = calculateCharaKarakas(SAMPLE_PLANETS);
    const yogas = detectJaiminiYogas(karakas, SAMPLE_PLANETS, 0);
    yogas.forEach(y => {
      expect(y.name).toBeTruthy();
      expect(y.nameHi).toBeTruthy();
      expect(typeof y.isPresent).toBe('boolean');
      expect(['strong', 'moderate', 'weak']).toContain(y.strength);
      expect(y.description.en).toBeTruthy();
      expect(y.description.hi).toBeTruthy();
    });
  });
});

describe('calculateCharaDasha', () => {
  it('returns exactly 12 dasha periods', () => {
    const dashas = calculateCharaDasha(0, 1990);
    expect(dashas).toHaveLength(12);
  });

  it('first dasha starts at age 0', () => {
    const dashas = calculateCharaDasha(0, 1990);
    expect(dashas[0].startAge).toBe(0);
  });

  it('each dasha end age equals next start age', () => {
    const dashas = calculateCharaDasha(0, 1990);
    for (let i = 0; i < dashas.length - 1; i++) {
      expect(dashas[i].endAge).toBe(dashas[i + 1].startAge);
    }
  });

  it('total dasha years sum to 78 (standard Jaimini)', () => {
    const dashas = calculateCharaDasha(0, 1990);
    const total = dashas.reduce((s, d) => s + d.years, 0);
    expect(total).toBe(78);
  });

  it('all rashis are valid (0-11)', () => {
    const dashas = calculateCharaDasha(3, 1985); // Cancer ascendant
    dashas.forEach(d => {
      expect(d.rashi).toBeGreaterThanOrEqual(0);
      expect(d.rashi).toBeLessThan(12);
    });
  });
});

describe('analyzeJaimini', () => {
  it('returns complete analysis object', () => {
    const result = analyzeJaimini(SAMPLE_PLANETS, 0, 5, 1990);
    expect(result.karakas).toHaveLength(7);
    expect(result.atmakaraka).not.toBeNull();
    expect(result.rashiAspects.length).toBeGreaterThan(0);
    expect(result.charaDasha).toHaveLength(12);
    expect(result.yogas.length).toBeGreaterThan(0);
    expect(result.summary.en).toBeTruthy();
    expect(result.summary.hi).toBeTruthy();
  });

  it('atmakaraka matches first karaka', () => {
    const result = analyzeJaimini(SAMPLE_PLANETS, 0, 5, 1990);
    expect(result.atmakaraka?.karaka).toBe('Atmakaraka');
    expect(result.atmakaraka?.planet).toBe(result.karakas[0].planet);
  });

  it('summary mentions atmakaraka planet', () => {
    const result = analyzeJaimini(SAMPLE_PLANETS, 0, 5, 1990);
    expect(result.summary.en).toContain(result.atmakaraka!.planet);
  });
});
