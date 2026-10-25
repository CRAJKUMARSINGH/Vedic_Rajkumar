/**
 * guideContract.test.ts — the agent-facing contract must not drift from code.
 *
 * `public/llms.txt` and `public/.well-known/vedic-rajkumar.json` advertise a
 * contract version and a redacted subject shape. Both are prose. The code
 * (`redact.ts`, `AnswerCard.types.ts`, the OpenAPI registry) is the record.
 *
 * This test derives the facts from code and fails when the guide disagrees — so
 * a new field in `redact.ts`, a bumped contract version, an unregistered
 * `/api/v1/*` endpoint, or a new topic cannot ship half-documented. Hand-edit a
 * key list in the prose and this fails.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { AnswerCard } from '@/services/answerCard/AnswerCard.types';
import { ALL_TOPICS, ANSWER_CONTRACT_VERSION } from '@/services/answerCard/AnswerCard.types';
import { redactAnswerCard } from '@/services/answerCard/redact';
import { generateOpenApi } from '@/api/v1/openapi';

const ROOT = join(import.meta.dirname, '..', '..', '..');
const GUIDE = readFileSync(join(ROOT, 'public', 'llms.txt'), 'utf8');
const WELL_KNOWN = JSON.parse(
  readFileSync(join(ROOT, 'public', '.well-known', 'vedic-rajkumar.json'), 'utf8'),
) as {
  contract_version: string;
  surfaces: Array<{ path: string }>;
  redacted_subject_keys: string[];
  full_subject_extra_keys: string[];
  confidentiality: { subject_fields: string[] };
};

/** Classified private by the standing order — these must never be redacted *in*. */
const PII_KEYS = ['dob', 'tob', 'place', 'lat', 'lon', 'tz', 'tz_defaulted'];

/** Every optional birth field present, so redaction has something to strip. */
function fullCard(): AnswerCard {
  return {
    card_version: '1.0',
    subject: {
      name: 'Example Subject',
      slug: 'example-subject',
      aliases: ['Example'],
      jatak_id: 'jatak_000',
      dob: '1935-01-15',
      tob: '06:00',
      place: 'Example Place',
      lat: 0,
      lon: 0,
      tz: 'Asia/Kolkata',
      tz_defaulted: true,
    },
    query: {
      asked: 'x',
      topics: ['health'],
      language: 'en',
      as_of: '2026-10-25',
      reference_type: 'natal',
    },
    direct_answer: { hi: 'x', en: 'x' },
    verdicts: [],
    provenance: {
      engine_version: '0.1.0',
      ayanamsa: 'Lahiri',
      house_system: 'Whole Sign',
      dasha_system: 'Vimshottari',
      ephemeris: 'local',
      computed_at: '2026-10-25T00:00:00.000Z',
      as_of: '2026-10-25',
      input_hash: '0'.repeat(16),
      card_hash: '1'.repeat(16),
      source_files: [],
    },
  };
}

// Derived from the code of record — never hand-typed.
const redactedKeys = Object.keys(redactAnswerCard(fullCard(), 'public').subject);
const extraFullKeys = Object.keys(fullCard().subject).filter((k) => !redactedKeys.includes(k));
const backtickList = (keys: string[]): string => keys.map((k) => `\`${k}\``).join(', ');

describe('agent guide contract', () => {
  it('documents exactly the redacted subject keys redactAnswerCard() emits', () => {
    expect([...redactedKeys].sort()).toEqual([...WELL_KNOWN.redacted_subject_keys].sort());
    expect(GUIDE).toContain(backtickList(redactedKeys));
  });

  it('keeps confidentiality.subject_fields identical to the redacted set (no second source of truth)', () => {
    expect([...WELL_KNOWN.confidentiality.subject_fields].sort()).toEqual([...redactedKeys].sort());
  });

  it('keeps birth_hash in and every raw birth key out of the redacted set', () => {
    expect(redactedKeys).toContain('birth_hash');
    for (const key of PII_KEYS) expect(redactedKeys).not.toContain(key);
  });

  it('documents the full-subject extras as exactly the stripped birth fields', () => {
    expect([...extraFullKeys].sort()).toEqual([...WELL_KNOWN.full_subject_extra_keys].sort());
    expect(GUIDE).toContain(backtickList(extraFullKeys));
  });

  it('keeps contract_version identical across code, llms.txt and .well-known', () => {
    expect(WELL_KNOWN.contract_version).toBe(ANSWER_CONTRACT_VERSION);
    const escaped = ANSWER_CONTRACT_VERSION.replace(/\./g, '\\.');
    expect(GUIDE).toMatch(new RegExp(`contract_version:\\s*${escaped}\\b`));
  });

  it('lists every ALL_TOPICS value in the guide', () => {
    for (const topic of ALL_TOPICS) expect(GUIDE).toContain(topic);
  });

  it('registers every /api/v1 surface named in the guide in the OpenAPI spec', () => {
    const documented = new Set([...GUIDE.matchAll(/\/api\/v1\/[a-z0-9/_-]+/g)].map((m) => m[0]));
    expect(documented.size).toBeGreaterThan(0);
    const openapiPaths = Object.keys(generateOpenApi().paths);
    for (const surface of documented) {
      const openapiPath = surface.replace(/^\/api/, '');
      expect(
        openapiPaths,
        `${surface} is named in llms.txt but not registered in openapi.ts`,
      ).toContain(openapiPath);
    }
  });

  it('names every .well-known surface path in the guide', () => {
    for (const { path } of WELL_KNOWN.surfaces) {
      expect(GUIDE, `${path} is a documented surface but absent from llms.txt`).toContain(path);
    }
  });
});
