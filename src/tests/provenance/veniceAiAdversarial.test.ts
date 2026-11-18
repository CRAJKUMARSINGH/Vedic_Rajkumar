/**
 * veniceAiAdversarial.test.ts — Venice AI provenance patch §7
 *
 * Adversarial fixture tests that guard against the specific failure modes
 * identified in the Venice AI transcript comparison:
 *   - Contradictory city recommendations
 *   - Planetary claims without calculation backing
 *   - "App feature" assertions for non-existent routes
 *   - Fabricated dasha windows
 *   - Eclipse claimed from Amavasya alone
 *   - Multi-topic query completeness
 *
 * ALL test inputs use the SYNTHETIC fixture (synth-udaipur-f-1999).
 * No real personal birth data is present in this file.
 */

import { describe, it, expect } from 'vitest';
import {
  validateProvenance,
  type ProvenanceEnvelope,
  type ProvenanceClaim,
} from '@/types/provenanceContract';
import veniceFixture from '../../../tests/fixtures/venice-ai-claims.json';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeEnvelope(claims: ProvenanceClaim[]): ProvenanceEnvelope {
  // Detect contradictions: same subject recommended and unrecommended
  const contradictions = claims.some((c) => c.verification_status === 'CONTRADICTED')
    ? [{ claim_ids: ['VC-011'], description: 'Contradictory city recommendations' }]
    : [];

  return {
    response_id: 'test-response-001',
    generated_at: new Date().toISOString(),
    input_hash: 'sha256-synthetic-input',
    calculation_available: true,
    claims,
    unverified_claims: claims
      .filter((c) => c.verification_status === 'UNVERIFIED')
      .map((c) => c.claim_id),
    contradictions,
  };
}

// ─── §7 adversarial tests ─────────────────────────────────────────────────────

describe('Venice AI provenance gate — fixture integrity', () => {
  it('fixture contains only synthetic data, no year-specific birth date', () => {
    const synthetic = veniceFixture.synthetic_birth as { date: string };
    expect(synthetic.date).toMatch(/^YYYY-/);
  });

  it('fixture documents the contradiction in city recommendations (VC-011)', () => {
    const vc011 = (veniceFixture.venice_claims as Array<{ claim_id: string; contradiction?: boolean }>)
      .find((c) => c.claim_id === 'VC-011');
    expect(vc011).toBeDefined();
    expect(vc011?.contradiction).toBe(true);
  });
});

