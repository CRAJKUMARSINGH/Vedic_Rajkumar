# Masterstroke Patch — Adoption Audit

**Bundle:** `CODE-JUNCTION/vedic_rajkumar_masterstroke_patch/vedic_masterstroke_patch/`
**Baseline:** `feature/lovable-hub-landing` @ `bb643e5` (in sync with `origin/feature/lovable-hub-landing`; `main` untouched)
**Directive:** *"APPLY PATCH AT …\vedic_masterstroke_patch >>>> synchronise local and remote logically and rationally"*

## Verdict

The bundle is **substantially already implemented** in this repository — in most cases in a form
stronger and better-tested than the proposal. Two items are **unsafe to apply verbatim** and are
declined with evidence. Nothing in the bundle needs to be merged to keep local and remote in sync;
the correct action is to record the disposition (this report) and leave the code as-is.

The bundle was authored from a **shallow clone of the public repo**, not from this working tree
(see `MASTERSTROKE_README.md`), which is why several proposals target state that this branch has
already moved past.

| # | Bundle item | Disposition | Basis |
|---|-------------|-------------|-------|
| 01 | Unify chart renderer (re-export legacy) | **Declined — unsafe** | Legacy file is bound to a *different engine* with a live consumer |
| 02.1 | `applyInputQualityCaps` confidence caps | **Already implemented (stronger)** | `confidence.ts` `deriveConfidenceV2` + 5-cap table + tests |
| 02.2 | `killHedging` regex post-processor | **Declined — not applicable** | Verdict layer is already hedge-free; regex would over-absolutize advisory copy |
| 02.3 | Low-promise early exit | **Already implemented** | `interpretationEngine.ts:395` |
| 03 | Chart geometry bug list | **Already satisfied (with tests)** | Canonical renderer: viewBox, `℞`, testids, overflow |
| 04 | `persona-robot.spec.ts` | **Superseded** | Targets non-existent selectors; shipped suite uses real ones |
| 05 | JATAKS_DATABASE privacy | **Already tracked** | `docs/BUGS_FOUND.md:17` |

---

## 01 — Unify chart renderer · **Declined (unsafe to apply verbatim)**

