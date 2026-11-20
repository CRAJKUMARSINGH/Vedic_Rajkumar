import { describe, it, expect } from 'vitest';
import { classifyDepth, sectionBudget } from '@/services/answerCard/depth';
import { deriveSequencing } from '@/services/answerCard/sequencing';
import { buildRemedy, pickRemedyTarget } from '@/services/answerCard/remedyPlan';
import { cardEphemeris } from '@/services/answerCard/answerCardBuilder';
import type { Verdict } from '@/services/answerCard/AnswerCard.types';
import type { ChartFacts } from '@/services/answerCard/chartFacts';

const verdict = (topic: Verdict['topic'], band: Verdict['band'], score: number): Verdict => ({
  topic, headline: { en: '', hi: '' }, score_0_100: score, band,
  engine_verdict: 'DELIVERING', confidence_0_1: 0.8, window: null,
  rationale: { en: '', hi: '' }, conflicts: [], evidence: [],
  remedies: [], caveats: [],
});

const facts = (over: Partial<ChartFacts> = {}): ChartFacts => ({
  ascSign: 0,
  placements: [
    { planet: 'Sun', house: 10, sign: 0, retrograde: false, dignity: 'exalted' },
    { planet: 'Saturn', house: 10, sign: 6, retrograde: false, dignity: 'debilitated' },
    { planet: 'Moon', house: 7, sign: 1, retrograde: false, dignity: 'friend' },
  ],
  houses: {},
  ...over,
});

describe('depth.classifyDepth', () => {
  it('classifies brief / standard / deep deterministically', () => {
    expect(classifyDepth('will i get the job?')).toBe('brief');
    expect(classifyDepth('kya millega?')).toBe('brief');
    expect(classifyDepth('should i change jobs or stay? compare both')).toBe('deep');
    expect(classifyDepth('career prospects outlook')).toBe('deep');
    expect(classifyDepth('something unrelated entirely')).toBe('standard');
    expect(sectionBudget('brief')).toBe(2);
    expect(sectionBudget('deep')).toBe(6);
  });
});

describe('sequencing.deriveSequencing', () => {
  it('returns null for fewer than 2 live verdicts', () => {
    expect(deriveSequencing([])).toBeNull();
    expect(deriveSequencing([verdict('career', 'good', 80)])).toBeNull();
    expect(deriveSequencing([verdict('career', 'caution', 40), verdict('finance', 'avoid', 10)])).toBeNull();
  });

  it('orders by band then score, stable for ties, bilingual', () => {
    const s = deriveSequencing([
      verdict('career', 'good', 80),
      verdict('finance', 'good', 80),
      verdict('marriage', 'average', 60),
    ])!;
    expect(s.max).toBe(2);
    // career before finance on topic asc tiebreak
    expect(s.order).toEqual(['career', 'finance', 'marriage']);
    expect(s.line.en).toContain('Optional planning note');
    expect(s.line.en).toContain('never overrides medical');
    expect(s.line.hi.length).toBeGreaterThan(10);
  });
});

describe('remedyPlan', () => {
  it('picks weakest VERIFIED dignity among topic-house candidates, deduped', () => {
    // career houses 10,1,6 — Saturn debilitated in 10 wins over lords too
    const r = buildRemedy(facts(), 'career')!;
    expect(r.planet).toBe('Saturn');
    expect(r.mantra).toContain('शनैश्चराय');
    expect(r.optional.en).toContain('optional traditional practice');
    expect(r.avoid.en).not.toContain('wasted'); // no unverified efficacy claim
  });

  it('omits remedy when dignity is unknown (not verified-weak)', () => {
    const f = facts({
      placements: [{ planet: 'Saturn', house: 10, sign: 6, retrograde: false, dignity: 'unknown' }],
    });
    // Moon is 'friend' — still verified, so Saturn excluded, Moon may win for marriage houses
    expect(pickRemedyTarget(f, 'career')).toBeNull();
    expect(buildRemedy(f, 'career')).toBeNull();
  });

  it('returns null when ascendant unknown and no placements', () => {
    expect(buildRemedy(facts({ ascSign: null, placements: [] }), 'career')).toBeNull();
  });
});

describe('answerCardBuilder.cardEphemeris — engine honesty', () => {
  const chartWith = (ephemerisSource?: 'swiss-wasm' | 'fallback') =>
    ({ planetaryPositions: ephemerisSource ? { ephemerisSource } : null }) as unknown as Parameters<typeof cardEphemeris>[0];

  it('discloses the coarse fallback engine when the ephemeris service reports it', () => {
    expect(cardEphemeris(chartWith('fallback'))).toBe('fallback');
  });

  it('reports swisseph only when the WASM engine actually produced the chart', () => {
    expect(cardEphemeris(chartWith('swiss-wasm'))).toBe('swisseph');
  });

  it('defaults to the local engine when the chart carries no engine stamp', () => {
    expect(cardEphemeris(chartWith())).toBe('local');
    expect(cardEphemeris(null)).toBe('local');
  });
});