describe('Venice AI provenance gate — N9 Raksha validation', () => {
  it('rejects a CALCULATION claim that lacks engine_version', () => {
    const badClaim: ProvenanceClaim = {
      claim_id: 'VC-001',
      claim_type: 'PLANETARY_PLACEMENT',
      source_type: 'CALCULATION',
      text: 'Mercury in 9th house',
      // engine_version deliberately omitted
      input_hash: 'sha256-test',
      verification_status: 'PENDING',
    };
    const result = validateProvenance(makeEnvelope([badClaim]));
    expect(result.passed).toBe(false);
    expect(result.reasons.some((r) => r.includes('engine_version'))).toBe(true);
  });

  it('rejects a CALCULATION claim that lacks input_hash', () => {
    const badClaim: ProvenanceClaim = {
      claim_id: 'VC-002',
      claim_type: 'DASHA_WINDOW',
      source_type: 'CALCULATION',
      text: 'Jupiter mahadasha, Venus antardasha',
      engine_version: 'swisseph-wasm@0.1.0',
      // input_hash deliberately omitted
      verification_status: 'PENDING',
    };
    const result = validateProvenance(makeEnvelope([badClaim]));
    expect(result.passed).toBe(false);
    expect(result.reasons.some((r) => r.includes('input_hash'))).toBe(true);
  });

  it('rejects a precise planetary claim when calculation is unavailable', () => {
    const badClaim: ProvenanceClaim = {
      claim_id: 'VC-003',
      claim_type: 'PLANETARY_PLACEMENT',
      source_type: 'CALCULATION',
      text: 'Saturn in 10th house',
      engine_version: 'swisseph-wasm@0.1.0',
      input_hash: 'sha256-test',
      verification_status: 'CALCULATION_UNAVAILABLE', // engine failed
    };
    const result = validateProvenance(makeEnvelope([badClaim]));
    expect(result.passed).toBe(false);
    expect(
      result.reasons.some((r) => r.includes('precise astronomical claim')),
    ).toBe(true);
  });

  it('rejects a response with contradictory recommendations', () => {
    const contradiction: ProvenanceClaim = {
      claim_id: 'VC-011',
      claim_type: 'INTERPRETATION',
      source_type: 'MODEL_INFERENCE',
      text: 'Ahmedabad listed as both favorable and unfavorable',
      verification_status: 'CONTRADICTED',
    };
    const result = validateProvenance(makeEnvelope([contradiction]));
    expect(result.passed).toBe(false);
    expect(result.reasons.some((r) => r.includes('contradiction'))).toBe(true);
  });

  it('passes a fully verified CALCULATION claim', () => {
    const goodClaim: ProvenanceClaim = {
      claim_id: 'VC-GOOD',
      claim_type: 'PLANETARY_PLACEMENT',
      source_type: 'CALCULATION',
      text: 'Moon in Dhanishtha nakshatra',
      engine_version: 'swisseph-wasm@0.1.0',
      ephemeris_version: 'Swiss Ephemeris 2.10',
      ayanamsa: 'Lahiri',
      house_system: 'WholeSign',
      input_hash: 'sha256-test-verified',
      calculation_refs: ['calc-output-001'],
      verification_status: 'VERIFIED',
    };
    const result = validateProvenance(makeEnvelope([goodClaim]));
    expect(result.passed).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });
});

describe('Venice AI provenance gate — multi-topic completeness', () => {
  it('fixture documents that career+marriage+family were requested but marriage/family omitted', () => {
    const req = veniceFixture.required_tests as string[];
    const hasCompleteness = req.some((r) => r.includes('marriage') && r.includes('family'));
    expect(hasCompleteness).toBe(true);
  });
});

describe('Venice AI provenance gate — app feature verification', () => {
  it('VC-012 flags muhurat job-start filter as only partially verified', () => {
    const vc012 = (veniceFixture.venice_claims as Array<{ claim_id: string; verification_status: string }>)
      .find((c) => c.claim_id === 'VC-012');
    expect(vc012?.verification_status).toMatch(/PARTIAL/);
  });

  it('VC-013 flags Gochar Saturn surfacing as only partially verified', () => {
    const vc013 = (veniceFixture.venice_claims as Array<{ claim_id: string; verification_status: string }>)
      .find((c) => c.claim_id === 'VC-013');
    expect(vc013?.verification_status).toMatch(/PARTIAL/);
  });
});

describe('Venice AI provenance gate — eclipse claim (VC-008)', () => {
  it('VC-008 is marked PENDING and requires astronomical event verification', () => {
    const vc008 = (veniceFixture.venice_claims as Array<{ claim_id: string; verification_status: string; note?: string }>)
      .find((c) => c.claim_id === 'VC-008');
    expect(vc008?.verification_status).toBe('PENDING');
    expect(vc008?.note).toContain('eclipse');
  });

  it('a CALCULATION_UNAVAILABLE nakshatra/pada claim is blocked', () => {
    const unverifiedNakshatra: ProvenanceClaim = {
      claim_id: 'VC-007',
      claim_type: 'NAKSHATRA_PADA',
      source_type: 'CALCULATION',
      text: 'Moon in Dhanishtha pada 4',
      engine_version: 'swisseph-wasm@0.1.0',
      input_hash: 'sha256-test',
      verification_status: 'CALCULATION_UNAVAILABLE',
    };
    const result = validateProvenance(makeEnvelope([unverifiedNakshatra]));
    expect(result.passed).toBe(false);
  });
});
