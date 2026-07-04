# INTERPRETATION ENGINE — VEDIC RAJKUMAR v2.1
## Master Vedic Astrology Interpretation Reference

> **Supplement to**: https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar  
> **Status**: FLUORESCENT FINISHING LINE — 13-Layer Convergence Architecture  
> **Grounded in**: Full audit of actual codebase (May 2026 state)

---

## WHAT IS ALREADY BUILT (Codebase Audit)

Before adding anything, this is what the repo already contains and what is missing. Every section below is anchored to a real file.

### ✅ Already Implemented

| Service | File | Covers | Gap |
|---------|------|--------|-----|
| **Shadbala (6-bala)** | `src/services/shadabalaService.ts` | All 6 balas, `totalRupas`, `shadabalaRatio`, `strength` tier | Missing: Shadbala-**gated** yoga activation; Vargottama/combustion modifiers not applied to yoga delivery |
| **Vimshottari Dasha** | `src/services/dashaService.ts` | MD/AD/PD with `isActive` flags; Nakshatra lord mapping | Missing: PD (Pratyantardasha) gating; no Level 1–5 Dasha tag on outputs |
| **Yoga Detection** | `src/services/yogaService.ts` + `yogaExtendedService.ts` | 100+ yogas, `strong/moderate/weak` | Missing: **ACTIVE/EMERGING/LATENT/BROKEN** status; no Shadbala gate before declaring a yoga strong |
| **Jaimini / Arudha** | `src/services/jaiminiService.ts` | Chara Karakas, `PadaLagna` (= Arudha Lagna), Chara Dasha, Argala, Pada Yogas | Missing: AL-Lagna gap psychological narrative; UL/A4/A10 not surfaced in interpretation layer |
| **Classical Answer** | `src/services/classicalAnswerEngine.ts` | 5-section Prasna response (Direct Answer, Reasoning, Timing, Risks, Remedies); classical source citations from Prasna Marga/BPHS/Brihat Jataka/Saravali | Missing: **5-layer convergence hierarchy enforcement**; no "Therefore:" forced verdict; no Shadbala gate; no Double Transit check |
| **AI Prediction** | `src/services/aiPredictionService.ts` | Rule-based `confidence` scores, `AIReport` with predictions + remedies | Missing: Scores are **hardcoded tables** not driven by actual Shadbala `totalRupas`; no Dasha Level tag |
| **Remedies** | `src/services/remediesService.ts` | Mantra / charity / fasting / ritual / gemstone with timing and bilingual instructions | Missing: **6-layer diagnostic stack** tied to the *single weakest planet* in the specific promise chain; generic not surgical |
| **Divisional Charts** | `src/services/divisionalChartsService.ts` | D1–D12 | Missing: D9/D10/D60 **synthesis verdict** (not both-sides presentation) |
| **Transit** | `src/services/dynamicTransitService.ts` + `dashaGocharaCorrelationService.ts` | Transit effects, Dasha-Gochar correlation | Missing: **Double Transit Protocol** (Jupiter + Saturn simultaneous check); single-transit results not labelled as temporary-only |
| **Nakshatra** | `src/services/nakshatraService.ts` | Nakshatra lord, pada, qualities | Missing: Nakshatra **fear architecture** mapping to psychological profile |

### ❌ Completely Missing (Must Be Added)

1. **Layer 0 — Virgin World Fame Filter** — not present anywhere
2. **Layer 6 — Dasha Level 1–5 tagging** — no output tags `[Level X: Dasha detail]`
3. **Layer 7 — Double Transit Protocol** — Jupiter + Saturn simultaneous check absent
4. **Layer 8 — Arudha Psychology Narrative** — `PadaLagna` is computed in `jaiminiService` but never drives a psychological narrative in outputs
5. **Layer 9 — "Therefore:" Forced Verdict** — `classicalAnswerEngine` produces 5 sections but never forces a single resolved conclusion
6. **Layer 10 — Probability Engine** — `aiPredictionService` has confidence scores but no "X% without remedy / Y% with remedy" + single weakest planet target
7. **Layer 11 — Psychological Profile Object** — Nakshatra fear architecture, Rahu/Ketu karmic statement, Saturn wound statement: absent
8. **Layer 12 — Six-Layer Behavioral Remedy Stack** — `remediesService` has the raw materials but nothing assembles a diagnostically-targeted 6-layer stack per reading
9. **Layer 13 — Virgin World Fame Verdict** — absent

---

## THE CONVERGENCE ARCHITECTURE

The interpretation engine runs in **strict sequential layers**. A lower layer cannot override a higher layer.

