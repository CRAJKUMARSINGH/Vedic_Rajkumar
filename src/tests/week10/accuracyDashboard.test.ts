/**
 * Week 10: Accuracy Dashboard Service Tests
 *
 * Tests for runAccuracyCheck() — the pure function that runs the 15-chart
 * validation suite against the live precision engine.
 *
 * These tests exercise the same validation logic as the Week 1 accuracy suite
 * but through the dashboard service interface.
 */

import { describe, it, expect } from 'vitest';
import {
  runAccuracyCheck,
  type AccuracyDashboardResult,
  type ChartAccuracyResult,
  type AccuracyStatus,
} from '@/services/accuracyDashboardService';

// ─── Run once for all tests ───────────────────────────────────────────────────

let result: AccuracyDashboardResult;

// Compute once — ~21ms
result = runAccuracyCheck();

// ─── Result structure ─────────────────────────────────────────────────────────

describe('runAccuracyCheck — result structure', () => {
  it('returns a valid AccuracyDashboardResult', () => {
    expect(result).toBeTruthy();
    expect(typeof result).toBe('object');
  });

  it('totalCharts is exactly 15', () => {
    expect(result.totalCharts).toBe(15);
  });

  it('charts array has exactly 15 entries', () => {
    expect(result.charts).toHaveLength(15);
  });

  it('passCount + warnCount + failCount = 15', () => {
    expect(result.passCount + result.warnCount + result.failCount).toBe(15);
  });

  it('totalFields > 0', () => {
    expect(result.totalFields).toBeGreaterThan(0);
  });

  it('passFields <= totalFields', () => {
    expect(result.passFields).toBeLessThanOrEqual(result.totalFields);
  });

  it('fieldAccuracyPercent is between 0 and 100', () => {
    expect(result.fieldAccuracyPercent).toBeGreaterThanOrEqual(0);
    expect(result.fieldAccuracyPercent).toBeLessThanOrEqual(100);
  });

  it('runDurationMs is positive', () => {
    expect(result.runDurationMs).toBeGreaterThan(0);
  });

  it('runAt is a valid ISO timestamp', () => {
    expect(new Date(result.runAt).getTime()).toBeGreaterThan(0);
  });

  it('engineVersion is a non-empty string', () => {
    expect(result.engineVersion).toBeTruthy();
    expect(result.engineVersion).toContain('precision');
  });
});

// ─── Quality gates ────────────────────────────────────────────────────────────

describe('runAccuracyCheck — quality gates', () => {
  it('field accuracy is at least 80% (minimum acceptable)', () => {
    expect(result.fieldAccuracyPercent).toBeGreaterThanOrEqual(80);
  });

  it('at least 10 of 15 charts PASS (Week 1 target: ≥ 12)', () => {
    expect(result.passCount).toBeGreaterThanOrEqual(10);
  });

  it('0 charts have a calculation error', () => {
    const errorCharts = result.charts.filter((c) => c.error);
    expect(errorCharts).toHaveLength(0);
  });

  it('no chart status is invalid', () => {
    const validStatuses = new Set<AccuracyStatus>(['PASS', 'WARN', 'FAIL']);
    result.charts.forEach((c) => {
      expect(validStatuses.has(c.status)).toBe(true);
    });
  });
});

// ─── Per-chart result structure ───────────────────────────────────────────────

describe('runAccuracyCheck — per-chart results', () => {
  it('every chart has a non-empty id', () => {
    result.charts.forEach((c) => expect(c.id).toBeTruthy());
  });

  it('every chart has a non-empty name', () => {
    result.charts.forEach((c) => expect(c.name).toBeTruthy());
  });

  it('every chart has a valid date string', () => {
    result.charts.forEach((c) => expect(c.date).toMatch(/^\d{4}-\d{2}-\d{2}$/));
  });

  it('every chart passFields + warnFields + failFields = totalFields', () => {
    result.charts.forEach((c) => {
      expect(c.passFields + c.warnFields + c.failFields).toBe(c.totalFields);
    });
  });

  it('every chart has at least 10 fields validated', () => {
    result.charts.forEach((c) => {
      if (!c.error) expect(c.totalFields).toBeGreaterThanOrEqual(10);
    });
  });

  it('every chart field has a valid status', () => {
    const validStatuses = new Set<AccuracyStatus>(['PASS', 'WARN', 'FAIL']);
    result.charts.forEach((c) => {
      c.fields.forEach((f) => {
        expect(validStatuses.has(f.status)).toBe(true);
      });
    });
  });

  it('every chart field has a non-empty field name', () => {
    result.charts.forEach((c) => {
      c.fields.forEach((f) => {
        expect(f.field).toBeTruthy();
      });
    });
  });
});

// ─── Specific chart checks ────────────────────────────────────────────────────

describe('runAccuracyCheck — specific reference charts', () => {
  it('REF-001 Priyansh Singh Chauhan is present', () => {
    const chart = result.charts.find((c) => c.id === 'REF-001');
    expect(chart).toBeDefined();
    expect(chart!.name).toContain('Priyansh');
  });

  it('REF-006 Rajkumar is present', () => {
    const chart = result.charts.find((c) => c.id === 'REF-006');
    expect(chart).toBeDefined();
    expect(chart!.name).toContain('Rajkumar');
  });

  it('REF-013 Veerpratap is present', () => {
    const chart = result.charts.find((c) => c.id === 'REF-013');
    expect(chart).toBeDefined();
  });

  it('Rajkumar chart has no calculation error', () => {
    const chart = result.charts.find((c) => c.id === 'REF-006');
    expect(chart?.error).toBeUndefined();
  });

  it('ascendant_rashi field exists for every chart', () => {
    result.charts.forEach((c) => {
      if (!c.error) {
        const asc = c.fields.find((f) => f.field === 'ascendant_rashi');
        expect(asc).toBeDefined();
      }
    });
  });

  it('moon_nakshatra field exists for every chart', () => {
    result.charts.forEach((c) => {
      if (!c.error) {
        const nak = c.fields.find((f) => f.field === 'moon_nakshatra');
        expect(nak).toBeDefined();
      }
    });
  });

  it('dasha_seed_lord field exists for every chart', () => {
    result.charts.forEach((c) => {
      if (!c.error) {
        const dasha = c.fields.find((f) => f.field === 'dasha_seed_lord');
        expect(dasha).toBeDefined();
      }
    });
  });
});

// ─── Idempotence ─────────────────────────────────────────────────────────────

describe('runAccuracyCheck — idempotence', () => {
  it('returns same totalCharts on second call', () => {
    const r2 = runAccuracyCheck();
    expect(r2.totalCharts).toBe(result.totalCharts);
  });

  it('returns same fieldAccuracyPercent on second call', () => {
    const r2 = runAccuracyCheck();
    expect(r2.fieldAccuracyPercent).toBe(result.fieldAccuracyPercent);
  });

  it('runs in under 2000ms', () => {
    const r = runAccuracyCheck();
    expect(r.runDurationMs).toBeLessThan(2000);
  });
});
