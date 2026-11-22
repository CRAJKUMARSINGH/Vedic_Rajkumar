/**
 * Intake triage — deterministic regression suite.
 *
 * Mirrors the 18 enumeration cases of the TRIAGE OBSERVATION REVIEW sign-off
 * (Phase 6) plus the module's own global invariants. The module under test is
 * pure: no engine imports, no clock, no randomness — so every assertion here is
 * reproducible byte-for-byte.
 */

import {
  triage,
  parsePlacements,
  validateNatal,
  validatePrashna,
  INTAKE_ENGINES,
  LANE_BADGE,
  type IntakeRequest,
  type TopicClassifier,
} from '@/lib/intake/triage';
import { ANSWER_CONTRACT_VERSION } from '@/services/answerCard/AnswerCard.types';

const DELHI = { lat: 28.6139, lon: 77.209 };

const COMPLETE_NATAL = {
  dob: '1979-07-28',
  tob: '23:50',
  place: 'Dungarpur',
  latitude: 23.84,
  longitude: 73.71,
};

const COMPLETE_PRASHNA = {
  moment: '2026-11-22T10:30:00',
  place: 'Mumbai',
  latitude: 19.07,
  longitude: 72.87,
};

const req = (over: Partial<IntakeRequest> = {}): IntakeRequest => ({
  question: 'Will I get the promotion at work?',
  natal: {},
  prashna: {},
  ...over,
});

// ── TC-01 ────────────────────────────────────────────────────────────────────
describe('TC-01 complete natal inputs', () => {
  it('routes to natal_full and is cast-ready', () => {
    const r = triage(req({ natal: COMPLETE_NATAL }));
    expect(r.lane).toBe('natal_full');
    expect(r.blockAnswer).toBe(false);
    expect(r.asks).toHaveLength(0);
    expect(INTAKE_ENGINES[r.lane]).toBe(true);
    // ceiling = 0.85 × topicCertainty(0.7, unclassified) × 1
    expect(r.ceiling).toBeCloseTo(0.595, 3);
  });
});

// ── TC-02 ────────────────────────────────────────────────────────────────────
describe('TC-02 missing natal location', () => {
  it('blocks and asks for a city instead of defaulting to Delhi', () => {
    const r = triage(req({ natal: { dob: '1979-07-28', tob: '23:50' } }));
    expect(r.lane).toBe('natal_full');
    expect(r.blockAnswer).toBe(true);
    expect(r.asks.map(a => a.id)).toContain('place');
    expect(r.ceiling).toBe(0);
    expect(r.validation.natal.latitude).toBeNull();
  });
});

// ── TC-03 ────────────────────────────────────────────────────────────────────
describe('TC-03 missing natal time', () => {
  it('blocks and asks for birth details', () => {
    const r = triage(req({ natal: { dob: '1979-07-28', place: 'Dungarpur', latitude: 23.84, longitude: 73.71 } }));
    expect(r.lane).toBe('natal_full');
    expect(r.blockAnswer).toBe(true);
    expect(r.asks.map(a => a.id)).toContain('birth');
    expect(r.validation.natal.state).toBe('missing_time');
  });
});

// ── TC-04 ────────────────────────────────────────────────────────────────────
describe('TC-04 valid Prashna moment', () => {
  it('routes to prashna_now and is cast-ready', () => {
    const r = triage(req({ prashna: COMPLETE_PRASHNA }));
    expect(r.lane).toBe('prashna_now');
    expect(r.blockAnswer).toBe(false);
    expect(INTAKE_ENGINES[r.lane]).toBe(true);
    expect(r.ceiling).toBeCloseTo(0.525, 3); // 0.75 × 0.7
  });
});

// ── TC-05 ────────────────────────────────────────────────────────────────────
describe('TC-05 missing Prashna place', () => {
  it('blocks and asks which city', () => {
    const r = triage(req({ prashna: { moment: '2026-11-22T10:30:00' } }));
    expect(r.lane).toBe('prashna_now');
    expect(r.blockAnswer).toBe(true);
    expect(r.asks.map(a => a.id)).toContain('place');
  });
});

// ── TC-06 ────────────────────────────────────────────────────────────────────
describe('TC-06 topic-less question', () => {
  it('records no topic house and lowers the ceiling', () => {
    const classifier: TopicClassifier = () => ({ house: 1, score: 0 });
    const r = triage(req({ natal: COMPLETE_NATAL }), classifier);
    expect(r.validation.topicHouse).toBeNull();
    expect(r.validation.topicScore).toBe(0);
    // 0.85 × 0.7 (topic-less) × 1
    expect(r.ceiling).toBeCloseTo(0.595, 3);
  });

  it('adds a topic ask for house-only input', () => {
    const classifier: TopicClassifier = () => ({ house: 1, score: 0 });
    const r = triage(req({ question: 'Sun in 1st house, Moon in 4th house' }), classifier);
    expect(r.lane).toBe('placements_only');
    expect(r.asks.map(a => a.id)).toContain('topic');
  });
});

