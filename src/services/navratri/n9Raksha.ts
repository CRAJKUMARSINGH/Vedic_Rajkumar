/**
 * N9 — Raksha / release gate
 *
 * This module is the PRODUCTION entry point for the full N4→N9 pipeline.
 * It:
 *   1. Runs computeKaal (N4), computeBala (N5), computeYukti (N6),
 *      generateVani (N7), enrichWithCitations (N8) in sequence.
 *   2. Collects ProvenanceClaims from N6 findings.
 *   3. Runs validateProvenance (N9 gate) and blocks responses that fail.
 *   4. Returns a typed `RakshaResult` whose `passed` flag controls rendering.
 *
 * Phase B contract: validates completeness, evidence provenance, safety,
 * privacy, and deterministic calculation contracts. Fails closed on:
 *   - Missing engine_version or input_hash on CALCULATION claims.
 *   - CALCULATION_UNAVAILABLE precise astronomical claims.
 *   - Contradictory claims.
 *
 * Wired into HoroscopeCard via the `useRaksha` hook so the N9 gate runs
 * in the production render path — not just in tests.
 */

import { computeKaal } from './n4Kaal';
import { computeBala } from './n5Bala';
import { computeYukti } from './n6Yukti';
import { generateVani } from './n7Vani';
import { enrichWithCitations } from './n8Buddhi';
import {
  validateProvenance,
  type ProvenanceEnvelope,
  type ProvenanceClaim,
} from '@/types/provenanceContract';
import type { BuddhiOutput } from './n8Buddhi';
import type { PlanetData } from '@/services/shadabalaService';

export interface RakshaInput {
  /** `YYYY-MM-DD` */
  birthDate: string;
  /** `HH:MM` */
  birthTime: string;
  /** Sidereal Moon longitude from WASM (optional; triggers fallback Meeus when absent). */
  accurateMoonLongitude?: number;
  /** Planet data from chart engine (optional; triggers Shadbala unavailability when absent). */
  planets?: PlanetData[];
  /** Dignity map from N2 (optional). */
  dignities?: Record<string, string>;
  isDaytime?: boolean;
  lang?: 'en' | 'hi';
}

export interface RakshaResult {
  passed: boolean;
  /** Validation failure reasons — empty when passed. */
  blockReasons: string[];
  /** Full narrative output (present even when blocked — UI chooses whether to show). */
  narrative: BuddhiOutput;
  /** ProvenanceEnvelope for rendering citations and audit trail. */
  envelope: ProvenanceEnvelope;
}

function buildEnvelope(claims: ProvenanceClaim[], inputHash: string): ProvenanceEnvelope {
  return {
    response_id: `raksha-${Date.now()}`,
    generated_at: new Date().toISOString(),
    input_hash: inputHash,
    calculation_available: claims.some((c) => c.source_type === 'CALCULATION'),
    claims,
    unverified_claims: claims
      .filter((c) => c.verification_status !== 'VERIFIED')
      .map((c) => c.claim_id),
    contradictions: [],
  };
}

/**
 * Run the full N4→N9 pipeline and return a validated result.
 * Never throws — errors are captured in blockReasons.
 */
export async function runRaksha(input: RakshaInput): Promise<RakshaResult> {
  const { birthDate, birthTime, accurateMoonLongitude, planets, dignities, isDaytime } = input;

  // N4 — Kaal
  const kaal = computeKaal(birthDate, birthTime, accurateMoonLongitude);

  // N5 — Bala (needs planet data; returns UNAVAILABLE gracefully when absent)
  const bala = computeBala(planets ?? [], dignities, isDaytime ?? true);

  // N6 — Yukti
  const yukti = computeYukti(kaal, bala);

  // N7 — Vani
  const vani = generateVani(yukti);

  // N8 — Buddhi (async retrieval; falls back gracefully)
  const narrative = await enrichWithCitations(vani);

  // Build ProvenanceClaims from N6 findings
  const claims: ProvenanceClaim[] = yukti.findings
    .map((f) => f.claim)
    .filter(Boolean);

  const envelope = buildEnvelope(claims, yukti.inputSignature);

  // Add contradictions from N6 to the envelope
  envelope.contradictions = yukti.conflicts.map((c) => ({
    claim_ids: c.findingIds,
    description: c.description,
  }));

  // N9 gate
  const { passed, reasons } = validateProvenance(envelope);

  return {
    passed,
    blockReasons: reasons,
    narrative,
    envelope,
  };
}
