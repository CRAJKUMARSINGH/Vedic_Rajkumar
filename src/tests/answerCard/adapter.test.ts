/**
 * adapter.test.ts — the seed-bank boundary and the explicit "not found" miss.
 *
 * An agent must never be handed a guessed chart: a person absent from the seed
 * bank gets a card that says so, and a person present gets the seed bank's
 * coordinates, not an approximation.
 */

import { describe, expect, it } from 'vitest';
import { buildAnswerCardByName, DEFAULT_ASK } from '@/services/answerCard/answerCardBuilder';
import { ALL_TOPICS } from '@/services/answerCard/AnswerCard.types';
import { allJataks, parseCoordinateString, resolveJatak, slugify, toSubject } from '@/lib/jataks/resolveJatak';

const AS_OF = '2026-10-24';

describe('resolveJatak', () => {
  it('finds a person by full name', () => {
    const j = resolveJatak('Premlata Jain');
    expect(j?.id).toBe('jatak_021');
  });

  it('finds a person by alias, case- and punctuation-insensitively', () => {
    expect(resolveJatak('Premlata')?.id).toBe('jatak_021');
    expect(resolveJatak('premlataji')?.id).toBe('jatak_021');
    expect(resolveJatak('  MUMMY  JAIN ')?.id).toBe('jatak_021');
  });

  it('returns null for an unknown person', () => {
    expect(resolveJatak('Someone Not In The Seed Bank')).toBeNull();
  });

  it('exposes every seed entry', () => {
    expect(allJataks().length).toBeGreaterThanOrEqual(21);
    for (const j of allJataks()) {
      expect(j.id).toMatch(/^jatak_\d{3}$/);
      expect(j.dateOfBirth).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe('helpers', () => {
  it('parses the seed bank coordinate format', () => {
    expect(parseCoordinateString('23.84°N')).toBeCloseTo(23.84);
    expect(parseCoordinateString('73.71°E')).toBeCloseTo(73.71);
    expect(parseCoordinateString('23.84')).toBeCloseTo(23.84);
    expect(parseCoordinateString(undefined)).toBeNull();
    expect(parseCoordinateString('nowhere')).toBeNull();
  });

  it('slugifies to the directory names used under public/answers', () => {
    expect(slugify('Premlata Jain')).toBe('premlata-jain');
    expect(slugify('  Priyansh Singh Chauhan ')).toBe('priyansh-singh-chauhan');
  });

  it('carries the seed bank birth data through to the subject', () => {
    const s = toSubject(resolveJatak('Premlata Jain')!);
    expect(s.jatak_id).toBe('jatak_021');
    expect(s.dob).toBe('1974-11-08');
    expect(s.tob).toBe('04:35');
    expect(s.lat).toBeCloseTo(23.84);
    expect(s.tz).toBe('Asia/Kolkata');
  });
});

describe('buildAnswerCardByName (absent person)', () => {
  it('degrades explicitly instead of guessing a chart', () => {
    const card = buildAnswerCardByName('Nobody At All', DEFAULT_ASK, [...ALL_TOPICS], 'en', AS_OF);
    expect(card.subject.jatak_id).toBeNull();
    expect(card.subject.dob).toBe('');
    expect(card.direct_answer.en).toMatch(/not in seed bank/i);
    expect(card.direct_answer.en).toMatch(/answers:emit/);
    expect(card.verdicts).toHaveLength(ALL_TOPICS.length);
    for (const v of card.verdicts) expect(v.band).toBe('average');
  });
});
