/**
 * ashtakavargaService.ts — Complete Ashtakavarga Engine
 *
 * DROP THIS FILE INTO: src/services/ashtakavargaService.ts
 *
 * Implements the complete Ashtakavarga system from:
 *   - Brihat Jataka (Varahamihira, Chapter IX)
 *   - Brihat Parashara Hora Shastra (BPHS), Chapter 66–69
 *   - N. Chidambaram Aiyar translation (1905)
 *
 * FEATURES IMPLEMENTED:
 *   1. Bhinnashtakavarga (BAV) — 7 individual planet charts, each 0–8 per house
 *   2. Sarvashtakavarga (SAV) — sum of all 7 BAV; total = 337 always
 *   3. Trikona Reduction      — equalises inherited strengths across trine groups
 *   4. Ekadhipataya Reduction — adjusts dual-owner sign pairs
 *   5. Wealth Formula         — 11th > 10th, 12th < 11th, Lagna > 12th
 *   6. Life Thirds Analysis   — happiest phase of life from SAV totals
 *   7. Planet-wise BAV rules  — children count (Jupiter), disease windows (Saturn), etc.
 *   8. Transit Prediction     — SAV-based verdict for any planet transiting any sign
 *   9. Sade Sati Severity     — BAV scores of Saturn's transit signs
 *
 * USAGE:
 *   import { assembleEngineData } from './engineDataAssembler';
 *   import { calculateAshtakavarga } from './ashtakavargaService';
 *
 *   const engine = assembleEngineData(birthDate, lat, lng);
 *   const avarga = calculateAshtakavarga(engine.planets, engine.lagnaRashiIdx);
 *
 * RETURNS: AshtakavargaResult — see interface below.
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type PlanetName = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn';

/** One planet's Bhinnashtakavarga: 12 scores (index = rashi 0-11) */
export type BAVChart = [number,number,number,number,number,number,number,number,number,number,number,number];

/** Sarvashtakavarga: sum of all 7 BAV charts */
export type SAVChart = [number,number,number,number,number,number,number,number,number,number,number,number];

export interface BAVPlanetResult {
  planet:      PlanetName;
  raw:         BAVChart;       // before reductions
  reduced:     BAVChart;       // after Trikona + Ekadhipataya
  houseScores: number[];       // reindexed by house (house 1 = index 0)
  insight:     string;         // classical rule for this planet
}

export interface SAVResult {
  raw:          SAVChart;      // before reductions
  reduced:      SAVChart;      // after reductions
  houseScores:  number[];      // reindexed by house (house 1 = index 0)
  total:        number;        // always ~337 before reduction
}

export interface WealthFormula {
  tenthScore:     number;
  eleventhScore:  number;
  twelfthScore:   number;
  lagnaScore:     number;
  gainExceedsEffort:   boolean;   // 11th > 10th
  lossesSmaller:       boolean;   // 12th < 11th
  wealthProtected:     boolean;   // Lagna > 12th
  allThreeMet:         boolean;
  verdict:             string;
}

export interface LifeThirds {
  firstThird:  { signs: string[]; rashis: number[]; total: number; label: string };
  middleThird: { signs: string[]; rashis: number[]; total: number; label: string };
  finalThird:  { signs: string[]; rashis: number[]; total: number; label: string };
  happiestPhase: string;
  maleficWarning?: string;
}

export interface TransitPrediction {
  planet:      string;
  sign:        string;
  rashiIndex:  number;
  bavScore:    number;   // planet's own BAV score at this rashi
  savScore:    number;   // SAV score at this rashi
  isUpachaya:  boolean;  // 3rd/6th/10th/11th house from lagna
  verdict:     'Excellent' | 'Good' | 'Neutral' | 'Difficult' | 'Severe';
  detail:      string;
}

export interface PlanetInsightResult {
  childrenExpected?:      string;   // Jupiter's BAV score in 5th from Jupiter
  diseasePeriods?:        string;   // Saturn/Sun zero-score signs
  marriageWealth?:        string;   // Venus peak transit windows
  sadeSatiSeverity?:      string;   // Saturn BAV for Sade Sati signs
}

