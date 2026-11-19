# VEDIC RAJKUMAR — LOVABLE ARUDHA LAGNA AUTHENTICITY & INTEGRATION PATCH

**Target repository:** `https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar`  
**Candidate prototype:** `https://lovable.dev/projects/bad8b4ac-523e-4cce-b35f-a41f88027752`  
**Basis:** user-supplied `lovable chat.txt`, reviewed 2026-11-19  
**Decision:** CONDITIONAL ACCEPTANCE — no direct merge or production promotion without evidence.

## 0. Evidence and limits

The Lovable conversation reports a standalone TanStack Start Arudha Lagna forecast workspace, a sign-distance calculator with a Jaimini self/seventh exception, manual planet-influence inputs, bilingual interpretation, a mobile-first UI, regression tests, and a passing typecheck. It also explicitly says the final build log and commit were **not** confirmed and that the linked GitHub repository was **not** modified. The actual prototype source, test output, screenshot and deployment logs were not supplied in the conversation. These are **claims to verify**, not independently established results.

**Do not treat the prototype as a verified calculation authority or deploy it into main without the gates below.**

## 1. Obtain a reproducible candidate snapshot

1. Export or clone the Lovable project into a separate, read-only comparison workspace. Record its commit SHA or export checksum and its license/ownership permissions. If export/access is unavailable, mark the code-port task BLOCKED and use this specification for an independent implementation.
2. Inspect `src/components/ArudhaForecast.tsx`, `src/lib/arudha-forecast.ts`, the Arudha test file, `package.json`, lockfile, route metadata, CSS/theme and dependencies. Record actual file paths rather than assuming they match the chat transcript.
3. Run its install, typecheck, tests and production build with logs and exit codes. Verify the mobile view, keyboard navigation, Hindi text and error states.
4. Audit the target repo's existing Arudha/Aarudh/Arudha Pada, Jaimini, ephemeris, provenance and navigation implementations. **Do not create a second competing calculator if one exists.**
5. Create `reports/LOVABLE_ARUDHA_CAPABILITY_DIFF.md` listing: candidate feature, target equivalent, mathematical parity, source file, evidence, decision (PORT/ADAPT/REJECT/BLOCKED), and owner.

## 2. Deterministic calculation contract (mandatory)

Implement or reuse a pure function that receives **validated sign indices** for ascendant and its lord, with a named calculation convention. The prototype's manual-input mode must be labeled _user-supplied signs_, not a computed birth chart. In automatic mode, use the target application's verified chart and planetary-lord data; never ask an LLM to infer the chart.

The ordinary Arudha rule is sign-distance counting from the reference sign to its lord, then the same distance onward from the lord, with **inclusive sign counting**. For example, with zero-based signs:

```ts
const inclusiveDistance = (from: number, to: number) =>
  ((to - from + 12) % 12) + 1;
const advanceInclusive = (from: number, count: number) =>
  (from + count - 1) % 12;
const distance = inclusiveDistance(lagnaSign, lordSign);
const unadjustedPada = advanceInclusive(lordSign, distance);
```

**Exception handling is not to be guessed.** Jaimini Arudha exceptions and special lordship cases have differing interpretive conventions across traditions. Document the exact adopted reference and rule for a pada landing in the source sign or seventh sign; record alternative conventions and test them separately. Do not silently import the Lovable exception until an authoritative rule review establishes parity with the target engine. Explicitly specify how Scorpio/Aquarius co-lord conventions, if used, are handled.

Return a structured result with: `referenceSign`, `lordSign`, `inclusiveDistance`, `unadjustedPada`, `finalPada`, `exceptionApplied`, `exceptionRuleId`, `tradition`, `inputMode`, `sourceEngineVersion`, and `calculationTrace`. Reject missing/out-of-range inputs.

## 3. Independent test matrix

Create table-driven tests covering all 12 ascendant signs × all 12 possible lord-sign positions, or a documented constrained set if lordship is engine-derived. Check inclusive counting, modulo wraparound, self/seventh exceptions, special lordships, invariance under rotation, invalid inputs, and a set of hand-checked examples from the chosen reference. Compare output with the current app, and investigate every mismatch; do not change the expected value merely to make a test pass.

Separate tests for **mathematical computation**, **traditional interpretation**, **AI narrative**, and **UI interaction**. Record reference text/page or reviewer approval for interpretive rules. An LLM's fluent forecast is not proof of mathematical correctness or predictive validity.

## 4. Integration architecture

Target architecture:

```text
Existing validated chart/ephemeris service
    -> existing or canonical Arudha calculator (pure, tested)
    -> typed ArudhaFacts + trace + convention metadata
    -> deterministic Jaimini interpretation rules
    -> optional bilingual narrative generator (N7)
    -> provenance validator / Raksha N9
    -> existing React/Vite route + reusable UI components
```

