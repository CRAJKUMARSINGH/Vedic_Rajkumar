/**
 * routerAnswer.test.ts — `/v1/answer` is a PUBLIC surface.
 *
 * AGENTS.md §CONFIDENTIALITY: an API key is not proof of subject ownership, so
 * the route must always answer with the verdict-only projection. This test
 * pins that a raw birth field can never reach an API caller.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/api/v1/router';
import type { AnswerCard } from '@/services/answerCard/AnswerCard.types';

function fullCard(): AnswerCard {
  return {
    card_version: '1.0',
    subject: {
      name: 'Pankaj Jain',
      slug: 'pankaj-jain',
      aliases: [],
      jatak_id: 'jatak_001',
      dob: '1979-07-28',
      tob: '23:50',
      place: 'Dungarpur, Rajasthan',
      lat: 23.84,
      lon: 73.71,
      tz: 'Asia/Kolkata',
      tz_defaulted: true,
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

vi.mock('@/api/v1/middleware/auth', () => ({
  authenticate: vi.fn(async () => ({
    keyId: 'k1',
    userId: 'u1',
    tier: 'free',
    scopes: ['answers:read'],
  })),
  requireScope: (ctx: { scopes: string[] }, scope: string) => ctx.scopes.includes(scope),
}));

vi.mock('@/services/transits/transitService', () => ({ transitService: { snapshot: vi.fn() } }));

// The seed bank resolves to nothing so the by-name builder path is exercised;
// the builder itself is stubbed with a full (unredacted) card.
vi.mock('@/lib/jataks/resolveJatak', () => ({ resolveJatak: () => null }));

vi.mock('@/services/answerCard/answerCardBuilder', () => ({
  DEFAULT_ASK: 'Forecast prospects',
  buildAnswerCard: () => fullCard(),
  buildAnswerCardByName: () => fullCard(),
}));

vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));

describe('GET /v1/answer — confidentiality', () => {
  beforeEach(() => vi.clearAllMocks());

  it('responds with the verdict-only projection, never raw birth data', async () => {
    const res = await api.request('/v1/answer?person=Pankaj+Jain&lang=en');
    expect(res.status).toBe(200);
    const body = await res.json();

    for (const key of ['dob', 'tob', 'place', 'lat', 'lon', 'tz', 'tz_defaulted']) {
      expect(body.subject).not.toHaveProperty(key);
    }
    expect(body.subject.birth_hash).toMatch(/^[0-9a-f]{16}$/);
    expect(JSON.stringify(body)).not.toContain('1979-07-28');
    expect(JSON.stringify(body)).not.toContain('23:50');
    expect(JSON.stringify(body)).not.toContain('Dungarpur');
  });

  it('still carries the verdict an agent is meant to relay', async () => {
    const res = await api.request('/v1/answer?person=Pankaj+Jain&lang=en');
    const body = await res.json();
    expect(body.direct_answer.en).toBe('Favourable');
    expect(body.provenance.card_hash).toBe('1'.repeat(16));
  });
});
