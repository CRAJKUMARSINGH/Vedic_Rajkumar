/**
 * langParity.test.ts — the locale standing rule (AGENTS.md): every generated
 * artifact exists in both languages, and a rendered artifact is **single
 * language**. This is the test that keeps `<slug>/_all.en.md` free of Devanagari
 * and `<slug>/_all.hi.md` actually Hindi, so a bilingual card can never quietly
 * regress to "English with a Hindi filename".
 *
 * Two facts are asserted over the whole emitted corpus, not one sample:
 *   1. `_all.en.md` carries no Devanagari — the English page is English.
 *   2. `_all.hi.md` carries Devanagari — the Hindi page was glossed, not copied.
 * and the redaction is locale-independent: the same birth hashes the same in
 * every language.
 *
 * Stated limitation, deliberately NOT asserted: `hiGloss.ts` passes a sentence
 * through unchanged when it has no rule for it (e.g. "…timing is not
 * structurally certified yet…"), so a `_all.hi.md` may still contain an English
 * clause. That is an open gap, tracked in `docs/accuracy/UNVERIFIED.md` — the
 * test does not paper over it by demanding a Devanagari-only file.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LANGUAGES, DEFAULT_LANG, type AnswerCard, type Lang } from '@/services/answerCard/AnswerCard.types';

const ANSWERS = join(import.meta.dirname, '..', '..', '..', 'public', 'answers');
const index = JSON.parse(readFileSync(join(ANSWERS, 'index.json'), 'utf8')) as {
  languages: Lang[];
  default_language: Lang;
  people: Array<{ slug: string; texts: Record<Lang, string>; cards: Record<Lang, string> }>;
};

const LOCALES = index.languages;
const DEVANAGARI = /[\u0900-\u097F]/;

/** Read-once, like the rest of the answer-card suite (DEF-010). */
function memo<T>(load: (key: string) => T): (key: string) => T {
  const cache = new Map<string, T>();
  return (key) => {
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    const value = load(key);
    cache.set(key, value);
    return value;
  };
}
const readText = memo((rel: string) => readFileSync(join(ANSWERS, rel), 'utf8'));
const readCard = memo(
  (rel: string) => JSON.parse(readFileSync(join(ANSWERS, rel), 'utf8')) as AnswerCard
);

const slugs = index.people.map(p => p.slug);
const englishRel = (slug: string) => `${slug}/_all.en.md`;
const hindiRel = (slug: string) => `${slug}/_all.hi.md`;

describe('answer card locale parity', () => {
  it('advertises exactly the languages the artifacts are emitted in', () => {
    expect(LOCALES).toEqual([...LANGUAGES]);
    expect(LOCALES).toContain(DEFAULT_LANG);
  });

  it.each(slugs)('%s/_all.en.md contains no Devanagari', (slug) => {
    expect(readText(englishRel(slug))).not.toMatch(DEVANAGARI);
  });

  it.each(slugs)('%s/_all.hi.md is actually Hindi (contains Devanagari)', (slug) => {
    expect(readText(hindiRel(slug))).toMatch(DEVANAGARI);
  });

  it.each(slugs)('%s renders two distinct per-language markdown files', (slug) => {
    expect(readText(englishRel(slug))).not.toBe(readText(hindiRel(slug)));
  });

  it.each(slugs)('%s declares its language in each card and keeps both prose fields', (slug) => {
    for (const lang of LOCALES) {
      const card = readCard(index.people.find(p => p.slug === slug)!.cards[lang]);
      expect(card.query.language).toBe(lang);
      expect(card.direct_answer.hi.length).toBeGreaterThan(0);
      expect(card.direct_answer.en.length).toBeGreaterThan(0);
    }
  });

  /**
   * `birth_hash` is the locale-independent equality token: the *same birth* must
   * hash the same in every language, or a reader could tell two "different"
   * people apart by hash alone. `card_hash` is deliberately per-language
   * (subject + topics + lang + as_of), so it is only checked for shape here.
   */
  it.each(slugs)('%s hashes the same birth in every language', (slug) => {
    const person = index.people.find(p => p.slug === slug)!;
    const hashes = LOCALES.map(l => readCard(person.cards[l]).subject.birth_hash);
    expect(new Set(hashes).size, `${slug}: birth_hash differs across languages`).toBe(1);
    for (const lang of LOCALES) {
      expect(readCard(person.cards[lang]).provenance.card_hash).toMatch(/^[0-9a-f]{16}$/);
    }
  });

  it('emits every advertised language file for every person', () => {
    for (const person of index.people) {
      for (const lang of LOCALES) {
        expect(existsSync(join(ANSWERS, person.cards[lang])), `${person.slug}/${lang} card missing`).toBe(true);
        expect(existsSync(join(ANSWERS, person.texts[lang])), `${person.slug}/${lang} text missing`).toBe(true);
      }
    }
  });
});
