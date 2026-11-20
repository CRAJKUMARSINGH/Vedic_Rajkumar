# Phase 2 — Code-Level Patch Plan: Router Fail-Rules, Confidence Caps, Answer-Card Source Tagging

**Repo:** `github.com/CRAJKUMARSINGH/Vedic_Rajkumar`
**Base commit:** `6b1c0fbf95f25cc5478d60b0b319b6969a098fa0` (Thu 19 Nov 2026)
**Depends on:** Phase 1 (`ayanamsaCore.ts`, `ayanamsaEngine.ts`, `ayanamsaService.ts`, `astrology/core/ephemeris.ts`)
**Scope:** 3 workstreams, 9 files touched, 1 new error module, 1 new test file.

---

## WS-1 · Router fail-rules

### 1.1 The defect

`src/api/v1/router.ts:127` ships fabricated astronomy behind a 200:

```ts
async function getNatal(_chartId: string) { return { lagnaSign: 0, planets: { Moon: 45 } }; }
```

`GET /v1/transits/:chartId` (`router.ts:69-88`) validates `asOf`, calls `getNatal()`, and returns `transitService.snapshot(natal, asOf)` with **HTTP 200**. An API customer receives a transit snapshot for a chart that does not exist, computed from an Aries lagna and a Moon at 45°. `computeChart` (`router.ts:120`) and `getChart` (`router.ts:121`) are the same class of stub.

This is worse than a bug: it is a *false-success contract*. The client's retry logic, their cache, and their users all believe the answer is real.

### 1.2 New file — `src/api/v1/errors.ts`

```ts
export type ApiErrorCode =
  | 'invalid_input' | 'unauthorized' | 'forbidden' | 'not_found' | 'rate_limited'
  | 'chart_not_computed'      // chart row exists but has no computed positions
  | 'compute_unavailable'     // no ephemeris engine could answer
  | 'ephemeris_degraded'      // answered, but below the published accuracy floor
  | 'anchor_pending_golden'   // ayanamsa anchor not yet locked against Swiss Ephemeris
  | 'not_implemented';

export interface ApiErrorBody {
  error: { code: ApiErrorCode; message: string; reason: string; retryable: boolean; requestId: string };
}

/** 503 for "the system cannot answer honestly right now" — never 200 with filler. */
export const serviceUnavailable = (code: ApiErrorCode, message: string, reason: string, requestId = crypto.randomUUID()) =>
  ({ status: 503 as const, body: { error: { code, message, reason, retryable: true, requestId } } satisfies ApiErrorBody });

export const notImplemented = (what: string, requestId = crypto.randomUUID()) =>
  ({ status: 501 as const, body: { error: { code: 'not_implemented' as const, message: `${what} is not implemented`, reason: 'stub-route', retryable: false, requestId } } satisfies ApiErrorBody });
```

**Rule:** `reason` is always a machine string. Never a prose apology, never an empty string.

### 1.3 `router.ts` — replace the three stubs

| Line | Before | After |
|---|---|---|
| 120 | `computeChart` returns `{id, ...input}` | `throw new EphemerisUnavailableError()` → handler maps to 503 `compute_unavailable` |
| 121 | `getChart` returns `undefined` | return `null` only for a real DB miss → 404 `not_found` |
| 127 | `getNatal` returns `{lagnaSign:0, planets:{Moon:45}}` | `return null` when the chart has no computed natal snapshot; route maps `null` → 503 `chart_not_computed` |

```ts
// router.ts — /v1/transits/:chartId, after the asOf validation block
const natal = await getNatal(c.req.param('chartId'));
if (natal === null) {
  const e = serviceUnavailable('chart_not_computed',
    'This chart has no computed natal snapshot',
    'natal-positions-missing');
  return c.json(e.body, e.status);
}
```

### 1.4 Route-by-route fail rule

| Route | Existing failure | Phase 2 contract |
|---|---|---|
| `POST /v1/charts` | stub 201 | 503 `compute_unavailable` when no engine; 201 only with `provenance.ephemeris_source` set |
| `GET /v1/charts/:id` | `undefined` → 404 without a code | 404 `not_found`; 503 `chart_not_computed` when row exists without positions |
| `GET /v1/transits/:chartId` | 200 with fabricated natal | 503 `chart_not_computed` |
| `GET /v1/answer` | 200 even when `resolveJatak` misses | keep 200 for a resolved subject; 404 `not_found` for an unknown person — never a 200 card about nobody |
| `POST /v1/keys` | fine | unchanged |

