# VEDIC RAJKUMAR — 13-LAYER INTERPRETATION ENGINE COMPLETION PROMPT v3.0
## "From Skeleton to Sentience" — Final Integration Prompt

**Target Repository**: `https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar`  
**Status**: 13-Layer Convergence Architecture — Partially Implemented (May 2026)  
**Task**: Wire all underlying services to the orchestrator. Fill every gap.  
**Philosophy**: "You do not describe charts. You resolve them."

---

## EXECUTIVE SUMMARY

The `interpretationEngine.ts` (1071 lines) is a COMPLETE 13-layer orchestrator with all helper functions already written. The `virginWorldFameService.ts` (618 lines), `psychologicalProfileService.ts` (447 lines), and enhanced `classicalAnswerEngine.ts` (945 lines) are all complete. **THE PROBLEM**: The underlying services (`shadabalaService.ts`, `yogaService.ts`, `dynamicTransitService.ts`, `jaiminiService.ts`, `aiPredictionService.ts`, `remediesService.ts`) have NOT been enhanced to export the interfaces and functions that the orchestrator expects. They still have their original (pre-v2.1) interfaces.

This prompt provides surgical, file-by-file modifications to bring all 6 services into full 13-layer convergence compliance.

---

## ARCHITECTURE PRINCIPLES (Non-Negotiable)

1. **Strict Sequential Hierarchy**: Lower layers cannot override higher layers
2. **Multiplicative Synthesis**: Yoga combinations multiply, never add
3. **Zero Hedging Policy**: Every output ends with "Therefore: [single verdict]"
4. **Shadbala Gate**: No yoga is strong without weakest planet's `totalRupas >= 0.75`
5. **Double Transit Protocol**: Single Jupiter transit = temporary only
6. **Every prediction gets `[Level X: Dasha detail]` tag**
7. **No fatalism**: Difficulty = curriculum, not curse

---

## FILE-BY-FILE COMPLETION MAP

### ─── FILE 1: `src/services/shadabalaService.ts` (CURRENT: 335 lines → TARGET: ~420 lines)

**Status**: Computes all 6 balas, `totalRupas`, `shadabalaRatio`, `strength` tier correctly.  
**Missing**: Vargottama/Combustion/Neecha Bhanga modifiers; weakest planet export format.

#### Step 1.1: Extend `ShadabalaResult` interface

```typescript
export interface ShadabalaResult {
  // ... existing fields (all 6 balas, totalRupas, requiredRupas, shadabalaRatio, isStrong, strength, label) ...

  // === NEW FIELDS for v2.1 ===
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
```

#### Step 1.2: Add modifier detection functions

```typescript
// Add near existing constants:

/** Detect Vargottama: planet occupies same rashi in D1 and D9 */
function detectVargottama(planetRashiD1: number, divisionalChart: Record<string, number>): boolean {
  const planetRashiD9 = divisionalChart['D9'];
  return planetRashiD1 === planetRashiD9;
}

/** Detect Combustion: planet within combustion orb of Sun (varies by planet) */
function detectCombustion(planetLongitude: number, sunLongitude: number, planetName: string): boolean {
  const orbs: Record<string, number> = {
    Moon: 12, Mercury: 14, Venus: 10, Mars: 17, Jupiter: 11, Saturn: 16,
  };
  const orb = orbs[planetName] ?? 15;
  const diff = Math.abs(planetLongitude - sunLongitude);
  const circularDiff = Math.min(diff, 360 - diff);
  return circularDiff <= orb;
}

/** Detect Neecha Bhanga: debilitated planet receives cancellation conditions */
function detectNeechaBhanga(
  planetName: string,
  planetRashi: number,
  planets: Array<{ name: string; rashiIndex: number; house: number }>,
  ascendantRashi: number
): boolean {
  // Debilitation signs
  const debilitationRashi: Record<string, number> = {
    Sun: 6, Moon: 7, Mars: 9, Mercury: 11, Jupiter: 1, Venus: 5, Saturn: 0,
  };
  const debSign = debilitationRashi[planetName];
  if (debSign === undefined || planetRashi !== debSign) return false;

  // Neecha Bhanga conditions (BPHS):
  // 1. Lord of debilitation sign exalted or in own sign
  // 2. Planet aspecting its exaltation sign
  // 3. Two benefics in kendra/trikona from debilitated planet
  const debLord = getRashiLord(debSign); // helper: Sun for Leo, Moon for Cancer, etc.
  const debLordPlanet = planets.find(p => p.name === debLord);
  
  // Condition 1: debilitation lord exalted or in own sign
  const exaltationRashi: Record<string, number> = {
    Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6,
  };
  const ownSigns: Record<string, number[]> = {
    Sun: [0], Moon: [1], Mars: [0, 7], Mercury: [2, 5], Jupiter: [3, 8], Venus: [1, 6], Saturn: [6, 9], 
  };
  if (debLordPlanet) {
    if (debLordPlanet.rashiIndex === exaltationRashi[debLord]) return true;
    if (ownSigns[debLord]?.includes(debLordPlanet.rashiIndex)) return true;
  }
  
  return false; // simplified — full BPHS logic can be added
}

/** Get rashi lord helper */
function getRashiLord(rashiIndex: number): string {
  const lords = ['Saturn', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
  // Corrected: Aries=Mars, Taurus=Venus, Gemini=Mercury, Cancer=Moon, Leo=Sun, Virgo=Mercury,
  //            Libra=Venus, Scorpio=Mars, Sagittarius=Jupiter, Capricorn=Saturn, Aquarius=Saturn, Pisces=Jupiter
  const correctedLords = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
  return correctedLords[rashiIndex] ?? 'Unknown';
}
```

#### Step 1.3: Apply modifiers in the main calculation function

In the function that returns `ShadabalaResult[]`, after computing `totalRupas`:

```typescript
// After computing base totalRupas:
const baseRupas = totalRupas;
let modifiedRupas = baseRupas;
let activeModifier: ShadabalaResult['activeModifier'] = null;

// Check Vargottama (requires D9 data passed as parameter)
const isVargottama = divisionalData?.D9 ? detectVargottama(planet.rashiIndex, divisionalData) : false;
if (isVargottama) {
  modifiedRupas = baseRupas * 1.25; // amplifies BOTH strength AND weakness
  activeModifier = 'vargottama';
}

// Check Combustion
const sunData = planets.find(p => p.name === 'Sun');
const isCombust = sunData ? detectCombustion(planet.totalDegrees, sunData.totalDegrees, planet.name) : false;
if (isCombust && !(isVargottama)) { // Vargottama takes precedence
  // EXCEPTION: combustion penalty waived if within 1° in own/exalted sign
  const inOwnOrExalted = isOwnSign(planet.name, planet.rashiIndex) || isExalted(planet.name, planet.rashiIndex);
  const within1Degree = sunData ? Math.min(
    Math.abs(planet.totalDegrees - sunData.totalDegrees),
    360 - Math.abs(planet.totalDegrees - sunData.totalDegrees)
  ) <= 1 : false;
  
  if (!(inOwnOrExalted && within1Degree)) {
    modifiedRupas = baseRupas * 0.70;
    activeModifier = 'combustion';
  }
}

// Check Neecha Bhanga (active only if debilitated + cancellation exists)
const neechaBhangaActive = detectNeechaBhanga(planet.name, planet.rashiIndex, planets, ascendantRashi);

// Recalculate strength based on MODIFIED rupas
const modifiedStrength = categorizeStrength(modifiedRupas);

return {
  // ... existing fields ...
  totalRupas: modifiedRupas, // Use MODIFIED value as primary
  baseRupas,
  modifiedRupas,
  isVargottama,
  isCombust,
  neechaBhangaActive,
  activeModifier,
  strength: modifiedStrength, // Recategorized from modified rupas
};
```