```
INPUT: ChartData + QueryContext
         │
         ▼
┌─────────────────────────────┐
│  LAYER 0 (fame queries)     │  → Virgin World Fame Score (0–100)
│  Score chart before output  │    If score <60: STOP. Honest verdict.
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  LAYER 1: Natal Promise     │  ← shadabalaService.ts + divisionalChartsService.ts
│  D1 promise present?        │    If absent: STOP. "Chart does not promise X."
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  LAYER 2: Shadbala Gate     │  ← shadabalaService.ts → totalRupas
│  Score all yoga planets     │    Tier: Extremely Strong / Strong / Moderate
└────────────┬────────────────┘       Weak / Extremely Weak
             │
             ▼
┌─────────────────────────────┐
│  LAYER 3: Yoga Status Tag   │  ← yogaService.ts + dashaService.ts
│  ACTIVE/EMERGING/LATENT/    │    Shadbala gate applied FIRST
│  BROKEN                     │    Multiplicative synthesis for combos
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  LAYER 4: Divisional Synth  │  ← divisionalChartsService.ts
│  One forced verdict         │    No "both possible" output
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  LAYER 5: Aspect Weights    │  ← aspectsService.ts
│  Saturn 1.2× / Jupiter 1.1× │
│  Rahu-Ketu 0.9× / etc.      │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  LAYER 6: Dasha Level Tag   │  ← dashaService.ts → isActive MD/AD/PD
│  [Level 1–5: Dasha detail]  │    Every prediction sentence gets a tag
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  LAYER 7: Double Transit    │  ← dynamicTransitService.ts
│  Jupiter + Saturn check     │    Single transit = temporary only
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  LAYER 8: Arudha Psychology │  ← jaiminiService.ts → PadaLagna
│  AL-Lagna gap narrative     │    AL, UL, A4, A10 mandatory
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  LAYER 9: "Therefore:"      │  ← classicalAnswerEngine.ts (ENHANCED)
│  Forced single verdict      │    Conflict → weight → one conclusion
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  LAYER 10: Failure Mode     │  ← shadabalaService.weakestPlanet
│  X% / Y% + single target   │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  LAYER 11: Psych Profile    │  ← nakshatraService.ts + jaiminiService.ts
│  Nakshatra fear + Rahu/Ketu │    Saturn wound + 3-sentence synthesis
│  + Saturn wound             │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  LAYER 12: Remedy Stack     │  ← remediesService.ts (ENHANCED)
│  6-layer diagnostic stack   │    Tied to weakest planet in Layer 10
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  LAYER 13 (fame queries)    │  → Virgin World Fame Verdict block
│  Probability + Timeline     │
└─────────────────────────────┘
         │
         ▼
   STRUCTURED OUTPUT
```

---

## LAYER 0 — VIRGIN WORLD FAME FILTER

**Trigger**: Any query touching fame, public impact, global recognition, legacy, career visibility.  
**Service hook**: New `virgimWorldFameService.ts` (to be created)

### Scoring Checklist (0–100)

| # | Requirement | Max Pts | Data Source |
|---|-------------|---------|-------------|
| 1 | Strong 10th / Lagna lord / AL with **self-generated** visibility (Sun/Rahu/Jupiter — not derivative via 7th/9th) | 20 | `shadabalaService` + `jaiminiService.padaLagna` |
| 2 | Rahu in 10th/11th/5th/9th or powerfully aspecting them, OR Rahu in kendra from AL — foreign/unconventional/viral signature required | 15 | `yogaService` + `aspectsService` |
| 3 | Sun strong: exalted / own sign / digbala — OR Neecha Bhanga Sun + active Jupiter support in current Dasha | 15 | `shadabalaService.planets[Sun].totalRupas` |
| 4 | 10th lord Vargottama OR `shadabalaRatio` >1.5 + forming Raj Yoga with benefics + Rahu | 15 | `shadabalaService` + `yogaService.rajYogas` |
| 5 | AL in 10th/11th from Lagna OR receiving strong Jupiter/Rahu aspect | 15 | `jaiminiService.padaLagna` + `aspectsService` |
| 6 | D10 confirms: 10th lord strong + Rahu/Sun influence. D60: fame planets exalted or in own house | 10 | `divisionalChartsService` |
| 7 | No Parasitic Fame: **not** primarily relying on 7th lord / 9th lord / inheritance for fame | 10 | `yogaService` + manual check |

### Score Tiers

| Score | Verdict | Action |
|-------|---------|--------|
| **95–100** | Historic-level Virgin World Fame highly probable | Full Layer 13 output |
| **80–94** | Global fame with sustained legacy possible | Full Layer 13 output |
| **60–79** | National + niche global recognition | Qualified Layer 13 output |
| **Below 60** | **STOP** soft-selling fame | State clearly: *"The chart does not structurally support virgin world fame."* Proceed to honest Layer 10 analysis |

---

## LAYER 1 — FIVE-LAYER CONVERGENCE HIERARCHY

**Process in strict priority order. Lower layers cannot override higher layers.**

### Rule 1 — Natal Promise (D1)

The D1 chart is the **seed**. If the seed is absent, no amount of water (transit, yoga, Dasha) grows the tree.

```typescript
// In src/services/interpretationEngine.ts (to be created)
function checkNatalPromise(
  planets: PlanetPosition[],
  houses: HouseData[],
  queryContext: QueryContext
): NatalPromiseResult {
  // For marriage: check 7th house, 7th lord, Venus strength
  // For career: check 10th house, 10th lord, Sun strength  
  // For fame: check 10th + AL + Rahu combination
  // Returns: { promised: boolean, confidence: number, reason: string }
}
```

**Output if absent**: *"The natal chart does not promise [X]. No transit, yoga, or Dasha can manufacture what the radix denies. Therefore: [verdict]."*

### Rule 2 — Divisional Confirmation

| Domain | Primary Divisional | Secondary |
|--------|--------------------|-----------|
| Marriage / Spouse nature | D9 (Navamsha) | D7 |
| Career / Fame | D10 (Dashamsha) | D60 |
| Children | D7 | D9 |
| Vehicles / Comfort | D16 | D4 |
| Spiritual practice | D20 | D9 |
| Overall karma / Shashtiamsha | D60 | — |

**Data source**: `src/services/divisionalChartsService.ts`  
**Required output**: Not "D1 shows X, D9 shows Y." → Only: "Therefore: [one resolved statement]."

### Rule 3 — Shadbala Gate

A yoga is only as powerful as its **weakest** forming planet's `totalRupas`.

```typescript
// Current gap in yogaService.ts:
// YogaResult.strength = 'strong' | 'moderate' | 'weak'
// This is NOT the same as Shadbala-gated strength.

// Required fix: Before tagging any yoga as 'strong', check:
const SHADBALA_TIERS = {
  EXTREMELY_STRONG: 2.0,   // Full delivery; timing 25–40% faster
  STRONG:           1.25,  // Standard delivery
  MODERATE:         0.75,  // Conditional delivery
  WEAK:             0.40,  // Diluted; event may occur but disappoints
  EXTREMELY_WEAK:   0.0,   // Yoga broken without Neecha Bhanga or remedy
};

// Modifiers (apply BEFORE tier check):
// Vargottama: totalRupas × 1.25 (amplifies both strength AND weakness)
// Combustion: totalRupas × 0.70 (unless within 1° in own/exalted sign)
// Neecha Bhanga: Active ONLY if debilitated planet's Dasha is running
```

