# ADR-009 — Performance budgets are CI gates, and heavy compute leaves the main thread

**Date:** 2026-11-03 · **Status:** Accepted

## Context

Performance was documented but never measured in CI. Separately, `computeChart`
ran on the main thread: 80–400 ms of CPU, which on a low-end Android is a frozen
UI — and the primary market is India, where low-end Android is the median device,
not the edge case.

## Decision

1. `budgets.json` is the single budget source; `budget:check` and `lhci autorun`
   enforce it on every PR touching `src/`.
2. Ephemeris computation moves to a Web Worker, calling the same pure functions.
   Main-thread fallback is mandatory.
3. Route-level code splitting is statically audited, not trusted.
4. A nightly k6 smoke with thresholds, not a capacity test.

## Why a worker and not "optimise the algorithm"

The algorithm is already pinned by the accuracy corpus; changing it risks the one
thing the product is trusted for. A worker changes _where_ it runs, not _what_ it
computes — so accuracy tests stay untouched and the win is immediate.

## Consequences

**Good:** a regression is caught in CI, not by a user on a Redmi. The worker
boundary also makes future move-to-edge-compute trivial.

**Bad / accepted:** a worker adds a serialization boundary, so payloads must stay
structured-cloneable (no class instances). Throttled Chromium is directionally
right but not a real device. Nightly-only mobile tests mean a regression can land
in the morning and be caught at 01:00.

## Revisit when

Budgets start being raised every PR (→ the baseline is wrong, reset it), or the
chart payload becomes large enough that the worker's clone cost exceeds the
compute cost (→ transferables).