#### Step 1.4: Add `categorizeStrength` helper

```typescript
function categorizeStrength(rupas: number): ShadabalaResult['strength'] {
  if (rupas >= 2.0) return 'very-strong';
  if (rupas >= 1.25) return 'strong';
  if (rupas >= 0.75) return 'average';
  if (rupas >= 0.40) return 'weak';
  return 'very-weak';
}
```

#### Step 1.5: Export `ShadabalaAnalysis` with weakest planet detail

Ensure `ShadabalaAnalysis` includes:
```typescript
export interface ShadabalaAnalysis {
  planets: ShadabalaResult[];
  strongestPlanet: string;
  weakestPlanet: string;
  weakestPlanetRupas: number;        // NEW
  weakestPlanetBaseRupas: number;    // NEW (before modifiers)
  summary: { en: string; hi: string };
}
```

---

### ─── FILE 2: `src/services/yogaService.ts` (CURRENT: 1048 lines → TARGET: ~1200 lines)

**Status**: 100+ yoga detection, `strength: 'strong'|'moderate'|'weak'`.  
**Missing**: `status` (ACTIVE/EMERGING/LATENT/BROKEN), `shadabalaGated`, `activationDasha`, `activationWindow`, `dashaLevel`, `thereforeVerdict`.

#### Step 2.1: Extend `YogaResult` interface (or create `EnhancedYogaResult`)

DO NOT break the existing `YogaResult` — it is used across the codebase. Instead, export a NEW interface:

```typescript
export type YogaStatus = 'ACTIVE' | 'EMERGING' | 'LATENT' | 'BROKEN';
export type DashaLevel = 1 | 2 | 3 | 4 | 5;

export interface EnhancedYogaResult extends YogaResult {
  status: YogaStatus;
  shadabalaGated: number;        // weakest forming planet's totalRupas
  activationDasha?: string;      // "Jupiter MD / Saturn AD"
  activationWindow?: string;     // "2027–2029"
  dashaLevel: DashaLevel;
  thereforeVerdict: string;      // Single forced conclusion
  shadabalaTier: string;         // "Extremely Strong" | "Strong" | "Moderate" | "Weak" | "Extremely Weak"
}
```

#### Step 2.2: Create `getEnhancedYogaStatus` function

```typescript
/**
 * Determine yoga activation status based on Shadbala gate + Dasha cross-reference.
 * SHADBALA GATE: If weakest planet < 0.40 rupas → BROKEN regardless of other factors.
 */
export function getEnhancedYogaStatus(
  yoga: YogaResult,
  shadabalaResults: Array<{ planet: string; totalRupas: number }>,
  activeDasha: { mdLord: string; adLord: string; pdLord?: string } | null,
  upcomingDashaChange?: { newMdLord: string; startDate: Date } | null
): {
  status: YogaStatus;
  shadabalaGated: number;
  shadabalaTier: string;
  activationDasha?: string;
  activationWindow?: string;
  dashaLevel: DashaLevel;
  thereforeVerdict: string;
} {
  // Find weakest forming planet
  const yogaPlanets = yoga.planets;
  const planetRupas = yogaPlanets.map(name => {
    const found = shadabalaResults.find(s => s.planet === name);
    return { planet: name, rupas: found?.totalRupas ?? 0 };
  });
  const weakest = planetRupas.reduce((min, p) => p.rupas < min.rupas ? p : min, planetRupas[0]);
  const weakestRupas = weakest?.rupas ?? 0;

  // Shadbala tier
  let shadabalaTier: string;
  if (weakestRupas >= 2.0) shadabalaTier = 'Extremely Strong';
  else if (weakestRupas >= 1.25) shadabalaTier = 'Strong';
  else if (weakestRupas >= 0.75) shadabalaTier = 'Moderate';
  else if (weakestRupas >= 0.40) shadabalaTier = 'Weak';
  else shadabalaTier = 'Extremely Weak';

  // SHADBALA GATE: < 0.40 → BROKEN
  if (weakestRupas < 0.40) {
    return {
      status: 'BROKEN',
      shadabalaGated: weakestRupas,
      shadabalaTier,
      dashaLevel: 1,
      thereforeVerdict: `${yoga.name} is broken. ${weakest.planet} at ${weakestRupas.toFixed(2)} rupas cannot deliver. The event may occur but will be followed by reversal or disappointment.`,
    };
  }

  // Check Dasha activation
  const isMdActive = activeDasha && yogaPlanets.includes(activeDasha.mdLord);
  const isAdActive = activeDasha && yogaPlanets.includes(activeDasha.adLord);
  const isPdActive = activeDasha?.pdLord && yogaPlanets.includes(activeDasha.pdLord);

  let status: YogaStatus;
  let activationDasha: string | undefined;
  let activationWindow: string | undefined;
  let dashaLevel: DashaLevel;
  let thereforeVerdict: string;

  if ((isMdActive || isAdActive) && weakestRupas >= 0.75) {
    status = 'ACTIVE';
    activationDasha = `${activeDasha!.mdLord} MD / ${activeDasha!.adLord} AD`;
    dashaLevel = isPdActive ? 5 : isAdActive ? 4 : 3;
    const levelTag = `[Level ${dashaLevel}: ${activationDasha}]`;
    thereforeVerdict = `${yoga.name} delivers with confidence. ${weakest.planet} at ${weakestRupas.toFixed(2)} rupas supports full manifestation in the current Dasha window. ${levelTag}`;
  } else if (upcomingDashaChange && yogaPlanets.includes(upcomingDashaChange.newMdLord)) {
    status = 'EMERGING';
    const startYear = upcomingDashaChange.startDate.getFullYear();
    activationWindow = `${startYear}-${startYear + 3}`;
    activationDasha = `${upcomingDashaChange.newMdLord} MD`;
    dashaLevel = 2;
    thereforeVerdict = `${yoga.name} is emerging. Activation in ${upcomingDashaChange.newMdLord} MD, begins ${upcomingDashaChange.startDate.toLocaleDateString()}. [Level 2: Await ${upcomingDashaChange.newMdLord} MD]`;
  } else if (weakestRupas >= 0.75) {
    status = 'LATENT';
    dashaLevel = 2;
    const activatingPlanet = yogaPlanets[0];
    thereforeVerdict = `${yoga.name} is latent until ${activatingPlanet} MD/AD activates it. [Level 2: Wait for ${activatingPlanet} period]`;
  } else {
    status = 'BROKEN';
    dashaLevel = 1;
    thereforeVerdict = `${yoga.name} is broken. ${weakest.planet} at ${weakestRupas.toFixed(2)} rupas creates intermittent results — grant, then removal; rise, then obstacle.`;
  }

  return { status, shadabalaGated: weakestRupas, shadabalaTier, activationDasha, activationWindow, dashaLevel, thereforeVerdict };
}
```

#### Step 2.3: Create `enhanceYogaAnalysis` function

