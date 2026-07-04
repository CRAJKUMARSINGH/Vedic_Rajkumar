/**
 * Shadbala — Six-fold Planetary Strength System
 * The most comprehensive strength measurement in Vedic astrology
 *
 * Six components:
 * 1. Sthana Bala   — Positional strength
 * 2. Dig Bala      — Directional strength
 * 3. Kala Bala     — Temporal strength
 * 4. Chesta Bala   — Motional strength (retrograde/direct)
 * 5. Naisargika Bala — Natural strength (fixed hierarchy)
 * 6. Drik Bala     — Aspectual strength
 *
 * Reference: BPHS Chapter 27
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShadabalaResult {
  planet: string;
  /** All six bala components in Rupas (1 Rupa = 60 Shashtiamsas) */
  sthanaBala: number;
  digBala: number;
  kalaBala: number;
  chestaBala: number;
  naisargikaBala: number;
  drikBala: number;
  /** Total Shadbala in Rupas */
  totalRupas: number;
  /** Required minimum Rupas for the planet */
  requiredRupas: number;
  /** Shadbala ratio (total / required) — >1 means strong */
  shadabalaRatio: number;
  isStrong: boolean;
  strength: 'very-strong' | 'strong' | 'average' | 'weak' | 'very-weak';
  label: { en: string; hi: string };
  modifiersApplied: string[];
  deliveryClass: 'full' | 'standard' | 'conditional' | 'diluted' | 'broken';
  gateScore: number;
  /** Whether this planet is Vargottama (same rashi in D1 and D9) */
  isVargottama: boolean;
  /** Whether this planet is combust (within 8-15° of Sun) */
  isCombust: boolean;
  /** Whether Neecha Bhanga is active for this planet */
  neechaBhangaActive: boolean;
  /** Modifier applied: 'vargottama' | 'combustion' | 'neecha-bhanga' | null */
  activeModifier: 'vargottama' | 'combustion' | 'neecha-bhanga' | null;
  /** Raw totalRupas BEFORE modifiers */
  baseRupas: number;
  /** totalRupas AFTER modifiers applied */
  modifiedRupas: number;
}

export interface ShadabalaAnalysis {
  planets: ShadabalaResult[];
  strongestPlanet: string;
  weakestPlanet: string;
  weakestPlanetRupas: number;
  weakestPlanetBaseRupas: number;
  summary: { en: string; hi: string };
}

