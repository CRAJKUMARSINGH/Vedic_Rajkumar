/**
 * dashaProvenance.test.ts — F10: the dasha system a card advertises must be the
 * one the engine actually computes.
 *
 * The contract schema types `provenance.dasha_system` as plain `string`, so
 * nothing else stops a card from naming a system the repository does not
 * implement. This app computes exactly one dasha system — Vimshottari — and
 * every emitted card must say so. The values below are the ones the type unions
 * used to advertise; they must never reach an emitted card.
 */
import { describe, expect, it } from 'vitest';
import { buildAnswerCard, DEFAULT_ASK } from '@/services/answerCard/answerCardBuilder';
import { ALL_TOPICS, LANGUAGES } from '@/services/answerCard/AnswerCard.types';
import { ANSWER_CARD_AS_OF } from '@/services/answerCard/answerCardAsOf';
import { DASHA_SYSTEM } from '@/services/dashaService';
import { resolveJatak } from '@/lib/jataks/resolveJatak';

/** Systems named in a legacy type union but NOT implemented anywhere. */
const UNIMPLEMENTED = ['ashtottari', 'yogini', 'kalachakra'];

describe('AnswerCard provenance — dasha system', () => {
  it('the engine names exactly one system, and it is Vimshottari', () => {
    expect(DASHA_SYSTEM).toBe('Vimshottari');
  });

  for (const lang of LANGUAGES) {
    it(
      `emitted card pins dasha_system = ${DASHA_SYSTEM} (${lang})`,
      { timeout: 60000 },
      () => {
        const card = buildAnswerCard(
          resolveJatak('Premlata Jain')!,
          DEFAULT_ASK,
          [...ALL_TOPICS],
          lang,
          ANSWER_CARD_AS_OF,
        );
        expect(card.provenance.dasha_system).toBe(DASHA_SYSTEM);

        const lowered = card.provenance.dasha_system.toLowerCase();
        for (const name of UNIMPLEMENTED) {
          expect(lowered).not.toContain(name);
        }
      },
    );
  }
});