```typescript
/**
 * Upgrade a standard YogaAnalysis to use EnhancedYogaResults.
 * Call this from the interpretationEngine or any consumer.
 */
export function enhanceYogaAnalysis(
  analysis: YogaAnalysis,
  shadabalaResults: Array<{ planet: string; totalRupas: number }>,
  activeDasha: { mdLord: string; adLord: string; pdLord?: string } | null,
  upcomingDashaChange?: { newMdLord: string; startDate: Date } | null
): YogaAnalysis & { enhancedYogas: EnhancedYogaResult[] } {
  const enhancedYogas: EnhancedYogaResult[] = analysis.presentYogas
    .filter(y => y.isPresent)
    .map(yoga => {
      const enhanced = getEnhancedYogaStatus(yoga, shadabalaResults, activeDasha, upcomingDashaChange);
      return {
        ...yoga,
        ...enhanced,
      };
    });

  return {
    ...analysis,
    enhancedYogas,
  };
}
```

#### Step 2.4: Add multiplicative synthesis for yoga combinations

```typescript
/**
 * When multiple yogas combine, apply multiplicative (not additive) synthesis.
 */
export function synthesizeYogaCombo(
  yoga1: EnhancedYogaResult,
  yoga2: EnhancedYogaResult
): { combination: string; narrative: string } {
  const combo = [yoga1.name, yoga2.name].sort().join(' + ');
  
  const syntheses: Record<string, string> = {
    'Raj Yoga + Viparita Yoga': 'Rise through adversity, scandal, or institutional collapse. Power is forged in crisis, not comfort.',
    'Neecha Bhanga + Raj Yoga': 'Catastrophic early conditions → spectacular second-half reversal. The greater the fall, the greater the rise.',
    'Gaja Kesari + Dhana Yoga': 'Wealth through wisdom and public reputation. Money follows knowledge, never precedes it.',
    'Rahu in 10th + Strong Sun': 'Viral, unconventional world fame. The native becomes a category of one.',
    'Viparita Raj Yoga + Rahu': 'Fame from ashes or scandal. Self-transformation is the only path to lasting recognition.',
  };

  return {
    combination: combo,
    narrative: syntheses[combo] ?? `Combined influence: ${yoga1.name} (${yoga1.status}) + ${yoga2.name} (${yoga2.status}). Effects are multiplicative, not additive.`,
  };
}
```

---

### ─── FILE 3: `src/services/dynamicTransitService.ts` (CURRENT: 406 lines → TARGET: ~520 lines)

**Status**: Individual transit calculation with `calculateDynamicTransits()`.  
**Missing**: `checkDoubleTransit()` for Jupiter + Saturn simultaneous check.

#### Step 3.1: Add Double Transit types and function

```typescript
// Add to existing interfaces:

export type DoubleTransitType = 
  | 'DOUBLE_TRANSIT_CERTIFIED' 
  | 'DOUBLE_TRANSIT_SUPPORTED'
  | 'DOUBLE_TRANSIT_PEAK'
  | 'SINGLE_TRANSIT_TEMPORARY'
  | 'NO_TRANSIT_IGNITION';

export interface DoubleTransitResult {
  type: DoubleTransitType;
  activePlanet?: 'Jupiter' | 'Saturn';
  label: string;
  certifies: boolean;      // true if permanent structural change
  description: string;
  jupiterHouse?: number;
  saturnHouse?: number;
}

export interface TransitData {
  planet: string;
  house: number;
  aspectsHouse?: number;
  isRetrograde: boolean;
  degrees: number;
}
```

#### Step 3.2: Implement `checkDoubleTransit`

```typescript
/**
 * LAYER 7 — Double Transit Protocol
 * Check Jupiter + Saturn simultaneous influence on a house/point.
 * Single Jupiter transit = temporary window only (not structural).
 * Single Saturn transit = pressure without expansion (test without reward).
 * Both together = CERTIFIED permanent structural change.
 */
export function checkDoubleTransit(
  targetHouse: number,
  jupiterTransits: TransitData[],
  saturnTransits: TransitData[],
  targetName: string = 'the target'
): DoubleTransitResult {
  const jupiterInHouse = jupiterTransits.some(t => t.house === targetHouse);
  const jupiterAspects = jupiterTransits.some(t => t.aspectsHouse === targetHouse);
  const jupiterActive = jupiterInHouse || jupiterAspects;
  const jupiterHouse = jupiterTransits.find(t => t.house === targetHouse || t.aspectsHouse === targetHouse)?.house;

  const saturnInHouse = saturnTransits.some(t => t.house === targetHouse);
  const saturnAspects = saturnTransits.some(t => t.aspectsHouse === targetHouse);
  const saturnActive = saturnInHouse || saturnAspects;
  const saturnHouse = saturnTransits.find(t => t.house === targetHouse || t.aspectsHouse === targetHouse)?.house;

  // Both Jupiter AND Saturn transiting same house = PEAK WINDOW
  if (jupiterInHouse && saturnInHouse) {
    return {
      type: 'DOUBLE_TRANSIT_PEAK',
      certifies: true,
      label: 'PEAK WINDOW — Maximum Manifestation Pressure',
      description: `Both Jupiter and Saturn are simultaneously transiting ${targetName} (house ${targetHouse}). This is the maximum-pressure window for manifestation. The event is not only certified — it is forced into being. [Level 5: Immediate 18-month window]`,
      jupiterHouse,
      saturnHouse,
    };
  }

  // Jupiter transits + Saturn aspects = CERTIFIED
  if (jupiterActive && saturnActive) {
    return {
      type: 'DOUBLE_TRANSIT_CERTIFIED',
      certifies: true,
      label: 'CERTIFIED — Permanent Structural Change',
      description: `Jupiter ${jupiterInHouse ? 'transits' : 'aspects'} ${targetName} while Saturn ${saturnInHouse ? 'transits' : 'aspects'} it. This double convergence certifies a permanent structural change, not a temporary window. The event will happen and will endure.`,
      jupiterHouse,
      saturnHouse,
    };
  }

  // Only Jupiter active = TEMPORARY
  if (jupiterActive && !saturnActive) {
    return {
      type: 'SINGLE_TRANSIT_TEMPORARY',
      activePlanet: 'Jupiter',
      certifies: false,
      label: 'Temporary Window — Jupiter Only',
      description: `Jupiter ${jupiterInHouse ? 'transits' : 'aspects'} ${targetName}, but Saturn is not involved. This is a temporary blessing window only — not a structural change. Benefits may arrive and then dissipate. [SINGLE TRANSIT: Temporary]`,
      jupiterHouse,
    };
  }

  // Only Saturn active = TEMPORARY (pressure without expansion)
  if (!jupiterActive && saturnActive) {
    return {
      type: 'SINGLE_TRANSIT_TEMPORARY',
      activePlanet: 'Saturn',
      certifies: false,
      label: 'Temporary Pressure — Saturn Only',
      description: `Saturn ${saturnInHouse ? 'transits' : 'aspects'} ${targetName}, but Jupiter is not involved. This is pressure without expansion — a test without guaranteed reward. Work done now matters, but results are not assured without Jupiter's blessing. [SINGLE TRANSIT: Test Period]`,
      saturnHouse,
    };
  }

  // Neither active
  return {
    type: 'NO_TRANSIT_IGNITION',
    certifies: false,
    label: 'No Transit Ignition',
    description: `Neither Jupiter nor Saturn is currently influencing ${targetName}. No transit ignition is present. Wait for the next convergence window.`,
  };
}
```

#### Step 3.3: Add convenience functions for domain-specific checks

```typescript
/** Check Double Transit for Marriage (7th house) */
export function checkMarriageDoubleTransit(
  jupiterTransits: TransitData[],
  saturnTransits: TransitData[],
  seventhLordHouse?: number
): DoubleTransitResult {
  const house7 = checkDoubleTransit(7, jupiterTransits, saturnTransits, '7th house');
  if (house7.certifies) return house7;
  
  // Also check 7th lord's position if known
  if (seventhLordHouse) {
    const lordCheck = checkDoubleTransit(seventhLordHouse, jupiterTransits, saturnTransits, '7th lord');
    if (lordCheck.certifies) return lordCheck;
  }
  
  return house7;
}

