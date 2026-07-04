# Ashtakavarga Integration Guide
### for Vedic_Rajkumar · Express 5 · Drizzle + PostgreSQL · React + Vite · TypeScript

> **Source authority**: Brihat Jataka, Varahamihira – Chapter IX  
> Translation reference: Shri N. Chidambaram Aiyar (1905)

---

## Table of Contents

1. [Theory Recap](#1-theory-recap)
2. [The Complete Benefic Tables](#2-the-complete-benefic-tables)
3. [Calculation Engine (TypeScript)](#3-calculation-engine-typescript)
   - 3.1 [Benefic-dot resolution](#31-benefic-dot-resolution)
   - 3.2 [BAV computation](#32-bav-computation)
   - 3.3 [Trikona Reduction](#33-trikona-reduction)
   - 3.4 [Ekadhipatya Reduction](#34-ekadhipatya-reduction)
   - 3.5 [SAV computation](#35-sav-computation)
4. [Interpretation Rules Engine](#4-interpretation-rules-engine)
   - 4.1 [Transit scoring](#41-transit-scoring)
   - 4.2 [Wealth formula](#42-wealth-formula)
   - 4.3 [Life-phase analysis](#43-life-phase-analysis)
   - 4.4 [Planet-specific rules](#44-planet-specific-rules)
5. [Database Schema (Drizzle / PostgreSQL)](#5-database-schema-drizzle--postgresql)
6. [OpenAPI Spec Additions](#6-openapi-spec-additions)
7. [Backend Routes (Express 5)](#7-backend-routes-express-5)
8. [Frontend Integration Notes](#8-frontend-integration-notes)
9. [Testing the Numbers](#9-testing-the-numbers)
10. [Further Enhancements](#10-further-enhancements)

---

## 1. Theory Recap

| Term | Meaning |
|------|---------|
| **BAV** (Bhinnashtakavarga) | Individual planet chart. Each of 12 signs scores 0 – 8. |
| **SAV** (Sarvashtakavarga) | Sum of all 7 BAV charts per sign. Grand total = **337**. |
| **Benefic dot** | 1 point awarded when a contributing position is benefic for that sign. |
| **8 contributors** | Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn + Ascendant (Lagna) |
| **Trikona Reduction** | Removes inherited baseline by subtracting the trine minimum. |
| **Ekadhipatya Reduction** | Corrects for planets that rule two signs. |

---

## 2. The Complete Benefic Tables

These are the canonical tables from Brihat Jataka. For each planet being scored, the table lists **which houses from each contributor** award a benefic dot.

> **Read as**: "From contributor X, the planet being scored gets a dot when it occupies house Y (counted from contributor X's radical position)."

### Sun's BAV — Benefic Houses from Each Contributor

| Contributor | Benefic Houses (from contributor) |
|-------------|-----------------------------------|
| Sun         | 1, 2, 4, 7, 8, 9, 10, 11         |
| Moon        | 3, 6, 10, 11                      |
| Mars        | 1, 2, 4, 7, 8, 9, 10, 11         |
| Mercury     | 3, 5, 6, 9, 10, 11, 12           |
| Jupiter     | 5, 6, 9, 11                       |
| Venus       | 6, 7, 12                          |
| Saturn      | 1, 2, 4, 7, 8, 9, 10, 11         |
| Lagna       | 1, 2, 4, 7, 8, 9, 10, 11         |

### Moon's BAV

| Contributor | Benefic Houses |
|-------------|----------------|
| Sun         | 3, 6, 7, 8, 10, 11 |
| Moon        | 1, 3, 6, 7, 10, 11 |
| Mars        | 2, 3, 5, 6, 9, 10, 11 |
| Mercury     | 1, 3, 4, 5, 7, 8, 10, 11 |
| Jupiter     | 1, 4, 7, 8, 10, 11, 12 |
| Venus       | 3, 4, 5, 7, 9, 10, 11 |
| Saturn      | 3, 5, 6, 11 |
| Lagna       | 3, 6, 10, 11 |

### Mars's BAV

| Contributor | Benefic Houses |
|-------------|----------------|
| Sun         | 3, 5, 6, 10, 11 |
| Moon        | 3, 6, 11 |
| Mars        | 1, 2, 4, 7, 8, 9, 10, 11 |
| Mercury     | 3, 5, 6, 11 |
| Jupiter     | 6, 10, 11, 12 |
| Venus       | 6, 8, 11, 12 |
| Saturn      | 1, 4, 7, 8, 9, 10, 11 |
| Lagna       | 1, 2, 4, 7, 8, 9, 10, 11 |

### Mercury's BAV

| Contributor | Benefic Houses |
|-------------|----------------|
| Sun         | 5, 6, 9, 11, 12 |
| Moon        | 2, 4, 6, 8, 10, 11 |
| Mars        | 1, 2, 4, 7, 8, 9, 10, 11 |
| Mercury     | 1, 3, 5, 6, 9, 10, 11, 12 |
| Jupiter     | 6, 8, 11, 12 |
| Venus       | 1, 2, 3, 4, 5, 8, 9, 11 |
| Saturn      | 1, 2, 4, 7, 8, 9, 10, 11 |
| Lagna       | 1, 2, 4, 7, 8, 9, 10, 11 |

### Jupiter's BAV

| Contributor | Benefic Houses |
|-------------|----------------|
| Sun         | 1, 2, 3, 4, 7, 8, 9, 10, 11 |
| Moon        | 2, 5, 7, 9, 11 |
| Mars        | 1, 2, 4, 7, 8, 9, 10, 11 |
| Mercury     | 1, 2, 4, 5, 6, 9, 10, 11 |
| Jupiter     | 1, 2, 3, 4, 7, 8, 10, 11 |
| Venus       | 2, 5, 6, 9, 10, 11 |
| Saturn      | 3, 5, 6, 12 |
| Lagna       | 1, 2, 4, 7, 8, 9, 10, 11 |

### Venus's BAV

| Contributor | Benefic Houses |
|-------------|----------------|
| Sun         | 8, 11, 12 |
| Moon        | 1, 2, 3, 4, 5, 8, 9, 11, 12 |
| Mars        | 3, 5, 6, 9, 11, 12 |
| Mercury     | 3, 5, 6, 9, 11 |
| Jupiter     | 5, 8, 9, 10, 11 |
| Venus       | 1, 2, 3, 4, 5, 8, 9, 10, 11 |
| Saturn      | 3, 4, 5, 8, 9, 10, 11 |
| Lagna       | 1, 2, 3, 4, 5, 8, 9, 11 |

### Saturn's BAV

| Contributor | Benefic Houses |
|-------------|----------------|
| Sun         | 1, 2, 4, 7, 8, 9, 10, 11 |
| Moon        | 3, 6, 11 |
| Mars        | 3, 5, 6, 10, 11, 12 |
| Mercury     | 6, 8, 9, 10, 11, 12 |
| Jupiter     | 5, 6, 9, 11 |
| Venus       | 6, 11, 12 |
| Saturn      | 3, 5, 6, 11 |
| Lagna       | 1, 2, 4, 7, 8, 9, 10, 11 |

---

## 3. Calculation Engine (TypeScript)

Place this in `artifacts/api-server/src/lib/ashtakavarga/`.

### 3.1 Benefic-dot Resolution

```typescript
// artifacts/api-server/src/lib/ashtakavarga/tables.ts

export type Planet = "sun" | "moon" | "mars" | "mercury" | "jupiter" | "venus" | "saturn";
export type Contributor = Planet | "lagna";

// Benefic houses (1-indexed) FROM each contributor, FOR each scored planet.
// beneficTables[scoredPlanet][contributor] = Set of house offsets that are benefic
export const beneficTables: Record<Planet, Record<Contributor, readonly number[]>> = {
  sun: {
    sun:     [1, 2, 4, 7, 8, 9, 10, 11],
    moon:    [3, 6, 10, 11],
    mars:    [1, 2, 4, 7, 8, 9, 10, 11],
    mercury: [3, 5, 6, 9, 10, 11, 12],
    jupiter: [5, 6, 9, 11],
    venus:   [6, 7, 12],
    saturn:  [1, 2, 4, 7, 8, 9, 10, 11],
    lagna:   [1, 2, 4, 7, 8, 9, 10, 11],
  },
  moon: {
    sun:     [3, 6, 7, 8, 10, 11],
    moon:    [1, 3, 6, 7, 10, 11],
    mars:    [2, 3, 5, 6, 9, 10, 11],
    mercury: [1, 3, 4, 5, 7, 8, 10, 11],
    jupiter: [1, 4, 7, 8, 10, 11, 12],
    venus:   [3, 4, 5, 7, 9, 10, 11],
    saturn:  [3, 5, 6, 11],
    lagna:   [3, 6, 10, 11],
  },
  mars: {
    sun:     [3, 5, 6, 10, 11],
    moon:    [3, 6, 11],
    mars:    [1, 2, 4, 7, 8, 9, 10, 11],
    mercury: [3, 5, 6, 11],
    jupiter: [6, 10, 11, 12],
    venus:   [6, 8, 11, 12],
    saturn:  [1, 4, 7, 8, 9, 10, 11],
    lagna:   [1, 2, 4, 7, 8, 9, 10, 11],
  },
  mercury: {
    sun:     [5, 6, 9, 11, 12],
    moon:    [2, 4, 6, 8, 10, 11],
    mars:    [1, 2, 4, 7, 8, 9, 10, 11],
    mercury: [1, 3, 5, 6, 9, 10, 11, 12],
    jupiter: [6, 8, 11, 12],
    venus:   [1, 2, 3, 4, 5, 8, 9, 11],
    saturn:  [1, 2, 4, 7, 8, 9, 10, 11],
    lagna:   [1, 2, 4, 7, 8, 9, 10, 11],
  },
  jupiter: {
    sun:     [1, 2, 3, 4, 7, 8, 9, 10, 11],
    moon:    [2, 5, 7, 9, 11],
    mars:    [1, 2, 4, 7, 8, 9, 10, 11],
    mercury: [1, 2, 4, 5, 6, 9, 10, 11],
    jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
    venus:   [2, 5, 6, 9, 10, 11],
    saturn:  [3, 5, 6, 12],
    lagna:   [1, 2, 4, 7, 8, 9, 10, 11],
  },
  venus: {
    sun:     [8, 11, 12],
    moon:    [1, 2, 3, 4, 5, 8, 9, 11, 12],
    mars:    [3, 5, 6, 9, 11, 12],
    mercury: [3, 5, 6, 9, 11],
    jupiter: [5, 8, 9, 10, 11],
    venus:   [1, 2, 3, 4, 5, 8, 9, 10, 11],
    saturn:  [3, 4, 5, 8, 9, 10, 11],
    lagna:   [1, 2, 3, 4, 5, 8, 9, 11],
  },
  saturn: {
    sun:     [1, 2, 4, 7, 8, 9, 10, 11],
    moon:    [3, 6, 11],
    mars:    [3, 5, 6, 10, 11, 12],
    mercury: [6, 8, 9, 10, 11, 12],
    jupiter: [5, 6, 9, 11],
    venus:   [6, 11, 12],
    saturn:  [3, 5, 6, 11],
    lagna:   [1, 2, 4, 7, 8, 9, 10, 11],
  },
};
```

### 3.2 BAV Computation

```typescript
// artifacts/api-server/src/lib/ashtakavarga/compute.ts

import { beneficTables, type Planet, type Contributor } from "./tables";

// Signs 0–11: 0 = Aries, 1 = Taurus, … 11 = Pisces
export type SignIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface NatalPositions {
  sun: SignIndex;
  moon: SignIndex;
  mars: SignIndex;
  mercury: SignIndex;
  jupiter: SignIndex;
  venus: SignIndex;
  saturn: SignIndex;
  lagna: SignIndex; // Ascendant sign
}

/**
 * Returns house number (1-indexed) of `targetSign` counted from `referenceSign`.
 */
function houseFrom(referenceSign: SignIndex, targetSign: SignIndex): number {
  return ((targetSign - referenceSign + 12) % 12) + 1;
}

/**
 * Compute the BAV array (12 scores) for one planet.
 * Each element = benefic dot count for that sign (0–8).
 */
export function computeBAV(
  planet: Planet,
  natal: NatalPositions
): number[] {
  const scores = new Array<number>(12).fill(0);
  const contributors = Object.keys(beneficTables[planet]) as Contributor[];

  for (const contributor of contributors) {
    const contributorSign = contributor === "lagna" ? natal.lagna : natal[contributor as Planet];
    const beneficHouses = new Set(beneficTables[planet][contributor]);

    for (let sign = 0; sign < 12; sign++) {
      const house = houseFrom(contributorSign, sign as SignIndex);
      if (beneficHouses.has(house)) {
        scores[sign]++;
      }
    }
  }

  return scores;
}

/**
 * Compute all 7 planet BAV tables.
 */
export function computeAllBAV(natal: NatalPositions): Record<Planet, number[]> {
  const planets: Planet[] = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"];
  return Object.fromEntries(
    planets.map((p) => [p, computeBAV(p, natal)])
  ) as Record<Planet, number[]>;
}

/**
 * Compute the SAV by summing all BAV tables sign by sign.
 * Total must equal 337.
 */
export function computeSAV(bav: Record<Planet, number[]>): number[] {
  const sav = new Array<number>(12).fill(0);
  for (const scores of Object.values(bav)) {
    for (let i = 0; i < 12; i++) sav[i] += scores[i];
  }
  return sav;
}
```

### 3.3 Trikona Reduction

Trikona (trine) groups:
- Group A: Aries (0), Leo (4), Sagittarius (8)
- Group B: Taurus (1), Virgo (5), Capricorn (9)
- Group C: Gemini (2), Libra (6), Aquarius (10)
- Group D: Cancer (3), Scorpio (7), Pisces (11)

```typescript
// artifacts/api-server/src/lib/ashtakavarga/reductions.ts

const TRIKONA_GROUPS: [number, number, number][] = [
  [0, 4, 8],   // Aries – Leo – Sagittarius
  [1, 5, 9],   // Taurus – Virgo – Capricorn
  [2, 6, 10],  // Gemini – Libra – Aquarius
  [3, 7, 11],  // Cancer – Scorpio – Pisces
];

/**
 * Trikona Shodhana (trine reduction).
 * Within each trine group, subtract the minimum score from all three.
 */
export function trikonaReduction(bav: number[]): number[] {
  const result = [...bav];
  for (const [a, b, c] of TRIKONA_GROUPS) {
    const min = Math.min(result[a], result[b], result[c]);
    result[a] -= min;
    result[b] -= min;
    result[c] -= min;
  }
  return result;
}
```

### 3.4 Ekadhipatya Reduction

Each planet rules two signs (except the luminaries Sun/Moon which each rule one). When both signs of the same ruler are occupied by planets, apply the reduction; when one is empty, no adjustment is needed.

| Planet | Sign 1 | Sign 2 |
|--------|--------|--------|
| Mars   | Aries (0) | Scorpio (7) |
| Venus  | Taurus (1) | Libra (6) |
| Mercury | Gemini (2) | Virgo (5) |
| Moon   | Cancer (3) | — |
| Sun    | Leo (4) | — |
| Jupiter | Sagittarius (8) | Pisces (11) |
| Saturn | Capricorn (9) | Aquarius (10) |

```typescript
// Append to reductions.ts

const EKADHIPATYA_PAIRS: [number, number][] = [
  [0, 7],   // Mars
  [1, 6],   // Venus
  [2, 5],   // Mercury
  [8, 11],  // Jupiter
  [9, 10],  // Saturn
];

/**
 * Ekadhipatya Shodhana (single-lordship reduction).
 * For each pair of signs owned by one planet:
 * - If both signs have a planet occupying them in the natal chart: subtract
 *   the lesser score from both.
 * - If only one sign is occupied: no reduction.
 */
export function ekadhipatyaReduction(
  bav: number[],
  natal: import("./compute").NatalPositions
): number[] {
  const result = [...bav];
  const occupiedSigns = new Set(Object.values(natal));

  for (const [s1, s2] of EKADHIPATYA_PAIRS) {
    const bothOccupied = occupiedSigns.has(s1) && occupiedSigns.has(s2);
    if (bothOccupied) {
      const min = Math.min(result[s1], result[s2]);
      result[s1] -= min;
      result[s2] -= min;
    }
  }
  return result;
}

/**
 * Apply both reductions in canonical order: Trikona first, then Ekadhipatya.
 */
export function applyReductions(
  bav: number[],
  natal: import("./compute").NatalPositions
): number[] {
  return ekadhipatyaReduction(trikonaReduction(bav), natal);
}
```

### 3.5 SAV Computation

```typescript
// artifacts/api-server/src/lib/ashtakavarga/index.ts

export * from "./tables";
export * from "./compute";
export * from "./reductions";

import { computeAllBAV, computeSAV, type NatalPositions, type Planet } from "./compute";
import { applyReductions } from "./reductions";

export interface AshtakavargaResult {
  raw: Record<Planet, number[]>;         // Before reductions
  reduced: Record<Planet, number[]>;     // After both reductions
  sav: number[];                         // SAV from reduced BAVs
  savTotal: number;                      // Should be ≤ 337 (reductions lower raw total)
}

export function computeAshtakavarga(natal: NatalPositions): AshtakavargaResult {
  const raw = computeAllBAV(natal);

  const planets = Object.keys(raw) as Planet[];
  const reduced = Object.fromEntries(
    planets.map((p) => [p, applyReductions(raw[p], natal)])
  ) as Record<Planet, number[]>;

  const sav = computeSAV(reduced);
  const savTotal = sav.reduce((a, b) => a + b, 0);

  return { raw, reduced, sav, savTotal };
}
```

---

## 4. Interpretation Rules Engine

```typescript
// artifacts/api-server/src/lib/ashtakavarga/interpret.ts

import type { AshtakavargaResult } from "./index";
import type { Planet } from "./tables";

export const SIGN_NAMES = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
];
```

### 4.1 Transit Scoring

```typescript
export type TransitVerdict = "excellent" | "good" | "neutral" | "challenging" | "difficult";

const UPACHAYA_HOUSES = new Set([3, 6, 10, 11]);
const APACHAYA_HOUSES = new Set([1, 2, 4, 5, 7, 8, 9, 12]);

/**
 * Predict transit outcome for a planet passing through a sign.
 * Combines SAV score + Upachaya/Apachaya nature of the house from natal.
 */
export function transitVerdict(
  planet: Planet,
  transitSign: number,       // 0–11 sign currently being transited
  natalPlanetSign: number,   // natal position of this planet (for house counting)
  result: AshtakavargaResult
): { score: number; verdict: TransitVerdict; reason: string } {
  const score = result.reduced[planet][transitSign];
  const house = ((transitSign - natalPlanetSign + 12) % 12) + 1;
  const isUpachaya = UPACHAYA_HOUSES.has(house);
  const isApachaya = APACHAYA_HOUSES.has(house);

  let verdict: TransitVerdict;
  let reason: string;

  if (score >= 5 && isUpachaya) {
    verdict = "excellent";
    reason = `High BAV (${score}) in an Upachaya house — full benefic result.`;
  } else if (score >= 4) {
    verdict = "good";
    reason = `Above-average BAV score (${score}) supports positive outcomes.`;
  } else if (score === 3) {
    verdict = "neutral";
    reason = `Average BAV score (${score}). Mixed results expected.`;
  } else if (score <= 2 && isApachaya) {
    verdict = "difficult";
    reason = `Low BAV (${score}) in an Apachaya house — full malefic result.`;
  } else {
    verdict = "challenging";
    reason = `Low BAV score (${score}). Planet struggles in this sign.`;
  }

  return { score, verdict, reason };
}
```

### 4.2 Wealth Formula

```typescript
export interface WealthAnalysis {
  condition1: boolean; // 11th > 10th
  condition2: boolean; // 12th < 11th
  condition3: boolean; // Lagna > 12th
  prosperous: boolean; // All three met
  summary: string;
}

export function analyzeWealth(
  sav: number[],
  lagnaSign: number
): WealthAnalysis {
  const lagnaScore = sav[lagnaSign];
  // Houses are counted from Lagna sign
  const house10Sign = (lagnaSign + 9) % 12;
  const house11Sign = (lagnaSign + 10) % 12;
  const house12Sign = (lagnaSign + 11) % 12;

  const c1 = sav[house11Sign] > sav[house10Sign];
  const c2 = sav[house12Sign] < sav[house11Sign];
  const c3 = lagnaScore > sav[house12Sign];
  const prosperous = c1 && c2 && c3;

  const summary = prosperous
    ? "All three wealth conditions met. The native lives happily and prospers."
    : [
        !c1 && "11th house score does not exceed 10th — gains may not exceed effort.",
        !c2 && "12th house score is not less than 11th — losses may exceed gains.",
        !c3 && "Lagna score does not exceed 12th — wealth protection is weak.",
      ]
        .filter(Boolean)
        .join(" ");

  return { condition1: c1, condition2: c2, condition3: c3, prosperous, summary };
}
```

### 4.3 Life-Phase Analysis

```typescript
export interface LifePhase {
  phase: "early" | "middle" | "late";
  signs: string;
  signIndices: number[];
  total: number;
  maleficPlanets: number; // count of planets with score < threshold in this phase
}

const LIFE_PHASES: Array<{ phase: LifePhase["phase"]; signs: string; indices: number[] }> = [
  { phase: "early",  signs: "Pisces – Gemini",  indices: [11, 0, 1, 2] },
  { phase: "middle", signs: "Cancer – Libra",   indices: [3, 4, 5, 6] },
  { phase: "late",   signs: "Scorpio – Aquarius", indices: [7, 8, 9, 10] },
];

export function analyzeLifePhases(
  sav: number[],
  bavReduced: Record<Planet, number[]>
): { phases: LifePhase[]; happiestPhase: LifePhase["phase"] } {
  const phases = LIFE_PHASES.map(({ phase, signs, indices }) => {
    const total = indices.reduce((sum, i) => sum + sav[i], 0);

    // Count signs in this phase where 3+ malefic planets have low BAV
    let maleficPlanets = 0;
    const planets: Planet[] = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"];
    for (const idx of indices) {
      const lowCount = planets.filter((p) => bavReduced[p][idx] <= 2).length;
      if (lowCount >= 3) maleficPlanets++;
    }

    return { phase, signs, signIndices: indices, total, maleficPlanets };
  });

  const happiestPhase = phases.reduce((a, b) => (a.total > b.total ? a : b)).phase;
  return { phases, happiestPhase };
}
```

### 4.4 Planet-Specific Rules

```typescript
export interface PlanetInsights {
  planet: Planet;
  zeroScoreSigns: string[];     // Signs where score = 0 — avoid during transit
  peakSign: string;             // Sign with highest BAV
  peakScore: number;
  specificInsight: string;      // Varahamihira rule
}

const PLANET_INSIGHTS: Record<Planet, (peak: string, zero: string[]) => string> = {
  sun: (peak, zero) =>
    zero.length > 0
      ? `Avoid starting new ventures when Sun transits ${zero.join(", ")}. Disease and conflict expected.`
      : "Sun's Ashtakavarga is strong across all signs.",
  moon: (peak, zero) =>
    `Optimal activity when Moon transits ${peak}. ` +
    (zero.length > 0 ? `Avoid travel/new starts during Moon in ${zero.join(", ")}.` : ""),
  mars: (peak, zero) =>
    zero.length > 0
      ? `Saturn transiting Mars's zero-score signs (${zero.join(", ")}) may indicate danger or disease.`
      : "Mars positions are well-supported.",
  mercury: (peak, zero) =>
    zero.length > 0
      ? `Saturn in Mercury's zero signs (${zero.join(", ")}) risks loss of close relationships or children.`
      : "Mercury's BAV shows no critical weak zones.",
  jupiter: (peak, _zero) =>
    `Jupiter's score in the 5th house from its position estimates the number of children. Peak fertility zone: ${peak}.`,
  venus: (peak, _zero) =>
    `Venus transiting ${peak} favors marriage, wealth acquisition, and real-estate gains.`,
  saturn: (peak, _zero) =>
    `Cumulative Saturn BAV from Lagna to Saturn, plus return, indicates years of disease. Peak recovery zone: ${peak}.`,
};

export function generatePlanetInsights(
  bavReduced: Record<Planet, number[]>
): PlanetInsights[] {
  const planets: Planet[] = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"];
  return planets.map((planet) => {
    const scores = bavReduced[planet];
    const peakIdx = scores.indexOf(Math.max(...scores));
    const zeroIndices = scores.map((s, i) => (s === 0 ? i : -1)).filter((i) => i >= 0);
    const peakSign = SIGN_NAMES[peakIdx];
    const zeroSigns = zeroIndices.map((i) => SIGN_NAMES[i]);
    return {
      planet,
      zeroScoreSigns: zeroSigns,
      peakSign,
      peakScore: scores[peakIdx],
      specificInsight: PLANET_INSIGHTS[planet](peakSign, zeroSigns),
    };
  });
}
```

---

## 5. Database Schema (Drizzle / PostgreSQL)

Add the following to `lib/db/src/schema/`:

```typescript
// lib/db/src/schema/charts.ts

import {
  pgTable, serial, text, integer, timestamp,
  json, index
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ── Birth charts ──────────────────────────────────────────────────────────────

export const chartsTable = pgTable("charts", {
  id:        serial("id").primaryKey(),
  name:      text("name").notNull(),             // e.g. "Rajkumar"
  birthDate: text("birth_date").notNull(),        // ISO date string
  birthTime: text("birth_time"),                  // HH:MM (optional)
  birthPlace: text("birth_place"),
  // Natal sign indices 0–11
  sunSign:     integer("sun_sign").notNull(),
  moonSign:    integer("moon_sign").notNull(),
  marsSign:    integer("mars_sign").notNull(),
  mercurySign: integer("mercury_sign").notNull(),
  jupiterSign: integer("jupiter_sign").notNull(),
  venusSign:   integer("venus_sign").notNull(),
  saturnSign:  integer("saturn_sign").notNull(),
  lagnaSign:   integer("lagna_sign").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("charts_name_idx").on(t.name)]);

// ── Computed Ashtakavarga results ─────────────────────────────────────────────

export const ashtakavargaTable = pgTable("ashtakavarga", {
  id:        serial("id").primaryKey(),
  chartId:   integer("chart_id").notNull().references(() => chartsTable.id, { onDelete: "cascade" }),
  // BAV arrays stored as JSON arrays of 12 integers
  sunBav:     json("sun_bav").$type<number[]>().notNull(),
  moonBav:    json("moon_bav").$type<number[]>().notNull(),
  marsBav:    json("mars_bav").$type<number[]>().notNull(),
  mercuryBav: json("mercury_bav").$type<number[]>().notNull(),
  jupiterBav: json("jupiter_bav").$type<number[]>().notNull(),
  venusBav:   json("venus_bav").$type<number[]>().notNull(),
  saturnBav:  json("saturn_bav").$type<number[]>().notNull(),
  // Reduced variants
  sunBavReduced:     json("sun_bav_reduced").$type<number[]>().notNull(),
  moonBavReduced:    json("moon_bav_reduced").$type<number[]>().notNull(),
  marsBavReduced:    json("mars_bav_reduced").$type<number[]>().notNull(),
  mercuryBavReduced: json("mercury_bav_reduced").$type<number[]>().notNull(),
  jupiterBavReduced: json("jupiter_bav_reduced").$type<number[]>().notNull(),
  venusBavReduced:   json("venus_bav_reduced").$type<number[]>().notNull(),
  saturnBavReduced:  json("saturn_bav_reduced").$type<number[]>().notNull(),
  sav:       json("sav").$type<number[]>().notNull(),
  savTotal:  integer("sav_total").notNull(),
  computedAt: timestamp("computed_at").defaultNow().notNull(),
}, (t) => [index("ashtak_chart_idx").on(t.chartId)]);

// ── Zod schemas ───────────────────────────────────────────────────────────────

export const insertChartSchema = createInsertSchema(chartsTable).omit({ id: true, createdAt: true });
export type InsertChart = z.infer<typeof insertChartSchema>;
export type Chart = typeof chartsTable.$inferSelect;

export const insertAshtakavargaSchema = createInsertSchema(ashtakavargaTable).omit({ id: true, computedAt: true });
export type InsertAshtakavarga = z.infer<typeof insertAshtakavargaSchema>;
export type Ashtakavarga = typeof ashtakavargaTable.$inferSelect;
```

Export from `lib/db/src/schema/index.ts`:

```typescript
export * from "./charts";
```

Push schema to the database:

```bash
pnpm --filter @workspace/db run push
```

---

## 6. OpenAPI Spec Additions

Append the following to `lib/api-spec/openapi.yaml` under `paths:` and `components/schemas:`.

```yaml
# ── Ashtakavarga paths ────────────────────────────────────────────────────────
  /charts:
    post:
      operationId: createChart
      tags: [charts]
      summary: Create a birth chart
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateChartInput"
      responses:
        "201":
          description: Chart created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ChartWithAshtakavarga"

    get:
      operationId: listCharts
      tags: [charts]
      summary: List all birth charts
      responses:
        "200":
          description: List of charts
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Chart"

  /charts/{id}:
    get:
      operationId: getChart
      tags: [charts]
      summary: Get a chart with its Ashtakavarga
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        "200":
          description: Chart with Ashtakavarga
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ChartWithAshtakavarga"
        "404":
          description: Not found

  /charts/{id}/transit:
    post:
      operationId: analyzeTransit
      tags: [charts]
      summary: Score a planet's transit through a sign
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/TransitInput"
      responses:
        "200":
          description: Transit verdict
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/TransitVerdict"

  /charts/{id}/wealth:
    get:
      operationId: getWealthAnalysis
      tags: [charts]
      summary: Varahamihira wealth formula result
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        "200":
          description: Wealth analysis
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/WealthAnalysis"

  /charts/{id}/life-phases:
    get:
      operationId: getLifePhases
      tags: [charts]
      summary: Life phase happiness analysis
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        "200":
          description: Life phases
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/LifePhasesResult"

# ── Ashtakavarga schemas ──────────────────────────────────────────────────────
# Add these under components/schemas:

    SignScores:
      type: array
      items:
        type: integer
        minimum: 0
        maximum: 8
      minItems: 12
      maxItems: 12

    CreateChartInput:
      type: object
      required:
        - name
        - birthDate
        - sunSign
        - moonSign
        - marsSign
        - mercurySign
        - jupiterSign
        - venusSign
        - saturnSign
        - lagnaSign
      properties:
        name:
          type: string
        birthDate:
          type: string
        birthTime:
          type: string
        birthPlace:
          type: string
        sunSign:
          type: integer
          minimum: 0
          maximum: 11
        moonSign:
          type: integer
          minimum: 0
          maximum: 11
        marsSign:
          type: integer
          minimum: 0
          maximum: 11
        mercurySign:
          type: integer
          minimum: 0
          maximum: 11
        jupiterSign:
          type: integer
          minimum: 0
          maximum: 11
        venusSign:
          type: integer
          minimum: 0
          maximum: 11
        saturnSign:
          type: integer
          minimum: 0
          maximum: 11
        lagnaSign:
          type: integer
          minimum: 0
          maximum: 11

    Chart:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        birthDate:
          type: string
        birthPlace:
          type: string
        lagnaSign:
          type: integer
        createdAt:
          type: string
      required: [id, name, birthDate, lagnaSign, createdAt]

    BAVData:
      type: object
      properties:
        sun:     { $ref: "#/components/schemas/SignScores" }
        moon:    { $ref: "#/components/schemas/SignScores" }
        mars:    { $ref: "#/components/schemas/SignScores" }
        mercury: { $ref: "#/components/schemas/SignScores" }
        jupiter: { $ref: "#/components/schemas/SignScores" }
        venus:   { $ref: "#/components/schemas/SignScores" }
        saturn:  { $ref: "#/components/schemas/SignScores" }
      required: [sun, moon, mars, mercury, jupiter, venus, saturn]

    ChartWithAshtakavarga:
      allOf:
        - $ref: "#/components/schemas/Chart"
        - type: object
          properties:
            ashtakavarga:
              type: object
              properties:
                raw:     { $ref: "#/components/schemas/BAVData" }
                reduced: { $ref: "#/components/schemas/BAVData" }
                sav:     { $ref: "#/components/schemas/SignScores" }
                savTotal:
                  type: integer
              required: [raw, reduced, sav, savTotal]

    TransitInput:
      type: object
      required: [planet, transitSign]
      properties:
        planet:
          type: string
          enum: [sun, moon, mars, mercury, jupiter, venus, saturn]
        transitSign:
          type: integer
          minimum: 0
          maximum: 11

    TransitVerdict:
      type: object
      properties:
        planet:      { type: string }
        transitSign: { type: integer }
        signName:    { type: string }
        score:       { type: integer }
        verdict:
          type: string
          enum: [excellent, good, neutral, challenging, difficult]
        reason:      { type: string }
      required: [planet, transitSign, signName, score, verdict, reason]

    WealthAnalysis:
      type: object
      properties:
        condition1:  { type: boolean }
        condition2:  { type: boolean }
        condition3:  { type: boolean }
        prosperous:  { type: boolean }
        summary:     { type: string }
      required: [condition1, condition2, condition3, prosperous, summary]

    LifePhase:
      type: object
      properties:
        phase:
          type: string
          enum: [early, middle, late]
        signs:       { type: string }
        total:       { type: integer }
        maleficPlanets: { type: integer }
      required: [phase, signs, total, maleficPlanets]

    LifePhasesResult:
      type: object
      properties:
        phases:
          type: array
          items:
            $ref: "#/components/schemas/LifePhase"
        happiestPhase:
          type: string
          enum: [early, middle, late]
      required: [phases, happiestPhase]
```

Regenerate client hooks after updating the spec:

```bash
pnpm --filter @workspace/api-spec run codegen
```

---

## 7. Backend Routes (Express 5)

```typescript
// artifacts/api-server/src/routes/charts.ts

import { Router } from "express";
import { db } from "@workspace/db";
import { chartsTable, ashtakavargaTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import {
  computeAshtakavarga,
  transitVerdict,
  analyzeWealth,
  analyzeLifePhases,
  generatePlanetInsights,
  SIGN_NAMES,
  type Planet,
} from "../lib/ashtakavarga/index";

const router = Router();

// POST /charts — create chart + compute ashtakavarga in one step
router.post("/charts", async (req, res) => {
  const body = req.body;
  const natal = {
    sun:     body.sunSign,
    moon:    body.moonSign,
    mars:    body.marsSign,
    mercury: body.mercurySign,
    jupiter: body.jupiterSign,
    venus:   body.venusSign,
    saturn:  body.saturnSign,
    lagna:   body.lagnaSign,
  };

  const [chart] = await db.insert(chartsTable).values(body).returning();

  const { raw, reduced, sav, savTotal } = computeAshtakavarga(natal);

  await db.insert(ashtakavargaTable).values({
    chartId:           chart.id,
    sunBav:            raw.sun,
    moonBav:           raw.moon,
    marsBav:           raw.mars,
    mercuryBav:        raw.mercury,
    jupiterBav:        raw.jupiter,
    venusBav:          raw.venus,
    saturnBav:         raw.saturn,
    sunBavReduced:     reduced.sun,
    moonBavReduced:    reduced.moon,
    marsBavReduced:    reduced.mars,
    mercuryBavReduced: reduced.mercury,
    jupiterBavReduced: reduced.jupiter,
    venusBavReduced:   reduced.venus,
    saturnBavReduced:  reduced.saturn,
    sav,
    savTotal,
  });

  res.status(201).json({ ...chart, ashtakavarga: { raw, reduced, sav, savTotal } });
});

// GET /charts
router.get("/charts", async (_req, res) => {
  const charts = await db.select().from(chartsTable).orderBy(chartsTable.createdAt);
  res.json(charts);
});

// GET /charts/:id
router.get("/charts/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [chart] = await db.select().from(chartsTable).where(eq(chartsTable.id, id));
  if (!chart) return res.status(404).json({ error: "Chart not found" });

  const [ashtak] = await db.select().from(ashtakavargaTable).where(eq(ashtakavargaTable.chartId, id));

  res.json({
    ...chart,
    ashtakavarga: ashtak
      ? {
          raw: {
            sun: ashtak.sunBav, moon: ashtak.moonBav, mars: ashtak.marsBav,
            mercury: ashtak.mercuryBav, jupiter: ashtak.jupiterBav,
            venus: ashtak.venusBav, saturn: ashtak.saturnBav,
          },
          reduced: {
            sun: ashtak.sunBavReduced, moon: ashtak.moonBavReduced, mars: ashtak.marsBavReduced,
            mercury: ashtak.mercuryBavReduced, jupiter: ashtak.jupiterBavReduced,
            venus: ashtak.venusBavReduced, saturn: ashtak.saturnBavReduced,
          },
          sav: ashtak.sav,
          savTotal: ashtak.savTotal,
        }
      : null,
  });
});

// POST /charts/:id/transit
router.post("/charts/:id/transit", async (req, res) => {
  const id = parseInt(req.params.id);
  const { planet, transitSign } = req.body as { planet: Planet; transitSign: number };

  const [chart] = await db.select().from(chartsTable).where(eq(chartsTable.id, id));
  const [ashtak] = await db.select().from(ashtakavargaTable).where(eq(ashtakavargaTable.chartId, id));
  if (!chart || !ashtak) return res.status(404).json({ error: "Chart not found" });

  const natal = {
    sun: chart.sunSign, moon: chart.moonSign, mars: chart.marsSign,
    mercury: chart.mercurySign, jupiter: chart.jupiterSign,
    venus: chart.venusSign, saturn: chart.saturnSign, lagna: chart.lagnaSign,
  };
  const bavReduced = {
    sun: ashtak.sunBavReduced, moon: ashtak.moonBavReduced, mars: ashtak.marsBavReduced,
    mercury: ashtak.mercuryBavReduced, jupiter: ashtak.jupiterBavReduced,
    venus: ashtak.venusBavReduced, saturn: ashtak.saturnBavReduced,
  };

  const result = transitVerdict(
    planet,
    transitSign,
    natal[planet as keyof typeof natal] as number,
    { raw: {} as any, reduced: bavReduced as any, sav: ashtak.sav as number[], savTotal: ashtak.savTotal }
  );

  res.json({ planet, transitSign, signName: SIGN_NAMES[transitSign], ...result });
});

// GET /charts/:id/wealth
router.get("/charts/:id/wealth", async (req, res) => {
  const id = parseInt(req.params.id);
  const [chart] = await db.select().from(chartsTable).where(eq(chartsTable.id, id));
  const [ashtak] = await db.select().from(ashtakavargaTable).where(eq(ashtakavargaTable.chartId, id));
  if (!chart || !ashtak) return res.status(404).json({ error: "Chart not found" });

  const analysis = analyzeWealth(ashtak.sav as number[], chart.lagnaSign);
  res.json(analysis);
});

// GET /charts/:id/life-phases
router.get("/charts/:id/life-phases", async (req, res) => {
  const id = parseInt(req.params.id);
  const [chart] = await db.select().from(chartsTable).where(eq(chartsTable.id, id));
  const [ashtak] = await db.select().from(ashtakavargaTable).where(eq(ashtakavargaTable.chartId, id));
  if (!chart || !ashtak) return res.status(404).json({ error: "Chart not found" });

  const bavReduced = {
    sun: ashtak.sunBavReduced, moon: ashtak.moonBavReduced, mars: ashtak.marsBavReduced,
    mercury: ashtak.mercuryBavReduced, jupiter: ashtak.jupiterBavReduced,
    venus: ashtak.venusBavReduced, saturn: ashtak.saturnBavReduced,
  };
  const result = analyzeLifePhases(ashtak.sav as number[], bavReduced as any);
  res.json(result);
});

export default router;
```

Register in `artifacts/api-server/src/routes/index.ts`:

```typescript
import chartsRouter from "./charts";
router.use(chartsRouter);
```

---

## 8. Frontend Integration Notes

After running codegen, you'll have hooks such as:

```typescript
import {
  useCreateChart,
  useListCharts,
  useGetChart,
  useAnalyzeTransit,
  useGetWealthAnalysis,
  useGetLifePhases,
} from "@workspace/api-client-react";
```

### Suggested Pages

| Route | Purpose |
|-------|---------|
| `/` | Dashboard — list of saved charts with SAV totals |
| `/charts/new` | Birth data entry form (8 sign selectors + birth details) |
| `/charts/:id` | Full chart view with BAV grids, SAV bar chart, and insights |
| `/charts/:id/transit` | Transit tool — select planet + current sign → verdict |
| `/charts/:id/wealth` | Wealth formula result card |
| `/charts/:id/life-phases` | Life phase timeline with phase totals |

### BAV Grid Component Hint

Render a 7-row × 12-column grid where:
- Each **row** = one planet's BAV (reduced)
- Each **column** = one zodiac sign
- Color-code by score: `≥6` deep green → `4–5` light green → `3` amber → `≤2` red
- Hover tooltip shows the SAV score for that sign

### SAV Threshold Color Guide

| SAV Score | Display |
|-----------|---------|
| ≥ 30 | 🟢 Strongly benefic |
| 25 – 29 | 🟡 Neutral |
| < 25 | 🔴 Challenging |

---

## 9. Testing the Numbers

Use this reference birth chart to verify your engine:

**Test input** (signs are 0-indexed):  
Sun = Aries (0), Moon = Cancer (3), Mars = Scorpio (7), Mercury = Taurus (1),  
Jupiter = Sagittarius (8), Venus = Pisces (11), Saturn = Capricorn (9), Lagna = Leo (4)

**Expected raw SAV total**: 337 (before reductions)

Run this quick assertion in your test file:

```typescript
import { computeAllBAV, computeSAV } from "./lib/ashtakavarga/compute";

const natal = { sun:0, moon:3, mars:7, mercury:1, jupiter:8, venus:11, saturn:9, lagna:4 };
const raw = computeAllBAV(natal);
const sav = computeSAV(raw);
const total = sav.reduce((a, b) => a + b, 0);
console.assert(total === 337, `SAV total should be 337, got ${total}`);
```

If total ≠ 337, cross-check each planet's raw BAV sum against known constants:

| Planet | Expected Raw BAV Sum |
|--------|----------------------|
| Sun    | 48 |
| Moon   | 49 |
| Mars   | 39 |
| Mercury | 54 |
| Jupiter | 56 |
| Venus  | 52 |
| Saturn | 39 |
| **Total** | **337** |

---

## 10. Complete Live API Reference

All endpoints are live under `/api`. Charts must first be created via `POST /api/charts`.

### Ephemeris

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/ephemeris/now` | All 9 planets — live sidereal (Lahiri) positions |
| `GET` | `/api/ephemeris/now/:planet` | Single planet live position |
| `GET` | `/api/ephemeris/at?date=YYYY-MM-DD` | All planets at any historical/future date |
| `POST` | `/api/ephemeris/kakshya-live` | Kakshya windows for a planet with ad-hoc natal positions |
| `GET` | `/api/ephemeris/panchang?date=YYYY-MM-DD` | **Panchang** — Tithi, Vara, Nakshatra, Yoga, Karana for any date |

### Chart Management

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/charts` | Create chart + auto-compute full BAV/SAV/reductions |
| `GET` | `/api/charts` | List all charts |
| `GET` | `/api/charts/:id` | Chart + stored Ashtakavarga |

### Ashtakavarga Analysis

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/charts/:id/insights` | Wealth, life phases, per-planet BAV insights |
| `GET` | `/api/charts/:id/wealth` | Three-condition wealth check (11th > 10th > 12th < Lagna) |
| `GET` | `/api/charts/:id/life-phases` | Early / middle / late life SAV scoring |
| `POST` | `/api/charts/:id/transit` | BAV verdict for a specific planet + transit sign |
| `GET` | `/api/charts/:id/sav-analysis` | **SAV classical thresholds**, wealth, longevity estimate, all 12 signs |

### Vimshottari Dasha

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/charts/:id/dasha-tree?maxLevel=&fromDate=&toDate=` | Full 5-level dasha tree with BAV power scores |
| `GET` | `/api/charts/:id/active-dasha?date=` | Active dasha hierarchy + CDS + live MD lord transit |
| `GET` | `/api/charts/:id/micro-dasha?date=` | **Sookshma (L4) + Prana (L5)** dasha with FES summary |
| `POST` | `/api/charts/:id/forecast` | Forecast windows (L3 scan) for chosen event types + date range |
| `GET` | `/api/charts/:id/dasha-transit-matrix?date=` | CDS + all-planet transit BAV matrix + FES per event |

### Kakshya Micro-Timing

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/charts/:id/kakshya` | All 8 Kakshya windows for a planet (current, upcoming, past) |

### Transit & Classical Rules

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/charts/:id/gochara?date=` | **Full Gochara** — all planets: BAV + SAV + house from Moon + classical verdict |
| `GET` | `/api/charts/:id/tara-bala?date=` | **Tara Bala + Chandra Bala** for all transiting planets |

### Comprehensive Reports

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/charts/:id/report?date=` | **Full Vedic report** — Panchang + Dasha + Gochara + Tara + SAV + FES + wealth, all in one call |
| `GET` | `/api/charts/:id/sade-sati?date=` | **Sade Sati tracker** — phase (rising/peak/setting), severity per phase via Saturn BAV, Kantaka Shani, Ashtama Shani, timing estimate |

---

## 11. Panchang Details

**Tithi** — lunar day: `(Moon° − Sun°) / 12`, mod 30. Shukla (1–15) or Krishna (16–30) paksha.

**Vara** — weekday lord: Sun=Sunday … Saturn=Saturday.

**Nakshatra** — Moon's position: `floor(Moon° / 13.333)`, gives 1 of 27 stars.

**Yoga** — `floor((Sun° + Moon°) / 13.333)` mod 27. Auspicious: Priti, Saubhagya, Vriddhi, Siddhi, Shubha etc. Inauspicious: Vishkambha, Atiganda, Shula, Vajra, Vyatipata, Vaidhriti.

**Karana** — half-tithi. 7 repeating (Bava → Vishti/Bhadra) + 4 fixed. Vishti (Bhadra) is the inauspicious Karana to avoid.

---

## 12. Tara Bala & Chandra Bala

**Tara Bala** — count from natal Moon nakshatra to transit nakshatra, cycle in 9s:

| Tara | Number | Nature | Meaning |
|------|--------|--------|---------|
| Janma | 1,10,19 | Bad | Health difficulties |
| Sampat | 2,11,20 | Good | Wealth |
| Vipat | 3,12,21 | Bad | Danger |
| Kshema | 4,13,22 | Good | Wellbeing |
| Pratyak | 5,14,23 | Bad | Obstruction |
| Sadhaka | 6,15,24 | Good | Achievement |
| Vadha | 7,16,25 | Bad | Loss/death-like |
| Mitra | 8,17,26 | Good | Friendship |
| Ati Mitra | 9,18,27 | Very Good | Great support |

**Chandra Bala** — Moon's reduced BAV score in its current transit sign. Score ≥ 4 = adequate; avoid major decisions below 4.

---

## 13. Further Enhancements

| Feature | Description |
|---------|-------------|
| **Ashtakavarga Prastar** | Visual 12×8 dot grid as traditionally drawn on paper charts |
| **Sade Sati Tracker** | ✅ **Live** — `GET /api/charts/:id/sade-sati` — full phase scoring (rising/peak/setting), Kantaka Shani, Ashtama Shani, BAV severity, start-year estimate |
| **Yoga Detection** | Cross-reference high BAV signs with Raj Yoga and Dhana Yoga placements |
| **PDF Export** | One-page Ashtakavarga report: BAV grid + SAV bar + wealth + life phases |
| **Rectification tool** | Vary Lagna sign ±2 signs and show how SAV totals shift — assists birth-time rectification |
| **Sade Sati API** | `/api/charts/:id/sade-sati` — Saturn 7.5-year period severity scoring |

---

*Guide authored for the Vedic_Rajkumar project — June 2026.*  
*Canonical source: Brihat Jataka, Varahamihira (Chapter IX), translated by N. Chidambaram Aiyar (1905).*