The patch would replace [`src/components/NorthIndianChart.tsx`](file:///e:/Rajkumar/Vedic_Rajkumar/src/components/NorthIndianChart.tsx)
with a pure re-export of the canonical renderer. That is **not a duplicate** — the two files are
bound to two different engines:

- **Legacy** ([L2–L15](file:///e:/Rajkumar/Vedic_Rajkumar/src/components/NorthIndianChart.tsx#L2-L15)):
  imports `@/lib/vedic/vedicCalc`; props are `chart: ChartData; title?; titleHi?; size?;
  highlightSeventh?; showTransits?; transitPlanets?; id?`; geometry is hard-coded 440-wide
  pixel paths (`HOUSE_PATHS`, e.g. `M 200,20 L 320,140 …`).
- **Canonical** ([`src/features/charts/components/NorthIndianChart.tsx`](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/charts/components/NorthIndianChart.tsx)):
  takes a `ChartViewModel`, again a *different* prop surface.

The legacy component has a **live consumer**: [`KanchiPage.tsx`](file:///e:/Rajkumar/Vedic_Rajkumar/src/pages/KanchiPage.tsx)
uses it 3× ([L209](file:///e:/Rajkumar/Vedic_Rajkumar/src/pages/KanchiPage.tsx#L209),
[L382](file:///e:/Rajkumar/Vedic_Rajkumar/src/pages/KanchiPage.tsx#L382),
[L488](file:///e:/Rajkumar/Vedic_Rajkumar/src/pages/KanchiPage.tsx#L488)) with `chart={d1|d9}`,
`title`, `titleHi`, `size`, `highlightSeventh`, `showTransits`, `transitPlanets`, `id` — none of
which the canonical renderer accepts. A blind re-export would **break the build** and strip the
Kanchi marquee page of its transit/seventh-highlight features.

The change is therefore real refactoring work (migrate `KanchiPage` to the canonical engine + view
model), not a patch application. It is out of scope for this directive and would violate
"keep solutions simple and focused". **Recommendation:** raise as a standalone `feature/` task if
desired; do not apply as-is.

## 02.1 — Input-quality confidence caps · **Already implemented (stronger)**

Patch proposes `applyInputQualityCaps(base, meta)` with integer caps (`!timeKnown → 55`,
`!placeKnown → 45`, `degraded → 60`, `portable → 85`).

This repo already ships a **stronger, signal-based** version:
[`src/services/answerCard/confidence.ts`](file:///e:/Rajkumar/Vedic_Rajkumar/src/services/answerCard/confidence.ts#L101-L116)
defines `deriveConfidenceV2(i)` over a 5-entry `CAPS` table keyed on signals the *canonical* engine
actually emits (`degradedEphemeris`, conflict count, `savCertified`, `ashtakavargaAvailable`,
`dedicatedMoonTransit`), clamped to `[0.2, cap]` with `cappedBy` provenance. It is covered by
[`src/tests/answerCard/confidenceCaps.test.ts`](file:///e:/Rajkumar/Vedic_Rajkumar/src/tests/answerCard/confidenceCaps.test.ts).

The proposal's `meta.timeKnown` / `meta.placeKnown` inputs do not exist on the canonical confidence
path, so adopting the patch would mean adding a second, weaker, parallel cap mechanism. **No change.**

## 02.2 — `killHedging` post-processor · **Declined (not applicable)**

The verdict/answer layer this patch targets is **already hedge-free**:
`grep 'may indicate|could suggest|possibly|perhaps|might be|it appears that'` over
[`interpretationEngine.ts`](file:///e:/Rajkumar/Vedic_Rajkumar/src/services/interpretationEngine.ts)
and [`verdictNormalizer.ts`](file:///e:/Rajkumar/Vedic_Rajkumar/src/services/answerCard/verdictNormalizer.ts)
returns **no matches**.

Hedge words do appear, but only in **matchmaking advisory copy**, where qualification is the correct
register and stripping it would be a correctness regression:

- [`src/lib/mtss/navamsa.ts:269`](file:///e:/Rajkumar/Vedic_Rajkumar/src/lib/mtss/navamsa.ts#L269) —
  *"… in D9 may indicate initial adjustments in married life."*
- [`src/components/supplements/CompatibilityPanel.tsx:860`](file:///e:/Rajkumar/Vedic_Rajkumar/src/components/supplements/CompatibilityPanel.tsx#L860) —
  *"… possibly remediation measures are advised."*

Applying the regex globally would turn clinically-qualified compatibility guidance into false
absolutes. **No change.**

## 02.3 — Low-promise early exit · **Already implemented**

The proposed `if (!natalPromise.promised && confidence < 35) { return … }` already exists as a
structural denial in
[`interpretationEngine.ts:395`](file:///e:/Rajkumar/Vedic_Rajkumar/src/services/interpretationEngine.ts#L395):

> *"The natal chart does not promise `${queryContext}` in a structurally deliverable form.
> No transit, yoga, or Dasha can manufacture what the radix denies."*

A `killHedging`-style absolutization is therefore unnecessary on this path. **No change.**

## 03 — Chart geometry bug list · **Already satisfied (with tests)**

Every concrete defect in `docs/ANSWER_SHORTCOMINGS_AND_CHART_BUGS.md` is already fixed in the
canonical renderer
[`src/features/charts/components/NorthIndianChart.tsx`](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/charts/components/NorthIndianChart.tsx):

| Defect | Status | Evidence |
|--------|--------|----------|
| Non-square viewBox | Fixed | `viewBox="0 0 100 100"` + `preserveAspectRatio="xMidYMid meet"` ([L122](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/charts/components/NorthIndianChart.tsx#L122)) |
| No stable house testids | Fixed | `data-testid={\`house-polygon-${house.house}\`}` ([L162](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/charts/components/NorthIndianChart.tsx#L162)), `ascendant-marker` ([L185](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/charts/components/NorthIndianChart.tsx#L185)) |
| No retrograde glyph | Fixed | `℞` rendered when `p.retrograde` ([L211](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/charts/components/NorthIndianChart.tsx#L211)) |
| Overflow not signalled | Fixed | `data-testid={\`house-${house.house}-overflow\`}` ([L216](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/charts/components/NorthIndianChart.tsx#L216)) |

The shipped `reference_NorthIndianChart.tsx` in the bundle is **byte-identical** to this canonical
file — confirming no delta to apply. **No change.**

## 04 — `persona-robot.spec.ts` · **Superseded**

The bundle's drop-in Playwright suite
(`tests/persona-robot.spec.ts`) targets selectors and routes that **do not exist** in this app:
`page.goto('/kundli')` ([L96](file:///e:/Rajkumar/Vedic_Rajkumar/CODE-JUNCTION/vedic_rajkumar_masterstroke_patch/vedic_masterstroke_patch/tests/persona-robot.spec.ts#L96)),
`kundli-name-input` / `kundli-date-input` / `kundli-time-input` / `kundli-place-input` (L86–L89),
`calculate-kundli-btn` (L91), `lang-toggle-hi` (L100), `executive-verdict`/`answer-card` (L125).

An equivalent suite already ships against the **real** app surface:
[`tests/e2e/robotic/`](file:///e:/Rajkumar/Vedic_Rajkumar/tests/e2e/robotic)
(`basic.spec.ts`, `intermediate.spec.ts`, `advanced.spec.ts`, `_personas.ts`), using the actual
routes/selectors (`/horoscope`, `dob-input`, `lang-toggle`). Dropping the bundle file in would add a
permanently-red suite. **No change.**

## 05 — JATAKS_DATABASE privacy · **Already tracked**

The concern that `src/data/jataks/JATAKS_DATABASE.json` ships birth data to the browser is already
recorded in [`docs/BUGS_FOUND.md:17`](file:///e:/Rajkumar/Vedic_Rajkumar/docs/BUGS_FOUND.md#L17):

> *"… contains records with names, birth dates, birth times, locations, and relationship labels.
> The file is imported into the client application and is served to browsers."*

This is a **confidentiality-order** matter (AGENTS.md rules 1–5), not a patch the bundle can fix
mechanically. It remains an open backlog item. **No change from this bundle.**

---

## Synchronisation outcome

- No code change is warranted by the bundle.
- Local and remote remain in sync: `feature/lovable-hub-landing` @ `bb643e5`, `0/0` vs its upstream;
  `13/0` ahead of `main` (main untouched).
- This audit is committed as a `docs:` change on the feature branch and pushed to
  `origin/feature/lovable-hub-landing` — the "logically and rationally" synchronisation the
  directive asked for: the patch is *accounted for*, not blindly merged.