/** Check Double Transit for Career/Fame (10th house) */
export function checkCareerDoubleTransit(
  jupiterTransits: TransitData[],
  saturnTransits: TransitData[]
): DoubleTransitResult {
  return checkDoubleTransit(10, jupiterTransits, saturnTransits, '10th house');
}

/** Check Double Transit for Wealth (2nd/11th houses) */
export function checkWealthDoubleTransit(
  jupiterTransits: TransitData[],
  saturnTransits: TransitData[]
): DoubleTransitResult {
  const h2 = checkDoubleTransit(2, jupiterTransits, saturnTransits, '2nd house');
  if (h2.certifies) return h2;
  return checkDoubleTransit(11, jupiterTransits, saturnTransits, '11th house');
}
```

---

### ─── FILE 4: `src/services/jaiminiService.ts` (CURRENT: 433 lines → TARGET: ~580 lines)

**Status**: Chara Karakas, `PadaLagna`, Chara Dasha, Argala, Pada Yogas all computed.  
**Missing**: UL (Upapada Lagna), A4 (Chaturthamsa Arudha), A10 (Dashamamsa Arudha) computation; AL-Lagna gap psychological narrative.

#### Step 4.1: Add Arudha computation for UL, A4, A10

```typescript
// Add after existing calculatePadaLagna function:

/** 
 * Calculate Upapada Lagna (UL) — Arudha of 12th house
 * Represents: Marriage perception — how native experiences vs. how others see their marriage
 */
export function calculateUpapadaLagna(
  twelfthLordRashi: number,
  twelfthLordDegrees: number,
  planets: Array<{ name: string; rashiIndex: number; degrees: number }>
): PadaLagna | null {
  return calculateArudhaGeneric(12, twelfthLordRashi, twelfthLordDegrees, planets);
}

/**
 * Calculate A4 (Arudha of 4th house) — Chaturthamsa Arudha
 * Represents: Home/comfort perception — inner security vs. displayed stability
 */
export function calculateA4(
  fourthLordRashi: number,
  fourthLordDegrees: number,
  planets: Array<{ name: string; rashiIndex: number; degrees: number }>
): PadaLagna | null {
  return calculateArudhaGeneric(4, fourthLordRashi, fourthLordDegrees, planets);
}

/**
 * Calculate A10 (Arudha of 10th house) — Dashamamsa Arudha
 * Represents: Career perception — public status vs. private ambition
 */
export function calculateA10(
  tenthLordRashi: number,
  tenthLordDegrees: number,
  planets: Array<{ name: string; rashiIndex: number; degrees: number }>
): PadaLagna | null {
  return calculateArudhaGeneric(10, tenthLordRashi, tenthLordDegrees, planets);
}

/** Generic Arudha calculation for any house */
function calculateArudhaGeneric(
  houseNumber: number,
  lordRashi: number,
  lordDegrees: number,
  planets: Array<{ name: string; rashiIndex: number; degrees: number }>
): PadaLagna | null {
  const sameRashiPlanets = planets.filter(
    p => p.rashiIndex === lordRashi && p.name !== getRashiLord(lordRashi)
  );

  const padaRashi = sameRashiPlanets.length > 0
    ? (lordRashi + 1) % 12
    : (lordRashi + Math.floor(lordDegrees / 30)) % 12;

  const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

  return {
    house: houseNumber,
    rashi: padaRashi,
    rashiName: signs[padaRashi],
    degrees: 0,
    lord: getRashiLord(padaRashi),
  };
}

/** Get rashi lord — helper (already exists, ensure it's exported or duplicated here) */
function getRashiLord(rashiIndex: number): string {
  const lords = ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
  return lords[rashiIndex] ?? 'Unknown';
}
```

#### Step 4.2: Add the AL-Lagna gap psychological narrative function

```typescript
/**
 * LAYER 8 — Arudha Psychology Narrative
 * Maps AL position from Lagna to psychological mask + core tension.
 * All 12 positions defined. Output is the mandatory narrative template.
 */
export interface ArudhaPsychologyOutput {
  alPosition: number;        // AL from Lagna (1-12)
  alRashiName: string;
  psychologicalMask: string;
  coreTension: string;
  privateState: string;
  publicProjection: string;
  gapConsequence: string;
  shiftRequired: string;     // "Therefore: what must shift"
  narrative: string;         // Full formatted paragraph
  ul?: ArudhaDetail;         // Upapada Lagna detail
  a4?: ArudhaDetail;         // A4 detail
  a10?: ArudhaDetail;        // A10 detail
}

export interface ArudhaDetail {
  house: number;
  rashiName: string;
  meaning: string;
}

