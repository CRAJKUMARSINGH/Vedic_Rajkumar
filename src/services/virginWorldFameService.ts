/**
 * virginWorldFameService.ts
 *
 * LAYER 0 — Virgin World Fame Filter
 * LAYER 13 — Virgin World Fame Probability & Timeline
 *
 * "Virgin" = self-born fame. Not derived from spouse (7th), father (9th),
 * or inherited lineage. First-of-its-kind in the native's context.
 *
 * Hooks into:
 *   shadabalaService   → totalRupas for Sun, 10th lord, Rahu
 *   jaiminiService     → PadaLagna (Arudha Lagna)
 *   divisionalCharts   → D10, D60 confirmation
 *   yogaService        → Raj Yogas, Neecha Bhanga, Viparita
 *   dashaService       → Active MD/AD lord
 */

import type { ShadabalaResult } from './shadabalaService';
import type { DashaResult } from './dashaService';
import type { YogaResult } from './yogaService';
import type { PadaLagna } from './jaiminiService';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FameTier =
  | 'HISTORIC'          // 95–100: Historic-level, highly probable
  | 'GLOBAL'            // 80–94:  Global fame, sustained legacy
  | 'NATIONAL_NICHE'    // 60–79:  National + niche global
  | 'DENIED';           // <60:    Denied or derivative/temporary

export type FameNature =
  | 'Viral'
  | 'Respected'
  | 'Disruptive'
  | 'Enduring'
  | 'Controversial'
  | 'Transformational';

export type FameLongevity = 'Transient' | 'Generational' | 'Mythic';

export interface FameScoreBreakdown {
  component1_tenth_lagna_al: number;     // max 20
  component2_rahu_position:  number;     // max 15
  component3_sun_strength:   number;     // max 15
  component4_tenth_lord:     number;     // max 15
  component5_al_position:    number;     // max 15
  component6_divisional:     number;     // max 10
  component7_virgin_check:   number;     // max 10
  total:                     number;     // max 100
}

export interface VirginWorldFameScore {
  score:        number;
  tier:         FameTier;
  breakdown:    FameScoreBreakdown;
  tierLabel:    string;
  proceed:      boolean;   // false if score < 60 → stop soft-selling
  stopVerdict?: string;    // populated when proceed = false
}

export interface VirginWorldFameVerdict {
  score:                  number;
  tier:                   FameTier;
  probabilityWithout:     number;  // % without remedy
  probabilityWith:        number;  // % with remedy
  peakWindow:             string;  // e.g. "Rahu MD / Sun AD, 2028–2030"
  dashaLevel:             1 | 2 | 3 | 4 | 5;
  levelTag:               string;  // "[Level 4: Rahu MD / Sun AD, 2028–2030]"
  nature:                 FameNature;
  longevity:              FameLongevity;
  weakestFamePlanet:      string;
  weakestFamePlanetRupas: number;
  weakestDeficiency:      string;
  fameRemedyTarget:       string;  // single most impactful behavioral intervention
  failureModes:           FameFailureMode[];
}

export interface FameFailureMode {
  pattern:  string;
  risk:     string;
  impact:   string;   // e.g. "−35% scandal risk"
}

// ─── Planet data shape expected by this service ───────────────────────────────

interface PlanetPosition {
  name:        string;
  house:       number;        // 1–12
  rashiIndex:  number;        // 0–11
  degrees:     number;
  isRetrograde?: boolean;
}

interface AspectData {
  fromPlanet: string;
  toHouse:    number;
}

interface DivisionalConfirmation {
  d10_tenthLordStrong:  boolean;
  d10_rahuSunInfluence: boolean;
  d60_fameplanetsStrong: boolean;
}

// ─── LAYER 0: SCORING ENGINE ──────────────────────────────────────────────────

const RASHI_NAMES = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

function getRashiIndex(planet: PlanetPosition): number {
  return planet.rashiIndex;
}

function isPlanetExalted(name: string, rashiIndex: number): boolean {
  const EXALT: Record<string, number> = {
    Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6,
  };
  return EXALT[name] === rashiIndex;
}

function isPlanetOwnSign(name: string, rashiIndex: number): boolean {
  const OWN: Record<string, number[]> = {
    Sun: [4], Moon: [3], Mars: [0,7], Mercury: [2,5],
    Jupiter: [8,11], Venus: [1,6], Saturn: [9,10],
  };
  return (OWN[name] || []).includes(rashiIndex);
}

