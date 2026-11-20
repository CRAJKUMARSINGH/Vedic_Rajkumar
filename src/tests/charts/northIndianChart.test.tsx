/**
 * c4 Phase 9 — North Indian renderer verification (synthetic fixtures only).
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { NorthIndianChart } from '@/features/charts/components/NorthIndianChart';
import { assembleViewModel } from '@/features/charts/model/chartViewModel';
import { makeD1ViewModel, seed } from './fixtures';

describe('North Indian geometry', () => {
  it('draws twelve house compartments', () => {
    render(<NorthIndianChart viewModel={makeD1ViewModel()} />);
    for (let h = 1; h <= 12; h++) {
      expect(screen.getByTestId(`house-polygon-${h}`)).toBeInTheDocument();
    }
    expect(screen.getAllByTestId(/^house-polygon-/)).toHaveLength(12);
  });

  it('places the sign number in each compartment (ascendant = Aries → "1" in house 1)', () => {
    render(<NorthIndianChart viewModel={makeD1ViewModel()} />);
    expect(screen.getByTestId('house-sign-1')).toHaveTextContent('1');
    expect(screen.getByTestId('house-sign-4')).toHaveTextContent('4');
    expect(screen.getByTestId('house-sign-12')).toHaveTextContent('12');
  });

  it('clearly marks the ascendant', () => {
    render(<NorthIndianChart viewModel={makeD1ViewModel()} />);
    const marker = screen.getByTestId('ascendant-marker');
    expect(marker).toBeInTheDocument();
    expect(marker).toHaveTextContent('Asc');
  });
});

describe('North Indian placements', () => {
  it('places planets into their houses', () => {
    render(<NorthIndianChart viewModel={makeD1ViewModel()} />);
    expect(screen.getByTestId('house-1-planet-Sun')).toBeInTheDocument();
    expect(screen.getByTestId('house-7-planet-Jupiter')).toBeInTheDocument();
  });

  it('renders multiple planets in the same house without loss', () => {
    render(<NorthIndianChart viewModel={makeD1ViewModel()} />);
    const house1 = screen.getByTestId('house-1');
    expect(within(house1).getByTestId('house-1-planet-Sun')).toBeInTheDocument();
    expect(within(house1).getByTestId('house-1-planet-Mars')).toBeInTheDocument();
    expect(house1.getAttribute('aria-label')).toContain('Sun');
    expect(house1.getAttribute('aria-label')).toContain('Mars');
  });

  it('renders empty houses with no planet nodes', () => {
    render(<NorthIndianChart viewModel={makeD1ViewModel()} />);
    const house3 = screen.getByTestId('house-3');
    expect(within(house3).queryByTestId(/planet/)).toBeNull();
  });

  it('compacts overflow when a house holds more planets than fit inline', () => {
    const model = assembleViewModel({
      chartType: 'D1',
      layout: 'north',
      ascendantSign: 0,
      seeds: [
        seed({ key: 'Sun', sign: 0, house: 1, degrees: 1, longitude: 1 }),
        seed({ key: 'Moon', sign: 0, house: 1, degrees: 2, longitude: 2 }),
        seed({ key: 'Mars', sign: 0, house: 1, degrees: 3, longitude: 3 }),
        seed({ key: 'Mercury', sign: 0, house: 1, degrees: 4, longitude: 4 }),
      ],
      calculation: {
        engine: 'test',
        version: '1',
        ayanamsa: 'Lahiri',
        zodiac: 'sidereal',
        houseSystem: 'Whole Sign',
      },
    });
    render(<NorthIndianChart viewModel={model} />);
    expect(screen.getByTestId('house-1-overflow')).toHaveTextContent('+1');
  });
});

describe('North Indian indicators & labels', () => {
  it('shows a retrograde marker', () => {
    render(<NorthIndianChart viewModel={makeD1ViewModel()} />);
    expect(screen.getByTestId('house-4-planet-Mercury')).toHaveTextContent('℞');
  });

  it('renders English abbreviations by default', () => {
    render(<NorthIndianChart viewModel={makeD1ViewModel()} lang="en" />);
    expect(screen.getByTestId('house-1-planet-Sun')).toHaveTextContent('Su');
  });

  it('renders Hindi (Devanagari) labels in Hindi mode', () => {
    render(<NorthIndianChart viewModel={makeD1ViewModel()} lang="hi" />);
    expect(screen.getByTestId('house-1-planet-Sun')).toHaveTextContent('सू');
    expect(screen.getByTestId('ascendant-marker')).toHaveTextContent('लग्न');
  });
});

describe('North Indian scalability & accessibility', () => {
  it('scales via viewBox without distorting geometry', () => {
    render(<NorthIndianChart viewModel={makeD1ViewModel()} />);
    const svg = screen.getByTestId('north-indian-chart');
    expect(svg).toHaveAttribute('viewBox', '0 0 100 100');
    expect(svg).toHaveAttribute('preserveAspectRatio', 'xMidYMid meet');
    expect(svg).toHaveAttribute('width', '100%');
  });

  it('exposes a screen-reader description and a details table', () => {
    render(<NorthIndianChart viewModel={makeD1ViewModel()} />);
    const svg = screen.getByTestId('north-indian-chart');
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg.getAttribute('aria-label')).toMatch(/chart/i);
    expect(screen.getByTestId('chart-details')).toBeInTheDocument();
    expect(screen.getByTestId('detail-row-Sun')).toBeInTheDocument();
  });

  it('supports keyboard navigation (focusable houses toggling details)', () => {
    render(<NorthIndianChart viewModel={makeD1ViewModel()} />);
    const house1 = screen.getByTestId('house-1');
    expect(house1).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(house1, { key: 'Enter' });
    expect(screen.getByTestId('house-detail-1')).toBeInTheDocument();
  });
});

describe('North Indian missing-data handling', () => {
  it('renders warnings and dashes for unavailable data instead of zeros', () => {
    const model = assembleViewModel({
      chartType: 'D1',
      layout: 'north',
      ascendantSign: null,
      seeds: [seed({ key: 'Sun', sign: null, house: null, degrees: null, longitude: null })],
      calculation: {
        engine: 'test',
        version: '1',
        ayanamsa: 'Lahiri',
        zodiac: 'sidereal',
        houseSystem: 'Whole Sign',
      },
      warnings: ['Planetary positions are unavailable.'],
    });
    render(<NorthIndianChart viewModel={model} />);
    expect(screen.getByTestId('chart-warnings')).toHaveTextContent('unavailable');
    expect(screen.getByTestId('detail-row-Sun')).toHaveTextContent('—');
  });
});