const AL_PSYCHOLOGY_MAP: Record<number, {
  mask: string;
  tension: string;
  privateState: string;
  publicProjection: string;
  consequence: string;
  shift: string;
}> = {
  1: {
    mask: 'No mask. World sees you as you are. Vulnerable but authentic.',
    tension: 'Authenticity vs. exposure',
    privateState: 'You are exactly what you appear to be',
    publicProjection: 'Transparent, unguarded authenticity',
    consequence: 'The native cannot hide — which is both a gift and a burden',
    shift: 'Continue being exactly who you are. The world needs your unfiltered presence.',
  },
  2: {
    mask: 'Identity = wealth, speech, family. "I am what I own and what I say."',
    tension: 'Worth vs. value',
    privateState: 'Internally questioning your own value',
    publicProjection: 'Material security and verbal confidence',
    consequence: 'The native accumulates to feel valid, then feels hollow inside the accumulation',
    shift: 'Separate your net worth from your self-worth. Your value precedes everything you own.',
  },
  3: {
    mask: 'The warrior-mask. Courage and competition define perceived identity.',
    tension: 'Action vs. inner stillness',
    privateState: 'Internally exhausted from constant striving',
    publicProjection: 'Unstoppable initiative and bold action',
    consequence: 'The native outruns their own anxiety until the body forces a stop',
    shift: 'Courage includes the courage to rest. Stillness is not weakness.',
  },
  4: {
    mask: 'Nurturing/protective image. Home and emotional safety are the stage.',
    tension: 'Care-giving vs. receiving',
    privateState: 'Privately craving the nurturing you give others',
    publicProjection: 'The reliable anchor, the safe harbor',
    consequence: 'The native becomes everyone\'s home but has no home of their own',
    shift: 'Receive before you give. An empty well cannot water a village.',
  },
  5: {
    mask: 'Creative/authority image. Seen as brilliant or entitled.',
    tension: 'Creation vs. ego',
    privateState: 'Privately afraid of being ordinary',
    publicProjection: 'Brilliant, authoritative, creatively gifted',
    consequence: 'The native performs genius until they forget what genuine creation feels like',
    shift: 'Create for the joy of creating, not for the validation of being seen as creative.',
  },
  6: {
    mask: 'Service/conflict image. Seen through work or through enemies.',
    tension: 'Service vs. recognition',
    privateState: 'Internally resentful that effort goes unnoticed',
    publicProjection: 'The indispensable worker, the problem-solver',
    consequence: 'The native solves everyone\'s problems except their own',
    shift: 'Your service is valuable only when you are valued while serving.',
  },
  7: {
    mask: 'Relationship mirror. Identity exists only in partnership.',
    tension: 'Union vs. self',
    privateState: 'Uncertain who you are when alone',
    publicProjection: 'Defined entirely by your significant relationships',
    consequence: 'The native loses themselves in every partnership and must rebuild after each ends',
    shift: 'Become complete alone. Then partnerships become chosen, not needed.',
  },
  8: {
    mask: 'Mystery/transformation image. Inscrutable. Taboo as brand.',
    tension: 'Concealment vs. revelation',
    privateState: 'Holding secrets that would change everything if spoken',
    publicProjection: 'Magnetic mystery, transformational presence',
    consequence: 'The native\'s power is in what they hide — but hiding becomes its own prison',
    shift: 'Reveal one truth at a time. Authenticity does not require full exposure.',
  },
  9: {
    mask: 'Guru/guide image. The wise foreigner or spiritual authority.',
    tension: 'Knowledge vs. wisdom',
    privateState: 'Privately aware of how much you do not know',
    publicProjection: 'The teacher, the guide, the truth-teller',
    consequence: 'The native is expected to have answers they are still seeking',
    shift: 'Teach what you are still learning. The best guru is an eternal student.',
  },
  10: {
    mask: 'Career/public achievement as identity. The workaholic mask.',
    tension: 'Achievement vs. being',
    privateState: 'Privately uncertain but publicly unstoppable',
    publicProjection: 'Competent, driven, professionally unassailable',
    consequence: 'The world believes in your competence more than you do. The gap creates performance anxiety invisible to everyone except you.',
    shift: 'Success arrives when you stop performing competence and start embodying it.',
  },
  11: {
    mask: 'Network/visionary image. Known by associations and causes.',
    tension: 'Vision vs. belonging',
    privateState: 'Afraid of being excluded from the very groups you lead',
    publicProjection: 'The connector, the visionary, the network hub',
    consequence: 'The native\'s identity disperses across too many affiliations',
    shift: 'A focused vision attracts more than a scattered presence.',
  },
  12: {
    mask: 'Hidden/self-undoing image. Fame through loss or exile.',
    tension: 'Sacrifice vs. surrender',
    privateState: 'Holding grief that the world never sees',
    publicProjection: 'The mystic, the exile, the one who walked away',
    consequence: 'The native\'s public image is built on private sacrifice',
    shift: 'Surrender is not defeat. Letting go is the final victory.',
  },
};

export function buildArudhaPsychology(
  padaLagna: PadaLagna | null,
  lagnaRashiIdx: number,
  dasha: { currentMahadasha?: { planet: string; startDate: Date; endDate: Date } | null }
): ArudhaPsychologyOutput {
  if (!padaLagna) {
    return {
      alPosition: 0,
      alRashiName: 'Unknown',
      psychologicalMask: 'AL cannot be computed — insufficient data.',
      coreTension: 'Unknown',
      privateState: 'Unknown',
      publicProjection: 'Unknown',
      gapConsequence: 'Unknown',
      shiftRequired: 'Unknown',
      narrative: 'AL computation failed. Check ascendant data.',
    };
  }

  const alPosition = ((padaLagna.rashi - lagnaRashiIdx + 12) % 12) + 1;
  const psych = AL_PSYCHOLOGY_MAP[alPosition];
  
  const md = dasha.currentMahadasha;
  const dashaNote = md ? ` [Level 3: Current ${md.planet} MD is the crucible — ${md.startDate.getFullYear()}-${md.endDate.getFullYear()}]` : '';

  const narrative = `AL in the ${alPosition}${ordinalSuffix(alPosition)} from Lagna: ${psych.mask} ${psych.privateState} privately, but ${psych.publicProjection} publicly. ${psych.consequence}. Therefore: ${psych.shift}.${dashaNote}`;

  return {
    alPosition,
    alRashiName: padaLagna.rashiName,
    psychologicalMask: psych.mask,
    coreTension: psych.tension,
    privateState: psych.privateState,
    publicProjection: psych.publicProjection,
    gapConsequence: psych.consequence,
    shiftRequired: psych.shift,
    narrative,
  };
}

function ordinalSuffix(n: number): string {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}
```

#### Step 4.3: Update `JaiminiAnalysis` interface to include all Arudha points

```typescript
export interface JaiminiAnalysis {
  charaKarakas: Karaka[];
  padaLagna: PadaLagna | null;
  upapadaLagna: PadaLagna | null;     // NEW
  a4: PadaLagna | null;               // NEW
  a10: PadaLagna | null;              // NEW
  rashiAspects: RashiAspect[];
  jaiminiYogas: JaiminiYoga[];
  charaDasha: CharaDashaPeriod[];
  summary: { en: string; hi: string };
}
```

---

### ─── FILE 5: `src/services/aiPredictionService.ts` (CURRENT: 227 lines → TARGET: ~350 lines)

**Status**: Hardcoded confidence tables by planet/house.  
**Missing**: `calculateProbability()` driven by actual Shadbala + Dasha Level + Double Transit.

#### Step 5.1: Replace hardcoded tables with Shadbala-driven probability engine

```typescript
// REMOVE or DEPRECATE the hardcoded tables:
// const PLANET_CONFIDENCE_TABLES = { ... }  ← MARK AS @deprecated

// NEW: Shadbala-driven probability calibration

export interface ProbabilityResult {
  withoutRemedy: number;   // 0-95%
  withRemedy: number;      // 0-95%
  confidenceBasis: string; // Human-readable explanation
}

/**
 * LAYER 10 — Probability Calibration Engine
 * Replaces all hardcoded confidence tables.
 * Every probability is computed from actual chart factors.
 */
export function calculateProbability(
  shadabalaScore: number,           // weakest yoga planet's totalRupas
  dashaLevel: 1 | 2 | 3 | 4 | 5,
  divisionalConfirmed: boolean,      // D9/D10 confirms the promise
  doubleTransitActive: boolean,      // Jupiter + Saturn both influencing
  neechaBhangaActive: boolean,       // Neecha Bhanga is currently active
  queryContext?: string
): ProbabilityResult {
  let base = 0;

  // 1. Shadbala contribution (0–40 points)
  if (shadabalaScore >= 2.0) base += 40;
  else if (shadabalaScore >= 1.25) base += 40; // Strong = full 40
  else if (shadabalaScore >= 0.75) base += 25; // Moderate
  else if (shadabalaScore >= 0.40) base += 10; // Weak
  else base += 0; // Extremely Weak

  // 2. Dasha Level contribution (0–30 points)
  base += (dashaLevel - 1) * 7.5;

  // 3. Divisional confirmation (+15)
  if (divisionalConfirmed) base += 15;

  // 4. Double Transit (+10)
  if (doubleTransitActive) base += 10;

  // 5. Neecha Bhanga active (+5 bonus to withRemedy)
  const withoutRemedy = Math.min(95, Math.round(base));
  const withRemedy = Math.min(95, Math.round(base + (neechaBhangaActive ? 25 : 15)));

  // Build explanation
  const parts: string[] = [];
  parts.push(`Shadbala ${shadabalaScore.toFixed(2)} rupas → ${shadabalaScore >= 1.25 ? 'Strong (+40)' : shadabalaScore >= 0.75 ? 'Moderate (+25)' : shadabalaScore >= 0.40 ? 'Weak (+10)' : 'Extremely Weak (+0)'}`);
  parts.push(`Dasha Level ${dashaLevel} → +${(dashaLevel - 1) * 7.5}`);
  if (divisionalConfirmed) parts.push('Divisional confirmation → +15');
  if (doubleTransitActive) parts.push('Double Transit active → +10');

  return {
    withoutRemedy,
    withRemedy,
    confidenceBasis: parts.join('; '),
  };
}
```

#### Step 5.2: Add Shadbala-driven narrative generator

```typescript
/**
 * Generate narrative verdict based on Shadbala score instead of hardcoded tables.
 */
