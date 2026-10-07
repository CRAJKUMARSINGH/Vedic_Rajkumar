import { RASHIS, type Rashi } from '../core/constants';

/** Vedic whole-sign aspect (drishti) — 1-based house counts from occupied sign. */
export const DRISHTI: Record<string, number[]> = {
  Sun: [7],
  Moon: [7],
  Mars: [4, 7, 8],
  Mercury: [7],
  Jupiter: [5, 7, 9],
  Venus: [7],
  Saturn: [3, 7, 10],
  Rahu: [5, 7, 9],
  Ketu: [5, 7, 9],
};

export const signIndex = (longitude: number): number =>
  Math.floor((((longitude % 360) + 360) % 360) / 30);

export const signOf = (longitude: number): Rashi => RASHIS[signIndex(longitude)];

export const angularDistance = (a: number, b: number): number => {
  const diff = Math.abs((((a - b) % 360) + 360) % 360);
  return Math.min(diff, 360 - diff);
};

export interface TransitAspect {
  transiting: string;
  natalTarget: string;
  aspectType: 'drishti' | 'conjunction' | 'transit-house';
  house: number;
  sign: Rashi;
  orb: number;
  benefic: boolean;
}

/**
 * Whole-sign drishti: house 7 from Aries is Libra (sign index + 6).
 * Spec tables are 1-based house counts, so offset = house - 1.
 */
export const computeDrishti = (
  transiting: string,
  transitLong: number,
  natalSigns: Record<string, number>,
  benefics: Set<string>,
): TransitAspect[] => {
  const offsets = DRISHTI[transiting] ?? [7];
  const fromSign = signIndex(transitLong);
  const out: TransitAspect[] = [];
  const lagna = natalSigns.Lagna ?? 0;

  for (const [target, natalSign] of Object.entries(natalSigns)) {
    for (const off of offsets) {
      const aspectedSign = (fromSign + off - 1) % 12;
      if (aspectedSign === natalSign) {
        out.push({
          transiting,
          natalTarget: target,
          aspectType: 'drishti',
          house: ((natalSign - lagna + 12) % 12) + 1,
          sign: RASHIS[aspectedSign],
          orb: 0,
          benefic: benefics.has(transiting),
        });
      }
    }
  }
  return out;
};

/** Conjunction with natal points within an orb (default 3°). */
export const computeConjunctions = (
  transiting: string,
  transitLong: number,
  natalLongitudes: Record<string, number>,
  benefics: Set<string>,
  orb = 3,
): TransitAspect[] => {
  const out: TransitAspect[] = [];
  for (const [target, natalLong] of Object.entries(natalLongitudes)) {
    const d = angularDistance(transitLong, natalLong);
    if (d <= orb) {
      out.push({
        transiting,
        natalTarget: target,
        aspectType: 'conjunction',
        house: 0,
        sign: signOf(transitLong),
        orb: Number(d.toFixed(2)),
        benefic: benefics.has(transiting),
      });
    }
  }
  return out;
};