Keep the target's current React/Vite routing and design system. **Do not migrate the application to TanStack Start** solely to reuse the prototype. Adapt only compatible TS logic, React presentation and styles. Add a discoverable Arudha forecast entry to the existing feature registry and navigation without replacing `/` or existing routes. Reuse current Hindi/English localization and mobile accessibility patterns.

If manual planet influences are offered, label them as _entered by user_ and distinguish them from computed positions. Do not claim actual graha drishti, rashi drishti, dasha or strength data unless computed by verified modules.

## 5. Forecast excellence: explainability and responsible claims

Present a readable result with Arudha sign, sign-distance steps, applied exception, planetary influences, and sections for public image, recognition, work, resources, relationships, strengths, cautions and practical considerations. Each interpretation must reference one or more actual chart facts and a documented rule. Provide a toggle to show **Why this interpretation? / यह निष्कर्ष क्यों?**

Label forecasts as traditional astrological interpretations, not verified predictions. Do not fabricate event dates, certainty percentages, medical diagnoses, guaranteed marriage or employment outcomes, or invented Shadbala/D9 data. If facts are insufficient, show **Not calculated / गणना उपलब्ध नहीं** rather than filling gaps with AI-generated assertions. Keep optional narratives advisory and culturally respectful, not deterministic or fear-inducing.

## 6. Provenance, privacy and AI boundaries

Integrate with the existing `src/types/provenanceContract.ts` if it exists at the reported baseline; inspect actual exports and invocation points. Every displayed calculated claim should identify `calculationId`, engine/convention version, input mode, calculation trace and evidence links. Validate output **at the production response boundary**, not only in standalone tests.

Do not place real names, dates, times, locations or raw birth charts in public fixtures, client logs, screenshots, analytics, prompt traces or repository reports. Use fully synthetic fixtures and test privacy/redaction. Do not assume a hash alone anonymizes a low-entropy birth record. Require explicit user consent and applicable data-processing controls before sending personal birth data to an external model.

## 7. UI acceptance

- Responsive on 320px, 375px, tablet and desktop; no horizontal overflow.
- Keyboard-only input, visible focus, accessible labels, screen-reader announcements, validation errors and loading states.
- English and Hindi labels, readable Devanagari fonts and no clipped content.
- Manual sign entry and computed-chart modes clearly separated.
- Chart reasoning, convention and provenance visible without developer tools.
- Preserve existing homepage and feature routes; add route/refresh tests for the new feature.

## 8. Release and regression gates

1. Resolve the previously reported intermittent horoscope submission failure and execute all previously blocked serial tests.
2. Run existing typecheck, lint, unit, integration, Arudha matrix, provenance/adversarial, full Playwright E2E and production build. Use actual scripts discovered in `package.json`; do not invent a passing command.
3. Run `npm run validate:accuracy` where configured and preserve its complete result. Verify chart computations against an independent approved reference.
4. Run Lighthouse CI with recorded mobile metrics and accessibility checks.
5. Resolve the previously reported `swisseph-wasm` AGPL licensing decision before production promotion.
6. Verify no new dependency vulnerability, personal-data exposure, route regression or ungrounded AI claim.
7. Keep **HOLD** until all required gates and owner decisions are satisfied.

## 9. Delivery and authorization

Produce:

- `reports/LOVABLE_ARUDHA_CAPABILITY_DIFF.md`
- `reports/ARUDHA_CALCULATION_CONVENTION.md`
- `reports/ARUDHA_REFERENCE_TEST_MATRIX.md`
- `reports/ARUDHA_UI_ACCESSIBILITY.md`
- `reports/ARUDHA_PROVENANCE_VALIDATION.md`
- Updated `reports/FINAL_LAUNCH_CERTIFICATION.md`

For each change, provide file path, before/after behavior, exact command, exit code and test counts. Preserve source evidence and original docs. Work on a dedicated branch. **Do not push, merge, delete source materials, or deploy without explicit authorization.**

## 10. Final decision record

```text
LOVABLE SOURCE ACCESS: VERIFIED / BLOCKED
LOVABLE TYPECHECK: PASS / FAIL / NOT RUN
LOVABLE TESTS: PASS / FAIL / NOT RUN
LOVABLE PRODUCTION BUILD: PASS / FAIL / NOT RUN
ARUDHA RULE CONVENTION: <reference and version>
ARUDHA REFERENCE MATRIX: <passed / total>
TARGET ENGINE PARITY: PASS / FAIL / OPEN
TARGET E2E: <passed / failed / blocked>
PROVENANCE BOUNDARY: VERIFIED / PARTIAL / ABSENT
PRIVACY REVIEW: PASS / FAIL
RELEASE STATUS: HOLD / GO
```
