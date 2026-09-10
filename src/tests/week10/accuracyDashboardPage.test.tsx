/**
 * Week 10: Accuracy Dashboard Page Tests
 *
 * Tests for AccuracyDashboardPage:
 *  - Initial render (empty state, heading, Run button)
 *  - Result render (summary counts, chart table)
 *  - Route registration
 *  - Source structure checks
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import * as fs from 'fs';
import * as path from 'path';

import AccuracyDashboardPage from '@/pages/AccuracyDashboardPage';

function renderPage() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <AccuracyDashboardPage />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function clickRunButton() {
  // Two "Run Validation" buttons: header toolbar + empty-state action
  const btns = screen.getAllByRole('button', { name: /run validation/i });
  fireEvent.click(btns[0]);
}

// ─── Initial render ───────────────────────────────────────────────────────────

describe('AccuracyDashboardPage — initial render', () => {
  it('renders the page heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/accuracy dashboard/i)).toBeInTheDocument();
  });

  it('shows the Run Validation button', () => {
    renderPage();
    const btns = screen.getAllByRole('button', { name: /run validation/i });
    expect(btns.length).toBeGreaterThanOrEqual(1);
  });

  it('shows empty state before running', () => {
    renderPage();
    expect(screen.getByText(/run the validation suite/i)).toBeInTheDocument();
  });

  it('does NOT show chart table before running', () => {
    renderPage();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});

// ─── After running ────────────────────────────────────────────────────────────

describe('AccuracyDashboardPage — after running suite', () => {
  it('shows per-chart table with 15 rows after run', async () => {
    renderPage();
    clickRunButton();
    await waitFor(
      () => expect(screen.getByRole('table')).toBeInTheDocument(),
      { timeout: 5000 },
    );
    const rows = screen.getAllByRole('row');
    // 1 header row + 15 data rows = 16
    expect(rows.length).toBe(16);
  }, 10000);

  it('shows field accuracy percentage after run', async () => {
    renderPage();
    clickRunButton();
    await waitFor(
      () => {
        // The summary card has a specific label "Field Accuracy"
        const headings = screen.getAllByText(/field accuracy/i);
        expect(headings.length).toBeGreaterThan(0);
      },
      { timeout: 5000 },
    );
  }, 10000);

  it('shows PASS count badge after run', async () => {
    renderPage();
    clickRunButton();
    await waitFor(
      () => {
        // At least one PASS badge should appear
        const passBadges = screen.getAllByText('PASS');
        expect(passBadges.length).toBeGreaterThan(0);
      },
      { timeout: 5000 },
    );
  }, 10000);

  it('shows Recalculate button after first run', async () => {
    renderPage();
    clickRunButton();
    await waitFor(
      () => expect(screen.getByRole('button', { name: /recalculate/i })).toBeInTheDocument(),
      { timeout: 5000 },
    );
  }, 10000);

  it('result section has aria-live attribute', async () => {
    renderPage();
    clickRunButton();
    await waitFor(
      () => expect(document.querySelector('[aria-live]')).toBeInTheDocument(),
      { timeout: 5000 },
    );
  }, 10000);
});

// ─── Route registration ───────────────────────────────────────────────────────

describe('Route and registry registration', () => {
  it('/accuracy is in appRoutes', () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, '../../routes/appRoutes.tsx'), 'utf-8',
    );
    expect(src).toContain('/accuracy');
    expect(src).toContain('AccuracyDashboardPage');
  });

  it('/accuracy is in featureRegistry', () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, '../../routes/featureRegistry.ts'), 'utf-8',
    );
    expect(src).toContain('/accuracy');
    expect(src).toContain('Accuracy Dashboard');
  });
});

// ─── Source structure ─────────────────────────────────────────────────────────

describe('AccuracyDashboardPage — source structure', () => {
  const src = fs.readFileSync(
    path.resolve(__dirname, '../../pages/AccuracyDashboardPage.tsx'), 'utf-8',
  );

  it('uses noIndex={true} SEO tag', () => {
    expect(src).toContain('noIndex={true}');
  });

  it('uses aria-live on result section', () => {
    expect(src).toContain('aria-live');
  });

  it('uses aria-busy on Recalculate button', () => {
    expect(src).toContain('aria-busy={isLoading}');
  });

  it('imports runAccuracyCheck from accuracyDashboardService', () => {
    expect(src).toContain('runAccuracyCheck');
    expect(src).toContain('accuracyDashboardService');
  });
});

describe('accuracyDashboardService — source structure', () => {
  const src = fs.readFileSync(
    path.resolve(__dirname, '../../services/accuracyDashboardService.ts'), 'utf-8',
  );

  it('has no @ts-nocheck', () => {
    expect(src).not.toContain('@ts-nocheck');
  });

  it('exports runAccuracyCheck', () => {
    expect(src).toContain('export function runAccuracyCheck');
  });

  it('WEEK10_ACCURACY_DASHBOARD_SPEC.md exists', () => {
    const exists = fs.existsSync(
      path.resolve(__dirname, '../../../docs/WEEK10_ACCURACY_DASHBOARD_SPEC.md'),
    );
    expect(exists).toBe(true);
  });
});