**Data source**: `shadabalaService.ts` → `ShadabalaResult.totalRupas` per planet

### Rule 4 — Dasha Activation Gate

A yoga is **LATENT** until the MD, AD, or PD lord is one of its forming planets.

```typescript
// dashaService.ts already computes:
// DashaPeriod.isActive (MD level)
// AntarDasha.isActive (AD level)
// PratyantarDasha (PD level — exists in type but needs surfacing)

// Required: Cross-reference yoga-forming planets against active Dasha lords
function getYogaActivationStatus(
  yoga: YogaResult,
  activeDasha: ActiveDashaSequence
): 'ACTIVE' | 'EMERGING' | 'LATENT' | 'BROKEN' {
  const { mdLord, adLord, pdLord } = activeDasha;
  const yogaPlanets = yoga.planets;
  
  if (yogaPlanets.includes(mdLord) || yogaPlanets.includes(adLord)) {
    return 'ACTIVE';
  }
  // Check if Dasha change within 12 months will activate...
  // Return 'EMERGING', 'LATENT', or 'BROKEN' accordingly
}
```

### Rule 5 — Transit Trigger

Only Dasha-active promises can be triggered by transit.  
A Jupiter transit to 7th house without Saturn involvement = **temporary window only**, not structural change.

---

## LAYER 2 — SHADBALA MODIFICATION PROTOCOL

**Already computed**: `shadabalaService.ts` → `ShadabalaResult` per planet  
**What's missing**: Application of these scores as a **gate** on yoga delivery and prediction confidence.

### Strength Tiers (map from existing `shadabalaService.ts` output)

| Tier | `totalRupas` | `strength` field (existing) | Interpretation Engine Verdict |
|------|-------------|---------------------------|-------------------------------|
| **Extremely Strong** | >2.0 | `'very-strong'` | Full yoga delivery; timing accelerates 25–40% |
| **Strong** | 1.25–2.0 | `'strong'` | Standard delivery with confidence |
| **Moderate** | 0.75–1.25 | `'average'` | Conditional; needs supporting factors |
| **Weak** | 0.40–0.75 | `'weak'` | Diluted/frustrated; event may occur but disappoints |
| **Extremely Weak** | <0.40 | `'very-weak'` | Yoga broken; event unlikely without Neecha Bhanga/remedy |

### Mandatory Modifiers (Apply Before Tier Assignment)

| Modifier | Rule | Detection |
|----------|------|-----------|
| **Vargottama** | `totalRupas × 1.25` — amplifies BOTH strength and weakness | Planet in same rashi in D1 and D9 |
| **Neecha Bhanga** | Active ONLY if debilitated planet's Dasha is current MD/AD OR the cancelling planet is MD/AD lord | `dashaService.isActive` + `shadabalaService` |
| **Combustion** | `totalRupas × 0.70` — unless within 1° in own sign/exaltation | Degree check vs Sun longitude |

### Narrative Templates by Shadbala (for `aiPredictionService.ts` replacement logic)

**Currently**: `aiPredictionService` uses hardcoded tables like `Mars: { 10: { career: 90 } }`.  
**Required**: Replace hardcoded scores with Shadbala-driven narratives:

```typescript
function getShadabalaVerdict(planet: string, rupas: number, yoga: string): string {
  if (rupas < 0.40) {
    return `${yoga} is broken. ${planet} at ${rupas.toFixed(2)} rupas cannot deliver. 
            Event may occur but will be followed by reversal or disappointment.`;
  }
  if (rupas < 0.75) {
    return `${yoga} is diluted. ${planet} at ${rupas.toFixed(2)} rupas creates 
            intermittent results — grant, then removal; rise, then obstacle.`;
  }
  if (rupas >= 1.25) {
    return `${yoga} delivers with confidence. ${planet} at ${rupas.toFixed(2)} rupas 
            supports full manifestation in the current Dasha window.`;
  }
  return `${yoga} is conditional. ${planet} at ${rupas.toFixed(2)} rupas requires 
          supporting factors (benefic transit, strong AD lord) to fully manifest.`;
}
```

---

## LAYER 3 — YOGA ACTIVATION PROTOCOL

**Currently**: `yogaService.ts` tags `YogaResult.strength` as `'strong'|'moderate'|'weak'`.  
**Required**: Add `status: 'ACTIVE' | 'EMERGING' | 'LATENT' | 'BROKEN'` to `YogaResult`.

### Activation Checklist

```typescript
interface EnhancedYogaResult extends YogaResult {
  // New fields:
  status: 'ACTIVE' | 'EMERGING' | 'LATENT' | 'BROKEN';
  shadabalaGated: number;        // weakest planet's totalRupas
  activationDasha?: string;      // "Jupiter MD / Saturn AD"
  activationWindow?: string;     // "2027–2029"
  dashaLevel: 1 | 2 | 3 | 4 | 5;
  thereforeVerdict: string;      // Single forced conclusion
}
```

### Status Definitions

| Status | Criteria | Output Format |
|--------|----------|---------------|
| **ACTIVE** | Yoga planet is current MD/AD lord AND Shadbala ≥ 0.75 rupas AND divisional confirmed | Describe current manifestation. Include `[Level 4–5]` tag. |
| **EMERGING** | Dasha change within 12 months will activate a yoga planet as MD/AD | Name exact upcoming sequence: *"Emerging in Rahu MD / Venus AD, begins March 2026"* |
| **LATENT** | Natal promise exists, Shadbala adequate, but current Dasha doesn't touch it | *"This yoga is latent until [specific Dasha period]"* |
| **BROKEN** | Shadbala < 0.40 rupas OR combustion reduces below threshold OR conflicting malefic dominates | Describe obstruction. Probability without remedy: X% |