/**
 * LAYER 0 — Score the chart for Virgin World Fame Potential (0–100).
 *
 * @param planets        All 9 planetary positions (D1)
 * @param lagnaRashiIdx  Lagna (Ascendant) rashi index 0–11
 * @param padaLagna      Arudha Lagna from jaiminiService
 * @param shadabala      All planet Shadbala scores
 * @param tenthLordName  Name of the 10th house lord
 * @param aspects        Planetary aspects list
 * @param divisional     D10/D60 confirmation flags
 * @param rajYogas       Present Raj Yogas from yogaService
 */
export function scoreVirginWorldFame(
  planets:        PlanetPosition[],
  lagnaRashiIdx:  number,
  padaLagna:      PadaLagna | null,
  shadabala:      ShadabalaResult[],
  tenthLordName:  string,
  aspects:        AspectData[],
  divisional:     DivisionalConfirmation,
  rajYogas:       YogaResult[]
): VirginWorldFameScore {

  const getShadabala = (name: string) =>
    shadabala.find(s => s.planet === name)?.totalRupas ?? 0;

  const getPlanet = (name: string) =>
    planets.find(p => p.name === name);

  const aspectsHouse = (fromPlanet: string, house: number) =>
    aspects.some(a => a.fromPlanet === fromPlanet && a.toHouse === house);

  // ── Component 1: 10th house / Lagna lord / Arudha Lagna (max 20) ─────────
  let c1 = 0;
  const sun = getPlanet('Sun');
  const rahu = getPlanet('Rahu');
  const tenthLord = getPlanet(tenthLordName);
  const alRashiIdx = padaLagna?.rashiIndex ?? -1;

  // Strong 10th house presence
  const planetsInTenth = planets.filter(p => p.house === 10);
  if (planetsInTenth.some(p => ['Sun','Rahu','Jupiter'].includes(p.name))) c1 += 8;
  else if (planetsInTenth.length > 0) c1 += 4;

  // Lagna lord strength (use Sun as natural soul significator + 10th lord)
  const tenthLordRupas = getShadabala(tenthLordName);
  if (tenthLordRupas >= 1.5) c1 += 7;
  else if (tenthLordRupas >= 1.0) c1 += 4;
  else if (tenthLordRupas >= 0.75) c1 += 2;

  // AL position strong (in 10th/11th from lagna or same as lagna = wide recognition)
  if (alRashiIdx >= 0) {
    const alPos = ((alRashiIdx - lagnaRashiIdx + 12) % 12) + 1; // 1-12
    if ([10, 11].includes(alPos)) c1 += 5;
    else if ([9, 1].includes(alPos)) c1 += 2;
  }

  c1 = Math.min(20, c1);

  // ── Component 2: Rahu position (max 15) ───────────────────────────────────
  let c2 = 0;
  if (rahu) {
    const famousRahuHouses = [10, 11, 5, 9];
    if (famousRahuHouses.includes(rahu.house)) {
      c2 += 10;
      // Bonus if Rahu also aspects AL or 10th
      if (aspectsHouse('Rahu', 10) || aspectsHouse('Rahu', alRashiIdx)) c2 += 3;
    } else if ([1, 4, 7].includes(rahu.house)) {
      c2 += 5; // kendra — some viral quality
    }
    // Rahu in kendra from AL
    if (alRashiIdx >= 0) {
      const rahuFromAL = ((rahu.rashiIndex - alRashiIdx + 12) % 12) + 1;
      if ([1,4,7,10].includes(rahuFromAL)) c2 += 2;
    }
  }
  c2 = Math.min(15, c2);

  // ── Component 3: Sun strength (max 15) ────────────────────────────────────
  let c3 = 0;
  if (sun) {
    const sunRupas = getShadabala('Sun');
    if (isPlanetExalted('Sun', sun.rashiIndex)) c3 += 8;
    else if (isPlanetOwnSign('Sun', sun.rashiIndex)) c3 += 6;
    else if (sun.house === 10) c3 += 5; // digbala
    if (sunRupas >= 1.5) c3 += 5;
    else if (sunRupas >= 1.0) c3 += 3;
    else if (sunRupas >= 0.75) c3 += 1;
    // Neecha Bhanga with Jupiter support
    const neechaBhangaYoga = rajYogas.find(y =>
      y.name.toLowerCase().includes('neecha bhanga') && y.planets.includes('Sun')
    );
    if (neechaBhangaYoga?.isPresent) c3 += 3;
  }
  c3 = Math.min(15, c3);

  // ── Component 4: 10th lord quality (max 15) ───────────────────────────────
  let c4 = 0;
  if (tenthLord) {
    // Vargottama check (same rashi in D1 and D9 — approximated by degree check)
    const isVargottama = tenthLord.degrees < 3.33 || tenthLord.degrees > 26.67;
    if (isVargottama) c4 += 5;

    if (tenthLordRupas >= 1.5) c4 += 8;
    else if (tenthLordRupas >= 1.25) c4 += 6;
    else if (tenthLordRupas >= 1.0) c4 += 3;

    // Forms Raj Yoga with benefics + Rahu
    const hasFameYoga = rajYogas.some(y =>
      y.isPresent &&
      y.planets.includes(tenthLordName) &&
      y.planets.some(p => ['Jupiter','Venus','Rahu'].includes(p))
    );
    if (hasFameYoga) c4 += 2;
  }
  c4 = Math.min(15, c4);

  // ── Component 5: AL position and aspects (max 15) ─────────────────────────
  let c5 = 0;
  if (alRashiIdx >= 0 && padaLagna) {
    const alFromLagna = ((alRashiIdx - lagnaRashiIdx + 12) % 12) + 1;
    if ([10, 11].includes(alFromLagna)) c5 += 10;
    else if ([9, 5].includes(alFromLagna)) c5 += 5;
    else if (alFromLagna === 1) c5 += 3; // authentic but not fame-amplified

    // Jupiter or Rahu aspect to AL
    const jupiterAspectsAL = aspectsHouse('Jupiter', alRashiIdx + 1);
    const rahuAspectsAL    = aspectsHouse('Rahu', alRashiIdx + 1);
    if (jupiterAspectsAL) c5 += 3;
    if (rahuAspectsAL)    c5 += 2;
  }
  c5 = Math.min(15, c5);

  // ── Component 6: Divisional confirmation (max 10) ─────────────────────────
  let c6 = 0;
  if (divisional.d10_tenthLordStrong)    c6 += 4;
  if (divisional.d10_rahuSunInfluence)   c6 += 3;
  if (divisional.d60_fameplanetsStrong)  c6 += 3;
  c6 = Math.min(10, c6);

  // ── Component 7: Virgin check — self-born fame (max 10) ───────────────────
  let c7 = 10; // Start full, deduct for parasitic sources

  // Heavy reliance on 7th lord (spouse) for fame?
  const seventhLordPlanets = planets.filter(p => p.house === 7);
  if (seventhLordPlanets.length >= 2 && c1 < 10) c7 -= 4;

  // Heavy 9th lord reliance (father/lineage) without own 10th strength?
  const ninthHouse = planets.filter(p => p.house === 9);
  if (ninthHouse.length >= 2 && c4 < 8) c7 -= 3;

  // Viparita Raj Yoga present = self-born from adversity (positive)
  const viparitaYoga = rajYogas.find(y =>
    y.isPresent && y.name.toLowerCase().includes('viparita')
  );
  if (viparitaYoga) c7 = Math.min(10, c7 + 2);

  c7 = Math.max(0, Math.min(10, c7));

  // ── Total ─────────────────────────────────────────────────────────────────
  const total = c1 + c2 + c3 + c4 + c5 + c6 + c7;

  const tier: FameTier =
    total >= 95 ? 'HISTORIC' :
    total >= 80 ? 'GLOBAL' :
    total >= 60 ? 'NATIONAL_NICHE' :
    'DENIED';

  const tierLabel: Record<FameTier, string> = {
    HISTORIC:       'Historic-level Virgin World Fame — highly probable',
    GLOBAL:         'Global fame with sustained legacy — possible',
    NATIONAL_NICHE: 'National + niche global recognition',
    DENIED:         'Fame denied or derivative/temporary',
  };

  const proceed = total >= 60;

  return {
    score: total,
    tier,
    breakdown: {
      component1_tenth_lagna_al: c1,
      component2_rahu_position:  c2,
      component3_sun_strength:   c3,
      component4_tenth_lord:     c4,
      component5_al_position:    c5,
      component6_divisional:     c6,
      component7_virgin_check:   c7,
      total,
    },
    tierLabel: tierLabel[tier],
    proceed,
    stopVerdict: !proceed
      ? `The chart scores ${total}/100 on the Virgin World Fame scale. The chart does not structurally support virgin world fame. Fame may be temporary, regional, or derivative of another person's success. Therefore: Focus your interpretation on the domains the chart actually promises.`
      : undefined,
  };
}

