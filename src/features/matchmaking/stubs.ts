/**
 * ============================================================
 * MATCHMAKING CALCULATION STUBS
 * ============================================================
 *
 * These stubs stand in for the full Kundli Milan engine until
 * the real chart calculations replace the ephemeris stubs.
 *
 * ALL KNOWN GAPS (from the user's issue list) are scaffolded here
 * as typed stub implementations:
 *
 *   ✓ Manglik Dosha Check            → stubManglikCheck()
 *   ✓ Complete Yoni Matrix (14×14)   → YONI_MATRIX constant
 *   ✓ Navamsha (D9) Compatibility    → stubNavamshaCompatibility()
 *   ✓ Planetary Dosha Checks         → stubPlanetaryDoshas()
 *   ✓ Dasha Period Matching          → stubDashaPeriodMatch()
 *   ✓ Remedies (specific not generic) → buildRemedies()
 *   ✓ Multi-prospect comparison      → compareProspects()
 *   ✓ CompatibilityResult shape      → calculateCompatibility()
 *   (PDF report generation → future milestone)
 *
 * Week 8 gap fix: removed @ts-nocheck, switched to real kundli engine.
 * ============================================================
 */

import type {
  CompatibilityInput,
  CompatibilityResult,
  AshtakutaResult,
  KutaResult,
  ManglikDoshaCheck,
  PlanetaryDoshaCheck,
  NavamshaCompatibility,
  DashaPeriodMatch,
  CompatibilityRemedy,
  ProspectComparison,
  ProspectSummary,
  YoniMatrix,
  YoniAnimal,
} from './types';
import type { Planet, Sign } from '@/features/kundli/types';
import { calculateChart, calculateVimshottariDasha } from '@/features/kundli/engine';

// ─── Complete 14×14 Yoni compatibility matrix ─────────────────────────────────
/**
 * Full Yoni matrix — all 14 animals × 14 animals scored 0–4.
 * Enemy pairs (0): Horse–Buffalo, Elephant–Lion, Goat–Monkey,
 *                   Serpent–Mongoose, Dog–Deer, Cat–Rat, Cow–Tiger.
 * Same animal: 4 pts. Friendly: 3 pts. Neutral: 2 pts. Inimical: 1 pt.
 */
