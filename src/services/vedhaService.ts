/**
 * Vedha & Vipreet Vedha Service
 * Classical Vedic transit obstruction analysis
 *
 * Vedha: A planet in a favorable house from Moon is "obstructed"
 *        if another planet simultaneously transits the Vedha house.
 *
 * Vipreet Vedha: When a malefic obstructs another malefic,
 *                the obstruction is cancelled — benefic results restored.
 *
 * Source: BPHS, Phaladeepika, Raman tradition
 */

// Standard Vedha pairs: favorable house → obstructing house
// Key: planet name, Value: map of favorable house → vedha house
export const VEDHA_PAIRS: Record<string, Record<number, number>> = {
  Sun:     { 3: 9,  6: 12, 10: 4,  11: 5  },
  Moon:    { 1: 5,  3: 9,  6: 12,  7: 2,  10: 4, 11: 8 },
  Mars:    { 3: 12, 6: 9,  11: 5                        },
  Mercury: { 2: 5,  4: 3,  6: 9,   8: 1,  10: 8, 11: 12},
  Jupiter: { 2: 12, 5: 4,  7: 3,   9: 10, 11: 8        },
  Venus:   { 1: 8,  2: 7,  3: 1,   4: 10, 5: 9, 8: 5, 9: 11, 11: 6, 12: 3 },
  Saturn:  { 3: 12, 6: 9,  11: 5                        },
  Rahu:    { 3: 12, 6: 9,  11: 5                        },
  Ketu:    { 3: 12, 6: 9,  11: 5                        },
};

const MALEFICS = new Set(['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu']);

export interface VedhaResult {
  planet: string;
  favorableHouse: number;
  isObstructed: boolean;
  obstructingPlanet?: string;
  obstructingHouse?: number;
  isVipreetVedha: boolean;   // malefic obstructs malefic → obstruction cancelled
  effectiveResult: 'Full' | 'Obstructed' | 'Restored';
  explanation: { en: string; hi: string };
}

/**
 * Check Vedha for a single transiting planet
 * @param planet         Transiting planet name
 * @param houseFromMoon  House the planet occupies from natal Moon (1-12)
 * @param otherTransits  Map of other transiting planets → their house from Moon
 */
export function checkVedha(
  planet: string,
  houseFromMoon: number,
  otherTransits: Record<string, number>
): VedhaResult {
  const vedhaMap = VEDHA_PAIRS[planet] ?? {};
  const vedhaHouse = vedhaMap[houseFromMoon];

  if (!vedhaHouse) {
    // No Vedha applicable for this house
    return {
      planet, favorableHouse: houseFromMoon,
      isObstructed: false, isVipreetVedha: false,
      effectiveResult: 'Full',
      explanation: {
        en: `${planet} in house ${houseFromMoon} — no Vedha applicable, full results expected`,
        hi: `${planet} भाव ${houseFromMoon} में — कोई वेध नहीं, पूर्ण फल संभव`
      }
    };
  }

  // Check if any other planet is in the Vedha house
  const obstructingPlanet = Object.entries(otherTransits)
    .find(([p, h]) => p !== planet && h === vedhaHouse)?.[0];

  if (!obstructingPlanet) {
    return {
      planet, favorableHouse: houseFromMoon,
      isObstructed: false, isVipreetVedha: false,
      effectiveResult: 'Full',
      explanation: {
        en: `${planet} in house ${houseFromMoon} — Vedha house ${vedhaHouse} is clear, full results`,
        hi: `${planet} भाव ${houseFromMoon} में — वेध भाव ${vedhaHouse} खाली है, पूर्ण फल`
      }
    };
  }

  // Obstruction found — check Vipreet Vedha
  const isVipreet = MALEFICS.has(planet) && MALEFICS.has(obstructingPlanet);

  if (isVipreet) {
    return {
      planet, favorableHouse: houseFromMoon,
      isObstructed: true,
      obstructingPlanet,
      obstructingHouse: vedhaHouse,
      isVipreetVedha: true,
      effectiveResult: 'Restored',
      explanation: {
        en: `Vipreet Vedha: ${obstructingPlanet} (malefic) obstructs ${planet} (malefic) in house ${vedhaHouse} — obstruction cancelled, results restored`,
        hi: `विपरीत वेध: ${obstructingPlanet} (पाप) ने ${planet} (पाप) को भाव ${vedhaHouse} में रोका — वेध निरस्त, फल पुनः प्राप्त`
      }
    };
  }

  return {
    planet, favorableHouse: houseFromMoon,
    isObstructed: true,
    obstructingPlanet,
    obstructingHouse: vedhaHouse,
    isVipreetVedha: false,
    effectiveResult: 'Obstructed',
    explanation: {
      en: `Vedha: ${obstructingPlanet} in house ${vedhaHouse} obstructs ${planet} in house ${houseFromMoon} — results reduced`,
      hi: `वेध: ${obstructingPlanet} भाव ${vedhaHouse} में ${planet} को भाव ${houseFromMoon} में रोक रहा है — फल कम होगा`
    }
  };
}

/**
 * Check all 9 planets for Vedha simultaneously
 */
export function checkAllVedha(
  transitHouses: Record<string, number>  // planet → house from Moon
): VedhaResult[] {
  return Object.entries(transitHouses).map(([planet, house]) =>
    checkVedha(planet, house, transitHouses)
  );
}
