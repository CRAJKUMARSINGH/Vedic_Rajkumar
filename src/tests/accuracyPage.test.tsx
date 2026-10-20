/**
 * The published accuracy panel is the product, so it gets a test.
 *
 * Asserts the two things that make it different from every other Jyotish app:
 *   1. the unverified list is present and names the layers that matter
 *   2. the delta-T caveat is present
 *
 * Plus the one honesty property: a body whose observed error exceeds its claim
 * must be rendered as failing, not as green.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AccuracyDashboardPage from '@/pages/AccuracyDashboardPage';
import { UNVERIFIED_AREAS, loadAccuracyReport } from '@/lib/accuracyReport';

function renderPage() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <AccuracyDashboardPage />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('/accuracy published report', () => {
  it('renders', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: /accuracy/i })).toBeInTheDocument();
  });

  it('names what it has not verified', () => {
    renderPage();
    const list = screen.getByTestId('unverified-list');
    const items = list.querySelectorAll('li');
    expect(items.length).toBeGreaterThanOrEqual(4);

    const text = list.textContent ?? '';
    for (const area of ['dasha', 'Yogas', 'Shadbala', 'Divisional']) {
      expect(text.toLowerCase()).toContain(area.toLowerCase());
    }
  });

  it('carries the delta-T caveat', () => {
    renderPage();
    const caveat = screen.getByTestId('deltat-caveat');
    expect((caveat.textContent ?? '').toLowerCase()).toContain('delta-t');
    expect((caveat.textContent ?? '').toLowerCase()).toContain('floor');
  });

  it('reports the frame it used', () => {
    renderPage();
    expect(screen.getByText(/Frame:/)).toBeInTheDocument();
  });
});

describe('loadAccuracyReport', () => {
  it('tolerates an empty object', () => {
    const report = loadAccuracyReport({});
    expect(report.bodies).toEqual([]);
    expect(report.unverified.length).toBe(UNVERIFIED_AREAS.length);
    expect(report.deltaT.uncertaintySeconds).toEqual([3, 10]);
  });

  it('derives the verdict from the numbers, not from the field', () => {
    const report = loadAccuracyReport({
      bodies: [
        { body: 'Sun', claimArcsec: 30, maxArcsec: 90, observedArcsec: 12 },
        { body: 'Jupiter', claimArcsec: 2, maxArcsec: 8, observedArcsec: 40 },
      ],
    });
    expect(report.bodies[0].verdict).toBe('pass');
    expect(report.bodies[1].verdict).toBe('fail');
  });

  it('marks an unmeasured body as unmeasured rather than passing it', () => {
    const report = loadAccuracyReport({ bodies: [{ body: 'Moon', claimArcsec: 15, maxArcsec: 45 }] });
    expect(report.bodies[0].verdict).toBe('unmeasured');
  });
});
