/**
 * provenanceContract.ts — Venice AI provenance patch §3 / §4
 *
 * Every interpretive claim served by the app MUST carry this contract.
 * The UI renders citations; the N9 Raksha gate rejects claims without
 * a calculation reference when claim_type is CALCULATION.
 *
 * Rules (from AGENTS.md + Venice AI patch):
 * - Never invent planetary positions or dasha dates.
 * - If calculation fails, return 'calculation-unavailable' — not an invented chart.
 * - Distinguish COMPUTED astronomical data from RULE-based interpretation
 *   from DOCUMENT retrieval from MODEL_INFERENCE.
 * - Exact astronomical statements require engine_version + ephemeris_version.
 */

export type ClaimType =
  | 'PLANETARY_PLACEMENT'
  | 'NAKSHATRA_PADA'
  | 'DASHA_WINDOW'
  | 'TRANSIT'
  | 'STRENGTH'
  | 'INTERPRETATION'
  | 'REMEDIAL'
  | 'APP_FEATURE'
  | 'TIMING'
  | 'GENERAL_GUIDANCE';

export type SourceType =
  | 'CALCULATION'      // from a verified deterministic engine output
  | 'TRADITIONAL_RULE' // from a versioned classical rule set
  | 'DOCUMENT'         // retrieved from a versioned, licensed corpus
  | 'MODEL_INFERENCE'  // AI composition (must cite CALCULATION or DOCUMENT)
  | 'USER_SUPPLIED';   // birth time, location etc.

export type VerificationStatus =
  | 'VERIFIED'
  | 'PENDING'
  | 'UNVERIFIED'
  | 'CALCULATION_UNAVAILABLE'
  | 'CONTRADICTED';

export interface ProvenanceClaim {
  /** Unique ID within a response, e.g. "PC-001". */
  claim_id: string;
  claim_type: ClaimType;
  source_type: SourceType;
  /** Human-readable assertion text. */
  text: string;
  text_hi?: string; // Hindi translation if available

  // Calculation provenance (required when source_type === 'CALCULATION')
  engine_version?: string;         // e.g. 'swisseph-wasm@0.1.0'
  ephemeris_version?: string;      // e.g. 'Swiss Ephemeris 2.10'
  ayanamsa?: string;               // e.g. 'Lahiri'
  house_system?: string;           // e.g. 'WholeSign'
  /** SHA-256 of the canonical input that produced this claim. */
  input_hash?: string;
  /** IDs of calculator outputs that support this claim. */
  calculation_refs?: string[];

  // Rule provenance (required when source_type === 'TRADITIONAL_RULE')
  rule_ids?: string[];             // e.g. ['BPHS-7-12', 'KP-sig-lord']
  rule_version?: string;           // e.g. 'rules-v1.2.0'

  // Document provenance (required when source_type === 'DOCUMENT')
  corpus_ids?: string[];           // passage IDs from RAG corpus
  corpus_version?: string;

  confidence_or_limitations?: string;
  verification_status: VerificationStatus;
}

/** Full provenance envelope attached to every app response. */
export interface ProvenanceEnvelope {
  response_id: string;
  generated_at: string;    // ISO-8601 UTC
  input_hash: string;      // of birth context used
  calculation_available: boolean;
  claims: ProvenanceClaim[];
  /** Any claim that cannot be backed by CALCULATION or TRADITIONAL_RULE. */
  unverified_claims: string[]; // claim_ids
  /** Contradictory claims detected. */
  contradictions: Array<{ claim_ids: string[]; description: string }>;
}

/**
 * N9 Raksha gate — rejects a ProvenanceEnvelope that:
 * - has CALCULATION claims without engine_version + input_hash
 * - has contradictions
 * - has CALCULATION_UNAVAILABLE status and still makes precise astronomical claims
 */
export function validateProvenance(env: ProvenanceEnvelope): {
  passed: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  for (const claim of env.claims) {
    if (
      claim.source_type === 'CALCULATION' &&
      (!claim.engine_version || !claim.input_hash)
    ) {
      reasons.push(
        `Claim ${claim.claim_id} (${claim.claim_type}) is marked CALCULATION but lacks engine_version or input_hash.`,
      );
    }
    if (claim.verification_status === 'CALCULATION_UNAVAILABLE') {
      if (
        claim.claim_type === 'PLANETARY_PLACEMENT' ||
        claim.claim_type === 'NAKSHATRA_PADA' ||
        claim.claim_type === 'DASHA_WINDOW'
      ) {
        reasons.push(
          `Claim ${claim.claim_id}: precise astronomical claim (${claim.claim_type}) cannot be served when calculation is unavailable.`,
        );
      }
    }
  }

  if (env.contradictions.length > 0) {
    reasons.push(
      `${env.contradictions.length} contradiction(s) detected: ` +
        env.contradictions.map((c) => c.description).join('; '),
    );
  }

  return { passed: reasons.length === 0, reasons };
}
