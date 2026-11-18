# Pre-Launch User-Testing Playbook (Step by Step)

**Repo:** <https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar>
**Companion doc:** [pre-launch-daily-test-prompt.md](file:///c:/Users/Rajkumar/Vedic_Rajkumar/docs/launch/pre-launch-daily-test-prompt.md) (the robotic gate matrix G0–G6)
**Defect registry of record:** [app-robustness-testing.md](file:///c:/Users/Rajkumar/Vedic_Rajkumar/app-robustness-testing.md) §6 (`DEF-xxx`)

> **Status legend.** **MEASURED** = produced by a command run against this checkout on 2026-10-31 and
> captured in `reports/`. **PROPOSED** = a starting point for your approval, not an existing product
> rule. Cohort sizes, thresholds, timelines and rewards are **PROPOSED** unless marked MEASURED.

> **Confidentiality (hard constraint).** Per [AGENTS.md](file:///c:/Users/Rajkumar/Vedic_Rajkumar/AGENTS.md),
> seed-bank birth data and anything derived from it is private. No tester's real DOB/TOB/place/coords,
> emails or screenshots may enter this public repo, a public GitHub issue, a URL or a log. Use
> synthetic birth data for reproduction; keep private evidence in a private sink.

---

## §0 — What already exists (so the steps only add what is missing)

| Capability | Reality in this repo (verified) | Verdict |
| --- | --- | --- |
| Registration | Clerk `<SignUp>` at `/sign-up/*` ([SignUpPage.tsx](file:///c:/Users/Rajkumar/Vedic_Rajkumar/src/pages/SignUpPage.tsx)), sign-in linked from [Providers.tsx](file:///c:/Users/Rajkumar/Vedic_Rajkumar/src/Providers.tsx#L105) | **exists** — reuse it |
| Tier model | internal `UserTier` (`anonymous\|registered\|premium\|practitioner`), API tier (`free\|developer\|enterprise`), plan (`free\|pro`) | **exists** — see [TIER_MATRIX.md](file:///c:/Users/Rajkumar/Vedic_Rajkumar/docs/testing/TIER_MATRIX.md) |
| Robots | robustness (random births + Prashna) and tier robots exist and run | **exists** — §2 |
| Bug capture | [UserFeedbackWidget.tsx](file:///c:/Users/Rajkumar/Vedic_Rajkumar/src/components/UserFeedbackWidget.tsx) UI exists, but [userFeedbackService.ts](file:///c:/Users/Rajkumar/Vedic_Rajkumar/src/services/userFeedbackService.ts) `sendToBackend()` is a **mock** and persists to `localStorage` only | **gap — DEF-015** |
| Trial clock | no `/beta` route, no invite-code system, no `trial_end` table; only an unused `trialEndsAt?: Date` field in [enterpriseSaaSService.ts](file:///c:/Users/Rajkumar/Vedic_Rajkumar/src/services/enterpriseSaaSService.ts#L160) | **gap — §5** |
| Server-authoritative allowance | `weekly_drive_grants` table, RLS, idempotent `grant_weekly_drive()`, atomic `consume_weekly_drive()` ([20261027_weekly_drive.sql](file:///c:/Users/Rajkumar/Vedic_Rajkumar/supabase/migrations/20261027_weekly_drive.sql)) | **exists** — the pattern to copy for the trial |

**Do not build a second identity system, a second feedback widget, or a client-side entitlement gate.**
In-app checks are UX, not a security boundary.

---

## §1 — Step 1 · Classify testers into three tiers

### 1.1 Tier definitions

| Tier | Prior astrology knowledge | Experience | Depth of questions | What they test best |
| --- | --- | --- | --- | --- |
| **Nascent** | Sun sign / Rashi only | 0–1 yr, never cast a chart | *"What is my rashi?"*, *"Is today good for me?"* | Onboarding, clarity, Hindi/English, navigation, trust |
| **Intermediate** | Lagna, Nakshatra, Dasha, houses | 1–5 yr, uses other apps | *"Why Rohini not Krittika?"*, *"Which Mahadasha now?"* | Chart correctness vs other apps, Panchang, Dasha, Kundli Milan |
| **Advanced** | Jyotishi / scholar (Parashari + KP / Jaimini) | 5+ yr, consults clients | *"Lahiri vs KP ayanamsa?"*, *"D9/D10 accuracy?"*, *"Retrograde at sign boundary?"* | Calculation accuracy, edge cases, terminology, yogas |

### 1.2 Screening questionnaire (auto-tiering)

Eight questions, each scored **0–2**, total **0–16**. Auto-score Q1–Q7; a reviewer scores Q8.

1. Do you know your Lagna? (No 0 · Yes 1 · Yes + degree 2)
2. Do you know your Janma Nakshatra **and** pada? (Neither 0 · Nakshatra 1 · both 2)
3. Can you explain Vimshottari Dasha? (No 0 · basic 1 · with a worked example 2)
4. Have you read a divisional chart (D9/D10)? (Never 0 · with help 1 · independently 2)
5. Years studying/practising astrology (<1 → 0 · 1–5 → 1 · >5 → 2)
6. Do you consult others professionally? (No 0 · sometimes 1 · regularly 2)
7. Can you explain *ayanamsa*? (Don't know 0 · names a setting 1 · explains impact / compares schools 2) — **do not favour one school**
8. Free text: *"Ask one question you would like this app to answer."* Reviewer scores **question depth**: 0 = simple identification/general outcome · 1 = comparison or explanation of a named concept · 2 = multi-step reasoning with settings, timing, evidence or boundary cases.

**Score → tier (PROPOSED):** `0–5` Nascent · `6–11` Intermediate · `12–16` Advanced.
Tenure and professional status are **supporting** signals only — never assign a tier on years alone.
Allow a reviewer override when Q8 clearly points elsewhere.

### 1.3 Cohort mix (PROPOSED)

- **30–60 testers total: 40 % Nascent · 35 % Intermediate · 25 % Advanced.**
- Cover mobile **and** desktop, Hindi **and** English, metro **and** rural, plus **birth places outside
  India** (timezone coverage). Keep a **separate quota per tier**; review borderline scores.

---

## §2 — Step 2 · How to test

### 2.1 Produced task scripts (one per tier)

**Nascent (~30 min)** — 1) Register and log in · 2) Enter birth details · 3) Find Rashi, Nakshatra and
today's Panchang · 4) Read one prediction and rate its clarity 1–5 · 5) Switch language and theme ·
6) Free text: *"Was anything confusing?"*

**Intermediate (~45 min)** — 1) Create charts for yourself and two family members · 2) Check Lagna,
Moon sign, Nakshatra and the current Dasha against an app you trust · 3) Run Kundli Milan (8 Ashta
Koota, 36 points) for a known couple · 4) Check Tithi, Yoga, Karana, Rahu Kaal for your city ·
5) Report every mismatch with the other app's value.

**Advanced (60–90 min)** — 1) Edge-case charts: birth **before 1950**, a **DST** country (USA/UK), a
**high latitude** (Oslo), **midnight** birth, a planet at **29°59′** · 2) Verify ayanamsa setting,
retrograde/combustion flags, D9/D10, Dasha balance at birth · 3) Compare **5 charts** against
Jagannatha Hora / Swiss Ephemeris · 4) Review terminology and yoga logic · 5) Ask deep multi-part
questions of the answer layer.