// ─── LAYER 13: FAME VERDICT ───────────────────────────────────────────────────

/**
 * Calculate base probability adjustments from Shadbala and chart conditions.
 */
function calculateFameProbability(
  fameScore:        number,
  sunRupas:         number,
  tenthLordRupas:   number,
  rahuRupas:        number,
  tenthLordVargott: boolean,
  alIn10or11:       boolean,
  jupiterAspectsAL: boolean,
  saturnAspectsAL:  boolean,
  d60Strong:        boolean,
  neechaBhangaRaj:  boolean
): { withoutRemedy: number; withRemedy: number } {
  // Base from fame score (0–60 points → 0–60%)
  let base = Math.round(fameScore * 0.6);

  // Adjustments
  if (sunRupas >= 1.5 && rahuRupas >= 1.5) base += 15;
  else if (sunRupas >= 1.5 || rahuRupas >= 1.5) base += 7;

  if (tenthLordVargott)  base += 8;
  if (alIn10or11 && jupiterAspectsAL) base += 6;
  if (!d60Strong)        base -= 10;
  if (sunRupas < 0.75)   base -= 12; // fame without fulfillment
  if (rahuRupas > 1.8 && sunRupas < 0.75) base -= 14; // scandal risk
  if (saturnAspectsAL && !jupiterAspectsAL) base -= 8; // delays but certifies
  if (neechaBhangaRaj)   base += 12; // greatest reversals produce greatest icons

  const withoutRemedy = Math.max(5, Math.min(92, base));
  const withRemedy    = Math.max(withoutRemedy + 5, Math.min(95, withoutRemedy + 18));

  return { withoutRemedy, withRemedy };
}