export interface PlanetData {
  name: string;
  rashiIndex: number; // 0-11
  house: number; // 1-12
  degrees: number; // 0-30 within rashi
  isRetrograde: boolean;
  longitude: number; // 0-360 absolute sidereal longitude
  isVargottama?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Required Rupas for each planet (BPHS standard)
const REQUIRED_RUPAS: Record<string, number> = {
  Sun: 6.5,
  Moon: 6.0,
  Mars: 5.0,
  Mercury: 7.0,
  Jupiter: 6.5,
  Venus: 5.5,
  Saturn: 5.0,
};

// Natural strength hierarchy (Naisargika Bala) in Rupas
const NAISARGIKA_BALA: Record<string, number> = {
  Sun: 1.0,
  Moon: 0.857,
  Venus: 0.714,
  Jupiter: 0.571,
  Mercury: 0.429,
  Mars: 0.286,
  Saturn: 0.143,
};

// Exaltation degrees (absolute longitude)
const EXALTATION_DEGREE: Record<string, number> = {
  Sun: 10, // Aries 10°
  Moon: 33, // Taurus 3°
  Mars: 298, // Capricorn 28°
  Mercury: 165, // Virgo 15°
  Jupiter: 95, // Cancer 5°
  Venus: 357, // Pisces 27°
  Saturn: 200, // Libra 20°
};

// Debilitation degrees (opposite of exaltation)
const DEBILITATION_DEGREE: Record<string, number> = {
  Sun: 190,
  Moon: 213,
  Mars: 118,
  Mercury: 345,
  Jupiter: 275,
  Venus: 177,
  Saturn: 20,
};

// Own signs (rashiIndex)
const OWN_SIGNS: Record<string, number[]> = {
  Sun: [4],
  Moon: [3],
  Mars: [0, 7],
  Mercury: [2, 5],
  Jupiter: [8, 11],
  Venus: [1, 6],
  Saturn: [9, 10],
};

// Moolatrikona signs
const MOOLATRIKONA: Record<string, number> = {
  Sun: 4,
  Moon: 1,
  Mars: 0,
  Mercury: 5,
  Jupiter: 8,
  Venus: 6,
  Saturn: 10,
};

// Directional strength houses (Dig Bala)
const DIG_BALA_HOUSE: Record<string, number> = {
  Sun: 10,
  Moon: 4,
  Mars: 10,
  Mercury: 1,
  Jupiter: 1,
  Venus: 4,
  Saturn: 7,
};

// ─── Sthana Bala (Positional Strength) ───────────────────────────────────────

function calculateSthanaBala(planet: PlanetData): number {
  let bala = 0;

  // Uchcha Bala (exaltation strength)
  const exaltDeg = EXALTATION_DEGREE[planet.name];
  const debilDeg = DEBILITATION_DEGREE[planet.name];
  if (exaltDeg !== undefined) {
    const distFromExalt = Math.abs(planet.longitude - exaltDeg);
    const normalizedDist = Math.min(distFromExalt, 360 - distFromExalt);
    // Max 1 Rupa at exact exaltation, 0 at debilitation
    const ucchaBala = (180 - normalizedDist) / 180;
    bala += Math.max(0, ucchaBala);
  }

  // Saptavargaja Bala (dignity in 7 divisional charts — simplified)
  const rashiIdx = planet.rashiIndex;
  if (OWN_SIGNS[planet.name]?.includes(rashiIdx)) {
    bala += 0.5; // Own sign
  }
  if (MOOLATRIKONA[planet.name] === rashiIdx) {
    bala += 0.75; // Moolatrikona
  }

  // Ojayugmarasyamsa Bala (odd/even rashi)
  const isOddRashi = rashiIdx % 2 === 0; // 0,2,4... are odd rashis (Aries=1st)
  const prefersOdd = ['Sun', 'Mars', 'Jupiter'].includes(planet.name);
  const prefersEven = ['Moon', 'Venus', 'Saturn'].includes(planet.name);
  if ((prefersOdd && isOddRashi) || (prefersEven && !isOddRashi)) {
    bala += 0.25;
  }

  // Kendra Bala (angular house strength)
  if ([1, 4, 7, 10].includes(planet.house)) bala += 0.6;
  else if ([2, 5, 8, 11].includes(planet.house)) bala += 0.3;
  else bala += 0.15;

  return Math.min(bala, 3.0); // Cap at 3 Rupas
}

// ─── Dig Bala (Directional Strength) ─────────────────────────────────────────

function calculateDigBala(planet: PlanetData): number {
  const bestHouse = DIG_BALA_HOUSE[planet.name] || 1;
  const worstHouse = ((bestHouse + 5) % 12) + 1; // Opposite house

  // Distance from best house (in houses)
  const distFromBest = Math.abs(planet.house - bestHouse);
  const normalizedDist = Math.min(distFromBest, 12 - distFromBest);

  // Max 1 Rupa at best house, 0 at worst
  return Math.max(0, (6 - normalizedDist) / 6);
}

// ─── Kala Bala (Temporal Strength) ───────────────────────────────────────────

function calculateKalaBala(
  planet: PlanetData,
  isDaytime: boolean,
  birthMonth: number,
  sunLon?: number,
  moonLon?: number
): number {
  let bala = 0;

  // Nathonnatha Bala (day/night strength)
  const dayPlanets = ['Sun', 'Jupiter', 'Saturn'];
  const nightPlanets = ['Moon', 'Venus', 'Mars'];
  if (isDaytime && dayPlanets.includes(planet.name)) bala += 0.6;
  else if (!isDaytime && nightPlanets.includes(planet.name)) bala += 0.6;
  else if (planet.name === 'Mercury') bala += 0.6; // Mercury always strong

  // Paksha Bala (lunar phase — exact approximation if longitudes provided)
  let isShukla = birthMonth % 2 === 0;
  if (sunLon !== undefined && moonLon !== undefined) {
    let phase = moonLon - sunLon;
    if (phase < 0) phase += 360;
    isShukla = phase <= 180;
  }
  const benefics = ['Moon', 'Mercury', 'Jupiter', 'Venus'];
  const malefics = ['Sun', 'Mars', 'Saturn'];

  if (isShukla && benefics.includes(planet.name)) bala += 0.5;
  else if (!isShukla && malefics.includes(planet.name)) bala += 0.5;

  // Tribhaga Bala (day divided into 3 parts)
  // Simplified: Jupiter strong in first part, Sun in second, Saturn in third
  bala += 0.3; // Base temporal strength

  return Math.min(bala, 2.0);
}

// ─── Chesta Bala (Motional Strength) ─────────────────────────────────────────

function calculateChestaBala(planet: PlanetData): number {
  // Retrograde planets get full Chesta Bala (they appear to "strive")
  if (planet.isRetrograde) return 1.0;

  // Sun and Moon don't retrograde — use speed-based approximation
  if (planet.name === 'Sun' || planet.name === 'Moon') return 0.5;

  // Direct motion: moderate strength
  return 0.5;
}

// ─── Naisargika Bala (Natural Strength) ──────────────────────────────────────

function calculateNaisargikaBala(planet: PlanetData): number {
  return NAISARGIKA_BALA[planet.name] || 0.3;
}

// ─── Drik Bala (Aspectual Strength) ──────────────────────────────────────────

function calculateDrikBala(planet: PlanetData, allPlanets: PlanetData[]): number {
  let bala = 0;
  const benefics = ['Moon', 'Mercury', 'Jupiter', 'Venus'];
  const malefics = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];

