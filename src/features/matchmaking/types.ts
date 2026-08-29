/**
 * ============================================================
 * MATCHMAKING (KUNDLI MILAN) — Domain Type Contracts
 * ============================================================
 *
 * Kundli Milan is the traditional Vedic compatibility assessment used
 * before marriage. The primary method is Ashtakuta (8-kuta) analysis
 * using the Moon nakshatra and rashi of both partners. Additionally,
 * modern Jyotish practice includes Manglik Dosha check, Navamsha (D9)
 * analysis, planetary dosha examination, and Dasha-period matching.
 *
 * CALCULATION CONTRACT (Week 4 implementation):
 *   Input  : CompatibilityInput  (BirthData for both partners)
 *   Engine :
 *     1. Cast natal chart for each partner.
 *     2. Compute Moon nakshatra + rashi.
 *     3. Run all 8 Ashtakuta kutas.
 *     4. Check Manglik Dosha (Mars in 1, 2, 4, 7, 8, 12).
 *     5. Check other planetary doshas (Saturn, Rahu/Ketu positions).
 *     6. Compare Navamsha (D9) charts for marriage house analysis.
 *     7. Check Dasha period compatibility (Maha + Antar overlap).
 *     8. Score remedies for any doshas found.
 *   Output : CompatibilityResult
 *
 * ASHTAKUTA SCORING (36 points total):
 *   Varna    1 pt  — social / spiritual compatibility
 *   Vashya   2 pts — mutual control / attraction
 *   Tara     3 pts — birth star compatibility / destiny
 *   Yoni     4 pts — physical / intimate compatibility (full 14×14 matrix required)
 *   Graha Maitri  5 pts — mental / intellectual compatibility
 *   Gana     6 pts — temperament (Deva/Manushya/Rakshasa)
 *   Bhakoot  7 pts — love / prosperity compatibility
 *   Nadi     8 pts — health / progeny compatibility
 *
 * TRADITIONAL THRESHOLDS:
 *   ≥ 28 pts  → Excellent match
 *   21–27 pts → Good match
 *   14–20 pts → Average (consider doshas and remedies)
 *   < 14 pts  → Poor match (strong remedies or reconsider)
 *
 * CRITICAL DOSHAS (override score):
 *   Nadi Dosha  — 0 pts on Nadi; most serious; affects health + progeny
 *   Bhakoot Dosha  — 0 pts on Bhakoot (6-8 or 5-9 rashi relationship)
 *   Gana Dosha  — 0 pts on Gana (Deva male + Rakshasa female)
 *   Manglik Dosha  — Mars in houses 1,2,4,7,8,12 in either chart
 *
 * DOSHA CANCELLATION:
 *   Traditional texts list several conditions that cancel doshas.
 *   Each DomsaCheck must report cancellation conditions checked.
 *
 * KNOWN CURRENT GAPS (addressed in this file as contracts):
 *   - Incomplete Yoni matrix (only Horse & Elephant fully mapped)  → see YoniAnimal full matrix
 *   - No Manglik check  → ManglikDoshaCheck interface below
 *   - No planetary dosha checks  → PlanetaryDoshaCheck interface below
 *   - No Navamsha comparison  → NavamshaCompatibility interface below
 *   - No Dasha matching  → DashaPeriodMatch interface below
 *   - No PDF report  → CompatibilityPdfOptions interface below
 *   - No multi-prospect comparison  → ProspectComparison interface below
 * ============================================================
 */

import type { BirthData, Planet, Sign, ChartResult, DashaPeriod } from '@/features/kundli/types';

// ─── Input ────────────────────────────────────────────────────────────────────

/** Both partners' birth details. */
export interface CompatibilityInput {
  /** Typically the male / first partner. */
  person1: BirthData;

  /** Typically the female / second partner. */
  person2: BirthData;
}

// ─── Ashtakuta — individual kuta results ─────────────────────────────────────

/**
 * Result for a single kuta category.
 * All 8 kutas share this shape.
 */
