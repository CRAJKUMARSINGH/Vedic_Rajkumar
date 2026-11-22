/**
 * triage.ts — pure, deterministic intake classification and placement parsing.
 *
 * WHY THIS EXISTS
 * A user can hand the app a *natal chart summary* ("Venus in 12th, Lagna 1st
 * with Sun+Jupiter+Gulika, Moon in 4th") and then ask a *forecast* question.
 * That is natal-shaped input with a prashna-shaped question. Without an intake
 * router the app silently answers a different question than the one asked —
 * casting a fresh chart and presenting it as if it were the user's own.
 *
 * This module makes the routing decision explicit and refuses to invent data.
 *
 * DESIGN RULES (hard):
 *  1. Pure. No engine imports, no imports from `src/services/**`, no network,
 *     no `Date.now()`, no `Math.random()`. Safe to run in a worker or a test.
 *  2. Validation and route selection are SEPARATE. `validateIntake()` reports
 *     what was supplied; `selectRoute()` turns that into a lane. A caller can
 *     read either without the other.
 *  3. Completeness is an explicit state, never `hasBirthData: boolean`. A
 *     boolean cannot tell "no date" from "date but no city".
 *  4. A lane is a ROUTING decision, not a claim that the engine exists. See
 *     `INTAKE_ENGINES`. Lane `placements_only` has NO calculation engine — it
 *     may only render a house-summary; it must never be backed by the Prashna
 *     engine or emit a dated window.
 *  5. Never substitute a location. `28.6139 / 77.2090` (Delhi) is never
 *     applied silently; an unresolved location is reported, not defaulted.
 *  6. The parser never invents longitudes, signs, nakshatras or birth times.
 *
 * DELIBERATE DEVIATIONS FROM THE REVIEW'S PROPOSED PATCH
 *  - The proposed `TriageInput` used `hasBirthData / hasMoment / hasPlace`
 *    booleans. Replaced by explicit completeness states (rule 3).
 *  - The proposed two-pass parser carried house context ACROSS sentence
 *    boundaries, so `"Sun in 1st, Moon"` yielded `Moon:1`. That is an ambiguous
 *    inherited assignment and is forbidden here; house context is reset at each
 *    segment and such a planet is reported in `unresolved`.
 *  - `blockAnswer` is not equivalent to `lane === 'insufficient'`. A natal or
 *    prashna request with an unresolved location cannot be cast, so it blocks
 *    and asks — it does not silently fall back to another lane's engine.
 */

/** Routing lane. Descriptive of the *input shape*, not of engine capability. */
export type IntakeLane = 'natal_full' | 'placements_only' | 'prashna_now' | 'insufficient';

/**
 * Which calculation pipelines the application actually ships. Exposed so a
 * caller (or a test) can assert that a lane is never mistaken for an engine.
 * `placements_only` is intentionally `false`: house-only input is summarised,
 * never *calculated*.
 */
export const INTAKE_ENGINES: Record<IntakeLane, boolean> = {
  natal_full: true,
  prashna_now: true,
  placements_only: false,
  insufficient: false,
};

/** Explicit birth-input completeness — never a boolean. */
export type NatalCompleteness =
  | 'complete'
  | 'missing_date'
  | 'missing_time'
  | 'missing_place'
  | 'unresolved_place'
  | 'empty';

/** Explicit question-moment completeness — never a boolean. */
export type PrashnaCompleteness =
  | 'complete'
  | 'missing_moment'
  | 'missing_place'
  | 'unresolved_place'
  | 'empty';

export type AskId = 'topic' | 'birth' | 'moment' | 'place';
export interface Ask {
  id: AskId;
  en: string;
  hi: string;
}

export type IssueCode =
  | 'invalid_date'
  | 'invalid_time'
  | 'invalid_latitude'
  | 'invalid_longitude'
  | 'missing_timezone'
  | 'unresolved_location'
  | 'invalid_horary_number'
  | 'invalid_house'
  | 'conflicting_house'
  | 'unresolved_placement';