  for (const other of allPlanets) {
    if (other.name === planet.name) continue;

    const houseDiff = Math.abs(other.house - planet.house);
    const normalizedDiff = Math.min(houseDiff, 12 - houseDiff);

    // Check aspects (7th house = full aspect for all planets)
    let aspectStrength = 0;
    if (normalizedDiff === 6)
      aspectStrength = 1.0; // 7th house (full)
    else if (normalizedDiff === 4 || normalizedDiff === 8) {
      // 5th/9th aspects (Jupiter)
      if (other.name === 'Jupiter') aspectStrength = 0.75;
    } else if (normalizedDiff === 3 || normalizedDiff === 9) {
      // 4th/10th aspects (Mars, Saturn)
      if (['Mars', 'Saturn'].includes(other.name)) aspectStrength = 0.75;
    }

    if (aspectStrength > 0) {
      if (benefics.includes(other.name)) bala += aspectStrength * 0.5;
      else if (malefics.includes(other.name)) bala -= aspectStrength * 0.25;
    }
  }

  return Math.max(0, Math.min(bala, 1.5));
}

// ─── Main Function ────────────────────────────────────────────────────────────

function categorizeStrength(rupas: number): ShadabalaResult['strength'] {
  if (rupas >= 2.0) return 'very-strong';
  if (rupas >= 1.25) return 'strong';
  if (rupas >= 0.75) return 'average';
  if (rupas >= 0.4) return 'weak';
  return 'very-weak';
}

