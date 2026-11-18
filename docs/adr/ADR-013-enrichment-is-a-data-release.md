# ADR-013 — Enrichment is a data release with the same rigour as code

**Date:** 2026-11-25 · **Status:** Accepted

## Context

Content changes constantly (interpretations, i18n, festival dates) while the
calculation layer almost never changes. Treating both as "code" means either
content is under-gated (edited in the DB by hand) or code is over-gated.

The sharp case is the festival calendar: a wrong date silently produces a wrong
reading, and it is time-sensitive — it must be published ahead of the year.

## Decision

1. **Calculation layer frozen, enrichment layer free.** An enrichment that changes
   a computed number is a code release and must re-run the accuracy corpus.
2. Content is batched, versioned, and **time-travellable** via `effective_from` /
   `effective_to`.
3. Pipeline is plan → dry → apply (canary) → promote, with `revert` by date.
4. Reverts close a window; they never delete. The bad batch stays as evidence.
5. Festival entries require `source_url` + `verified_by`, and the next year must be
   published by 30 November.

## Why date-based revert instead of delete

Deleting a bad batch means the previous version is the live one again — but the
evidence is gone and you cannot tell what users saw last week. Closing a window
keeps both, and `content_for()` resolves correctly by date either way.

## Consequences

**Good:** content ships without a code deploy. A bad batch reverts in 10 minutes.
The festival calendar has a hard, checkable deadline. The accuracy corpus stays
meaningful because enrichment cannot touch it.

**Bad / accepted:** content edits need the CLI (no CMS yet). Canary is by date
rather than traffic, which is less precise. The golden fixture must be kept in
sync with the DB — an extra step that exists purely so a date change is visible in
a diff.

## Revisit when

Content edits exceed ~4 windows a month (→ a CMS, with `enrich.mjs` running against
its export), or a non-engineer needs to publish (→ a minimal admin surface).
