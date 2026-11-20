/**
 * Rule tests — Synthesis (Prasnalove.txt §9, §5.9). Synthetic evidence only.
 */
import { describe, it, expect } from 'vitest';
import { makeEvidence, polaritySign } from '@/features/prashna/kernel/evidence';
import type { EvidenceItem, Polarity } from '@/features/prashna/kernel/evidence';
import { STARTING_WEIGHTS, synthesize } from '@/features/prashna/kernel/synthesis';

function item(polarity: Polarity, weight: number, id = 'test.item'): EvidenceItem {
  return makeEvidence({
    id,
    label: { en: 'test', hi: 'test' },
    value: 1,
    polarity,
    weight,
    citationId: 'pm.ch6.s60',
  });
}

describe('polaritySign', () => {
  it('maps polarity to ±1/0', () => {
    expect(polaritySign('supports')).toBe(1);
    expect(polaritySign('opposes')).toBe(-1);
    expect(polaritySign('neutral')).toBe(0);
  });
});

describe('synthesize', () => {
  it('all supporting → yes with full confidence', () => {
    const r = synthesize([item('supports', 0.5), item('supports', 0.5)]);
    expect(r.verdict).toBe('yes');
    expect(r.confidence).toBe(1);
    expect(r.score).toBeCloseTo(1);
  });

  it('all opposing → no', () => {
    const r = synthesize([item('opposes', 0.5), item('opposes', 0.5)]);
    expect(r.verdict).toBe('no');
    expect(r.score).toBeCloseTo(-1);
  });

  it('empty input → unclear with zero confidence', () => {
    const r = synthesize([]);
    expect(r.verdict).toBe('unclear');
    expect(r.confidence).toBe(0);
  });

  it('balanced evidence → unclear', () => {
    const r = synthesize([item('supports', 0.3), item('opposes', 0.3)]);
    expect(r.verdict).toBe('unclear');
  });

  it('weak lean → maybe', () => {
    // score 0.2 / total 1.0 = 0.2 → confidence 0.28 (< 0.5), |norm| ≥ 0.15.
    const r = synthesize([item('supports', 0.6), item('opposes', 0.4)]);
    expect(r.verdict).toBe('maybe');
  });
});

describe('STARTING_WEIGHTS', () => {
  it('sum to 1.0', () => {
    const total = Object.values(STARTING_WEIGHTS).reduce((s, w) => s + w, 0);
    expect(total).toBeCloseTo(1.0, 10);
  });
});
