# ARUDHA PROVENANCE VALIDATION — 2026-11-19 (updated)

**Pipeline:** Birth input → calculateArudhaPada → JaiminiAnalysis → JaiminiPanel → N9 Raksha gate

---

## Production wiring confirmed

| Step | Location | Status |
|---|---|---|
| Provenance type definitions | `src/types/provenanceContract.ts` | ✅ exists, exported |
| validateProvenance() N9 gate | `src/types/provenanceContract.ts:92–126` | ✅ production gate |
| N9 Raksha pipeline | `src/services/navratri/n9Raksha.ts` | ✅ N4→N9, calls validateProvenance |
| useRaksha hook | `src/hooks/useRaksha.ts` | ✅ wired into HoroscopeCard |
| JaiminiPanel N9 gate | `src/components/supplements/JaiminiPanel.tsx` | ✅ runRaksha called in handleSubmit; fails closed on !passed |

---

## Data flow trace

```
JaiminiPanel.handleSubmit()
  → assembleEngineData(bd, lat, lng)        ← deterministic engine
  → runRaksha({ birthDate, birthTime })     ← N4→N9 pipeline
      N4: computeKaal()                      provenance-stamped
      N5: computeBala()                      normalised strength
      N6: computeYukti()                     factor graph
      N7: generateVani()                     bilingual narrative
      N8: enrichWithCitations()              corpus citations
      N9: validateProvenance(envelope)       ← GATE
  → if !raksha.passed: setError(); return   ← fails closed
  → setAnalysis(engineData.jaiminiAnalysis) ← only on PASS
```

The Jaimini interpretation path **cannot bypass** provenance validation.

---

## Negative tests (jaimini-provenance.test.ts — 7/7 PASS)

| Test | Verifies |
|---|---|
| validateProvenance blocks missing engine_version | CALCULATION claims need engine stamp |
| validateProvenance blocks missing input_hash | CALCULATION claims need input hash |
| validateProvenance blocks CALCULATION_UNAVAILABLE planetary claim | Cannot serve unavailable precise astronomy |
| validateProvenance blocks contradictions | Contradictory claims flagged |
| Panel gate contract — !raksha.passed withholds analysis | fail-closed production behaviour |
| Jaimini TRADITIONAL_RULE claim passes without engine_version | Rule-based claims do not need engine stamp |
| Jaimini INTERPRETATION claim passes without engine_version | Interpretive claims do not need engine stamp |

---

## Gaps (documented, not fabricated)

- Arudha pada results carry `rashiIndex/rashiName/meaning` — no per-claim `calculationId` or convention-version field yet. This is a **known gap**, not a fabrication.
- N9 receives `birthDate`/`birthTime` only (no `planets`/`dignities` passed from JaiminiPanel), so N5 Bala returns UNAVAILABLE gracefully — no crash, no invented values.
- Full provenance UI tooltip ("यह निष्कर्ष क्यों?") is backlog per Phase 4 / CODEX2.txt.

---

## Image-axis provenance — fail-closed (v2 §6/§11)

Module `src/services/answerCard/arudhaImage.ts` stamps every `ImageAxis` with a
provenance block and gates its publication through `validateImageProvenance()`.
The checker is **fail-closed**: any malformed or unverifiable stamp withholds the
section rather than defaulting. `buildImageAxis()` itself is ungated (so tests and
future callers can inspect it); the composer only emits the `image-vs-substance`
section after `isImageAxisEnabled()` **and** `validateImageProvenance()` both pass.

Stamped fields: `engine` = `jaiminiService.calculateArudhaPada`,
`version` = `arudha-image-0.1.0`, `convention` = `ARUDHA_CONVENTION`,
`arudha_hash` = `stableHash({ al, target, arudhaFromAl, asc })`,
`status` = `VERIFIED | TRADITIONAL`.

`validateImageProvenance(axis)` rejects (returns `false`) when:

| Condition | Rejected |
|---|---|
| `axis` is `null`/`undefined` | ✅ fail-closed |
| `engine` empty | ✅ |
| `version` empty | ✅ |
| `convention` empty or ≠ `ARUDHA_CONVENTION` | ✅ |
| `arudha_hash` empty | ✅ |
| `status` not in `{VERIFIED, TRADITIONAL}` | ✅ |
| `status === 'TRADITIONAL'` **and** `|gap| ≥ 20` (extreme claim off an unverified convention) | ✅ |

Prashna charts (`referenceType: 'prashna'`) are always stamped `TRADITIONAL`
because the AL rules are natal-only, so an extreme gap on a prashna card is
withheld by construction (v2 §10 — no prashna contamination).

Test coverage: `src/tests/answerCard/arudhaImage.test.ts` — 25 tests, including
the negative/fail-closed matrix above (`arudhaImage — provenance fail-closed`).