export const YONI_MATRIX: YoniMatrix = {
  Horse:    { Horse:4, Elephant:2, Goat:2, Serpent:3, Dog:2, Cat:2, Rat:2, Cow:3, Buffalo:0, Tiger:1, Deer:2, Monkey:3, Lion:1, Mongoose:2 },
  Elephant: { Horse:2, Elephant:4, Goat:3, Serpent:3, Dog:2, Cat:2, Rat:2, Cow:2, Buffalo:3, Tiger:2, Deer:2, Monkey:3, Lion:0, Mongoose:2 },
  Goat:     { Horse:2, Elephant:3, Goat:4, Serpent:2, Dog:2, Cat:2, Rat:2, Cow:3, Buffalo:2, Tiger:1, Deer:2, Monkey:0, Lion:1, Mongoose:2 },
  Serpent:  { Horse:3, Elephant:3, Goat:2, Serpent:4, Dog:1, Cat:2, Rat:2, Cow:2, Buffalo:2, Tiger:1, Deer:2, Monkey:2, Lion:2, Mongoose:0 },
  Dog:      { Horse:2, Elephant:2, Goat:2, Serpent:1, Dog:4, Cat:1, Rat:2, Cow:2, Buffalo:2, Tiger:1, Deer:0, Monkey:2, Lion:1, Mongoose:2 },
  Cat:      { Horse:2, Elephant:2, Goat:2, Serpent:2, Dog:1, Cat:4, Rat:0, Cow:2, Buffalo:2, Tiger:2, Deer:2, Monkey:2, Lion:2, Mongoose:2 },
  Rat:      { Horse:2, Elephant:2, Goat:2, Serpent:2, Dog:2, Cat:0, Rat:4, Cow:2, Buffalo:2, Tiger:1, Deer:2, Monkey:2, Lion:2, Mongoose:2 },
  Cow:      { Horse:3, Elephant:2, Goat:3, Serpent:2, Dog:2, Cat:2, Rat:2, Cow:4, Buffalo:2, Tiger:0, Deer:3, Monkey:2, Lion:2, Mongoose:2 },
  Buffalo:  { Horse:0, Elephant:3, Goat:2, Serpent:2, Dog:2, Cat:2, Rat:2, Cow:2, Buffalo:4, Tiger:2, Deer:2, Monkey:2, Lion:2, Mongoose:2 },
  Tiger:    { Horse:1, Elephant:2, Goat:1, Serpent:1, Dog:1, Cat:2, Rat:1, Cow:0, Buffalo:2, Tiger:4, Deer:1, Monkey:1, Lion:3, Mongoose:2 },
  Deer:     { Horse:2, Elephant:2, Goat:2, Serpent:2, Dog:0, Cat:2, Rat:2, Cow:3, Buffalo:2, Tiger:1, Deer:4, Monkey:2, Lion:2, Mongoose:2 },
  Monkey:   { Horse:3, Elephant:3, Goat:0, Serpent:2, Dog:2, Cat:2, Rat:2, Cow:2, Buffalo:2, Tiger:1, Deer:2, Monkey:4, Lion:2, Mongoose:2 },
  Lion:     { Horse:1, Elephant:0, Goat:1, Serpent:2, Dog:1, Cat:2, Rat:2, Cow:2, Buffalo:2, Tiger:3, Deer:2, Monkey:2, Lion:4, Mongoose:2 },
  Mongoose: { Horse:2, Elephant:2, Goat:2, Serpent:0, Dog:2, Cat:2, Rat:2, Cow:2, Buffalo:2, Tiger:2, Deer:2, Monkey:2, Lion:2, Mongoose:4 },
};

// ─── Nakshatra → Yoni mapping (complete 27 nakshatras) ───────────────────────
export const NAKSHATRA_YONI: Record<string, YoniAnimal> = {
  Ashwini: 'Horse',       Shatabhisha: 'Horse',
  Bharani: 'Elephant',    Revati: 'Elephant',
  Krittika: 'Goat',       Pushya: 'Goat',
  Rohini: 'Serpent',      Mrigashira: 'Serpent',
  Ardra: 'Dog',           Mula: 'Dog',
  Punarvasu: 'Cat',       Ashlesha: 'Cat',
  Magha: 'Rat',           'Purva Phalguni': 'Rat',
  'Uttara Phalguni': 'Cow', 'Uttara Bhadrapada': 'Cow',
  Hasta: 'Buffalo',       Swati: 'Buffalo',
  Chitra: 'Tiger',        Vishakha: 'Tiger',
  Anuradha: 'Deer',       Jyeshtha: 'Deer',
  'Purva Ashadha': 'Monkey', Shravana: 'Monkey',
  'Uttara Ashadha': 'Mongoose',
  Dhanishtha: 'Lion',     'Purva Bhadrapada': 'Lion',
};

// ─── Sign lord table ──────────────────────────────────────────────────────────
const SIGN_LORDS: Record<number, Planet> = {
  0:'Mars', 1:'Venus', 2:'Mercury', 3:'Moon', 4:'Sun', 5:'Mercury',
  6:'Venus', 7:'Mars', 8:'Jupiter', 9:'Saturn', 10:'Saturn', 11:'Jupiter',
};

const SIGN_NAMES: Sign[] = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

// ─── Stub kuta calculations ───────────────────────────────────────────────────

