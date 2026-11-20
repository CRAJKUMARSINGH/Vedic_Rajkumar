# Prasnalove — 16-Week Delivery Guide (Prashna Kernel Remainder)

<!-- status: DRAFT FOR OWNER REVIEW | owner: @CRAJKUMARSINGH | repo: Vedic_Rajkumar | module: Prasna (horary) -->

> **Read me first.** This guide plans the *remainder* of the Prasnalove program —
> what is left between the kernel that already exists on disk and a shippable,
> sign-off-cleared Prashna feature. It is a schedule of **gated work**, not a
> claim that any of it is done. Three hard pre-ship gates recur throughout
> (§2): **physical-book citation verification**, **owner + pandit sign-off**, and
> **confidentiality**. No week may close with a red gate.

**Provenance of this plan.** The original programme brief (`CODE-JUNCTION/Prasnalove.txt`)
was consumed and deleted under the standing cleanup instruction. This guide
reconstructs the programme from three surviving sources:

1. the `Prasnalove.txt §X` section markers preserved in the kernel file headers;
2. the `D01 — Prashna Marg` domain brief in [V3-CLAUD-ALL](file:///e:/Rajkumar/Vedic_Rajkumar/CODE-JUNCTION/V3-CLAUD-ALL);
3. the landed kernel under [src/features/prashna](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/prashna).

If the owner re-supplies `Prasnalove.txt`, reconcile §1 and §6 against it before
Week 1 and note each deviation.

---

## 0. How to read this guide

- **Phases** group four weeks each. **Weeks** are the unit of work; each has a
  goal, the workstream, a named deliverable, and an exit gate.
- Week numbers are *sequence*, not calendar dates. Two weeks marked
  **parallel-safe** may run concurrently; everything else serialises because it
  touches a shared judgement path (§7).
- Every gate is the raw command from the shared contract. A week does not close
  until its gate is green **and** its sign-off box (§3) is signed.

---

## 1. What "the remainder" is

### 1.1 Landed — deterministic kernel (real code, unit-tested)

| Kernel module | What it computes | Prasnalove ref | Tests |
|---|---|---|---|
| [evidence.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/prashna/kernel/evidence.ts) | `EvidenceBundle` contract, `computed: true` literal, remedy-ladder + guardrail types, `PRASNA_ENGINE_VERSION` | §5.1, §7 | synthesis.test |
| [chart.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/prashna/kernel/chart.ts) | Chart cast over the *one* canonical `calculateChart`; FNV-1a `contentHash` | §3.1, §4, §5 | chart.test |
| [timeline.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/prashna/kernel/timeline.ts) | Ephemeris sunrise/sunset, Vedic weekday from sunrise, Gulika/Mandi window | §3.4, §5.2 | timeline.test, gulika.test |
| [sphutas.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/prashna/kernel/sphutas.ts) | Tri/Chatus/Pancha sphutas; Prana/Deha/Mrityu navamsa sphutas | §5.3 | sphutas.test |
| [arudha.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/prashna/kernel/arudha.ts) | Arudha rashi, Arudha sphuta, navamsa rasi | §5.5 | (in sutras path) |
| [sutras.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/prashna/kernel/sutras.ts) | The five sutras → Jeeva/Roga/Mrityu threads | §5.6 | sutras.test |
| [ashtamangala.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/prashna/kernel/ashtamangala.ts) | Three-heap number, planets, yonis, body zones | §5.7 | ashtamangala.test |
| [pranakshara.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/prashna/kernel/pranakshara.ts) | First-syllable bhuta classification | §5.4 | pranakshara.test |
| [tajika.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/prashna/kernel/tajika.ts) | Deeptamsha orbs, Ithasala/Ishrafa, Kamboola, Nakta/Yamaya, Radda, combustion | §3.6, §5.8 | tajika.test |
| [synthesis.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/prashna/kernel/synthesis.ts) | Weighted verdict + confidence, `STARTING_WEIGHTS` | §5.9 | synthesis.test |
| [citations.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/data/prasna/citations.ts) | Single source of book references, `verified` flag | §1, §2, §4 | (asserted in §4) |
| [friendships.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/data/prasna/friendships.ts) | Naisargika maitri table | §5.6 | sutras.test |

### 1.2 Not landed — the remainder

| # | Gap | Evidence it is open |
|---|---|---|
| R1 | **Public barrel still serves stubs.** `answerPrashna` / `createPrashnaSession` come from [stubs.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/prashna/stubs.ts); the kernel is orphaned (only its own tests import it). | [index.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/prashna/index.ts) L18; `stubs.ts` header "until Week 4/5" |
| R2 | **No topic orchestrator.** Nothing assembles per-topic `EvidenceItem[]` from chart + sutras + tajika + sphutas + ashtamangala + pranakshara, then calls `synthesize`. | no module imports two-or-more kernel files together |
| R3 | **No narration layer.** The §8 rule ("AI may never create evidence; it may only narrate ids in the bundle") has no implementation or fail-closed test. | no narrator in `src/features/prashna/**` |
| R4 | **Remedy ladder unimplemented.** The six rungs (§7) exist only as a `RemedyStep` type. | `evidence.ts` types only |
| R5 | **Two engines, two Lagnas.** [supabase/functions/prashna/index.ts](file:///e:/Rajkumar/Vedic_Rajkumar/supabase/functions/prashna/index.ts) uses a hand-rolled `computePrashnaLagna` (day-of-year + direction) that disagrees with `chart.ts`. | PM §3.1 defect named in `chart.ts` header |
| R6 | **No Prashna UI.** `QuestionPage` does not render an evidence/verdict surface with citation chips. | no `PrashnaResult`/`EvidenceBundle` consumer |
| R7 | **Citations not physically verified.** Several `verified: true` rows assert a Raman TOC match with no page number; `mahaSutra`, pranakshara vowel split, Nakta/Yamaya, and Tarabala placement are all flagged *to confirm*. | [citations.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/data/prasna/citations.ts) L96, L228–257; [sutras.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/prashna/kernel/sutras.ts) L94; [pranakshara.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/prashna/kernel/pranakshara.ts) L60 |
| R8 | **Stale/misleading test.** `week5/prashnaGapFix.test.ts` is titled "uses real engine" but asserts against the stub. | `src/tests/week5/prashnaGapFix.test.ts` L35 |
| R9 | **Confidentiality unproven for Prashna.** `query.asked` (free-text question) is not yet covered by a redaction assertion; the `prashna_sessions` write path needs RLS review. | D01 acceptance in V3-CLAUD-ALL |
| R10 | **No determinism/byte-stability gate** for a Prashna card, and no horary-number boundary handling. | D01 acceptance |
| R11 | **Outcome-weight tuning loop absent.** Weights are static; §5.9/§8 calls for refinement from outcome data. | `synthesis.ts` header |

---

## 2. The three hard pre-ship gates

These are not weeks; they are conditions that must hold at every ship gate.

| Gate | Requirement | Owner |
|---|---|---|
| **G-CITE — Physical-book verification** | Every `citationId` reachable from a shipped verdict resolves to a `Citation` carrying a **page number from the physical printed edition** (Raman's translation). No chapter/§/stanza may be asserted from memory or from a secondary web source. Unverifiable rows stay `verified: false` and render as **"tradition:"** in the UI. | Kernel engineer + **Pandit** |
| **G-SIGN — Owner + Pandit sign-off** | The assembled reading discipline (which rule wins, what is never collapsed) and a sample of emitted cards are reviewed and signed by the **owner** and a **pandit** who owns the physical books. Signatures are recorded in the register (§3.2). | **Owner + Pandit** |
| **G-CONF — Confidentiality** | Prashna serves *no* seed-bank birth data; question text and answer cards are private by default; nothing goes in `public/`; redaction flows only through `redact.ts`; `assertNoPii()` passes on every write. | Kernel engineer |

---

## 3. Sign-off protocol

### 3.1 Roles

- **Owner** (@CRAJKUMARSINGH) — product authority; approves scope, gates, and release.
- **Pandit (domain reviewer)** — holds the physical books; confirms citations and reading discipline.
- **Kernel engineer** — writes the code; presents evidence tables; never self-signs a domain gate.

### 3.2 Sign-off register (living — update as weeks close)

| ID | Decision / artifact | Needs | Due | Signed |
|---|---|---|---|---|
| S1 | `citations.ts` verified-flag audit (every `true` carries a page) | Pandit | W2 | ☐ |
| S2 | Maha sutra encoding confirmed against PM Ch. VI | Pandit | W2 | ☐ |
| S3 | Pranakshara vowel split (e/o short-vs-long) | Pandit | W2 | ☐ |
| S4 | Nakta vs Yamaya faster/slower distinction | Pandit | W2 | ☐ |
| S5 | Tarabala / Chandra Bala placement (Muhurtha, not PM) | Pandit | W2 | ☐ |
| S6 | Topic→house significator mapping (all 11 topics) | Pandit | W6 | ☐ |
| S7 | Remedy-ladder rungs and exclusivity rules | Pandit | W8 | ☐ |
| S8 | Health guardrail wording (`health.referDoctor`) | Owner + Pandit | W8 | ☐ |
| S9 | Narration contract: AI may only narrate bundle ids | Owner | W9 | ☐ |
| S10 | Sample-card reading discipline (20 cards) | Owner + Pandit | W12 | ☐ |
| S11 | Prashna accuracy corpus (golden charts) | Owner | W14 | ☐ |
| S12 | **Ship gate: remainder complete** | Owner + Pandit | W16 | ☐ |

> A week whose gate row is unsigned is **not closed**. Re-opening a signed row
> requires a written note in the week's evidence file.

---

## 4. Citation verification protocol

The kernel already funnels every claim through `citations.ts`. Verification is
mechanical:

1. For each `CITATIONS[id]` with `verified: true`, open the **physical printed
   edition** and record `page` (and confirm `chapter`/`section`/`stanza`).
2. For each `verified: false` row, either (a) find and record the page → promote
   to `verified: true`, or (b) leave it false and confirm the UI prefix is
   `tradition:`.
3. Any rule whose stanza is still unknown must be labelled **TRADITIONAL** at the
   points where it feeds a verdict (V3-CLAUD-ALL shared contract → `<labelling>`).
4. Commit the audit as a table in `reports/PRASNA_CITATION_VERIFICATION.md`
   (columns: id · book · part · chapter · § · stanza · page · verified · signer).
5. Guard it with a test: **every citation id referenced by any evidence-producing
   module must exist in `CITATIONS`**, and **no `verified: true` row may have an
   empty `page`**. This converts the policy into a gate.

Known items to resolve (from code markers):

- `mahaSutra` — provisional encoding; PM Ch. VI to be read in full.
- `pranakshara` — short-vowel (Indra) vs long-vowel (Jala) split.
- `tajika` — Nakta (faster transfers) vs Yamaya (slower collects) share one
  predicate today.
- `muhurtha.tarabala` — belongs to Muhurtha, **not** Prasna Marga Ch. III–IV.
- `prasnaTantra.*` — stanza to be confirmed against the printed edition.

---

## 5. Gate reference (run at the close of every week)

```text
npx tsc --noEmit
npm run lint
npm run test:run
npm run typecheck:edge
npm run test:accuracy:corpus
npm run test:accuracy:varga
npm run test:tz-wiring
npm run answers:emit && npm run answers:check
npm run docs:verify
npm run build
```

Plus the Prasna-specific gate:

```text
npm run test:run -- src/tests/prashna src/tests/questionAnalysis
```

**Rule:** stop at the first red; paste raw output into the week's evidence file.

---

## 6. The 16-week plan

### Phase A — Foundation & citation verification (Weeks 1–4)

**Goal:** the classical basis is verified on paper before any further logic is
written, and the two-engine defect is closed.

| Week | Goal | Work | Deliverable | Exit gate |
|---|---|---|---|---|
| **W1** | Citation audit on paper | Diff `citations.ts` against the printed editions; fill `page` for every `verified: true`; classify the rest as tradition | `reports/PRASNA_CITATION_VERIFICATION.md` | S1 drafted; audit table complete |
| **W2** | **Pandit review #1** | Walk S1–S5 with the pandit; resolve maha sutra, pranakshara vowel split, Nakta/Yamaya, Tarabala placement | Signed register rows S1–S5; code comments updated to confirmed cite | S1–S5 signed; citations test green |
| **W3** | Close the two-engine defect | Route the edge function through the same `buildPrashnaChart`; delete `computePrashnaLagna`; add determinism test (same input → same `contentHash`) | [supabase/functions/prashna/index.ts](file:///e:/Rajkumar/Vedic_Rajkumar/supabase/functions/prashna/index.ts) rewritten on the unified engine | `typecheck:edge` + determinism test green |
| **W4** | Confidentiality + boundaries | Cover `query.asked` in `assertNoPii()`; review `prashna_sessions` RLS; add horary-number boundary (1–249 → 422, no clamp) if that entry path is adopted (see D1 §9) | Redaction test; RLS note | `test:run` green; G-CONF recorded |

### Phase B — Kernel completion (Weeks 5–8)

**Goal:** turn primitives into per-topic evidence and a verdict.

| Week | Goal | Work | Deliverable | Exit gate |
|---|---|---|---|---|
| **W5** | Topic orchestrator (first three) | Build the assembler: chart + sutras + tajika + sphutas + ashtamangala + pranakshara → `EvidenceItem[]` → `synthesize` for **general, marriage(7), career(10)** | `src/features/prashna/kernel/topics/*.ts` | unit tests per topic; all four verdict branches reachable |
| **W6** | Remaining topics | finance(2/11), health(1/6), property(4), travel(3/9/12), litigation(6/7), education, spirituality (11 topics total) | topic modules complete | S6 signed; snapshot tests |
| **W7** | Synthesis, timing, guardrails | Tune `STARTING_WEIGHTS` against worked examples; wire `TimingWindow`; emit guardrails (e.g. `health.referDoctor`) | tuning note + timing tests | weights sum rule + timing tests green |
| **W8** | Remedy ladder | Implement the six rungs (antar-sadhana → seva-dana → vrata → temple → homa → gemstone) with exclusivity rules; gemstone requires a dignity check | `kernel/remedies.ts` | S7, S8 signed; ladder tests green |

### Phase C — Narration, provenance & UI (Weeks 9–12)

**Goal:** narrate only what the kernel proved, and show it safely.

| Week | Goal | Work | Deliverable | Exit gate |
|---|---|---|---|---|
| **W9** | Narration layer | Implement §8: narrator input = `EvidenceBundle` only; output may reference bundle ids only; **fail-closed** if it invents an id; no LLM in a card path | `src/features/prashna/narrate.ts` | S9 signed; fail-closed narration test green |
| **W10** | Prashna results UI | Bilingual (en/hi) result surface: verdict, confidence, evidence chips with `citationLabel()`, "Why?" panel; empty/loading states | `src/features/prashna/components/*` | component tests; a11y checks |
| **W11** | Provenance & redaction | Stamp `engineVersion` + `chartHash`; non-admin responses return verdict only; prove nothing lands in `public/` | provenance test + grep evidence | G-CONF recorded |
| **W12** | **Pandit review #2** | Review 20 sample cards end-to-end against the reading discipline | Signed register row S10; corrections applied | S10 signed |

### Phase D — Integration, outcome loop & ship gate (Weeks 13–16)

**Goal:** ship a gate-cleared feature.

| Week | Goal | Work | Deliverable | Exit gate |
|---|---|---|---|---|
| **W13** | Edge integration & limits | Serve cards from the edge on the unified engine; enforce rate limit; prove the **3/day limit** with an unauthenticated client | edge deploy + proof log | `typecheck:edge`; limit proof |
| **W14** | Prashna accuracy corpus | Add golden Prashna charts (synthetic fixtures only); byte-stability gate for a card | corpus + golden files | S11 signed; corpus gate green |
| **W15** | Outcome-weight harness | Build the §5.9 refinement harness; **weights stay pinned** until real outcome data exists | harness + pinned-weight test | harness test green |
| **W16** | **Ship gate** | Run all gates; assemble evidence table + redaction grep; owner + pandit sign final | Release note + signed register | S12 signed; all gates green |

---

## 7. Dependency graph & parallelisation

- **Serial spine:** W1→W2→W5→W6→W7→W8→W9→W12→W13→W16. These share the judgement
  path (citations → topics → synthesis → narration → integration).
- **Parallel-safe pairs** (from V3-CLAUD-ALL router, applied here): **W3 ∥ W4**,
  **W10 ∥ W11**, and **W14 ∥ W15**.
- **Fan-out rule:** one topic module per branch; never two topics in one PR unless
  the router marks them independent.

---

## 8. Risk register

| Risk | Impact | Mitigation |
|---|---|---|
| Citation claims asserted from memory | Ship a wrong classical authority | G-CITE: page-number-or-nothing; unverified → "tradition" |
| Pandit availability slips | Blocks W2/W6/W8/W12 | Batch questions into two reviews (W2, W12); pre-stage the register |
| Stale stub masquerades as the real engine (R1/R8) | Silent wrong verdicts | Delete/replace the stub at W5; fix the "uses real engine" test title |
| Narration invents evidence (R3) | Hallucinated verdicts | §8 fail-closed test at W9 |
| Confidentiality leak of question text (R9) | Privacy breach | G-CONF; assertNoPii covers `query.asked`; RLS at W4/W11 |
| Weights tuned without data (R11) | False precision | Keep weights pinned until W15 harness + real outcomes |

---

## 9. Open decisions requiring owner input

| ID | Decision | Recommendation |
|---|---|---|
| **D1** | Is the **horary number (1–249)** an entry path, or is the chart always cast from the exact `askedAt` moment? | Keep `askedAt` as the primary path; add horary number only if the UI offers it |
| **D2** | Should **Mrityu-thread** results be shown at all, or only the reworded "period that calls for care"? | Never show verbatim (per §7 guardrail); ship the reworded form |
| **D3** | Who is the named **pandit**, and what edition/page-citation standard do they accept? | Confirm before W1 so the audit has a target |
| **D4** | Does Prashna store sessions in Supabase now (needs RLS + retention policy) or stay stateless for the beta? | Stateless for beta; persistence behind a flag |

---

## 10. Definition of Done (the whole remainder)

The Prasnalove remainder is **done** when **all** hold:

- [ ] Every reachable citation resolves to a `verified: true` row **with a page number**.
- [ ] All 11 topic modules emit `EvidenceItem[]` and reach all four verdict branches distinctly.
- [ ] The single-engine rule holds end-to-end (client == edge == `contentHash`).
- [ ] The narrator only narrates bundle ids and fails closed otherwise.
- [ ] The remedy ladder (§7) is implemented with exclusivity + gemstone dignity checks.
- [ ] `assertNoPii()` passes on every Prashna write; nothing Prashna-specific is in `public/`.
- [ ] Register rows **S1–S12 signed** by the owner and the pandit.
- [ ] `test:run`, `typecheck:edge`, `answers:check`, `docs:verify`, `build` all green.

---

## 11. Week evidence template (copy into each week's close)

```text
Week NN — <goal>
HEAD: <sha>          branch: feature/prasnalove-wNN-<slug>
Deliverable: <path>
Gate: <command> → exit <n> → <tail>
Redaction grep: <result>
Sign-off: S<id> <signed/unsigned>
Open items handed forward: <list>
```

---

**START HERE FIRST — highest blast-radius open item:** verify `citations.ts`
against the physical books (W1/S1). Everything downstream inherits the authority
of those rows; a wrong page number propagates into every verdict the kernel will
ever emit.
