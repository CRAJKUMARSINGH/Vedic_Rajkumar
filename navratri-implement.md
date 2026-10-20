# Navratri Implementation — Making the App **बेजोड़ (Bejod)**

> **Action implementation plan.** Nine layers ("nine nights" of Navratri), each a shakti that the app
> must acquire so it stops being *data-correct but shallow* and becomes **matchless (बेजोड़)**.
>
> - **Status:** 🟢 **EXECUTING** (GO received 2026-10-18) — Phase A · N1 ✅ · N2 🟡 · N3 🟡 (core gaps closed); Phase A gate next
> - **Owner:** Vedic Rajkumar — Product / Engineering
> - **Companion docs:** `app-robustness-testing.md` (logbook, append every 15 min), `docs/launch/pre-launch-daily-test-prompt.md`
> - **Domain rules:** `AGENTS.md` (sidereal Lahiri, Vimshottari, classical Ashtakavarga, services in `src/services/`, hooks in `src/hooks/`, heavy compute in `src/workers/`, bilingual, chart-context-before-AI)

---

## 0. Why this plan exists — context of **Point 5**

In the last analysis the verdict was:

> The app **computes correct data** (Swiss Ephemeris, post-**DEF-003** fix) but has **no narrative /
> synthesis layer**. Answers are **deterministic templates** (`buildNarrativeEn/Hi()` in
> `src/pages/TransitAnalysisPage.tsx`); the "AI" is a **rule-based expert system**; there is **no LLM
> on the user-answer path** (LLM scaffolding exists only for knowledge *ingestion* —
> `supabase/functions/knowledge/index.ts`, OpenAI `gpt-4o` → `knowledge_entries`).

**So the app is fast and reproducible, but not deep.** This plan adds **every missing layer** —
from truth of data → synthesis → human narrative → grounded intelligence → guarantees — to make
the app **बेजोड़**.

**Definition of Bejod (Definition of Done):** a user asks *any* question (EN or HI) and gets, in seconds:
1. **Correct** Lahiri-sidereal data,
2. **Reasoned** synthesis where every claim cites a chart factor,
3. a **personalized bilingual narrative** reading (headline, house-wise, dasha, timing, cautions, remedies),
4. **traceable & defensible** (no invented placements),
5. **reproducible**, with graceful degradation if AI is unavailable.

### 0.1 The **Unable Layers** in Point 5 → Navratri Map

Point 5 named two failing layers; they in turn depend on seven more that are partial. This table makes the
"unable layers" explicit and binds each to the Navratri layer that fixes it.

| # | Unable Layer (Point 5) | Status | Evidence | Navratri fix |
|---|---|---|---|---|
| **U1** | **Narrative Conversion** (data → human reading) | **ABSENT** | only templates `buildNarrativeEn/Hi()` — `src/pages/TransitAnalysisPage.tsx#L1194,L1235`; no `narrativeComposer` service exists | **N7 Vani** |
| **U2** | **Data-Correctness (WASM path)** | **FIXED (DEF-003) + NOW COVERED** ✅ | double-ayanāṁśa bug fixed in `swissEphemerisService.ts`; **new** `wasmPathAccuracy.test.ts` covers the WASM path (135/135 rashi agreement vs 15 reference charts) | **N1 Satya** ✅ |
| **U3** | **Grounding / Citation** | **ABSENT** | verdicts not traced back to any chart factor | **N6 Yukti** |
| **U4** | **User-Answer Intelligence (LLM)** | **ABSENT** | LLM used only for ingestion — `supabase/functions/knowledge/index.ts` | **N8 Buddhi** |
| **U5** | **Personalization** | **PARTIAL** | only `name` + `moonRashiIndex` consumed; full chart context not injected | **N7 + N8** |
| **U6** | **Timing (Pratyantar)** | **PARTIAL** | dasha pages exist; no unified Pratyantar API | **N4 Kaal** |
| **U7** | **Strength-quantification feed** | **PARTIAL** | Shadbala/Ashtakavarga pages exist but are not fed into synthesis | **N5 Bala** |
| **U8** | **Transit reference-frame completeness** | **IMPROVED** 🟡 | Lagna frame + Sade Sati/Ashtama/Kantaka now in transit output; Vedha verified complete. Still open: AV transit points, ingress/egress dates | **N3 Gochar** ✅ core |
| **U9** | **Unified Natal / Divisional core** | **IMPROVED** 🟡 | Bhava Chalit + dignity added; Navamsa/D10 verified. Still open: unified `NatalChart` façade | **N2 Kundli** 🟡 |

