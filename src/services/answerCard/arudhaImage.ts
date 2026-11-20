/**
 * arudhaImage.ts — image-vs-substance axis (c3 Phase 9 / v2 §2–§10).
 *
 * DISABLED BY DEFAULT: isImageAxisEnabled() gates the composer section.
 * The image score, gap bands and thresholds are EXPERIMENTAL design
 * parameters — not classical constants, not calibrated predictions.
 *
 * Rules enforced:
 *  - substance verdicts are never touched (additive section only)
 *  - missing ascendant/placements/lord → null (omit, never default)
 *  - provenance required; fail-closed via validateImageProvenance
 *  - prashna charts: AL rules are natal-only → status TRADITIONAL, and an
 *    extreme gap on TRADITIONAL fails validation (withheld)
 *  - health topic: no image axis (v2 §10 — no health creep)
 * Pure & deterministic. ChartFacts is never mutated.
 */
import { calculateArudhaPada, type JaiminiPlanet } from '@/services/jaiminiService';
import { stableHash } from '@/lib/hash/stableHash';
import type { Band } from './AnswerCard.types';
import type { ChartFacts, Planet } from './chartFacts';
import type { Bi } from './bilingual';

/** Feature flag — disabled until owner approves the experimental scoring. */
export const isImageAxisEnabled = (): boolean =>
  (import.meta.env?.VITE_ARUDHA_IMAGE as string | undefined) === 'true';

export const ARUDHA_CONVENTION = 'BPHS 29.4-5 (10th from pada; dist7→4th)';
const ENGINE = 'jaiminiService.calculateArudhaPada';
const VERSION = 'arudha-image-0.1.0';

/** v2 §4 base table: score by A10's house counted from AL. */
export const IMAGE_BASE_BY_HOUSE: Record<number, number> = {
  1: 72, 2: 60, 3: 56, 4: 52, 5: 66, 6: 38,
  7: 48, 8: 30, 9: 76, 10: 90, 11: 80, 12: 22,
};

/** Only these topics are forecast-bearing for AL (v2 §5). */
const TOPIC_ARUDHA: Partial<Record<string, number>> = {
  career: 10, finance: 11, house_construction: 4, marriage: 7,
};

const BENEFIC: ReadonlySet<Planet> = new Set(['Jupiter', 'Venus', 'Moon', 'Mercury']);
const MALefic: ReadonlySet<Planet> = new Set(['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu']);

export type GapBand = 'over-promised' | 'ahead' | 'aligned' | 'undervalued' | 'invisible';

export function gapBand(gap: number): GapBand {
  if (gap >= 20) return 'over-promised';
  if (gap >= 8) return 'ahead';
  if (gap >= -7) return 'aligned';
  if (gap >= -19) return 'undervalued';
  return 'invisible';
}

/** Image score → the SAME band vocabulary as the substance axis (v2 §4). */
export function bandForImageScore(score: number): Band {
  if (score >= 75) return 'excellent';
  if (score >= 56) return 'good';
  if (score >= 40) return 'average';
  if (score >= 25) return 'caution';
  return 'avoid';
}

export interface ImageAxis {
  kind: string;
  arudhaFromAl: number;
  score: number;
  band: Band;
  gap: number;
  band_gap: GapBand;
  citations: Bi[];
  line: Bi;
  provenance: {
    engine: string;
    version: string;
    convention: string;
    arudha_hash: string;
    status: 'VERIFIED' | 'TRADITIONAL';
  };
}

export interface BuildImageInput {
  facts: ChartFacts;
  topic: string;
  substanceScore: number | null;
  referenceType?: 'natal' | 'prashna';
}

const GAP_LINE: Record<GapBand, Bi> = {
  'over-promised': {
    en: 'Experimental note: image reads ahead of substance — bank the goodwill, do not spend it before the work exists.',
    hi: 'प्रायोगिक नोट: छवि कार्य से आगे दिखती है — साख बचाएँ, काम होने से पहले खर्च न करें।',
  },
  ahead: {
    en: 'Experimental note: perception is running slightly ahead of substance; close the gap quietly.',
    hi: 'प्रायोगिक नोट: धारणा कार्य से थोड़ी आगे है; चुपचाप अंतर पाटें।',
  },
  aligned: {
    en: 'Experimental note: how you are seen matches what you can deliver.',
    hi: 'प्रायोगिक नोट: जैसे देखे जाते हैं, वैसा ही कर पाते हैं।',
  },
  undervalued: {
    en: 'Experimental note: you deliver more than you are credited for; visibility is the missing input.',
    hi: 'प्रायोगिक नोट: आप श्रेय से अधिक देते हैं; कमी दिखने की है, कौशल की नहीं।',
  },
  invisible: {
    en: 'Experimental note: substance without audience — image repair comes first in any plan.',
    hi: 'प्रायोगिक नोट: काम है, दर्शक नहीं — किसी भी योजना में पहले छवि सुधारें।',
  },
};

