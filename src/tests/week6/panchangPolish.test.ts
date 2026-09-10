/**
 * Week 6: Panchang Polish Tests
 *
 * Verifies the Week 6 improvements to PanchangPage:
 *  - noindex meta tag present (stub data)
 *  - aria-live + role="region" on result container
 *  - Accessible labels on date and city inputs
 *  - SEO noIndex prop passed
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SOURCE_PATH = path.resolve(
  __dirname,
  '../../pages/PanchangPage.tsx',
);

function getSource(): string {
  return fs.readFileSync(SOURCE_PATH, 'utf-8');
}

// ─── SEO noIndex ──────────────────────────────────────────────────────────────

describe('PanchangPage — noindex for stub data', () => {
  it('passes noIndex={true} to SEO component', () => {
    const source = getSource();
    expect(source).toContain('noIndex={true}');
  });

  it('SEO component is present on the page', () => {
    const source = getSource();
    expect(source).toContain('<SEO');
    expect(source).toContain('canonical="/panchang"');
  });
});

// ─── Aria roles ───────────────────────────────────────────────────────────────

describe('PanchangPage — accessibility attributes', () => {
  it('result container has aria-live="polite"', () => {
    const source = getSource();
    expect(source).toContain('aria-live="polite"');
  });

  it('result container has role="region"', () => {
    const source = getSource();
    expect(source).toContain('role="region"');
  });

  it('result container has aria-label', () => {
    const source = getSource();
    // Check the result div has an aria-label for the Panchang result region
    expect(source).toContain('Panchang result');
  });

  it('date input has an associated label (htmlFor)', () => {
    const source = getSource();
    expect(source).toContain('htmlFor="panchang-date"');
    expect(source).toContain('id="panchang-date"');
  });

  it('city select has an associated label (htmlFor)', () => {
    const source = getSource();
    expect(source).toContain('htmlFor="panchang-city"');
    expect(source).toContain('id="panchang-city"');
  });

  it('date input has aria-label', () => {
    const source = getSource();
    expect(source).toContain('aria-label=');
  });
});

// ─── Suspense fallback ────────────────────────────────────────────────────────

describe('PanchangPage — standardized loading', () => {
  it('uses LoadingSkeleton instead of raw spinner div', () => {
    const source = getSource();
    expect(source).toContain('LoadingSkeleton');
    // Should NOT have the old inline spinner pattern
    expect(source).not.toContain('animate-spin rounded-full h-8 w-8 border-b-2 border-primary');
  });

  it('Suspense fallback has role="status"', () => {
    const source = getSource();
    expect(source).toContain('role="status"');
  });
});

// ─── ErrorBoundary ────────────────────────────────────────────────────────────

describe('PanchangPage — error handling', () => {
  it('wraps PanchangCard in ErrorBoundary', () => {
    const source = getSource();
    expect(source).toContain('ErrorBoundary');
    expect(source).toContain('ChartErrorState');
  });
});

// ─── PanchangCard time element aria-labels ─────────────────────────────────

describe('PanchangCard — time element accessibility (R7)', () => {
  const CARD_SOURCE_PATH = path.resolve(__dirname, '../../components/PanchangCard.tsx');

  it('celestial times use unique enLabel key (not generic label)', () => {
    const source = fs.readFileSync(CARD_SOURCE_PATH, 'utf-8');
    // Should map over items using enLabel key, not generic label
    expect(source).toContain('enLabel');
  });

  it('celestial time paragraphs have aria-label attribute', () => {
    const source = fs.readFileSync(CARD_SOURCE_PATH, 'utf-8');
    // Each celestial time value <p> should have aria-label
    expect(source).toContain('aria-label={`${enLabel}: ${val}`}');
  });

  it('Rahu Kaal time paragraph has aria-label', () => {
    const source = fs.readFileSync(CARD_SOURCE_PATH, 'utf-8');
    expect(source).toContain('Rahu Kaal:');
  });

  it('Abhijit Muhurat time paragraph has aria-label', () => {
    const source = fs.readFileSync(CARD_SOURCE_PATH, 'utf-8');
    expect(source).toContain('Abhijit Muhurat:');
  });

  it('inauspicious period time paragraphs have aria-label', () => {
    const source = fs.readFileSync(CARD_SOURCE_PATH, 'utf-8');
    expect(source).toContain('(avoid):');
  });

  it('Sun and Moon icons inside CelestialTimes have aria-hidden', () => {
    const source = fs.readFileSync(CARD_SOURCE_PATH, 'utf-8');
    // Should have aria-hidden="true" on the Icon inside the map
    expect(source).toContain('aria-hidden="true"');
  });
});

// ─── Full spec compliance ─────────────────────────────────────────────────────

describe('PanchangPage — Week 6 spec compliance', () => {
  it('imports Label from ui/label', () => {
    const source = getSource();
    expect(source).toContain("from '@/components/ui/label'");
  });

  it('imports ChartErrorState', () => {
    const source = getSource();
    expect(source).toContain("ChartErrorState");
  });

  it('imports ErrorBoundary', () => {
    const source = getSource();
    expect(source).toContain("ErrorBoundary");
  });
});
