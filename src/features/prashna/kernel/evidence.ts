/**
 * ============================================================
 * PRASNA KERNEL — EVIDENCE CONTRACT (Prasnalove.txt §5.1)
 * ============================================================
 *
 * The EvidenceBundle is the ONLY object the narration (AI) layer is
 * allowed to see. Every item is computed by the deterministic kernel
 * and carries a `citationId` that resolves in src/data/prasna/citations.ts.
 *
 * Hard rule (Prasnalove.txt §8): AI may NEVER create evidence items. It
 * may only narrate ids that are already in the bundle.
 * ============================================================
 */

/** Semver of the deterministic Prasna kernel that produced a bundle. */
export const PRASNA_ENGINE_VERSION = '1.0.0-kernel';

/** Whether a computed fact supports, opposes, or is neutral to the question. */
export type Polarity = 'supports' | 'opposes' | 'neutral';

/** Primary verdict — intentionally small, matches PrashnaVerdict. */
export type Verdict = 'yes' | 'no' | 'maybe' | 'unclear';

/** Bilingual label (Hindi shown only when the ask is in Hindi). */
export interface BilingualText {
  en: string;
  hi: string;
}

/**
 * One deterministic fact. `weight` is tunable from outcome data (§5.9).
 * `computed: true` is a literal so a hand-written (hallucinated) item
 * cannot be typed as valid evidence.
 */
export interface EvidenceItem {
  /** Stable id, e.g. 'sutra.samanya' or 'tajika.ithasala.L1-L7'. */
  id: string;
  label: BilingualText;
  /** The measured value, e.g. 'Jeeva' or 212.4. */
  value: string | number;
  polarity: Polarity;
  /** 0..1 — contribution to the weighted score. */
  weight: number;
  /** Key into data/prasna/citations.ts. */
  citationId: string;
  computed: true;
}

/** The six rungs of the ethical Parihara ladder (Prasnalove.txt §7). */
export type RemedyLadderStep = 1 | 2 | 3 | 4 | 5 | 6;

export type RemedyType =
  | 'antar-sadhana'
  | 'seva-dana'
  | 'vrata'
  | 'temple'
  | 'homa'
  | 'gemstone';

export interface RemedyStep {
  step: RemedyLadderStep;
  type: RemedyType;
  instruction: string;
  citationId: string;
}

export interface TimingWindow {
  earliest: string;
  latest: string;
  basis: string;
}

/**
 * The kernel's complete, reproducible output for one question.
 * `chartHash` is a deterministic digest of the inputs so the client and
 * server can prove they computed the same chart.
 */
export interface EvidenceBundle {
  queryId: string;
  engineVersion: string;
  chartHash: string;
  items: EvidenceItem[];
  verdict: Verdict;
  /** 0..1 — derived only from the kernel, never from a language model. */
  confidence: number;
  timing?: TimingWindow;
  remedies: RemedyStep[];
  /** Machine codes such as 'health.referDoctor' (Prasnalove.txt §7). */
  guardrails: string[];
}

/**
 * Build an EvidenceItem, forcing `computed: true`. Use this in topic
 * modules rather than hand-writing the literal.
 */
export function makeEvidence(item: Omit<EvidenceItem, 'computed'>): EvidenceItem {
  return { ...item, computed: true };
}

/** +1 for supports, −1 for opposes, 0 for neutral. */
export function polaritySign(polarity: Polarity): number {
  return polarity === 'supports' ? 1 : polarity === 'opposes' ? -1 : 0;
}
