/**
 * c4 Phase 9 — planetary strength dashboard verification.
 *
 * The canonical metric is Shadbala in Rupas; the unit must be documented and the
 * displayed value must equal the canonical calculation (no invented scores).
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlanetStrengthChart } from '@/features/charts/components/PlanetStrengthChart';
import { calculateShadbala, type PlanetData } from '@/services/shadabalaService';

const SAMPLE_PLANETS: PlanetData[] = [
  { name: 'Sun', rashiIndex: 0, house: 1, degrees: 15, isRetrograde: false, longitude: 15 },
  { name: 'Moon', rashiIndex: 3, house: 4, degrees: 10, isRetrograde: false, longitude: 100 },
  { name: 'Mars', rashiIndex: 0, house: 1, degrees: 5, isRetrograde: false, longitude: 5 },
  { name: 'Mercury', rashiIndex: 5, house: 6, degrees: 15, isRetrograde: true, longitude: 165 },
  { name: 'Jupiter', rashiIndex: 3, house: 4, degrees: 5, isRetrograde: false, longitude: 95 },
  { name: 'Venus', rashiIndex: 1, house: 2, degrees: 20, isRetrograde: false, longitude: 50 },
  { name: 'Saturn', rashiIndex: 6, house: 7, degrees: 20, isRetrograde: false, longitude: 200 },
];

describe('PlanetStrengthChart', () => {
  it('shows a missing-data state when Shadbala is unavailable', () => {
    render(<PlanetStrengthChart shadbala={null} />);
    expect(screen.getByTestId('planet-strength-empty')).toBeInTheDocument();
  });

  it('renders canonical Shadbala values with a documented unit', () => {
    const shadbala = calculateShadbala(SAMPLE_PLANETS, true, 6);
    const sun = shadbala.planets.find((p) => p.planet === 'Sun');
    expect(sun).toBeDefined();

    render(<PlanetStrengthChart shadbala={shadbala} />);

    expect(screen.getByTestId('planet-strength-chart')).toBeInTheDocument();
    // Unit is explicit and singular — a single metric at a single scale.
    expect(screen.getByTestId('strength-unit')).toHaveTextContent('Rupas');
    // The displayed value must equal the canonical calculation, to 2 dp.
    expect(screen.getByTestId('strength-value-Sun')).toHaveTextContent(sun!.totalRupas.toFixed(2));
  });

  it('renders one accessible bar and table row per planet, with a threshold marker', () => {
    const shadbala = calculateShadbala(SAMPLE_PLANETS, true, 6);
    render(<PlanetStrengthChart shadbala={shadbala} />);

    expect(screen.getByTestId('strength-bars')).toBeInTheDocument();
    expect(screen.getByTestId('strength-table')).toBeInTheDocument();

    for (const p of shadbala.planets) {
      expect(screen.getByTestId(`strength-row-${p.planet}`)).toBeInTheDocument();
      const track = screen.getByTestId(`strength-bar-track-${p.planet}`);
      expect(track).toHaveAttribute('role', 'img');
      expect(track.getAttribute('aria-label')).toContain('Rupas');
      expect(screen.getByTestId(`strength-threshold-${p.planet}`)).toBeInTheDocument();
    }
  });

  it('carries an unverified badge (Shadbala is not externally gated)', () => {
    const shadbala = calculateShadbala(SAMPLE_PLANETS, true, 6);
    render(<PlanetStrengthChart shadbala={shadbala} />);
    const badge = screen.getByTestId('verification-badge');
    expect(badge).toHaveAttribute('data-status', 'unverified');
  });
});