### Multiplicative Synthesis (Yoga Combinations)

When multiple yogas combine, apply multiplicative (not additive) synthesis:

| Combination | Synthesis |
|-------------|-----------|
| **Raj Yoga + Viparita Yoga** | Rise through adversity, scandal, or institutional collapse |
| **Neecha Bhanga + Raj Yoga** | Catastrophic early conditions → spectacular second-half reversal |
| **Gaja Kesari + Dhana Yoga** | Wealth through wisdom/public reputation |
| **Multiple Viparita Yogas** | Chaotic rise; power through disruption |
| **Rahu in 10th + Strong Sun** | Viral, unconventional world fame (`yogaService` + Layer 0) |
| **Viparita Raj Yoga + Rahu** | Fame from ashes/scandal — "virgin" only if self-transformed |
| **Neecha Bhanga Raj Yoga on 10th lord** | Greatest reversals produce greatest icons |

---

## LAYER 4 — DIVISIONAL SYNTHESIS

**Currently**: `divisionalChartsService.ts` computes D1–D12.  
**Currently missing**: The synthesis verdict that resolves D1 vs divisional conflicts.

### Forced Synthesis Table

When D1 and Divisionals conflict → synthesize into **one resolved statement**. Never present both sides.

| D1 | Divisional | Synthesis Verdict Template |
|----|-----------|---------------------------|
| Strong 7th | Weak D9 | *"The wedding happens, but the marriage requires conscious spiritual maturity to survive. [Level X: Dasha detail]"* |
| Strong 10th | Weak D10 | *"Ambition burns brightly, but this incarnation imposes a career ceiling — mastery comes through service to another's vision. [Level X]"* |
| Weak 7th | Strong D9 | *"Little early-life support for marriage, but the spouse arrives as a karmic teacher and the bond endures. [Level X]"* |
| Weak 10th | Strong D10 | *"Late bloomer. Early career frustration builds the exact discipline required for mid-life authority. [Level X]"* |
| Both Strong | — | Full delivery. Name the timing window. `[Level 4–5]` |
| Both Weak | — | *"The promise is redirected. The alternative life path is: [specify based on strongest remaining house]."* |

### Fame-Specific Divisional Verdicts

| D1 Fame | D10 | D60 | Verdict |
|---------|-----|-----|---------|
| Strong | Strong | Strong | *"Peak fame window — [Dasha Level] [years]"* |
| Strong | Weak | Any | *"Visibility without lasting empire; stays regional or collapses mid-career"* |
| Weak | Strong | Strong | *"Late fame; arrives after 40 or in final MD"* |
| Both Weak | Weak | — | *"The chart does not structurally support virgin world fame."* |

**Forbidden output**: *"D1 shows this, D9 shows that, so both are possible."*  
**Always replace with**: *"Therefore: [single verdict]."*

---

## LAYER 5 — ASPECT WEIGHING PROTOCOL

**Data source**: `src/services/aspectsService.ts`

| Aspect Type | Weight | Interpretation Rule |
|-------------|--------|---------------------|
| **Jaimini Sign Aspect** | 1.0× | Functional by sign ownership (`jaiminiService.rashiAspects`) |
| **Graha Drishti** | 0.8× | Modified by aspecting planet's `shadabalaService.totalRupas` |
| **Rahu/Ketu Aspect** | 0.9× | Karmic intensity; amplifies obsessions or sudden events |
| **Saturn Aspect** | 1.2× | Delays but **certifies**. Saturn aspect = "will happen, hard-won" |
| **Jupiter Aspect** | 1.1× | Protective; stabilizes weak placements |

### Critical Rules

- **Saturn aspect on 7th** → Does NOT deny marriage. Certifies it after delay and suffering.
- **Jupiter aspect on debilitated planet** → Does NOT cancel debility. Sustains native through the consequences.
- **Rahu aspect on 10th lord** → Viral/unconventional career expression. Only damaging if Shadbala already weak.
- **Saturn aspect on AL** → Delayed but cemented legacy. Hard-won public image that outlasts the person.

---

## LAYER 6 — DASHA LEVELS 1–5

**Data source**: `dashaService.ts` → `DashaPeriod.isActive`, `AntarDasha.isActive`  
**Currently missing**: The Level tag is not applied to any output in the codebase.

### Level Definitions

| Level | Label | Precision | Activation Criteria |
|-------|-------|-----------|---------------------|
| **5** | Maximum Convergence | Within 18 months — exact months | Natal promise + divisional confirmation + Shadbala ≥1.25 + active MD/AD + double transit active |
| **4** | High Confidence | Within 2–3 years | All layers except live transit; strong Dasha running |
| **3** | Moderate | Within Dasha period (5–7 yrs) | Promise + activation; Shadbala moderate (0.75–1.25) |
| **2** | Conditional | Future Dasha named | Promise exists; current Dasha blocks. Tell user: *"Wait for [MD] running [years]."* |
| **1** | Latent | Lifetime potential only | Promise weak or absent; remedy required |

### Required Output Format

Every prediction sentence in every output must end with a Level tag:

```
[Level 4: Jupiter MD / Saturn AD, 2027–2029]
[Level 5: Venus MD / Moon AD, March–September 2026]
[Level 2: Rahu MD begins 2031; current Saturn MD blocks until then]
[Level 1: Promise latent; Neecha Bhanga unrealized without sustained remedy]
```

### Implementation Hook

```typescript
// In classicalAnswerEngine.ts → timing section
// Currently: produces TimingWindow[] with label + basis + confidence (strong/moderate/weak)
// Required enhancement: map confidence → Level, add Dasha lord names to label

interface EnhancedTimingWindow extends TimingWindow {
  dashaLevel: 1 | 2 | 3 | 4 | 5;
  mdLord: string;
  adLord: string;
  levelTag: string;  // "[Level 4: Jupiter MD / Saturn AD, 2027–2029]"
}
```