/**
 * Determine fame nature from chart signature.
 */
function determineFameNature(
  planets: PlanetPosition[],
  sunRupas: number,
  rahuRupas: number,
  hasViparita: boolean
): FameNature {
  const rahu = planets.find(p => p.name === 'Rahu');
  const rahuIn10or11 = rahu && [10, 11].includes(rahu.house);

  if (hasViparita && rahuRupas > 1.2)   return 'Transformational';
  if (rahuIn10or11 && sunRupas < 0.9)   return 'Controversial';
  if (rahuIn10or11 && sunRupas >= 1.25) return 'Viral';
  if (sunRupas >= 1.5)                  return 'Respected';
  if (rahuRupas > 1.5)                  return 'Disruptive';
  return 'Enduring';
}

/**
 * Determine fame longevity.
 */
function determineLongevity(
  fameScore: number,
  sunRupas: number,
  saturnAspectsAL: boolean
): FameLongevity {
  if (fameScore >= 90 && sunRupas >= 1.25 && saturnAspectsAL) return 'Mythic';
  if (fameScore >= 75 && (sunRupas >= 1.0 || saturnAspectsAL)) return 'Generational';
  return 'Transient';
}

/**
 * Determine the peak Dasha window for fame.
 */
function determinePeakWindow(
  dasha:        DashaResult,
  fameScore:    number,
  sunRupas:     number,
  tenthLordName: string
): { window: string; level: 1|2|3|4|5; tag: string } {
  const md = dasha.currentMahadasha;
  const ad = dasha.currentAntardasha;

  const fameMDs = ['Rahu', 'Sun', tenthLordName, 'Jupiter'];
  const fameADs = ['Sun', 'Rahu', tenthLordName];

  const mdIsFame = md && fameMDs.includes(md.planet);
  const adIsFame = ad && fameADs.includes(ad.planet);

  if (mdIsFame && adIsFame && fameScore >= 80) {
    const endYear = md.endDate.getFullYear();
    const adEnd   = ad?.endDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    return {
      window: `${md.planet} MD / ${ad?.planet} AD — until ${adEnd}`,
      level: 5,
      tag: `[Level 5: ${md.planet} MD / ${ad?.planet ?? ''} AD — until ${adEnd}]`,
    };
  }

  if (mdIsFame && fameScore >= 70) {
    const endStr = md.endDate.toLocaleDateString('en-IN', { year: 'numeric' });
    return {
      window: `${md.planet} MD — until ${endStr}`,
      level: 4,
      tag: `[Level 4: ${md.planet} MD — until ${endStr}]`,
    };
  }

  // Find next fame MD
  const allMDs = dasha.mahadashas;
  const futureFameMD = allMDs.find(m =>
    !m.isActive &&
    m.startDate > new Date() &&
    fameMDs.includes(m.planet)
  );

  if (futureFameMD) {
    const startYear = futureFameMD.startDate.getFullYear();
    const endYear   = futureFameMD.endDate.getFullYear();
    return {
      window: `${futureFameMD.planet} MD, ${startYear}–${endYear}`,
      level: 2,
      tag: `[Level 2: ${futureFameMD.planet} MD, ${startYear}–${endYear} — current MD blocks until then]`,
    };
  }

  return {
    window: 'Lifetime latent — requires sustained remedy to activate',
    level: 1,
    tag: '[Level 1: Lifetime latent — remedy required]',
  };
}

