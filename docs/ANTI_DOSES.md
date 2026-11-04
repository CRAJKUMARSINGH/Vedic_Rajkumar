# Anti-doses

**Owner:** Core · **Reviewed:** quarterly · **Read before** adding a rule to any
dose's mechanism.

A dose fixes a problem. An anti-dose is the _new_ problem the fix creates. Every
guard in this repo has a rotted form, and the rotted form is usually more
dangerous than the original problem — because it comes with the confidence of
being a written rule.

Each entry: **Symptom → Mechanism → Antidote → Tripwire.**

The tripwire is the point. A rule without a tripwire is a rule you will follow
past the point of usefulness.

---

## AD-1 — The weekly drive becomes a slot machine

**Dose:** 1 (weekly drive + tier robot)

**Symptom:** free users churn the week after they exhaust the limit. Support
replies are "when does it reset?".

**Mechanism:** a hard stop with no anticipation. The user experiences the limit
as _punishment_ rather than _pacing_. The robot verifies the mechanism works,
which reinforces the wrong thing.

**Antidote:** reset must be _visible and forecastable_ — a countdown in the tier
badge, a message on the last question ("this is your last one this week"), and
the reset anchored to the user's local midnight, not IST.

**Tripwire:** `week_2_return_after_exhaustion` below 25%. Measure it in
`funnel_summary()`, not DAU.

---

## AD-2 — Enforcement parity becomes over-enforcement

**Dose:** 2 (server authority + parity)

**Symptom:** paying users blocked. A support ticket that says "I paid, it says
limit reached".

**Mechanism:** fail-closed everywhere. When `user_entitlements` is unreachable,
the client denies instead of allowing. Free users can absorb a deny; paying users
cannot — a paying user who is denied twice starts a refund.

**Antidote:** asymmetric failure. **Fail-open for paid, fail-closed for free.**
The cost of a free user getting one extra question is ~nothing; the cost of a
paying user being blocked is a refund. Encode the direction in the entitlement
resolver, and test it with an unreachable-DB spec.

**Tripwire:** any S2+ ticket whose text contains "paid" and "blocked".

---

## AD-3 — The webhook becomes the only writer

**Dose:** 3 (revenue rail)

**Symptom:** a Stripe outage, or one missed webhook, silently downgrades users.
Renewals stop working.

**Mechanism:** webhook-only entitlement. Webhooks are at-least-once but _not_
guaranteed, and a 500 during a deploy drops one. Without reconciliation, a
dropped `invoice.paid` means a paid user is treated as free forever.

**Antidote:** a reconciliation job (`reconcile:entitlements`, nightly) that pulls
Stripe subscription state and fixes local drift. And a **grace period**: never
revoke on a missed webhook — revoke only when reconciliation confirms.

**Tripwire:** reconciliation finds > 0 drift rows on two consecutive nights.

---

## AD-4 — The single source of truth becomes a god module

**Dose:** 4 (one source of truth)

**Symptom:** every PR touches `tiers.ts` / `shared/mod.ts`. Review is a
bottleneck. The bus factor that dose 8 was supposed to fix re-centralises.

**Mechanism:** "one source" is read as "one file". Correctness improves, then
change velocity collapses, and people work around it by adding a second source —
recreating the exact duplication dose 4 deleted.

**Antidote:** separate _canonical_ from _convenient_. The canonical module must be
small and rarely change; anything derived is allowed to be a second, _generated_
file. Plus `scripts/churn.mjs`: flag any file changed in more than 40% of PRs.

**Tripwire:** a single file appearing in > 40% of the last 50 PRs.

---

## AD-5 — The shared rate-limit store becomes the hot path

**Dose:** 5 (shared-state limits)

**Symptom:** Postgres CPU is dominated by `admit_request`. Every request now
depends on the DB — including ones that do not need data.

**Mechanism:** correctness (shared state) traded for availability. A correct
limit on the critical path of every request means a DB hiccup takes down the
whole API, not just the limited surface.

**Antidote:** the limiter must be **fail-open with a local fallback bucket**. If
the DB is slow or unreachable, allow with a per-instance in-memory counter. A
limit that is 5% wrong during an incident beats an outage. Circuit-break the
limiter after N consecutive timeouts.

**Tripwire:** `admit_request` p95 above 40ms, or limiter timeout rate above 1%.

---

## AD-6 — Observability becomes alert fatigue

**Dose:** 6 (observability live)

**Symptom:** 40 alerts a week. Nobody reads them. A real S1 arrives and is
ignored for six hours.

**Mechanism:** adding an alert is free, deleting one is political. Each new
failure mode gets its own alert, all at the same severity, until the signal is
buried.

**Antidote:** an **alert budget** — a hard maximum on paging alerts per week
(start at 5). Adding one means removing one, or proving the new one is more
valuable. Every alert must have an owner and a runbook link; an alert with
neither gets deleted.

**Tripwire:** more than 5 pages in a 7-day window, or more than 1 alert with no
owner.

---

## AD-7 — Compliance becomes a delete-everything hammer

**Dose:** 7 (erasure + DPA register + VPAT)

**Symptom:** a user erases, re-signs up, and is confused that their history is
gone. Or: the DPA register lists a processor that was removed a year ago.

