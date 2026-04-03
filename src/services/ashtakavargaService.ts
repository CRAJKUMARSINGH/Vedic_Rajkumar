/**
 * Ashtakavarga System
 * Point-based transit strength analysis — core Vedic predictive tool
 * Each planet contributes points (0 or 1) to each rashi based on its position
 * relative to 8 reference points (7 planets + ascendant)
 *
 * Reference: Brihat Parashara Hora Shastra (BPHS)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AshtakavargaTable {
  planet: string;
  /** Points contributed by each of the 8 contributors to each of 12 rashis */
  contributorPoints: Record<string, number[]>; // contributor → 12 rashi points
  /** Total BAV (Bhinnashtakavarga) points per rashi (0-8) */
  bavPoints: number[];                          // [rashi0..rashi11]
}

export interface SarvashtakavargaResult {
  /** SAV: sum of all 7 planet BAV tables per rashi */
  savPoints: number[];   // [rashi0..rashi11], max 56 per rashi
  /** Individual planet BAV tables */
  tables: AshtakavargaTable[];
  /** Ascendant rashi index (0-11) */
  ascendantRashi: number;
  /** Strength of each house (1-12) based on SAV */
  houseStrengths: HouseStrength[];
  /** Transit recommendations */
  transitStrengths: TransitStrength[];
}

export interface HouseStrength {
  house: number;
  rashiIndex: number;
  savPoints: number;
  strength: 'excellent' | 'good' | 'average' | 'weak' | 'very-weak';
  label: { en: string; hi: string };
}

export interface TransitStrength {
  planet: string;
  currentRashi: number;
  bavPoints: number;
  isStrong: boolean;
  recommendation: { en: string; hi: string };
}

// ─── BAV Contribution Tables ──────────────────────────────────────────────────
// For each planet, the houses FROM which each contributor gives a point.
// These are the classical BPHS tables (houses counted from contributor's position).
// Format: contributor → [houses that give 1 point, 1-indexed from contributor]