> Moderator the first 3 testers per tier; ask them to think aloud without coaching; record completion,
> time, errors and help requests. Use only features actually enabled in the beta.
>
> For cross-app comparisons, match **birth input, historical timezone/DST, coordinates, ayanamsa,
> ephemeris/frame, house system and date convention** first. A disagreement is a discrepancy to
> investigate, **not automatically a bug** — experts must agree the reference cases and tolerances
> before scoring. Agreement does not establish the truth of a prediction.

### 2.2 The robotic battery (run identically for every build)

The robot is defined by the gate matrix; run it **in order** and keep the artifacts.

| Gate | Command | Blocking | Result on 2026-10-31 (**MEASURED**) |
| --- | --- | --- | --- |
| G0 static | `npm run typecheck` · `npm run lint` | typecheck yes | typecheck **exit 0**; lint **0 errors / 1258 warnings** |
| G1 unit/integration | `npm run test:run` | yes | **2063 passed**; 1 suite failed (`festivals.golden.test.ts`, env-only) |
| G2 accuracy | `npm run validate:accuracy` | yes | **155/155 PASS**, exit 0 |
| G3 a11y | `npm run test:a11y` | yes | **17/17 PASS**, exit 0 |
| G4 build | `npm run build` | yes | **built in 38.76 s**, `dist/` emitted |
| G5 robustness | `npx playwright test --config=playwright.robustness.config.ts` | yes | **24/24 PASS** |
| G5b tier robot | `npx playwright test --config=playwright.tiers.config.ts` | yes | **15 passed / 0 failed / 9 fixme-skipped** |
| G6 perf (periodic) | `npm run test:perf` | weekly | not run |