/** Fail-closed provenance check (v2 §6). */
export function validateImageProvenance(axis: ImageAxis | null | undefined): boolean {
  if (!axis) return false;
  const p = axis.provenance;
  if (!p || !p.engine || !p.version || !p.convention || !p.arudha_hash) return false;
  if (p.convention !== ARUDHA_CONVENTION) return false;
  if (p.engine !== ENGINE || p.version !== VERSION) return false;
  // TRADITIONAL + extreme gap (|gap| ≥ 20) → unverified convention carrying
  // an extreme claim — exactly where a bug hides. Withhold.
  if (p.status === 'TRADITIONAL' && Math.abs(axis.gap) >= 20) return false;
  return p.status === 'VERIFIED' || p.status === 'TRADITIONAL';
}

/**
 * Build the bounded image axis. Returns null on any missing input — the
 * caller omits the section; nothing is defaulted.
 */
export function buildImageAxis(input: BuildImageInput): ImageAxis | null {
  const { facts, topic, substanceScore, referenceType = 'natal' } = input;
  const arudhaHouse = TOPIC_ARUDHA[topic];
  if (arudhaHouse === undefined) return null; // health & unlisted topics
  if (facts.ascSign === null) return null;
  if (facts.placements.length === 0) return null;

  // Canonical engine input — placements carry sign/house; degrees are not
  // needed by the Arudha count.
  const planets: JaiminiPlanet[] = facts.placements.map(p => ({
    name: p.planet,
    rashiIndex: p.sign,
    degrees: 0,
    house: p.house,
  }));

  const al = calculateArudhaPada(1, facts.ascSign, planets);
  const target = calculateArudhaPada(arudhaHouse, facts.ascSign, planets);
  if (!al || !target) return null;

  const arudhaFromAl = ((target.rashiIndex - al.rashiIndex + 12) % 12) + 1;
  const base = IMAGE_BASE_BY_HOUSE[arudhaFromAl];
  if (base === undefined) return null;

  // Modifiers — experimental, occupants-of-AL only (v2 §4). AL-lord dignity
  // is omitted rather than guessed when the needed fields are absent.
  const occupants = facts.placements.filter(p => p.sign === al.rashiIndex);
  const benefics = occupants.filter(p => BENEFIC.has(p.planet)).length;
  const malefics = occupants.filter(p => MALefic.has(p.planet)).length;
  const retro = occupants.filter(p => p.retrograde).length;
  const score = Math.max(0, Math.min(100,
    base + Math.min(benefics * 6, 12) - Math.min(malefics * 5, 10) - Math.min(retro * 3, 6)));

  const gap = substanceScore === null ? 0 : score - substanceScore;
  const bg = gapBand(gap);
  const isPrashna = referenceType === 'prashna';

  const axis: ImageAxis = {
    kind: `A${arudhaHouse}`,
    arudhaFromAl,
    score,
    band: bandForImageScore(score),
    gap,
    band_gap: bg,
    citations: [{
      en: `A${arudhaHouse} is in the ${arudhaFromAl}${ORD_EN[arudhaFromAl] ?? ''} from AL (${al.rashiName} → ${target.rashiName}); experimental image score ${score}/100.`,
      hi: `A${arudhaHouse}, AL से ${arudhaFromAl}${ORD_HI[arudhaFromAl] ?? ''} भाव में (${al.rashiName} → ${target.rashiName})); प्रायोगिक छवि स्कोर ${score}/100।`,
    }],
    line: GAP_LINE[bg],
    provenance: {
      engine: ENGINE,
      version: VERSION,
      convention: ARUDHA_CONVENTION,
      arudha_hash: stableHash({ al: al.rashiIndex, target: target.rashiIndex, arudhaFromAl, asc: facts.ascSign }),
      // natal: calculation-verified convention still interpretive → TRADITIONAL
      // prashna: AL rules are natal-only → always TRADITIONAL
      status: 'TRADITIONAL',
    },
  };
  void isPrashna; // status already TRADITIONAL; kept for future VERIFIED natal path
  return axis;
}

const ORD_EN = ['', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th'];
const ORD_HI = ['', 'प्रथम', 'द्वितीय', 'तृतीय', 'चतुर्थ', 'पंचम', 'षष्ठ', 'सप्तम', 'अष्टम', 'नवम', 'दशम', 'एकादश', 'द्वादश'];