export function calculateShadbala(
  planets: PlanetData[],
  isDaytime = true,
  birthMonth = 1
): ShadabalaAnalysis {
  const mainPlanets = planets.filter(p => REQUIRED_RUPAS[p.name]);
  const sunNode = planets.find(p => p.name === 'Sun');
  const moonNode = planets.find(p => p.name === 'Moon');

  const results: ShadabalaResult[] = mainPlanets.map(planet => {
    let sthanaBala = calculateSthanaBala(planet);
    const digBala = calculateDigBala(planet);
    const kalaBala = calculateKalaBala(
      planet,
      isDaytime,
      birthMonth,
      sunNode?.longitude,
      moonNode?.longitude
    );
    const chestaBala = calculateChestaBala(planet);
    const naisargikaBala = calculateNaisargikaBala(planet);
    const drikBala = calculateDrikBala(planet, planets);

    const modifiersApplied: string[] = [];
    const baseRupas = sthanaBala + digBala + kalaBala + chestaBala + naisargikaBala + drikBala;
    let totalRupas = baseRupas;

    const isVargottama = !!planet.isVargottama;
    let isCombust = false;
    let neechaBhangaActive = false;
    let activeModifier: 'vargottama' | 'combustion' | 'neecha-bhanga' | null = null;

    // Modifier: Vargottama
    if (isVargottama) {
      sthanaBala += 0.5;
      totalRupas += 0.5;
      modifiersApplied.push('Vargottama (+0.5 Sthana Bala)');
      activeModifier = 'vargottama';
    }

    // Modifier: Neecha Bhanga (Cancellation of Debilitation)
    const debilDeg = DEBILITATION_DEGREE[planet.name];
    if (debilDeg !== undefined) {
      const distFromDebil = Math.abs(planet.longitude - debilDeg);
      const normalizedDist = Math.min(distFromDebil, 360 - distFromDebil);
      if (normalizedDist < 15) {
        // In debilitation zone
        // Simple approximation: if strong benefic aspects or dispositor is strong
        const dispositor = planets.find(p => OWN_SIGNS[p.name]?.includes(planet.rashiIndex));
        if (dispositor && [1, 4, 7, 10].includes(dispositor.house)) {
          sthanaBala += 0.75;
          totalRupas += 0.75;
          modifiersApplied.push('Neecha-Bhanga (Debilitation Cancelled)');
          neechaBhangaActive = true;
          if (!activeModifier) activeModifier = 'neecha-bhanga';
        }
      }
    }

    // Modifier: Combustion
    if (planet.name !== 'Sun' && planet.name !== 'Rahu' && planet.name !== 'Ketu' && sunNode) {
      let distFromSun = Math.abs(planet.longitude - sunNode.longitude);
      distFromSun = Math.min(distFromSun, 360 - distFromSun);
      if (distFromSun < 8) {
        isCombust = true;
        totalRupas *= 0.6; // 40% reduction
        modifiersApplied.push('Combust (-40% Strength)');
        if (!activeModifier) activeModifier = 'combustion';
      }
    }

    // Modifier: Planetary War (Graha Yuddha)
    const warCandidates = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    if (warCandidates.includes(planet.name)) {
      for (const other of planets) {
        if (other.name !== planet.name && warCandidates.includes(other.name)) {
          let dist = Math.abs(planet.longitude - other.longitude);
          dist = Math.min(dist, 360 - dist);
          if (dist < 1) {
            // Within 1 degree
            // Simplified rule: winner is the one with lower longitude within the sign (advanced)
            if (planet.degrees < other.degrees) {
              totalRupas *= 1.2;
              modifiersApplied.push(`Graha Yuddha Winner (vs ${other.name})`);
            } else {
              totalRupas *= 0.5;
              modifiersApplied.push(`Graha Yuddha Loser (vs ${other.name})`);
            }
          }
        }
      }
    }

    const requiredRupas = REQUIRED_RUPAS[planet.name];
    const shadabalaRatio = totalRupas / requiredRupas;
    const gateScore = Math.min(100, Math.round(shadabalaRatio * 100));

    let strength: ShadabalaResult['strength'] = categorizeStrength(totalRupas);
    let label: { en: string; hi: string };
    let deliveryClass: ShadabalaResult['deliveryClass'] = 'standard';

    if (shadabalaRatio >= 1.5) {
      strength = 'very-strong';
      label = { en: 'Very Strong', hi: 'अत्यंत बलवान' };
      deliveryClass = 'full';
    } else if (shadabalaRatio >= 1.0) {
      strength = 'strong';
      label = { en: 'Strong', hi: 'बलवान' };
      deliveryClass = 'standard';
    } else if (shadabalaRatio >= 0.75) {
      strength = 'average';
      label = { en: 'Average', hi: 'सामान्य' };
      deliveryClass = 'conditional';
    } else if (shadabalaRatio >= 0.5) {
      strength = 'weak';
      label = { en: 'Weak', hi: 'कमजोर' };
      deliveryClass = 'diluted';
    } else {
      strength = 'very-weak';
      label = { en: 'Very Weak', hi: 'अत्यंत कमजोर' };
      deliveryClass = 'broken';
    }

    if (modifiersApplied.some(m => m.includes('Combust') || m.includes('Loser'))) {
      deliveryClass = 'diluted';
    }

    return {
      planet: planet.name,
      sthanaBala,
      digBala,
      kalaBala,
      chestaBala,
      naisargikaBala,
      drikBala,
      totalRupas,
      requiredRupas,
      shadabalaRatio,
      isStrong: shadabalaRatio >= 1.0,
      strength,
      label,
      modifiersApplied,
      deliveryClass,
      gateScore,
      isVargottama,
      isCombust,
      neechaBhangaActive,
      activeModifier,
      baseRupas,
      modifiedRupas: totalRupas,
    };
  });

  const sorted = [...results].sort((a, b) => b.shadabalaRatio - a.shadabalaRatio);
  const strongestPlanet = sorted[0]?.planet || 'Sun';
  const weakestPlanetObj = sorted[sorted.length - 1];
  const weakestPlanet = weakestPlanetObj?.planet || 'Saturn';
  const weakestPlanetRupas = weakestPlanetObj?.totalRupas || 0;
  const weakestPlanetBaseRupas = weakestPlanetObj?.baseRupas || 0;

  const strongCount = results.filter(r => r.isStrong).length;
  const summary = {
    en: `${strongCount}/${results.length} planets meet required Shadbala. Strongest: ${strongestPlanet}. Weakest: ${weakestPlanet}.`,
    hi: `${strongCount}/${results.length} ग्रह आवश्यक षड्बल पूरा करते हैं। सबसे बलवान: ${strongestPlanet}। सबसे कमजोर: ${weakestPlanet}।`,
  };

  return {
    planets: results,
    strongestPlanet,
    weakestPlanet,
    weakestPlanetRupas,
    weakestPlanetBaseRupas,
    summary,
  };
}

/**
 * Determines if a planet has enough Shadbala strength to give its full transit results.
 * Rule: Planet must meet its required minimum Rupas.
 */
export function canPlanetGiveTransitResults(
  planetName: string,
  shadbalaRupa: number
): { capable: boolean; percentage: number } {
  const required = REQUIRED_RUPAS[planetName] || 5.0;
  const percentage = (shadbalaRupa / required) * 100;
  return {
    capable: shadbalaRupa >= required,
    percentage: Math.round(percentage),
  };
}