export interface KutaResult {
  /**
   * Kuta name.
   * One of: 'Varna' | 'Vashya' | 'Tara' | 'Yoni' |
   *         'Graha Maitri' | 'Gana' | 'Bhakoot' | 'Nadi'
   */
  kuta: string;

  /** Points scored in this kuta. */
  scored: number;

  /** Maximum possible points for this kuta. */
  maxPoints: number;

  /** Compatibility rating for this kuta. */
  rating: 'Excellent' | 'Good' | 'Average' | 'Poor';

  /** English description of the result and reasoning. */
  descriptionEn: string;

  /** Hindi description of the result and reasoning. */
  descriptionHi: string;

  /**
   * Dosha specific to this kuta, if applicable.
   * e.g. Nadi Dosha when same Nadi; Bhakoot Dosha for 6-8 position.
   */
  dosha?: {
    name: string;
    present: boolean;
    cancelled: boolean;
    cancellationReason?: string;
  };

  /** Raw intermediate values (for debugging and transparency). */
  details: Record<string, unknown>;
}

// ─── Full Yoni matrix (all 14 animals, complete 14×14 scoring) ───────────────

/**
 * The 14 Yoni animals derived from nakshatras.
 * Complete mapping (each nakshatra → one animal):
 *   Ashwini, Shatabhisha   → Horse
 *   Bharani, Revati        → Elephant
 *   Krittika, Pushya       → Goat
 *   Rohini, Mrigashira     → Serpent
 *   Ardra, Mula            → Dog
 *   Punarvasu, Ashlesha    → Cat
 *   Magha, Purva Phalguni  → Rat
 *   Uttara Phalguni        → Cow
 *   Uttara Bhadrapada      → Cow
 *   Hasta                  → Buffalo
 *   Swati                  → Buffalo
 *   Chitra, Vishakha       → Tiger
 *   Anuradha, Jyeshtha     → Deer
 *   Purva Ashadha, Shravana→ Monkey
 *   Uttara Ashadha         → Mongoose
 *   Dhanishtha             → Lion
 *   Purva Bhadrapada       → Lion
 */
export type YoniAnimal =
  | 'Horse' | 'Elephant' | 'Goat' | 'Serpent' | 'Dog'
  | 'Cat' | 'Rat' | 'Cow' | 'Buffalo' | 'Tiger'
  | 'Deer' | 'Monkey' | 'Lion' | 'Mongoose';

/**
 * Full 14×14 Yoni compatibility scoring matrix (0–4 points).
 * Row = person1 animal, Column = person2 animal.
 *
 * Rules (BPHS-aligned):
 *   Same animal        → 4 pts (Excellent)
 *   Friendly pair      → 3 pts (Good)
 *   Neutral pair       → 2 pts (Average)
 *   Inimical pair      → 1 pt  (Poor)
 *   Enemy pair (Vedha) → 0 pts (Very Poor)
 *
 * Traditional enemy pairs (0 points):
 *   Horse–Buffalo, Elephant–Lion, Goat–Monkey, Serpent–Mongoose,
 *   Dog–Deer, Cat–Rat, Cow–Tiger
 *   (symmetric — A enemy of B ⟺ B enemy of A)
 *
 * This type is used as the lookup key in the engine's scoring table.
 */
export type YoniMatrix = Record<YoniAnimal, Record<YoniAnimal, 0 | 1 | 2 | 3 | 4>>;

// ─── Ashtakuta overall ────────────────────────────────────────────────────────

/** Result of the complete 8-kuta analysis. */
export interface AshtakutaResult {
  /** All 8 kuta scores. */
  kutas: KutaResult[];

  /** Sum of all kuta scored points. Range [0, 36]. */
  totalPoints: number;

  readonly maxPoints: 36;

  /** Percentage score [0, 100]. */
  percentage: number;

  /** Overall compatibility tier. */
  overallRating: 'Excellent' | 'Good' | 'Average' | 'Poor';

  /** Critical doshas present (Nadi, Bhakoot, Gana). */
  criticalDoshas: string[];
}

// ─── Manglik Dosha ────────────────────────────────────────────────────────────

