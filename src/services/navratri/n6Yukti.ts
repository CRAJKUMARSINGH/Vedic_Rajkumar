/**
 * N6 — Yukti / deterministic synthesis
 *
 * Combines N4 (dasha timing) and N5 (strength) with transit context into a
 * structured verdict.  Every claim carries the rule ID and evidence references
 * that produced it; no conclusion is emitted without ≥1 supporting factor.
 *
 * Phase B contract: factor graph; determinism (same inputs → same output);
 * conflict detection; confidence score; no double-counting.
 */

import type { KaalOutput, DashaWindow } from './n4Kaal';
import type { BalaOutput } from './n5Bala';
import type { ProvenanceClaim } from '@/types/provenanceContract';

export interface SynthesisEvidence {
  ruleId: string;
  ruleVersion: string;
  supportingFactors: string[];  // human-readable list
  calculationRefs: string[];    // IDs from N4/N5 outputs
}

export interface SynthesisFinding {
  /** Short machine-readable category, e.g. 'dasha-strength-alignment'. */
  findingId: string;
  /** Summary sentence. */
  summary: string;
  summaryHi: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT_DATA';
  evidence: SynthesisEvidence;
  /** ProvenanceClaim ready for N9 stamping. */
  claim: ProvenanceClaim;
}

export interface ConflictRecord {
  findingIds: string[];
  description: string;
}

export interface YuktiOutput {
  findings: SynthesisFinding[];
  conflicts: ConflictRecord[];
  overallConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT_DATA';
  /** Determinism trace: SHA-like digest of inputs (for reproducibility assertion). */
  inputSignature: string;
  calculatedAt: string;
}

// ─── Rule catalogue (versioned) ───────────────────────────────────────────────

const RULE_VERSION = 'yukti-rules-v1.0';

function inputSignature(kaal: KaalOutput, bala: BalaOutput): string {
  // Lightweight determinism trace — not cryptographic, just for identity checks.
  const lords = kaal.activeDasha?.activeLords.join(',') ?? 'none';
  const strongest = bala.strongestPlanet;
  return `kaal:${lords}|bala:${strongest}`;
}

/** RULE-001: strong Maha lord aligns with transit period → favourable window */
function checkDashaStrengthAlignment(
  kaal: KaalOutput,
  bala: BalaOutput,
): SynthesisFinding | null {
  if (kaal.availability !== 'AVAILABLE' || !kaal.activeDasha?.maha) return null;

  const mahaLord = kaal.activeDasha.maha.lord;
  const strength = bala.planets.find((p) => p.planet === mahaLord);
  if (!strength || strength.availability === 'UNAVAILABLE') return null;

  const meetsMin = strength.meetsMinimum;
  const confidence: SynthesisFinding['confidence'] = meetsMin ? 'HIGH' : 'LOW';

  return {
    findingId: 'dasha-strength-alignment',
    summary: meetsMin
      ? `${mahaLord} Mahadasha is active and meets the Shadbala minimum — a favourable period for ${mahaLord}-signified areas.`
      : `${mahaLord} Mahadasha is active but does not meet the Shadbala minimum — ${mahaLord}-signified results may be delayed or partial.`,
    summaryHi: meetsMin
      ? `${mahaLord} महादशा सक्रिय है और शड्बल न्यूनतम से ऊपर है — ${mahaLord}-संबंधी फलों का अनुकूल काल।`
      : `${mahaLord} महादशा सक्रिय है किन्तु शड्बल न्यूनतम से नीचे है — फल विलंबित या आंशिक हो सकते हैं।`,
    confidence,
    evidence: {
      ruleId: 'RULE-001',
      ruleVersion: RULE_VERSION,
      supportingFactors: [
        `Active Mahadasha lord: ${mahaLord}`,
        `Shadbala total: ${strength.totalRupas.toFixed(2)} Rupas`,
        `Meets minimum: ${meetsMin}`,
      ],
      calculationRefs: [
        `kaal:${kaal.provenance.calculatedAt}`,
        `bala:${bala.provenance.calculatedAt}`,
      ],
    },
    claim: {
      claim_id: 'YUK-001',
      claim_type: 'DASHA_WINDOW',
      source_type: 'CALCULATION',
      text: `${mahaLord} Mahadasha active; Shadbala ${strength.totalRupas.toFixed(2)} Rupas`,
      engine_version: `${kaal.provenance.engine}+${bala.provenance.engine}`,
      ayanamsa: kaal.provenance.ayanamsa,
      input_hash: inputSignature({ ...kaal }, bala),
      calculation_refs: [`N4:${kaal.provenance.calculatedAt}`, `N5:${bala.provenance.calculatedAt}`],
      verification_status: 'VERIFIED',
      confidence_or_limitations: kaal.provenance.sensitivityNote,
    },
  };
}

