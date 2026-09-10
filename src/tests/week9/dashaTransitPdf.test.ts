/**
 * Week 9: Dasha–Transit PDF Service Tests
 *
 * Tests for buildPdfContent() — the pure, side-effect-free function
 * that converts a DashaTransitCorrelationResult into structured PDF content.
 *
 * No jsPDF / browser required for these tests.
 * exportDashaTransitPdf() is excluded (requires DOM + dynamic import).
 *
 * Reference birth data: Rajkumar (1963-09-15, Aspur, Rajasthan)
 * Target date: 2026-09-04
 */

import { describe, it, expect } from 'vitest';
import {
  buildPdfContent,
  type PdfContent,
  type PdfSection,
} from '@/services/dashaTransitPdfService';
import { computeCorrelation } from '@/services/dashaTransitCorrelationService';
import type { BirthData } from '@/features/kundli/types';

// ─── Reference data ───────────────────────────────────────────────────────────

const BIRTH: BirthData = {
  name:      'Rajkumar',
  date:      '1963-09-15',
  time:      '06:00',
  timezone:  'Asia/Kolkata',
  latitude:  23.5,
  longitude: 74.32,
  place:     'Aspur, Rajasthan',
};

const TARGET_DATE = '2026-09-04';

// Pre-compute once for all tests
const CORRELATION = computeCorrelation(BIRTH, TARGET_DATE);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sections(content: PdfContent): PdfSection[] {
  return content.sections;
}

function sectionsByType<T extends PdfSection['type']>(
  content: PdfContent,
  type: T,
): Extract<PdfSection, { type: T }>[] {
  return sections(content).filter(
    (s): s is Extract<PdfSection, { type: T }> => s.type === type,
  );
}

// ─── buildPdfContent — structure ─────────────────────────────────────────────

describe('buildPdfContent — title and metadata', () => {
  it('returns a title string', () => {
    const c = buildPdfContent(CORRELATION, { nativeName: 'Rajkumar' });
    expect(c.title).toBeTruthy();
    expect(typeof c.title).toBe('string');
  });

  it('title includes the native name (en)', () => {
    const c = buildPdfContent(CORRELATION, { nativeName: 'Rajkumar', lang: 'en' });
    expect(c.title).toContain('Rajkumar');
  });

  it('title includes the native name (hi)', () => {
    const c = buildPdfContent(CORRELATION, { nativeName: 'Rajkumar', lang: 'hi' });
    expect(c.title).toContain('Rajkumar');
  });

  it('title contains Dasha-Transit keywords (en)', () => {
    const c = buildPdfContent(CORRELATION, { lang: 'en' });
    expect(c.title.toLowerCase()).toMatch(/dasha|transit|correlation/i);
  });

  it('title contains Dasha-Transit keywords (hi)', () => {
    const c = buildPdfContent(CORRELATION, { lang: 'hi' });
    // Hindi title should contain दशा or गोचर
    expect(c.title).toMatch(/दशा|गोचर/);
  });

  it('subtitle is a non-empty string', () => {
    const c = buildPdfContent(CORRELATION);
    expect(c.subtitle).toBeTruthy();
  });

  it('metadata.nativeName matches option', () => {
    const c = buildPdfContent(CORRELATION, { nativeName: 'Test Name' });
    expect(c.metadata.nativeName).toBe('Test Name');
  });

  it('metadata.nativeName defaults to Native', () => {
    const c = buildPdfContent(CORRELATION);
    expect(c.metadata.nativeName).toBe('Native');
  });

  it('metadata.targetDate matches the correlation result', () => {
    const c = buildPdfContent(CORRELATION);
    expect(c.metadata.targetDate).toBe(TARGET_DATE);
  });

  it('metadata.moonSign is a non-empty string', () => {
    const c = buildPdfContent(CORRELATION);
    expect(c.metadata.moonSign).toBeTruthy();
  });

  it('metadata.generatedAt is a non-empty string', () => {
    const c = buildPdfContent(CORRELATION);
    expect(c.metadata.generatedAt).toBeTruthy();
  });
});

// ─── buildPdfContent — section count and types ───────────────────────────────