function stubKuta(
  kuta: string,
  maxPoints: number,
  scored: number,
  descEn: string,
  details: Record<string, unknown> = {},
): KutaResult {
  const pct = (scored / maxPoints) * 100;
  const rating = pct >= 75 ? 'Excellent' : pct >= 50 ? 'Good' : pct >= 25 ? 'Average' : 'Poor';
  return {
    kuta,
    scored,
    maxPoints,
    rating: rating as KutaResult['rating'],
    descriptionEn: descEn,
    descriptionHi: `[हिंदी] ${descEn}`,
    details,
  };
}

function buildAshtakuta(
  p1Nakshatra: string,
  p2Nakshatra: string,
  p1Rashi: number,
  p2Rashi: number,
): AshtakutaResult {
  // STUB scores — deterministic from nakshatra names
  const seed = (p1Nakshatra.length + p2Nakshatra.length + p1Rashi + p2Rashi) % 9;

  const p1Yoni = NAKSHATRA_YONI[p1Nakshatra] ?? 'Horse';
  const p2Yoni = NAKSHATRA_YONI[p2Nakshatra] ?? 'Elephant';
  const yoniScore = YONI_MATRIX[p1Yoni][p2Yoni];

  const kutas: KutaResult[] = [
    stubKuta('Varna', 1, seed % 2 === 0 ? 1 : 0,
      `Varna compatibility: ${seed % 2 === 0 ? 'male varna ≥ female varna — compatible' : 'mismatch detected'}.`,
      { p1Nakshatra, p2Nakshatra }),
    stubKuta('Vashya', 2, (seed % 3),
      `Vashya: ${(seed % 3)} / 2 pts. Mutual control and attraction (STUB).`,
      { p1Rashi, p2Rashi }),
    stubKuta('Tara', 3, seed % 2 === 0 ? 3 : 0,
      `Tara: Birth-star compatibility ${seed % 2 === 0 ? 'favourable' : 'unfavourable'} (STUB).`),
    stubKuta('Yoni', 4, yoniScore,
      `Yoni: ${p1Yoni} (person1) vs ${p2Yoni} (person2) — ${yoniScore}/4 pts from full 14×14 matrix.`,
      { p1Yoni, p2Yoni, matrixScore: yoniScore }),
    stubKuta('Graha Maitri', 5, 3 + (seed % 3),
      `Graha Maitri: Lords ${SIGN_LORDS[p1Rashi]} and ${SIGN_LORDS[p2Rashi]} — ${3 + (seed % 3)}/5 pts (STUB).`,
      { p1Lord: SIGN_LORDS[p1Rashi], p2Lord: SIGN_LORDS[p2Rashi] }),
    stubKuta('Gana', 6, seed % 2 === 0 ? 6 : 1,
      `Gana: ${seed % 2 === 0 ? 'Same Gana — excellent' : 'Deva–Rakshasa mismatch'} (STUB).`),
    stubKuta('Bhakoot', 7, seed % 2 === 0 ? 7 : 0,
      `Bhakoot: ${SIGN_NAMES[p1Rashi]} and ${SIGN_NAMES[p2Rashi]} — ${seed % 2 === 0 ? '7/7 excellent' : '0/7 dosha present'} (STUB).`,
      { hasVedhaDosha: seed % 2 !== 0 }),
    stubKuta('Nadi', 8, seed % 3 === 0 ? 0 : 8,
      `Nadi: ${seed % 3 === 0 ? 'Same Nadi — Nadi Dosha present' : 'Different Nadi — excellent'} (STUB).`,
      { hasNadiDosha: seed % 3 === 0 }),
  ];

  const totalPoints = kutas.reduce((s, k) => s + k.scored, 0);
  const pct = (totalPoints / 36) * 100;
  const overallRating =
    totalPoints >= 28 ? 'Excellent' : totalPoints >= 21 ? 'Good' : totalPoints >= 14 ? 'Average' : 'Poor';

  const criticalDoshas: string[] = [];
  if (kutas.find(k => k.kuta === 'Nadi')?.details?.hasNadiDosha) criticalDoshas.push('Nadi Dosha');
  if (kutas.find(k => k.kuta === 'Bhakoot')?.details?.hasVedhaDosha) criticalDoshas.push('Bhakoot Dosha');
  if (kutas.find(k => k.kuta === 'Gana')?.scored === 0) criticalDoshas.push('Gana Dosha');

  return {
    kutas,
    totalPoints,
    maxPoints: 36,
    percentage: pct,
    overallRating: overallRating as AshtakutaResult['overallRating'],
    criticalDoshas,
  };
}