### 1.5 Gate test — `src/tests/api/routerFailRules.test.ts`

```ts
it.each(['/v1/charts/x', '/v1/transits/x', '/v1/answer?person=nobody'])(
  '%s never returns 200 with placeholder positions', async (path) => {
    const res = await api.request(path, { headers: { authorization: 'Bearer test' } });
    if (res.status === 200) {
      const body = await res.json();
      expect(body).not.toMatchObject({ lagnaSign: 0, planets: { Moon: 45 } });
      expect(Object.keys(body)).not.toContain('ephemerisSource'); // source must be present and real
    }
  });
```

---

## WS-2 · Confidence caps

### 2.1 What `confidence.ts` does today

`src/services/answerCard/confidence.ts` starts at `0.55`, adds up to `+0.18` for boundary distance, `+0.12` for inter-layer agreement, subtracts `0.04` per conflict and `-0.10/-0.08` for two regex-matched caveats, then clamps to `[0.2, 0.9]`.

Three problems:

1. **No cap is tied to a degraded input.** If the ephemeris fell back to mean motion, or the ayanamsa anchor is `pending-golden`, confidence is computed exactly as if the inputs were sound. The 0.90 ceiling is a *global* policy, not an input-quality consequence.
2. **Boundary proximity uses band boundaries (40/56/75), not astronomical boundaries.** A score of 76 is "shakier than 88" — but nothing in the function knows whether the *Moon* sits 0.02° from a nakshatra edge, which is the real source of astrological uncertainty.
3. **Caveats are detected by regex on prose** (`/not SAV-certified/`). Any copy change silently disables the penalty.

### 2.2 Replace regex detection with structured input

```ts
// confidence.ts — new signature (old one kept as a wrapper for one release)
export interface ConfidenceInputs {
  judgment: ConclusiveJatakJudgment;
  /** From PHASE 1: ayanamsaAt(...).degraded */
  ayanamsaDegraded: AyanamsaDegraded[];
  /** From PHASE 1: ephemeris position rows */
  positionSources: PositionSource[];
  /** From PHASE 1: boundaryMargins().nearest for the chart's key bodies */
  boundaryMarginDeg: number;
  /** True when Lahiri and FaganBradley disagree on this body's nakshatra */
  systemsDisagree: boolean;
  /** Engine-side structured flags — replaces the regex sniffing */
  flags: { savCertified: boolean; ashtakavargaAvailable: boolean; dedicatedMoonTransit: boolean };
}
```

### 2.3 The cap table (hard, non-negotiable)

Apply **after** the additive score, as `c = Math.min(c, cap)`. First matching row wins; order is deliberate.

| # | Condition | Cap | Rationale |
|---|---|---|---|
| C1 | `positionSources` includes `'mean-motion'` | **0.40** | Not an ephemeris. A straight-line Moon is wrong by degrees. |
| C2 | `ayanamsaDegraded` includes `'true-citra-approximated'` | **0.55** | Spica proper motion unmodelled. |
| C3 | `ayanamsaDegraded` includes `'anchor-pending-golden'` | **0.60** | Anchor not yet signed off. |
| C4 | `ayanamsaDegraded` includes `'delta-t-out-of-range'` | **0.65** | ΔT extrapolated outside 1900–2150. |
| C5 | `systemsDisagree === true` | **0.50** | Lahiri and Fagan-Bradley place this body in different nakshatras. The tradition itself disagrees. |
| C6 | `boundaryMarginDeg < 0.05` | **0.55** | Within 3 arcmin of a pada edge. |
| C7 | `boundaryMarginDeg < 0.25` | **0.68** | Within 15 arcmin. |
| C8 | `!flags.savCertified` | **0.72** | |
| C9 | `!flags.ashtakavargaAvailable` | **0.75** | |
| C10 | `!flags.dedicatedMoonTransit` | **0.80** | |
| C11 | `judgment.conflictResolution.length >= 3` | **0.62** | Three or more unresolved conflicts is not a confident verdict. |
| — | none of the above | **0.90** | Existing global ceiling retained. |

Floor stays `0.20`.

### 2.4 Patched function

