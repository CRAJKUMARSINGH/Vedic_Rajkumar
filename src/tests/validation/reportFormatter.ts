/**
 * src/tests/validation/reportFormatter.ts
 *
 * Week 1 — Accuracy report formatter
 * Week 2 — Extended reporting with mismatch cause analysis
 *
 * Converts a SuiteValidationResult into a human-readable text report
 * and a compact JSON summary. No file I/O — returns strings.
 * Callers can write to disk or print to console.
 */

import {
  type SuiteValidationResult,
  type ChartValidationResult,
  type FieldResult,
  type FieldStatus,
} from './accuracyValidator';

// ─── Symbols & colours (ANSI-safe, falls back to plain text) ─────────────────

const ICON: Record<FieldStatus, string> = {
  PASS: '✅',
  WARN: '⚠️ ',
  FAIL: '❌',
  SKIP: '⏭️ ',
};

// ─── Text report ──────────────────────────────────────────────────────────────

function bar(char = '─', len = 70): string {
  return char.repeat(len);
}

function formatFieldLine(f: FieldResult): string {
  const icon = ICON[f.status];
  const fieldPad = f.field.padEnd(28); // Extended for Week 2 field names
  const calcStr = String(f.calculated).padEnd(20);
  const expStr = String(f.expected).padEnd(20);
  const delta = f.delta !== undefined ? `Δ${f.delta.toFixed(3)}` : '';
  const note = f.note ? `  (${f.note})` : '';
  return `  ${icon} ${fieldPad} calc: ${calcStr} exp: ${expStr} ${delta}${note}`;
}

function chartStatusLine(r: ChartValidationResult): string {
  const icon = ICON[r.status as FieldStatus];
  const pct = r.totalChecked > 0
    ? ((r.passCount / r.totalChecked) * 100).toFixed(0)
    : '0';
  return `  ${icon} ${r.status}  ${r.passCount}/${r.totalChecked} fields (${pct}%)  warn:${r.warnCount}  fail:${r.failCount}  skip:${r.skipCount}`;
}

export function formatTextReport(suite: SuiteValidationResult): string {
  const lines: string[] = [];

  lines.push(bar('═'));
  lines.push(' VEDIC RAJKUMAR — ACCURACY VALIDATION REPORT');
  lines.push(` Engine : ${suite.engine}`);
  lines.push(` Run at : ${suite.runAt}`);
  lines.push(` Scope  : Week 2 (Extended: house cusps, antardasha)`);
  lines.push(bar('═'));

  for (const chart of suite.charts) {
    lines.push('');
    lines.push(`Chart ${chart.chartId}: ${chart.chartName}`);
    lines.push(bar('─'));

    for (const f of chart.fields) {
      lines.push(formatFieldLine(f));
    }

    lines.push('');
    lines.push(chartStatusLine(chart));
    lines.push(bar('─'));
  }

  lines.push('');
  lines.push(bar('═'));
  lines.push(' SUITE SUMMARY');
  lines.push(bar('─'));

  const chartPassPct = suite.totalCharts > 0
    ? ((suite.passCharts / suite.totalCharts) * 100).toFixed(0)
    : '0';
  const fieldAccPct = suite.fieldAccuracyPct.toFixed(1);

  lines.push(`  Charts : ${suite.totalCharts}  ✅ Pass: ${suite.passCharts}  ⚠️  Warn: ${suite.warnCharts}  ❌ Fail: ${suite.failCharts}  (${chartPassPct}% charts pass)`);
  lines.push(`  Fields : ${suite.totalFields}  ✅ Pass: ${suite.passFields}  Field accuracy: ${fieldAccPct}%`);
  lines.push('');
  lines.push(' Week 1 target: ≥ 12/15 charts PASS, 0 rashi failures');
  lines.push(' Week 2 target: Extended coverage with house cusps and antardasha');

  // Pass/fail verdict
  const rashiFailures = suite.charts.flatMap(c =>
    c.fields.filter(f => f.field.endsWith('_rashi') && f.status === 'FAIL')
  );
  const passThreshold = Math.ceil(suite.totalCharts * 0.8);
  const verdict = suite.passCharts >= passThreshold && rashiFailures.length === 0
    ? '✅ WEEK 1 ACCEPTANCE: PASS'
    : `❌ WEEK 1 ACCEPTANCE: FAIL (pass:${suite.passCharts}/${passThreshold} threshold, rashi_fails:${rashiFailures.length})`;

  lines.push(`  ${verdict}`);
  lines.push(bar('═'));

  // Mismatch summary
  if (rashiFailures.length > 0) {
    lines.push('');
    lines.push(' RASHI FAILURES (requires investigation):');
    lines.push(bar('─'));
    for (const f of rashiFailures) {
      const chart = suite.charts.find(c => c.fields.includes(f));
      lines.push(`  ${chart?.chartId ?? '?'} ${chart?.chartName ?? '?'} — ${f.field}: got ${f.calculated}, expected ${f.expected}`);
    }
    lines.push(bar('─'));
  }

  return lines.join('\n');
}

// ─── JSON summary ─────────────────────────────────────────────────────────────

export interface AccuracySummaryJSON {
  runAt: string;
  engine: string;
  totalCharts: number;
  passCharts: number;
  warnCharts: number;
  failCharts: number;
  fieldAccuracyPct: number;
  week1Verdict: 'PASS' | 'FAIL';
  rashiFailureCount: number;
  charts: Array<{
    id: string;
    name: string;
    status: string;
    passCount: number;
    failCount: number;
    warnCount: number;
    failures: Array<{ field: string; calculated: string | number; expected: string | number }>;
  }>;
}

export function formatJsonSummary(suite: SuiteValidationResult): AccuracySummaryJSON {
  const rashiFailures = suite.charts.flatMap(c =>
    c.fields.filter(f => f.field.endsWith('_rashi') && f.status === 'FAIL')
  );
  const passThreshold = Math.ceil(suite.totalCharts * 0.8);
  const week1Verdict = suite.passCharts >= passThreshold && rashiFailures.length === 0 ? 'PASS' : 'FAIL';

  return {
    runAt: suite.runAt,
    engine: suite.engine,
    totalCharts: suite.totalCharts,
    passCharts: suite.passCharts,
    warnCharts: suite.warnCharts,
    failCharts: suite.failCharts,
    fieldAccuracyPct: +suite.fieldAccuracyPct.toFixed(1),
    week1Verdict,
    rashiFailureCount: rashiFailures.length,
    charts: suite.charts.map(c => ({
      id: c.chartId,
      name: c.chartName,
      status: c.status,
      passCount: c.passCount,
      failCount: c.failCount,
      warnCount: c.warnCount,
      failures: c.fields
        .filter(f => f.status === 'FAIL')
        .map(f => ({ field: f.field, calculated: f.calculated, expected: f.expected })),
    })),
  };
}

// ─── Console printer helper ───────────────────────────────────────────────────

export function printReport(suite: SuiteValidationResult): void {
  console.log(formatTextReport(suite));
}
