# Runbook — Hotfix

**Trigger:** a bug in production · **Owner:** on-call · **Target:** S1 mitigated < 30 min

## 0. RULE ZERO

> **Restore service first. Fix the cause second.**

The instinct is to debug while production is broken. Do not. Debugging and
downtime are not alternatives — you can have both, but only if you restore first.

Every step below assumes this order:

    MITIGATE (seconds) → CONFIRM (minutes) → FIX (calm) → DEPLOY (guarded) → VERIFY

## 1. Triage — 5 minutes, hard cap

| Sev    | Definition                                              | Response       |
| ------ | ------------------------------------------------------- | -------------- |
| **S1** | data loss, payments broken, auth down, all charts wrong | mitigate now   |
| **S2** | one route degraded, wrong output for a cohort           | mitigate today |
| **S3** | cosmetic, single user                                   | next release   |

Write the severity down in the incident channel **before** investigating. An
untriaged incident expands to fill the attention available.

**No repro, no S1.** A single report with no repro is S3 until reproduced. A
report with a `chart_id` and a screenshot is S1 on sight.

## 2. Mitigate — reach for the cheapest lever first

In order. Stop at the first that works.

| #   | Lever                  | Time      | Reversible | Use when                  |
| --- | ---------------------- | --------- | ---------- | ------------------------- |
| 1   | **Kill flag**          | seconds   | yes        | a whole surface is broken |
| 2   | **Rollback frontend**  | ~2 min    | yes        | a client-side regression  |
| 3   | **Rollback edge**      | ~3 min    | yes        | a server regression       |
| 4   | **Rate-limit harder**  | minutes   | yes        | overload / abuse          |
| 5   | **Maintenance banner** | minutes   | yes        | degraded but usable       |
| 6   | **Forward fix**        | 15-60 min | no         | only if 1-5 do not apply  |

    # lever 1 — for the on-call, from a phone, no deploy
    https://app.example/?kill=checkout

    # lever 2 — frontend
    npm run deploy:rollback -- --target frontend

    # lever 3 — edge
    npm run deploy:rollback -- --target edge

**Declare which lever you pulled, in the channel, before you pull it.** Otherwise
two people pull two levers and you cannot tell which fixed it.

## 3. Kill flags are the primary tool

Most S1s are a broken surface, not broken data. `docs/flags.yaml` exists so that
the answer to "checkout is down" is a URL, not a deploy.

Current kill switches: `kill_checkout`, `kill_funnel`, `kill_pdf_export`.

When you flip one: post it, and set a calendar reminder to unflip. A kill flag
left on is a silently missing feature — the second-most common post-incident bug.

## 4. If the fix is a deploy

    git checkout -b hotfix/<def-id>-<slug> main
    # minimal diff ONLY. No refactors. No dependency bumps.
    git commit -s -m "fix(<scope>): <what> (DEF-xxx)"
    git push -u origin hotfix/...

Then:

1. **Expedited review** — one approver, 15-minute SLA. CODEOWNERS still applies
   unless the owner is asleep; then the on-call approves and the owner is notified.
2. **Full CI still runs.** A hotfix skips review depth, never the gate. A hotfix
   that breaks `tier-robot` has just created a second incident.
3. **`deploy:safety` still runs.** Especially the migration and cache-version
   checks.
4. **Canary 10% → 100%.** Never straight to 100 on a hotfix; you are already in an
   incident and cannot afford a second surprise.
5. **Verify with the original repro**, not with a green deploy log.

## 5. After service is restored — within 24 hours

1. **Merge the hotfix branch to `main`.** A hotfix branch alive > 24h becomes a
   fork and then a mystery. Cherry-pick, do not merge-forward blindly.
2. **Write the logbook entry** in `docs/audit/INCIDENT_LOG.md`: what broke, the
   detection gap, the lever used, time to mitigate, time to resolve.
3. **Unflip every kill flag** you set. Verify each one.
4. **File the `DEF-`** for the _root cause_, separate from the mitigation. If the
   mitigation was a rollback, the root cause is still unfixed.
5. **Ask: which gate should have caught this?** Add it — or record why it cannot
   be caught by a gate (`docs/ANTI_DOSES.md` discipline: a new guard needs a
   tripwire).

## 6. Post-incident, S1 only

Blameless, within 5 working days. Required sections:

- Timeline with **timestamps in IST**, including the first user report.
- **Detection gap**: how long until we knew, and by which channel. If a user told
  us before our monitoring did, that is the most important line in the document.
- Lever used and whether it was available in seconds or minutes.
- What we will change, as `DEF-` items with owners.
- **What we will deliberately not change**, with the reason.

## 7. Anti-patterns

| Anti-pattern                        | Why it is bad                                       |
| ----------------------------------- | --------------------------------------------------- |
| Debugging before mitigating         | downtime + debugging, unnecessarily                 |
| "One more log line" before rollback | the log line is a deploy, the rollback is a command |
| Hotfix with a refactor in it        | you cannot tell which change fixed it               |
| Hotfix straight to 100%             | no second chance in an incident                     |
| Hotfix branch left open             | silent fork                                         |
| Kill flag left on                   | invisible feature loss                              |
| Marking resolved on deploy          | resolved is when the _user_ says so                 |

## 8. STOP-THE-LAUNCH

1. S1 open > 4h with no mitigation decision recorded.
2. Hotfix branch alive > 24h.
3. Kill flag flipped without a channel message and a reminder.
4. Hotfix merged without CI.
5. Post-incident without a detection-gap line.

## Change log

- **2026-11-20** — First version.
