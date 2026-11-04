# Runbook — Regular enrichment

**Cadence:** monthly window (1st, 02:00–04:00 IST) + on-demand for festival years
**Owner:** Content · **Revert SLA:** 10 minutes

## 1. THE HARD RULE

> **Calculation layer frozen. Enrichment layer free.**

`src/features/ephemeris/**` computes. Enrichment only changes how a computed value
is _described_. If an enrichment changes a number, it is not enrichment — it is a
code release, and the accuracy corpus must re-run.

This rule is what keeps the golden corpus (dose 7) meaningful. Break it and the
corpus starts failing for reasons nobody can attribute.

## 2. What gets enriched

| Kind                           | Cadence                   | Sharp edges                                 |
| ------------------------------ | ------------------------- | ------------------------------------------- |
| `nakshatra`, `rashi`, `planet` | ad hoc                    | 27/12/9 coverage must be exact              |
| `dasha` interpretations        | monthly                   | 9 mahadasha texts                           |
| `festival`                     | **yearly, ahead of time** | wrong date = wrong reading for millions     |
| `i18n` strings                 | with any copy change      | locale parity mandatory                     |
| `alert` templates              | ad hoc                    | variable names must match the alert payload |

## 3. Pipeline (never skip a step)

    enrich.mjs plan    --kind nakshatra --file content/nakshatra.2026-11.json
    enrich.mjs dry     --batch <id>
    enrich.mjs apply   --batch <id> --canary 10
    # watch 30 min
    enrich.mjs promote --batch <id>
    # if wrong:
    enrich.mjs revert  --batch <id>

`plan` validates shape, locale parity, and duplicate keys — and **writes nothing
live**. A batch sits in `validated` until `dry` passes.

## 4. The festival calendar (the one to be careful with)

A festival date error is not cosmetic — it changes what the app tells a user about
their day. Requirements:

1. Every entry carries `source_url` (a panchang reference, not a blog).
2. Every entry carries `verified_by` and `verified_at`.
3. The year must be complete in **both** locales before publishing.
4. `festival_year_health(<year>).ready` must be `true`.
5. Publish the next year by **November**, not January.

   psql "$DB" -c "select public.festival_year_health(2027);"

Golden test: `src/tests/content/festivals.golden.test.ts` pins the published dates
for the current and next year. A changed date fails the test, and the diff is the
review.

## 5. Canary semantics for content

Content has no flag — so canary is by **date resolution**, not traffic split. On
`apply --canary`, entries become live but only resolve for dates at or after
`effective_from`. In practice: set `effective_from` to tomorrow, apply, watch, and
the content "turns on" at midnight with a revert still possible today.

## 6. Reverting

`revert` sets `effective_to = today` on the batch's entries. The previous entry
for that key becomes the live one again — because `content_for()` picks the most
recent entry whose window contains the date.

**A revert never deletes.** The bad batch stays in the table, so the diff and the
lesson survive.

## 7. After every window

1. `content_coverage(kind, expected).complete` for every kind — log it.
2. Append to `docs/ops/enrichment-log.md`.
3. If a validation rule would have caught a mistake that got through, add it to
   `enrich.mjs` **in the same PR**.

## 8. Anti-patterns

| Anti-pattern                                   | Why                                 |
| ---------------------------------------------- | ----------------------------------- |
| Editing content in the DB by hand              | no batch, no revert, no diff        |
| A festival date with no source                 | unfalsifiable, and it will be wrong |
| Publishing without the other locale            | silent English fallback             |
| Enriching the ephemeris and calling it content | corpus ambiguity                    |
| Deleting a reverted batch                      | loses the audit trail               |

## 9. STOP-THE-LAUNCH

1. `festival_year_health(year).ready = false` for a year with entries.
2. Any `content_coverage().missing_hi > 0` on a published kind.
3. An enrichment batch applied without a passing `dry`.
4. A festival entry with no `source_url` or `verified_at`.
5. Next year's festival calendar unpublished after 30 November.

## Change log

- **2026-11-25** — First version. Batch model, festival gate, date-based revert.