/**
 * Mars (Mangal) placed in houses 1, 2, 4, 7, 8, or 12 from Lagna,
 * Moon, or Venus creates Manglik Dosha (also called Kuja Dosha).
 * Traditions vary — some count from Lagna only.
 *
 * SEVERITY:
 *   Mars in 7th or 8th → High (affects marriage directly)
 *   Mars in 1st or 4th → Medium
 *   Mars in 2nd or 12th → Low
 *
 * CANCELLATION CONDITIONS (classical texts):
 *   - Both partners are Manglik
 *   - Mars is in its own sign (Aries/Scorpio) or exalted (Capricorn)
 *   - Mars is aspected by Jupiter or benefic Venus
 *   - Mars is in the 2nd from Lagna but owns the 7th house
 *   - Native born on Tuesday (some texts)
 */
export interface ManglikDoshaCheck {
  /** Whether Manglik Dosha is present (any level of severity). */
  isPresent: boolean;

  /**
   * Which reference points triggered the dosha.
   * Typically checked from Lagna, Moon, Venus.
   */
  triggeredFrom: Array<{
    reference: 'Lagna' | 'Moon' | 'Venus';
    marsHouse: number;
    severity: 'High' | 'Medium' | 'Low';
  }>;

  /** Whether the dosha is cancelled by a classical exception. */
  isCancelled: boolean;

  /** Names of the cancellation conditions that apply. */
  cancellationConditions: string[];

  /**
   * Remedies if dosha is present and not cancelled.
   * Ordered by traditional priority.
   */
  remedies: string[];
}

// ─── Planetary Dosha Checks ───────────────────────────────────────────────────

/**
 * Checks for Saturn, Rahu, and Ketu placements that can create
 * afflictions relevant to marriage and partner compatibility.
 *
 * KEY CHECKS:
 *   Saturn in 7th  → delays / responsibilities in marriage
 *   Rahu in 7th    → unconventional relationships; foreign partner
 *   Ketu in 7th    → detachment; spiritual incompatibility
 *   Saturn+Mars together or aspecting 7th → conflicts
 *   Rahu/Ketu axis through 1st/7th → karmic relationship pattern
 */
export interface PlanetaryDoshaCheck {
  planet: Planet;

  /** The specific dosha or affliction type. */
  doshaType: string;

  /** Whether this dosha is present in person1's chart. */
  person1Present: boolean;

  /** Whether this dosha is present in person2's chart. */
  person2Present: boolean;

  /** Severity of the affliction. */
  severity: 'High' | 'Medium' | 'Low' | 'None';

  /** Impact description (marriage-specific). */
  impact: string;

  /** Whether the dosha is mutually cancelled (both partners have it). */
  mutualCancellation: boolean;

  /** Suggested remedies. */
  remedies: string[];
}

// ─── Navamsha (D9) Compatibility ─────────────────────────────────────────────

/**
 * D9 (Navamsha) is the most important Varga for marriage analysis.
 * Strong and well-placed Venus and 7th house in both D9 charts
 * indicates a happy, fulfilling marriage.
 *
 * KEY POINTS TO CHECK:
 *   - Venus in own sign (Taurus/Libra) or exalted (Pisces) in D9
 *   - 7th house lord in D9 strong and unafflicted
 *   - Mutual exchange or aspect between the two D9 charts (synastry)
 *   - Atmakaraka + Darakaraka strength in D9
 */
export interface NavamshaCompatibility {
  /** D9 chart for person1. */
  person1D9: ChartResult;

  /** D9 chart for person2. */
  person2D9: ChartResult;

  /** Venus strength in person1's D9: sign it occupies. */
  person1VenusD9Sign: Sign;

  /** Venus strength in person2's D9: sign it occupies. */
  person2VenusD9Sign: Sign;

  /** 7th house of person1's D9 and its lord. */
  person1Seventh: { sign: Sign; lord: Planet; lordStrength: 'Strong' | 'Average' | 'Weak' };

  /** 7th house of person2's D9 and its lord. */
  person2Seventh: { sign: Sign; lord: Planet; lordStrength: 'Strong' | 'Average' | 'Weak' };