---

## LAYER 7 — DOUBLE TRANSIT PROTOCOL

**Currently**: `dynamicTransitService.ts` calculates individual planet transits.  
**Missing**: Jupiter + Saturn simultaneous check. Single transits are not labelled as temporary-only.

### Interpretation Matrix

| Pattern | Meaning | Output Label |
|---------|---------|-------------|
| **Jupiter transits house + Saturn aspects same** | Event **CERTIFIED** — permanent | `DOUBLE_TRANSIT_CERTIFIED` |
| **Jupiter aspects + Saturn transits same house** | Event **SUPPORTED** — easier than expected | `DOUBLE_TRANSIT_SUPPORTED` |
| **Both Jupiter AND Saturn transiting same house** | **PEAK WINDOW** — maximum pressure to manifest | `DOUBLE_TRANSIT_PEAK` |
| **Only Jupiter active** | Temporary window; blessings without structure | `SINGLE_TRANSIT_TEMPORARY — Jupiter only` |
| **Only Saturn active** | Pressure without expansion; test without reward | `SINGLE_TRANSIT_TEMPORARY — Saturn only` |
| **Neither active** | No transit ignition. State next convergence window. | `NO_TRANSIT_IGNITION` |

### Domain Applications

| Domain | What Double Transit Certifies |
|--------|-------------------------------|
| Marriage | Both on 7th / 7th lord / UL → Marriage formalization |
| Career | Both on 10th / 10th lord / A10 → Authority event (promotion, recognition) |
| Fame | Both on 10th / AL or their lords → Legacy-level career event |
| Wealth | Both on 2nd/11th → Structural wealth increase |
| Children | Both on 5th / 5th lord → Pregnancy or birth |

### Implementation Hook

```typescript
// New function to add to dynamicTransitService.ts:
function checkDoubleTransit(
  houseOrPoint: number | string,
  jupiterTransits: TransitData[],
  saturnTransits: TransitData[]
): DoubleTransitResult {
  const jupiterActive = jupiterTransits.some(t => t.house === houseOrPoint || t.aspectsHouse === houseOrPoint);
  const saturnActive = saturnTransits.some(t => t.house === houseOrPoint || t.aspectsHouse === houseOrPoint);
  
  if (jupiterActive && saturnActive) return { type: 'DOUBLE_TRANSIT_CERTIFIED', label: '...' };
  if (jupiterActive) return { type: 'SINGLE_TRANSIT_TEMPORARY', activePlanet: 'Jupiter' };
  if (saturnActive) return { type: 'SINGLE_TRANSIT_TEMPORARY', activePlanet: 'Saturn' };
  return { type: 'NO_TRANSIT_IGNITION' };
}
```

---

## LAYER 8 — ARUDHA PSYCHOLOGY

**Data source**: `jaiminiService.ts` → `PadaLagna` (= Arudha Lagna, AL)  
**Currently missing**: The `PadaLagna` result is computed but never used to drive a psychological narrative in interpretation output. UL, A4, A10 are not surfaced.

### AL Position Psychological Map

| AL Position from Lagna | Psychological Mask | Core Tension |
|------------------------|-------------------|--------------|
| **1st** | No mask. World sees you as you are. Vulnerable but authentic. | Authenticity vs. exposure |
| **2nd** | Identity = wealth/speech/family. "I am what I own/say." | Worth vs. value |
| **3rd** | The warrior-mask. Courage and competition define perceived identity. | Action vs. inner stillness |
| **4th** | Nurturing/protective image. Home and emotional safety are the stage. | Care-giving vs. receiving |
| **5th** | Creative/authority image. Seen as brilliant or entitled. | Creation vs. ego |
| **6th** | Service/conflict image. Seen through work or through enemies. | Service vs. recognition |
| **7th** | Relationship mirror. Identity exists only in partnership. | Union vs. self |
| **8th** | Mystery/transformation image. Inscrutable. Taboo as brand. | Concealment vs. revelation |
| **9th** | Guru/guide image. The wise foreigner or spiritual authority. | Knowledge vs. wisdom |
| **10th** | Career/public achievement as identity. The workaholic mask. | Achievement vs. being |
| **11th** | Network/visionary image. Known by associations and causes. | Vision vs. belonging |
| **12th** | Hidden/self-undoing image. Fame through loss or exile. | Sacrifice vs. surrender |

### Required Arudha Readings (All Mandatory)

| Arudha | Meaning | Computation |
|--------|---------|-------------|
| **AL** (Pada of 1st lord) | Core self-image tension | `jaiminiService.padaLagna` |
| **UL** (Pada of 12th lord) | Marriage perception — how native experiences vs. how others see their marriage | Compute from 12th lord |
| **A10** (Pada of 10th lord) | Career perception — public status vs. private ambition | Compute from 10th lord |
| **A4** (Pada of 4th lord) | Home/comfort perception — inner security vs. displayed stability | Compute from 4th lord |

### Mandatory Narrative Template

```
"AL in the [Nth] from Lagna: [Psychological mask statement]. 
[Inner state] privately, but [outer projection] publicly. 
[Specific gap consequence]. 
Therefore: [What must shift for the promise to arrive]."
```

**Example (AL in 10th from Lagna):**  
*"AL in the 10th from Lagna: You are privately uncertain but publicly unstoppable. The world believes in your competence more than you do. The gap creates a performance anxiety that is invisible to everyone except you. Therefore: Success arrives when you stop performing competence and start embodying it. [Level 3: Current Saturn MD is the crucible — 2024–2043]"*

### Fame Emphasis
- **Large AL-Lagna gap + Rahu influence** → Persona becomes a global brand bigger than the person. Psychologically exhausting.
- **AL in 10th/11th + Rahu** → World worships or devours the image. AL lord's `totalRupas` determines which.

