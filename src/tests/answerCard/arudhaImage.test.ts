/**
 * arudhaImage.test.ts — v2 §9 tests for the bounded image axis.
 *
 * Covers: base table (12), gap bands (boundaries ±7/±8/±19/±20), fail-closed
 * provenance, substance-substitution guard, and the ±cap / range clamp.
 * Fixtures are synthetic — no real birth data (confidentiality standing order).
 */
import { describe, it, expect } from 'vitest';
import {
  buildImageAxis,
  validateImageProvenance,
  gapBand,
  bandForImageScore,
  IMAGE_BASE_BY_HOUSE,
  ARUDHA_CONVENTION,
  type ImageAxis,
} from '@/services/answerCard/arudhaImage';
import type { ChartFacts, Placement, Planet, Dignity } from '@/services/answerCard/chartFacts';

const P = (
  planet: Planet, house: number, sign: number,
  retrograde = false, dignity: Dignity = 'neutral',
): Placement => ({ planet, house, sign, retrograde, dignity });

const facts = (ascSign: number | null, placements: Placement[]): ChartFacts =>
  ({ ascSign, placements, houses: {} });

/** asc 0 (Aries) → Mars at sign 0 ⇒ AL = sign 9; Saturn at sign 9 ⇒ A10 = sign 6. */
const careerFacts = () => facts(0, [
  P('Mars', 1, 0),
  P('Saturn', 10, 9),
]);

describe('arudhaImage — base table (v2 §4)', () => {
  const expected: Record<number, number> = {
    1: 72, 2: 60, 3: 56, 4: 52, 5: 66, 6: 38,
    7: 48, 8: 30, 9: 76, 10: 90, 11: 80, 12: 22,
  };
  for (let house = 1; house <= 12; house++) {
    it(`house ${house} from AL → base ${expected[house]}`, () => {
      expect(IMAGE_BASE_BY_HOUSE[house]).toBe(expected[house]);
    });
  }
});

describe('arudhaImage — gap bands (v2 §2/§9)', () => {
  it('classifies the boundaries ±7, ±8, ±19, ±20', () => {
    expect(gapBand(20)).toBe('over-promised');
    expect(gapBand(19)).toBe('ahead');
    expect(gapBand(8)).toBe('ahead');
    expect(gapBand(7)).toBe('aligned');
    expect(gapBand(-7)).toBe('aligned');
    expect(gapBand(-8)).toBe('undervalued');
    expect(gapBand(-19)).toBe('undervalued');
    expect(gapBand(-20)).toBe('invisible');
  });

  it('image score bands use the shared substance vocabulary', () => {
    expect(bandForImageScore(75)).toBe('excellent');
    expect(bandForImageScore(74)).toBe('good');
    expect(bandForImageScore(56)).toBe('good');
    expect(bandForImageScore(55)).toBe('average');
    expect(bandForImageScore(40)).toBe('average');
    expect(bandForImageScore(39)).toBe('caution');
    expect(bandForImageScore(25)).toBe('caution');
    expect(bandForImageScore(24)).toBe('avoid');
  });
});

describe('arudhaImage — buildImageAxis', () => {
  it('builds a bounded axis for a forecast-bearing topic', () => {
    const axis = buildImageAxis({ facts: careerFacts(), topic: 'career', substanceScore: 70 });
    expect(axis).not.toBeNull();
    // base 90 − 5 (Saturn, a malefic, sits in AL) = 85; gap = 85 − 70 = 15
    expect(axis!.score).toBe(85);
    expect(axis!.gap).toBe(15);
    expect(axis!.band_gap).toBe('ahead');
    expect(axis!.band).toBe(bandForImageScore(axis!.score));
    expect(axis!.provenance.convention).toBe(ARUDHA_CONVENTION);
    expect(axis!.provenance.engine).toContain('calculateArudhaPada');
    expect(validateImageProvenance(axis)).toBe(true);
  });

  it('omits the axis for health — no health creep (v2 §10)', () => {
    expect(buildImageAxis({ facts: careerFacts(), topic: 'health', substanceScore: 60 })).toBeNull();
  });

  it('omits the axis when the ascendant is unknown (no silent zero)', () => {
    const f = facts(null, [P('Mars', 1, 0)]);
    expect(buildImageAxis({ facts: f, topic: 'career', substanceScore: 60 })).toBeNull();
  });

  it('omits the axis when the Arudha lord is unresolved', () => {
    expect(buildImageAxis({ facts: facts(0, []), topic: 'career', substanceScore: 60 })).toBeNull();
  });

  it('clamps the score into 0..100 under heavy AL affliction (cap)', () => {
    // Mars at sign 5 ⇒ AL = sign 10; four malefics + retrogression pile into AL.
    const f = facts(0, [
      P('Mars', 6, 5),
      P('Sun', 11, 10, true), P('Saturn', 11, 10, true),
      P('Rahu', 11, 10, true), P('Ketu', 11, 10, true),
    ]);
    const axis = buildImageAxis({ facts: f, topic: 'career', substanceScore: 50 });
    expect(axis).not.toBeNull();
    expect(axis!.score).toBeGreaterThanOrEqual(0);
    expect(axis!.score).toBeLessThanOrEqual(100);
  });

  it('never mutates the chart facts (substance substitution guard, v2 §10)', () => {
    const f = careerFacts();
    const snapshot = JSON.parse(JSON.stringify(f));
    buildImageAxis({ facts: f, topic: 'career', substanceScore: 70 });
    expect(f).toEqual(snapshot);
  });

  it('marks a prashna reference TRADITIONAL and withholds an extreme claim', () => {
    // substance 40 → gap 45 (extreme) → TRADITIONAL + extreme ⇒ withheld.
    const axis = buildImageAxis({
      facts: careerFacts(), topic: 'career', substanceScore: 40, referenceType: 'prashna',
    });
    expect(axis).not.toBeNull();
    expect(axis!.provenance.status).toBe('TRADITIONAL');
    expect(validateImageProvenance(axis)).toBe(false);
  });
});