export function getShadabalaDrivenVerdict(
  planet: string,
  rupas: number,
  yoga: string
): string {
  if (rupas < 0.40) {
    return `${yoga} is broken. ${planet} at ${rupas.toFixed(2)} rupas cannot deliver. Event may occur but will be followed by reversal or disappointment.`;
  }
  if (rupas < 0.75) {
    return `${yoga} is diluted. ${planet} at ${rupas.toFixed(2)} rupas creates intermittent results — grant, then removal; rise, then obstacle.`;
  }
  if (rupas >= 1.25) {
    return `${yoga} delivers with confidence. ${planet} at ${rupas.toFixed(2)} rupas supports full manifestation in the current Dasha window.`;
  }
  return `${yoga} is conditional. ${planet} at ${rupas.toFixed(2)} rupas requires supporting factors (benefic transit, strong AD lord) to fully manifest.`;
}
```

#### Step 5.3: Add failure mode analysis function

```typescript
export interface FailureModeAnalysis {
  obstruction: string;
  probabilityWithout: number;
  probabilityWith: number;
  interventionTarget: string;
  interventionRupas: number;
  interventionRationale: string;
  requiredRemedyDuration: string;
}

export function buildFailureMode(
  weakestPlanet: string,
  weakestRupas: number,
  dashaLevel: 1 | 2 | 3 | 4 | 5,
  divisionalConfirmed: boolean,
  doubleTransitActive: boolean,
  neechaBhangaActive: boolean,
  queryContext: string
): FailureModeAnalysis {
  const { withoutRemedy, withRemedy } = calculateProbability(
    weakestRupas, dashaLevel, divisionalConfirmed, doubleTransitActive, neechaBhangaActive
  );

  const tier = weakestRupas >= 2.0 ? 'Extremely Strong' :
               weakestRupas >= 1.25 ? 'Strong' :
               weakestRupas >= 0.75 ? 'Moderate' :
               weakestRupas >= 0.40 ? 'Weak' : 'Extremely Weak';

  const duration = weakestRupas < 0.40 ? 'minimum 6 months sustained practice' :
                   weakestRupas < 0.75 ? '3-6 months consistent application' :
                   '40 days minimum disciplined practice';

  return {
    obstruction: `${weakestPlanet} in ${queryContext} house with ${weakestRupas.toFixed(2)} rupas Shadbala (tier: ${tier}). This is the structural bottleneck.`,
    probabilityWithout: withoutRemedy,
    probabilityWith: withRemedy,
    interventionTarget: weakestPlanet,
    interventionRupas: weakestRupas,
    interventionRationale: `${weakestPlanet} is the single point of failure. Strengthening any other planet will not compensate — this specific deficiency must be targeted.`,
    requiredRemedyDuration: duration,
  };
}
```

---

### ─── FILE 6: `src/services/remediesService.ts` (CURRENT: 332 lines → TARGET: ~500 lines)

**Status**: Good raw materials — mantra, charity, fasting, ritual, gemstone with timing and bilingual instructions.  
**Missing**: `assembleSixLayerStack()` that is diagnostically targeted to the single weakest planet in the specific promise chain.

#### Step 6.1: Define Six-Layer Stack types

```typescript
export interface SixLayerRemedyStack {
  planet: string;              // Target planet (weakest in promise chain)
  queryContext: string;
  layer1_behavioral: string;   // Concrete daily action
  layer2_psychological: string; // Inner reframe
  layer3_spiritual: string;    // Named mantra + count + mechanism
  layer4_practical: string;    // Dietary/lifestyle
  layer5_karmic: string;       // Service to discharge planetary debt
  layer6_ritual: string;       // Ceremonial (optional)
  duration: string;
  expectedOutcome: string;
}