// ─── Manglik Dosha stub ───────────────────────────────────────────────────────

function stubManglikCheck(name: string): ManglikDoshaCheck {
  // STUB: derive presence from name length parity
  const present = name.length % 3 !== 0;
  return {
    isPresent: present,
    triggeredFrom: present
      ? [{ reference: 'Lagna', marsHouse: 7, severity: 'High' }]
      : [],
    isCancelled: false,
    cancellationConditions: [],
    remedies: present
      ? [
          'Perform Kuja Dosha Nivaran Puja at a Hanuman temple.',
          'Both partners should marry after age 28 when Mars matures.',
          'Donate red lentils (masoor dal) on Tuesdays for 11 weeks.',
        ]
      : [],
  };
}

// ─── Planetary dosha stubs ────────────────────────────────────────────────────

function stubPlanetaryDoshas(): PlanetaryDoshaCheck[] {
  return [
    {
      planet: 'Saturn',
      doshaType: 'Saturn in 7th house',
      person1Present: false,
      person2Present: false,
      severity: 'None',
      impact: 'Saturn not in 7th house for either partner — no delay pattern (STUB).',
      mutualCancellation: false,
      remedies: [],
    },
    {
      planet: 'Rahu',
      doshaType: 'Rahu in 7th house',
      person1Present: false,
      person2Present: false,
      severity: 'None',
      impact: 'Rahu not in 7th for either partner (STUB).',
      mutualCancellation: false,
      remedies: [],
    },
    {
      planet: 'Ketu',
      doshaType: 'Ketu in 7th house',
      person1Present: false,
      person2Present: false,
      severity: 'None',
      impact: 'Ketu not afflicting the 7th house (STUB).',
      mutualCancellation: false,
      remedies: [],
    },
  ];
}

// ─── D9 Navamsha stub ─────────────────────────────────────────────────────────

function stubNavamshaCompatibility(
  p1Chart: ReturnType<typeof calculateChart>,
  p2Chart: ReturnType<typeof calculateChart>,
): NavamshaCompatibility {
  const p1VenusNavamsha = p1Chart.planets.find(p => p.planet === 'Venus')!.navamshaSign;
  const p2VenusNavamsha = p2Chart.planets.find(p => p.planet === 'Venus')!.navamshaSign;
  const p1SeventhSign = p1Chart.houses[6].sign;
  const p2SeventhSign = p2Chart.houses[6].sign;

  return {
    person1D9: p1Chart,
    person2D9: p2Chart,
    person1VenusD9Sign: p1VenusNavamsha,
    person2VenusD9Sign: p2VenusNavamsha,
    person1Seventh: {
      sign: p1SeventhSign,
      lord: p1Chart.houses[6].lord,
      lordStrength: 'Average',
    },
    person2Seventh: {
      sign: p2SeventhSign,
      lord: p2Chart.houses[6].lord,
      lordStrength: 'Average',
    },
    rating: 'Good',
    summaryEn:
      `STUB: D9 analysis shows person1's Venus in ${p1VenusNavamsha} and ` +
      `person2's Venus in ${p2VenusNavamsha}. ` +
      `The 7th house analysis requires real ephemeris data (Week 4).`,
  };
}

// ─── Dasha match stub ─────────────────────────────────────────────────────────

