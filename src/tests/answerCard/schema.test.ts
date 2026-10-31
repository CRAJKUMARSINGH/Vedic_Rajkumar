/**
 * schema.test.ts — the emitted artifacts must satisfy the published contract.
 *
 * Reads what was actually written to `public/answers/**` (not a rebuild), so a
 * hand-edited or half-emitted card fails here. Every language artifact is
 * checked, plus the un-suffixed default-locale copy.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { AnswerCardSchema } from '@/api/v1/schemas/answer';
import { ANSWER_CONTRACT_VERSION, type AnswerCard, type Lang } from '@/services/answerCard/AnswerCard.types';

const ROOT = join(import.meta.dirname, '..', '..', '..');
const ANSWERS = join(ROOT, 'public', 'answers');
const index = JSON.parse(readFileSync(join(ANSWERS, 'index.json'), 'utf8')) as {
  card_version: string;
  generated_at: string;
  contract: string;
  contract_version: string;
  languages: Lang[];
  default_language: Lang;
  people: Array<{
    name: string;
    aliases: string[];
    slug: string;
    topics: string[];
    card: string;
    text: string;
    cards: Record<Lang, string>;
    texts: Record<Lang, string>;
  }>;
};

const LOCALES = index.languages;
const DEFAULT_LANG = index.default_language;

/** The seed bank — the only place raw birth data is allowed to live (it is NOT in `public/`). */
const SEED = JSON.parse(
  readFileSync(join(ROOT, 'src', 'data', 'jataks', 'JATAKS_DATABASE.json'), 'utf8')
) as {
  jataks: Array<{ name: string; dateOfBirth: string; timeOfBirth: string; placeOfBirth: string }>;
};

/**
 * Read-once artifacts. The emitted corpus is immutable for the duration of a
 * run, so each file is parsed at most once no matter how many assertions touch
 * it — a saturated CI filesystem cannot fail this suite on redundant I/O
 * (DEF-010).
 */
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

const readCard = memo(
  (rel: string) => JSON.parse(readFileSync(join(ANSWERS, rel), 'utf8')) as AnswerCard
);
const readText = memo((rel: string) => readFileSync(join(ANSWERS, rel), 'utf8'));

/**
 * Every `_all` card actually on disk, resolved ONCE at module load so the
 * assertion below is a pure in-memory loop. Stat-ing and parsing the corpus
 * inside the test body is what pushed it past the timeout under load (DEF-010).
 * Covers each language's suffixed artifact and the un-suffixed default copy.
 */
const ALL_CARDS = index.people.flatMap((person) =>
  [`${person.slug}/_all.json`, ...LOCALES.map(l => `${person.slug}/_all.${l}.json`)]
    .filter(rel => existsSync(join(ANSWERS, rel)))
    .map(rel => ({ rel, card: readCard(rel) }))
);

const TOPIC_CARDS = index.people.flatMap((person) =>
  person.topics
    .flatMap(topic => [
      `${person.slug}/${topic}.json`,
      ...LOCALES.map(l => `${person.slug}/${topic}.${l}.json`),
    ])
    .filter(rel => existsSync(join(ANSWERS, rel)))
    .map(rel => ({ rel, card: readCard(rel) }))
);

const slugify = (s: string): string =>
  s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

describe('answers/index.json', () => {
  it('is a router an agent can hold in context', () => {
    expect(index.card_version).toBe('1.0');
    expect(index.contract).toMatch(/direct_answer/i);
    expect(index.people.length).toBeGreaterThan(0);
  });

  it('advertises the contract version and the published languages', () => {
    expect(index.contract_version).toBe(ANSWER_CONTRACT_VERSION);
    expect(index.languages).toEqual(['hi', 'en']);
    expect(LOCALES).toContain(DEFAULT_LANG);
  });

  it('lists every person with slug, topics and per-language card paths', () => {
    for (const person of index.people) {
      expect(person.slug).toMatch(/^[a-z0-9-]+$/);
      expect(person.topics.length).toBeGreaterThan(0);
      // Un-suffixed paths stay valid = the default locale (no 1.1 link breaks).
      expect(person.card).toBe(`${person.slug}/_all.json`);
      expect(person.text).toBe(`${person.slug}/_all.md`);
      expect(existsSync(join(ANSWERS, person.text))).toBe(true);
      for (const lang of LOCALES) {
        expect(person.cards[lang]).toBe(`${person.slug}/_all.${lang}.json`);
        expect(person.texts[lang]).toBe(`${person.slug}/_all.${lang}.md`);
        expect(existsSync(join(ANSWERS, person.cards[lang]))).toBe(true);
        expect(existsSync(join(ANSWERS, person.texts[lang]))).toBe(true);
      }
      // The default locale's entry points at the copy served at the bare path.
      expect(person.cards[DEFAULT_LANG]).toBe(`${person.slug}/_all.${DEFAULT_LANG}.json`);
    }
  });
});