```ts
const CAPS: Array<{ id: string; when: (i: ConfidenceInputs) => boolean; cap: number }> = [
  { id: 'C1', when: i => i.positionSources.includes('mean-motion'), cap: 0.40 },
  { id: 'C2', when: i => i.ayanamsaDegraded.includes('true-citra-approximated'), cap: 0.55 },
  { id: 'C3', when: i => i.ayanamsaDegraded.includes('anchor-pending-golden'), cap: 0.60 },
  { id: 'C4', when: i => i.ayanamsaDegraded.includes('delta-t-out-of-range'), cap: 0.65 },
  { id: 'C5', when: i => i.systemsDisagree, cap: 0.50 },
  { id: 'C6', when: i => i.boundaryMarginDeg < 0.05, cap: 0.55 },
  { id: 'C7', when: i => i.boundaryMarginDeg < 0.25, cap: 0.68 },
  { id: 'C8', when: i => !i.flags.savCertified, cap: 0.72 },
  { id: 'C9', when: i => !i.flags.ashtakavargaAvailable, cap: 0.75 },
  { id: 'C10', when: i => !i.flags.dedicatedMoonTransit, cap: 0.80 },
  { id: 'C11', when: i => i.judgment.conflictResolution.length >= 3, cap: 0.62 },
];

export interface ConfidenceResult { value: number; cappedBy: string | null; cap: number }

export function deriveConfidenceV2(i: ConfidenceInputs): ConfidenceResult {
  const raw = additiveScore(i.judgment);        // existing arithmetic, extracted verbatim
  const hit = CAPS.find(c => c.when(i));
  const cap = hit?.cap ?? 0.90;
  return { value: Math.max(0.2, Math.min(cap, Number(raw.toFixed(2)))), cappedBy: hit?.id ?? null, cap };
}
```

### 2.5 Card surface

`Verdict.confidence_0_1` stays a number (no breaking change). Add:

```ts
// AnswerCard.types.ts — inside Verdict
confidence_capped_by: string | null;   // 'C3', 'C6', … ; null when no cap fired
confidence_cap: number;                // the ceiling actually applied
```

`confidenceWord()` thresholds must be re-derived against the cap table: with a `0.60` cap, a card can never read "high" (≥0.75). That is correct behaviour, and it is the point.

### 2.6 Gate test — `src/tests/answerCard/confidenceCaps.test.ts`

```ts
it('a mean-motion fallback can never present as better than limited', () => {
  const r = deriveConfidenceV2({ ...base, positionSources: ['local-sidereal', 'mean-motion'] });
  expect(r.cappedBy).toBe('C1');
  expect(r.value).toBeLessThanOrEqual(0.40);
  expect(confidenceWord(r.value, 'en')).toBe('limited');
});

it('pending-golden anchor caps below the "high" word', () => {
  const r = deriveConfidenceV2({ ...base, ayanamsaDegraded: ['anchor-pending-golden'] });
  expect(confidenceWord(r.value, 'en')).not.toBe('high');
});
```

---

## WS-3 · Answer-card source tagging

### 3.1 Why

`AnswerCard.types.ts` declares:

```ts
provenance: { engine_version; ayanamsa: string; house_system; dasha_system; ephemeris: 'local' | 'swisseph'; computed_at; as_of; input_hash; card_hash; source_files: string[] }
```

`ephemeris` is a two-value union that cannot express the real Phase 1 outcomes (`swisseph`, `local-sidereal`, `mean-motion`, `swisseph-endpoint`), and `ayanamsa: string` is untyped prose. A consumer cannot tell a card computed from Swiss Ephemeris from one computed from a polynomial, and there is no field at all for *which ayanamsa system* produced the number — Lahiri is assumed.

### 3.2 Type change (additive — contract 1.2 → 1.3)

```ts
export type EphemerisProvenance = 'swisseph' | 'swisseph-endpoint' | 'local-sidereal' | 'mean-motion';
export type AyanamsaProvenance = 'swisseph' | 'precession-polynomial';

export interface Provenance {
  engine_version: string;
  ayanamsa: string;                    // human label, unchanged
  ayanamsa_system: AyanamsaSystem;     // NEW: 'Lahiri' | 'Raman' | ...
  ayanamsa_source: AyanamsaProvenance; // NEW
  ayanamsa_value: number;              // NEW: degrees actually subtracted
  ayanamsa_degraded: AyanamsaDegraded[]; // NEW
  ephemeris: EphemerisProvenance;      // WIDENED (old values are a subset)
  position_sources: Record<string, EphemerisProvenance>; // NEW: per-graha
  house_system: string;
  dasha_system: string;
  computed_at: string;
  as_of: string;
  input_hash: string;
  card_hash: string;
  source_files: string[];
}
```