// ── TC-07 ────────────────────────────────────────────────────────────────────
describe('TC-07 multiple typed placements', () => {
  it('routes to placements_only with no engine', () => {
    const r = triage(req({ question: 'Venus in 12th house, Saturn in 8th house, Jupiter in 7th house' }));
    expect(r.lane).toBe('placements_only');
    expect(r.blockAnswer).toBe(false);
    expect(INTAKE_ENGINES[r.lane]).toBe(false);
    expect(r.validation.placements.mentions).toHaveLength(3);
    expect(r.ceiling).toBeCloseTo(0.315, 3); // 0.45 × 0.7
  });
});

// ── TC-08 ────────────────────────────────────────────────────────────────────
describe('TC-08 conjunction lists', () => {
  it('carries house context within a segment but never across it', () => {
    const p = parsePlacements('Venus in 12th, Lagna 1st with Sun+Jupiter+Gulika, Moon in 4th');
    const byKey = p.mentions.map(m => `${m.planet}:${m.house}`);
    expect(byKey).toContain('venus:12');
    expect(byKey).toContain('sun:1');
    expect(byKey).toContain('jupiter:1');
    expect(byKey).toContain('lagna:1');
    expect(byKey).toContain('moon:4');
    expect(p.lagnaHouses).toEqual([1]);
    expect(p.unknownTokens).toContain('gulika');
  });
});

// ── TC-09 ────────────────────────────────────────────────────────────────────
describe('TC-09 conflicting house assignments', () => {
  it('reports a conflict rather than silently picking one', () => {
    const p = parsePlacements('Sun in 1st house, Sun in 5th house');
    expect(p.conflicts).toHaveLength(1);
    expect(p.conflicts[0].planet).toBe('sun');
    expect(p.conflicts[0].houses).toEqual([1, 5]);
    expect(p.errors.some(e => e.code === 'conflicting_house')).toBe(true);
  });
});

// ── TC-10 ────────────────────────────────────────────────────────────────────
describe('TC-10 invalid house numbers', () => {
  it('rejects out-of-range houses (never clamps) and keeps the planet unresolved', () => {
    const p = parsePlacements('Sun in 13th house');
    expect(p.mentions).toHaveLength(0);
    expect(p.errors.some(e => e.code === 'invalid_house')).toBe(true);
    expect(p.unresolved.map(u => u.planet)).toContain('sun');
  });
});

// ── TC-11 ────────────────────────────────────────────────────────────────────
describe('TC-11 unresolved planet tokens', () => {
  it('preserves a planet that has no house context', () => {
    const p = parsePlacements('Sun in 1st house, Moon');
    expect(p.mentions.map(m => `${m.planet}:${m.house}`)).toEqual(['sun:1']);
    expect(p.unresolved.map(u => u.planet)).toContain('moon');
    expect(p.warnings.some(w => w.code === 'unresolved_placement')).toBe(true);
  });
});

// ── TC-12 ────────────────────────────────────────────────────────────────────
describe('TC-12 English and Hindi input', () => {
  it('parses English', () => {
    const p = parsePlacements('Venus in 12th house');
    expect(p.mentions.map(m => `${m.planet}:${m.house}`)).toContain('venus:12');
  });
  it('parses Roman Hindi', () => {
    const p = parsePlacements('Surya 1st house, Chandra 4th house');
    expect(p.mentions.map(m => `${m.planet}:${m.house}`)).toEqual(
      expect.arrayContaining(['sun:1', 'moon:4']),
    );
  });
  it('parses Devanagari', () => {
    const p = parsePlacements('सूर्य भाव 1, चंद्र भाव 4');
    expect(p.mentions.map(m => `${m.planet}:${m.house}`)).toEqual(
      expect.arrayContaining(['sun:1', 'moon:4']),
    );
  });
});

// ── TC-13 ────────────────────────────────────────────────────────────────────
describe('TC-13 Gulika context-only behaviour', () => {
  it('never treats Gulika as a house occupant', () => {
    const p = parsePlacements('Gulika in 1st house');
    expect(p.mentions).toHaveLength(0);
    expect(p.unknownTokens).toContain('gulika');
  });

  it('lowers the lane ceiling when a contextual token is present', () => {
    const withGulika = triage(
      req({ question: 'Venus in 12th, Lagna 1st with Sun+Gulika, Moon in 4th house' }),
    );
    expect(withGulika.lane).toBe('placements_only');
    // unknownPenalty 0.6 applied: 0.45 × 0.7 × 0.6
    expect(withGulika.ceiling).toBeCloseTo(0.189, 3);
  });
});

// ── TC-14 ────────────────────────────────────────────────────────────────────
describe('TC-14 no cross-chart substitution', () => {
  it('prefers the natal lane when both natal and moment are present', () => {
    const r = triage(req({ natal: COMPLETE_NATAL, prashna: COMPLETE_PRASHNA }));
    expect(r.lane).toBe('natal_full');
    // the question moment is still recorded, but it does not become the chart
    expect(r.validation.prashna.moment).not.toBeNull();
  });
});