/**
 * LAYER 13 — Generate the full Virgin World Fame Verdict block.
 */
export function getVirginWorldFameVerdict(
  fameScore:         VirginWorldFameScore,
  planets:           PlanetPosition[],
  shadabala:         ShadabalaResult[],
  dasha:             DashaResult,
  tenthLordName:     string,
  padaLagna:         PadaLagna | null,
  lagnaRashiIdx:     number,
  aspects:           AspectData[],
  rajYogas:          YogaResult[],
  divisional:        DivisionalConfirmation
): VirginWorldFameVerdict {

  const getShadabala = (name: string) =>
    shadabala.find(s => s.planet === name)?.totalRupas ?? 0;

  const sunRupas       = getShadabala('Sun');
  const rahuRupas      = getShadabala('Rahu');
  const tenthLordRupas = getShadabala(tenthLordName);

  // AL position
  const alRashiIdx   = padaLagna?.rashiIndex ?? -1;
  const alFromLagna  = alRashiIdx >= 0 ? ((alRashiIdx - lagnaRashiIdx + 12) % 12) + 1 : 0;
  const alIn10or11   = [10, 11].includes(alFromLagna);
  const jupAspectsAL = aspects.some(a => a.fromPlanet === 'Jupiter' && a.toHouse === alRashiIdx + 1);
  const satAspectsAL = aspects.some(a => a.fromPlanet === 'Saturn'  && a.toHouse === alRashiIdx + 1);

  // Vargottama approximation
  const tenthLordPlanet  = planets.find(p => p.name === tenthLordName);
  const tenthLordVargott = tenthLordPlanet
    ? (tenthLordPlanet.degrees < 3.33 || tenthLordPlanet.degrees > 26.67)
    : false;

  const hasViparita = rajYogas.some(y =>
    y.isPresent && y.name.toLowerCase().includes('viparita')
  );
  const hasNeechaBhangaRaj = rajYogas.some(y =>
    y.isPresent && y.name.toLowerCase().includes('neecha bhanga')
  );

  const { withoutRemedy, withRemedy } = calculateFameProbability(
    fameScore.score,
    sunRupas, tenthLordRupas, rahuRupas,
    tenthLordVargott, alIn10or11, jupAspectsAL, satAspectsAL,
    divisional.d60_fameplanetsStrong, hasNeechaBhangaRaj
  );

  const { window, level, tag } = determinePeakWindow(dasha, fameScore.score, sunRupas, tenthLordName);

  const nature    = determineFameNature(planets, sunRupas, rahuRupas, hasViparita);
  const longevity = determineLongevity(fameScore.score, sunRupas, satAspectsAL);

  // Weakest fame planet
  const famePlanets = [
    { name: 'Sun',       rupas: sunRupas },
    { name: tenthLordName, rupas: tenthLordRupas },
    { name: 'Rahu',      rupas: rahuRupas },
  ];
  const weakest = famePlanets.reduce((a, b) => a.rupas < b.rupas ? a : b);

  const deficiencyMap: Record<string, string> = {
    Sun:  'Insufficient solar authority — fame without inner dignity or mass respect',
    Rahu: 'Rahu under-energized — viral reach is blocked; unconventional quality absent',
  };
  const weakestDeficiency = deficiencyMap[weakest.name] ??
    `${weakest.name} (10th lord) too weak (${weakest.rupas.toFixed(2)} rupas) — career platform collapses under fame pressure`;

  const remedyTargetMap: Record<string, string> = {
    Sun:   'Lead one visible public action daily before 8 AM (solar hour). Solar confidence is built through repeated public exposure, not private preparation.',
    Rahu:  'Engage deliberately with one foreign or unconventional domain weekly. Rahu fame requires breaking your own categories, not polishing what already exists.',
  };
  const fameRemedyTarget = remedyTargetMap[weakest.name] ??
    `Strengthen ${weakest.name} through consistent domain mastery — 90 minutes of deep work daily in your 10th house domain, tracked and shared publicly.`;

  const failureModes: FameFailureMode[] = [];
  if (rahuRupas > 1.8 && sunRupas < 0.75) {
    failureModes.push({
      pattern: 'Rahu over-amplification without Sun anchor',
      risk:    'Viral scandal destroys the image before it consolidates',
      impact:  '−35% probability; remedy Sun FIRST before amplifying Rahu',
    });
  }
  if (sunRupas < 0.75) {
    failureModes.push({
      pattern: 'Weak Sun',
      risk:    'Fame arrives without respect or inner fulfillment — recognition hollow',
      impact:  '−30%; native achieves visibility but privately feels like an impostor',
    });
  }
  if (satAspectsAL && !jupAspectsAL) {
    failureModes.push({
      pattern: 'Saturn on Arudha Lagna without Jupiter support',
      risk:    'Delayed but cemented legacy — hard-won; severe early setbacks before consolidation',
      impact:  '−20% in current window; +certification after Saturn matures the image',
    });
  }
  if (!divisional.d60_fameplanetsStrong) {
    failureModes.push({
      pattern: 'D60 Shashtiamsha weakness in fame planets',
      risk:    'Deep karmic debt blocks the fame ceiling — ancestors\' unresolved karma limits public image',
      impact:  '−25%; Pitru Dosha remedy required for full manifestation',
    });
  }

  return {
    score: fameScore.score,
    tier:  fameScore.tier,
    probabilityWithout: withoutRemedy,
    probabilityWith:    withRemedy,
    peakWindow:  window,
    dashaLevel:  level,
    levelTag:    tag,
    nature,
    longevity,
    weakestFamePlanet:      weakest.name,
    weakestFamePlanetRupas: weakest.rupas,
    weakestDeficiency,
    fameRemedyTarget,
    failureModes,
  };
}

