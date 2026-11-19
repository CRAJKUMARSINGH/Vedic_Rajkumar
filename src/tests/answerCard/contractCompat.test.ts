import { describe, it, expect } from 'vitest';
import { renderAnswerMarkdown } from '@/services/answerCard/answerCardRender';
import { redactAnswerCard } from '@/services/answerCard/redact';
import type { AnswerCard } from '@/services/answerCard/AnswerCard.types';

const legacyCard = (): AnswerCard => ({
  card_version: '1.0',
  subject: {
    name: 'Test Person', slug: 'test-person', aliases: [], jatak_id: 'jatak_999',
    dob: '01/01/1990', tob: '10:00', place: 'Testville', lat: 1, lon: 2, tz: 'Asia/Kolkata',
  },
  query: { asked: 'career?', topics: ['career'], language: 'en', as_of: '2026-01-01', reference_type: 'natal' },
  direct_answer: { hi: 'हाँ', en: 'Yes' },
  verdicts: [{
    topic: 'career', headline: { en: 'Career: good', hi: 'करियर: अच्छा' },
    score_0_100: 70, band: 'good', engine_verdict: 'DELIVERING', confidence_0_1: 0.8,
    window: null, rationale: { en: 'r', hi: 'r' }, conflicts: [], evidence: [], remedies: [], caveats: [],
  }],
  provenance: {
    engine_version: '0.1.0', ayanamsa: 'Lahiri', house_system: 'whole-sign',
    dasha_system: 'Vimshottari', ephemeris: 'local', computed_at: '2026-01-01T00:00:00.000Z',
    as_of: '2026-01-01', input_hash: 'ih', card_hash: 'ch', source_files: [],
  },
  // NOTE: no `composed` — this is a legacy 1.2 card.
});

describe('AnswerCard contract 1.3 — composed compatibility', () => {
  it('legacy card without composed renders markdown unchanged', () => {
    const md = renderAnswerMarkdown(legacyCard());
    expect(md).toContain('Yes');
    expect(md).toContain('Verdicts');
    expect(md).toContain('| 70 |');
    expect(md).not.toContain('undefined');
  });

  it('legacy card redacts birth fields without touching composed absence', () => {
    const red = redactAnswerCard(legacyCard(), 'public');
    expect(red.subject.dob).toBeUndefined();
    expect(red.subject.birth_hash).toBeDefined();
    expect(red.composed).toBeUndefined();
  });

  it('new card with composed renders verdict_line + sections + links', async () => {
    const { buildAnswerCard } = await import('@/services/answerCard/answerCardBuilder');
    const mod = await import('@/data/jataks/JATAKS_DATABASE.json');
    const db = (mod.default ?? mod) as { jataks: unknown[] };
    const jatak = db.jataks[0];
    expect(jatak).toBeTruthy();
    const card = buildAnswerCard(jatak as never, 'career prospects', ['career'], 'en', '2026-01-01');
    expect(card.composed).toBeDefined();
    expect(card.composed!.verdict_line.en.length).toBeGreaterThan(0);
    const md = renderAnswerMarkdown(card);
    expect(md).toContain(card.composed!.verdict_line.en);
    expect(md).toContain('/dasha');
  });
});
