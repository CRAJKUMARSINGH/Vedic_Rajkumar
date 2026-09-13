/**
 * Pure double-transit helpers.
 *
 * This supplements dynamicTransitService with a synchronous, ephemeris-free
 * Jupiter/Saturn gate from the natal Moon. Use dynamicTransitService when exact
 * transit positions are already available; use this file when the caller only
 * has natal Moon rashi plus approximate current Jupiter/Saturn rashis.
 *
 * Conforms to the Parashara and K.N. Rao double-transit principles.
 */

export type MoonDoubleTransitType =
  | 'marriage'
  | 'career'
  | 'wealth'
  | 'child'
  | 'foreign'
  | 'custom';

export interface MoonDoubleTransitInput {
  natalMoonRashi: number;
  transitJupiterRashi: number;
  transitSaturnRashi: number;
  ascendantRashi?: number;
}

export interface MoonDoubleTransitResult {
  type: MoonDoubleTransitType;
  isActive: boolean;
  jupiterHouse: number;
  saturnHouse: number;
  jupiterRashi: string;
  saturnRashi: string;
  confidence: 'high' | 'moderate' | 'low';
  narrative: string;
  thereforeVerdict: string;
}

export const DOUBLE_TRANSIT_RASHI_NAMES: readonly string[] = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;

export function approxJupiterRashi(date: Date = new Date()): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  const table: Record<number, number> = {
    2023: 0,
    2024: 0,
    2025: 1,
    2026: 2,
    2027: 3,
    2028: 4,
    2029: 5,
    2030: 6,
  };

  if (year === 2024 && month >= 4) return 1;
  return table[year] ?? (((year - 2023) % 12) + 12) % 12;
}

export function approxSaturnRashi(date: Date = new Date()): number {
  const year = date.getFullYear();
  if (year < 2025) return 10;
  if (year < 2027) return 11;
  if (year < 2030) return 0;
  return 1;
}

export function houseFromMoon(transitRashi: number, moonRashi: number): number {
  return ((transitRashi - moonRashi + 12) % 12) + 1;
}

export function checkMoonDoubleTransit(
  data: MoonDoubleTransitInput,
  type: MoonDoubleTransitType,
  targetHouses: { jupiter: number[]; saturn: number[] }
): MoonDoubleTransitResult {
  const jupiterHouse = houseFromMoon(data.transitJupiterRashi, data.natalMoonRashi);
  const saturnHouse = houseFromMoon(data.transitSaturnRashi, data.natalMoonRashi);
  const jupiterRashi = DOUBLE_TRANSIT_RASHI_NAMES[data.transitJupiterRashi] ?? 'Unknown';
  const saturnRashi = DOUBLE_TRANSIT_RASHI_NAMES[data.transitSaturnRashi] ?? 'Unknown';

  const jupiterOnTarget = targetHouses.jupiter.includes(jupiterHouse);
  const saturnOnTarget = targetHouses.saturn.includes(saturnHouse);
  const isActive = jupiterOnTarget && saturnOnTarget;
  const confidence: MoonDoubleTransitResult['confidence'] = isActive
    ? jupiterHouse === saturnHouse
      ? 'high'
      : 'moderate'
    : 'low';

  const readableType = type.charAt(0).toUpperCase() + type.slice(1);
  const narrative = isActive
    ? `Double transit active: Jupiter in ${jupiterRashi} (house ${jupiterHouse} from Moon) and Saturn in ${saturnRashi} (house ${saturnHouse} from Moon). This is favourable for ${type} events.`
    : `Double transit incomplete: Jupiter is in house ${jupiterHouse} from Moon (${jupiterOnTarget ? 'on target' : 'off target'}), Saturn is in house ${saturnHouse} from Moon (${saturnOnTarget ? 'on target' : 'off target'}). Event timing is premature.`;

  const thereforeVerdict = isActive
    ? `Therefore: ${readableType} timing is structurally supported now if Dasha also confirms.`
    : `Therefore: ${readableType} timing is not structurally certified yet; wait for Jupiter and Saturn to jointly activate the target houses.`;

  return {
    type,
    isActive,
    jupiterHouse,
    saturnHouse,
    jupiterRashi,
    saturnRashi,
    confidence,
    narrative,
    thereforeVerdict,
  };
}

export function checkMarriageMoonDoubleTransit(
  data: MoonDoubleTransitInput
): MoonDoubleTransitResult {
  return checkMoonDoubleTransit(data, 'marriage', { jupiter: [1, 7, 11], saturn: [3, 7] });
}

export function checkCareerMoonDoubleTransit(
  data: MoonDoubleTransitInput
): MoonDoubleTransitResult {
  return checkMoonDoubleTransit(data, 'career', { jupiter: [1, 6, 10, 11], saturn: [3, 10] });
}

export function checkWealthMoonDoubleTransit(
  data: MoonDoubleTransitInput
): MoonDoubleTransitResult {
  return checkMoonDoubleTransit(data, 'wealth', { jupiter: [2, 5, 9, 11], saturn: [2, 11] });
}

export function checkChildMoonDoubleTransit(
  data: MoonDoubleTransitInput
): MoonDoubleTransitResult {
  return checkMoonDoubleTransit(data, 'child', { jupiter: [1, 5, 9, 11], saturn: [3, 5, 11] });
}

export function checkForeignMoonDoubleTransit(
  data: MoonDoubleTransitInput
): MoonDoubleTransitResult {
  return checkMoonDoubleTransit(data, 'foreign', { jupiter: [9, 12], saturn: [9, 12] });
}

export function buildApproxMoonDoubleTransitInput(
  natalMoonRashi: number,
  date: Date = new Date(),
  ascendantRashi?: number
): MoonDoubleTransitInput {
  return {
    natalMoonRashi,
    transitJupiterRashi: approxJupiterRashi(date),
    transitSaturnRashi: approxSaturnRashi(date),
    ascendantRashi,
  };
}

/**
 * Derives double-transit input dynamically from calculated ephemeris planetary positions,
 * falling back gracefully to date-based approximation if specific planets are omitted.
 */
export function buildExactMoonDoubleTransitInput(
  natalMoonRashi: number,
  planets?: Array<{ name: string; longitude?: number; sign?: number }>,
  ascendantRashi?: number,
  fallbackDate: Date = new Date()
): MoonDoubleTransitInput {
  let jupiterRashi = approxJupiterRashi(fallbackDate);
  let saturnRashi = approxSaturnRashi(fallbackDate);

  if (planets && planets.length > 0) {
    const jup = planets.find(
      (p) => p.name.toLowerCase() === 'jupiter' || p.name.toLowerCase() === 'guru'
    );
    if (jup) {
      if (typeof jup.sign === 'number') {
        jupiterRashi = jup.sign;
      } else if (typeof jup.longitude === 'number') {
        jupiterRashi = Math.floor((jup.longitude % 360) / 30);
      }
    }

    const sat = planets.find(
      (p) => p.name.toLowerCase() === 'saturn' || p.name.toLowerCase() === 'shani'
    );
    if (sat) {
      if (typeof sat.sign === 'number') {
        saturnRashi = sat.sign;
      } else if (typeof sat.longitude === 'number') {
        saturnRashi = Math.floor((sat.longitude % 360) / 30);
      }
    }
  }

  return {
    natalMoonRashi,
    transitJupiterRashi: jupiterRashi,
    transitSaturnRashi: saturnRashi,
    ascendantRashi,
  };
}
