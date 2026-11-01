# Incident Communication

**Owner:** Platform · **Status page:** `/functions/v1/status` (generated)

## 1. Severity → who hears

| Sev | Definition                            | Notify                         | Cadence      |
| --- | ------------------------------------- | ------------------------------ | ------------ |
| S1  | data loss, auth down, payments broken | all users + affected customers | every 30 min |
| S2  | a core route degraded, no data loss   | status page                    | every 2 h    |
| S3  | cosmetic / single-user                | logbook only                   | daily        |

## 2. The status page is generated, not typed

`/functions/v1/status` is built from `slo_snapshots` + `alert_events`. Nobody
hand-edits it, so the public page and the internal view cannot disagree. The
`emit-status.mjs` script snapshots it into `ops/status/status.json`.

## 3. Template

    [Investigating] <what users see> since <HH:MM IST>.
    Impact: <who, what breaks>. Data: <safe / at risk / lost>.
    Next update by <HH:MM IST>.

Then, on resolution:

    [Resolved] <what broke> for <duration>. Root cause: <one line>.
    Data impact: <none / N subjects, erasure re-applied: yes/no>.
    Follow-ups: <DEF-ids>.

## 4. Rules

1. First post within 15 minutes of S1 detection, even if it says "we don't know".
2. Never say "intermittent" when you mean "we don't know".
3. If data was at risk, say so in the first post — customers remember being told.
4. If a restore happened, state whether erasure was re-applied. It is the question
   a privacy-conscious customer will ask and nobody thinks to mention.
5. A postmortem within 5 working days for S1, blameless, with `DEF-` items.

## 5. What not to do

- Do not edit a past status update — append. The history is the record.
- Do not mark resolved before the SLO has recovered for one window; a flapping
  incident marked resolved three times destroys trust faster than the incident.
- Do not publish a postmortem without the logbook entry it references.