export interface ValidationIssue {
  code: IssueCode;
  en: string;
  hi: string;
}

export interface NatalInputs {
  dob?: string | null;
  tob?: string | null;
  place?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
}

export interface PrashnaInputs {
  /** The question moment. A `Date` or an ISO/parseable string. */
  moment?: string | Date | null;
  place?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  /** Horary (Prasna) number, 1–249. Validated, never clamped. */
  horaryNumber?: number | null;
}

export interface IntakeRequest {
  question: string;
  natal: NatalInputs;
  prashna: PrashnaInputs;
}

export interface PlacementMention {
  planet: string;
  house: number;
  /** True when the token was the ascendant rather than a planetary occupant. */
  isLagna: boolean;
  raw: string;
}

export interface UnresolvedToken {
  /** Recognised planet/point with no resolvable house context. */
  planet: string;
  raw: string;
  reason: 'no_house_context';
}

export interface PlacementConflict {
  planet: string;
  houses: number[];
  raws: string[];
}

export interface ParseResult {
  mentions: PlacementMention[];
  /** Recognised but non-scoring points (e.g. Gulika) — contextual only. */
  unknownTokens: string[];
  /** Recognised planets that never resolved to a house. */
  unresolved: UnresolvedToken[];
  /** Same planet assigned to more than one house. */
  conflicts: PlacementConflict[];
  /** Houses the Lagna/ascendant was placed in. */
  lagnaHouses: number[];
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export interface NatalValidation {
  state: NatalCompleteness;
  dob: string | null;
  tob: string | null;
  place: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  issues: ValidationIssue[];
}

export interface PrashnaValidation {
  state: PrashnaCompleteness;
  moment: string | null;
  place: string | null;
  latitude: number | null;
  longitude: number | null;
  horaryNumber: number | null;
  issues: ValidationIssue[];
}

export interface IntakeValidation {
  questionPresent: boolean;
  natal: NatalValidation;
  prashna: PrashnaValidation;
  placements: ParseResult;
  topicHouse: number | null;
  topicScore: number;
}

export interface TriageResult {
  lane: IntakeLane;
  /** confidence = laneCap × topicCertainty × unknownPenalty. */
  ceiling: number;
  /** True when the selected lane cannot produce output without more input. */
  blockAnswer: boolean;
  /** At most two, ordered by priority. */
  asks: Ask[];
  validation: IntakeValidation;
  /** Human-readable route rationale (English; for logs and tests). */
  reasons: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Placement parsing (rule 6 — no invented data)
// ─────────────────────────────────────────────────────────────────────────────

/** Planets the verdict engine can score. Gulika is contextual, never scored. */
const SCORABLE = new Set([
  'sun',
  'moon',
  'mars',
  'mercury',
  'jupiter',
  'venus',
  'saturn',
  'rahu',
  'ketu',
]);

/** Recognised points that are NOT planetary occupants of a house for scoring. */
const LAGNA = 'lagna';
const CONTEXT_ONLY = new Set(['gulika']);

/**
 * Aliases → canonical token. Only forms that are widely attested appear here;
 * nothing speculative. Devanagari planet names and their common transliterations
 * are included so Roman-Hindi and Hindi input parse the same as English.
 */
const PLANET_ALIASES: ReadonlyArray<readonly [string, string]> = [
  // English
  ['sun', 'sun'],
  ['moon', 'moon'],
  ['mars', 'mars'],
  ['mercury', 'mercury'],
  ['jupiter', 'jupiter'],
  ['venus', 'venus'],
  ['saturn', 'saturn'],
  ['rahu', 'rahu'],
  ['ketu', 'ketu'],
  ['lagna', LAGNA],
  ['ascendant', LAGNA],
  ['gulika', 'gulika'],
  ['maandi', 'gulika'],
  ['mandi', 'gulika'],
  // Romanized Hindi
  ['surya', 'sun'],
  ['chandra', 'moon'],
  ['mangal', 'mars'],
  ['kuja', 'mars'],
  ['budh', 'mercury'],
  ['budha', 'mercury'],
  ['guru', 'jupiter'],
  ['brihaspati', 'jupiter'],
  ['shukra', 'venus'],
  ['shani', 'saturn'],
  // Devanagari
  ['सूर्य', 'sun'],
  ['चंद्र', 'moon'],
  ['चन्द्र', 'moon'],
  ['मंगल', 'mars'],
  ['मङ्गल', 'mars'],
  ['बुध', 'mercury'],
  ['गुरु', 'jupiter'],
  ['बृहस्पति', 'jupiter'],
  ['शुक्र', 'venus'],
  ['शनि', 'saturn'],
  ['राहु', 'rahu'],
  ['केतु', 'ketu'],
  ['गुलिक', 'gulika'],
  ['मान्दि', 'gulika'],
  ['लग्न', LAGNA],
];

const HOUSE_WORDS = '(?:houses|house|bhavas|bhava|bhaav|bhav|ghar|भाव|घर|गृह)';

/** Deva-digits → ASCII so one numeric path covers Hindi and English input. */
const DEVA_DIGITS = '०१२३४५६७८९';

function normalizeDigits(text: string): string {
  let out = '';
  for (const ch of text) {
    const i = DEVA_DIGITS.indexOf(ch);
    out += i >= 0 ? String(i) : ch;
  }
  return out;
}

const clampHouse = (n: number): number | null =>
  Number.isInteger(n) && n >= 1 && n <= 12 ? n : null;

function isAsciiWord(text: string): boolean {
  return /^[a-z][a-z ]*$/.test(text);
}

function tokenHasPlanet(lower: string, alias: string): boolean {
  // Devanagari has no ASCII word boundaries; fall back to substring for it.
  if (isAsciiWord(alias)) {
    return new RegExp(`\\b${alias.replace(/\s+/g, '\\s+')}\\b`, 'i').test(lower);
  }
  return lower.includes(alias);
}

/** All house numbers referenced in a token, in first-seen order, 1–12 only. */
const HOUSE_AFTER = new RegExp(`(\\d{1,2})(?:st|nd|rd|th)?\\s*${HOUSE_WORDS}`, 'gi');
const HOUSE_BEFORE = new RegExp(`${HOUSE_WORDS}\\s*(?:no\\.?\\s*)?(\\d{1,2})`, 'gi');
const BARE_ORDINAL = /(\d{1,2})(?:st|nd|rd|th)/gi;

/**
 * Houses referenced in a token, plus any *house-word* number that was
 * out of range. Rejections are only reported for numbers bound to a house word
 * ("13th house"), never for a bare ordinal — otherwise a question like "on the
 * 15th of May" would raise a spurious house error.
 */
function scanHouses(lower: string): { houses: number[]; rejected: number[] } {
  const houses: number[] = [];
  const rejected: number[] = [];
  const take = (raw: string, strictRange: boolean) => {
    const n = parseInt(raw, 10);
    const h = clampHouse(n);
    if (h !== null) {
      if (!houses.includes(h)) houses.push(h);
    } else if (strictRange && !rejected.includes(n)) {
      rejected.push(n);
    }
  };
  for (const re of [HOUSE_AFTER, HOUSE_BEFORE]) {
    for (const m of lower.matchAll(re)) take(m[1], true);
  }
  for (const m of lower.matchAll(BARE_ORDINAL)) take(m[1], false);
  return { houses, rejected };
}

/** Sentence-level boundaries. House context never crosses one. */
const SEGMENT_SPLIT = /[,;\n।]|\.\s/;
/** Conjunction-list boundaries WITHIN a segment — context is allowed to carry. */
const LIST_SPLIT = /[+&]|\band\b|और/i;

/**
 * Parse typed house/planet placements.
 *
 * Supports planet-before-house ("Sun in 1st"), house-before-planet
 * ("4th house Moon"), conjunction lists ("Sun+Jupiter+Gulika") and both English,
 * Roman-Hindi and Devanagari planet names.
 *
 * Sets (never invented): only `planet` + `house` are produced. Identical pairs
 * are deduplicated. Out-of-range houses are rejected, not clamped. Lagna is
 * flagged, not treated as a planetary occupant. Gulika is preserved in
 * `unknownTokens` (context-only). A planet whose house cannot be resolved is
 * kept in `unresolved` rather than dropped or guessed.
 */
export function parsePlacements(text: string): ParseResult {
  const mentions: PlacementMention[] = [];
  const unknownTokens: string[] = [];
  const unresolved: UnresolvedToken[] = [];
  const rawsByPlanet = new Map<string, { houses: number[]; raws: string[] }>();
  const lagnaHouses: number[] = [];
  const seen = new Set<string>();
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  const normalized = normalizeDigits(text ?? '').toLowerCase();

  for (const segment of normalized.split(SEGMENT_SPLIT)) {
    // Context is reset per segment: a planet is never assigned a house that was
    // established in a different clause.
    let ctx: number[] = [];
    for (const token of segment.split(LIST_SPLIT)) {
      const { houses, rejected } = scanHouses(token);
      if (houses.length > 0) ctx = houses;
      for (const n of rejected) {
        if (!errors.some(e => e.code === 'invalid_house' && e.en.includes(`(${n})`))) {
          errors.push({
            code: 'invalid_house',
            en: `House number ${n} is out of range (1–12); it was ignored.`,
            hi: `भाव संख्या ${n} सीमा (1–12) से बाहर है; इसे छोड़ दिया गया।`,
          });
        }
      }

      const planets: string[] = [];
      for (const [alias, canonical] of PLANET_ALIASES) {
        if (tokenHasPlanet(token, alias) && !planets.includes(canonical)) planets.push(canonical);
      }
      if (planets.length === 0) continue;

      for (const planet of planets) {
        // Gulika (and any other contextual point) is NOT a house occupant; it is
        // recorded as a contextual token and never scored or timed.
        if (!SCORABLE.has(planet) && planet !== LAGNA) {
          if (CONTEXT_ONLY.has(planet) && !unknownTokens.includes(planet)) unknownTokens.push(planet);
          continue;
        }

        if (ctx.length === 0) {
          const raw = token.trim().slice(0, 80);
          if (!unresolved.some(u => u.planet === planet && u.raw === raw)) {
            unresolved.push({ planet, raw, reason: 'no_house_context' });
          }
          continue;
        }

        for (const house of ctx) {
          const key = `${planet}:${house}`;
          if (!seen.has(key)) {
            seen.add(key);
            mentions.push({ planet, house, isLagna: planet === LAGNA, raw: token.trim().slice(0, 80) });
          }
          const rec = rawsByPlanet.get(planet) ?? { houses: [], raws: [] };
          if (!rec.houses.includes(house)) rec.houses.push(house);
          const raw = token.trim().slice(0, 80);
          if (!rec.raws.includes(raw)) rec.raws.push(raw);
          rawsByPlanet.set(planet, rec);
        }
      }
    }
  }

  for (const house of new Set(mentions.filter(m => m.isLagna).map(m => m.house))) {
    lagnaHouses.push(house);
  }

  const conflicts: PlacementConflict[] = [];
  for (const [planet, rec] of rawsByPlanet) {
    if (rec.houses.length > 1) {
      conflicts.push({ planet, houses: [...rec.houses], raws: [...rec.raws] });
      errors.push({
        code: 'conflicting_house',
        en: `${planet} was assigned to more than one house (${rec.houses.join(', ')}).`,
        hi: `${planet} को एक से अधिक भाव (${rec.houses.join(', ')}) में रखा गया है।`,
      });
    }
  }
  if (unresolved.length > 0) {
    warnings.push({
      code: 'unresolved_placement',
      en: 'Some planets had no house next to them, so their house is unknown.',
      hi: 'कुछ ग्रहों के साथ भाव नहीं लिखा था, अतः उनका भाव अज्ञात है।',
    });
  }

  return { mentions, unknownTokens, unresolved, conflicts, lagnaHouses, errors, warnings };
}

// ─────────────────────────────────────────────────────────────────────────────
// Input validation (separate from routing)
// ─────────────────────────────────────────────────────────────────────────────

const isIsoDate = (s: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
const isClockTime = (s: string): boolean => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
const isLat = (n: number): boolean => Number.isFinite(n) && n >= -90 && n <= 90;
const isLon = (n: number): boolean => Number.isFinite(n) && n >= -180 && n <= 180;

function cleanStr(v: string | null | undefined): string | null {
  const s = (v ?? '').toString().trim();
  return s.length > 0 ? s : null;
}

function coordsOf(lat: number | null | undefined, lon: number | null | undefined) {
  const nLat = typeof lat === 'number' ? lat : Number.NaN;
  const nLon = typeof lon === 'number' ? lon : Number.NaN;
  return { lat: isLat(nLat) ? nLat : null, lon: isLon(nLon) ? nLon : null };
}

export function validateNatal(input: NatalInputs): NatalValidation {
  const issues: ValidationIssue[] = [];
  const dobRaw = cleanStr(input.dob);
  const tobRaw = cleanStr(input.tob);
  const place = cleanStr(input.place);
  const timezone = cleanStr(input.timezone);
  const { lat, lon } = coordsOf(input.latitude, input.longitude);

  const dob = dobRaw && isIsoDate(dobRaw) ? dobRaw : null;
  const tob = tobRaw && isClockTime(tobRaw) ? tobRaw : null;

  if (dobRaw && !dob) {
    issues.push({ code: 'invalid_date', en: 'Birth date is not a valid YYYY-MM-DD date.', hi: 'जन्म तिथि मान्य YYYY-MM-DD नहीं है।' });
  }
  if (tobRaw && !tob) {
    issues.push({ code: 'invalid_time', en: 'Birth time is not a valid 24-hour HH:MM time.', hi: 'जन्म समय मान्य 24-घंटे HH:MM नहीं है।' });
  }
  const hasCoords = lat !== null && lon !== null;
  const hasAnyPlace = Boolean(place) || input.latitude != null || input.longitude != null;
  if (hasAnyPlace && !hasCoords) {
    issues.push({ code: 'unresolved_location', en: 'Birth place is not resolved to coordinates.', hi: 'जन्म स्थान के निर्देशांक तय नहीं हैं।' });
  }
  if (hasCoords && !timezone) {
    issues.push({ code: 'missing_timezone', en: 'No timezone supplied; local solar time is assumed.', hi: 'समय-क्षेत्र नहीं दिया; स्थानीय सौर समय माना गया।' });
  }

  let state: NatalCompleteness;
  if (!dobRaw && !tobRaw && !hasAnyPlace) state = 'empty';
  else if (!dob) state = 'missing_date';
  else if (!tob) state = 'missing_time';
  else if (!hasCoords) state = place ? 'unresolved_place' : 'missing_place';
  else state = 'complete';

  return { state, dob, tob, place, latitude: lat, longitude: lon, timezone, issues };
}

export function validatePrashna(input: PrashnaInputs): PrashnaValidation {
  const issues: ValidationIssue[] = [];
  const place = cleanStr(input.place);
  const { lat, lon } = coordsOf(input.latitude, input.longitude);

  let moment: string | null = null;
  if (input.moment instanceof Date) {
    moment = Number.isNaN(input.moment.getTime()) ? null : input.moment.toISOString();
  } else if (typeof input.moment === 'string' && input.moment.trim()) {
    const d = new Date(input.moment);
    moment = Number.isNaN(d.getTime()) ? null : d.toISOString();
  }

  const hn = input.horaryNumber;
  let horaryNumber: number | null = null;
  if (hn != null) {
    if (Number.isInteger(hn) && hn >= 1 && hn <= 249) horaryNumber = hn;
    else {
      issues.push({ code: 'invalid_horary_number', en: 'Horary number must be a whole number from 1 to 249.', hi: 'प्रश्न संख्या 1 से 249 के बीच पूर्णांक होनी चाहिए।' });
    }
  }

  const hasCoords = lat !== null && lon !== null;
  const hasAnyPlace = Boolean(place) || input.latitude != null || input.longitude != null;
  if (hasAnyPlace && !hasCoords) {
    issues.push({ code: 'unresolved_location', en: 'Question place is not resolved to coordinates.', hi: 'प्रश्न-स्थान के निर्देशांक तय नहीं हैं।' });
  }

  let state: PrashnaCompleteness;
  if (!moment && !hasAnyPlace) state = 'empty';
  else if (!moment) state = 'missing_moment';
  else if (!hasCoords) state = place ? 'unresolved_place' : 'missing_place';
  else state = 'complete';

  return { state, moment, place, latitude: lat, longitude: lon, horaryNumber, issues };
}

export type TopicClassifier = (question: string) => { house: number; score: number };

const defaultClassifier: TopicClassifier = () => ({ house: 1, score: 0 });

export function validateIntake(
  request: IntakeRequest,
  classify: TopicClassifier = defaultClassifier,
): IntakeValidation {
  const question = (request.question ?? '').trim();
  const topic = question ? classify(question) : { house: 1, score: 0 };
  return {
    questionPresent: question.length > 0,
    natal: validateNatal(request.natal ?? {}),
    prashna: validatePrashna(request.prashna ?? {}),
    placements: parsePlacements(question),
    topicHouse: topic.score > 0 ? topic.house : null,
    topicScore: topic.score,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Route selection (separate from validation)
// ─────────────────────────────────────────────────────────────────────────────

const ASK: Record<AskId, Ask> = {
  topic: {
    id: 'topic',
    en: 'One word is enough — career, marriage, money, health, or property?',
    hi: 'एक शब्द पर्याप्त है — नौकरी, विवाह, धन, स्वास्थ्य या संपत्ति?',
  },
  birth: {
    id: 'birth',
    en: 'For a reading off your own chart I need birth date, exact time, and city.',
    hi: 'आपकी अपनी कुंडली से पढ़ने के लिए जन्म तिथि, सटीक समय और नगर चाहिए।',
  },
  moment: {
    id: 'moment',
    en: 'Or ask it as a Prashna: confirm the moment and city of the question.',
    hi: 'या इसे प्रश्न रूप में पूछें: प्रश्न का समय और नगर बताएं।',
  },
  place: {
    id: 'place',
    en: 'Which city are you asking from?',
    hi: 'आप किस नगर से पूछ रहे हैं?',
  },
};

const round = (n: number): number => Math.round(n * 1000) / 1000;

function natalAsks(state: NatalCompleteness): Ask[] {
  switch (state) {
    case 'missing_date':
      return [ASK.birth];
    case 'missing_time':
      return [ASK.birth];
    case 'missing_place':
    case 'unresolved_place':
      return [ASK.place];
    default:
      return [];
  }
}

function prashnaAsks(state: PrashnaCompleteness): Ask[] {
  switch (state) {
    case 'missing_moment':
      return [ASK.moment];
    case 'missing_place':
    case 'unresolved_place':
      return [ASK.place];
    default:
      return [];
  }
}

/**
 * Turn validated input into a lane. Pure and deterministic.
 *
 * Priority: natal intent → typed placements (≥2 resolved, non-Lagna mentions) →
 * question moment → insufficient.
 */
export function selectRoute(v: IntakeValidation): TriageResult {
  const { natal, prashna, placements, topicHouse } = v;
  const reasons: string[] = [];

  const topicCertainty = topicHouse === null ? 0.7 : 1;
  const unknownPenalty = placements.unknownTokens.length > 0 ? 0.6 : 1;
  const scoreable = placements.mentions.filter(m => !m.isLagna).length;

  // ── Lane A: natal intent. Any supplied birth field routes here. ──
  if (natal.state !== 'empty') {
    const castReady = natal.state === 'complete';
    reasons.push(
      castReady
        ? 'Complete birth data supplied.'
        : `Birth data incomplete (${natal.state}).`,
    );
    return {
      lane: 'natal_full',
      ceiling: castReady ? round(0.85 * topicCertainty * unknownPenalty) : 0,
      blockAnswer: !castReady,
      asks: natalAsks(natal.state).slice(0, 2),
      validation: v,
      reasons,
    };
  }

  // ── Lane B: typed placements, no birth data. ──
  if (scoreable >= 2) {
    const withMoment = prashna.state === 'complete' || prashna.state === 'missing_place' || prashna.state === 'unresolved_place';
    const cap = withMoment ? 0.5 : 0.45;
    reasons.push(`${scoreable} typed placements; no birth data — house-only summary only.`);
    if (withMoment) reasons.push('A question moment is also present; the cast chart is NOT the chart typed.');
    const asks: Ask[] = [];
    if (topicHouse === null) asks.push(ASK.topic);
    asks.push(ASK.birth);
    return {
      lane: 'placements_only',
      ceiling: round(cap * topicCertainty * unknownPenalty),
      blockAnswer: false,
      asks: asks.slice(0, 2),
      validation: v,
      reasons,
    };
  }

  // ── Lane C: a question moment, cast the Prashna chart. ──
  if (prashna.state !== 'empty') {
    const castReady = prashna.state === 'complete';
    reasons.push(castReady ? 'Question moment and place supplied.' : `Question moment input incomplete (${prashna.state}).`);
    const asks: Ask[] = [];
    if (topicHouse === null) asks.push(ASK.topic);
    asks.push(...prashnaAsks(prashna.state));
    return {
      lane: 'prashna_now',
      ceiling: castReady ? round(0.75 * topicCertainty) : 0,
      blockAnswer: !castReady,
      asks: asks.slice(0, 2),
      validation: v,
      reasons,
    };
  }

  // ── Lane D: nothing to work with. ──
  reasons.push('No birth data, no placements and no question moment.');
  const asks: Ask[] = [];
  if (topicHouse === null) asks.push(ASK.topic);
  if (!v.questionPresent) asks.push(ASK.moment);
  if (asks.length === 0) asks.push(ASK.moment);
  return {
    lane: 'insufficient',
    ceiling: 0,
    blockAnswer: true,
    asks: asks.slice(0, 2),
    validation: v,
    reasons,
  };
}

/**
 * Validate then route. The single entry point callers should use.
 * `classify` is injected so this module stays free of engine imports.
 */
export function triage(request: IntakeRequest, classify: TopicClassifier = defaultClassifier): TriageResult {
  return selectRoute(validateIntake(request, classify));
}

/**
 * Human-readable lane badge. Lane B states plainly that the answer came from
 * typed placements, not from a calculated chart.
 */
export const LANE_BADGE: Record<IntakeLane, { en: string; hi: string }> = {
  natal_full: { en: 'From your birth chart', hi: 'आपकी जन्म कुंडली से' },
  placements_only: { en: 'From typed placements — no dates, no dasha', hi: 'लिखे ग्रह-भाव से — कोई तिथि या दशा नहीं' },
  prashna_now: { en: 'Horary — cast at your question moment', hi: 'प्रश्न — आपके प्रश्न क्षण पर' },
  insufficient: { en: 'More information needed', hi: 'अधिक जानकारी चाहिए' },
};