**Reading of the map:** Point 5 explicitly named **U1 (narrative — absent)** and **U2 (correctness — was broken)**.
U3–U9 are the **root layers** that make U1 impossible today — the app cannot narrate what it does not
synthesise, ground, personalise, or quantify. **U1+U2 are the symptom; U3–U9 are the cause.** Bejod requires all nine.

---

## 1. Guiding principles

| # | Principle | Source |
|---|---|---|
| P1 | Single source of truth for positions — Swiss Ephemeris + Lahiri ayanāṁśa (no tropical in Vedic paths) | `AGENTS.md` |
| P2 | Every interpretive claim must trace to a computed factor (**grounding**) | new |
| P3 | Deterministic core, AI as optional *polish* — never a dependency | new |
| P4 | Bilingual parity (English + Hindi Devanagari) at every layer | `AGENTS.md` |
| P5 | AI prompts MUST include birth-chart context before querying | `AGENTS.md` |
| P6 | Heavy compute in Web Workers; target Lighthouse > 90 | `AGENTS.md` |
| P7 | No regression: accuracy suite + robustness suite + logbook every phase | this repo |

---

## 2. The Nine Layers (नवरात्रि)

Each layer: **Objective → Current state → What to add → Files → Acceptance**.

### 🌑 N1 — SATYA (Foundation & Data Truth) — ✅ **DONE (2026-10-18)**
- **Objective:** Zero positional error; one audited ephemeris path.
- **Current state:** DEF-003 (double ayanāṁśa subtraction) **FIXED** in `src/services/swissEphemerisService.ts`. The accuracy suite (`src/tests/validation/accuracySuite.test.ts`) does **not** yet exercise the WASM path — gap.
- **Add:**
  - Extend accuracy suite to cover the **WASM path** (`calcPlanetsAccurate` / `calcHousesAccurate`) with sidereal anchors (Mesha Sankranti, a known nativity).
  - Configurable ayanāṁśa (Lahiri default) + ephemeris source indicator (`WASM` vs `fallback`) surfaced in results.
  - Speed/retrograde/combustion flags available everywhere.
