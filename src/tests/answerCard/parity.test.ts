/**
 * parity.test.ts — the bytes the app serves and the bytes the emitter wrote
 * must come from the same renderer. If this fails, either the engine changed
 * without a re-emit, or the renderer grew a condition on content.
 *
 * Rebuilds ONE card per language (the cheapest way to prove equivalence) at the
 * same `--as-of` the artifacts were emitted with, and checks both the
 * language-suffixed artifact and the un-suffixed default-locale copy.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildAnswerCard, DEFAULT_ASK } from '@/services/answerCard/answerCardBuilder';
import { renderAnswerMarkdown } from '@/services/answerCard/answerCardRender';
import { ALL_TOPICS, DEFAULT_LANG, LANGUAGES, type Lang } from '@/services/answerCard/AnswerCard.types';
import { ANSWER_CARD_AS_OF } from '@/services/answerCard/answerCardAsOf';
import { resolveJatak } from '@/lib/jataks/resolveJatak';

/**
 * The SAME pinned constant `scripts/emitAnswerCards.mjs` defaults to. Neither
 * side reads the wall clock, so this guard can never fail merely because a day
 * passed — and re-dating the cards is one deliberate edit to that one constant.
 */
const AS_OF = ANSWER_CARD_AS_OF;
const ANSWERS = join(import.meta.dirname, '..', '..', '..', 'public', 'answers');

/**
 * Line endings are a checkout artifact (Git on Windows rewrites LF -> CRLF via
 * `core.autocrlf`), not renderer output. Normalise before comparing so the
 * parity guard checks content, not the platform's EOL convention.
 */
const lf = (s: string) => s.replace(/\r\n/g, '\n');

const rebuild = (lang: Lang) =>
  buildAnswerCard(resolveJatak('Premlata Jain')!, DEFAULT_ASK, [...ALL_TOPICS], lang, AS_OF);

describe('answer card parity', () => {
  for (const lang of LANGUAGES) {
    it(
      `_all.${lang}.md is exactly renderAnswerMarkdown(build('${lang}'))`,
      { timeout: 60000 },
      () => {
        const card = rebuild(lang);
        const emitted = readFileSync(join(ANSWERS, card.subject.slug, `_all.${lang}.md`), 'utf8');
        expect(lf(renderAnswerMarkdown(card)).trim()).toBe(lf(emitted).trim());
      }
    );
  }

  it('the un-suffixed _all.md is the default-locale render', { timeout: 60000 }, () => {
    const card = rebuild(DEFAULT_LANG);
    const emitted = readFileSync(join(ANSWERS, card.subject.slug, '_all.md'), 'utf8');
    expect(lf(renderAnswerMarkdown(card)).trim()).toBe(lf(emitted).trim());
  });

  it('hash and provenance are stable across runs at the same as_of', { timeout: 60000 }, () => {
    const a = rebuild('hi');
    const b = rebuild('hi');
    expect(b.provenance.card_hash).toBe(a.provenance.card_hash);
    expect(b.provenance.computed_at).toBe(`${AS_OF}T00:00:00.000Z`);
  });

  /**
   * Locale-independent redaction: the same birth must hash the same no matter
   * which language the prose is rendered in — otherwise a reader could tell two
   * "different" people apart by hash alone.
   */
  it('birth_hash is identical across languages', { timeout: 60000 }, () => {
    const byLang = LANGUAGES.map(l => rebuild(l).subject.birth_hash);
    expect(new Set(byLang).size).toBe(1);
  });
});
