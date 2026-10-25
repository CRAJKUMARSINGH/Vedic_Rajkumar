/**
 * redact.test.ts — the confidentiality standing order, asserted.
 *
 * AGENTS.md: seed-bank birth data (and anything derived from it) is private.
 * A card handed to a non-privileged caller must carry the verdict only, with no
 * `dob`/`tob`/`place`/`lat`/`lon`/`tz`. These tests pin that behaviour so a
 * later refactor of the card shape cannot silently re-open the leak.
 */

import { describe, expect, it } from 'vitest';
import type { AnswerCard } from '@/services/answerCard/AnswerCard.types';
import { maySeeBirthData, redactAnswerCard } from '@/services/answerCard/redact';
import { renderAnswerMarkdown } from '@/services/answerCard/answerCardRender';

const BIRTH = {
  dob: '1979-07-28',
  tob: '23:50',
  place: 'Dungarpur, Rajasthan',
  lat: 23.84,
  lon: 73.71,
  tz: 'Asia/Kolkata',
  tz_defaulted: true,
};

function fullCard(): AnswerCard {
  return {
    card_version: '1.0',
    subject: {
      name: 'Pankaj Jain',
      slug: 'pankaj-jain',
      aliases: ['Pankaj'],
      jatak_id: 'jatak_001',
      ...BIRTH,
    },
    query: {
      asked: 'Forecast prospects',
      topics: ['health'],
      language: 'en',
      as_of: '2026-01-01',
      reference_type: 'natal',
    },
    direct_answer: { hi: 'ठीक', en: 'Favourable' },
    verdicts: [],
    provenance: {
      engine_version: '0.1.0',
      ayanamsa: 'Lahiri',
      house_system: 'Whole Sign',
      dasha_system: 'Vimshottari',
      ephemeris: 'local',
      computed_at: '2026-01-01T00:00:00.000Z',
      as_of: '2026-01-01',
      input_hash: '0'.repeat(16),
      card_hash: '1'.repeat(16),
      source_files: ['x'],
    },
  };
}

describe('maySeeBirthData', () => {
  it('grants raw birth data only to the subject-owner and admins', () => {
    expect(maySeeBirthData('public')).toBe(false);
    expect(maySeeBirthData('owner')).toBe(true);
    expect(maySeeBirthData('admin')).toBe(true);
  });
});

describe('redactAnswerCard', () => {
  it('strips every raw birth field and records birth_hash instead', () => {
    const redacted = redactAnswerCard(fullCard(), 'public');
    for (const key of ['dob', 'tob', 'place', 'lat', 'lon', 'tz', 'tz_defaulted']) {
      expect(redacted.subject).not.toHaveProperty(key);
    }
    expect(redacted.subject.birth_hash).toMatch(/^[0-9a-f]{16}$/);
  });

  it('keeps the non-sensitive subject fields and the verdict payload', () => {
    const redacted = redactAnswerCard(fullCard(), 'public');
    expect(redacted.subject.name).toBe('Pankaj Jain');
    expect(redacted.subject.slug).toBe('pankaj-jain');
    expect(redacted.subject.aliases).toEqual(['Pankaj']);
    expect(redacted.subject.jatak_id).toBe('jatak_001');
    expect(redacted.direct_answer).toEqual({ hi: 'ठीक', en: 'Favourable' });
    expect(redacted.provenance.card_hash).toBe('1'.repeat(16));
  });

  it('does not mutate the input card', () => {
    const card = fullCard();
    redactAnswerCard(card, 'public');
    expect(card.subject.dob).toBe(BIRTH.dob);
    expect(card.subject.place).toBe(BIRTH.place);
  });

  it('is idempotent — redacting a redacted card is a no-op', () => {
    const once = redactAnswerCard(fullCard(), 'public');
    const twice = redactAnswerCard(once, 'public');
    expect(twice).toEqual(once);
    expect(twice.subject.birth_hash).toBe(once.subject.birth_hash);
  });

  it('defaults to the public (most restrictive) viewer', () => {
    expect(redactAnswerCard(fullCard()).subject).not.toHaveProperty('dob');
  });

  it('passes the card through untouched for owner and admin', () => {
    const card = fullCard();
    expect(redactAnswerCard(card, 'owner')).toBe(card);
    expect(redactAnswerCard(card, 'admin')).toBe(card);
    expect(redactAnswerCard(card, 'owner').subject.dob).toBe(BIRTH.dob);
  });

  it('never leaks birth data into the rendered markdown', () => {
    const md = renderAnswerMarkdown(redactAnswerCard(fullCard(), 'public'));
    for (const value of [BIRTH.dob, BIRTH.tob, BIRTH.place]) {
      expect(md).not.toContain(value);
    }
  });
});