describe('buildPdfContent — sections array', () => {
  it('returns at least 10 sections', () => {
    const c = buildPdfContent(CORRELATION);
    expect(c.sections.length).toBeGreaterThanOrEqual(10);
  });

  it('contains at least 4 heading sections (one per major section)', () => {
    const c = buildPdfContent(CORRELATION);
    const headings = sectionsByType(c, 'heading');
    expect(headings.length).toBeGreaterThanOrEqual(4);
  });

  it('contains at least one score section', () => {
    const c = buildPdfContent(CORRELATION);
    expect(sectionsByType(c, 'score').length).toBeGreaterThanOrEqual(1);
  });

  it('contains at least one table section', () => {
    const c = buildPdfContent(CORRELATION);
    expect(sectionsByType(c, 'table').length).toBeGreaterThanOrEqual(1);
  });

  it('contains at least one outlook section', () => {
    const c = buildPdfContent(CORRELATION);
    expect(sectionsByType(c, 'outlook').length).toBeGreaterThanOrEqual(1);
  });

  it('contains at least one kv (key-value) section', () => {
    const c = buildPdfContent(CORRELATION);
    expect(sectionsByType(c, 'kv').length).toBeGreaterThanOrEqual(1);
  });

  it('contains at least one divider section', () => {
    const c = buildPdfContent(CORRELATION);
    expect(sectionsByType(c, 'divider').length).toBeGreaterThanOrEqual(1);
  });

  it('contains at least one text section (prediction or disclaimer)', () => {
    const c = buildPdfContent(CORRELATION);
    expect(sectionsByType(c, 'text').length).toBeGreaterThanOrEqual(1);
  });

  it('every section has a valid type string', () => {
    const c = buildPdfContent(CORRELATION);
    const validTypes = new Set(['heading', 'text', 'divider', 'kv', 'table', 'score', 'outlook']);
    c.sections.forEach((s) => {
      expect(validTypes.has(s.type)).toBe(true);
    });
  });
});

// ─── buildPdfContent — active dasha section ──────────────────────────────────

describe('buildPdfContent — dasha kv section', () => {
  it('kv section contains Mahadasha label (en)', () => {
    const c = buildPdfContent(CORRELATION, { lang: 'en' });
    const kvs = sectionsByType(c, 'kv');
    const labels = kvs.flatMap((kv) => kv.rows.map((r) => r.label));
    expect(labels.some((l) => /mahadasha/i.test(l))).toBe(true);
  });

  it('kv section contains Antardasha label (en)', () => {
    const c = buildPdfContent(CORRELATION, { lang: 'en' });
    const kvs = sectionsByType(c, 'kv');
    const labels = kvs.flatMap((kv) => kv.rows.map((r) => r.label));
    expect(labels.some((l) => /antardasha/i.test(l))).toBe(true);
  });

  it('kv section Mahadasha value contains the active mahaLord', () => {
    const c = buildPdfContent(CORRELATION, { lang: 'en' });
    const kvs = sectionsByType(c, 'kv');
    const mahaRow = kvs
      .flatMap((kv) => kv.rows)
      .find((r) => /mahadasha/i.test(r.label));
    expect(mahaRow).toBeDefined();
    expect(mahaRow!.value).toContain(CORRELATION.activeDasha.mahaLord);
  });

  it('kv section Antardasha value contains the active antarLord', () => {
    const c = buildPdfContent(CORRELATION, { lang: 'en' });
    const kvs = sectionsByType(c, 'kv');
    const antarRow = kvs
      .flatMap((kv) => kv.rows)
      .find((r) => /antardasha/i.test(r.label));
    expect(antarRow).toBeDefined();
    expect(antarRow!.value).toContain(CORRELATION.activeDasha.antarLord);
  });

  it('kv section contains Moon Sign row', () => {
    const c = buildPdfContent(CORRELATION, { lang: 'en' });
    const kvs = sectionsByType(c, 'kv');
    const allLabels = kvs.flatMap((kv) => kv.rows.map((r) => r.label.toLowerCase()));
    expect(allLabels.some((l) => l.includes('moon'))).toBe(true);
  });

  it('kv section uses Hindi labels when lang=hi', () => {
    const c = buildPdfContent(CORRELATION, { lang: 'hi' });
    const kvs = sectionsByType(c, 'kv');
    const labels = kvs.flatMap((kv) => kv.rows.map((r) => r.label));
    // At least one label should be in Hindi (contain Devanagari)
    expect(labels.some((l) => /[\u0900-\u097F]/.test(l))).toBe(true);
  });
});

