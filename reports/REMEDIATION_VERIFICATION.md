# REMEDIATION VERIFICATION — independent re-check (2026-11-16)

Baseline: `fix/robotic-failure-remediation` @ `a39c27e` (pushed). origin/main
`e379bf5` — remediation branch NOT yet merged.

| Finding                    | Verification method                                                                                                   | Result                                                                           |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Clerk privacy crash        | persona advanced #18 + manual Clerk-key dev-server probe                                                              | PASS — demo mode shows honest card; Clerk-configured mode mounts authed sections |
| Autocomplete obstruction   | persona #15 (suggest-then-submit), NEW #22 (submit while dropdown open), #16 keyboard-only — all without `force:true` | PASS — in-flow listbox ends above submit; direct click and keyboard both work    |
| Invalid date normalization | `dateValidation.test.ts` 17 cases + persona #11–13                                                                    | PASS — impossible dates rejected with visible message                            |
| Date-format inconsistency  | `DATE_INPUT_FORMAT_HINT` on 6 surfaces; Milan strict parser                                                           | PASS                                                                             |
| Offline Panchang           | production preview + SW precache test                                                                                 | PASS                                                                             |
| Home-page 404              | live probe: 0 responses ≥400, 0 requestfailed, 0 console errors                                                       | NOT REPRODUCED                                                                   |
| Robust persona suite       | 22 tests, deterministic PRNG                                                                                          | PASS                                                                             |

**New defect found & fixed this run:** uncommitted exhaustive-deps cleanup added
`handleSubmit`/`isHi`/`toast` to the Index auto-load `useEffect` deps while
`handleSubmit` was still declared _below_ it → TDZ `ReferenceError` would crash
the home page on render. Fixed by moving the `useCallback` above the effect;
`tsc --noEmit` clean.
