/**
 * c4 Phase 9 — D1/D9/D10 selector + North/South layout switching
 * (planet data must be preserved across a visual change).
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChartSurface } from '@/features/charts/components/ChartSurface';
import { makeD1ViewModel, makeD9ViewModel, makeD10ViewModel } from './fixtures';

function charts() {
  return [makeD1ViewModel(), makeD9ViewModel(), makeD10ViewModel()];
}

describe('ChartSurface selectors', () => {
  it('defaults to the D1 chart in the North Indian layout', () => {
    render(<ChartSurface charts={charts()} />);
    expect(screen.getByTestId('chart-type-D1')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('layout-north')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('north-indian-chart')).toBeInTheDocument();
  });

  it('switches between D1, D9 and D10 without recalculating', () => {
    render(<ChartSurface charts={charts()} />);

    // D1 has Jupiter in house 7.
    expect(screen.getByTestId('house-7-planet-Jupiter')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('chart-type-D9'));
    expect(screen.getByTestId('chart-type-D9')).toHaveAttribute('aria-pressed', 'true');
    // D9 places Sun in sign 4 (house 2 for ascendant 3).
    expect(screen.getByTestId('detail-row-Sun')).toBeInTheDocument();
    expect(screen.queryByTestId('house-7-planet-Jupiter')).toBeNull();

    fireEvent.click(screen.getByTestId('chart-type-D10'));
    expect(screen.getByTestId('detail-row-Jupiter')).toBeInTheDocument();
    expect(screen.getByTestId('detail-row-Venus')).toBeInTheDocument();
  });

  it('preserves planetary data when switching layout', () => {
    render(<ChartSurface charts={charts()} />);

    // North: planets keyed by house.
    expect(screen.getByTestId('house-1-planet-Sun')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('layout-south'));
    expect(screen.getByTestId('layout-south')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByTestId('north-indian-chart')).toBeNull();
    expect(screen.getByTestId('south-indian-chart')).toBeInTheDocument();

    // Same planet, same rashi, different visual layout — data unchanged.
    expect(screen.getByTestId('sign-cell-0-planet-Sun')).toBeInTheDocument();
    expect(screen.getByTestId('detail-row-Sun')).toBeInTheDocument();
  });

  it('shows an empty state when no chart is provided', () => {
    render(<ChartSurface charts={[]} />);
    expect(screen.getByTestId('chart-surface-empty')).toBeInTheDocument();
  });
});