function stubDashaPeriodMatch(
  p1BirthDate: string,
  p2BirthDate: string,
): DashaPeriodMatch {
  const p1Chart = calculateChart({ name: 'p1', date: p1BirthDate, time: '06:00', timezone: 'Asia/Kolkata', latitude: 22.72, longitude: 75.86, place: 'Indore' });
  const p2Chart = calculateChart({ name: 'p2', date: p2BirthDate, time: '06:00', timezone: 'Asia/Kolkata', latitude: 22.72, longitude: 75.86, place: 'Indore' });
  const p1Dasha = calculateVimshottariDasha(p1Chart);
  const p2Dasha = calculateVimshottariDasha(p2Chart);

  const p1Current = p1Dasha.periods[0];
  const p2Current = p2Dasha.periods[0];

  if (!p1Current || !p2Current) {
    throw new Error('Could not compute dasha periods for matchmaking stub');
  }

  return {
    person1CurrentMaha: { planet: p1Current.planet, endsAt: p1Current.endDate },
    person2CurrentMaha: { planet: p2Current.planet, endsAt: p2Current.endDate },
    auspiciousWindows: [
      {
        startDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 270 * 86400000).toISOString().split('T')[0],
        person1Dasha: `${p1Current.planet} Maha / Venus Antar (STUB)`,
        person2Dasha: `${p2Current.planet} Maha / Jupiter Antar (STUB)`,
        reason: 'STUB: Both partners in beneficial sub-periods — suitable for marriage.',
      },
    ],
    cautionWindows: [],
    summaryEn: `STUB: Both partners enter broadly supportive periods within 3–9 months. Full Dasha matching requires real ephemeris data (Week 4).`,
    person1NextPeriods: p1Dasha.periods.slice(0, 2),
    person2NextPeriods: p2Dasha.periods.slice(0, 2),
  };
}

// ─── Remedies ─────────────────────────────────────────────────────────────────

function buildRemedies(
  ashtakuta: AshtakutaResult,
  p1Manglik: ManglikDoshaCheck,
  p2Manglik: ManglikDoshaCheck,
): CompatibilityRemedy[] {
  const remedies: CompatibilityRemedy[] = [];

  if (ashtakuta.criticalDoshas.includes('Nadi Dosha')) {
    remedies.push({
      forDosha: 'Nadi Dosha',
      type: 'puja',
      instruction: 'Perform Nadi Dosha Nivaran Puja with Mahamrityunjaya Homa at a Shiva temple.',
      performer: 'both',
      timing: 'Before marriage, on a Monday during Shukla Paksha',
      targetPlanet: 'Moon',
    });
    remedies.push({
      forDosha: 'Nadi Dosha',
      type: 'charity',
      instruction: 'Donate gold or silver to a Brahmin couple of similar age.',
      performer: 'both',
    });
  }

  if (ashtakuta.criticalDoshas.includes('Bhakoot Dosha')) {
    remedies.push({
      forDosha: 'Bhakoot Dosha',
      type: 'puja',
      instruction: 'Perform Bhakoot Dosha Shanti Puja on a Thursday with Vishnu Sahasranama recitation.',
      performer: 'both',
      timing: 'Thursday, Shukla Paksha Panchami or Saptami',
      targetPlanet: 'Jupiter',
    });
  }

  if (p1Manglik.isPresent && !p1Manglik.isCancelled) {
    remedies.push(...p1Manglik.remedies.map(r => ({
      forDosha: 'Manglik Dosha (Person 1)',
      type: 'general' as const,
      instruction: r,
      performer: 'person1' as const,
    })));
  }

  if (p2Manglik.isPresent && !p2Manglik.isCancelled) {
    remedies.push(...p2Manglik.remedies.map(r => ({
      forDosha: 'Manglik Dosha (Person 2)',
      type: 'general' as const,
      instruction: r,
      performer: 'person2' as const,
    })));
  }

  if (remedies.length === 0) {
    remedies.push({
      forDosha: 'General',
      type: 'mantra',
      instruction: 'Chant the Vivah Sukta from Rigveda together on auspicious days.',
      performer: 'both',
    });
  }

  return remedies;
}

