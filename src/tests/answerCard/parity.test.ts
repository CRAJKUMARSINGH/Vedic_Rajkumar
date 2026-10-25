/**
 * parity.test.ts — the bytes the app serves and the bytes the emitter wrote
 * must come from the same renderer. If this fails, either the engine changed
 * without a re-emit, or the renderer grew a condition on content.
 *
 * Rebuilds ONE card (the cheapest way to prove equivalence) at the same
 * `--as-of` the artifacts were emitted with.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildAnswerCard, DEFAULT_ASK } from '@/services/answerCard/answerCardBuilder';
import { renderAnswerMarkdown } from '@/services/answerCard/answerCardRender';
import { ALL_TOPICS } from '@/services/answerCard/AnswerCard.types';
import { resolveJatak } from '@/lib/jataks/resolveJatak';

const AS_OF = '2026-10-24';
const ANSWERS = join(import.meta.dirname, '..', '..', '..', 'public', 'answers');

/**
 * Line endings are a checkout artifact (Git on Windows rewrites LF -> CRLF via
 * `core.autocrlf`), not renderer output. Normalise before comparing so the
 * parity guard checks content, not the platform's EOL convention.
 */
const lf = (s: string) => s.replace(/\r\n/g, '\n');

describe('answer card parity', () => {
  it('_all.md is exactly renderAnswerMarkdown(_all.json)', { timeout: 60000 }, () => {
    const jatak = resolveJatak('Premlata Jain');
    expect(jatak).not.toBeNull();

    const card = buildAnswerCard(jatak!, DEFAULT_ASK, [...ALL_TOPICS], 'hi', AS_OF);
    const emitted = readFileSync(join(ANSWERS, card.subject.slug, '_all.md'), 'utf8');

    expect(lf(renderAnswerMarkdown(card)).trim()).toBe(lf(emitted).trim());
  });

  it('hash and provenance are stable across runs at the same as_of', { timeout: 60000 }, () => {
    const jatak = resolveJatak('Premlata Jain')!;
    const a = buildAnswerCard(jatak, DEFAULT_ASK, [...ALL_TOPICS], 'hi', AS_OF);
    const b = buildAnswerCard(jatak, DEFAULT_ASK, [...ALL_TOPICS], 'hi', AS_OF);
    expect(b.provenance.card_hash).toBe(a.provenance.card_hash);
    expect(b.provenance.computed_at).toBe(`${AS_OF}T00:00:00.000Z`);
  });
});
