# ARUDHA PROVENANCE VALIDATION — 2026-11-19

- `src/types/provenanceContract.ts` exists; `validateProvenance` gate.
- N9 Raksha (`src/services/navratri/n9Raksha.ts`) runs N4→N9 pipeline and
  fails closed on missing engine_version/input_hash or
  CALCULATION_UNAVAILABLE claims.
- `useRaksha` hook wired into HoroscopeCard production render path
  (uncommitted work verified: navratri 32/32 tests PASS).
- Arudha pada results expose rashiIndex/rashiName/meaning; trace-level
  provenance fields (calculationId, convention version) are PARTIAL —
  documented gap, not fabricated.
- Privacy: no birth data in fixtures; synthetic test data only.