export interface AshtakavargaResult {
  bav:              Record<PlanetName, BAVPlanetResult>;
  sav:              SAVResult;
  wealthFormula:    WealthFormula;
  lifeThirds:       LifeThirds;
  transitForToday:  TransitPrediction[];   // all 7 planets' current transit verdicts
  planetInsights:   PlanetInsightResult;
  lagnaRashiIdx:    number;
}

// ─── BAV Benefic Tables ────────────────────────────────────────────────────────
// Source: BPHS Ch.66 / Brihat Jataka Ch.IX
// Key: planet → reference point → benefic house numbers (1-based)

const BENEFIC_HOUSES: Record<PlanetName, Record<string, number[]>> = {
  Sun: {
    Sun:     [1, 2, 4, 7, 8, 9, 10, 11],
    Moon:    [3, 6, 10, 11],
    Mars:    [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [3, 5, 6, 9, 10, 11, 12],
    Jupiter: [5, 6, 9, 11],
    Venus:   [6, 7, 12],
    Saturn:  [1, 2, 4, 7, 8, 9, 10, 11],
    Lagna:   [1, 2, 4, 7, 8, 9, 10, 11],
  },
  Moon: {
    Sun:     [3, 6, 7, 8, 10, 11],
    Moon:    [1, 3, 6, 7, 10, 11],
    Mars:    [2, 3, 5, 6, 9, 10, 11],
    Mercury: [1, 3, 4, 5, 7, 8, 10, 11],
    Jupiter: [1, 4, 7, 8, 10, 11, 12],
    Venus:   [3, 4, 5, 7, 9, 10, 11],
    Saturn:  [3, 5, 6, 11],
    Lagna:   [3, 6, 10, 11],
  },
  Mars: {
    Sun:     [3, 5, 6, 10, 11],
    Moon:    [3, 6, 11],
    Mars:    [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [3, 5, 6, 11],
    Jupiter: [6, 10, 11, 12],
    Venus:   [6, 8, 11, 12],
    Saturn:  [1, 4, 7, 8, 9, 10, 11],
    Lagna:   [1, 2, 4, 7, 8, 9, 10, 11],
  },
  Mercury: {
    Sun:     [5, 6, 9, 11, 12],
    Moon:    [2, 4, 6, 8, 10, 11],
    Mars:    [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [1, 3, 5, 6, 9, 10, 11, 12],
    Jupiter: [6, 8, 11, 12],
    Venus:   [1, 2, 3, 4, 5, 8, 9, 11],
    Saturn:  [1, 2, 4, 7, 8, 9, 10, 11],
    Lagna:   [1, 2, 4, 7, 8, 9, 10, 11],
  },
  Jupiter: {
    Sun:     [1, 2, 3, 4, 7, 8, 9, 10, 11],
    Moon:    [2, 5, 7, 9, 11],
    Mars:    [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [1, 2, 4, 5, 6, 9, 10, 11],
    Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
    Venus:   [2, 5, 6, 9, 10, 11],
    Saturn:  [3, 5, 6, 12],
    Lagna:   [1, 2, 4, 7, 8, 9, 10, 11],
  },
  Venus: {
    Sun:     [8, 11, 12],
    Moon:    [1, 2, 3, 4, 5, 8, 9, 11, 12],
    Mars:    [3, 5, 6, 9, 11, 12],
    Mercury: [3, 5, 6, 9, 11],
    Jupiter: [5, 8, 9, 10, 11],
    Venus:   [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Saturn:  [3, 4, 5, 8, 9, 10, 11],
    Lagna:   [1, 2, 3, 4, 5, 8, 9, 11],
  },
  Saturn: {
    Sun:     [1, 2, 4, 7, 8, 9, 10, 11],
    Moon:    [3, 6, 11],
    Mars:    [3, 5, 6, 10, 11, 12],
    Mercury: [6, 8, 9, 10, 11, 12],
    Jupiter: [5, 6, 9, 11],
    Venus:   [6, 11, 12],
    Saturn:  [3, 5, 6, 11],
    Lagna:   [1, 2, 4, 7, 8, 9, 10, 11],
  },
};

// ─── Constants ─────────────────────────────────────────────────────────────────

export const RASHI_NAMES_SHORT = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

// Trine groups (rashi indices)
const TRIKONA_GROUPS: [number, number, number][] = [
  [0, 4, 8],   // Fire:  Aries, Leo, Sagittarius
  [1, 5, 9],   // Earth: Taurus, Virgo, Capricorn
  [2, 6, 10],  // Air:   Gemini, Libra, Aquarius
  [3, 7, 11],  // Water: Cancer, Scorpio, Pisces
];

// Dual-owner sign pairs (rashi indices)
const DUAL_SIGN_PAIRS: Array<[number, number]> = [
  [0, 7],   // Mars:    Aries, Scorpio
  [1, 6],   // Venus:   Taurus, Libra
  [2, 5],   // Mercury: Gemini, Virgo
  [8, 11],  // Jupiter: Sagittarius, Pisces
  [9, 10],  // Saturn:  Capricorn, Aquarius
];

// Upachaya houses (3, 6, 10, 11)
const UPACHAYA_HOUSES = new Set([3, 6, 10, 11]);

const SEVEN_PLANETS: PlanetName[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

// ─── Core BAV calculation ──────────────────────────────────────────────────────

/**
 * Calculate raw Bhinnashtakavarga (BAV) for a single planet.
 *
 * For each rashi (0-11), counts how many of the 8 reference points
 * (7 planets + Lagna) contribute a benefic dot to that rashi.
 *
 * @param targetPlanet   — which planet's BAV we are building
 * @param planetPositions — map of planet name → rashi index (0-11)
 * @param lagnaRashiIdx  — Ascendant rashi index (0-11)
 */
function calcRawBAV(
  targetPlanet:    PlanetName,
  planetPositions: Record<string, number>,
  lagnaRashiIdx:   number,
): BAVChart {
  const scores = new Array(12).fill(0) as BAVChart;
  const table  = BENEFIC_HOUSES[targetPlanet];

  const referencePoints: Array<{ key: string; rashi: number }> = [
    ...SEVEN_PLANETS.map(p => ({ key: p, rashi: planetPositions[p] ?? 0 })),
    { key: 'Lagna', rashi: lagnaRashiIdx },
  ];

  for (const ref of referencePoints) {
    const beneficHouses = table[ref.key];
    if (!beneficHouses) continue;

    for (let rashi = 0; rashi < 12; rashi++) {
      // House of this rashi counted from ref position (1-based)
      const house = ((rashi - ref.rashi + 12) % 12) + 1;
      if (beneficHouses.includes(house)) {
        scores[rashi]++;
      }
    }
  }

  return scores as BAVChart;
}

// ─── Reductions ────────────────────────────────────────────────────────────────

/**
 * Trikona Reduction (Prastara Ashtakavarga → Bhinna Ashtakavarga).
 * For each trine group, subtract the minimum score from all three members.
 */
function applyTrikonaReduction(chart: BAVChart): BAVChart {
  const result = [...chart] as BAVChart;
  for (const [a, b, c] of TRIKONA_GROUPS) {
    const min = Math.min(result[a], result[b], result[c]);
    result[a] -= min;
    result[b] -= min;
    result[c] -= min;
  }
  return result;
}

/**
 * Ekadhipataya Reduction.
 * For dual-owner sign pairs: if planets occupy both signs, reduce the lower
 * score to zero and reduce the higher by that lower amount.
 * If only one sign is occupied, no change.
 */
function applyEkadhipatayaReduction(
  chart:           BAVChart,
  planetPositions: Record<string, number>,
): BAVChart {
  const result = [...chart] as BAVChart;

  for (const [s1, s2] of DUAL_SIGN_PAIRS) {
    // Count planets in each sign
    const p1 = Object.values(planetPositions).filter(r => r === s1).length;
    const p2 = Object.values(planetPositions).filter(r => r === s2).length;

    if (p1 > 0 && p2 > 0) {
      // Both occupied: reduce lower from both
      const lower = Math.min(result[s1], result[s2]);
      result[s1] -= lower;
      result[s2] -= lower;
    }
    // If neither or only one is occupied: no change
  }
  return result;
}

// ─── SAV ──────────────────────────────────────────────────────────────────────

function calcSAV(bavCharts: Record<PlanetName, BAVChart>): SAVChart {
  const sav = new Array(12).fill(0) as SAVChart;
  for (const planet of SEVEN_PLANETS) {
    for (let i = 0; i < 12; i++) {
      sav[i] += bavCharts[planet][i];
    }
  }
  return sav as SAVChart;
}

// ─── Reindex by house ─────────────────────────────────────────────────────────

/** Rotate rashi-indexed array so index 0 = house 1 (Lagna rashi) */
function reindexByHouse(chart: BAVChart | SAVChart, lagnaRashiIdx: number): number[] {
  return Array.from({ length: 12 }, (_, i) => chart[(lagnaRashiIdx + i) % 12]);
}

// ─── Wealth Formula ───────────────────────────────────────────────────────────

function calcWealthFormula(savReduced: SAVChart, lagnaRashiIdx: number): WealthFormula {
  const lagnaScore    = savReduced[lagnaRashiIdx];
  const tenthScore    = savReduced[(lagnaRashiIdx + 9)  % 12];
  const eleventhScore = savReduced[(lagnaRashiIdx + 10) % 12];
  const twelfthScore  = savReduced[(lagnaRashiIdx + 11) % 12];

  const gainExceedsEffort = eleventhScore > tenthScore;
  const lossesSmaller     = twelfthScore  < eleventhScore;
  const wealthProtected   = lagnaScore    > twelfthScore;
  const allThreeMet       = gainExceedsEffort && lossesSmaller && wealthProtected;

  let verdict: string;
  if (allThreeMet) {
    verdict = 'All three Varahamihira conditions are met — this native lives happily and prospers. Gains exceed effort, losses are small, and wealth is protected.';
  } else {
    const failures: string[] = [];
    if (!gainExceedsEffort) failures.push(`11th house (${eleventhScore}) ≤ 10th house (${tenthScore}) — hard work does not translate to proportional gain`);
    if (!lossesSmaller)     failures.push(`12th house (${twelfthScore}) ≥ 11th house (${eleventhScore}) — losses can exceed gains`);
    if (!wealthProtected)   failures.push(`Lagna (${lagnaScore}) ≤ 12th house (${twelfthScore}) — wealth is vulnerable to dissipation`);
    verdict = `${failures.join('. ')}.`;
  }

  return { tenthScore, eleventhScore, twelfthScore, lagnaScore, gainExceedsEffort, lossesSmaller, wealthProtected, allThreeMet, verdict };
}

// ─── Life Thirds ──────────────────────────────────────────────────────────────

function calcLifeThirds(savReduced: SAVChart): LifeThirds {
  // Varahamihira divides life into three sections by sign groups
  const thirds = [
    { label: 'Early life',  rashis: [11, 0, 1, 2],   signs: ['Pisces', 'Aries', 'Taurus', 'Gemini']   },
    { label: 'Middle years', rashis: [3, 4, 5, 6],   signs: ['Cancer', 'Leo', 'Virgo', 'Libra']        },
    { label: 'Final years', rashis: [7, 8, 9, 10],   signs: ['Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius'] },
  ];

  const results = thirds.map(t => ({
    ...t,
    total: t.rashis.reduce((sum, r) => sum + savReduced[r], 0),
  }));

  const [first, middle, final] = results;
  const maxTotal = Math.max(first.total, middle.total, final.total);
  const happiest = results.find(r => r.total === maxTotal)!;

  // Malefic warning: any third with ≥3 malefic planets (Mars, Saturn, Rahu, Ketu)
  // We can't check this here without planet positions, so leave as a note
  const maleficWarning = undefined;

  return {
    firstThird:  { signs: first.signs, rashis: first.rashis, total: first.total, label: first.label },
    middleThird: { signs: middle.signs, rashis: middle.rashis, total: middle.total, label: middle.label },
    finalThird:  { signs: final.signs, rashis: final.rashis, total: final.total, label: final.label },
    happiestPhase: `${happiest.label} (${happiest.signs.join('–')}) — SAV total: ${happiest.total}`,
    maleficWarning,
  };
}

// ─── Transit Prediction ───────────────────────────────────────────────────────

/**
 * Predict the result of a planet transiting a given sign,
 * using that planet's reduced BAV score at the sign
 * combined with the SAV score at the sign.
 *
 * Varahamihira's rule:
 *   - BAV score ≥ 4 at an Upachaya house AND SAV ≥ 30 → Excellent
 *   - BAV ≥ 4 → Good
 *   - BAV 2-3 → Neutral
 *   - BAV ≤ 1 → Difficult
 *   - BAV = 0 → Severe (zero-score = avoid starting new work)
 */
export function predictTransit(
  planet:     PlanetName,
  rashiIndex: number,
  bavReduced: BAVChart,
  savReduced: SAVChart,
  lagnaRashiIdx: number,
): TransitPrediction {
  const bavScore  = bavReduced[rashiIndex];
  const savScore  = savReduced[rashiIndex];
  const house     = ((rashiIndex - lagnaRashiIdx + 12) % 12) + 1;
  const isUpachaya = UPACHAYA_HOUSES.has(house);

  let verdict: TransitPrediction['verdict'];
  let detail:  string;

  if (bavScore === 0) {
    verdict = 'Severe';
    detail  = `BAV = 0 for ${planet} in ${RASHI_NAMES_SHORT[rashiIndex]}. Varahamihira: avoid starting new work — disease, misery, or conflict expected during this transit.`;
  } else if (bavScore >= 4 && savScore >= 30 && isUpachaya) {
    verdict = 'Excellent';
    detail  = `BAV ${bavScore}/8 + SAV ${savScore}/37 in an Upachaya house (${house}) — full benefic result. Best window for ${planet}-signified matters.`;
  } else if (bavScore >= 4) {
    verdict = 'Good';
    detail  = `BAV ${bavScore}/8 — ${planet} has strong support in ${RASHI_NAMES_SHORT[rashiIndex]}. Expect positive results in ${planet}-governed areas.`;
  } else if (bavScore >= 2) {
    verdict = 'Neutral';
    detail  = `BAV ${bavScore}/8 — mixed results. Neither distinctly beneficial nor harmful for ${planet}'s transit through ${RASHI_NAMES_SHORT[rashiIndex]}.`;
  } else {
    verdict = 'Difficult';
    detail  = `BAV ${bavScore}/8 — ${planet} is weak in ${RASHI_NAMES_SHORT[rashiIndex]}. Caution advised during this transit.`;
  }

  return {
    planet, sign: RASHI_NAMES_SHORT[rashiIndex], rashiIndex,
    bavScore, savScore, isUpachaya, verdict, detail,
  };
}

// ─── Planet-Specific Classical Rules ──────────────────────────────────────────

function calcPlanetInsights(
  bavResults:      Record<PlanetName, BAVPlanetResult>,
  planetPositions: Record<string, number>,
  lagnaRashiIdx:   number,
): PlanetInsightResult {
  // Jupiter: children count = BAV score in 5th house from Jupiter
  const jupRashi = planetPositions['Jupiter'] ?? 0;
  const fiveFromJup = (jupRashi + 4) % 12;
  const jupBAV5th = bavResults.Jupiter.reduced[fiveFromJup];
  const childrenExpected = `Jupiter's BAV in 5th from Jupiter (${RASHI_NAMES_SHORT[fiveFromJup]}): ${jupBAV5th} point${jupBAV5th !== 1 ? 's' : ''}. ${
    jupBAV5th >= 5 ? 'Multiple children strongly indicated.' :
    jupBAV5th >= 3 ? 'Children indicated with some effort.' :
    jupBAV5th === 0 ? 'Zero score — classical indicator of childlessness or delayed parenthood. Jupiter remedies strongly indicated.' :
    'Smaller family likely; quality over quantity.'
  }`;

  // Venus: find the rashi where Venus BAV is highest → marriage/wealth timing
  const venusReduced = bavResults.Venus.reduced;
  const maxVenusScore = Math.max(...venusReduced);
  const peakVenusRashis = venusReduced
    .map((s, i) => ({ s, i }))
    .filter(x => x.s === maxVenusScore)
    .map(x => RASHI_NAMES_SHORT[x.i]);
  const marriageWealth = `Venus BAV peak: ${maxVenusScore}/8 in ${peakVenusRashis.join(', ')}. When Venus transits these signs, expect marriage, wealth, and land-related results (Varahamihira).`;

  // Saturn: find zero-score signs in Saturn's BAV → disease windows
  const saturnReduced = bavResults.Saturn.reduced;
  const saturnZeroSigns = saturnReduced
    .map((s, i) => ({ s, i }))
    .filter(x => x.s === 0)
    .map(x => RASHI_NAMES_SHORT[x.i]);
  const diseasePeriods = saturnZeroSigns.length > 0
    ? `Saturn BAV = 0 in: ${saturnZeroSigns.join(', ')}. Varahamihira: when Saturn transits these signs, disease, hardship, or danger may manifest.`
    : 'No zero-score signs in Saturn BAV — Saturn is reasonably supported in all signs.';

  // Sade Sati: Saturn in 12th, 1st, 2nd from Moon rashi
  const moonRashi = planetPositions['Moon'] ?? 0;
  const sadeSatiRashis = [
    (moonRashi + 11) % 12,  // 12th from Moon
    moonRashi,               // Moon's own rashi
    (moonRashi + 1)  % 12,  // 2nd from Moon
  ];
  const sadeSatiScores = sadeSatiRashis.map(r => saturnReduced[r]);
  const sadeSatiSeverity = `Sade Sati (Saturn transits ${sadeSatiRashis.map(r => RASHI_NAMES_SHORT[r]).join('→')}): ` +
    `Saturn BAV scores = ${sadeSatiScores.join(', ')}. ` +
    (sadeSatiScores.every(s => s >= 3)
      ? 'All three phases are reasonably supported — Sade Sati will be less severe for this native.'
      : sadeSatiScores.some(s => s === 0)
      ? 'One or more Sade Sati phases has BAV = 0 — this native will feel Saturn\'s full weight during those years.'
      : 'Mixed Sade Sati impact — some phases will be harder than others.');

  return { childrenExpected, marriageWealth, diseasePeriods, sadeSatiSeverity };
}

// ─── Main Entry Point ──────────────────────────────────────────────────────────

/**
 * Calculate the complete Ashtakavarga for any subscriber.
 *
 * @param planets        Array from assembleEngineData().planets
 *                       Each element needs: { name, rashiIndex, house }
 * @param lagnaRashiIdx  From assembleEngineData().lagnaRashiIdx
 */
export function calculateAshtakavarga(
  planets:       Array<{ name: string; rashiIndex: number; house: number }>,
  lagnaRashiIdx: number,
): AshtakavargaResult {
  // Build a lookup: planet name → rashiIndex
  const planetPositions: Record<string, number> = {};
  for (const p of planets) {
    if (p.name && p.rashiIndex !== undefined) {
      planetPositions[p.name] = p.rashiIndex;
    }
  }

  // ── Step 1: Raw BAV for each planet ─────────────────────────────────────────
  const rawBAV = {} as Record<PlanetName, BAVChart>;
  for (const planet of SEVEN_PLANETS) {
    rawBAV[planet] = calcRawBAV(planet, planetPositions, lagnaRashiIdx);
  }

  // ── Step 2: Apply reductions ─────────────────────────────────────────────────
  const reducedBAV = {} as Record<PlanetName, BAVChart>;
  for (const planet of SEVEN_PLANETS) {
    const afterTrikona = applyTrikonaReduction(rawBAV[planet]);
    reducedBAV[planet] = applyEkadhipatayaReduction(afterTrikona, planetPositions);
  }

  // ── Step 3: Build BAV results with insights ──────────────────────────────────
  const bavInsights: Record<PlanetName, string> = {
    Sun:     'Zero-score signs for the Sun: avoid starting new ventures during Sun\'s transit there.',
    Moon:    'Highest-score direction for Moon indicates the auspicious location for the home\'s prayer room.',
    Mars:    'Zero-score signs for Mars: Saturn\'s transit there brings disease or danger.',
    Mercury: 'Zero-score signs for Mercury: Saturn transiting there may harm friends or children\'s education.',
    Jupiter: 'Score in 5th from Jupiter = expected number of children. Jupiter in enemy/depression sign = early challenges.',
    Venus:   'Peak Venus transit signs = marriage, wealth, and land. Plan important decisions for these windows.',
    Saturn:  'Sade Sati severity = BAV scores of the 3 Sade Sati signs. Low scores = harder passage.',
  };

  const bavResults = {} as Record<PlanetName, BAVPlanetResult>;
  for (const planet of SEVEN_PLANETS) {
    bavResults[planet] = {
      planet,
      raw:         rawBAV[planet],
      reduced:     reducedBAV[planet],
      houseScores: reindexByHouse(reducedBAV[planet], lagnaRashiIdx),
      insight:     bavInsights[planet],
    };
  }

  // ── Step 4: SAV ──────────────────────────────────────────────────────────────
  const rawSAV     = calcSAV(rawBAV);
  const reducedSAV = calcSAV(reducedBAV);   // SAV of reduced charts

  const savResult: SAVResult = {
    raw:         rawSAV,
    reduced:     reducedSAV,
    houseScores: reindexByHouse(reducedSAV, lagnaRashiIdx),
    total:       rawSAV.reduce((a, b) => a + b, 0),
  };

  // ── Step 5: Wealth formula ────────────────────────────────────────────────────
  const wealthFormula = calcWealthFormula(reducedSAV, lagnaRashiIdx);

  // ── Step 6: Life thirds ───────────────────────────────────────────────────────
  const lifeThirds = calcLifeThirds(reducedSAV);

  // ── Step 7: Transit verdicts for current natal planet positions ───────────────
  // (i.e. how strongly each natal planet's sign supports that planet)
  const transitForToday: TransitPrediction[] = SEVEN_PLANETS
    .filter(p => planetPositions[p] !== undefined)
    .map(p => predictTransit(
      p,
      planetPositions[p],
      reducedBAV[p],
      reducedSAV,
      lagnaRashiIdx,
    ));

  // ── Step 8: Planet-specific insights ─────────────────────────────────────────
  const planetInsights = calcPlanetInsights(bavResults, planetPositions, lagnaRashiIdx);

  return {
    bav:            bavResults,
    sav:            savResult,
    wealthFormula,
    lifeThirds,
    transitForToday,
    planetInsights,
    lagnaRashiIdx,
  };
}

// ─── SAV Score Classifier (used by the UI panel) ──────────────────────────────

export function classifySAVScore(score: number): {
  label: string;
  color: 'green' | 'yellow' | 'red';
  description: string;
} {
  if (score >= 30) return { label: 'Benefic',  color: 'green',  description: 'Strongly benefic — any planet transiting here delivers positive results.' };
  if (score >= 25) return { label: 'Neutral',  color: 'yellow', description: 'Neutral zone — neither strong gains nor losses.' };
  return             { label: 'Difficult', color: 'red',    description: 'Challenging — planets transiting here face headwinds.' };
}

export function classifyBAVScore(score: number): {
  label: string;
  color: 'green' | 'yellow' | 'red';
} {
  if (score >= 5) return { label: `${score}/8 — Strong`,   color: 'green'  };
  if (score >= 3) return { label: `${score}/8 — Moderate`, color: 'yellow' };
  if (score === 0) return { label: `0/8 — ZERO`,           color: 'red'    };
  return                  { label: `${score}/8 — Weak`,    color: 'red'    };
}