Widening `ephemeris` from a 2-value to a 4-value union is source-compatible for readers that only compare against `'swisseph'`; bump `ANSWER_CONTRACT_VERSION` to `'1.3'` and update the three places `guideContract.test.ts` pins.

### 3.3 Populate from the chart, never from a default

```ts
// answerCardBuilder.ts — replace the hardcoded provenance block
const aya = ayanamsaAt(jdUT, ayanamsaSystem);        // from ayanamsaCore
provenance: {
  engine_version: ENGINE_VERSION,
  ayanamsa: `${aya.system} (${AYANAMSA_ENGINE_VERSION})`,
  ayanamsa_system: aya.system,
  ayanamsa_source: aya.source,
  ayanamsa_value: Number(aya.value.toFixed(6)),
  ayanamsa_degraded: aya.degraded,
  ephemeris: dominantSource(positions),               // 'mean-motion' if ANY graha is mean-motion
  position_sources: Object.fromEntries(positions.map(p => [p.graha, p.source])),
  ...
}
```

`dominantSource` returns the **worst** source present, not the modal one. A card with one mean-motion graha is a mean-motion card.

### 3.4 Publish guard — refuse to ship a degraded anchor

`src/services/answerCard/publishGuard.ts` currently guards PII only. Add:

```ts
export function assertProvenancePublishable(rel: string, card: { provenance: Provenance }): void {
  const p = card.provenance;
  if (p.ayanamsa_degraded.includes('anchor-pending-golden')) {
    throw new Error(`REFUSING to publish ${rel}: ayanamsa anchor is pending-golden (${p.ayanamsa_system})`);
  }
  if (p.ephemeris === 'mean-motion') {
    throw new Error(`REFUSING to publish ${rel}: computed from mean-motion fallback`);
  }
}
```

Wire it into `scripts/emitAnswerCards.mjs` beside the existing `assertNoPii()` call. This is the mechanism that makes the Week-1 "flip anchors to golden-locked" work enforceable rather than aspirational: **the gate, not the checklist, is what stops a degraded card from shipping.**

### 3.5 Agent-facing contract

`public/llms.txt` and `public/.well-known/vedic-rajkumar.json` must both advertise `answer_contract: '1.3'` and state the new guarantee, verbatim:

> Every card states which ayanamsa system and which ephemeris produced it. A card whose ayanamsa anchor is not yet locked against Swiss Ephemeris is never published.

---

## Sequencing and file list

| # | File | Change | Week |
|---|---|---|---|
| 1 | `src/api/v1/errors.ts` | NEW | 2 |
| 2 | `src/api/v1/router.ts` | stubs → fail-rules | 2 |
| 3 | `src/tests/api/routerFailRules.test.ts` | NEW | 2 |
| 4 | `src/services/answerCard/confidence.ts` | `deriveConfidenceV2` + cap table | 2 |
| 5 | `src/services/answerCard/AnswerCard.types.ts` | provenance widening, contract 1.3 | 2 |
| 6 | `src/services/answerCard/answerCardBuilder.ts` | populate provenance from engine | 2 |
| 7 | `src/services/answerCard/publishGuard.ts` | `assertProvenancePublishable` | 2 |
| 8 | `scripts/emitAnswerCards.mjs` | call the new guard | 2 |
| 9 | `src/tests/answerCard/confidenceCaps.test.ts` | NEW | 2 |
| 10 | `src/tests/answerCard/guideContract.test.ts` | bump to 1.3 | 2 |
| 11 | `public/llms.txt`, `public/.well-known/vedic-rajkumar.json` | contract 1.3 | 2 |

**Exit criteria for WS-3:** `npm run answers:check` fails on a card with a `pending-golden` anchor; `routerFailRules.test.ts` proves no route returns 200 with placeholder positions; `confidenceCaps.test.ts` proves every cap row fires.