export interface RemedyInput {
  weakestPlanet: string;
  weakestPlanetRupas: number;
  nakshatraFear?: { coreFear: string; reframe: string };
  saturnWound?: string;
  queryContext: string;
}
```

#### Step 6.2: Create planet-specific behavioral remedies (Layer 1)

```typescript
const PLANET_BEHAVIORAL_REMEDIES: Record<string, (context: string) => string> = {
  Saturn: () => 'Daily discipline practice: Wake at the same time, complete one difficult task before pleasure, tolerate delay without complaint. Track consistency, not results.',
  
  Venus: () => 'Receiving pleasure without guilt practice: Each day, accept one compliment without deflection. Give one genuine beauty-acknowledgment to another without expecting return.',
  
  Mercury: () => 'Communication discipline: Read one paragraph aloud each morning. Write 100 structured words daily. Teach something you know to someone once per week.',
  
  Mars: () => 'Controlled assertion practice: One act of physical courage daily (cold shower, hard conversation, physical exertion). Channel anger into action within 24 hours — never suppress, never explode.',
  
  Jupiter: () => 'Structured giving: Teach or expand another person\'s knowledge for 30 minutes weekly. Give without being asked. Mentor someone younger or less experienced.',
  
  Moon: () => 'Emotional regulation practice: 10 minutes of water contact daily (bath, ocean, drinking mindfully). One nurturing act for another. Track emotional states without judgment.',
  
  Sun: () => 'Leadership practice: One public action daily — post, speak, decide, lead. 10 minutes solar exposure before 8 AM. Take responsibility for one outcome you did not cause.',
  
  Rahu: () => 'Confront the obsession: Name your foreign/unconventional desire aloud. Channel one Rahu-impulse productively per week. Study what you fear most for 20 minutes daily.',
  
  Ketu: () => 'Release practice: Remove one attachment weekly (physical or digital). 10 minutes of structured silence daily. Write what you are done with, burn the paper.',
};
```

#### Step 6.3: Create planet-specific spiritual remedies (Layer 3)

```typescript
const PLANET_MANTRAS: Record<string, { mantra: string; count: number; timing: string; mechanism: string }> = {
  Saturn: { 
    mantra: 'Om Sham Shanicharaya Namah', 
    count: 23000, 
    timing: 'Saturday evenings, 108 repetitions daily',
    mechanism: 'Vibrates the root chakra, builds patience neural pathways, slows reactive patterns'
  },
  Venus: { 
    mantra: 'Om Shum Shukraya Namah', 
    count: 16000, 
    timing: 'Friday mornings, 108 repetitions daily',
    mechanism: 'Opens heart chakra receptivity, dissolves guilt-pleasure association'
  },
  Mercury: { 
    mantra: 'Om Bum Budhaya Namah', 
    count: 9000, 
    timing: 'Wednesday mornings, 108 repetitions daily',
    mechanism: 'Activates throat chakra, structures neural language processing'
  },
  Mars: { 
    mantra: 'Om Bhaum Bhaumaya Namah', 
    count: 10000, 
    timing: 'Tuesday mornings, 108 repetitions daily',
    mechanism: 'Channels solar plexus energy into disciplined action'
  },
  Jupiter: { 
    mantra: 'Om Gram Grim Graum Sah Guruve Namah', 
    count: 19000, 
    timing: 'Thursday mornings, 108 repetitions daily',
    mechanism: 'Expands prefrontal cortex perspective-taking, opens crown chakra'
  },
  Moon: { 
    mantra: 'Om Som Somaya Namah', 
    count: 11000, 
    timing: 'Monday evenings, 108 repetitions daily',
    mechanism: 'Stabilizes limbic system, regulates emotional tidal patterns'
  },
  Sun: { 
    mantra: 'Om Hram Hrim Hraum Sah Suryaya Namah', 
    count: 7000, 
    timing: 'Sunday sunrise, 108 repetitions daily',
    mechanism: 'Activates solar plexus, builds authentic presence neural circuits'
  },
  Rahu: { 
    mantra: 'Om Bhram Bhramaya Namah', 
    count: 18000, 
    timing: 'Saturday midnight hour, 108 repetitions daily',
    mechanism: 'Integrates shadow material, channels obsessive energy into creation'
  },
  Ketu: { 
    mantra: 'Om Stram Strim Straum Sah Ketave Namah', 
    count: 17000, 
    timing: 'Tuesday late night, 108 repetitions daily',
    mechanism: 'Facilitates release of karmic patterns, opens third eye detachment'
  },
};
```

#### Step 6.4: Create planet-specific practical remedies (Layer 4)

```typescript
const PLANET_PRACTICAL_REMEDIES: Record<string, string> = {
  Saturn: 'Iron-rich foods (spinach, lentils). Avoid cold/raw after sunset. Black sesame in diet. Strict sleep schedule — same time, every day.',
  Venus: 'Sweet fruits, white foods (rice, milk). Avoid over-sour. Rose water. Maintain beauty/art in living space. Silk or cotton fabrics only.',
  Mercury: 'Green vegetables, moong dal. Avoid excess salt. Brahmi herb. Clean, organized workspace. Digital sunset at 8 PM.',
  Mars: 'Red lentils, turmeric, ginger. Avoid excess oil. Pitta-calming diet. Morning exercise before 8 AM. Red/pink accents in environment.',
  Jupiter: 'Yellow foods (turmeric, saffron). Avoid excess alcohol. Chickpeas. Expand knowledge — one philosophical text monthly. Yellow clothing on Thursdays.',
  Moon: 'Hydration protocol — warm water every hour. Dairy in moderation. White foods. Sleep by 10 PM. Moon-gazing when visible.',
  Sun: 'Protein-rich breakfast before 9 AM. Citrus fruits. Avoid excessive fasting. Leadership role in one group activity weekly. Gold or orange accents.',
  Rahu: 'Blue/purple foods (blueberries, eggplant). Avoid processed food entirely. Foreign cuisine once weekly. Technology fast one day weekly.',
  Ketu: 'Fasting one day weekly (EKADASHI). Simple foods — one grain, one vegetable. Meditation before sleep. Grey or brown earth tones.',
};
```

#### Step 6.5: Create planet-specific karmic remedies (Layer 5)

```typescript
const PLANET_KARMIC_SERVICES: Record<string, string> = {
  Saturn: 'Service to elderly: Visit an old age home monthly. Mentor someone from a disadvantaged background. Complete tasks others abandon — without complaint, without credit.',
  Venus: 'Beauty service: Help someone feel attractive/loved weekly. Arrange flowers for a temple. Fund or create art for public spaces. Relationship counseling — volunteer.',
  Mercury: 'Teaching literacy: Volunteer teach reading to adults or children. Translate spiritual texts. Help someone write their story. Library service.',
  Mars: 'Physical protection: Train in self-defense and teach it. Blood donation quarterly. Stand up for someone who cannot defend themselves. Build/fix something for community.',
  Jupiter: 'Wisdom transmission: Mentor a student pro bono. Fund a child's education. Give spiritual counsel without charge. Expand someone else's opportunity — be the door-opener.',
  Moon: 'Nurturing service: Cook for sick or elderly. Emotional support — genuinely listen to someone weekly. Childcare for struggling parents. Water conservation work.',
  Sun: 'Leadership service: Lead a community project without seeking office. Take public responsibility for a collective problem. Father-figure mentorship — guide a young man.',
  Rahu: 'Shadow integration work: Help rehabilitate addicts or prisoners. Foreigner service — help immigrants integrate. Technology for good — build tools for underserved communities.',
  Ketu: 'Release and liberation: Help others let go — grief counseling, decluttering service. Animal shelter work (animals = Ketu). Spiritual retreat service — maintain a sacred space.',
};
```

#### Step 6.6: Create planet-specific ritual remedies (Layer 6)

```typescript
const PLANET_RITUAL_REMEDIES: Record<string, string> = {
  Saturn: 'Saturday: Black sesame oil lamp at Shani temple. Iron donation. Hanuman Chalisa. Feed black dogs or crows.',
  Venus: 'Friday: White flower offering at Lakshmi temple. Silver donation. Wear white. Feed white sweets to young girls (kanya puja).',
  Mercury: 'Wednesday: Green cloth to Vishnu temple. Emerald prayer. Feed green vegetables to cows. Budha Graha Shanti puja.',
  Mars: 'Tuesday: Red flower at Hanuman temple. Copper donation. Feed red lentils to poor. Light red sandalwood incense.',
  Jupiter: 'Thursday: Yellow cloth at Dakshinamurthy/Guru temple. Yellow sapphire prayer. Feed brahmins or teachers. Yellow banana donation.',
  Moon: 'Monday: White rice pudding at Shiva temple. Pearl prayer. Feed rice to poor. Moon-water: leave water in silver vessel under moonlight, drink next morning.',
  Sun: 'Sunday: Red flower at Surya temple. Ruby prayer. Surya Namaskar at sunrise. Feed wheat to poor. Gold donation to worthy cause.',
  Rahu: 'Saturday (Rahu kalam): Blue flower at Durga/Kali temple. Hessonite prayer. Feed shadow-caste or foreigners. Rahu Kavacham recitation.',
  Ketu: 'Tuesday (Ketu kalam): Grey cloth at Ganesha temple. Cat\'s eye prayer. Feed dogs or temple maintenance. Ketu Kavacham recitation.',
};
```

#### Step 6.7: Implement `assembleSixLayerStack`

```typescript
/**
 * LAYER 12 — Six-Layer Behavioral Remedy Stack
 * Diagnostically targeted to the weakest planet in the specific promise chain.
 * NOT generic. Each layer addresses a different dimension of the same deficiency.
 */
