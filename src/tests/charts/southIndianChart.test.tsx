/**
 * c4 Phase 9 — South Indian renderer verification (synthetic fixtures only).
 */

import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { SouthIndianChart } from '@/features/charts/components/SouthIndianChart';
import { makeD1ViewModel } from './fixtures';

describe('South Indian geometry & placement', () => {
  it('renders the twelve fixed sign cells', () => {
    render(<SouthIndianChart viewModel={makeD1ViewModel()} />);
    for (let s = 0; s < 12; s++) {
      expect(screen.getByTestId(`sign-cell-${s}`)).toBeInTheDocument();
    }
    expect(screen.getAllByTestId(/^sign-cell-\d+$/)).toHaveLength(12);
  });

  it('places planets by their rashi (signs are fixed, houses rotate)', () => {
    render(<SouthIndianChart viewModel={makeD1ViewModel()} />);
    expect(screen.getByTestId('sign-cell-0-planet-Sun')).toBeInTheDocument();
    expect(screen.getByTestId('sign-cell-0-planet-Mars')).toBeInTheDocument();
    expect(screen.getByTestId('sign-cell-3-planet-Mercury')).toBeInTheDocument();
  });

  it('marks the ascendant sign cell', () => {
    render(<SouthIndianChart viewModel={makeD1ViewModel()} />);
    const cell = screen.getByTestId('sign-cell-0');
    expect(within(cell).getByTestId('ascendant-marker')).toBeInTheDocument();
  });

  it('scales via viewBox and declares the south layout', () => {
    render(<SouthIndianChart viewModel={makeD1ViewModel()} />);
    const svg = screen.getByTestId('south-indian-chart');
    expect(svg).toHaveAttribute('data-layout', 'south');
    expect(svg).toHaveAttribute('viewBox', '0 0 100 100');
    expect(svg).toHaveAttribute('preserveAspectRatio', 'xMidYMid meet');
  });

  it('renders Hindi labels in Hindi mode', () => {
    render(<SouthIndianChart viewModel={makeD1ViewModel()} lang="hi" />);
    expect(screen.getByTestId('sign-cell-0-planet-Sun')).toHaveTextContent('सू');
  });
});