  /**
   * Summary rating of D9 compatibility.
   * Based on Venus placement, 7th house condition, and inter-chart synastry.
   */
  rating: 'Excellent' | 'Good' | 'Average' | 'Weak';

  /** Narrative explanation of D9 findings (English). */
  summaryEn: string;
}

// ─── Dasha Period Matching ────────────────────────────────────────────────────

/**
 * Checks whether the current and upcoming Dasha periods of both
 * partners are compatible and indicate the right time for marriage.
 *
 * Favourable Mahadashas for marriage: Venus, Jupiter, Moon (7th lord period).
 * Unfavourable for marriage: Saturn, Rahu (can bring delays), Ketu (detachment).
 *
 * The key question: are both partners in broadly supportive periods simultaneously?
 */
export interface DashaPeriodMatch {
  /** Current Mahadasha of person1. */
  person1CurrentMaha: { planet: Planet; endsAt: string };

  /** Current Mahadasha of person2. */
  person2CurrentMaha: { planet: Planet; endsAt: string };

  /**
   * Overlapping Antardasha periods where both charts show Venus/Jupiter/Moon.
   * These are the "green windows" for auspicious marriage timing.
   */
  auspiciousWindows: Array<{
    startDate: string;
    endDate: string;
    person1Dasha: string;
    person2Dasha: string;
    reason: string;
  }>;

  /**
   * Periods to avoid (Saturn Mahadasha + Rahu Antardasha overlap, etc.).
   */
  cautionWindows: Array<{
    startDate: string;
    endDate: string;
    reason: string;
  }>;

  /** Overall dasha compatibility summary. */
  summaryEn: string;

  /** Next 5 years of person1 dasha for display. */
  person1NextPeriods: DashaPeriod[];

  /** Next 5 years of person2 dasha for display. */
  person2NextPeriods: DashaPeriod[];
}

// ─── Remedies ─────────────────────────────────────────────────────────────────

/**
 * A single remedy prescription for a specific dosha or weakness.
 */
export interface CompatibilityRemedy {
  /** Which dosha or weakness this remedy addresses. */
  forDosha: string;

  /** Type of remedy. */
  type: 'puja' | 'mantra' | 'fast' | 'charity' | 'gemstone' | 'ritual' | 'general';

  /** Specific instruction (actionable, not vague). */
  instruction: string;

  /** Who should perform: person1, person2, or both. */
  performer: 'person1' | 'person2' | 'both';

  /** Timing or duration (e.g. "11 Mondays", "Before marriage"). */
  timing?: string;

  /** Planet targeted by this remedy. */
  targetPlanet?: Planet;
}

// ─── PDF Report Options ───────────────────────────────────────────────────────

/**
 * Configuration for generating a PDF compatibility report.
 * Passed to the PDF export service (Week 5+).
 *
 * The PDF must include:
 *   - Cover page with both names and date
 *   - Ashtakuta score table
 *   - Individual kuta details
 *   - Manglik and planetary dosha section
 *   - D9 analysis section
 *   - Dasha matching windows
 *   - Remedies section
 *   - Summary and recommendations
 */
export interface CompatibilityPdfOptions {
  /** Include the full Ashtakuta detail table. Default: true. */
  includeAshtakutaDetail?: boolean;

  /** Include Manglik Dosha section. Default: true. */
  includeManglikSection?: boolean;

  /** Include D9 Navamsha analysis. Default: true. */
  includeNavamshaSection?: boolean;

  /** Include Dasha period matching. Default: true. */
  includeDashaSection?: boolean;

  /** Include remedies section. Default: true. */
  includeRemedies?: boolean;

  /** Language for the report body text. Default: 'en'. */
  language?: 'en' | 'hi' | 'both';

  /** Person1 name override for the cover page. */
  person1DisplayName?: string;

  /** Person2 name override for the cover page. */
  person2DisplayName?: string;
}

// ─── Multi-prospect comparison ────────────────────────────────────────────────

