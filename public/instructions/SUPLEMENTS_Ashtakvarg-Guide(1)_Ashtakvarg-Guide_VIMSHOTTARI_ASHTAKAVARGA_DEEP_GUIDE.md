# Ashtakavarga × Vimshottari Dasha — Deep Integration Guide
### Forecast from Maha Dasha down to Prana Dasha (micro-level) · TypeScript · Vedic_Rajkumar

> **Principle**: Vimshottari Dasha tells you WHOSE turn it is to speak.  
> Ashtakavarga tells you HOW LOUD that voice will be.  
> Together they tell you EXACTLY WHEN and HOW MUCH.

---

## Table of Contents

1. [Two Systems, One Unified Model](#1-two-systems-one-unified-model)
2. [Vimshottari Dasha — Complete Reference](#2-vimshottari-dasha--complete-reference)
   - 2.1 [The 120-year cycle](#21-the-120-year-cycle)
   - 2.2 [Five levels of sub-division](#22-five-levels-of-sub-division)
   - 2.3 [Duration formulas](#23-duration-formulas)
   - 2.4 [Starting dasha from Moon nakshatra](#24-starting-dasha-from-moon-nakshatra)
3. [The BAV Power Score — What It Means at Each Level](#3-the-bav-power-score--what-it-means-at-each-level)
   - 3.1 [Maha Dasha lord power (L1)](#31-maha-dasha-lord-power-l1)
   - 3.2 [Antardasha lord power (L2)](#32-antardasha-lord-power-l2)
   - 3.3 [Pratyantardasha lord power (L3)](#33-pratyantardasha-lord-power-l3)
   - 3.4 [Sookshma Dasha lord power (L4)](#34-sookshma-dasha-lord-power-l4)
   - 3.5 [Prana Dasha lord power (L5)](#35-prana-dasha-lord-power-l5)
4. [The Confluence Formula — Event Prediction](#4-the-confluence-formula--event-prediction)
   - 4.1 [The Trident rule](#41-the-trident-rule)
   - 4.2 [Composite Dasha Score (CDS)](#42-composite-dasha-score-cds)
   - 4.3 [Transit overlay (Gochara BAV)](#43-transit-overlay-gochara-bav)
   - 4.4 [SAV house activation](#44-sav-house-activation)
   - 4.5 [Full Event Score (FES)](#45-full-event-score-fes)
5. [Kakshya — Micro-Transit Within a Sign](#5-kakshya--micro-transit-within-a-sign)
   - 5.1 [The 8 Kakshyas per sign](#51-the-8-kakshyas-per-sign)
   - 5.2 [Kakshya lord benefic check](#52-kakshya-lord-benefic-check)
   - 5.3 [Degree-precise transit timing](#53-degree-precise-transit-timing)
6. [TypeScript Implementation](#6-typescript-implementation)
   - 6.1 [Nakshatra & Dasha seed](#61-nakshatra--dasha-seed)
   - 6.2 [Dasha period tree builder](#62-dasha-period-tree-builder)
   - 6.3 [BAV Power Score per level](#63-bav-power-score-per-level)
   - 6.4 [Composite Dasha Score (CDS) engine](#64-composite-dasha-score-cds-engine)
   - 6.5 [Kakshya micro-timer](#65-kakshya-micro-timer)
   - 6.6 [Full Event Score (FES) engine](#66-full-event-score-fes-engine)
   - 6.7 [Forecast timeline generator](#67-forecast-timeline-generator)
7. [Database Schema Additions](#7-database-schema-additions)
8. [API Endpoints](#8-api-endpoints)
9. [Interpretation Reference Tables](#9-interpretation-reference-tables)
   - 9.1 [What each Maha Dasha activates](#91-what-each-maha-dasha-activates)
   - 9.2 [BAV score interpretation per level](#92-bav-score-interpretation-per-level)
   - 9.3 [FES event thresholds](#93-fes-event-thresholds)
10. [Worked Example — Step by Step](#10-worked-example--step-by-step)
11. [Frontend Visualization Guide](#11-frontend-visualization-guide)

---

## 1. Two Systems, One Unified Model

### Why neither system is complete alone

| Vimshottari alone | Ashtakavarga alone |
|-------------------|--------------------|
| Tells you it is "Jupiter Maha Dasha" | Tells you Jupiter has 6 points in Scorpio |
| Cannot say if Jupiter will deliver its promise | Cannot say when Jupiter's promise activates |
| Gives a 16-year window — too broad | Gives a static map — no timing |

**Together**: Jupiter Maha Dasha + Jupiter's BAV score of 6 in Scorpio + Jupiter currently transiting Scorpio = Jupiter IS delivering results, strongly, RIGHT NOW.

### The layered activation model

```
Level 1 — Maha Dasha lord     → Sets the theme of the era (years)
Level 2 — Antardasha lord     → Opens a specific chapter (months)
Level 3 — Pratyantardasha     → Selects the paragraph (weeks)
Level 4 — Sookshma Dasha      → Points to the sentence (days)
Level 5 — Prana Dasha         → Marks the exact moment (hours)
Kakshya — 3°45' transit slice → Pinpoints the trigger degree (minutes if known)
```

At every level, the **Ashtakavarga score of that period lord in its natal sign** acts as the amplitude dial — how loudly it can speak when its turn arrives.

---

## 2. Vimshottari Dasha — Complete Reference

### 2.1 The 120-year cycle

| # | Planet | Period (years) | Nakshatra ownership |
|---|--------|---------------|---------------------|
| 1 | Ketu    |  7 | Ashwini, Magha, Mula |
| 2 | Venus   | 20 | Bharani, Purva Phalguni, Purva Ashadha |
| 3 | Sun     |  6 | Krittika, Uttara Phalguni, Uttara Ashadha |
| 4 | Moon    | 10 | Rohini, Hasta, Shravana |
| 5 | Mars    |  7 | Mrigashira, Chitra, Dhanishta |
| 6 | Rahu    | 18 | Ardra, Swati, Shatabhisha |
| 7 | Jupiter | 16 | Punarvasu, Vishakha, Purva Bhadrapada |
| 8 | Saturn  | 19 | Pushya, Anuradha, Uttara Bhadrapada |
| 9 | Mercury | 17 | Ashlesha, Jyeshtha, Revati |

The sequence **always** runs in this order, cycling back to Ketu after Mercury.

### 2.2 Five levels of sub-division

Each level subdivides the parent period using the **same planetary sequence**, starting from the current period lord, in the Vimshottari order.

| Level | Name | Traditional term | Typical span |
|-------|------|-----------------|--------------|
| 1 | Maha Dasha | Dasha | 6 – 20 years |
| 2 | Antardasha | Bhukti | Months – 3 years |
| 3 | Pratyantardasha | Antara | Weeks – months |
| 4 | Sookshma Dasha | Sookshma | Days – weeks |
| 5 | Prana Dasha | Prana | Hours – days |

### 2.3 Duration formulas

Let **Y(P)** = Vimshottari years of planet P.

```
Maha Dasha P               = Y(P) years

Antardasha Q in P          = Y(P) × Y(Q) / 120   years
                           = Y(P) × Y(Q) × 3      months (÷ 120 × 12)

Pratyantardasha R in Q|P   = Y(P) × Y(Q) × Y(R) / 120²  years
                           = Y(P) × Y(Q) × Y(R) × 3.6    days (÷ 120² × 365.25)

Sookshma S in R|Q|P        = Y(P)×Y(Q)×Y(R)×Y(S) / 120³  years

Prana T in S|R|Q|P         = Y(P)×Y(Q)×Y(R)×Y(S)×Y(T) / 120⁴  years
```

**Example — Jupiter MD, Saturn AD, Mercury PD:**
- Jupiter MD = 16 years
- Saturn AD in Jupiter MD = 16 × 19 / 120 = **2.533 years (≈ 2y 6m 12d)**
- Mercury PD in Saturn AD = 16 × 19 × 17 / 120² = **0.3589 years (≈ 131 days)**

### 2.4 Starting Dasha from Moon Nakshatra

At birth, the balance of the Maha Dasha lord is determined by how far the Moon has traveled through its birth nakshatra (each nakshatra = 13°20').

```
Balance fraction = (nakshatra_end_longitude - moon_longitude) / 13.3333°
Balance years = fraction × Y(birth_dasha_lord)
```

The first period in the chart runs for `Balance years`, then the full sequence begins.

---

## 3. The BAV Power Score — What It Means at Each Level

The core idea: **the BAV score of each period lord in its natal sign = how much power it has to deliver results during its period.**

### 3.1 Maha Dasha lord power (L1)

```
L1 = bavReduced[MahaDashaLord][natalSign_of_MahaDashaLord]
```

| L1 | Era quality |
|----|-------------|
| 6 – 8 | Transformative, highly eventful Maha Dasha |
| 4 – 5 | Productive with some struggle |
| 3 | Mixed — promise partially fulfilled |
| 1 – 2 | Dasha lord struggles; themes blocked despite timing |
| 0 | Planet is silenced; Maha Dasha delivers almost nothing |

**Additional check**: Also look at the SAV score of the house that the Maha Dasha lord rules. If it rules the 7th (marriage house) and the 7th has SAV ≥ 30, marriage events are strongly promised during this Maha Dasha.

### 3.2 Antardasha lord power (L2)

```
L2 = bavReduced[AntarDashaLord][natalSign_of_AntarDashaLord]
```

The Antardasha lord opens a sub-chapter. L2 governs how readily the chapter unfolds:

- **Both L1 ≥ 4 AND L2 ≥ 4** → Sub-period delivers results matching both lords' significations
- **L1 high, L2 low** → Maha Dasha promise is blocked during this sub-period; frustration
- **L1 low, L2 high** → The sub-period temporarily overrides the Maha Dasha limitations — surprise events

**Relationship factor**: Additionally, check if the Antardasha lord's natal sign has a high SAV score. The higher the SAV of the Antardasha lord's natal sign, the more ambient support exists.

### 3.3 Pratyantardasha lord power (L3)

```
L3 = bavReduced[PratyantarLord][natalSign_of_PratyantarLord]
```

This is the **event trigger level**. When all three of L1, L2, L3 are high simultaneously, major life events occur. When L3 is low even with L1 and L2 high, the event is delayed to the next Pratyantardasha.

**Classic rule**: Lal Kitab and traditional texts say: *"The Pratyantardasha lord acts as the finger that presses the button that L1 and L2 built."*

### 3.4 Sookshma Dasha lord power (L4)

```
L4 = bavReduced[SookshmaDashaLord][natalSign_of_SookshmaDashaLord]
```

L4 operates over days to weeks. At this level Ashtakavarga is cross-referenced with:
- The **current transit** of the Sookshma lord through signs
- The **BAV score of the transit sign** for the Sookshma lord

If the Sookshma lord is currently transiting a sign where its BAV score is ≥ 5, AND L4 is itself ≥ 4, the specific event can be pin-pointed to that Sookshma period.

### 3.5 Prana Dasha lord power (L5)

```
L5 = bavReduced[PranaDashaLord][natalSign_of_PranaDashaLord]
```

Prana Dasha operates over hours to days. At this level:
- Use **Kakshya** (3°45' sub-division) of the Moon's current transit position
- The Kakshya lord for the Moon's position — if it gave a benefic dot in the Moon's BAV — confirms the exact time window

This is the finest usable level for event timing without the need for precise birth-time down to the second.

---

## 4. The Confluence Formula — Event Prediction

### 4.1 The Trident Rule

An event **manifests** when three streams converge simultaneously:

```
Stream 1 (DASHA)   : The period lord hierarchy (L1 → L5) all have high BAV scores
Stream 2 (TRANSIT) : The Maha Dasha lord is currently transiting a sign with high BAV
Stream 3 (HOUSE)   : The SAV score of the house being activated is ≥ 30
```

Any two streams = strong possibility. All three = near-certainty.

### 4.2 Composite Dasha Score (CDS)

The **CDS** measures the combined strength of the active dasha hierarchy at any moment:

```
CDS = (L1 × w1) + (L2 × w2) + (L3 × w3) + (L4 × w4) + (L5 × w5)
      ─────────────────────────────────────────────────────────────
                    w1 + w2 + w3 + w4 + w5

Weights (reflecting decreasing dominance by level):
  w1 = 5 (Maha Dasha — dominant)
  w2 = 4
  w3 = 3
  w4 = 2
  w5 = 1

Max CDS = 8.0 (all lords score 8)
```

| CDS | Period quality |
|-----|---------------|
| 6.0 – 8.0 | Exceptional — major life events expected |
| 4.5 – 5.9 | Strong — significant developments |
| 3.0 – 4.4 | Moderate — steady progress, some events |
| 1.5 – 2.9 | Weak — effort without proportional reward |
| 0 – 1.4   | Suppressed — difficult, blocked period |

### 4.3 Transit Overlay (Gochara BAV)

For any moment, determine where the **Maha Dasha lord** is currently transiting. Look up its BAV score in that transit sign (from the **reduced BAV table**).

```
TransitScore = bavReduced[MahaDashaLord][currentTransitSign_of_MahaDashaLord]
```

This score amplifies or dampens the CDS:

| TransitScore | Effect |
|-------------|--------|
| 6 – 8 | Transit fully activates the Dasha promise |
| 4 – 5 | Partial activation |
| 2 – 3 | Transit suppresses even a strong Dasha |
| 0 – 1 | Planet is mute during this transit — events stall |

**Also check the Antardasha lord's current transit.** When both the Maha and Antardasha lords are simultaneously transiting high-BAV signs, the sub-period is at peak power.

### 4.4 SAV House Activation

Identify which house the **active signification** falls in for the predicted event type:

| Event type | House to check SAV |
|-----------|-------------------|
| Career change | 10th from Lagna |
| Marriage | 7th from Lagna |
| Child birth | 5th from Lagna |
| Foreign travel | 12th and 9th |
| Property gain | 4th |
| Inheritance/windfall | 8th and 11th |
| Health crisis | 6th and 8th |
| Father | 9th |
| Mother | 4th |

```
HouseActivation = sav[houseIndex]     // SAV score of the relevant house

HouseMultiplier:
  ≥ 30 → 1.5  (strongly benefic)
  25-29 → 1.0
  20-24 → 0.75
  < 20  → 0.5
```

### 4.5 Full Event Score (FES)

```
FES = CDS × HouseMultiplier × (1 + TransitBonus)

TransitBonus:
  If Maha lord transiting upachaya house (3,6,10,11) AND TransitScore ≥ 5:
    TransitBonus = 0.5
  Else if TransitScore ≥ 4:
    TransitBonus = 0.25
  Else if TransitScore ≤ 2:
    TransitBonus = -0.3   (suppression)
  Else:
    TransitBonus = 0

FES range: 0 – ~18 (theoretical maximum with all multipliers)
```

| FES | Prediction |
|-----|-----------|
| ≥ 12 | Major life event — near certainty |
| 8 – 11.9 | Significant event — very likely |
| 5 – 7.9 | Moderate event — probable |
| 3 – 4.9 | Minor development — possible |
| < 3 | Quiet period |

---

## 5. Kakshya — Micro-Transit Within a Sign

### 5.1 The 8 Kakshyas per sign

Each of the 12 signs spans 30°. Divided into 8 equal parts of **3°45' each**. Each Kakshya is ruled by one of the 8 contributors, in a fixed sequence from the beginning of the sign:

| Kakshya # | Degrees within sign | Lord |
|-----------|--------------------|----|
| 1 | 0°00' – 3°45' | Saturn |
| 2 | 3°45' – 7°30' | Jupiter |
| 3 | 7°30' – 11°15' | Mars |
| 4 | 11°15' – 15°00' | Sun |
| 5 | 15°00' – 18°45' | Venus |
| 6 | 18°45' – 22°30' | Mercury |
| 7 | 22°30' – 26°15' | Moon |
| 8 | 26°15' – 30°00' | Lagna (Ascendant) |

### 5.2 Kakshya lord benefic check

A transiting planet **triggers a benefic result** when it enters a Kakshya whose lord contributed a benefic dot (in the BAV table) for the transiting planet in that sign.

```
isBeneficKakshya(transitPlanet, sign, degreeInSign):
  kakshyaIndex = floor(degreeInSign / 3.75)   // 0–7
  kakshyaLord  = KAKSHYA_LORDS[kakshyaIndex]  // Saturn→Jupiter→Mars→Sun→Venus→Mercury→Moon→Lagna

  // Was kakshyaLord a benefic contributor for transitPlanet in this sign?
  houseFromKakshyaLord = ((sign - natal[kakshyaLord] + 12) % 12) + 1
  return beneficTables[transitPlanet][kakshyaLord].includes(houseFromKakshyaLord)
```

**Practical use**: A planet entering a sign with a moderate BAV (say, 4) will deliver results only during the 4 Kakshyas whose lords were benefic. The other 4 Kakshyas are inert or harmful. This lets you narrow down active windows to specific **3°45' transit spans** — which for slow planets like Saturn translates to **precise weeks**.

### 5.3 Degree-precise transit timing

Given a planet's current longitude (degrees) and daily motion:

```
Days to enter Kakshya K = (startDegreeOfK - currentDegree) / dailyMotion
Days to exit  Kakshya K = (endDegreeOfK   - currentDegree) / dailyMotion
```

**Example — Saturn transiting Scorpio (sign index 7), currently at 12°:**
- Saturn is in Kakshya 4 (11°15' – 15°) — lord: **Sun**
- Check: is Sun a benefic contributor for Saturn in Scorpio?
  - From Sun's natal sign, count house to Scorpio → if that house is in Saturn's BAV benefic list from Sun, then YES → this is a **benefic Kakshya** → expect Saturn's significations to deliver now
- Saturn moves ~1° every 30 days → exits this Kakshya in ~(15.0 – 12.0) / (1/30) = 90 days

This gives a **90-day active window** at Kakshya precision.

---

## 6. TypeScript Implementation

### 6.1 Nakshatra & Dasha Seed

```typescript
// lib/vimshottari/src/constants.ts

export type VimshottariPlanet =
  | "ketu" | "venus" | "sun" | "moon" | "mars"
  | "rahu" | "jupiter" | "saturn" | "mercury";

// Order of the Vimshottari sequence
export const VIMSHOTTARI_ORDER: VimshottariPlanet[] = [
  "ketu","venus","sun","moon","mars","rahu","jupiter","saturn","mercury"
];

// Maha Dasha years for each planet
export const DASHA_YEARS: Record<VimshottariPlanet, number> = {
  ketu: 7, venus: 20, sun: 6, moon: 10, mars: 7,
  rahu: 18, jupiter: 16, saturn: 19, mercury: 17,
};

// Nakshatra lords in order (27 nakshatras, repeat VIMSHOTTARI_ORDER × 3)
export const NAKSHATRA_LORDS: VimshottariPlanet[] = Array.from(
  { length: 27 },
  (_, i) => VIMSHOTTARI_ORDER[i % 9]
);

// Nakshatra span in degrees
export const NAKSHATRA_SPAN = 360 / 27; // 13.3333...°

/**
 * Given Moon's longitude (0–360°), return:
 * - birthDashaLord: planet ruling the nakshatra
 * - balanceYears: remaining years of that dasha at birth
 */
export function getDashaSeed(moonLongitude: number): {
  birthDashaLord: VimshottariPlanet;
  balanceYears: number;
} {
  const nakshatraIndex = Math.floor(moonLongitude / NAKSHATRA_SPAN);
  const birthDashaLord = NAKSHATRA_LORDS[nakshatraIndex];
  const positionInNakshatra = moonLongitude % NAKSHATRA_SPAN;
  const fractionRemaining = 1 - positionInNakshatra / NAKSHATRA_SPAN;
  const balanceYears = fractionRemaining * DASHA_YEARS[birthDashaLord];
  return { birthDashaLord, balanceYears };
}
```

### 6.2 Dasha Period Tree Builder

```typescript
// lib/vimshottari/src/periods.ts

import {
  VIMSHOTTARI_ORDER, DASHA_YEARS, getDashaSeed,
  type VimshottariPlanet
} from "./constants";

export interface DashaPeriod {
  level: 1 | 2 | 3 | 4 | 5;
  lord: VimshottariPlanet;
  startDate: Date;
  endDate: Date;
  durationDays: number;
  children?: DashaPeriod[];
}

const DAYS_PER_YEAR = 365.25;
const TOTAL_YEARS = 120;

/**
 * Duration in days for a specific dasha path.
 * lords = [maha, antar, pratyantar, sookshma, prana]
 */
export function dashaLevelDuration(lords: VimshottariPlanet[]): number {
  const denominator = Math.pow(TOTAL_YEARS, lords.length - 1);
  const numerator = lords.reduce((prod, l) => prod * DASHA_YEARS[l], 1);
  return (numerator / denominator) * DAYS_PER_YEAR;
}

/**
 * Get the Vimshottari sequence starting from a given planet.
 */
function sequenceFrom(start: VimshottariPlanet): VimshottariPlanet[] {
  const idx = VIMSHOTTARI_ORDER.indexOf(start);
  return [
    ...VIMSHOTTARI_ORDER.slice(idx),
    ...VIMSHOTTARI_ORDER.slice(0, idx),
  ];
}

/**
 * Build the full Dasha tree from birth date + Moon longitude, up to maxLevel.
 * maxLevel: 1 = Maha only, 2 = +Antar, ... 5 = all levels
 */
export function buildDashaTree(
  birthDate: Date,
  moonLongitude: number,
  maxLevel: 1 | 2 | 3 | 4 | 5 = 3
): DashaPeriod[] {
  const { birthDashaLord, balanceYears } = getDashaSeed(moonLongitude);
  const sequence = sequenceFrom(birthDashaLord);

  const mahaRanges: DashaPeriod[] = [];
  let cursor = new Date(birthDate);

  // First Maha Dasha is partial (balance only)
  for (let i = 0; i < sequence.length; i++) {
    const lord = sequence[i];
    const durationDays =
      i === 0
        ? balanceYears * DAYS_PER_YEAR
        : DASHA_YEARS[lord] * DAYS_PER_YEAR;

    const startDate = new Date(cursor);
    const endDate = new Date(cursor.getTime() + durationDays * 86_400_000);

    const period: DashaPeriod = {
      level: 1,
      lord,
      startDate,
      endDate,
      durationDays,
    };

    if (maxLevel >= 2) {
      period.children = buildSubPeriods([lord], startDate, durationDays, 2, maxLevel);
    }

    mahaRanges.push(period);
    cursor = endDate;
  }

  return mahaRanges;
}

function buildSubPeriods(
  parentLords: VimshottariPlanet[],
  parentStart: Date,
  parentDurationDays: number,
  currentLevel: 2 | 3 | 4 | 5,
  maxLevel: 1 | 2 | 3 | 4 | 5
): DashaPeriod[] {
  const immediateParentLord = parentLords[parentLords.length - 1];
  const subSequence = sequenceFrom(immediateParentLord);
  const periods: DashaPeriod[] = [];
  let cursor = new Date(parentStart);

  for (const subLord of subSequence) {
    const lordChain = [...parentLords, subLord];
    const durationDays = dashaLevelDuration(lordChain);
    const startDate = new Date(cursor);
    const endDate = new Date(cursor.getTime() + durationDays * 86_400_000);

    const period: DashaPeriod = {
      level: currentLevel as DashaPeriod["level"],
      lord: subLord,
      startDate,
      endDate,
      durationDays,
    };

    if (currentLevel < maxLevel) {
      period.children = buildSubPeriods(
        lordChain,
        startDate,
        durationDays,
        (currentLevel + 1) as 2 | 3 | 4 | 5,
        maxLevel
      );
    }

    periods.push(period);
    cursor = endDate;
  }

  return periods;
}

/**
 * Find the active dasha hierarchy for a given date.
 * Returns [L1, L2, L3, L4, L5] lords active at that moment.
 */
export function getActiveDasha(
  tree: DashaPeriod[],
  targetDate: Date
): VimshottariPlanet[] {
  function findActive(periods: DashaPeriod[]): VimshottariPlanet[] {
    for (const p of periods) {
      if (targetDate >= p.startDate && targetDate < p.endDate) {
        const current = [p.lord];
        if (p.children) {
          const sub = findActive(p.children);
          return [...current, ...sub];
        }
        return current;
      }
    }
    return [];
  }
  return findActive(tree);
}
```

### 6.3 BAV Power Score per Level

```typescript
// lib/vimshottari/src/bavPower.ts

import type { Planet } from "../../api-server/src/lib/ashtakavarga/tables";
import type { NatalPositions } from "../../api-server/src/lib/ashtakavarga/compute";
import type { VimshottariPlanet } from "./constants";

type BAVPlanet = Exclude<VimshottariPlanet, "rahu" | "ketu">;

// Rahu/Ketu use their dispositor's BAV sign for power scoring
const RAHU_KETU_SIGN_OVERRIDE: Record<"rahu" | "ketu", BAVPlanet> = {
  rahu: "saturn",  // Rahu behaves like Saturn — use Saturn's natal sign BAV
  ketu: "mars",    // Ketu behaves like Mars — use Mars's natal sign BAV
};

/**
 * BAV power score for a dasha lord at its natal position.
 * This is the core amplitude of that period.
 */
export function bavPowerScore(
  lord: VimshottariPlanet,
  bavReduced: Record<BAVPlanet, number[]>,
  natal: NatalPositions
): number {
  // Rahu/Ketu: proxy via their dispositor planets
  if (lord === "rahu" || lord === "ketu") {
    const proxy = RAHU_KETU_SIGN_OVERRIDE[lord];
    return bavReduced[proxy][natal[proxy]];
  }
  const p = lord as BAVPlanet;
  return bavReduced[p][natal[p]];
}

/**
 * Level weights for Composite Dasha Score
 */
const LEVEL_WEIGHTS = [5, 4, 3, 2, 1];

/**
 * Compute the Composite Dasha Score (CDS) for an active dasha hierarchy.
 * activeLords: [L1, L2?, L3?, L4?, L5?]
 */
export function compositeDashaScore(
  activeLords: VimshottariPlanet[],
  bavReduced: Record<BAVPlanet, number[]>,
  natal: NatalPositions
): { cds: number; breakdown: Array<{ level: number; lord: VimshottariPlanet; score: number; weight: number }> } {
  let weightedSum = 0;
  let totalWeight = 0;
  const breakdown = [];

  for (let i = 0; i < activeLords.length && i < 5; i++) {
    const lord = activeLords[i];
    const score = bavPowerScore(lord, bavReduced, natal);
    const weight = LEVEL_WEIGHTS[i];
    weightedSum += score * weight;
    totalWeight += weight;
    breakdown.push({ level: i + 1, lord, score, weight });
  }

  const cds = totalWeight > 0 ? weightedSum / totalWeight : 0;
  return { cds: Math.round(cds * 100) / 100, breakdown };
}
```

### 6.4 Composite Dasha Score (CDS) Engine

```typescript
// lib/vimshottari/src/transitOverlay.ts

import type { BAVPlanet } from "./bavPower";
import type { VimshottariPlanet } from "./constants";
import type { NatalPositions } from "../../api-server/src/lib/ashtakavarga/compute";

export type SignIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

const UPACHAYA = new Set([3, 6, 10, 11]); // Houses 3,6,10,11 (1-indexed)

function houseFrom(ref: number, target: number): number {
  return ((target - ref + 12) % 12) + 1;
}

/**
 * Transit bonus for a dasha lord currently in a given sign.
 * bavReduced[lord][currentSign] = transit BAV score
 * natalLordSign = natal position of the lord (for house calculation)
 */
export function transitBonus(
  lord: VimshottariPlanet,
  currentTransitSign: SignIndex,
  natalLordSign: SignIndex,
  bavReduced: Record<BAVPlanet, number[]>
): { transitScore: number; bonus: number; description: string } {
  // Rahu/Ketu: use proxy
  const effectiveLord: BAVPlanet =
    lord === "rahu" ? "saturn" : lord === "ketu" ? "mars" : (lord as BAVPlanet);

  const transitScore = bavReduced[effectiveLord][currentTransitSign];
  const house = houseFrom(natalLordSign, currentTransitSign);
  const isUpachaya = UPACHAYA.has(house);

  let bonus: number;
  let description: string;

  if (transitScore >= 5 && isUpachaya) {
    bonus = 0.5;
    description = `${transitScore} pts in Upachaya house ${house} — full benefic transit`;
  } else if (transitScore >= 4) {
    bonus = 0.25;
    description = `${transitScore} pts — above-average transit support`;
  } else if (transitScore === 3) {
    bonus = 0;
    description = `${transitScore} pts — neutral transit`;
  } else if (transitScore <= 2 && !isUpachaya) {
    bonus = -0.3;
    description = `${transitScore} pts in Apachaya house — transit suppression`;
  } else {
    bonus = -0.1;
    description = `${transitScore} pts — weak transit`;
  }

  return { transitScore, bonus, description };
}
```

### 6.5 Kakshya Micro-Timer

```typescript
// lib/vimshottari/src/kakshya.ts

import type { VimshottariPlanet } from "./constants";
import type { NatalPositions } from "../../api-server/src/lib/ashtakavarga/compute";
import { beneficTables } from "../../api-server/src/lib/ashtakavarga/tables";
import type { Planet, Contributor } from "../../api-server/src/lib/ashtakavarga/tables";

// Kakshya lords in order (fixed, from 0°–30° within any sign)
export const KAKSHYA_LORDS: Contributor[] = [
  "saturn","jupiter","mars","sun","venus","mercury","moon","lagna"
];

export const KAKSHYA_SPAN = 30 / 8; // 3.75°

export interface KakshyaInfo {
  index: number;           // 0–7
  lord: Contributor;
  startDeg: number;        // within sign (0–30°)
  endDeg: number;
  isBenefic: boolean;      // for the transiting planet in this sign
  daysIn?: number;         // if dailyMotion provided
}

/**
 * Analyze all 8 Kakshyas in a sign for a transiting planet.
 */
export function analyzeKakshyas(
  transitPlanet: Planet,
  sign: number,                   // 0–11
  natal: NatalPositions,
  currentDegInSign?: number,      // current longitude within the sign (0–30°)
  dailyMotion?: number            // degrees per day
): KakshyaInfo[] {
  return KAKSHYA_LORDS.map((lord, i) => {
    const startDeg = i * KAKSHYA_SPAN;
    const endDeg = startDeg + KAKSHYA_SPAN;

    // Is this Kakshya lord a benefic contributor for transitPlanet in this sign?
    const lordSign = lord === "lagna" ? natal.lagna : natal[lord as Planet];
    const houseFromLord = ((sign - lordSign + 12) % 12) + 1;
    const isBenefic = (beneficTables[transitPlanet]?.[lord] ?? []).includes(houseFromLord);

    let daysIn: number | undefined;
    if (currentDegInSign !== undefined && dailyMotion && dailyMotion > 0) {
      if (currentDegInSign < startDeg) {
        daysIn = (endDeg - startDeg) / dailyMotion; // full kakshya ahead
      } else if (currentDegInSign < endDeg) {
        daysIn = (endDeg - currentDegInSign) / dailyMotion; // remaining
      } else {
        daysIn = 0; // already passed
      }
    }

    return { index: i, lord, startDeg, endDeg, isBenefic, daysIn };
  });
}

/**
 * Return only the ACTIVE (benefic) Kakshya windows for the transiting planet
 * starting from its current position in the sign.
 */
export function beneficKakshyaWindows(
  transitPlanet: Planet,
  sign: number,
  natal: NatalPositions,
  currentDegInSign: number,
  dailyMotion: number
): Array<{ kakshya: KakshyaInfo; entryDate?: Date; exitDate?: Date }> {
  const all = analyzeKakshyas(transitPlanet, sign, natal, currentDegInSign, dailyMotion);
  return all
    .filter((k) => k.isBenefic && k.endDeg > currentDegInSign)
    .map((k) => ({
      kakshya: k,
    }));
}

/**
 * Given a date, compute precise Kakshya entry/exit dates for a planet.
 */
export function kakshyaTimeline(
  transitPlanet: Planet,
  sign: number,
  natal: NatalPositions,
  signEntryDate: Date,
  dailyMotion: number
): Array<{ kakshya: KakshyaInfo; entryDate: Date; exitDate: Date }> {
  const all = analyzeKakshyas(transitPlanet, sign, natal, 0, dailyMotion);
  return all.map((k) => {
    const entryDate = new Date(
      signEntryDate.getTime() + (k.startDeg / dailyMotion) * 86_400_000
    );
    const exitDate = new Date(
      signEntryDate.getTime() + (k.endDeg / dailyMotion) * 86_400_000
    );
    return { kakshya: k, entryDate, exitDate };
  });
}
```

### 6.6 Full Event Score (FES) Engine

```typescript
// lib/vimshottari/src/fes.ts

import { compositeDashaScore } from "./bavPower";
import { transitBonus } from "./transitOverlay";
import type { VimshottariPlanet } from "./constants";
import type { BAVPlanet } from "./bavPower";
import type { NatalPositions } from "../../api-server/src/lib/ashtakavarga/compute";
import type { SignIndex } from "./transitOverlay";

export type EventType =
  | "career" | "marriage" | "children" | "travel"
  | "property" | "inheritance" | "health" | "education" | "spirituality";

// Which house (1-indexed, counted from Lagna) to check for each event
const EVENT_HOUSE: Record<EventType, number[]> = {
  career:      [10, 6],
  marriage:    [7, 2],
  children:    [5, 9],
  travel:      [12, 9, 3],
  property:    [4],
  inheritance: [8, 11],
  health:      [6, 8],
  education:   [4, 5],
  spirituality:[9, 12],
};

function houseMultiplier(savScore: number): number {
  if (savScore >= 30) return 1.5;
  if (savScore >= 25) return 1.0;
  if (savScore >= 20) return 0.75;
  return 0.5;
}

export interface FESResult {
  fes: number;
  cds: number;
  transitBonus: number;
  houseMultiplier: number;
  maxHouseSAV: number;
  verdict: "major_event" | "significant" | "moderate" | "minor" | "quiet";
  narrative: string;
  activeDasha: VimshottariPlanet[];
  breakdown: Array<{ level: number; lord: VimshottariPlanet; score: number; weight: number }>;
}

export function computeFES(params: {
  activeDasha: VimshottariPlanet[];           // [L1, L2?, L3?, L4?, L5?]
  bavReduced: Record<BAVPlanet, number[]>;
  natal: NatalPositions;
  mahaDashaLordTransitSign: SignIndex;
  sav: number[];
  eventType: EventType;
}): FESResult {
  const { activeDasha, bavReduced, natal, mahaDashaLordTransitSign, sav, eventType } = params;

  // 1. CDS
  const { cds, breakdown } = compositeDashaScore(activeDasha, bavReduced, natal);

  // 2. Transit bonus for Maha Dasha lord
  const mahaDashaLord = activeDasha[0];
  const effectiveLord: BAVPlanet =
    mahaDashaLord === "rahu" ? "saturn"
    : mahaDashaLord === "ketu" ? "mars"
    : (mahaDashaLord as BAVPlanet);

  const natalLordSign = natal[effectiveLord] as SignIndex;
  const { bonus, description: transitDesc, transitScore } = transitBonus(
    mahaDashaLord, mahaDashaLordTransitSign, natalLordSign, bavReduced
  );

  // 3. House SAV multiplier
  const lagnaSign = natal.lagna;
  const relevantHouses = EVENT_HOUSE[eventType];
  const savScores = relevantHouses.map((h) => sav[(lagnaSign + h - 1) % 12]);
  const maxHouseSAV = Math.max(...savScores);
  const mult = houseMultiplier(maxHouseSAV);

  // 4. FES
  const fes = Math.round(cds * mult * (1 + bonus) * 100) / 100;

  const verdict: FESResult["verdict"] =
    fes >= 12 ? "major_event"
    : fes >= 8 ? "significant"
    : fes >= 5 ? "moderate"
    : fes >= 3 ? "minor"
    : "quiet";

  const eventLabel = eventType.replace(/_/g, " ");
  const narrative =
    fes >= 12
      ? `Major ${eventLabel} event highly expected. All streams aligned.`
      : fes >= 8
      ? `Significant ${eventLabel} development likely. Dasha hierarchy is strong.`
      : fes >= 5
      ? `Moderate ${eventLabel} activity. Some activation present.`
      : fes >= 3
      ? `Minor ${eventLabel} development possible. Period is weak overall.`
      : `Quiet period for ${eventLabel}. Low planetary support across all levels.`;

  return {
    fes, cds, transitBonus: bonus, houseMultiplier: mult,
    maxHouseSAV, verdict, narrative, activeDasha, breakdown,
  };
}
```

### 6.7 Forecast Timeline Generator

```typescript
// lib/vimshottari/src/forecast.ts

import { buildDashaTree, getActiveDasha, type DashaPeriod } from "./periods";
import { computeFES, type EventType, type FESResult } from "./fes";
import type { NatalPositions } from "../../api-server/src/lib/ashtakavarga/compute";
import type { BAVPlanet } from "./bavPower";
import type { SignIndex } from "./transitOverlay";

export interface ForecastWindow {
  startDate: Date;
  endDate: Date;
  level: number;
  activeLords: string[];
  eventType: EventType;
  fesResult: FESResult;
}

/**
 * Generate a forecast timeline by scanning every Pratyantardasha (L3) window
 * within a date range, computing FES for each.
 *
 * For production use, pass actual ephemeris transit data for mahaDashaLordTransitSign.
 * Here we accept a callback to supply the Maha Dasha lord's transit sign at any date.
 */
export function generateForecast(params: {
  birthDate: Date;
  moonLongitude: number;
  natal: NatalPositions;
  bavReduced: Record<BAVPlanet, number[]>;
  sav: number[];
  forecastStart: Date;
  forecastEnd: Date;
  eventTypes: EventType[];
  getTransitSign: (lord: string, date: Date) => SignIndex; // ephemeris hook
}): ForecastWindow[] {
  const {
    birthDate, moonLongitude, natal, bavReduced, sav,
    forecastStart, forecastEnd, eventTypes, getTransitSign,
  } = params;

  const tree = buildDashaTree(birthDate, moonLongitude, 3); // build to L3
  const windows: ForecastWindow[] = [];

  function scan(periods: DashaPeriod[]) {
    for (const period of periods) {
      // Clip to forecast range
      const windowStart = period.startDate > forecastStart ? period.startDate : forecastStart;
      const windowEnd   = period.endDate   < forecastEnd   ? period.endDate   : forecastEnd;
      if (windowStart >= windowEnd) {
        if (period.children) scan(period.children);
        continue;
      }

      if (period.level === 3) {
        const midDate = new Date((windowStart.getTime() + windowEnd.getTime()) / 2);
        const activeDasha = getActiveDasha(tree, midDate);

        for (const eventType of eventTypes) {
          const mahaDashaLord = activeDasha[0];
          const transitSign = getTransitSign(mahaDashaLord, midDate);

          const fesResult = computeFES({
            activeDasha, bavReduced, natal,
            mahaDashaLordTransitSign: transitSign, sav, eventType,
          });

          if (fesResult.fes >= 3) { // Only include non-trivial windows
            windows.push({
              startDate: windowStart,
              endDate: windowEnd,
              level: 3,
              activeLords: activeDasha,
              eventType,
              fesResult,
            });
          }
        }
      }

      if (period.children) scan(period.children);
    }
  }

  scan(tree);

  // Sort by FES descending — highest-scoring windows first
  return windows.sort((a, b) => b.fesResult.fes - a.fesResult.fes);
}
```

---

## 7. Database Schema Additions

```typescript
// lib/db/src/schema/vimshottari.ts

import {
  pgTable, serial, integer, text, timestamp,
  real, json, index
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { chartsTable } from "./charts";

// ── Pre-computed dasha spans for a chart ────────────────────────────────────

export const dashaPeriodsTable = pgTable("dasha_periods", {
  id:         serial("id").primaryKey(),
  chartId:    integer("chart_id").notNull().references(() => chartsTable.id, { onDelete: "cascade" }),
  level:      integer("level").notNull(),          // 1–5
  lord:       text("lord").notNull(),
  startDate:  timestamp("start_date").notNull(),
  endDate:    timestamp("end_date").notNull(),
  durationDays: real("duration_days").notNull(),
  parentId:   integer("parent_id"),                // null for L1; FK to self for L2+
}, (t) => [
  index("dp_chart_idx").on(t.chartId),
  index("dp_level_idx").on(t.level),
  index("dp_dates_idx").on(t.startDate, t.endDate),
]);

// ── Stored forecast windows ──────────────────────────────────────────────────

export const forecastWindowsTable = pgTable("forecast_windows", {
  id:           serial("id").primaryKey(),
  chartId:      integer("chart_id").notNull().references(() => chartsTable.id, { onDelete: "cascade" }),
  startDate:    timestamp("start_date").notNull(),
  endDate:      timestamp("end_date").notNull(),
  activeLords:  json("active_lords").$type<string[]>().notNull(),
  eventType:    text("event_type").notNull(),
  fes:          real("fes").notNull(),
  cds:          real("cds").notNull(),
  maxHouseSAV:  integer("max_house_sav").notNull(),
  verdict:      text("verdict").notNull(),
  narrative:    text("narrative").notNull(),
  breakdown:    json("breakdown").$type<object[]>().notNull(),
  computedAt:   timestamp("computed_at").defaultNow().notNull(),
}, (t) => [
  index("fw_chart_idx").on(t.chartId),
  index("fw_fes_idx").on(t.fes),
  index("fw_event_idx").on(t.eventType),
  index("fw_dates_idx").on(t.startDate, t.endDate),
]);

export const insertDashaPeriodSchema = createInsertSchema(dashaPeriodsTable).omit({ id: true });
export type InsertDashaPeriod = z.infer<typeof insertDashaPeriodSchema>;
export type DashaPeriodRow = typeof dashaPeriodsTable.$inferSelect;

export const insertForecastWindowSchema = createInsertSchema(forecastWindowsTable).omit({ id: true, computedAt: true });
export type InsertForecastWindow = z.infer<typeof insertForecastWindowSchema>;
export type ForecastWindowRow = typeof forecastWindowsTable.$inferSelect;
```

Export from `lib/db/src/schema/index.ts`:
```typescript
export * from "./charts";
export * from "./vimshottari";
```

---

## 8. API Endpoints

Add to `lib/api-spec/openapi.yaml`:

```yaml
  /charts/{id}/dasha-tree:
    get:
      operationId: getDashaTree
      tags: [charts]
      summary: Full Vimshottari Dasha tree (L1–L3)
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
        - name: fromDate
          in: query
          schema: { type: string, format: date }
        - name: toDate
          in: query
          schema: { type: string, format: date }
      responses:
        "200":
          description: Dasha periods with BAV power scores
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/DashaTreeResponse"

  /charts/{id}/active-dasha:
    get:
      operationId: getActiveDasha
      tags: [charts]
      summary: Active dasha hierarchy at a given date
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
        - name: date
          in: query
          required: true
          schema: { type: string, format: date }
      responses:
        "200":
          description: Active lords with BAV power scores and CDS
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ActiveDashaResponse"

  /charts/{id}/forecast:
    post:
      operationId: generateForecast
      tags: [charts]
      summary: Generate Full Event Score forecast windows
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ForecastInput"
      responses:
        "200":
          description: Forecast windows ranked by FES
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ForecastWindow"

  /charts/{id}/kakshya:
    post:
      operationId: analyzeKakshya
      tags: [charts]
      summary: Kakshya micro-timing for a planet transiting a sign
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/KakshyaInput"
      responses:
        "200":
          description: All 8 Kakshya windows with benefic status
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/KakshyaResponse"
```

---

## 9. Interpretation Reference Tables

### 9.1 What each Maha Dasha activates

| Maha Dasha | Core themes | Houses primarily activated | BAV check |
|-----------|-------------|--------------------------|-----------|
| **Ketu** (7y) | Detachment, past karma, occult, illness | 12, 8, 6 | Ketu → Mars proxy BAV in natal Mars sign |
| **Venus** (20y) | Marriage, luxury, arts, wealth, vehicles | 7, 2, 4, 12 | Venus BAV in natal Venus sign |
| **Sun** (6y) | Career, authority, father, government | 1, 10, 9 | Sun BAV in natal Sun sign |
| **Moon** (10y) | Mind, mother, travel, public, emotions | 4, 1, 7 | Moon BAV in natal Moon sign |
| **Mars** (7y) | Property, siblings, courage, litigation | 3, 6, 10, 4 | Mars BAV in natal Mars sign |
| **Rahu** (18y) | Foreign, technology, obsession, sudden change | 11, 3, 6, 12 | Rahu → Saturn proxy BAV in natal Saturn sign |
| **Jupiter** (16y) | Wisdom, children, teacher, wealth, expansion | 5, 9, 2, 11 | Jupiter BAV in natal Jupiter sign |
| **Saturn** (19y) | Karma, discipline, service, longevity, delays | 6, 10, 11, 12 | Saturn BAV in natal Saturn sign |
| **Mercury** (17y) | Communication, business, education, siblings | 3, 6, 10, 5 | Mercury BAV in natal Mercury sign |

### 9.2 BAV Score Interpretation per Dasha Level

| Score | L1 (Maha) | L2 (Antar) | L3 (Pratyantar) | L4 (Sookshma) | L5 (Prana) |
|-------|-----------|-----------|----------------|--------------|-----------|
| 7–8 | Era of extraordinary achievement | Sub-period delivers fully | Events manifest swiftly | Day/week is peak active | Exact hours are auspicious |
| 5–6 | Strong productive era | Good results flow naturally | Event triggers are alive | Active window | Favourable moment |
| 4 | Solid, dependable era | Average results | Moderate trigger | Neutral | Neutral |
| 3 | Mixed era — partial gains | Frustration likely | Events delayed | Low activation | Weak moment |
| 1–2 | Era of hardship | Sub-period blocks dasha | No triggering | Silent | Inauspicious |
| 0 | Planet muted entirely | Antardasha lord overrides | Skipped over | Void | Avoid |

### 9.3 FES Event Thresholds

| FES | Verdict | Action |
|-----|---------|--------|
| ≥ 12 | **MAJOR EVENT** | Marriage, job offer, childbirth, major property — near certainty |
| 8 – 11.9 | **SIGNIFICANT** | Strong development — finalize decisions, start new ventures |
| 5 – 7.9 | **MODERATE** | Progress visible — act but keep expectations calibrated |
| 3 – 4.9 | **MINOR** | Small changes — good for incremental work, not launches |
| < 3 | **QUIET** | Consolidate and prepare; avoid major moves |

---

## 10. Worked Example — Step by Step

**Birth data:**  
Sun = Aries (0) · Moon = Cancer (3) · Mars = Scorpio (7) · Mercury = Taurus (1)  
Jupiter = Sagittarius (8) · Venus = Pisces (11) · Saturn = Capricorn (9) · Lagna = Leo (4)  
Moon longitude = 85.5° → Nakshatra 6 (Ardra, lord: **Rahu**)

---

### Step 1 — Identify running Dasha (assume born 1 Jan 1985)

Moon at 85.5°. Ardra nakshatra (80° – 93.33°). Lord = **Rahu** (18 years).

Fraction remaining in Ardra = (93.33 – 85.5) / 13.33 = 0.587  
Balance Rahu Maha Dasha = 0.587 × 18 = **10.57 years** from birth = ends ~12 Jun 1995.

Next: Jupiter MD (16y) → 12 Jun 1995 – 12 Jun 2011  
Next: Saturn MD (19y) → 12 Jun 2011 – 12 Jun 2030

---

### Step 2 — Assume date of analysis: 15 March 2024

Active Maha Dasha: **Saturn** (12 Jun 2011 – 12 Jun 2030)

**Saturn AD in Saturn MD:**  
Saturn AD = 19 × 19 / 120 = 3.008 years → 12 Jun 2011 + 0 offset = starts 12 Jun 2011, ends 7 Apr 2014  
*(Note: within Saturn MD, sequence starts from Saturn itself)*

Working forward... assume the active Antardasha on 15 Mar 2024 is **Jupiter AD in Saturn MD:**  
Saturn MD → Mercury AD → Ketu AD → Venus AD → Sun AD → Moon AD → Mars AD → **Rahu AD** → Jupiter AD  
*(Calculate precisely using the duration formula for each AD in order)*

Active Pratyantardasha within Jupiter AD on 15 Mar 2024 — assume **Mercury PD**.

---

### Step 3 — Compute CDS

Assume from BAV computation (using the test natal above):
- Saturn BAV in Capricorn (9) = 5 → **L1 score = 5**
- Jupiter BAV in Sagittarius (8) = 6 → **L2 score = 6**
- Mercury BAV in Taurus (1) = 4 → **L3 score = 4**

```
CDS = (5×5 + 6×4 + 4×3) / (5+4+3)
    = (25 + 24 + 12) / 12
    = 61 / 12
    = 5.08
```

**Verdict: Strong** — Productive period, significant developments likely.

---

### Step 4 — Transit overlay for Saturn (Maha lord)

Assume Saturn is currently transiting **Aquarius (10)** on 15 Mar 2024.  
Saturn BAV (reduced) in Aquarius = 3 (from our computed BAV).

House from natal Saturn (Capricorn=9) to Aquarius (10) = house 2 → Apachaya.

```
TransitBonus = 0 (score 3 = neutral, Apachaya)
```

---

### Step 5 — FES for Career event

Career houses from Lagna Leo (4): 10th = Taurus (1-indexed from Leo) → sign index (4+9)%12 = 1 (Taurus)  
SAV[Taurus] = (assume) 27 → HouseMultiplier = 1.0

```
FES = CDS × HouseMultiplier × (1 + TransitBonus)
    = 5.08 × 1.0 × (1 + 0)
    = 5.08
```

**Verdict: MODERATE** — Career progress is active but not peak. Saturn transiting its own 2nd (wealth sign) is mixed; results come with delays typical of Saturn.

---

### Step 6 — Kakshya drill-down for Saturn in Aquarius

Saturn at, say, **14.5° Aquarius** (midpoint within sign), daily motion ≈ 0.033°/day.

Kakshya 4 = 11°15' – 15°00' → Lord: **Sun**  
Sun's natal sign = Aries (0). House from Aries to Aquarius (10) = house 11 (Upachaya).  
Saturn BAV benefic houses from Sun = [1,2,4,7,8,9,10,11] → **11 is in the list → BENEFIC Kakshya.**

Saturn exits Kakshya 4 at 15° → days remaining = (15.0 – 14.5) / 0.033 = **15 days**.

→ **Career result window: next 15 days** while Saturn is in this Kakshya (Sun-ruled, benefic for Saturn).

---

## 11. Frontend Visualization Guide

### Dasha Timeline Component

Render a **horizontal Gantt-style timeline** with 5 rows (one per level). Each bar = a dasha period. Color by CDS:

```
CDS ≥ 6   → deep green  (#166534)
CDS 4–5.9 → teal        (#0f766e)
CDS 3–3.9 → amber       (#b45309)
CDS < 3   → red         (#991b1b)
```

On hover: show lord name, BAV power score, start/end dates, CDS value.

### FES Forecast Panel

Display a **ranked list of future windows** with:
- Date range badge
- Active lords (L1 → L3 chain)
- Event type icon
- FES meter bar (0–15 scale)
- Verdict chip: `MAJOR / SIGNIFICANT / MODERATE / MINOR / QUIET`
- One-line narrative

Filter by event type (career, marriage, health, etc.).

### Kakshya Precision View

For the Maha Dasha lord's current transit sign, show an **8-segment strip** representing the sign from 0°–30°. Shade benefic Kakshyas green, malefic ones grey. Mark the planet's current position with a pin. Show entry/exit dates for each segment below the strip.

### SAV Threshold Indicators on the Dasha Chart

For each house that the active Maha Dasha lord rules, overlay the SAV score as a small badge:

```
≥ 30 → green badge "Strong"
25–29 → yellow badge "Neutral"
< 25 → red badge "Weak"
```

This immediately shows the user whether the house promise can be delivered during the current era.

---

## 12. Complete API Quick Reference

### Micro-Timing Stack (deepest resolution, use daily)

```
GET /api/charts/:id/micro-dasha?date=YYYY-MM-DD
```
Returns full L1→L5 hierarchy (Maha → Antara → Pratyantar → Sookshma → Prana) with BAV power score at each level and FES forecast for 6 event types.

### Tara Bala & Chandra Bala (Moon quality check)

```
GET /api/charts/:id/tara-bala?date=YYYY-MM-DD
```
Returns Tara (quality of each transit nakshatra relative to natal Moon), Chandra Bala (Moon's BAV score in transit sign), and a recommendation on whether to initiate action.

### Full Gochara (9-planet transit report)

```
GET /api/charts/:id/gochara?date=YYYY-MM-DD
```
Each planet: BAV score, SAV score in transit sign, house from Lagna, house from Moon, classical good/bad classification, retrograde flag, combined verdict.

### Panchang

```
GET /api/ephemeris/panchang?date=YYYY-MM-DD
```
Tithi (with Paksha), Vara (weekday lord), Nakshatra + Pada, Yoga, Karana — all live from ephemeris.

### SAV Classical Analysis

```
GET /api/charts/:id/sav-analysis
```
All 12 signs scored and labelled (highly auspicious → highly inauspicious), wealth 3-condition check, rough longevity estimate via Saturn BAV accumulation, strongest/weakest 3 signs.

### Sade Sati Tracker

```
GET /api/charts/:id/sade-sati?date=YYYY-MM-DD
```

Saturn's 7.5-year transit across three signs relative to natal Moon:

| Phase | Sign | Duration | Nature |
|-------|------|----------|--------|
| **Rising** | 12th from Moon | ~2.5 yrs | Disruption begins; travel, career pressure |
| **Peak** | Natal Moon sign | ~2.5 yrs | Maximum intensity; health, relationships |
| **Setting** | 2nd from Moon | ~2.5 yrs | Gradual relief; residual friction |

**Severity** for each phase is calculated from Saturn's reduced BAV score in that sign:
- BAV ≥ 5: Mild — Saturn is strong enough to act beneficially despite the transit
- BAV 3–4: Moderate — mixed results, patience required
- BAV 1–2: Intense — challenges amplified, remedies advisable
- BAV 0: Very Intense — full malefic expression, maximum caution

Also returns: **Kantaka Shani** (Saturn in 4th/7th/10th from Moon — targeted life-area pressure) and **Ashtama Shani** (8th from Moon — health and hidden obstacles). When Sade Sati is not active, the response includes an estimated start year based on Saturn's current position and daily motion.

### Master Report (all modules, one call)

```
GET /api/charts/:id/report?date=YYYY-MM-DD
```
Combines: Panchang + Dasha hierarchy (all 5 levels) + CDS + FES (6 event types) + Gochara (9 planets) + Tara Bala + Chandra Bala + SAV analysis + wealth + life phases + planet insights + overall score (0–10).

---

## 13. The 5-Layer Decision Filter

Before timing any important event, apply these filters in order:

| Priority | Filter | Tool | Minimum Threshold |
|----------|--------|------|-------------------|
| 1 | **Maha Dasha lord's BAV** | `active-dasha` | ≥ 4 at natal sign |
| 2 | **CDS (all levels)** | `active-dasha` | ≥ 3.0 |
| 3 | **FES for that event type** | `micro-dasha` | ≥ 5 |
| 4 | **Transit BAV in relevant house** | `gochara` | ≥ 4 in event house |
| 5 | **Kakshya of event-relevant planet** | `charts/:id/kakshya` | Benefic lord active |
| Bonus | **Chandra Bala** | `tara-bala` | ≥ 4 on day of action |
| Bonus | **Tara** | `tara-bala` | Sampat, Kshema, Sadhaka, Mitra, or Ati Mitra |
| Bonus | **Yoga** | `ephemeris/panchang` | Auspicious Yoga on day of action |

All 5 primary filters passing = maximum probability window. 3 passing = act with awareness. Fewer than 3 = wait.

---

*Guide authored for the Vedic_Rajkumar project — June 2026.*  
*Core calculation authority: Brihat Jataka, Varahamihira; Phaladeepika; Jataka Parijata.*  
*Vimshottari Dasha system: Parasara Hora Shastra, Chapters on Dasha Phala.*
