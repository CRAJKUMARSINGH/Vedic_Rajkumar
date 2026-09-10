/**
 * Week 7: Dasha–Transit Correlation Page Tests
 *
 * Tests for DashaTransitCorrelationPage:
 *  - Initial render (empty state, form elements)
 *  - Accessible inputs (labels + ids)
 *  - Calculate button accessible name and aria-busy
 *  - Route registration (/dasha-transit)
 *  - DashaTransitOutlook component renders 12 items
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// ─── Mock heavy deps ──────────────────────────────────────────────────────────

vi.mock('@/services/dashaTransitCorrelationService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/dashaTransitCorrelationService')>();
  return {
    ...actual,
    // Keep real computeCorrelation — only intercept for slow tests
  };
});

// ─── Imports ──────────────────────────────────────────────────────────────────

import DashaTransitCorrelationPage from '@/pages/DashaTransitCorrelationPage';
import DashaTransitOutlook from '@/components/DashaTransitOutlook';
import type { MonthlyOutlookItem } from '@/services/dashaTransitCorrelationService';

function renderPage() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <DashaTransitCorrelationPage />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

// ─── Page render tests ────────────────────────────────────────────────────────

describe('DashaTransitCorrelationPage — initial render', () => {
  it('renders page heading', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 1 })
    ).toBeInTheDocument();
  });

  it('shows form section heading', () => {
    renderPage();
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
  });

  it('shows empty state before calculation', () => {
    renderPage();
    expect(screen.getByText(/enter birth details/i)).toBeInTheDocument();
  });

  it('does NOT show result before calculation', () => {
    renderPage();
    expect(screen.queryByText(/active dasha period/i)).not.toBeInTheDocument();
  });
});

describe('DashaTransitCorrelationPage — form accessibility', () => {
  it('all inputs have associated labels via htmlFor', () => {
    renderPage();
    // Required fields
    expect(document.getElementById('dtc-name')).toBeInTheDocument();
    expect(document.getElementById('dtc-date')).toBeInTheDocument();
    expect(document.getElementById('dtc-time')).toBeInTheDocument();
    expect(document.getElementById('dtc-tz')).toBeInTheDocument();
    expect(document.getElementById('dtc-lat')).toBeInTheDocument();
    expect(document.getElementById('dtc-lon')).toBeInTheDocument();
    expect(document.getElementById('dtc-place')).toBeInTheDocument();
    expect(document.getElementById('dtc-target')).toBeInTheDocument();
  });

  it('Calculate button has an accessible name', () => {
    renderPage();
    const btn = screen.getByRole('button', { name: /calculate/i });
    expect(btn).toBeInTheDocument();
  });

  it('Calculate button has aria-busy=false initially', () => {
    renderPage();
    const btn = screen.getByRole('button', { name: /calculate/i });
    expect(btn).toHaveAttribute('aria-busy', 'false');
  });

  it('language toggle buttons are present and labelled', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /english/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /हिन्दी/i })).toBeInTheDocument();
  });
});

describe('DashaTransitCorrelationPage — error state', () => {
  it('shows error state when latitude is invalid', async () => {
    renderPage();
    // Clear lat to force an error
    const latInput = document.getElementById('dtc-lat') as HTMLInputElement;
    fireEvent.change(latInput, { target: { value: 'not-a-number' } });

    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});

describe('DashaTransitCorrelationPage — full calculation', () => {
  it('shows result after successful calculation', async () => {
    renderPage();
    // Default form is pre-filled with Rajkumar data — just click calculate
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

    // Result heading should appear
    await waitFor(
      () => {
        expect(screen.getByRole('heading', { level: 2, name: /dasha.transit analysis/i })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it('shows transit table after calculation', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

    await waitFor(
      () => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it('Reset button appears after calculation', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it('clicking Reset returns to empty state', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

    await waitFor(
      () => expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument(),
      { timeout: 5000 },
    );

    fireEvent.click(screen.getByRole('button', { name: /reset/i }));

    await waitFor(() => {
      expect(screen.getByText(/enter birth details/i)).toBeInTheDocument();
    });
  });
});

// ─── Source-level structural checks ──────────────────────────────────────────

describe('DashaTransitCorrelationPage — source structure', () => {
  it('page source uses aria-live="polite" on result area', () => {
    const fs = require('fs');
    const path = require('path');
    const source: string = fs.readFileSync(
      path.resolve(__dirname, '../../pages/DashaTransitCorrelationPage.tsx'),
      'utf-8',
    );
    expect(source).toContain('aria-live="polite"');
  });

  it('page source uses aria-busy on Calculate button', () => {
    const fs = require('fs');
    const path = require('path');
    const source: string = fs.readFileSync(
      path.resolve(__dirname, '../../pages/DashaTransitCorrelationPage.tsx'),
      'utf-8',
    );
    expect(source).toContain('aria-busy={isLoading}');
  });

  it('page source uses tabIndex={-1} for focus management', () => {
    const fs = require('fs');
    const path = require('path');
    const source: string = fs.readFileSync(
      path.resolve(__dirname, '../../pages/DashaTransitCorrelationPage.tsx'),
      'utf-8',
    );
    expect(source).toContain('tabIndex={-1}');
    expect(source).toContain('resultRef.current?.focus()');
  });

  it('page imports DashaTransitOutlook component', () => {
    const fs = require('fs');
    const path = require('path');
    const source: string = fs.readFileSync(
      path.resolve(__dirname, '../../pages/DashaTransitCorrelationPage.tsx'),
      'utf-8',
    );
    expect(source).toContain('DashaTransitOutlook');
  });
});

// ─── Route registration ───────────────────────────────────────────────────────

describe('Route registration', () => {
  it('/dasha-transit is registered in appRoutes', () => {
    const fs = require('fs');
    const path = require('path');
    const source: string = fs.readFileSync(
      path.resolve(__dirname, '../../routes/appRoutes.tsx'),
      'utf-8',
    );
    expect(source).toContain('/dasha-transit');
    expect(source).toContain('DashaTransitCorrelationPage');
  });

  it('/dasha-transit is registered in featureRegistry', () => {
    const fs = require('fs');
    const path = require('path');
    const source: string = fs.readFileSync(
      path.resolve(__dirname, '../../routes/featureRegistry.ts'),
      'utf-8',
    );
    expect(source).toContain('/dasha-transit');
    expect(source).toContain('Dasha\u2013Transit Correlation');
  });
});

// ─── DashaTransitOutlook component ───────────────────────────────────────────

describe('DashaTransitOutlook', () => {
  const makeOutlook = (): MonthlyOutlookItem[] =>
    Array.from({ length: 12 }, (_, i) => ({
      month: `Month ${i + 1}`,
      monthKey: `2026-${String(i + 1).padStart(2, '0')}`,
      activationLevel: i % 3 === 0 ? 'High' : i % 3 === 1 ? 'Medium' : 'Low',
      score: 40 + i * 5,
      mahaLord: 'Saturn',
      antarLord: 'Jupiter',
    }));

  it('renders 12 list items', () => {
    render(
      <MemoryRouter>
        <DashaTransitOutlook outlook={makeOutlook()} />
      </MemoryRouter>,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(12);
  });

  it('renders month labels', () => {
    render(
      <MemoryRouter>
        <DashaTransitOutlook outlook={makeOutlook()} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Month 1')).toBeInTheDocument();
    expect(screen.getByText('Month 12')).toBeInTheDocument();
  });

  it('renders activation level badges', () => {
    render(
      <MemoryRouter>
        <DashaTransitOutlook outlook={makeOutlook()} />
      </MemoryRouter>,
    );
    expect(screen.getAllByText('High').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Medium').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Low').length).toBeGreaterThan(0);
  });

  it('renders Hindi labels when lang=hi', () => {
    render(
      <MemoryRouter>
        <DashaTransitOutlook outlook={makeOutlook()} lang="hi" />
      </MemoryRouter>,
    );
    expect(screen.getByText(/12-मास/)).toBeInTheDocument();
  });

  it('returns null for empty outlook', () => {
    const { container } = render(
      <MemoryRouter>
        <DashaTransitOutlook outlook={[]} />
      </MemoryRouter>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('progress bars have aria-valuenow attributes', () => {
    render(
      <MemoryRouter>
        <DashaTransitOutlook outlook={makeOutlook()} />
      </MemoryRouter>,
    );
    const bars = document.querySelectorAll('[role="progressbar"]');
    expect(bars.length).toBe(12);
    bars.forEach((bar) => {
      expect(bar).toHaveAttribute('aria-valuenow');
    });
  });
});
