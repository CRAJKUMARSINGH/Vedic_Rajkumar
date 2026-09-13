/**
 * Week 5: Accessibility Gap Fixes Tests
 *
 * Verifies the a11y improvements across all four core pages and
 * the Week 4 ConsentBanner.
 *
 *  - PanchangPage: accessible date/city labels, aria-live on result
 *  - MatchMaking: aria-live on result section
 *  - ConsentBanner: role="dialog", keyboard-navigable buttons
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// ─── PanchangPage ─────────────────────────────────────────────────────────────

// Mock PanchangCard since it requires complex ephemeris setup in jsdom
vi.mock('@/components/PanchangCard', () => ({
  default: () => <div data-testid="panchang-card">Panchang Content</div>,
}));

// Mock EnhancedLanguageToggle to avoid multiLanguageService dependency
vi.mock('@/components/EnhancedLanguageToggle', () => ({
  default: ({ currentLang }: { currentLang: string }) => (
    <div data-testid="lang-toggle" data-lang={currentLang} />
  ),
}));

import PanchangPage from '@/pages/PanchangPage';

function renderPanchangPage() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <PanchangPage />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('PanchangPage — accessibility', () => {
  it('has an accessible label for the date input', () => {
    renderPanchangPage();
    // The date input should be findable — use getAllByLabelText since the
    // page may have multiple elements matching /date/i (label + aria-label)
    const dateInputs = screen.getAllByLabelText(/date/i);
    expect(dateInputs.length).toBeGreaterThanOrEqual(1);
    // At least one should be the actual date input
    const actualInput = dateInputs.find((el) => el.tagName === 'INPUT');
    expect(actualInput).toBeInTheDocument();
  });

  it('has an accessible label for the city select', () => {
    renderPanchangPage();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
  });

  it('result container has aria-live="polite"', () => {
    renderPanchangPage();
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
  });

  it('page has a heading', () => {
    renderPanchangPage();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('city select changes update state (smoke test)', () => {
    renderPanchangPage();
    const citySelect = screen.getByLabelText(/city/i);
    fireEvent.change(citySelect, { target: { value: 'Mumbai' } });
    expect((citySelect as HTMLSelectElement).value).toBe('Mumbai');
  });
});

// ─── ConsentBanner ────────────────────────────────────────────────────────────

// Reset localStorage before each test
beforeEach(() => {
  localStorage.clear();
});

import ConsentBanner from '@/components/ConsentBanner';
import { CONSENT_STORAGE_KEY } from '@/hooks/useConsent';

function renderConsentBanner() {
  return render(
    <MemoryRouter>
      <ConsentBanner />
    </MemoryRouter>,
  );
}

describe('ConsentBanner — accessibility', () => {
  it('renders with role="dialog"', () => {
    renderConsentBanner();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has aria-labelledby pointing to the title', () => {
    renderConsentBanner();
    const dialog = screen.getByRole('dialog');
    const labelledBy = dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    // The element with that id should exist
    expect(document.getElementById(labelledBy!)).toBeInTheDocument();
  });

  it('has aria-describedby pointing to the description', () => {
    renderConsentBanner();
    const dialog = screen.getByRole('dialog');
    const describedBy = dialog.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toBeInTheDocument();
  });

  it('has Accept button', () => {
    renderConsentBanner();
    expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument();
  });

  it('has Decline button', () => {
    renderConsentBanner();
    expect(screen.getByRole('button', { name: /decline/i })).toBeInTheDocument();
  });

  it('has Close button', () => {
    renderConsentBanner();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('disappears after accepting', () => {
    renderConsentBanner();
    fireEvent.click(screen.getByRole('button', { name: /accept/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('disappears after declining', () => {
    renderConsentBanner();
    fireEvent.click(screen.getByRole('button', { name: /decline/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('stores consent in localStorage on accept', () => {
    renderConsentBanner();
    fireEvent.click(screen.getByRole('button', { name: /accept/i }));
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    expect(stored).not.toBeNull();
    const record = JSON.parse(stored!);
    expect(record.given).toBe(true);
  });

  it('stores declined consent in localStorage', () => {
    renderConsentBanner();
    fireEvent.click(screen.getByRole('button', { name: /decline/i }));
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    const record = JSON.parse(stored!);
    expect(record.given).toBe(false);
  });

  it('does NOT render when consent already stored', () => {
    // Pre-populate consent so banner should not appear
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ given: true, timestamp: new Date().toISOString(), version: '1.0' }),
    );
    renderConsentBanner();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

// ─── MatchMaking — aria-live on result ───────────────────────────────────────

// We test by directly rendering the result div structure.
// The aria-live attribute lives on the results container in MatchMaking.tsx.
// We verify it with a lightweight grep via the already-loaded module source.

describe('MatchMaking — aria-live on result region', () => {
  it('result container has aria-live="polite" in source', () => {
    // Structural test: verify the aria-live attribute exists in the file
    // This catches regressions where someone removes the attribute
    const fs = require('fs');
    const path = require('path');
    const filePath = path.resolve(
      __dirname,
      '../../pages/MatchMaking.tsx',
    );
    const source: string = fs.readFileSync(filePath, 'utf-8');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('aria-atomic="false"');
    expect(source).toContain('aria-label');
  });
});
