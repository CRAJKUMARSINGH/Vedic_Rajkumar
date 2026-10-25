/**
 * schema.test.ts — the emitted artifacts must satisfy the published contract.
 *
 * Reads what was actually written to `public/answers/**` (not a rebuild), so a
 * hand-edited or half-emitted card fails here.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { AnswerCardSchema } from '@/api/v1/schemas/answer';
import type { AnswerCard } from '@/services/answerCard/AnswerCard.types';

const ROOT = join(import.meta.dirname, '..', '..', '..');
const ANSWERS = join(ROOT, 'public', 'answers');
const index = JSON.parse(readFileSync(join(ANSWERS, 'index.json'), 'utf8')) as {
  card_version: string;
  generated_at: string;
  contract: string;
  people: Array<{ name: string; aliases: string[]; slug: string; topics: string[]; card: string; text: string }>;
};

/** The seed bank — the only place raw birth data is allowed to live (it is NOT in `public/`). */
const SEED = JSON.parse(
  readFileSync(join(ROOT, 'src', 'data', 'jataks', 'JATAKS_DATABASE.json'), 'utf8')
) as {
  jataks: Array<{ name: string; dateOfBirth: string; timeOfBirth: string; placeOfBirth: string }>;
};

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

  it('lists every person with slug, topics and card paths', () => {
    for (const person of index.people) {
      expect(person.slug).toMatch(/^[a-z0-9-]+$/);
      expect(person.topics.length).toBeGreaterThan(0);
      expect(person.card).toBe(`${person.slug}/_all.json`);
      expect(person.text).toBe(`${person.slug}/_all.md`);
      expect(existsSync(join(ANSWERS, person.text))).toBe(true);
    }
  });
});

describe('answer card schema', () => {
  const slugs = index.people.map(p => p.slug);

  it.each(slugs)('%s/_all.json matches AnswerCardSchema', (slug) => {
    const card = JSON.parse(readFileSync(join(ANSWERS, slug, '_all.json'), 'utf8')) as AnswerCard;
    const parsed = AnswerCardSchema.safeParse(card);
    expect(parsed.success, parsed.success ? '' : JSON.stringify(parsed.error.issues)).toBe(true);
  });

  it('puts the verdict first and never invents a band', () => {
    const card = JSON.parse(
      readFileSync(join(ANSWERS, index.people[0].slug, '_all.json'), 'utf8')
    ) as AnswerCard;
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
    const card = JSON.parse(
      readFileSync(join(ANSWERS, index.people[0].slug, '_all.json'), 'utf8')
    ) as AnswerCard;
    expect(card.provenance.card_hash).toMatch(/^[0-9a-f]{16}$/);
    expect(card.provenance.input_hash).toMatch(/^[0-9a-f]{16}$/);
    expect(card.provenance.ayanamsa).toMatch(/Lahiri/);
    expect(card.provenance.source_files.length).toBeGreaterThan(0);
  });
});

/**
 * Confidentiality gate (AGENTS.md §CONFIDENTIALITY). `public/` is world-readable
 * by definition, so the emitted corpus must be verdict-only. If a raw birth
 * field ever reaches `public/answers/**`, this test fails the build.
 */
describe('public/answers/** carries no birth data', () => {
  /** Every field `redactAnswerCard` is required to strip. */
  const PII_KEYS = ['dob', 'tob', 'place', 'lat', 'lon', 'tz', 'tz_defaulted'];

  it.each(index.people.map(p => p.slug))('%s/_all.json is verdict-only', (slug) => {
    const card = JSON.parse(readFileSync(join(ANSWERS, slug, '_all.json'), 'utf8')) as AnswerCard;
    for (const key of PII_KEYS) {
      expect(card.subject, `${slug} leaks subject.${key}`).not.toHaveProperty(key);
    }
    expect(card.subject.birth_hash).toMatch(/^[0-9a-f]{16}$/);
  });

  it.each(index.people.map(p => p.slug))('%s/_all.md quotes no birth detail', (slug) => {
    const seed = SEED.jataks.find(j => slugify(j.name) === slug);
    expect(seed, `no seed-bank record for ${slug}`).toBeTruthy();
    const md = readFileSync(join(ANSWERS, slug, '_all.md'), 'utf8');
    for (const [field, value] of [
      ['dateOfBirth', seed!.dateOfBirth],
      ['timeOfBirth', seed!.timeOfBirth],
      ['placeOfBirth', seed!.placeOfBirth],
    ] as const) {
      expect(md, `${slug} leaks ${field} into markdown`).not.toContain(value);
    }
  });

  it('publishes no per-topic json/md file with a raw birth field', () => {
    for (const person of index.people) {
      for (const topic of person.topics) {
        const jsonPath = join(ANSWERS, person.slug, `${topic}.json`);
        if (!existsSync(jsonPath)) continue;
        const card = JSON.parse(readFileSync(jsonPath, 'utf8')) as AnswerCard;
        for (const key of PII_KEYS) {
          expect(card.subject, `${person.slug}/${topic}.json leaks subject.${key}`).not.toHaveProperty(key);
        }
      }
    }
  });
});
