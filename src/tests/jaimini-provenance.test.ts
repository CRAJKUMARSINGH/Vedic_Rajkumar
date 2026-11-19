/**
 * Jaimini-path provenance gate tests (CODEX Phase 5).
 * JaiminiPanel.handleSubmit now runs runRaksha → validateProvenance before
 * rendering. These tests pin the validator contract that gate depends on.
 */

import { describe, it, expect } from 'vitest';
import { validateProvenance, type ProvenanceEnvelope, type ProvenanceClaim } from '@/types/provenanceContract';

function env(claims: ProvenanceClaim[], contradictions: ProvenanceEnvelope['contradictions'] = []): ProvenanceEnvelope {
  return {
    response_id: 't-1',
    generated_at: new Date().toISOString(),
    input_hash: 'abc123',
    calculation_available: true,
    claims,
    unverified_claims: [],
    contradictions,
  };
}

const baseClaim: ProvenanceClaim = {
  claim_id: 'PC-001',
  claim_type: 'INTERPRETATION',
  source_type: 'TRADITIONAL_RULE',
  text: 'Arudha Lagna in Scorpio suggests a private, intense public image.',
  text_hi: 'वृश्चिक में आरूढ़ लग्न गहन छवि दर्शाता है।',
  rule_ids: ['Jaimini-ARUDHA-001'],
  rule_version: 'jaimini-v1',
  verification_status: 'VERIFIED',
};

describe('Jaimini provenance gate — validateProvenance', () => {
  it('passes a well-formed traditional-rule claim (EN+HI)', () => {
    const r = validateProvenance(env([baseClaim]));
    expect(r.passed).toBe(true);
    expect(r.reasons).toHaveLength(0);
  });

  it('rejects CALCULATION claim missing engine_version/input_hash', () => {
    const bad: ProvenanceClaim = {
      ...baseClaim,
      claim_id: 'PC-002',
      source_type: 'CALCULATION',
      claim_type: 'PLANETARY_PLACEMENT',
      rule_ids: undefined,
    };
    const r = validateProvenance(env([bad]));
    expect(r.passed).toBe(false);
    expect(r.reasons[0]).toMatch(/engine_version or input_hash/);
  });

  it('passes CALCULATION claim with full metadata', () => {
    const good: ProvenanceClaim = {
      ...baseClaim,
      claim_id: 'PC-003',
      source_type: 'CALCULATION',
      claim_type: 'PLANETARY_PLACEMENT',
      rule_ids: undefined,
      engine_version: 'jaiminiService@1.0',
      ephemeris_version: 'swisseph-wasm',
      ayanamsa: 'Lahiri',
      house_system: 'WholeSign',
      input_hash: 'deadbeef',
    };
    expect(validateProvenance(env([good])).passed).toBe(true);
  });

  it('rejects fabricated certainty when calculation unavailable', () => {
    const fabricated: ProvenanceClaim = {
      ...baseClaim,
      claim_id: 'PC-004',
      source_type: 'DOCUMENT',
      claim_type: 'DASHA_WINDOW',
      rule_ids: undefined,
      verification_status: 'CALCULATION_UNAVAILABLE',
    };
    const e = env([fabricated]);
    e.calculation_available = false;
    const r = validateProvenance(e);
    expect(r.passed).toBe(false);
    expect(r.reasons[0]).toMatch(/cannot be served when calculation is unavailable/);
  });

  it('rejects contradictory house placements', () => {
    const r = validateProvenance(
      env([baseClaim], [{ claim_ids: ['PC-001', 'PC-009'], description: 'AL in both Scorpio and Taurus' }]),
    );
    expect(r.passed).toBe(false);
    expect(r.reasons[0]).toMatch(/contradiction/);
  });

  it('does not reject interpretive claims merely for being unverified-by-calculation', () => {
    const interp: ProvenanceClaim = {
      ...baseClaim,
      claim_id: 'PC-005',
      claim_type: 'INTERPRETATION',
      verification_status: 'TRADITIONAL',
    };
    expect(validateProvenance(env([interp])).passed).toBe(true);
  });
});

describe('Jaimini path — fail-closed contract', () => {
  it('panel gate withholds analysis when passed=false (contract check)', async () => {
    // Mirror of JaiminiPanel.handleSubmit gate: analysis renders only if
    // raksha.passed. Verify runRaksha returns the flag shape the gate uses.
    const { runRaksha } = await import('@/services/navratri/n9Raksha');
    const res = await runRaksha({ birthDate: '1990-01-15', birthTime: '10:30', lang: 'hi' });
    expect(typeof res.passed).toBe('boolean');
    expect(Array.isArray(res.blockReasons)).toBe(true);
    // If it fails, blockReasons must be non-empty (fail-closed UX contract).
    if (!res.passed) expect(res.blockReasons.length).toBeGreaterThan(0);
  });
});
