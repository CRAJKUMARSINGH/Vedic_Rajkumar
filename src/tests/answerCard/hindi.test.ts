/**
 * hindi.test.ts — the engine speaks English; the card must still be Hindi for
 * a Hindi ask. Glossing is deterministic and must never block a card.
 */

import { describe, expect, it } from 'vitest';
import { glossRationale, glossToHindi } from '@/services/answerCard/hiGloss';
import { BAND_WORD, TOPIC_LABEL } from '@/services/answerCard/AnswerCard.types';

const DEVANAGARI = /[\u0900-\u097F]/;

describe('glossToHindi', () => {
  it('renders the house-promise sentence in Devanagari', () => {
    const out = glossToHindi(
      'career houses average 85/100 by SAV; strongest is house 10 at 35 points and weakest is house 1 at 26 points.'
    );
    expect(out).toMatch(DEVANAGARI);
    expect(out).toContain('करियर');
    expect(out).toContain('85/100');
  });

  it('renders the MD/AD clearance sentence with Hindi planet names', () => {
    const out = glossToHindi(
      'Rahu MD with Jupiter AD gives 68/100 Dasha clearance for wealth; delivery class is standard.'
    );
    expect(out).toContain('राहु');
    expect(out).toContain('गुरु');
    expect(out).toMatch(DEVANAGARI);
  });

  it('renders the Rajyoga gate sentence', () => {
    const out = glossToHindi(
      'Rajyoga gate is open through Gajakesari Yoga, Raj Yoga; status can rise because the forming planets are in the active Dasha field.'
    );
    expect(out).toMatch(DEVANAGARI);
  });

  it('passes an unknown sentence through unchanged rather than throwing', () => {
    const weird = 'A sentence the engine has never emitted before.';
    expect(glossToHindi(weird)).toBe(weird);
  });

  it('glosses sentence-by-sentence inside a rationale paragraph', () => {
    const para =
      'career houses average 62/100 by SAV; strongest is house 10 at 34 points and weakest is house 6 at 22 points. Unknown tail sentence.';
    const out = glossRationale(para);
    expect(out).toMatch(DEVANAGARI);
    expect(out).toContain('Unknown tail sentence.');
  });
});

describe('bilingual vocabulary', () => {
  it('every band and topic has a Hindi word', () => {
    for (const w of Object.values(BAND_WORD)) expect(w.hi).toMatch(DEVANAGARI);
    for (const l of Object.values(TOPIC_LABEL)) expect(l.hi).toMatch(DEVANAGARI);
  });
});