---

## LAYER 9 — CONFLICT RESOLUTION: THE "THEREFORE:" CLAUSE

**Currently**: `classicalAnswerEngine.ts` generates 5 sections (Direct Answer, Reasoning, Timing, Risks, Remedies) but **never forces a single verdict** when factors conflict.  
**Required enhancement**: Add a `thereforeClause` field to `ClassicalAnswer`.

### Protocol

```
STEP 1: State the conflict in one sentence.
"D10 shows [X], but D1 shows [Y]."

STEP 2: Apply Five-Layer Hierarchy to weight the factors.
"Layer 3 (Shadbala) gives the casting vote: [planet] at [rupas] means [consequence]."

STEP 3: Emit the forced verdict.
"Therefore: [Single unambiguous conclusion]. [Level X: Dasha detail]"
```

### Implementation Hook

```typescript
// Enhancement to ClassicalAnswer interface in classicalAnswerEngine.ts:
interface EnhancedClassicalAnswer extends ClassicalAnswer {
  thereforeClause: {
    conflict: string;          // "D10 shows X but D1 shows Y"
    weightingLayer: string;    // "Layer 3 (Shadbala): Mars at 0.55 rupas"
    verdict: string;           // The forced conclusion
    dashaLevel: 1|2|3|4|5;
    levelTag: string;
  };
  convergenceScore: number;    // 0–100, overall confidence
}
```

### Forbidden Outputs

| Forbidden | Required Replacement |
|-----------|---------------------|
| *"D1 shows X, D9 shows Y, so both are possible."* | *"Therefore: [single verdict]."* |
| *"This might happen in the next few years..."* | *"[X]% probability. [Level Y: Dasha detail]."* |
| *"Jupiter is transiting your 7th, so marriage is possible."* | Double Transit check first. If only Jupiter: *"Temporary window only — not structural change."* |

---

## LAYER 10 — FAILURE MODE & PROBABILITY ENGINE

**Currently**: `aiPredictionService.ts` has `confidence: number` (0–100) but it's derived from hardcoded tables, not actual Shadbala + Dasha Level.  
**Required**: Replace hardcoded confidence with Shadbala-driven probability + single weakest planet target.

### Required Block (Every Reading)

```markdown
**Failure Mode Analysis**

- **Obstruction**: [Planet X] in [house] with [Y] rupas Shadbala (tier: [tier name]),
  unconfirmed in [divisional chart]. Mechanism: [why this blocks the promise].

- **Probability without intervention**: [X]%

- **Probability with intervention**: [Y]%
  (requires [specific remedy] sustained for [timeframe])

- **Intervention Target**: [Single planet name] — [totalRupas] rupas —
  [Exactly why this is the single point of failure in this promise chain]
```

### Probability Calibration Engine

```typescript
function calculateProbability(
  shadabalaScore: number,    // weakest yoga planet's totalRupas
  dashaLevel: 1|2|3|4|5,
  divisionalConfirmed: boolean,
  doubleTransitActive: boolean,
  neechaBhangaActive: boolean
): { withoutRemedy: number; withRemedy: number } {
  let base = 0;
  
  // Shadbala contribution (0–40 points)
  if (shadabalaScore >= 1.25) base += 40;
  else if (shadabalaScore >= 0.75) base += 25;
  else if (shadabalaScore >= 0.40) base += 10;
  else base += 0;
  
  // Dasha Level contribution (0–30 points)
  base += (dashaLevel - 1) * 7.5;
  
  // Divisional confirmation (+15)
  if (divisionalConfirmed) base += 15;
  
  // Double Transit (+10)
  if (doubleTransitActive) base += 10;
  
  // Neecha Bhanga active (+5 bonus to withRemedy)
  const withoutRemedy = Math.min(95, Math.round(base));
  const withRemedy = Math.min(95, Math.round(base + (neechaBhangaActive ? 25 : 15)));
  
  return { withoutRemedy, withRemedy };
}
```

---

## LAYER 11 — PSYCHOLOGICAL PROFILE OBJECT

**Data sources**:  
- `nakshatraService.ts` → Nakshatra name/lord for all planets  
- `jaiminiService.ts` → Rahu/Ketu placement (house, rashi, nakshatra)  
- `shadabalaService.ts` → Saturn position and aspects  

**Currently missing**: These three services' data is never assembled into a unified psychological profile.

### A. Nakshatra Fear Architecture

Map all planetary Nakshatra placements to core fear patterns:

| Nakshatra Group | Core Fear | Manifestation Pattern |
|-----------------|-----------|----------------------|
| **Ashwini–Bharani–Krittika** | Fear of insignificance / annihilation | Hyperactivity, impulsivity, burnout |
| **Rohini–Mrigashira–Ardra** | Fear of abandonment / loss of love | Clinging, manipulation, emotional volatility |
| **Punarvasu–Pushya–Ashlesha** | Fear of uncertainty / need for control | Hoarding, anxiety, digestive disorders |
| **Magha–Purva Phalguni–Uttara Phalguni** | Fear of obscurity / loss of lineage | Narcissism, status obsession, ancestral debt |
| **Hasta–Chitra–Swati** | Fear of imperfection / exposure | Perfectionism, people-pleasing, craft obsession |
| **Vishakha–Anuradha–Jyeshtha** | Fear of betrayal / powerlessness | Control battles, jealousy, chronic trust issues |
| **Mula–Purva Ashadha–Uttara Ashadha** | Fear of meaninglessness / chaos | Fanaticism, addiction, philosophical extremism |
| **Shravana–Dhanishta–Shatabhisha** | Fear of disconnection / isolation | Gossip, fame-seeking, technological obsession |
| **Purva Bhadrapada–Uttara Bhadrapada–Revati** | Fear of endings / the unknown | Martyrdom, escapism, spiritual bypassing |

### B. Rahu/Ketu Karmic Statement

