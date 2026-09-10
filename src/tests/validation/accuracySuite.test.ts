/**
 * src/tests/validation/accuracySuite.test.ts
 *
 * Week 1 — Accuracy Validation Suite
 * Week 2 — Extended validation with house cusps and antardasha
 *
 * Runs all 15 reference charts through the precision engine
 * and asserts tolerance-based pass/fail per field.
 *
 * Run: npx vitest run src/tests/validation/accuracySuite.test.ts
 */

import { describe, it, expect, afterAll } from 'vitest';
import { REFERENCE_CHARTS } from './referenceCharts';
import { validateChart, validateSuite } from './accuracyValidator';
import { printReport, formatJsonSummary } from './reportFormatter';

// ─── Suite-level run ──────────────────────────────────────────────────────────

describe('Week 2 — Extended Accuracy Validation Suite', () => {

  // Run the full suite once and keep results for per-chart tests
  const suiteResult = validateSuite(REFERENCE_CHARTS);

  // ── Suite-level assertions ─────────────────────────────────────────────────

  describe('Suite health', () => {
    it('should complete all 15 charts without throwing', () => {
      expect(suiteResult.totalCharts).toBe(15);
    });

    it('should complete within 2000ms', () => {
      // We time this separately — suite was already computed above,
      // so we just re-run to measure freshly
      const start = performance.now();
      validateSuite(REFERENCE_CHARTS);
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(2000);
    });

    it('should have ≥ 12 / 15 charts passing (Week 1 threshold)', () => {
      const threshold = 12;
      if (suiteResult.passCharts < threshold) {
        // Print the full report to make failures easy to read in CI
        printReport(suiteResult);
      }
      expect(suiteResult.passCharts + suiteResult.warnCharts).toBeGreaterThanOrEqual(threshold);
    });

    it('should have 0 rashi-level failures', () => {
      const rashiFailures = suiteResult.charts.flatMap(c =>
        c.fields.filter(f => f.field.endsWith('_rashi') && f.status === 'FAIL')
      );
      if (rashiFailures.length > 0) {
        const msg = rashiFailures
          .map(f => {
            const chart = suiteResult.charts.find(c => c.fields.includes(f));
            return `${chart?.chartId} ${chart?.chartName}: ${f.field} got=${f.calculated} exp=${f.expected}`;
          })
          .join('\n');
        console.error('RASHI FAILURES:\n' + msg);
      }
      expect(rashiFailures).toHaveLength(0);
    });

    it('should have field accuracy ≥ 80%', () => {
      expect(suiteResult.fieldAccuracyPct).toBeGreaterThanOrEqual(80);
    });

    it('should produce a valid JSON summary', () => {
      const json = formatJsonSummary(suiteResult);
      expect(json.totalCharts).toBe(15);
      expect(json.charts).toHaveLength(15);
      expect(['PASS', 'FAIL']).toContain(json.week1Verdict);
    });

    // Week 2: Extended validation checks
    it('should have house cusp data for extended charts', () => {
      const chartsWithHouseCusps = suiteResult.charts.filter(c =>
        c.fields.some(f => f.field.startsWith('house_') && f.field.includes('_cusp'))
      );
      expect(chartsWithHouseCusps.length).toBeGreaterThan(0);
    });

    it('should have antardasha data for extended charts', () => {
      const chartsWithAntardasha = suiteResult.charts.filter(c =>
        c.fields.some(f => f.field.startsWith('first_antardasha'))
      );
      expect(chartsWithAntardasha.length).toBeGreaterThan(0);
    });
  });

  // ── Per-chart tests ────────────────────────────────────────────────────────

  for (const ref of REFERENCE_CHARTS) {
    describe(`${ref.id} — ${ref.name}`, () => {
      const result = validateChart(ref);

      it('should calculate without error', () => {
        const engineField = result.fields.find(f => f.field === 'engine');
        expect(engineField?.status).not.toBe('FAIL');
      });

      it('ayanamsa should be within tolerance', () => {
        const f = result.fields.find(f => f.field === 'ayanamsa');
        expect(f).toBeDefined();
        expect(f!.status).not.toBe('FAIL');
      });

      it('ascendant rashi should match', () => {
        const f = result.fields.find(f => f.field === 'ascendant');
        expect(f).toBeDefined();
        if (f!.status === 'FAIL') {
          console.error(`[${ref.id}] ascendant: got ${f!.calculated}, expected ${f!.expected}`);
        }
        // Uncertain-time charts allow WARN
        if (ref.timeUncertain) {
          expect(['PASS', 'WARN']).toContain(f!.status);
        } else {
          expect(f!.status).toBe('PASS');
        }
      });

      it('sun rashi should match', () => {
        const f = result.fields.find(f => f.field === 'sun_rashi');
        expect(f).toBeDefined();
        expect(f!.status).toBe('PASS');
      });

      it('moon rashi should match', () => {
        const f = result.fields.find(f => f.field === 'moon_rashi');
        expect(f).toBeDefined();
        expect(f!.status).toBe('PASS');
      });

      it('moon nakshatra should match', () => {
        const f = result.fields.find(f => f.field === 'moon_nakshatra');
        expect(f).toBeDefined();
        if (f!.status === 'FAIL') {
          console.error(`[${ref.id}] nakshatra: got ${f!.calculated}, expected ${f!.expected}`);
        }
        expect(f!.status).toBe('PASS');
      });

      it('moon pada should match (or be within 1 for border cases)', () => {
        const f = result.fields.find(f => f.field === 'moon_pada');
        expect(f).toBeDefined();
        // WARN means borderline pada — acceptable
        expect(['PASS', 'WARN']).toContain(f!.status);
      });

      it('dasha seed lord should match', () => {
        const f = result.fields.find(f => f.field === 'dasha_seed_lord');
        expect(f).toBeDefined();
        if (f!.status === 'FAIL') {
          console.error(`[${ref.id}] dasha_seed_lord: got ${f!.calculated}, expected ${f!.expected}`);
        }
        expect(f!.status).toBe('PASS');
      });

      it('all 9 planet rashis should match', () => {
        const planetRashiFields = result.fields.filter(f => f.field.endsWith('_rashi') && f.field !== 'ascendant');
        const failures = planetRashiFields.filter(f => f.status === 'FAIL');
        if (failures.length > 0) {
          const msg = failures.map(f => `  ${f.field}: got=${f.calculated} exp=${f.expected}`).join('\n');
          console.error(`[${ref.id}] Planet rashi failures:\n${msg}`);
        }
        expect(failures).toHaveLength(0);
      });

      // Week 2: House cusp validation
      if (ref.expected.houseCusps && ref.expected.houseCusps.length > 0) {
        it('house cusps should match (rashi level)', () => {
          const houseCuspFields = result.fields.filter(f => f.field.startsWith('house_') && f.field.includes('_cusp'));
          const failures = houseCuspFields.filter(f => f.status === 'FAIL');
          if (failures.length > 0) {
            const msg = failures.map(f => `  ${f.field}: got=${f.calculated} exp=${f.expected}`).join('\n');
            console.error(`[${ref.id}] House cusp failures:\n${msg}`);
          }
          expect(failures).toHaveLength(0);
        });
      }

      // Week 2: Antardasha validation
      if (ref.expected.firstAntardasha) {
        it('first antardasha lord should match', () => {
          const f = result.fields.find(f => f.field === 'first_antardasha_lord');
          expect(f).toBeDefined();
          if (f!.status === 'FAIL') {
            console.error(`[${ref.id}] first_antardasha_lord: got ${f!.calculated}, expected ${f!.expected}`);
          }
          expect(f!.status).toBe('PASS');
        });
      }
    });
  }

  // ── Print full report and write output files ──────────────────────────────

  afterAll(async () => {
    printReport(suiteResult);
    const json = formatJsonSummary(suiteResult);
    console.log('\nJSON Summary:', JSON.stringify(json, null, 2));

    // Write report files to dist/ as specified in the Week 1 spec (section 8).
    // Uses dynamic import of 'fs' so this only runs in Node (Vitest) not browser.
    try {
      const fs = await import('node:fs/promises');
      const path = await import('node:path');
      const { formatTextReport } = await import('./reportFormatter');
      const distDir = path.resolve(process.cwd(), 'dist');

      // Ensure dist/ exists
      await fs.mkdir(distDir, { recursive: true });

      // Write human-readable text report
      const textReport = formatTextReport(suiteResult);
      await fs.writeFile(path.join(distDir, 'accuracy-report.txt'), textReport, 'utf-8');

      // Write JSON summary
      await fs.writeFile(
        path.join(distDir, 'accuracy-summary.json'),
        JSON.stringify(json, null, 2),
        'utf-8',
      );

      console.log('\n📄 Reports written:');
      console.log('   dist/accuracy-report.txt');
      console.log('   dist/accuracy-summary.json');
    } catch (err) {
      // Non-fatal — report output is optional in test environments
      console.warn('[accuracySuite] Could not write dist/ reports:', (err as Error).message);
    }
  });
});
