# ADR-014 — Retain two North Indian chart renderers as intentionally separate surfaces

**Date:** 2025-07-14 · **Status:** Accepted · **Supersedes:** —

## Context

Two `NorthIndianChart` components exist and serve different call sites:

| Surface                  | File                                                  | Props contract                                                                                                   | Primary consumer                                                                |
| ------------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Legacy / Kanchi**      | `src/components/NorthIndianChart.tsx`                 | `chart: ChartData` (from `@/lib/vedic/vedicCalc`) + `highlightSeventh`, `showTransits`, `transitPlanets`, `size` | `KanchiPage.tsx` (3 usages); Devanagari-heavy UI                                |
| **Canonical / features** | `src/features/charts/components/NorthIndianChart.tsx` | `viewModel: ChartViewModel` (from `model/chartViewModel.ts`)                                                     | `ChartSurface.tsx`, `ChartPreview.tsx`; accessibility-first, full test coverage |

An earlier proposal to unify them via a pure re-export would cause a TypeScript
compile failure: the two prop shapes are structurally incompatible and serve
different calculation engines.

## Options considered

1. **Pure re-export** — point one file at the other.  
   Cost: immediate build failure; KanchiPage loses `ChartData`-typed props,
   `highlightSeventh`, `showTransits`. Risk: high.

2. **Big-bang migration** — rewrite KanchiPage to use `ChartViewModel`.  
   Cost: large diff touching a business-critical page; risk of visual regression
   in the Kanchi flow; requires the full `vedicCalc → ephemerisService` mapping to
   be verified correct before merge. Risk: medium-high, high effort.

3. **Thin adapter + incremental migration** — introduce
   `src/features/charts/adapters/fromVedicCalcChart.ts` that maps `ChartData` to
   `ChartViewModel`; KanchiPage can migrate one chart at a time when the adapter
   is proven correct. Risk: low, medium effort, fully reversible.

4. **Keep both permanently** — formalise the boundary; add internal cleanup and
   tests to the legacy component; block future re-export proposals with this ADR.
   Risk: low; perpetuates engine duplication but does not regress anything.

## Decision

Adopt option 3 (adapter) as the migration path, with option 4 as the interim
state. The adapter ships first; KanchiPage migration happens as a separate,
reviewable change once the adapter passes the accuracy suite.

## Rationale

The legacy component carries real business intent: seventh-house highlighting,
trine colouring, transit overlay, and Devanagari-only display. Removing these
accidentally during a mechanical unification is a user-visible regression. The
adapter approach preserves them while moving toward a single calculation surface.

The canonical surface (`features/charts`) is already well-tested and
accessibility-compliant; it is the correct target, but migration must be auditable.

## Consequences

**Good:**

- New features must go through `ChartViewModel` + `features/charts`. Enforced by
  convention and this ADR; reviewers should reject PRs that add logic to the
  legacy component instead of the adapter.
- `fromVedicCalcChart.ts` provides a testable seam between the two engines. The
  accuracy suite can compare outputs before KanchiPage migrates.
- Internal dead code (`HOUSE_PATHS`, `HOUSES` tables) in the legacy file is safe
  to delete (see geometry cleanup commit) without touching the adapter or consumers.

**Bad / accepted limitations:**

- Two files with the same display name continue to exist. IDE "go to definition"
  may surprise developers; the `docs/DUPLICATES.md` "Still open" section must
  reference this ADR.
- The adapter must be kept in sync if `ChartData` or `ChartViewModel` evolve.

## Migration rule for new code

> Any new chart feature, visual enhancement, or calculation change must be
> implemented in `src/features/charts/` using `ChartViewModel`. The legacy
> component (`src/components/NorthIndianChart.tsx`) is in maintenance mode: bug
> fixes only, no new features.

## Revisit when

- KanchiPage completes its migration to `ChartViewModel` (then delete
  `src/components/NorthIndianChart.tsx` and remove the adapter).
- Or: the accuracy suite shows the adapter's output diverges from the legacy
  renderer for >0 reference charts (fix the adapter before merging KanchiPage).