**Single mandatory paragraph** naming:
- Rahu's house/sign/Nakshatra → the **obsession** and foreign element this lifetime seeks
- Ketu's house/sign/Nakshatra → the **mastery already completed** and avoidance pattern
- The Rahu-Ketu axis tension → the specific karmic curriculum

### C. Saturn Wound Statement

**Single mandatory paragraph** identifying:
- Saturn's house/sign/Nakshatra → the structural wound (where time and limitation first hurt)
- Saturn's aspects on which houses → where native overcompensates through control or collapses through inadequacy
- Saturn's Dasha timing → when the wound is reactivated for healing

### D. Synthesis Narrative (3 sentences)

A 3-sentence summary of the native's core psychological operating system based on A + B + C.

### JSON-Ready Output

```json
{
  "psychologicalProfile": {
    "nakshatra_fear": {
      "lagna_nakshatra": "[name]",
      "core_fear": "[fear pattern]",
      "manifestation": "[behavioral pattern]"
    },
    "rahu_ketu_karmic_statement": "[single paragraph]",
    "saturn_wound_statement": "[single paragraph]",
    "synthesis_narrative": "[3 sentences]"
  }
}
```

---

## LAYER 12 — BEHAVIORAL REMEDY ENGINE (Six-Layer Stack)

**Currently**: `remediesService.ts` has good raw materials — mantra, charity, fasting, ritual, gemstone — but they are **generic** (not diagnostically targeted to the single weakest planet in the specific promise chain identified in Layer 10).

**Required enhancement**: Assemble a 6-layer stack that begins with the weakest planet from Layer 10.

### The Six Layers

| Layer | Type | Content Requirement |
|-------|------|---------------------|
| **1. Behavioral** *(Primary)* | Concrete daily action | Observable, trackable, tied to the planet's domain. Specific time/duration. NOT generic. |
| **2. Psychological** | Inner reframe | Directly addresses the Nakshatra fear (Layer 11A) or Saturn wound (Layer 11C) |
| **3. Spiritual** | Named mantra + count + mechanism | Exact Sanskrit mantra, daily count, timing, and HOW it mechanically strengthens the planet |
| **4. Practical** | Material/lifestyle | Dietary, scheduling, or environmental change tied to the planet's element/dosha |
| **5. Karmic** | Service | How to discharge the planetary debt through specific service to others |
| **6. Ritual** | Optional ceremonial | Weekday, offering, temple protocol. Day-specific. |

### Planet-Specific Rules (Behavioral Layer)

| Weakest Planet | Layer 1 Must Involve | Generic Remedy to Avoid |
|----------------|---------------------|--------------------------|
| **Saturn** | Discipline and delay tolerance — structured commitment practice | "Wear blue sapphire" without behavioral anchor |
| **Venus** | Receiving pleasure without guilt; giving beauty without expectation | "Friday fast" only |
| **Mercury** | Communication practice — reading aloud, structured writing, teaching | Generic green color therapy |
| **Mars** | Physical discipline, courage exercises, controlled assertion | Red coral without action plan |
| **Jupiter** | Teaching or expanding another's knowledge; structured giving | Yellow sapphire only |
| **Moon** | Emotional regulation practice, water contact, nurturing acts | Generic pearl only |
| **Sun** | Leadership practice, daily public action, solar exposure before 8 AM | Ruby only |
| **Rahu** | Confronting the obsession consciously; channeling foreign energy productively | Hessonite only |
| **Ketu** | Releasing the past pattern; structured detachment practice | Cat's eye only |

### Assembly Logic

```typescript
// In src/services/remediesService.ts — new function:
function assembleSixLayerStack(
  weakestPlanet: string,
  weakestPlanetRupas: number,
  nakshatraFear: NakshatraFear,
  saturnWound: SaturnWound,
  queryContext: QueryContext
): SixLayerRemedyStack {
  // Layer 1: Get planet-specific behavioral action (NOT generic gemstone)
  const behavioral = getPlanetBehavioralRemedy(weakestPlanet, queryContext);
  
  // Layer 2: Reframe the Nakshatra fear identified in Layer 11
  const psychological = getReframe(nakshatraFear, weakestPlanet);
  
  // Layer 3: Get from mantraService.ts — already has planet-specific mantras
  const spiritual = getMantrasByPlanet(weakestPlanet)[0];
  
  // Layer 4: Dietary/lifestyle from practicalRemedies database
  const practical = getPracticalRemedy(weakestPlanet);
  
  // Layer 5: Service-based karmic discharge
  const karmic = getKarmicService(weakestPlanet);
  
  // Layer 6: From existing remediesService FASTING_DATABASE + ritual database
  const ritual = getRitualRemedy(weakestPlanet);
  
  return { behavioral, psychological, spiritual, practical, karmic, ritual };
}
```

---

## LAYER 13 — VIRGIN WORLD FAME VERDICT

**Trigger**: Layer 0 score ≥60.  
**Service hook**: Output block appended to all fame-related readings.

### Required Output Block

```markdown
**VIRGIN WORLD FAME VERDICT**

- **Score (0–100)**: [X]/100 — [Tier: Historic / Global / National+Niche / Denied]
- **Probability without remedy**: [X]%
- **Probability with remedy**: [Y]%
- **Peak Window**: [Level X: Dasha detail + exact years]
- **Nature of Fame**: [Viral / Respected / Disruptive / Enduring / Controversial / Transformational]
- **Longevity**: [Transient / Generational / Mythic]
- **Weakest Fame Planet**: [Planet] — [totalRupas] rupas — [Specific deficiency]
- **Fame Remedy Target**: [Single most impactful behavioral intervention from Layer 12]
```

### Probability Calibration Table