// ─── buildPdfContent — score section ─────────────────────────────────────────

describe('buildPdfContent — score section', () => {
  it('score section has score 0–100', () => {
    const c = buildPdfContent(CORRELATION);
    const scores = sectionsByType(c, 'score');
    expect(scores.length).toBeGreaterThan(0);
    scores.forEach((s) => {
      expect(s.score).toBeGreaterThanOrEqual(0);
      expect(s.score).toBeLessThanOrEqual(100);
    });
  });

  it('score section level is High, Medium, or Low', () => {
    const c = buildPdfContent(CORRELATION);
    const scores = sectionsByType(c, 'score');
    scores.forEach((s) => {
      expect(['High', 'Medium', 'Low']).toContain(s.level);
    });
  });

  it('score section label is non-empty', () => {
    const c = buildPdfContent(CORRELATION);
    const scores = sectionsByType(c, 'score');
    scores.forEach((s) => expect(s.label).toBeTruthy());
  });

  it('score section label is in Hindi when lang=hi', () => {
    const c = buildPdfContent(CORRELATION, { lang: 'hi' });
    const scores = sectionsByType(c, 'score');
    expect(scores.some((s) => /[\u0900-\u097F]/.test(s.label))).toBe(true);
  });

  it('score matches the correlation result score', () => {
    const c = buildPdfContent(CORRELATION);
    const scores = sectionsByType(c, 'score');
    expect(scores[0].score).toBe(CORRELATION.correlation.score);
  });
});

// ─── buildPdfContent — transit table section ─────────────────────────────────