export function assembleSixLayerStack(input: RemedyInput): SixLayerRemedyStack {
  const { weakestPlanet, weakestPlanetRupas, nakshatraFear, saturnWound, queryContext } = input;
  
  // Normalize planet name
  const planet = weakestPlanet.charAt(0).toUpperCase() + weakestPlanet.slice(1).toLowerCase();
  
  // Layer 1: Behavioral — concrete daily action
  const behavioralFn = PLANET_BEHAVIORAL_REMEDIES[planet];
  const layer1_behavioral = behavioralFn ? behavioralFn(queryContext) : `Daily practice aligned with ${planet}'s domain. Consult a Jyotishi for planet-specific guidance.`;
  
  // Layer 2: Psychological — inner reframe
  let layer2_psychological: string;
  if (nakshatraFear?.reframe) {
    layer2_psychological = nakshatraFear.reframe;
  } else if (saturnWound && planet === 'Saturn') {
    layer2_psychological = `The wound is not a curse — it is the exact curriculum. ${saturnWound}. Your suffering has a purpose: to build the discipline that success cannot teach.`;
  } else {
    layer2_psychological = `Reframe ${planet}'s challenge as curriculum, not punishment. The planet is not blocking you — it is teaching you what must be learned before the promise can arrive.`;
  }
  
  // Layer 3: Spiritual — mantra
  const mantraData = PLANET_MANTRAS[planet];
  const layer3_spiritual = mantraData
    ? `${mantraData.mantra} — ${mantraData.count} repetitions total (${mantraData.timing}). Mechanism: ${mantraData.mechanism}.`
    : `Consult mantra database for ${planet}-specific bija mantra and count.`;
  
  // Layer 4: Practical — lifestyle
  const layer4_practical = PLANET_PRACTICAL_REMEDIES[planet] || `Lifestyle adjustments aligned with ${planet}'s element and dosha.`;
  
  // Layer 5: Karmic — service
  const layer5_karmic = PLANET_KARMIC_SERVICES[planet] || `Service to others in ${planet}'s domain to discharge planetary debt.`;
  
  // Layer 6: Ritual — ceremonial
  const layer6_ritual = PLANET_RITUAL_REMEDIES[planet] || `Weekday-specific temple offering and donation protocol for ${planet}. Consult panchang for optimal muhurta.`;
  
  // Duration based on weakness severity
  const duration = weakestPlanetRupas < 0.40 ? 'Minimum 6 months sustained, daily practice required' :
                   weakestPlanetRupas < 0.75 ? '3-6 months consistent application' :
                   '40 days minimum with disciplined daily adherence';
  
  const expectedOutcome = weakestPlanetRupas < 0.40 
    ? `With sustained practice, probability increases from low base to moderate. This is a long-term restructuring, not a quick fix. ${planet} requires proof of commitment before releasing its blessings.`
    : `With consistent application, significant improvement in ${queryContext} outcomes within the stated timeframe. ${planet} responds to disciplined effort with disproportionate reward.`;
  
  return {
    planet,
    queryContext,
    layer1_behavioral,
    layer2_psychological,
    layer3_spiritual,
    layer4_practical,
    layer5_karmic,
    layer6_ritual,
    duration,
    expectedOutcome,
  };
}

/**
 * Convenience wrapper used by interpretationEngine.ts
 */
export function assembleSixLayerStackFromStrings(
  weakestPlanet: string,
  nakshatraFearReframe: string,
  saturnWound: string
): SixLayerRemedyStack {
  return assembleSixLayerStack({
    weakestPlanet,
    weakestPlanetRupas: 0.5, // default — caller should override
    nakshatraFear: { coreFear: '', reframe: nakshatraFearReframe },
    saturnWound,
    queryContext: 'general',
  });
}
```

---

## INTEGRATION VERIFICATION CHECKLIST

After implementing all 6 files, verify:

- [ ] `shadabalaService.ts` exports `ShadabalaResult` with `isVargottama`, `isCombust`, `neechaBhangaActive`, `activeModifier`, `baseRupas`, `modifiedRupas`
- [ ] `shadabalaService.ts` `ShadabalaAnalysis` exports `weakestPlanetRupas` and `weakestPlanetBaseRupas`
- [ ] `yogaService.ts` exports `YogaStatus`, `EnhancedYogaResult`, `getEnhancedYogaStatus()`, `enhanceYogaAnalysis()`, `synthesizeYogaCombo()`
- [ ] `dynamicTransitService.ts` exports `DoubleTransitResult`, `DoubleTransitType`, `TransitData`, `checkDoubleTransit()`, domain helpers
- [ ] `jaiminiService.ts` exports `calculateUpapadaLagna()`, `calculateA4()`, `calculateA10()`, `buildArudhaPsychology()`, `ArudhaPsychologyOutput`
- [ ] `jaiminiService.ts` `JaiminiAnalysis` includes `upapadaLagna`, `a4`, `a10`
- [ ] `aiPredictionService.ts` exports `calculateProbability()`, `getShadabalaDrivenVerdict()`, `buildFailureMode()`, `ProbabilityResult`, `FailureModeAnalysis`
- [ ] Hardcoded tables marked `@deprecated` with JSDoc
- [ ] `remediesService.ts` exports `SixLayerRemedyStack`, `RemedyInput`, `assembleSixLayerStack()`, `assembleSixLayerStackFromStrings()`
- [ ] All 6 planet-specific remedy databases populated (behavioral, mantra, practical, karmic, ritual)
- [ ] `interpretationEngine.ts` imports resolve without errors
- [ ] `classicalAnswerEngine.ts` imports resolve without errors
- [ ] Build passes: `npm run build` or `tsc --noEmit`

---

## MANDATORY OUTPUT FORMAT (Verified End-to-End)

After all files are complete, every reading through `runInterpretationEngine()` must emit:

```
1. EXECUTIVE VERDICT (2-3 sentences)
   → Answer the exact question. No hedging. Fame probability upfront if relevant.

2. LAYER-BY-LAYER CONVERGENCE ANALYSIS
   → Each layer labeled. Conflicts identified. All conflicts resolve before proceeding.

3. PSYCHOLOGICAL PROFILE OBJECT
   → Nakshatra fear + Rahu/Ketu karmic + Saturn wound + 3-sentence synthesis

4. VIRGIN WORLD FAME ANALYSIS [fame queries only]
   → Layer 0 score + Layer 13 verdict block

5. FAILURE MODE & PROBABILITIES
   → Obstruction, X%/Y%, single target planet

6. SIX-LAYER REMEDY STACK
   → Diagnostically tied to weakest planet from Layer 10

7. DASHA TIMELINE WITH LEVELS
   → All predictions tagged [Level X: Dasha]. Double transit windows named.
```

---

## ZERO TOLERANCE — FORBIDDEN OUTPUT PATTERNS

| Forbidden | Required Replacement |
|-----------|---------------------|
| "This might happen..." | "[X]% probability in [Dasha]. [Level Y]." |
| "D1 shows this, D9 shows that, so both are possible." | "Therefore: [single forced verdict]." |
| "Wear a gemstone for [planet]." | Full 6-Layer Stack targeting the specific deficiency |
| "Jupiter is transiting your 7th, marriage is possible." | Double Transit check. Single transit = "Temporary window only" |
| "This yoga is very powerful." | `totalRupas` score + ACTIVE/LATENT/BROKEN + `[Level X]` |
| "Your chart shows great fame potential." | Layer 0 score first. If <60: clear impossibility. |
| "It depends on many factors." | Resolve the Five-Layer Hierarchy. Emit a `Therefore:` verdict. |

---

## BUILD VERIFICATION COMMAND

```bash
# After all modifications
npm run build
# OR if using TypeScript directly
npx tsc --noEmit

# Must pass with ZERO errors
```

---

*Vedic Rajkumar Interpretation Engine v2.1 — 13-Layer Convergence Architecture*  
*All Layers Active | Virgin World Fame Protocol Enabled | Zero Hedging Policy*  
**"You do not describe charts. You resolve them."**