| Condition | Adjustment |
|-----------|-----------|
| Rahu + Sun both ≥1.5 rupas in D1 + D10 confirmed | +40% |
| 10th lord Vargottama | +20% |
| AL in 10th/11th + Jupiter aspect | +15% |
| Saturn aspect on AL without Jupiter support | −20% (but certifies endurance) |
| Sun < 0.75 rupas | −30% (fame without fulfillment) |
| Rahu over-amplified without Sun anchor (Sun < 0.75) | −35% (scandal risk) |
| D60 debilitation of Sun/10th lord | −25% |
| Active Neecha Bhanga Raj Yoga on 10th lord | +30% |

---

## MANDATORY OUTPUT ARCHITECTURE

Every reading emits in this exact structure:

```
1. EXECUTIVE VERDICT (2–3 sentences)
   → Answer the exact question. No hedging. Fame probability upfront if relevant.

2. LAYER-BY-LAYER CONVERGENCE ANALYSIS
   → Each layer labeled. Conflicts identified. All conflicts resolve before proceeding to next layer.

3. PSYCHOLOGICAL PROFILE OBJECT
   → Layer 11 full output. JSON-ready.

4. VIRGIN WORLD FAME ANALYSIS [fame queries only]
   → Layer 0 score + Layer 13 verdict block.

5. FAILURE MODE & PROBABILITIES
   → Layer 10 full block: obstruction, X%/Y%, single target planet.

6. SIX-LAYER REMEDY STACK
   → Layer 12 full stack, diagnostically tied to weakest planet from Layer 10.

7. DASHA TIMELINE WITH LEVELS
   → All predictions tagged [Level X: Dasha]. Double transit windows named.
```

---

## INTEGRATION MAP — WHERE TO ADD EACH LAYER

| Layer | File to Create / Modify | What to Add |
|-------|------------------------|-------------|
| 0 | `src/services/virginWorldFameService.ts` (NEW) | 7-point scoring function |
| 1 | `src/services/interpretationEngine.ts` (NEW) | `checkNatalPromise()` + convergence orchestrator |
| 2 | `src/services/shadabalaService.ts` (MODIFY) | Add `vargottama`, `combustionModified`, `neechaBhangaActive` fields to `ShadabalaResult` |
| 3 | `src/services/yogaService.ts` (MODIFY) | Add `status`, `dashaLevel`, `thereforeVerdict` to `YogaResult` |
| 4 | `src/services/divisionalChartsService.ts` (MODIFY) | Add `synthesisVerdict` output when D1 vs divisional conflict |
| 5 | `src/services/aspectsService.ts` (MODIFY) | Add weighted aspect scoring with Saturn 1.2× / Jupiter 1.1× |
| 6 | `src/services/classicalAnswerEngine.ts` (MODIFY) | Add `dashaLevel` + `levelTag` to all `TimingWindow` outputs |
| 7 | `src/services/dynamicTransitService.ts` (MODIFY) | Add `checkDoubleTransit()` function |
| 8 | `src/services/jaiminiService.ts` (MODIFY) | Expose UL, A4, A10; add `alLagnaGapNarrative` |
| 9 | `src/services/classicalAnswerEngine.ts` (MODIFY) | Add `thereforeClause` field to `ClassicalAnswer` |
| 10 | `src/services/aiPredictionService.ts` (MODIFY) | Replace hardcoded tables with `calculateProbability()` from Shadbala |
| 11 | `src/services/psychologicalProfileService.ts` (NEW) | Assemble from nakshatraService + jaiminiService + shadabalaService |
| 12 | `src/services/remediesService.ts` (MODIFY) | Add `assembleSixLayerStack()` function |
| 13 | `src/services/virginWorldFameService.ts` (NEW) | `getFameVerdict()` function |

---

## TONE & PHILOSOPHICAL GROUNDING

**Authoritative**: State conclusions without apology.  
**Precise**: Every claim tagged with a Shadbala score, Dasha Level, or probability.  
**Compassionate**: Difficulty = curriculum, not curse. Probability and remedy always included.  
**Unflinching on fame**: False hope is cruelty. Honest impossibility with a remedy path is service.  
**No fatalism**: The chart is hardware. The native is the programmer. Karma is the OS; consciousness is the upgrade.

---

## QUICK REFERENCE — FORBIDDEN OUTPUT PATTERNS

| Forbidden | Required Replacement |
|-----------|---------------------|
| *"This might happen..."* | *"[X]% probability in [Dasha]. [Level Y]."* |
| *"D1 shows this, D9 shows that, so both are possible."* | *"Therefore: [single forced verdict]."* |
| *"Wear a gemstone for [planet]."* | Full 6-Layer Stack targeting the specific deficiency in the specific promise chain |
| *"Jupiter is transiting your 7th, marriage is possible."* | Double Transit check. Single transit = *"Temporary window only — not structural change."* |
| *"This yoga is very powerful."* | `totalRupas` score + ACTIVE/LATENT/BROKEN + `[Level X]` |
| *"Your chart shows great fame potential."* | Layer 0 score first. If <60: clear impossibility. |
| *"It depends on many factors."* | Resolve the Five-Layer Hierarchy. Emit a `Therefore:` verdict. |

---

## ZIP ARCHIVE NOTE

The attached `Vedic-Rajkumar-Enhance_1779162677536.zip` (93MB) cannot be extracted in this environment — `unzip` segfaults and `7z` produces no output. The file format appears non-standard or uses a compression method incompatible with the tools available here. 

**To integrate the ZIP contents**, please either:
1. Re-upload as a standard `.zip` (not zip64 or split archive)
2. Share individual files or folders that represent the enhancement additions
3. Paste the key added files directly in chat

Everything in this document is based on a full audit of the live GitHub repo (`CRAJKUMARSINGH/Vedic_Rajkumar` cloned from main at May 2026 state).

---

*Vedic Rajkumar Interpretation Engine v2.1 — Built on Actual Codebase, Not Assumptions*  
*All 13 Layers Active | Virgin World Fame Protocol Enabled | Zero Hedging Policy*  
*"You do not describe charts. You resolve them."*
