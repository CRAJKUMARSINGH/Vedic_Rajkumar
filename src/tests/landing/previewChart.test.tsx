/**
 * Landing chart-preview consistency (c4 / Lovable-hub enrichment, Phase 3).
 *
 * The preview must be derived from the canonical synthetic fixture — never a
 * hand-drawn chart with its own labels. These tests assert the invariants and
 * that the SVG graphic and the planetary table agree.
 */

import { describe, it, expect } from 'vitest';
import type { ReactElement } from 'react';
import { render, screen, within } from '@testing-library/react';
import {
  buildLandingPreview,
  deriveChecks,
  formatAyanamsa,
  SYNTHETIC_BIRTH,
  EXPECTED_GRAHAS,
} from '@/features/landing/previewChart';
import { KANCHI_BIRTH } from '@/lib/vedic/vedicCalc';
import {
  NAKSHATRA_NAMES_EN,
  NAKSHATRA_SPAN,
  PADA_SPAN,
} from '@/constants/astrology';
import { planetAbbr, label } from '@/features/charts/model/labels';
import { ChartPreview } from '@/components/landing/ChartPreview';
import axe from 'axe-core';

const preview = buildLandingPreview();

/** axe cannot judge colour contrast in jsdom; it still checks roles/labels/headings. */
async function scanA11y(ui: ReactElement) {
  const { container } = render(ui);
  const results = await axe.run(container);
  return results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''));
}

describe('landing preview fixture', () => {
  it('projects all nine grahas from the canonical engine', () => {
    expect(preview.viewModel.planets).toHaveLength(9);
    for (const key of EXPECTED_GRAHAS) {
      expect(preview.viewModel.planets.some((p) => p.key === key)).toBe(true);
    }
  });

  it('is internally consistent (all invariants hold)', () => {
    expect(preview.checks).toEqual({
      ascendantIsHouse1: true,
      houseSignsSequential: true,
      planetHousesMatchSigns: true,
      rahuKetuOpposition: true,
      allGrahasWithNakshatra: true,
    });
  });

  it('places the ascendant in house 1 with sequential whole-sign houses', () => {
    const asc = preview.viewModel.ascendantSign;
    expect(asc).not.toBeNull();
    expect(preview.viewModel.houses[0].isAscendant).toBe(true);
    preview.viewModel.houses.forEach((h, i) => {
      expect(h.sign).toBe(((asc as number) + i) % 12);
    });
  });

  it('keeps Rahu and Ketu exactly opposite', () => {
    const rahu = preview.viewModel.planets.find((p) => p.key === 'Rahu')!;
    const ketu = preview.viewModel.planets.find((p) => p.key === 'Ketu')!;
    const diff = (((ketu.longitude! - rahu.longitude!) % 360) + 360) % 360;
    expect(Math.abs(diff - 180)).toBeLessThanOrEqual(0.5);
  });

  it('derives nakshatra and pada from longitude (no hardcoded values)', () => {
    for (const p of preview.viewModel.planets) {
      expect(p.longitude).not.toBeNull();
      const lon = p.longitude as number;
      const index = Math.floor(lon / NAKSHATRA_SPAN);
      const expectedPada = Math.floor((lon % NAKSHATRA_SPAN) / PADA_SPAN) + 1;
      expect(p.nakshatra?.name.en).toBe(NAKSHATRA_NAMES_EN[index]);
      expect(p.nakshatra?.pada).toBe(expectedPada);
    }
  });

  it('labels the ayanamsa and its settings', () => {
    expect(preview.ayanamsaValue).toBeGreaterThan(23);
    expect(preview.ayanamsaValue).toBeLessThan(24.5);
    expect(preview.ayanamsaLabel).toMatch(/^Lahiri \(Chitrapaksha\) \d+°\d{2}′\d{2}″$/);
    expect(preview.settingsLabel).toContain('Sidereal');
    expect(preview.viewModel.calculation.zodiac).toBe('sidereal');
  });

  it('uses only synthetic inputs — no seed-bank data', () => {
    expect(SYNTHETIC_BIRTH.year).not.toBe(KANCHI_BIRTH.year);
    expect(SYNTHETIC_BIRTH.latitude).not.toBe(KANCHI_BIRTH.lat);
    expect(SYNTHETIC_BIRTH.longitude).not.toBe(KANCHI_BIRTH.lon);
  });

  it('formats ayanamsa as deg°min′sec″', () => {
    expect(formatAyanamsa(23.85472)).toBe('23°51′17″');
  });

  it('flags a broken model via deriveChecks', () => {
    const broken = { ...preview.viewModel, ascendantSign: null };
    expect(deriveChecks(broken).ascendantIsHouse1).toBe(false);
    expect(deriveChecks(broken).houseSignsSequential).toBe(false);
  });
});

describe('ChartPreview render consistency', () => {
  it('draws the chart and the planetary table from the same model', () => {
    render(<ChartPreview preview={preview} lang="en" />);

    expect(screen.getByTestId('north-indian-chart')).toBeInTheDocument();
    expect(screen.getByTestId('chart-details')).toBeInTheDocument();

    for (const p of preview.viewModel.planets) {
      const row = screen.getByTestId(`detail-row-${p.key}`);
      expect(row).toHaveTextContent(label(p.name, 'en'));
      if (p.signName) expect(row).toHaveTextContent(label(p.signName, 'en'));
      if (p.nakshatra) expect(row).toHaveTextContent(label(p.nakshatra.name, 'en'));
      if (p.house !== null) {
        const node = screen.getByTestId(`house-${p.house}-planet-${p.key}`);
        expect(node).toHaveTextContent(planetAbbr(p.key, 'en'));
      }
    }
  });

  it('puts the same sign number in each compartment as the table implies', () => {
    render(<ChartPreview preview={preview} lang="en" />);
    preview.viewModel.houses.forEach((h) => {
      if (h.sign === null) return;
      expect(screen.getByTestId(`house-sign-${h.house}`)).toHaveTextContent(String(h.sign + 1));
    });
  });

  it('renders bilingual labels (Devanagari) in Hindi mode', () => {
    render(<ChartPreview preview={preview} lang="hi" />);
    const sun = preview.viewModel.planets.find((p) => p.key === 'Sun')!;
    const row = screen.getByTestId('detail-row-Sun');
    expect(row).toHaveTextContent(label(sun.name, 'hi'));
    expect(screen.getByTestId('ascendant-marker')).toHaveTextContent('लग्न');
  });

  it('exposes an accessible chart with a labelled table', () => {
    render(<ChartPreview preview={preview} lang="en" />);
    const svg = screen.getByTestId('north-indian-chart');
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg.getAttribute('aria-label')).toMatch(/chart/i);
    const table = screen.getByTestId('chart-details');
    expect(within(table).getAllByRole('row')).toHaveLength(
      preview.viewModel.planets.length + 1,
    );
  });
});

describe('landing preview accessibility (axe-core)', () => {
  it('has no serious/critical violations in English', async () => {
    expect(await scanA11y(<ChartPreview preview={preview} lang="en" />)).toEqual([]);
  });

  it('has no serious/critical violations in Hindi', async () => {
    expect(await scanA11y(<ChartPreview preview={preview} lang="hi" />)).toEqual([]);
  });
});