// ─── Main public stub ─────────────────────────────────────────────────────────

/**
 * STUB: calculateCompatibility
 *
 * Returns a structurally complete CompatibilityResult covering all
 * analysis areas defined in types.ts, including the newly added:
 *   - Full Yoni matrix (14×14)
 *   - Manglik Dosha check
 *   - Planetary dosha checks (Saturn, Rahu, Ketu)
 *   - Navamsha D9 compatibility
 *   - Dasha period matching
 *   - Specific per-dosha remedies
 *   - Shortcomings and strengths lists
 *
 * @param input  Birth data for both partners.
 * @returns      A complete CompatibilityResult with STUB values.
 */
export async function calculateCompatibility(
  input: CompatibilityInput,
): Promise<CompatibilityResult> {
  // Cast charts (stub — fixed planetary positions, not real ephemeris)
  const p1Chart = calculateChart(input.person1);
  const p2Chart = calculateChart(input.person2);

  // Derive Moon nakshatra and rashi from stub charts
  const p1Moon = p1Chart.planets.find(p => p.planet === 'Moon')!;
  const p2Moon = p2Chart.planets.find(p => p.planet === 'Moon')!;
  const p1Rashi = p1Chart.houses[0].sign; // Lagna sign as proxy for Moon rashi in stub
  const p2Rashi = p2Chart.houses[0].sign;
  const p1RashiIdx = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'].indexOf(p1Rashi);
  const p2RashiIdx = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'].indexOf(p2Rashi);

  const ashtakuta = buildAshtakuta(p1Moon.nakshatra, p2Moon.nakshatra, p1RashiIdx, p2RashiIdx);
  const p1Manglik = stubManglikCheck(input.person1.name);
  const p2Manglik = stubManglikCheck(input.person2.name);
  const planetaryDoshas = stubPlanetaryDoshas();
  const navamsha = stubNavamshaCompatibility(p1Chart, p2Chart);
  const dashaMatch = stubDashaPeriodMatch(input.person1.date, input.person2.date);
  const remedies = buildRemedies(ashtakuta, p1Manglik, p2Manglik);

  const shortcomings: string[] = [];
  const strengths: string[] = [];

  if (ashtakuta.criticalDoshas.includes('Nadi Dosha')) {
    shortcomings.push('Nadi Dosha present — health and progeny risks; requires Nadi Dosha Nivaran Puja.');
  }
  if (ashtakuta.criticalDoshas.includes('Bhakoot Dosha')) {
    shortcomings.push('Bhakoot Dosha — love compatibility affected; Bhakoot Shanti Puja recommended.');
  }
  if (p1Manglik.isPresent && !p1Manglik.isCancelled) {
    shortcomings.push(`Manglik Dosha in Person 1 (${input.person1.name}) — Mars in 7th, high severity.`);
  }
  if (p2Manglik.isPresent && !p2Manglik.isCancelled) {
    shortcomings.push(`Manglik Dosha in Person 2 (${input.person2.name}) — Mars in 7th, high severity.`);
  }
  if (ashtakuta.totalPoints < 14) {
    shortcomings.push('Low Ashtakuta score (< 14/36) — fundamental compatibility concerns.');
  }

  if (ashtakuta.kutas.find(k => k.kuta === 'Nadi')?.scored === 8) {
    strengths.push('Different Nadi — excellent health and progeny prospects.');
  }
  if ((ashtakuta.kutas.find(k => k.kuta === 'Graha Maitri')?.scored ?? 0) >= 4) {
    strengths.push('Strong Graha Maitri — good intellectual and mental harmony.');
  }
  if (!p1Manglik.isPresent && !p2Manglik.isPresent) {
    strengths.push('No Manglik Dosha in either partner.');
  }
  if (ashtakuta.totalPoints >= 21) {
    strengths.push(`Good overall Ashtakuta score: ${ashtakuta.totalPoints}/36.`);
  }

  // Ensure at least one shortcoming and one strength for UX
  if (shortcomings.length === 0) shortcomings.push('STUB: No major shortcomings detected — verify with real ephemeris (Week 4).');
  if (strengths.length === 0) strengths.push('STUB: Compatibility is acceptable — verify with real ephemeris (Week 4).');

  const overallVerdict =
    ashtakuta.totalPoints >= 28 && shortcomings.length <= 1 ? 'Excellent'
    : ashtakuta.totalPoints >= 21 ? 'Good'
    : ashtakuta.totalPoints >= 14 ? 'Average'
    : ashtakuta.criticalDoshas.length >= 2 ? 'NotRecommended'
    : 'NeedsRemedies';

  return {
    input,
    ashtakuta,
    manglik: { person1: p1Manglik, person2: p2Manglik },
    planetaryDoshas,
    navamsha,
    dashaMatch,
    remedies,
    shortcomings,
    strengths,
    overallVerdict: overallVerdict as CompatibilityResult['overallVerdict'],
    summaryEn:
      `STUB: ${input.person1.name} and ${input.person2.name} have an Ashtakuta score of ` +
      `${ashtakuta.totalPoints}/36 (${ashtakuta.overallRating}). ` +
      `${shortcomings.length > 0 ? `Key concerns: ${shortcomings[0]}` : 'No major doshas detected.'} ` +
      `Full analysis requires real Swiss Ephemeris data (Week 4).`,
    summaryHi:
      `STUB: ${input.person1.name} और ${input.person2.name} का अष्टकूट स्कोर ` +
      `${ashtakuta.totalPoints}/36 (${ashtakuta.overallRating}) है। ` +
      `वास्तविक विश्लेषण के लिए स्विस एफेमेरिस डेटा आवश्यक है (सप्ताह 4)।`,
    calculatedAt: new Date().toISOString(),
    engineVersion: '0.0.1-stub',
  };
}

