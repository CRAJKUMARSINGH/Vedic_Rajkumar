# Patch 01 — Unify Chart Renderer (Masterstroke)

**Goal:** Eliminate dual NorthIndianChart implementations. Production always uses the clean, tested, accessible version under `src/features/charts`.

## Steps

1. Make `src/components/NorthIndianChart.tsx` a pure re-export:

```tsx
// src/components/NorthIndianChart.tsx
/**
 * @deprecated Use @/features/charts/components/NorthIndianChart instead.
 * This file exists only for backward-compatible import paths.
 */
export {
  NorthIndianChart as default,
  NorthIndianChart,
} from "@/features/charts/components/NorthIndianChart";
export type { NorthIndianChartProps } from "@/features/charts/components/NorthIndianChart";
```

2. Update any remaining direct imports of the old component to the features path (or keep the re-export).

3. Add a unit test that the legacy path still renders 12 houses:

```ts
// src/tests/charts/legacy-reexport.test.tsx
import { render, screen } from '@testing-library/react';
import NorthIndianChart from '@/components/NorthIndianChart';
import { makeD1ViewModel } from './fixtures';

it('legacy import path still works and draws 12 houses', () => {
  render(<NorthIndianChart viewModel={makeD1ViewModel()} />);
  expect(screen.getAllByTestId(/^house-polygon-/)).toHaveLength(12);
});
```

4. Delete the large legacy body after one release cycle (or keep only the re-export forever).

**Why this is a masterstroke:** One geometry, one set of testids, one accessibility story. All future chart bugs are fixed in a single place.