/**
 * Summary of one prospect's compatibility — used in side-by-side comparison.
 * The full CompatibilityResult is linked by prospectId.
 */
export interface ProspectSummary {
  prospectId: string;

  /** Name of the prospect (person2). */
  name: string;

  /** Total Ashtakuta score [0, 36]. */
  ashtakutaScore: number;

  /** Overall compatibility rating. */
  overallRating: 'Excellent' | 'Good' | 'Average' | 'Poor';

  /** Whether Manglik Dosha is present (and not cancelled). */
  manglikDosha: boolean;

  /** Whether any critical dosha (Nadi/Bhakoot/Gana) is present. */
  criticalDosha: boolean;

  /** Strongest kuta for this pair. */
  bestKuta: { name: string; scored: number; maxPoints: number };

  /** Weakest kuta for this pair. */
  weakestKuta: { name: string; scored: number; maxPoints: number };

  /** Key shortcomings (max 5 bullet points). */
  shortcomings: string[];

  /** Key strengths (max 5 bullet points). */
  strengths: string[];
}

/**
 * Comparison of one base person against multiple prospects.
 * Used in the "compare multiple prospects" view.
 */
export interface ProspectComparison {
  /** The base person (typically the male / person1). */
  basePerson: BirthData;

  /** Ranked list of prospects — highest score first. */
  prospects: ProspectSummary[];

  /**
   * The recommended prospect ID based on combined score + dosha check.
   * May differ from highest scorer if a higher-scorer has critical doshas.
   */
  recommendedProspectId: string;

  /** Brief narrative explaining the recommendation. */
  recommendationReason: string;
}

// ─── Full compatibility result ────────────────────────────────────────────────

/**
 * The complete output of the compatibility engine for one pair.
 *
 * Version note: `engineVersion` must be incremented whenever the
 * scoring logic changes so stored results can be invalidated or
 * re-processed on next access.
 */
export interface CompatibilityResult {
  /** The input data used. */
  input: CompatibilityInput;

  /** Full Ashtakuta analysis. */
  ashtakuta: AshtakutaResult;

  /** Manglik Dosha check for both partners. */
  manglik: {
    person1: ManglikDoshaCheck;
    person2: ManglikDoshaCheck;
  };

  /** Saturn, Rahu, Ketu dosha checks. */
  planetaryDoshas: PlanetaryDoshaCheck[];

  /**
   * Navamsha (D9) comparison.
   * null if birth times are unknown (cannot cast D9 without accurate time).
   */
  navamsha: NavamshaCompatibility | null;

  /** Dasha period matching for next 5 years. */
  dashaMatch: DashaPeriodMatch;

  /** All suggested remedies, consolidated and de-duplicated. */
  remedies: CompatibilityRemedy[];

  /**
   * Short list of key shortcomings in this match.
   * Max 7 items. Used in the comparison view.
   */
  shortcomings: string[];

  /**
   * Short list of key strengths in this match.
   * Max 7 items.
   */
  strengths: string[];

  /** Overall verdict summarising all sub-analyses. */
  overallVerdict: 'Excellent' | 'Good' | 'Average' | 'NeedsRemedies' | 'NotRecommended';

  /** Human-readable summary paragraph (English, ≤ 300 words). */
  summaryEn: string;

  /** Human-readable summary paragraph (Hindi, ≤ 300 words). */
  summaryHi: string;

  /** ISO timestamp when this result was computed. */
  calculatedAt: string;

  /** Engine version that produced this result. */
  engineVersion: string;
}

// ─── Legacy aliases (backwards compat with existing ashtakutaService.ts) ─────

/** @deprecated Use KutaResult instead. */
export interface GunaDetail {
  kuta: string;
  maxPoints: number;
  scored: number;
  hasDosha: boolean;
  description?: string;
}

/** @deprecated Use AshtakutaResult instead. */
export interface GunaMilanResult {
  totalPoints: number;
  maxPoints: 36;
  details: GunaDetail[];
  nadiDosha: boolean;
  bhakootDosha: boolean;
  ganaDosha: boolean;
}
