# ADR-007 — Swiss Ephemeris licensing: stay on AGPL, keep a paid escape hatch

**Date:** 2026-11-01 · **Status:** Accepted · **Gate:** `npm run licenses:check`

## Context

`swisseph-wasm` is a hard dependency of the accuracy story and is dual-licensed
AGPL-3.0-or-later / commercial (Astrodienst). For an MIT-licensed repo this is a
licence _combination_ question, not a footnote — and the moment a closed-source
white-label customer appears, it becomes a commercial question.

## Decision

1. Ship the AGPL branch. Accept the network-copyleft obligation.
2. Keep the paid commercial licence as a pre-negotiated escape hatch for
   white-label customers who cannot accept AGPL.
3. Make the decision binding: `scripts/check-licenses.mjs` fails CI if any
   copyleft dependency appears without an allowlist entry citing an ADR.

## Why AGPL is acceptable here

- We **consume** `swisseph-wasm` and do not modify it, so no obligation to publish
  our own modifications to it.
- The repo is MIT and public anyway, so source availability is not a sacrifice.
- The obligation is only a problem for a _closed-source_ redistribution, which is
  exactly the white-label scenario the escape hatch covers.

## Why this must be a gate, not a memo

The repo already had a licence memo (`docs/legal/SWISS_EPHEMERIS_LICENSE.md`) and
still nothing stopped a second copyleft dependency from landing. A memo documents;
a failing check enforces.

## Consequences

- `npm run licenses:check` runs in CI and blocks.
- Adding a copyleft dependency is now a deliberate act with a named decision.
- `license-allowlist.json` is the single place to see every copyleft dependency
  and its justification — the artefact a customer's legal team will ask for.
- If the escape hatch is ever exercised, ADR-007 is the record that the trade-off
  was understood _before_ the contract, not after.