- **Files:** `swissEphemerisService.ts`, `ephemerisService.ts`, `src/tests/validation/accuracySuite.test.ts`.
- **Acceptance:** 100% accuracy-suite pass **including WASM coverage**; zero ±24° class errors; source flag present in payloads.
- **Delivered (evidence):**
  - New [wasmPathAccuracy.test.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/tests/validation/wasmPathAccuracy.test.ts) — 13 tests, **13/13 PASS**, covering the runtime-consumed WASM path.
  - `COMPLETE_PLANETARY.ephemerisSource` flag (`'swiss-wasm' | 'fallback'`) added to [ephemerisService.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/services/ephemerisService.ts#L366-L373) and set in both engines.
  - **WASM vs. 15 reference charts: 135/135 planet-rashis = 100%.** Lahiri lock: J2000.0 = 23.857°, 2026 = 24.224°. Sankranti anchor PASS. DEF-003 regression guard (`tropical − sidereal ≡ ayanāṁśa`) PASS.
  - `npm run validate:accuracy` → **155/155**; `npm run test:run` → **1352/1354** (2 pre-existing, unrelated).
  - Remaining sub-item deferred to N7/N9: rolling speed/retrograde/combustion flags **everywhere** (retrograde already present; combustion flag still to surface in narrative payloads).

### 🌒 N2 — KUNDLI (Natal Chart Core) — 🟡 **PARTIAL / CORE GAPS CLOSED (2026-10-18)**
- **Objective:** Complete, classical natal map.
- **Current state:** Lagna + planets via `useChartCalculation.ts`; `houseSystemService.ts`, `rashiService.ts` exist.
- **Add:** 12-bhava (whole-sign **and** Bhava Chalit), Rashi/Nakshatra/**Pada**, planetary **dignity** (exalt/debil/own/moolatrikona), combustion, retrograde; **Divisional charts** (D1, D9 Navamsa, D10, D7). Expose one typed `NatalChart`.
- **Files:** `useChartCalculation.ts`, `accurateHoroscopeService.ts`, `houseSystemService.ts`, `divisionalCharts` services.
- **Acceptance:** every field matches `accuracySuite` reference charts; D9/D10 verified on 3+ nativities.
- **Delivered (evidence):**
  - **N2-A — Dignity gap FIXED:** the runtime WASM path hardcoded `dignity: 'Neutral'` for all 9 planets → now calls the classical [`getPlanetDignity()`](file:///e:/Rajkumar/Vedic_Rajkumar/src/services/ephemerisService.ts#L338-L347) (newly exported) in [swissEphemerisService.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/services/swissEphemerisService.ts#L192-L215).
  - **N2-B — Bhava Chalit ADDED:** new pure layer [`getBhavaChalitHouse()` / `calculateBhavaChalit()`](file:///e:/Rajkumar/Vedic_Rajkumar/src/services/houseSystemService.ts#L236-L279) (cusp-bounded house placement; works for whole-sign/equal/Placidus).
  - **N2-C — verified present:** Nakshatra + **Pada** (`getNakshatraInfo`) and **D9/D10** (`calculateShodashVarga`) confirmed by tests.
  - New suite [natalCoreN2.test.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/tests/validation/natalCoreN2.test.ts) — 10 tests, **10/10 PASS**. Full run **1362/1364** (same 2 pre-existing).
  - **Still open for N2:** combustion flags; a single typed `NatalChart` façade; UI surfacing of the Chalit chart. (Deferred — not blocking Phase A.)

### 🌓 N3 — GOCHAR (Transit Engine) — 🟡 **CORE GAPS CLOSED (2026-10-18)**
- **Objective:** Real daily transits, both reference frames.
- **Current state:** `transitEngine.ts`, `dynamicTransitService.ts` — real ephemeris, Chandrashtama, Double Transit, Vedha, scores.
- **Add:** transit houses **from Lagna _and_ from Moon**; **Sade Sati** phase + **Kantaka/Ashtama Shani**; **Ashtakavarga transit points**; **Vedha** table completeness; per-planet ingress/egress dates.
- **Files:** `transitEngine.ts`, `dynamicTransitService.ts`, `ashtakavarga` services.
- **Acceptance:** transit table reproducible for any date; Chandrashtama & Sade Sati windows verified against anchors.
- **Delivered (evidence):**
  - **N3-1 — Lagna frame ADDED:** `DynamicTransitInput.lagnaRashiIndex?` (optional) → `DynamicTransitOutput.transitsFromLagna` (whole-sign from ascendant). The Moon-frame logic was extracted into one pure, reusable [`computeTransitFrame()`](file:///e:/Rajkumar/Vedic_Rajkumar/src/services/dynamicTransitService.ts#L71-L116) so both frames share a single source of truth.
  - **N3-2 — Shani status ADDED:** new [`computeShaniStatus()`](file:///e:/Rajkumar/Vedic_Rajkumar/src/services/dynamicTransitService.ts#L123-L130) surfaced on every output as `shaniStatus` (Sade Sati phase/severity + Ashtama + Kantaka), reusing the classical [`sadeSati.ts`](file:///e:/Rajkumar/Vedic_Rajkumar/src/astrology/transits/sadeSati.ts) detectors — previously *not* wired into the runtime transit output.
  - **N3-3 — Vedha table VERIFIED complete:** `VEDHA_PAIRS` keys exactly match each planet's `favorableHouses` for all 9 planets (test-enforced).
  - New suite [gocharN3.test.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/tests/validation/gocharN3.test.ts) — 12 tests, **12/12 PASS**. Full run **1374/1376** (+12; same 2 pre-existing). Rajkumar anchor (Saturn in Pisces = 9th from Moon → no Sade Sati) reproduces the earlier weekly reading.
  - **Still open for N3:** Ashtakavarga transit points (BAV/SAV on transiting sign); per-planet ingress/egress dates. (Deferred.)

### 🌔 N4 — KAAL (Timing / Dasha)
- **Objective:** When, not just whether.
- **Current state:** Vimshottari dasha pages/services exist (`DashaPage`, `DashaTimelinePage`, `DashaTransitCorrelationPage`).
- **Add:** Maha/Antar/**Pratyantar** unified API; **Dasha–Transit correlation**; **Varshaphal** (annual) hookup; timing-window extraction (start/peak/end).
- **Files:** dasha services + `DashaTransitCorrelationPage.tsx`, `VarshaphalPage.tsx`.
- **Acceptance:** dasha seed lord verified per `accuracySuite`; timing windows returned as data (not only UI).

### 🌕 N5 — BALA (Strength)
- **Objective:** Quantify how strong each factor is.
- **Current state:** `AshtakavargaPage.tsx`, `AshtakavargaClassicalPage.tsx`, `PlanetaryStrengthPage.tsx`, `ShadbalaSupplementPage.tsx`.
- **Add:** **Shadbala** (6 components), **Ashtakavarga** BAV/SAV, **Bhava Bala**, **Ishta/Kashta phala**; feed strength weights into N6.
- **Files:** ashtakavarga/shadbala services (workers for heavy loops).
- **Acceptance:** SAV totals follow BPHS; strength values match reference tables.

### 🌖 N6 — YUKTI (Synthesis / Convergence)
- **Objective:** Merge all factors into one reasoned verdict.
- **Current state:** `interpretationEngine.ts` (13-layer orchestrator: Shadbala, Dasha, Yoga, Jaimini, Divisional, Aspects, Double Transit, Arudha) + `classicalAnswerEngine.ts` + `subjective-analysis-engine.ts` (its `getTargetHouse` bug fixed).
- **Add:** a **factor graph** — every conclusion stores the exact factors + weights that produced it; **confidence score**; **conflict resolution** rules; deterministic only.
- **Files:** `interpretationEngine.ts`, `classicalAnswerEngine.ts`, `src/lib/astrology/subjective-analysis-engine.ts`.
- **Acceptance:** every verdict returns a **citation list** of chart factors; no conclusion without ≥1 factor.

### 🌗 N7 — VANI (Narrative Composer) ← **the missing layer from Point 5**
- **Objective:** Turn the factor graph into a **human, personalized bilingual reading** — the thing the app currently cannot do.
- **Current state:** only rigid templates (`buildNarrativeEn/Hi()`), score + planet lists.
- **Add:** new **`src/services/narrativeComposer.ts`** — a **deterministic, LLM-free** composer that renders:
  1. **Headline** (the week's/period's dominant theme),
  2. **House-by-house** interpretation (from Lagna & Moon),
  3. **Dasha context** (Mahadasha/Antardasha),
  4. **Timing windows** (favourable / caution / Chandrashtama),
  5. **Cautions** (Sade Sati, Vedha, weak planets),
  6. **Remedies** (classical, per afflicted factor),
  7. **Verdict summary** — all in **EN + HI** with tone control.
  - Rule catalogue (classical) keyed to factors — curated, versioned, testable.
- **Files (new):** `src/services/narrativeComposer.ts`, `src/data/narrativeRules.en.ts`, `src/data/narrativeRules.hi.ts`; wire into `TransitAnalysisPage.tsx`, `QuestionPage.tsx`, `LandingPageV3.tsx` result view.
- **Acceptance:** for any chart+date, output is a coherent multi-section reading in EN & HI; **golden-snapshot tests**; 0 network calls.

### 🌘 N8 — BUDDHI (Knowledge RAG + Grounded Intelligence)
- **Objective:** Optional, grounded, streaming intelligence on top of VANI.
- **Current state:** `knowledge_entries` table + OpenAI `gpt-4o` ingestion only; **no user-answer LLM, no embeddings/vector search**.
- **Add:**
  - `pgvector` column + embeddings on `knowledge_entries`; retriever service (classical corpus: BPHS, Phaladeepika, Saravali, KNOWLEDGE_BASE).
  - Edge function `narrate` (mirrors `knowledge/`): receives **pre-computed factors** (P5) → retrieves rules → asks LLM to **polish VANI output only**, never to invent placements; **streams** (per `AGENTS.md`).
  - **Guardrail:** reject any AI sentence not grounded in supplied factors; **auto-fallback to N7** on failure/offline.
- **Files (new):** `supabase/functions/narrate/index.ts`, `supabase/migrations/*pgvector*`, `src/services/narrativeAi.ts` (with streaming + abort).
- **Acceptance:** AI answers cite only provided factors; offline/flag-off reproduces N7 verbatim; streaming latency budget met.

### 🌑 N9 — RAKSHA (Quality, Robustness & Observability) — **the Bejod gate**
- **Objective:** Guarantee the whole stack stays matchless.
- **Current state:** Vitest (~1341 tests), Playwright robustness harness, `realLifeQuestions108.ts`, G0–G6 launch prompt, logbook.
- **Add:**
  - **Grounding tests** (every factor cited), **golden narrative snapshots** (EN/HI), **WASM-path accuracy** tests.
  - Wire the **108-question bank** into robustness spec; run the **G0–G6** gates each release.
  - Observability/telemetry via existing `supabase/functions/_shared/observability.ts`; a11y checks; mobile perf budget.
- **Files:** `src/tests/**`, `tests/e2e/robustness-random-birth.spec.ts`, `app-robustness-testing.md`.
- **Acceptance:** GO on all G0–G6; logbook current; no STOP-THE-LAUNCH items open.

---

## 3. Phasing & Gates

| Phase | Layers | Theme | Exit gate |
|---|---|---|---|
| **A** | N1–N3 | **Satya — Data Truth** | Accuracy suite (incl. WASM) 100% |
| **B** | N4–N6 | **Yukti — Synthesis** | Every verdict factor-cited |
| **C** | N7 | **Vani — Narrative** | EN/HI golden snapshots pass |
| **D** | N8 | **Buddhi — Intelligence** | Grounded + streaming; offline fallback |
| **E** | N9 | **Raksha — Bejod Gate** | G0–G6 GO; logbook closed |

After **every** phase: run `npm run validate:accuracy`, `npm run test:run`, append a `app-robustness-testing.md` entry (DEF register updated).

---

## 4. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| LLM hallucinates placements | N8 grounding + N7 deterministic fallback (P3) |
| Ayanāṁśa drift / regression | N1 locks + WASM-path tests; source flag |
| Narrative becomes boilerplate | N7 factor-keyed rule catalogue + snapshots; tone control |
| Mobile performance drops | Workers, lazy routes, Lighthouse budget (P6) |
| Scope creep across 9 layers | Phase gates (A–E) with GO/NO-GO |
| Bilingual drift | Parallel EN/HI rule files; parity tests |

---

## 5. Definition of **बेजोड़ (Bejod)** — final checklist

- [ ] Any question, any nativity, any date → correct Lahiri data (N1–N5)
- [ ] Reasoning grounded — every claim cites a factor (N6)
- [ ] Personalized **bilingual narrative** reading, not a template dump (N7)
- [ ] Optional AI **polish**, grounded & streamed, with fail-safe (N8)
- [ ] Guaranteed by tests + G0–G6 + logbook (N9)
- [ ] Answers *both* the numbers **and** the meaning — this is what the app lacks today (Point 5).

---

*Drafted for review. On GO, execution begins at **Phase A · N1**, and this document is tracked via `app-robustness-testing.md`.*
