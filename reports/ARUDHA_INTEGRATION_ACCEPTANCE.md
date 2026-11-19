# ARUDHA INTEGRATION ACCEPTANCE — 2026-11-19

Files modified/added by this integration:
- src/tests/arudha.test.ts (NEW, 148 tests)
- src/services/navratri/{n4Kaal,n5Bala,n6Yukti,n7Vani,n8Buddhi,n9Raksha}.ts (NEW)
- src/hooks/useRaksha.ts (NEW)
- src/components/HoroscopeCard.tsx (N9 gate wiring)
- src/services/geocodingService.ts (cache/preload refinement)
- tests/e2e/robustness-random-birth.spec.ts (settle-wait + 240s budget)
- reports/ARUDHA_* + LOVABLE_ARUDHA_CAPABILITY_DIFF + this file

Gates: arudha 148/148 · navratri 32/32 · typecheck 0 · e2e 145/145 (pre-patch)
Build: pending this commit · accuracy/Lighthouse: CI backlog.
UI transparency toggle ("यह निष्कर्ष क्यों?"): PARTIAL — interpretive
sections exist in JaiminiPanel; per-claim provenance tooltip is backlog.
Exception convention: OPEN (unreachable +10 — needs authoritative review).
STATUS: HOLD per §11 (AGPL + exception + accuracy gates unresolved).

## Continuation update — 2026-11-19 (CODEX phases 4–6)

- Phase 4 DONE: `JaiminiPanel.PadaCard` expanded view now includes a
  "यह निष्कर्ष क्यों? / Why this conclusion?" `<details>` block showing
  calculated fact (sign + engine + convention), interpretation rule,
  convention note (+10 unreachable — OPEN), and interpretive-not-certain
  disclaimer. Applies to AL/UL/A4/A10 cards on `/supplements/jaimini`.
- Phase 5 DONE: `JaiminiPanel.handleSubmit` now awaits `runRaksha`
  (N4→N9 pipeline → validateProvenance) and fails closed — analysis is
  withheld with block reasons when `passed=false`.
- Phase 5 tests: `src/tests/jaimini-provenance.test.ts` — 7 tests covering
  well-formed claims, missing calculation metadata, fabricated certainty
  under CALCULATION_UNAVAILABLE, contradictions, interpretive claims,
  EN/HI, and the fail-closed contract.
- Phase 6: a11y — new control uses native `<details>/<summary>` (keyboard
  + screen-reader accessible by default); existing tab buttons/cards are
  `<button>` elements. Automated axe sweep remains backlog; no confirmed
  high-severity defects introduced.
- Tests: arudha 148 + navratri 32 + provenance 7 = 187/187 PASS.
  Typecheck exit 0. Lint 0 errors (4 pre-existing warnings in file).
- Convention: unchanged (OPEN pending owner sign-off — recommendation
  documented in ARUDHA_CALCULATION_CONVENTION.md).
- AGPL: decision record already in reports/RELEASE_CONDITIONS.md —
  owner decision still required.
