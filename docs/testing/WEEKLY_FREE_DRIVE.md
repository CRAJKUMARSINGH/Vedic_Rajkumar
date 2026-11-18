# Weekly Free-User Drive — spec & test guide

**Owner:** Growth + Core Engineering · **Status:** spec · **Depends on:** `WEEKLY_DRIVE`, `weekly_drive_grants`

## 1. Problem

Every quota in the repo resets **daily**. Nothing resets weekly, so:

- No weekly conversion signal exists, even though
  `docs/API_MONETIZATION_STRATEGY.md` names the trigger
  _"daily limit exceeded 3× in a week → email to Pro"_ — which needs a weekly counter.
- A free user's allowance is fully restored every midnight, so an engaged user is
  never visibly "running out" at a horizon they can plan around.

## 2. Semantics

| Property       | Value                                                                          |
| -------------- | ------------------------------------------------------------------------------ |
| Window         | rolling calendar week, 7 days, half-open `[Mon 00:00 IST, next Mon 00:00 IST)` |
| Anchor         | `Asia/Kolkata` (no DST) — deterministic, primary market                        |
| Reset          | implicit: a new `week_key` yields a new row                                    |
| Authority      | server (`weekly_drive_grants` + `weekly-drive` edge fn)                        |
| Mirror         | `localStorage['vr_weekly_drive']`, discarded when `weekKey` differs            |
| Free allowance | `registered` 21 questions/week · `anonymous` 7                                 |
| Paid           | `-1` (unlimited)                                                               |
| Bonus          | 1 `premiumTrials` grant per week for free grades                               |

## 3. Data model

`public.weekly_drive_grants`, unique `(user_id, week_key)`, RLS owner-read only.
Writes go through two `security definer` RPCs:

- `grant_weekly_drive(...)` — `on conflict do nothing`, idempotent, safe on every request.
- `consume_weekly_drive(...)` — single atomic `UPDATE ... WHERE consumed < granted`,
  raises `weekly_drive_exhausted` otherwise. No double-spend under concurrency.

## 4. API

    GET  /functions/v1/weekly-drive   -> { grant }              (grants on first call)
    POST /functions/v1/weekly-drive   -> { grant } | 409 { error: 'weekly_drive_exhausted' }
    401 unauthenticated

## 5. Conversion trigger

Record saturation when `consumed / granted >= 0.8`. When saturation holds for
`WEEKLY_DRIVE.conversionWeeks` (2) consecutive weeks, surface the Pro prompt via
the existing `UpgradeBanner`. Deterministic, no ML, no new dependency.

## 6. UI requirements

- `src/components/WeeklyDriveCard.tsx` on home + `PricingPage`, bilingual (en + hi, Devanagari),
  exposing `data-testid="weekly-drive-card"` and `data-remaining` (int, `-1` = ∞).
- Exhausted state replaces the action with the upgrade CTA, not a dead button.
- Never show the card's "running low" nudge to paid grades.

## 7. Test plan

| Layer      | File                                                       | Cases                                                                                                                      |
| ---------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| unit       | `src/tests/features/weeklyDrive.test.ts`                   | IST Monday boundary · Sunday 23:59 → previous week · year rollover W53→W01 · grant semantics · saturation · idempotent row |
| server     | `supabase/tests/weekly_drive_rls.test.sql`                 | RLS owner-read · cross-user isolation · RPC idempotency · concurrent consume                                               |
| robotic    | `tests/e2e/tier-matrix.spec.ts` (`weekly drive allowance`) | free capped 1..21 · paid `-1`                                                                                              |
| regression | `docs:verify`                                              | doc counts cannot drift                                                                                                    |

## 8. Acceptance criteria

1. `weekKey` is IST-anchored and passes the boundary + rollover tests.
2. A free user gets 21, consumes to 0, and is gated — not crashed.
3. A paid user is never gated and never sees the nudge.
4. Refreshing mid-week does **not** re-grant (idempotency).
5. Two consecutive saturated weeks produce exactly one Pro prompt.
6. Tier robot reports `GO`; `npm run test:run` stays green.

## 9. Rollout

Behind a kill switch (`src/config/kill-switches.ts`) so the drive can be disabled
without a deploy. Register the guide and any new counts in `docs/CLAIMS.md` — the
full suite runs inside `docs:verify`, which fails on stale figures.

## Change log

- **2026-10-27** — Initial spec.