**Start the dev server in a separate terminal first** (`npm run dev -- --host 127.0.0.1`), and clear CI
so Playwright reuses it: `$env:CI=$null`. Evidence lives in `reports/robustness/*.log`,
`reports/robustness/report.json`, `reports/tiers/{free,pro,enterprise}.json`.

What the robots actually exercise:

- **G5** feeds **seeded** random birth data (`mulberry32`, dates 1930–2024) into `/horoscope` and asserts
  a result renders, then pushes **17 multidimensional Prashna questions** — career, marriage, finance,
  property, legal, health, children, spiritual, travel, plus **Hindi (Devanagari)**, **emoji / mixed
  script**, **oversized** and **numeric-garbage** inputs — asserting a verdict renders and
  `pageErrors` is empty.
- **G5b** drives the three grades (free / pro / enterprise) against `/app` and asserts the
  `tier-badge`, `upgrade-banner`, and `weekly-drive-card` agree with the grade persona
  ([tierSessions.ts](file:///c:/Users/Rajkumar/Vedic_Rajkumar/tests/e2e/fixtures/tierSessions.ts)).

### 2.3 What to measure (PROPOSED thresholds)

- Task success rate per tier (≥ 90 % Nascent · ≥ 85 % Intermediate · ≥ 90 % Advanced on agreed expert tasks — **report denominators**).
- Accuracy match rate against agreed reference cases and tolerances (≥ 99 %; **zero** unresolved critical boundary errors).
- SUS (10-item, 0–100) ≥ 70 · NPS at end of week.
- Crash-free sessions ≥ 99.5 % (use telemetry that is actually configured).

---

## §3 — Step 3 · Record the bugs found

### 3.1 One in-app channel, centrally stored (**prerequisite: DEF-015**)

Extend the existing [UserFeedbackWidget.tsx](file:///c:/Users/Rajkumar/Vedic_Rajkumar/src/components/UserFeedbackWidget.tsx) — do **not** add a second widget — and replace the mock
sender in [userFeedbackService.ts](file:///c:/Users/Rajkumar/Vedic_Rajkumar/src/services/userFeedbackService.ts) with a real private sink. Fields per report:
tester id + **server-derived** tier · page URL / device / browser / app version (automatic) · **synthetic**
birth input for reproduction · expected vs actual (e.g. *"AstroSage: Rohini pada 2; app: pada 3"*) ·
optional screenshot · category **Accuracy | Crash | UI | Language | Performance | Payment | Other**.

**Permissions:** testers may insert and read **their own** rows; only authorised staff change severity,
owner, status or links. Derive identity and tier **on the server**. Enable RLS; test cross-user denial.
Store screenshots in a **private** bucket with size/type limits and short-lived links.

**Privacy:** prefer synthetic test cases; obtain explicit permission for anyone else's data; strip
private inputs from URLs and logs; define retention/deletion and consent **before** recruiting.

### 3.2 Severity scale

| Level | Meaning | Example | Fix target |
| --- | --- | --- | --- |
| **S1 Blocker** | Wrong core calculation, crash, data loss, broken login | Wrong Lagna | same day (24 h) |
| **S2 Major** | Feature broken, workaround exists | Matching score wrong | 3 days |
| **S3 Minor** | UI glitch / confusing text | Hindi text overflow | before launch |
| **S4 Cosmetic** | Polish | Icon alignment | backlog |

Severity depends on **impact, reach and reproducibility** — never on which tier reported it. Separate
calculation defects from interpretation/content concerns, usability issues and feature requests.

### 3.3 Copy confirmed bugs into the two registries

1. **`DEF-xxx` in [app-robustness-testing.md](file:///c:/Users/Rajkumar/Vedic_Rajkumar/app-robustness-testing.md) §6** — the internal defect register of record (append-only).
   Every robot-discovered defect lands here with severity, status and an evidence path.
2. **GitHub Issues** — labels `tier:nascent|intermediate|advanced`, `sev:S1..S4`,
   `area:accuracy|ui|i18n|perf`, `source:beta`; an issue template with **redacted** steps and
   **synthetic** input. **Never** put real tester birth data in the public repo. Track on a project
   board: *New → Triaged → In Progress → Fixed → Verified*, with the issue URL stored back on the report.

---

## §4 — Step 4 · Remove the bugs

**Fix loop**

1. **Reproduce** with the tester's exact input (synthetic twin, never the real person's data).
2. **Write a failing test first** — Vitest for logic/accuracy, Playwright for flows. (Both defects below were fixed this way.)
3. **Fix** on a branch `fix/<issue-no>-short-name`.
4. **Run CI:** typecheck · lint · `test:run` · accuracy · a11y · build · robustness.
5. **Open a PR** referencing the issue (*"Fixes #123"*); CODEOWNERS reviews. Merge to `main` **only via PR**.
6. **Deploy** to a beta surface (Netlify preview or `beta.` subdomain).
7. **Reporter re-tests** → *Verified* → close.
8. **Log** in `CHANGELOG.md` and the weekly beta release notes.

**Release rhythm during the week (PROPOSED):** hotfix S1 same day · bundle S2/S3 into one release on
Day 3 and another on Day 6 · **freeze scope to fixes only** — no new features mid-trial.

### Worked example — two defects the robot found and fixed on 2026-10-31

| | DEF-013 (High, **FIXED**) | DEF-014 (High, **FIXED**) |
| --- | --- | --- |
| Symptom | Submitting the birth form did nothing on the first click | Tier robot: free grade banner "missing"; paid grades "absent" |
| Root cause | Suggestion list was an overlay on the submit button; moved to normal flow, but the outside-click handler closed it on `mousedown`, collapsing ~200 px **between** mousedown and mouseup → the browser attributed the click to the form ancestor, so `onSubmit` never fired | `count()` read before the **lazy `/app`** route mounted (page still on the "Loading…" fallback; `MainLayout` drops its banner shell on `/app`) → free **false-red**, paid **false-greens** |
| Fix | Normal-flow list + `data-testid="location-suggestions"`; close on **`click`**, not `mousedown` | `beforeEach` waits for the `tier-badge` mount anchor; banner check uses a retrying `toHaveCount` |
| Regression | `location suggestions do not block the primary submit action` | mount anchor + retrying assertion (evidence in `reports/tiers/*.json`) |

Both are now pinned by tests; the robustness suite runs **24/24** and the tier robot **15/15**.

---

## §5 — Step 5 · Registration and the 7-day trial

> Today: registration is **Clerk** at `/sign-up`; there is **no** `/beta` route, no invite-code system
> and no trial table. The design below is **PROPOSED** and reuses the proven server-authoritative
> pattern already shipped for the weekly allowance.

### 5.1 Registration flow (PROPOSED)

1. Landing `/beta` (new) → **"Join the 7-day Beta"**.
2. **Reuse** the existing Clerk sign-up/sign-in (`/sign-up/*`). Verify email before activation. Add
   Google/phone only if fully configured; **do not** stand up a second account system.
3. Email verification.
4. **Consent screen:** beta terms, privacy, and **separate** optional consent to use birth data and
   session recordings. Confirm privacy wording with qualified legal advice.
5. **Screening questionnaire (§1.2)** → tier assigned automatically.
6. Welcome email with the tier's task script and the feedback link.

### 5.2 Server-side trial (PROPOSED — copy the `weekly_drive_grants` pattern)

Suggested account fields: `user_id`, tier, screening score/answers, invited-at, activated-at,
trial-start, trial-end, access status, revoked-at, audit timestamps — a **design spec**, not a
ready-to-run migration.

**Clock rule:** start **once**, after verified email + accepted required terms + completed screening +
approved invitation. Use server UTC: **`trial_end = trial_start + 168 hours`**. Allow access only when
`trial_start <= server_now < trial_end` and the account is active and not revoked — at exactly
`trial_end` access is **denied**. Re-login, new devices and questionnaire edits **must never restart the
clock**. Display the local expiry time. Admin extensions need a recorded reason + audit trail.

**Enforcement:** activation must be server-controlled, **idempotent** and transaction-safe (mirror
`grant_weekly_drive()` / `consume_weekly_drive()`). Testers must not insert or edit their own
entitlement dates, scores or status. Apply least-privilege RLS and explicit grants; validate entitlement
on **every** protected read, generation action and direct API call — including through an
already-signed-in session. A frontend check is never the boundary.

**Expiry UX:** return a normal access-denied (e.g. HTTP 403 with a stable `TRIAL_EXPIRED` code) plus a
clear renewal/contact screen; do **not** mislabel ordinary expiry as a payment failure. Keep login,
feedback, data export/deletion and account settings available after expiry. Decide explicitly what
happens to saved charts — never delete them silently.

**Tests required before inviting users:** duplicate/concurrent activation · unverified email · missing
invitation · one second before / exactly at / after expiry · clock/timezone manipulation · repeat login ·
direct API access · another user's data · revoked account · audited extension · reminder-job delay ·
retention/export after expiry.

### 5.3 Access control (PROPOSED)

- **Unpredictable, single-use invite codes**, validated and consumed **on the server**, to cap each tier.
  Never guessable/sequential, and the code must not determine an unreviewed expertise level.
- One trial per verified account + single-use invitation (limits duplicates; not proof of one human per
  account — add rate limits and abuse review without invasive tracking).
- Admin page: tester list, tier, report count, and a 7-day extend action.

### 5.4 Week schedule (PROPOSED)

| Day | Activity |
| --- | --- |
| 0 | Invites sent, registration, screening |
| 1 | Onboarding tasks (all tiers) |
| 2–3 | Core features: charts, Panchang, Dasha |
| 3 | Beta release #1 (fixes only) |
| 4–5 | Deep tasks: matching, divisional charts, edge cases |
| 6 | Beta release #2; testers re-test fixed bugs |
| 7 | Exit survey (SUS + NPS + "would you pay?"); trial ends |
| 8+ | If approved, offer an **optional** conversion plan; never auto-charge without explicit consent |

Automation: a daily scheduled server job flips `status='expired'` after `trial_end` and emails reminders
on Day 5 and Day 7 — but the **server-time check must deny access even when the job is delayed**.

---

## §6 — Step 6 · Launch exit criteria (PROPOSED)

- **0 open S1**; no unresolved security/privacy/core-calculation S2. Any other S2 needs a named owner,
  a documented workaround and explicit launch acceptance.
- Accuracy suite **100 % green**, plus **every bug found in beta added as a test**.
- SUS ≥ 70; per-tier task-success thresholds met; **report denominators for all groups**.
- Crash-free sessions ≥ 99.5 %.
- `docs:verify` green (test-count claims re-pinned if the suite changed).

---

## §7 — Quick checklist

- [ ] Screening questionnaire live; per-tier quotas enforced
- [ ] `beta_testers` + `feedback_reports` private tables with **RLS** (**closes DEF-015**)
- [ ] "Report a problem" reachable from every beta page
- [ ] GitHub labels, issue template and project board configured
- [ ] Trial enforced **server-side** (`trial_end = start + 168 h`) + countdown banner
- [ ] Invite codes single-use and server-consumed
- [ ] Task scripts emailed per tier; daily triage owner assigned
- [ ] Exit survey (SUS + NPS) ready; exit criteria agreed
- [ ] `festivals.golden.json` generated where DB access exists (unblocks G1)

---

## §8 — Honest residual risks

1. **No central bug inbox today (DEF-015).** Until the private sink is built, tester reports live only in
   each tester's browser — recruit **after** §3.1, or collect reports through a private form outside the app.
2. **G1 is not green on this checkout** — the only failure is the missing generated fixture
   `src/tests/content/festivals.golden.json` (needs `SUPABASE_DB_URL` + `psql`). It is **environmental**,
   but it also blocks the pre-push hook and `docs:verify` until generated in a capable environment.
3. **Robots are not humans.** G5/G5b prove the app does not crash and that tier surfaces agree with the
   contract; they do **not** prove astrological correctness. Correctness rests on G2 (155/155) plus the
   Advanced tier's agreed reference cases and tolerances.
4. **All tier gates are client-side** (`PARITY-001` in [TIER_MATRIX.md](file:///c:/Users/Rajkumar/Vedic_Rajkumar/docs/testing/TIER_MATRIX.md)); the real boundary must be server-side (§5.2).
5. **A small beta gives directional evidence**, not proof of enterprise reliability, astrological
   validity or legal compliance.

---

## Appendix — copyable private bug report

```text
Title / report ID:
Tier / app version / device / browser:
Category / first seen / frequency:
Steps to reproduce (synthetic birth input only):
Expected (reference source + matched settings):
Actual:
Redacted evidence / private evidence reference:
Impact / workaround:
Owner / severity / target date:
Duplicate of / issue link / fix release:
Regression test / reporter retest / closure decision:
```

## Appendix — end-of-week summary

| Tier | Invited / activated / finished | Tasks completed / attempted | Median time | SUS respondents / score | Unique bugs by severity | Fixes verified | Remaining blockers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Nascent | | | | | | | |
| Intermediate | | | | | | | |
| Advanced | | | | | | | |

Keep abandonment and non-response visible.