**Mechanism:** erasure is implemented as thorough deletion — correct, but it
collides with the _product expectation_ that "my account" means "my saved
charts". And compliance docs are written once and never re-read.

**Antidote:** (a) erasure copy must be explicit _before_ the click: "this deletes
your charts too". (b) the DPA register gets a **quarterly re-verification** with
a date column, and `docs:verify` fails if any row is > 120 days stale. (c) the
VPAT must not claim a criterion that has no corresponding a11y test.

**Tripwire:** any DPA register row older than 120 days, or a VPAT criterion with
no test reference.

---

## AD-8 — Governance locks out the second engineer

**Dose:** 8 (DCO, CODEOWNERS, branch protection)

**Symptom:** the second engineer's first PR sits for three days. Their second PR
is pushed with `--no-verify`. By month two they are gone.

**Mechanism:** every guard was written when there was one person. Required
reviews + CODEOWNERS + `enforce_admins` + DCO + linear history is a lot of
friction to absorb on day one, and the friction lands entirely on the new person.

**Antidote:** (a) **one** required approval, never two. (b) a review SLA: first
response within 4 working hours. (c) a `fast-track` label that relaxes
`require_code_owner_reviews` for docs and copy. (d) the first week of a new
engineer is spent shipping, not reading GOVERNANCE.md.

**Tripwire:** median time-to-first-review above 8 working hours, or any PR open

> 48h.

---

## AD-9 — Perf budgets get raised every PR

**Dose:** 9 (enforced budgets)

**Symptom:** entry bundle is 190 → 240 → 310 KB. The budget still says "fail",
and it never fails.

**Mechanism:** raising a baseline is a one-line change in the same PR. There is no
cost to it, so there is no pressure. The budget becomes a ratchet that only goes
up.

**Antidote:** **raising a budget requires deleting something.** Concretely: if a
PR raises a baseline by more than 5%, it must name the thing it removed or
justify the addition in one sentence. Plus a quarterly "budget reset" where the
baselines are re-derived from scratch rather than inherited.

**Tripwire:** baseline raised more than 3 times without a deletion.

---

## AD-10 — The DR drill passes against a toy database

**Dose:** 10 (measured DR)

**Symptom:** drill is green every month. Real restore takes 6 hours and fails on
an extension. RTO was never real.

**Mechanism:** CI drill runs against a Postgres service container seeded with
test data — maybe 5MB. Production is 2GB. Restore time is dominated by index
rebuild and scales superlinearly.

**Antidote:** at least one drill per quarter must run against a **production
snapshot** (the `pg_dump` path already supports it), not a seed. Record
`rows_restored` and compare against a real count; if drill data is under 10% of
production rows, mark the result "synthetic" in the logbook.

**Tripwire:** drill `rows_restored` below 10% of production row count.

---

## AD-11 — Landing claims drift from the product

**Dose:** 11 (verified copy)

**Symptom:** the first paying customer says "it does not do what the page said".

**Mechanism:** `gtm:audit` verifies copy against `CLAIMS.md` — but if
`CLAIMS.md` itself is aspirational, the guard verifies nothing. The registry
becomes the new source of fiction.

**Antidote:** every claim must have a **demo path**: a route + a one-line script
that shows it. `gtm-audit` checks the route exists. A claim you cannot demo in 30
seconds is not a claim, it is positioning.

**Tripwire:** a claim in `CLAIMS.md` with no `demo:` field.

---

## AD-∞ — Treating the audit as done

**The meta anti-dose.** The most likely post-launch state is: 11 doses applied,
`docs/` full of guards, and nobody re-reading any of it.

**Antidote:** `docs/AUDIT_STATE.md` — one page, dated, with the _next_ re-audit
date and the specific signal that should trigger an early one. Each anti-dose's
tripwire is a line in this file. Quarterly, someone reads it and either acts or
explicitly accepts.

**Tripwire:** `AUDIT_STATE.md` last-updated older than 120 days.

---

## How to use this file

1. When a tripwire fires, do **not** immediately add a rule. First ask whether the
   dose is wrong or the execution is.
2. When adding a new guard to any dose, add its anti-dose here in the same PR.
3. When an anti-dose's antidote has been in place for two quarters without the
   tripwire firing, it can move to a test.

## Tripwire dashboard

| Anti-dose | Tripwire                        | Owner    | Last checked |
| --------- | ------------------------------- | -------- | ------------ |
| AD-1      | week-2 return < 25%             | Growth   | —            |
| AD-2      | "paid"+"blocked" ticket         | Support  | —            |
| AD-3      | recon drift > 0 x2 nights       | Billing  | —            |
| AD-4      | file in > 40% of PRs            | Core     | —            |
| AD-5      | admit_request p95 > 40ms        | Platform | —            |
| AD-6      | > 5 pages / week                | Platform | —            |
| AD-7      | DPA row > 120 days              | Security | —            |
| AD-8      | review > 8 working hours        | Core     | —            |
| AD-9      | baseline raised 3x, no deletion | Frontend | —            |
| AD-10     | drill rows < 10% of prod        | Platform | —            |
| AD-11     | claim with no demo path         | Founder  | —            |
| AD-∞      | AUDIT_STATE stale > 120 days    | Core     | —            |