describe('buildPdfContent — transit table section', () => {
  it('table has exactly 9 rows (one per planet)', () => {
    const c = buildPdfContent(CORRELATION);
    const tables = sectionsByType(c, 'table');
    expect(tables.length).toBeGreaterThan(0);
    // The transit table (first table) should have 9 rows
    const transitTable = tables[0];
    expect(transitTable.rows).toHaveLength(9);
  });

  it('table headers are non-empty strings', () => {
    const c = buildPdfContent(CORRELATION);
    const tables = sectionsByType(c, 'table');
    tables[0].headers.forEach((h) => expect(h).toBeTruthy());
  });

  it('table rows have same column count as headers', () => {
    const c = buildPdfContent(CORRELATION);
    const tables = sectionsByType(c, 'table');
    const t = tables[0];
    t.rows.forEach((row) => {
      expect(row.length).toBe(t.headers.length);
    });
  });

  it('all 9 planets appear in transit table rows', () => {
    const c = buildPdfContent(CORRELATION, { lang: 'en' });
    const tables = sectionsByType(c, 'table');
    const allCells = tables[0].rows.flatMap((r) => r);
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    planets.forEach((planet) => {
      expect(allCells.some((cell) => cell.includes(planet))).toBe(true);
    });
  });

  it('transit table uses Hindi planet names when lang=hi', () => {
    const c = buildPdfContent(CORRELATION, { lang: 'hi' });
    const tables = sectionsByType(c, 'table');
    const allCells = tables[0].rows.flatMap((r) => r);
    // At least one cell should contain a Hindi planet name
    const hindiPlanets = ['सूर्य', 'चंद्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'राहु', 'केतु'];
    expect(allCells.some((cell) => hindiPlanets.some((hp) => cell.includes(hp)))).toBe(true);
  });

  it('house numbers are 1–12 in transit table', () => {
    const c = buildPdfContent(CORRELATION, { lang: 'en' });
    const tables = sectionsByType(c, 'table');
    // House column is index 2
    tables[0].rows.forEach((row) => {
      const houseVal = parseInt(row[2], 10);
      expect(houseVal).toBeGreaterThanOrEqual(1);
      expect(houseVal).toBeLessThanOrEqual(12);
    });
  });
});

// ─── buildPdfContent — monthly outlook section ───────────────────────────────

describe('buildPdfContent — outlook section', () => {
  it('outlook section has exactly 12 items', () => {
    const c = buildPdfContent(CORRELATION);
    const outlooks = sectionsByType(c, 'outlook');
    expect(outlooks.length).toBe(1);
    expect(outlooks[0].items).toHaveLength(12);
  });

  it('every outlook item has a non-empty month string', () => {
    const c = buildPdfContent(CORRELATION);
    const outlook = sectionsByType(c, 'outlook')[0];
    outlook.items.forEach((item) => expect(item.month).toBeTruthy());
  });

  it('every outlook item has score 0–100', () => {
    const c = buildPdfContent(CORRELATION);
    const outlook = sectionsByType(c, 'outlook')[0];
    outlook.items.forEach((item) => {
      expect(item.score).toBeGreaterThanOrEqual(0);
      expect(item.score).toBeLessThanOrEqual(100);
    });
  });

  it('every outlook item level is High, Medium, or Low', () => {
    const c = buildPdfContent(CORRELATION);
    const outlook = sectionsByType(c, 'outlook')[0];
    outlook.items.forEach((item) => {
      expect(['High', 'Medium', 'Low']).toContain(item.level);
    });
  });

  it('every outlook item has non-empty mahaLord and antarLord', () => {
    const c = buildPdfContent(CORRELATION);
    const outlook = sectionsByType(c, 'outlook')[0];
    outlook.items.forEach((item) => {
      expect(item.mahaLord).toBeTruthy();
      expect(item.antarLord).toBeTruthy();
    });
  });
});

// ─── buildPdfContent — text sections ─────────────────────────────────────────

describe('buildPdfContent — text sections', () => {
  it('contains a disclaimer text section', () => {
    const c = buildPdfContent(CORRELATION, { lang: 'en' });
    const texts = sectionsByType(c, 'text');
    const hasDisclaimer = texts.some(
      (t) => /disclaimer|advice|substitute|warning|⚠/i.test(t.text),
    );
    expect(hasDisclaimer).toBe(true);
  });

  it('contains prediction text from the correlation result (en)', () => {
    const c = buildPdfContent(CORRELATION, { lang: 'en' });
    const texts = sectionsByType(c, 'text');
    const predictionText = CORRELATION.correlation.prediction.en;
    const hasIt = texts.some((t) => t.text.includes(predictionText.substring(0, 20)));
    expect(hasIt).toBe(true);
  });

  it('contains Hindi text when lang=hi', () => {
    const c = buildPdfContent(CORRELATION, { lang: 'hi' });
    const texts = sectionsByType(c, 'text');
    // At least one text section should contain Devanagari characters
    expect(texts.some((t) => /[\u0900-\u097F]/.test(t.text))).toBe(true);
  });
});

// ─── buildPdfContent — heading sections ──────────────────────────────────────

describe('buildPdfContent — heading sections (en vs hi)', () => {
  it('first heading contains "1" or "1." (section numbering)', () => {
    const c = buildPdfContent(CORRELATION, { lang: 'en' });
    const headings = sectionsByType(c, 'heading');
    expect(headings[0].text).toMatch(/^1/);
  });

  it('all 4 headings present in English', () => {
    const c = buildPdfContent(CORRELATION, { lang: 'en' });
    const texts = sectionsByType(c, 'heading').map((h) => h.text.toLowerCase());
    expect(texts.some((t) => t.includes('dasha'))).toBe(true);
    expect(texts.some((t) => t.includes('score') || t.includes('activation'))).toBe(true);
    expect(texts.some((t) => t.includes('transit') || t.includes('planet'))).toBe(true);
    expect(texts.some((t) => t.includes('outlook') || t.includes('month'))).toBe(true);
  });

  it('all 4 headings present in Hindi (contain Devanagari)', () => {
    const c = buildPdfContent(CORRELATION, { lang: 'hi' });
    const headings = sectionsByType(c, 'heading');
    const devanagariCount = headings.filter((h) => /[\u0900-\u097F]/.test(h.text)).length;
    expect(devanagariCount).toBeGreaterThanOrEqual(4);
  });
});

// ─── buildPdfContent — edge cases ────────────────────────────────────────────

describe('buildPdfContent — edge cases', () => {
  it('works when nativeName is undefined (uses default)', () => {
    const c = buildPdfContent(CORRELATION, { lang: 'en' });
    expect(c.metadata.nativeName).toBe('Native');
  });

  it('works when options is entirely omitted', () => {
    expect(() => buildPdfContent(CORRELATION)).not.toThrow();
  });

  it('produces different titles for en and hi', () => {
    const en = buildPdfContent(CORRELATION, { lang: 'en', nativeName: 'X' });
    const hi = buildPdfContent(CORRELATION, { lang: 'hi', nativeName: 'X' });
    expect(en.title).not.toBe(hi.title);
  });

  it('is a pure function — calling twice gives equal structure', () => {
    const c1 = buildPdfContent(CORRELATION, { lang: 'en', nativeName: 'Test' });
    const c2 = buildPdfContent(CORRELATION, { lang: 'en', nativeName: 'Test' });
    expect(c1.sections.length).toBe(c2.sections.length);
    expect(c1.sections.map((s) => s.type)).toEqual(c2.sections.map((s) => s.type));
  });

  it('handles southern hemisphere birth data without error', () => {
    const southern = computeCorrelation(
      {
        name: 'Southern', date: '1985-06-15', time: '12:00',
        timezone: 'Australia/Sydney', latitude: -33.87, longitude: 151.21,
        place: 'Sydney',
      },
      TARGET_DATE,
    );
    expect(() => buildPdfContent(southern, { lang: 'en', nativeName: 'Southern' })).not.toThrow();
  });

  it('handles historical birth (1869 Gandhi) without error', () => {
    const gandhi = computeCorrelation(
      {
        name: 'Gandhi', date: '1869-10-02', time: '07:20',
        timezone: 'Asia/Kolkata', latitude: 21.64, longitude: 70.08,
        place: 'Porbandar',
      },
      TARGET_DATE,
    );
    expect(() => buildPdfContent(gandhi)).not.toThrow();
  });
});

// ─── Source-level checks ──────────────────────────────────────────────────────

import * as fs from 'fs';
import * as path from 'path';

describe('dashaTransitPdfService — source structure', () => {
  const src = fs.readFileSync(
    path.resolve(__dirname, '../../services/dashaTransitPdfService.ts'),
    'utf-8',
  );

  it('has no @ts-nocheck directive', () => {
    expect(src).not.toContain('@ts-nocheck');
  });

  it('exports buildPdfContent as a named export', () => {
    expect(src).toContain('export function buildPdfContent');
  });

  it('exports exportDashaTransitPdf as a named export', () => {
    expect(src).toContain('export async function exportDashaTransitPdf');
  });

  it('uses dynamic import for jsPDF (lazy loading)', () => {
    expect(src).toContain("import('jspdf')");
  });

  it('DashaTransitCorrelationPage imports exportDashaTransitPdf', () => {
    const pageSrc = fs.readFileSync(
      path.resolve(__dirname, '../../pages/DashaTransitCorrelationPage.tsx'),
      'utf-8',
    );
    expect(pageSrc).toContain('exportDashaTransitPdf');
  });

  it('DashaTransitCorrelationPage has Export PDF button text', () => {
    const pageSrc = fs.readFileSync(
      path.resolve(__dirname, '../../pages/DashaTransitCorrelationPage.tsx'),
      'utf-8',
    );
    expect(pageSrc).toContain('Export PDF');
  });

  it('WEEK9_PDF_REPORT_SPEC.md exists in docs/', () => {
    const specExists = fs.existsSync(
      path.resolve(__dirname, '../../../docs/WEEK9_PDF_REPORT_SPEC.md'),
    );
    expect(specExists).toBe(true);
  });
});