const BAV_RULES: Record<string, Record<string, number[]>> = {
  Sun: {
    Sun:       [1, 2, 4, 7, 8, 9, 10, 11],
    Moon:      [3, 6, 10, 11],
    Mars:      [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury:   [3, 5, 6, 9, 10, 11, 12],
    Jupiter:   [5, 6, 9, 11],
    Venus:     [6, 7, 12],
    Saturn:    [1, 2, 4, 7, 8, 9, 10, 11],
    Ascendant: [3, 4, 6, 10, 11, 12],
  },
  Moon: {
    Sun:       [3, 6, 7, 8, 10, 11],
    Moon:      [1, 3, 6, 7, 10, 11],
    Mars:      [2, 3, 5, 6, 9, 10, 11],
    Mercury:   [1, 3, 4, 5, 7, 8, 10, 11],
    Jupiter:   [1, 4, 7, 8, 10, 11, 12],
    Venus:     [3, 4, 5, 7, 9, 10, 11],
    Saturn:    [3, 5, 6, 11],
    Ascendant: [3, 6, 10, 11],
  },
  Mars: {
    Sun:       [3, 5, 6, 10, 11],
    Moon:      [3, 6, 11],
    Mars:      [1, 2, 4, 7, 8, 10, 11],
    Mercury:   [3, 5, 6, 11],
    Jupiter:   [6, 10, 11, 12],
    Venus:     [6, 8, 11, 12],
    Saturn:    [1, 4, 7, 8, 9, 10, 11],
    Ascendant: [1, 3, 6, 10, 11],
  },
  Mercury: {
    Sun:       [5, 6, 9, 11, 12],
    Moon:      [2, 4, 6, 8, 10, 11],
    Mars:      [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury:   [1, 3, 5, 6, 9, 10, 11, 12],
    Jupiter:   [6, 8, 11, 12],
    Venus:     [1, 2, 3, 4, 5, 8, 9, 11],
    Saturn:    [1, 2, 4, 7, 8, 9, 10, 11],
    Ascendant: [1, 2, 4, 6, 8, 10, 11],
  },
  Jupiter: {
    Sun:       [1, 2, 3, 4, 7, 8, 9, 10, 11],
    Moon:      [2, 5, 7, 9, 11],
    Mars:      [1, 2, 4, 7, 8, 10, 11],
    Mercury:   [1, 2, 4, 5, 6, 9, 10, 11],
    Jupiter:   [1, 2, 3, 4, 7, 8, 10, 11],
    Venus:     [2, 5, 6, 9, 10, 11],
    Saturn:    [3, 5, 6, 12],
    Ascendant: [1, 2, 4, 5, 6, 7, 9, 10, 11],
  },
  Venus: {
    Sun:       [8, 11, 12],
    Moon:      [1, 2, 3, 4, 5, 8, 9, 11, 12],
    Mars:      [3, 4, 6, 9, 11, 12],
    Mercury:   [3, 5, 6, 9, 11],
    Jupiter:   [5, 8, 9, 10, 11],
    Venus:     [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Saturn:    [3, 4, 5, 8, 9, 10, 11],
    Ascendant: [1, 2, 3, 4, 5, 8, 9, 11],
  },
  Saturn: {
    Sun:       [1, 2, 4, 7, 8, 10, 11],
    Moon:      [3, 6, 11],
    Mars:      [3, 5, 6, 10, 11, 12],
    Mercury:   [6, 8, 9, 10, 11, 12],
    Jupiter:   [5, 6, 11, 12],
    Venus:     [6, 11, 12],
    Saturn:    [3, 5, 6, 11],
    Ascendant: [1, 3, 4, 6, 10, 11],
  },
};

const PLANETS_FOR_BAV = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const CONTRIBUTORS = [...PLANETS_FOR_BAV, 'Ascendant'];

// ─── Core Calculation ─────────────────────────────────────────────────────────

/**
 * Calculate house number (1-12) from a reference rashi to a target rashi
 */
function houseFrom(referenceRashi: number, targetRashi: number): number {
  return ((targetRashi - referenceRashi + 12) % 12) + 1;
}

/**
 * Calculate Bhinnashtakavarga (BAV) for a single planet
 */
function calculateBAV(
  planet: string,
  planetRashi: number,
  contributorRashis: Record<string, number>, // contributor → rashiIndex
): AshtakavargaTable {
  const rules = BAV_RULES[planet];
  if (!rules) throw new Error(`No BAV rules for planet: ${planet}`);

  const contributorPoints: Record<string, number[]> = {};
  const bavPoints = new Array(12).fill(0);

  for (const contributor of CONTRIBUTORS) {
    const contribRashi = contributorRashis[contributor];
    if (contribRashi === undefined) continue;

    const contribRules = rules[contributor] || [];
    const points = new Array(12).fill(0);

    for (let rashi = 0; rashi < 12; rashi++) {
      const house = houseFrom(contribRashi, rashi);
      if (contribRules.includes(house)) {
        points[rashi] = 1;
        bavPoints[rashi] += 1;
      }
    }

    contributorPoints[contributor] = points;
  }

  return { planet, contributorPoints, bavPoints };
}

/**
 * Main function: Calculate complete Ashtakavarga
 */
export function calculateAshtakavarga(
  planetRashis: Record<string, number>, // planet name → rashiIndex (0-11)
  ascendantRashi: number,
): SarvashtakavargaResult {
  const contributorRashis: Record<string, number> = {
    ...planetRashis,
    Ascendant: ascendantRashi,
  };

  // Calculate BAV for each of the 7 planets
  const tables: AshtakavargaTable[] = PLANETS_FOR_BAV.map(planet => {
    const rashi = planetRashis[planet] ?? 0;
    return calculateBAV(planet, rashi, contributorRashis);
  });

  // SAV = sum of all BAV tables
  const savPoints = new Array(12).fill(0);
  for (const table of tables) {
    for (let i = 0; i < 12; i++) {
      savPoints[i] += table.bavPoints[i];
    }
  }

  // House strengths
  const houseStrengths: HouseStrength[] = Array.from({ length: 12 }, (_, i) => {
    const house = i + 1;
    const rashiIndex = (ascendantRashi + i) % 12;
    const pts = savPoints[rashiIndex];
    let strength: HouseStrength['strength'];
    let label: { en: string; hi: string };

    if (pts >= 30) {
      strength = 'excellent';
      label = { en: 'Excellent', hi: 'उत्कृष्ट' };
    } else if (pts >= 25) {
      strength = 'good';
      label = { en: 'Good', hi: 'अच्छा' };
    } else if (pts >= 20) {
      strength = 'average';
      label = { en: 'Average', hi: 'सामान्य' };
    } else if (pts >= 15) {
      strength = 'weak';
      label = { en: 'Weak', hi: 'कमजोर' };
    } else {
      strength = 'very-weak';
      label = { en: 'Very Weak', hi: 'अत्यंत कमजोर' };
    }

    return { house, rashiIndex, savPoints: pts, strength, label };
  });

  // Transit strengths for each planet
  const transitStrengths: TransitStrength[] = tables.map(table => {
    const currentRashi = planetRashis[table.planet] ?? 0;
    const bavPoints = table.bavPoints[currentRashi];
    const isStrong = bavPoints >= 4;

    return {
      planet: table.planet,
      currentRashi,
      bavPoints,
      isStrong,
      recommendation: getTransitRecommendation(table.planet, bavPoints),
    };
  });

  return { savPoints, tables, ascendantRashi, houseStrengths, transitStrengths };
}

function getTransitRecommendation(planet: string, points: number): { en: string; hi: string } {
  if (points >= 5) {
    return {
      en: `${planet} is very strong in transit (${points}/8 pts). Excellent time for ${planet}-related activities.`,
      hi: `${planet} गोचर में बहुत बलवान है (${points}/8 अंक)। ${planet} संबंधित कार्यों के लिए उत्तम समय।`,
    };
  } else if (points >= 4) {
    return {
      en: `${planet} is moderately strong in transit (${points}/8 pts). Good time for ${planet}-related activities.`,
      hi: `${planet} गोचर में मध्यम बलवान है (${points}/8 अंक)। ${planet} संबंधित कार्यों के लिए अच्छा समय।`,
    };
  } else if (points >= 3) {
    return {
      en: `${planet} is average in transit (${points}/8 pts). Proceed with caution for ${planet}-related matters.`,
      hi: `${planet} गोचर में सामान्य है (${points}/8 अंक)। ${planet} संबंधित मामलों में सावधानी बरतें।`,
    };
  } else {
    return {
      en: `${planet} is weak in transit (${points}/8 pts). Avoid major ${planet}-related decisions.`,
      hi: `${planet} गोचर में कमजोर है (${points}/8 अंक)। प्रमुख ${planet} संबंधित निर्णय टालें।`,
    };
  }
}

/**
 * Get the best transit rashi for a planet (highest BAV points)
 */
export function getBestTransitRashi(table: AshtakavargaTable): {
  rashiIndex: number;
  points: number;
} {
  let best = 0;
  let bestPts = -1;
  for (let i = 0; i < 12; i++) {
    if (table.bavPoints[i] > bestPts) {
      bestPts = table.bavPoints[i];
      best = i;
    }
  }
  return { rashiIndex: best, points: bestPts };
}

/**
 * Get the worst transit rashi for a planet (lowest BAV points)
 */
export function getWorstTransitRashi(table: AshtakavargaTable): {
  rashiIndex: number;
  points: number;
} {
  let worst = 0;
  let worstPts = 9;
  for (let i = 0; i < 12; i++) {
    if (table.bavPoints[i] < worstPts) {
      worstPts = table.bavPoints[i];
      worst = i;
    }
  }
  return { rashiIndex: worst, points: worstPts };
}

/**
 * Trikona Shodhana: Reduce BAV by removing points in trikona houses
 * (Classical reduction technique for more accurate results)
 */
export function trikonaShodhana(bavPoints: number[], ascendantRashi: number): number[] {
  const result = [...bavPoints];
  // Trikona houses: 1, 5, 9 from ascendant
  const t1 = ascendantRashi;
  const t5 = (ascendantRashi + 4) % 12;
  const t9 = (ascendantRashi + 8) % 12;

  const minTrikona = Math.min(result[t1], result[t5], result[t9]);
  result[t1] -= minTrikona;
  result[t5] -= minTrikona;
  result[t9] -= minTrikona;

  return result;
}

/**
 * Ekadhipatya Shodhana: Reduce BAV for signs with same lord
 */
export function ekadhipatyaShodhana(bavPoints: number[]): number[] {
  const result = [...bavPoints];
  // Pairs with same lord: (0,7)=Mars, (1,6)=Venus, (2,5)=Mercury, (3)=Moon, (4)=Sun, (8,11)=Jupiter, (9,10)=Saturn
  const pairs = [[0, 7], [1, 6], [2, 5], [8, 11], [9, 10]];

  for (const [a, b] of pairs) {
    const minVal = Math.min(result[a], result[b]);
    result[a] -= minVal;
    result[b] -= minVal;
  }

  return result;
}