describe('answer card schema', { timeout: 30_000 }, () => {
  it.each(ALL_CARDS.map(c => c.rel))('%s matches AnswerCardSchema', (rel) => {
    const parsed = AnswerCardSchema.safeParse(readCard(rel));
    expect(parsed.success, parsed.success ? '' : JSON.stringify(parsed.error.issues)).toBe(true);
  });

  it.each(LOCALES)('the %s artifact declares its own language and keeps both prose fields', (lang) => {
    const card = readCard(`${index.people[0].slug}/_all.${lang}.json`);
    expect(card.query.language).toBe(lang);
    expect(card.direct_answer.en.length).toBeGreaterThan(0);
    expect(card.direct_answer.hi.length).toBeGreaterThan(0);
    for (const v of card.verdicts) {
      expect(['excellent', 'good', 'average', 'caution', 'avoid']).toContain(v.band);
      expect(v.score_0_100).toBeGreaterThanOrEqual(0);
      expect(v.score_0_100).toBeLessThanOrEqual(100);
      expect(v.confidence_0_1).toBeGreaterThanOrEqual(0.2);
      expect(v.confidence_0_1).toBeLessThanOrEqual(0.9);
    }
  });

  it('carries provenance an agent can quote', () => {
    const card = readCard(`${index.people[0].slug}/_all.json`);
    expect(card.provenance.card_hash).toMatch(/^[0-9a-f]{16}$/);
    expect(card.provenance.input_hash).toMatch(/^[0-9a-f]{16}$/);
    expect(card.provenance.ayanamsa).toMatch(/Lahiri/);
    expect(card.provenance.source_files.length).toBeGreaterThan(0);
  });
});

/**
 * Confidentiality gate (AGENTS.md §CONFIDENTIALITY). `public/` is world-readable
 * by definition, so the emitted corpus must be verdict-only. If a raw birth
 * field ever reaches `public/answers/**`, this test fails the build. The check
 * runs over every language — redaction is locale-independent.
 */
describe('public/answers/** carries no birth data', { timeout: 30_000 }, () => {
  /** Every field `redactAnswerCard` is required to strip. */
  const PII_KEYS = ['dob', 'tob', 'place', 'lat', 'lon', 'tz', 'tz_defaulted'];

  it.each(ALL_CARDS.map(c => c.rel))('%s is verdict-only', (rel) => {
    const card = readCard(rel);
    for (const key of PII_KEYS) {
      expect(card.subject, `${rel} leaks subject.${key}`).not.toHaveProperty(key);
    }
    expect(card.subject.birth_hash).toMatch(/^[0-9a-f]{16}$/);
  });

  it.each(index.people.map(p => p.slug))('%s quotes no birth detail in any language', (slug) => {
    const seed = SEED.jataks.find(j => slugify(j.name) === slug);
    expect(seed, `no seed-bank record for ${slug}`).toBeTruthy();
    for (const rel of [`${slug}/_all.md`, ...LOCALES.map(l => `${slug}/_all.${l}.md`)]) {
      const md = readText(rel);
      for (const [field, value] of [
        ['dateOfBirth', seed!.dateOfBirth],
        ['timeOfBirth', seed!.timeOfBirth],
        ['placeOfBirth', seed!.placeOfBirth],
      ] as const) {
        expect(md, `${rel} leaks ${field} into markdown`).not.toContain(value);
      }
    }
  });

  it('publishes no per-topic json file with a raw birth field', () => {
    for (const { rel, card } of TOPIC_CARDS) {
      for (const key of PII_KEYS) {
        expect(card.subject, `${rel} leaks subject.${key}`).not.toHaveProperty(key);
      }
    }
  });
});