/**
 * Format the Layer 13 output block as a human-readable string.
 */
export function formatFameVerdictBlock(v: VirginWorldFameVerdict): string {
  const lines: string[] = [
    '## VIRGIN WORLD FAME VERDICT',
    '',
    `- **Score (0–100)**: ${v.score}/100 — ${
      v.tier === 'HISTORIC' ? 'Historic-level' :
      v.tier === 'GLOBAL'   ? 'Global fame, sustained legacy' :
      v.tier === 'NATIONAL_NICHE' ? 'National + niche global' :
      'Fame denied or derivative'
    }`,
    `- **Probability without remedy**: ${v.probabilityWithout}%`,
    `- **Probability with remedy**: ${v.probabilityWith}%`,
    `- **Peak Window**: ${v.peakWindow}`,
    `- **Nature of Fame**: ${v.nature}`,
    `- **Longevity**: ${v.longevity}`,
    `- **Weakest Fame Planet**: ${v.weakestFamePlanet} — ${v.weakestFamePlanetRupas.toFixed(2)} rupas — ${v.weakestDeficiency}`,
    `- **Fame Remedy Target**: ${v.fameRemedyTarget}`,
    '',
  ];

  if (v.failureModes.length > 0) {
    lines.push('### Fame Failure Modes');
    v.failureModes.forEach(fm => {
      lines.push(`- **${fm.pattern}**: ${fm.risk} (${fm.impact})`);
    });
  }

  return lines.join('\n');
}