describe('arudhaImage — provenance fail-closed (v2 §6/§9)', () => {
  const valid = (over: Partial<ImageAxis['provenance']> = {}, gap = 0): ImageAxis => ({
    kind: 'A10',
    arudhaFromAl: 10,
    score: 70,
    band: 'good',
    gap,
    band_gap: 'aligned',
    citations: [],
    line: { en: 'x', hi: 'x' },
    provenance: {
      engine: 'jaiminiService.calculateArudhaPada',
      version: 'arudha-image-0.1.0',
      convention: ARUDHA_CONVENTION,
      arudha_hash: 'abc',
      status: 'VERIFIED',
      ...over,
    },
  });

  it('accepts a well-formed VERIFIED axis', () => {
    expect(validateImageProvenance(valid())).toBe(true);
  });

  it('rejects null / missing engine / missing hash', () => {
    expect(validateImageProvenance(null)).toBe(false);
    expect(validateImageProvenance(valid({ engine: '' }))).toBe(false);
    expect(validateImageProvenance(valid({ arudha_hash: '' }))).toBe(false);
  });

  it('rejects a mismatched convention string', () => {
    expect(validateImageProvenance(valid({ convention: 'invented' }))).toBe(false);
  });

  it('rejects a TRADITIONAL axis carrying an extreme gap', () => {
    expect(validateImageProvenance(valid({ status: 'TRADITIONAL' }, 25))).toBe(false);
    expect(validateImageProvenance(valid({ status: 'TRADITIONAL' }, 12))).toBe(true);
  });
});

// ─── W3 — confidence.ts image-gap adjustments (v2 §3) ────────────────────────

describe('confidence — image-gap adjustments (v2 §3 / W3)', () => {
  // Build a minimal ConclusiveJatakJudgment stand-in.
  const j = {
    score: 65,
    evidence: [{ score: 60 }, { score: 70 }],
    conflictResolution: [],
    houseVerdict: 'clear',
    transitVerdict: 'clear',
  } as unknown as Parameters<typeof import('@/services/answerCard/confidence').deriveConfidence>[0];

  it('no image input → no change from baseline (additive only)', async () => {
    const { deriveConfidence } = await import('@/services/answerCard/confidence');
    const base = deriveConfidence(j);
    const withNull = deriveConfidence(j, null);
    expect(withNull).toBe(base);
  });

  it('aligned gap (|gap| ≤ 7) → +0.03', async () => {
    const { deriveConfidence } = await import('@/services/answerCard/confidence');
    const base = deriveConfidence(j);
    const aligned = deriveConfidence(j, { gap: 5, alLordUnresolved: false });
    expect(aligned).toBeCloseTo(Math.min(0.9, base + 0.03), 2);
  });

  it('extreme gap (|gap| ≥ 20) → −0.05', async () => {
    const { deriveConfidence } = await import('@/services/answerCard/confidence');
    const base = deriveConfidence(j);
    const extreme = deriveConfidence(j, { gap: 25, alLordUnresolved: false });
    expect(extreme).toBeCloseTo(Math.max(0.2, base - 0.05), 2);
  });

  it('A10 uncomputable (gap null) → −0.04', async () => {
    const { deriveConfidence } = await import('@/services/answerCard/confidence');
    const base = deriveConfidence(j);
    const uncomputable = deriveConfidence(j, { gap: null, alLordUnresolved: false });
    expect(uncomputable).toBeCloseTo(Math.max(0.2, base - 0.04), 2);
  });

  it('AL lord unresolved → −0.06', async () => {
    const { deriveConfidence } = await import('@/services/answerCard/confidence');
    const base = deriveConfidence(j);
    const unresolved = deriveConfidence(j, { gap: 0, alLordUnresolved: true });
    expect(unresolved).toBeCloseTo(Math.max(0.2, base - 0.06 + 0.03), 2);
  });

  it('ceiling is always 0.90 regardless of AL adjustments', async () => {
    const { deriveConfidence } = await import('@/services/answerCard/confidence');
    const highJ = { ...j, score: 88, evidence: [{ score: 85 }, { score: 90 }] };
    const result = deriveConfidence(
      highJ as typeof j,
      { gap: 3, alLordUnresolved: false },
    );
    expect(result).toBeLessThanOrEqual(0.9);
  });

  it('floor is always 0.20 regardless of AL adjustments', async () => {
    const { deriveConfidence } = await import('@/services/answerCard/confidence');
    const lowJ = {
      ...j, score: 10,
      evidence: [{ score: 5 }, { score: 90 }],
      conflictResolution: ['c1', 'c2', 'c3', 'c4', 'c5'],
      houseVerdict: 'Ashtakavarga data is unavailable',
      transitVerdict: 'cannot be certified',
    };
    const result = deriveConfidence(
      lowJ as typeof j,
      { gap: -25, alLordUnresolved: true },
    );
    expect(result).toBeGreaterThanOrEqual(0.2);
  });
});