// ── TC-15 ────────────────────────────────────────────────────────────────────
describe('TC-15 no dated prediction from typed placements', () => {
  it('exposes no calculation engine for house-only input', () => {
    const r = triage(req({ question: 'Sun in 1st house, Moon in 4th house' }));
    expect(r.lane).toBe('placements_only');
    expect(INTAKE_ENGINES.placements_only).toBe(false);
    expect(r.reasons.join(' ')).toMatch(/house-only|summary/i);
  });
});

// ── TC-16 ────────────────────────────────────────────────────────────────────
describe('TC-16 accurate provenance', () => {
  it('records the exact validated inputs it routed on', () => {
    const r = triage(req({ natal: COMPLETE_NATAL }));
    expect(r.validation.natal.place).toBe('Dungarpur');
    expect(r.validation.natal.latitude).toBeCloseTo(23.84, 4);
    expect(r.validation.natal.longitude).toBeCloseTo(73.71, 4);
    expect(r.validation.natal.dob).toBe('1979-07-28');
    expect(r.validation.natal.tob).toBe('23:50');
  });
});

// ── TC-17 ────────────────────────────────────────────────────────────────────
describe('TC-17 legacy AnswerCard compatibility', () => {
  it('leaves the AnswerCard contract version untouched', () => {
    expect(ANSWER_CONTRACT_VERSION).toBe('1.4');
  });
});

// ── TC-18 ────────────────────────────────────────────────────────────────────
describe('TC-18 no silent geographic defaults', () => {
  it('never fabricates Delhi coordinates', () => {
    const r = triage(req({ question: 'Will I buy a house this year?' }));
    expect(r.validation.prashna.latitude).toBeNull();
    expect(r.validation.prashna.longitude).toBeNull();
    expect(r.validation.prashna.latitude).not.toBe(DELHI.lat);
    expect(r.blockAnswer).toBe(true);
  });

  it('keeps supplied coordinates verbatim', () => {
    const r = triage(req({ prashna: COMPLETE_PRASHNA }));
    expect(r.validation.prashna.latitude).toBeCloseTo(19.07, 4);
    expect(r.validation.prashna.longitude).toBeCloseTo(72.87, 4);
  });
});

// ── Global invariants ────────────────────────────────────────────────────────
describe('global invariants', () => {
  const matrix: IntakeRequest[] = [
    req(),
    req({ natal: COMPLETE_NATAL }),
    req({ natal: { dob: 'x' } }),
    req({ prashna: COMPLETE_PRASHNA }),
    req({ question: 'Sun in 1st house, Moon in 4th house' }),
    req({ question: 'Sun in 20th house' }),
  ];

  it('is deterministic (pure)', () => {
    for (const input of matrix) {
      expect(JSON.stringify(triage(input))).toBe(JSON.stringify(triage(input)));
    }
  });

  it('keeps every ceiling within [0, 1]', () => {
    for (const input of matrix) {
      const c = triage(input).ceiling;
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThanOrEqual(1);
    }
  });

  it('never reports an engine for a lane that has none', () => {
    for (const input of matrix) {
      const r = triage(input);
      if (r.lane === 'placements_only' || r.lane === 'insufficient') {
        expect(INTAKE_ENGINES[r.lane]).toBe(false);
      }
    }
  });

  it('never asks more than two questions', () => {
    for (const input of matrix) {
      expect(triage(input).asks.length).toBeLessThanOrEqual(2);
    }
  });

  it('exposes a bilingual badge for every lane', () => {
    for (const lane of Object.keys(INTAKE_ENGINES) as (keyof typeof INTAKE_ENGINES)[]) {
      expect(LANE_BADGE[lane].en.length).toBeGreaterThan(0);
      expect(LANE_BADGE[lane].hi.length).toBeGreaterThan(0);
    }
  });
});

// ── Validator unit behaviour ─────────────────────────────────────────────────
describe('validators', () => {
  it('rejects malformed dates and times', () => {
    const n = validateNatal({ dob: '28-07-1979', tob: '11:70', place: 'X', latitude: 1, longitude: 2 });
    expect(n.dob).toBeNull();
    expect(n.tob).toBeNull();
    expect(n.issues.map(i => i.code)).toEqual(
      expect.arrayContaining(['invalid_date', 'invalid_time']),
    );
    // time is required before a chart may be cast
    expect(n.state).toBe('missing_date');
  });

  it('validates horary numbers 1–249 and never clamps', () => {
    expect(validatePrashna({ moment: '2026-11-22T10:30:00', horaryNumber: 249 }).horaryNumber).toBe(249);
    expect(validatePrashna({ moment: '2026-11-22T10:30:00', horaryNumber: 250 }).horaryNumber).toBeNull();
    expect(
      validatePrashna({ moment: '2026-11-22T10:30:00', horaryNumber: 0 }).issues.map(i => i.code),
    ).toContain('invalid_horary_number');
  });

  it('flags an unresolved place rather than inventing coordinates', () => {
    const n = validateNatal({ dob: '1979-07-28', tob: '23:50', place: 'Nowhere' });
    expect(n.state).toBe('unresolved_place');
    expect(n.latitude).toBeNull();
    expect(n.issues.map(i => i.code)).toContain('unresolved_location');
  });
});