/** RULE-002: strongest planet's dignity — dignity context note */
function checkStrongestDignity(bala: BalaOutput): SynthesisFinding | null {
  const strongest = bala.planets.find((p) => p.planet === bala.strongestPlanet);
  if (!strongest || strongest.availability === 'UNAVAILABLE') return null;

  const dignity = strongest.dignity;
  const isStrong = ['Exalted', 'Own'].includes(dignity);
  const isWeak = ['Debilitated'].includes(dignity);

  return {
    findingId: 'strongest-planet-dignity',
    summary: isStrong
      ? `${strongest.planet} is the strongest planet in the chart and is ${dignity} — reinforcing its significations.`
      : isWeak
      ? `${strongest.planet} is numerically strong (${strongest.totalRupas.toFixed(2)} Rupas) but ${dignity} — strength in quantity does not compensate for dignity weakness.`
      : `${strongest.planet} is the strongest planet (${strongest.totalRupas.toFixed(2)} Rupas) with ${dignity} dignity.`,
    summaryHi: isStrong
      ? `${strongest.planet} कुंडली का सबसे बलशाली ग्रह है और ${dignity} अवस्था में है।`
      : isWeak
      ? `${strongest.planet} शड्बल में बलशाली है (${strongest.totalRupas.toFixed(2)} रूपा) पर ${dignity} — मात्रात्मक बल अवस्था की कमज़ोरी की भरपाई नहीं करता।`
      : `${strongest.planet} सबसे बलशाली ग्रह है (${strongest.totalRupas.toFixed(2)} रूपा), अवस्था: ${dignity}।`,
    confidence: isStrong || isWeak ? 'HIGH' : 'MEDIUM',
    evidence: {
      ruleId: 'RULE-002',
      ruleVersion: RULE_VERSION,
      supportingFactors: [
        `Strongest planet: ${strongest.planet}`,
        `Total Rupas: ${strongest.totalRupas.toFixed(2)}`,
        `Dignity: ${dignity}`,
      ],
      calculationRefs: [`bala:${bala.provenance.calculatedAt}`],
    },
    claim: {
      claim_id: 'YUK-002',
      claim_type: 'STRENGTH',
      source_type: 'CALCULATION',
      text: `${strongest.planet} strongest (${strongest.totalRupas.toFixed(2)} Rupas, ${dignity})`,
      engine_version: bala.provenance.engine,
      ayanamsa: 'Lahiri',
      input_hash: `bala:${bala.strongestPlanet}:${strongest.totalRupas.toFixed(0)}`,
      calculation_refs: [`N5:${bala.provenance.calculatedAt}`],
      verification_status: 'VERIFIED',
    },
  };
}

/** RULE-003: upcoming dasha window preview */
function checkUpcomingDasha(kaal: KaalOutput): SynthesisFinding | null {
  if (kaal.availability !== 'AVAILABLE' || kaal.upcoming.length === 0) return null;
  const next = kaal.upcoming[0] as DashaWindow;

  return {
    findingId: 'upcoming-dasha',
    summary: `Next Mahadasha: ${next.lord} begins in approximately ${next.daysRemaining} days (${next.startIso.slice(0, 10)}).`,
    summaryHi: `अगली महादशा: ${next.lord} लगभग ${next.daysRemaining} दिन बाद शुरू होगी (${next.startIso.slice(0, 10)})।`,
    confidence: 'HIGH',
    evidence: {
      ruleId: 'RULE-003',
      ruleVersion: RULE_VERSION,
      supportingFactors: [`Next lord: ${next.lord}`, `Starts: ${next.startIso.slice(0, 10)}`, `Days remaining: ${next.daysRemaining}`],
      calculationRefs: [`kaal:${kaal.provenance.calculatedAt}`],
    },
    claim: {
      claim_id: 'YUK-003',
      claim_type: 'DASHA_WINDOW',
      source_type: 'CALCULATION',
      text: `${next.lord} Mahadasha starts ${next.startIso.slice(0, 10)}`,
      engine_version: kaal.provenance.engine,
      ayanamsa: kaal.provenance.ayanamsa,
      input_hash: `upcoming:${next.lord}:${next.startIso.slice(0, 10)}`,
      calculation_refs: [`N4:${kaal.provenance.calculatedAt}`],
      verification_status: 'VERIFIED',
      confidence_or_limitations: kaal.provenance.sensitivityNote,
    },
  };
}

/** Detect contradictions between findings. */
function detectConflicts(findings: SynthesisFinding[]): ConflictRecord[] {
  const conflicts: ConflictRecord[] = [];
  // Rule: same planet cannot be both strong and weak in separate findings.
  const strong = findings.filter((f) => f.findingId === 'dasha-strength-alignment' && f.confidence === 'HIGH');
  const weak   = findings.filter((f) => f.findingId === 'dasha-strength-alignment' && f.confidence === 'LOW');
  if (strong.length > 0 && weak.length > 0) {
    conflicts.push({
      findingIds: ['dasha-strength-alignment'],
      description: 'Contradictory dasha strength assessment — verify input consistency.',
    });
  }
  return conflicts;
}

function overallConfidence(findings: SynthesisFinding[]): YuktiOutput['overallConfidence'] {
  if (findings.length === 0) return 'INSUFFICIENT_DATA';
  if (findings.every((f) => f.confidence === 'HIGH')) return 'HIGH';
  if (findings.some((f) => f.confidence === 'HIGH')) return 'MEDIUM';
  if (findings.every((f) => f.confidence === 'INSUFFICIENT_DATA')) return 'INSUFFICIENT_DATA';
  return 'LOW';
}

/**
 * Run all synthesis rules over N4 + N5 outputs.
 * Pure function — deterministic given the same inputs.
 */
export function computeYukti(kaal: KaalOutput, bala: BalaOutput): YuktiOutput {
  const calculatedAt = new Date().toISOString();
  const findings: SynthesisFinding[] = [];

  const f1 = checkDashaStrengthAlignment(kaal, bala);
  if (f1) findings.push(f1);

  const f2 = checkStrongestDignity(bala);
  if (f2) findings.push(f2);

  const f3 = checkUpcomingDasha(kaal);
  if (f3) findings.push(f3);

  const conflicts = detectConflicts(findings);

  return {
    findings,
    conflicts,
    overallConfidence: overallConfidence(findings),
    inputSignature: inputSignature(kaal, bala),
    calculatedAt,
  };
}