/**
 * compareProspects
 *
 * Runs calculateEnhancedAshtakuta for the base person against each prospect
 * and returns a ranked comparison using effective score
 * (raw Ashtakuta score minus 4 points per critical issue).
 *
 * @param basePerson    Birth data of the base person (typically the male).
 * @param prospects     Array of birth data for each prospect to compare.
 * @returns             ProspectComparison with ranked summaries.
 */
export async function compareProspects(
  basePerson: import('@/features/kundli/types').BirthData,
  prospects: import('@/features/kundli/types').BirthData[],
): Promise<ProspectComparison> {
  // Import here to avoid circular dependency at module load time
  const { calculateEnhancedAshtakuta } = await import('@/services/ashtakutaServiceEnhanced');

  // Run all comparisons in parallel
  const summaries: Array<ProspectSummary & { _effectiveScore: number }> = await Promise.all(
    prospects.map(async (prospect, idx) => {
      try {
        const enhanced = await calculateEnhancedAshtakuta(
          {
            name: basePerson.name,
            dateOfBirth: basePerson.date,
            timeOfBirth: basePerson.time,
            placeOfBirth: basePerson.place,
          },
          {
            name: prospect.name,
            dateOfBirth: prospect.date,
            timeOfBirth: prospect.time,
            placeOfBirth: prospect.place,
          },
        );

        const { ashtakuta, manglikAnalysis, criticalIssues } = enhanced;
        const rawScore = ashtakuta.totalPoints;
        const effectiveScore = rawScore - criticalIssues.length * 4;

        // KutaCategory matches CompatibilityReport categories array shape
        type KutaCategory = { category: string; points: number; maxPoints: number };
        const kutas = (ashtakuta.categories ?? []) as KutaCategory[];

        const bestKuta = kutas.length > 0
          ? kutas.reduce((b, k) => k.points / k.maxPoints > b.points / b.maxPoints ? k : b)
          : { category: 'N/A', points: 0, maxPoints: 1 };
        const weakestKuta = kutas.length > 0
          ? kutas.reduce((w, k) => k.points / k.maxPoints < w.points / w.maxPoints ? k : w)
          : { category: 'N/A', points: 0, maxPoints: 1 };

        const strengths = kutas
          .filter(k => k.points === k.maxPoints)
          .map(k => `${k.category}: ${k.points}/${k.maxPoints} (full marks)`)
          .slice(0, 5);

        // Shortcomings: critical issues + zero-score kutas
        const shortcomings = [
          ...criticalIssues,
          ...kutas
            .filter(k => k.points === 0)
            .map(k => `${k.category}: 0 points`),
        ].slice(0, 5);

        let overallRating: ProspectSummary['overallRating'];
        if (rawScore >= 28) overallRating = 'Excellent';
        else if (rawScore >= 21) overallRating = 'Good';
        else if (rawScore >= 14) overallRating = 'Average';
        else overallRating = 'Poor';

        return {
          prospectId: `prospect_${idx + 1}`,
          name: prospect.name,
          ashtakutaScore: rawScore,
          overallRating,
          manglikDosha: manglikAnalysis.mismatch,
          criticalDosha: criticalIssues.length > 0,
          bestKuta: {
            name: bestKuta.category,
            scored: bestKuta.points,
            maxPoints: bestKuta.maxPoints,
          },
          weakestKuta: {
            name: weakestKuta.category,
            scored: weakestKuta.points,
            maxPoints: weakestKuta.maxPoints,
          },
          shortcomings,
          strengths,
          _effectiveScore: effectiveScore,
        };
      } catch (err) {
        console.error(`[compareProspects] Failed for prospect "${prospect.name}":`, err);
        // Return a placeholder summary so the overall comparison doesn't break
        return {
          prospectId: `prospect_${idx + 1}`,
          name: prospect.name,
          ashtakutaScore: 0,
          overallRating: 'Poor' as const,
          manglikDosha: false,
          criticalDosha: false,
          bestKuta: { name: 'N/A', scored: 0, maxPoints: 1 },
          weakestKuta: { name: 'N/A', scored: 0, maxPoints: 1 },
          shortcomings: [`Calculation failed: ${err instanceof Error ? err.message : String(err)}`],
          strengths: [],
          _effectiveScore: 0,
        };
      }
    }),
  );

  // Sort by effective score desc; tie-break by fewest critical issues
  summaries.sort((a, b) => {
    if (b._effectiveScore !== a._effectiveScore) return b._effectiveScore - a._effectiveScore;
    return Number(a.criticalDosha) - Number(b.criticalDosha);
  });

  const recommended = summaries[0];
  const secondBest = summaries[1];

  const reasonSuffix = secondBest
    ? ` vs ${secondBest.name}'s ${secondBest.ashtakutaScore}/36` +
      (secondBest.criticalDosha ? ' (with critical dosha)' : '')
    : '';

  const recommendationReason =
    `${recommended.name} scores ${recommended.ashtakutaScore}/36` +
    (recommended._effectiveScore !== recommended.ashtakutaScore
      ? ` (effective ${recommended._effectiveScore}/36 after dosha adjustment)`
      : '') +
    (recommended.criticalDosha
      ? ' — critical dosha present, remedies advised'
      : ' with no critical doshas') +
    reasonSuffix + '.';

  // Strip internal _effectiveScore before returning (not in ProspectSummary type)
  const cleanSummaries: ProspectSummary[] = summaries.map(
    ({ _effectiveScore: _ignored, ...rest }) => rest,
  );

  return {
    basePerson,
    prospects: cleanSummaries,
    recommendedProspectId: recommended.prospectId,
    recommendationReason,
  };
}

