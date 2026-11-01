# Beta Bug Log — rolling ledger

The single source of truth for bugs found during pre-launch beta testing.
Complements the per-finding prose in [docs/BUGS_FOUND.md](../BUGS_FOUND.md) and the
append-only robot logbook in [app-robustness-testing.md](../../app-robustness-testing.md).

**Confidentiality.** A row carries a `chart_id` / `fixture_id` and nothing else.
Birth date, birth time, place and coordinates never appear here (AGENTS.md standing
order). If a report arrives with birth data, redact it before logging.

## How to use

1. A tester files a report — GitHub **🧪 Beta Bug** issue form or the in-app
   reporter. Both require a `chart_id`.
2. Triage assigns a **BETA-nnn** id (monotonic; never reused) and a severity:
   - **SEV1** blocker — app unusable, crash, data loss, auth bypass.
   - **SEV2** high — wrong output for common inputs.
   - **SEV3** medium — wrong output in an edge case, rough UX.
   - **SEV4** low — cosmetic, typo, wording.
3. Add a row here. The **Regression test** column must name a deterministic test
   path before the row can move to `fixed`.
4. A row is `fixed` only when that test fails on the pre-fix commit and passes
   after — no retry-to-pass.

## Ledger

| ID      | Severity | Cohort | Area                   | Chart / fixture ID | Status | Fix SHA      | Regression test                                                                                             |
| ------- | -------- | ------ | ---------------------- | ------------------ | ------ | ------------ | ----------------------------------------------------------------------------------------------------------- |
| DEF-013 | SEV2     | all    | Kundli / Birth Chart   | local-fixture      | fixed  | _see branch_ | `tests/e2e/robustness-random-birth.spec.ts` — "location suggestions do not block the primary submit action" |
| DEF-014 | SEV3     | all    | Trial / Entitlement    | local-fixture      | fixed  | _see branch_ | `tests/e2e/tier-matrix.spec.ts`                                                                             |
| DEF-015 | SEV2     | all    | Sign-in / Registration | n/a (backend)      | fixed  | _see branch_ | `src/tests/beta/userFeedbackSink.test.ts`                                                                   |

The three rows above are carried over from the robotic batteries (they are
`DEF-` ids, not `BETA-` ids, because they were found by a robot, not a tester).
New tester reports take `BETA-nnn`.

### Notes on the rows above

- **DEF-013** — location-suggestion dropdown swallowed the first submit click.
  Fixed by moving the list into normal flow and closing on `click`, not `mousedown`.
- **DEF-014** — tier robot read the lazy `/app` route before mount, giving false
  red/green. Fixed with a `tier-badge` visibility anchor + retrying `toHaveCount`.
- **DEF-015** — `sendToBackend()` was a `localStorage` mock, so in-app reports never
  left the browser. Now wired to the `submit-feedback` edge function → private
  `public.user_feedback` table (`20261127_user_feedback.sql`; RLS deny-by-default,
  author + owner/admin read only; `user_id`/`tier` derived server-side). Screenshot
  upload and the retention/consent policy remain open (see playbook §8.1).

## Severity → response target

| Severity | Acknowledgement | Fix target                          |
| -------- | --------------- | ----------------------------------- |
| SEV1     | same day        | hotfix, beta paused until verified  |
| SEV2     | 1 working day   | next beta build                     |
| SEV3     | 2 working days  | next beta build or triaged as known |
| SEV4     | best effort     | batched into a cosmetic pass        |
