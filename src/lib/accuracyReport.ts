/**
 * accuracyReport.ts - the shape of the public accuracy page's data, and a
 * defensive loader.
 *
 * The page must render from a placeholder snapshot as well as from a real gate
 * run, so the loader normalises rather than trusts. A missing field is a label,
 * not a crash.
 */

export type Verdict = 'pass' | 'fail' | 'unmeasured';

export interface BodyRow {
  body: string;
  claimArcsec: number;
  maxArcsec: number;
  observedArcsec: number | null;
  verdict: Verdict;
  note?: string;
}

export interface UnverifiedArea {
  area: string;
  why: string;
}

export interface AccuracyReport {
  generatedAt: string;
  isPlaceholder: boolean;
  engineFrame: string;
  swissVersion: string;
  corpus: { charts: number; pre1906: number; sources: string[] };
  bodies: BodyRow[];
  exposure: { moonBoundaryNow: number; moonBoundaryBefore: number; moonClaimArcsec: number };
  deltaT: { note: string; uncertaintySeconds: [number, number] };
  unverified: UnverifiedArea[];
  unverifiedNote: string;
}

export const UNVERIFIED_AREAS: UnverifiedArea[] = [
  { area: 'Varas (weekday)', why: 'derived from the calendar, never cross-checked against a fixture.' },
  { area: 'Vimshottari dasha dates', why: 'computed twice by independent code and the two agree, but neither is checked against JHora.' },
  { area: 'Yogas', why: 'rule-based; no external authority consulted.' },
  { area: 'Shadbala', why: 'a formula chain with no published worked example in the corpus.' },
  { area: 'Ashtakavarga', why: 'same as shadbala.' },
  { area: 'Divisional charts (D9 and up)', why: 'inherit a verified ascendant and Moon, but their own transform is unverified.' },
  { area: 'Interpretation prose', why: 'authored text; no accuracy claim applies.' },
];

export const DELTA_T_NOTE =
  'delta-T is measured, not modelled. Its own uncertainty is now the floor on ' +
  'historical accuracy: +/-3 to 10 seconds pre-1900, which is +/-1.6 to 5.5 arcsec ' +
  'of Moon and +/-0.25 to 2.7 arcmin of ascendant rotation. No series length fixes it.';

const num = (v: unknown, fallback: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
const str = (v: unknown, fallback: string): string => (typeof v === 'string' && v ? v : fallback);

function normaliseBody(raw: unknown): BodyRow | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const body = str(r.body, str(r.name, ''));
  if (!body) return null;
  const observed = typeof r.observedArcsec === 'number' ? r.observedArcsec : null;
  const claim = num(r.claimArcsec, 0);
  const verdict: Verdict =
    r.verdict === 'pass' || r.verdict === 'fail' || r.verdict === 'unmeasured'
      ? r.verdict
      : observed === null
        ? 'unmeasured'
        : observed <= claim
          ? 'pass'
          : 'fail';
  return {
    body,
    claimArcsec: claim,
    maxArcsec: num(r.maxArcsec, 0),
    observedArcsec: observed,
    verdict,
    note: typeof r.note === 'string' ? r.note : undefined,
  };
}

export function loadAccuracyReport(raw: unknown): AccuracyReport {
  const r = (raw ?? {}) as Record<string, unknown>;
  const corpus = (r.corpus ?? {}) as Record<string, unknown>;
  const exposure = (r.exposure ?? {}) as Record<string, unknown>;
  const deltaT = (r.deltaT ?? {}) as Record<string, unknown>;
  const bodiesRaw = Array.isArray(r.bodies) ? r.bodies : [];

  const unverifiedRaw = Array.isArray(r.unverified) ? r.unverified : null;
  const unverified = unverifiedRaw
    ? unverifiedRaw
        .map((u) => {
          const o = (u ?? {}) as Record<string, unknown>;
          const area = str(o.area, '');
          return area ? { area, why: str(o.why, 'not stated') } : null;
        })
        .filter((u): u is UnverifiedArea => u !== null)
    : UNVERIFIED_AREAS;

  const uncertainty = Array.isArray(deltaT.uncertaintySeconds) && deltaT.uncertaintySeconds.length === 2
    ? [num(deltaT.uncertaintySeconds[0], 3), num(deltaT.uncertaintySeconds[1], 10)] as [number, number]
    : ([3, 10] as [number, number]);

  return {
    generatedAt: str(r.generatedAt, 'never - placeholder snapshot'),
    isPlaceholder: r.isPlaceholder === true,
    engineFrame: str(r.engineFrame, 'true (geometric, no nutation) everywhere'),
    swissVersion: str(r.swissVersion, 'unknown'),
    corpus: {
      charts: num(corpus.charts, 0),
      pre1906: num(corpus.pre1906, 0),
      sources: Array.isArray(corpus.sources) ? corpus.sources.map((s) => String(s)) : [],
    },
    bodies: bodiesRaw.map(normaliseBody).filter((b): b is BodyRow => b !== null),
    exposure: {
      moonBoundaryNow: num(exposure.moonBoundaryNow, 0),
      moonBoundaryBefore: num(exposure.moonBoundaryBefore, 0),
      moonClaimArcsec: num(exposure.moonClaimArcsec, 15),
    },
    deltaT: { note: str(deltaT.note, DELTA_T_NOTE), uncertaintySeconds: uncertainty },
    unverified,
    unverifiedNote: str(
      r.unverifiedNote,
      'These layers are computed and shown to users. None of them is checked against an external authority yet.',
    ),
  };
}
