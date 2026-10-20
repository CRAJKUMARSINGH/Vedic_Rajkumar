/**
 * AccuracyDashboardPage.tsx
 *
 * Week 10: Live Accuracy Dashboard.
 *
 * Route: /accuracy
 *
 * Runs the 15-chart validation suite in-browser and shows:
 *  - Overall status (Pass/Warn/Fail counts + field accuracy %)
 *  - Per-chart status table with field breakdown
 *  - Last run timestamp and engine version
 *  - "Recalculate" button
 *
 * Marked noindex — this is an internal engineering tool.
 * Accessible: aria-live on result region.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, Activity } from 'lucide-react';
import rawSummary from '@/generated/summary.json';
import { loadAccuracyReport } from '@/lib/accuracyReport';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';
import ChartLoadingState from '@/components/ChartLoadingState';
import ChartEmptyState from '@/components/ChartEmptyState';
import ChartErrorState from '@/components/ChartErrorState';
import { runAccuracyCheck,
  type AccuracyDashboardResult,
  type AccuracyStatus,
} from '@/services/accuracyDashboardService';
import { cn } from '@/lib/utils';
import { ValidationInProgressNotice } from '@/components/PrototypeStatusBanner';

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_BADGE: Record<AccuracyStatus, string> = {
  PASS: 'bg-green-600 text-white',
  WARN: 'bg-amber-500 text-white',
  FAIL: 'bg-red-500 text-white',
};

const STATUS_ROW: Record<AccuracyStatus, string> = {
  PASS: '',
  WARN: 'bg-amber-50 dark:bg-amber-950/20',
  FAIL: 'bg-red-50 dark:bg-red-950/20',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AccuracyDashboardPage() {
  const [result, setResult] = useState<AccuracyDashboardResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = useCallback(() => {
    setError(null);
    setIsLoading(true);
    // Use a small timeout to allow the loading state to render before the sync calculation
    setTimeout(() => {
      try {
        const r = runAccuracyCheck();
        setResult(r);
      } catch (err) {
        setError((err as Error).message ?? 'Accuracy check failed');
      } finally {
        setIsLoading(false);
      }
    }, 30);
  }, []);

  const accuracyColor =
    !result ? 'text-foreground'
    : result.fieldAccuracyPercent >= 95 ? 'text-green-600 dark:text-green-400'
    : result.fieldAccuracyPercent >= 85 ? 'text-amber-600 dark:text-amber-400'
    : 'text-red-600 dark:text-red-400';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Accuracy Dashboard — Vedic Rajkumar"
        description="Internal accuracy validation dashboard showing engine precision against 15 reference charts."
        canonical="/accuracy"
        noIndex={true}
      />

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-violet-500" aria-hidden="true" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Accuracy Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                15 reference charts · Lahiri ayanamsa · Meeus precision engine
              </p>
            </div>
          </div>
          <Button
            onClick={handleRun}
            disabled={isLoading}
            aria-busy={isLoading}
            className="gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} aria-hidden="true" />
            {isLoading ? 'Running…' : result ? 'Recalculate' : 'Run Validation'}
          </Button>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-6">

        <ValidationInProgressNotice compact={false} />

        <AccuracyReportPanel />

        {/* Loading */}
        {isLoading && (
          <ChartLoadingState message="Running 15-chart validation suite…" />
        )}

        {/* Error */}
        {!isLoading && error && (
          <ChartErrorState message={error} onRetry={handleRun} />
        )}

        {/* Empty state */}
        {!isLoading && !error && !result && (
          <ChartEmptyState
            icon={<Activity className="h-8 w-8" />}
            title="Run the validation suite"
            description="Click 'Run Validation' to check the engine's accuracy against 15 reference charts. Typical runtime < 50ms."
            action={
              <Button onClick={handleRun} className="gap-2">
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Run Validation
              </Button>
            }
          />
        )}

        {/* Results */}
        {!isLoading && result && (
          <div aria-live="polite" aria-atomic="true" className="space-y-6">

            {/* Summary cards */}
            <section aria-labelledby="summary-heading" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <h2 id="summary-heading" className="sr-only">Summary</h2>

              {/* Field accuracy */}
              <div className="sm:col-span-1 rounded-2xl border border-border bg-card p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Field Accuracy</p>
                <p className={cn('text-3xl font-extrabold', accuracyColor)}>
                  {result.fieldAccuracyPercent}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {result.passFields}/{result.totalFields} fields
                </p>
              </div>

              {/* PASS */}
              <div className="rounded-2xl border border-green-200 bg-green-50 dark:bg-green-950/20 p-4 text-center">
                <div className="flex justify-center mb-1">
                  <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />
                </div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{result.passCount}</p>
                <p className="text-xs text-green-600 dark:text-green-500">PASS</p>
              </div>

              {/* WARN */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-4 text-center">
                <div className="flex justify-center mb-1">
                  <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
                </div>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{result.warnCount}</p>
                <p className="text-xs text-amber-600 dark:text-amber-500">WARN</p>
              </div>

              {/* FAIL */}
              <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-4 text-center">
                <div className="flex justify-center mb-1">
                  <XCircle className="h-5 w-5 text-red-600" aria-hidden="true" />
                </div>
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">{result.failCount}</p>
                <p className="text-xs text-red-600 dark:text-red-500">FAIL</p>
              </div>
            </section>

            {/* Score bar */}
            <div
              className="w-full bg-muted rounded-full h-3 overflow-hidden"
              role="progressbar"
              aria-valuenow={result.fieldAccuracyPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Field accuracy: ${result.fieldAccuracyPercent}%`}
            >
              <div
                className={cn(
                  'h-3 rounded-full transition-all',
                  result.fieldAccuracyPercent >= 95 ? 'bg-green-500'
                  : result.fieldAccuracyPercent >= 85 ? 'bg-amber-500'
                  : 'bg-red-500',
                )}
                style={{ width: `${result.fieldAccuracyPercent}%` }}
              />
            </div>

            {/* Metadata */}
            <p className="text-xs text-muted-foreground text-center">
              Engine: {result.engineVersion} · {result.runDurationMs}ms ·{' '}
              Run: {new Date(result.runAt).toLocaleString()}
            </p>

            {/* Per-chart table */}
            <section aria-labelledby="charts-heading">
              <h2 id="charts-heading" className="text-base font-semibold text-foreground mb-3">
                Per-Chart Results
              </h2>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm" aria-label="Per-chart accuracy results">
                  <thead>
                    <tr className="bg-muted/50 text-left">
                      <th className="px-4 py-2.5 font-semibold text-foreground">Chart</th>
                      <th className="px-4 py-2.5 font-semibold text-foreground hidden sm:table-cell">Date</th>
                      <th className="px-4 py-2.5 font-semibold text-foreground hidden md:table-cell">Place</th>
                      <th className="px-4 py-2.5 font-semibold text-foreground text-center">Status</th>
                      <th className="px-4 py-2.5 font-semibold text-foreground text-center">Fields</th>
                      <th className="px-4 py-2.5 font-semibold text-foreground text-center hidden sm:table-cell">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.charts.map((chart) => {
                      const accuracy = chart.totalFields > 0
                        ? Math.round((chart.passFields / chart.totalFields) * 100)
                        : 0;
                      return (
                        <tr
                          key={chart.id}
                          className={cn(
                            'border-t border-border/60 transition-colors',
                            STATUS_ROW[chart.status],
                          )}
                        >
                          <td className="px-4 py-2.5">
                            <span className="font-medium text-foreground">{chart.name}</span>
                            {chart.error && (
                              <span className="ml-2 text-xs text-red-500">({chart.error})</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">
                            {chart.date}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground hidden md:table-cell text-xs">
                            {chart.place}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <Badge className={cn('text-xs', STATUS_BADGE[chart.status])}>
                              {chart.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-center text-xs text-muted-foreground">
                            <span className="text-green-600 dark:text-green-400">{chart.passFields}✓</span>
                            {chart.warnFields > 0 && (
                              <span className="ml-1 text-amber-600 dark:text-amber-400">{chart.warnFields}⚠</span>
                            )}
                            {chart.failFields > 0 && (
                              <span className="ml-1 text-red-600 dark:text-red-400">{chart.failFields}✗</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-center text-sm font-medium hidden sm:table-cell">
                            <span className={
                              accuracy >= 95 ? 'text-green-600 dark:text-green-400'
                              : accuracy >= 80 ? 'text-amber-600 dark:text-amber-400'
                              : 'text-red-600 dark:text-red-400'
                            }>
                              {accuracy}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Week 1 target reminder */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
              <strong>Week 1 target:</strong> ≥ 12/15 charts PASS, 0 rashi failures.{' '}
              <strong>Current:</strong> {result.passCount} PASS, {result.warnCount} WARN, {result.failCount} FAIL.{' '}
              Field accuracy: <strong>{result.fieldAccuracyPercent}%</strong> (target ≥ 90%).
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Published accuracy report ────────────────────────────────────────────────

const VERDICT_CLASS: Record<string, string> = {
  pass: 'text-green-700 border-green-200 bg-green-50 dark:bg-green-950/20',
  fail: 'text-red-700 border-red-200 bg-red-50 dark:bg-red-950/20',
  unmeasured: 'text-amber-700 border-amber-200 bg-amber-50 dark:bg-amber-950/20',
};

const VERDICT_LABEL: Record<string, string> = {
  pass: 'within claim',
  fail: 'OVER CLAIM',
  unmeasured: 'not measured',
};

/**
 * The committed accuracy snapshot, rendered verbatim.
 *
 * Unlike the live runner above (which re-derives numbers in the browser), this
 * panel reads a snapshot the gate wrote, so it survives a cold load and states
 * plainly what the engine has and has not verified.
 */
function AccuracyReportPanel() {
  const report = useMemo(() => loadAccuracyReport(rawSummary), []);

  const failing = report.bodies.filter((b) => b.verdict === 'fail').length;
  const boundaryDrop = report.exposure.moonBoundaryBefore - report.exposure.moonBoundaryNow;

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card p-5">
      <header>
        <h2 className="text-base font-semibold text-foreground">Published accuracy report</h2>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
          Written by the accuracy gate and rendered verbatim. Where the engine is not verified, the
          last section says so.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Generated: {report.generatedAt} · Frame: {report.engineFrame} · Swiss Ephemeris:{' '}
          {report.swissVersion}
        </p>
        {report.isPlaceholder && (
          <p
            data-testid="placeholder-warning"
            className="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
          >
            This is a placeholder snapshot. Run <code>npm run accuracy:publish</code> after a gate
            run to replace it with real numbers.
          </p>
        )}
      </header>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Corpus</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <ReportStat label="Charts compared" value={String(report.corpus.charts)} />
          <ReportStat label="Pre-1906 charts" value={String(report.corpus.pre1906)} />
          <ReportStat
            label="Bodies over claim"
            value={String(failing)}
            tone={failing ? 'bad' : 'good'}
          />
        </div>
      </section>

      <section>
        <h3 className="mb-1 text-sm font-semibold text-foreground">
          Position error vs Swiss Ephemeris
        </h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Arcseconds of ecliptic longitude. Claim is the engine's own advertised accuracy; max is the
          ceiling that fails the gate.
        </p>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left">
                <th className="px-4 py-2 font-semibold text-foreground">Body</th>
                <th className="px-4 py-2 text-right font-semibold text-foreground">Observed</th>
                <th className="px-4 py-2 text-right font-semibold text-foreground">Claim</th>
                <th className="px-4 py-2 text-right font-semibold text-foreground">Max</th>
                <th className="px-4 py-2 font-semibold text-foreground">Verdict</th>
              </tr>
            </thead>
            <tbody data-testid="body-rows">
              {report.bodies.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-muted-foreground" colSpan={5}>
                    No body rows in this snapshot.
                  </td>
                </tr>
              )}
              {report.bodies.map((row) => (
                <tr key={row.body} className="border-t border-border/60">
                  <td className="px-4 py-2 font-medium text-foreground">{row.body}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-foreground">
                    {row.observedArcsec === null ? '—' : row.observedArcsec.toFixed(1)}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                    {row.claimArcsec.toFixed(0)}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                    {row.maxArcsec.toFixed(0)}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={cn(
                        'rounded border px-2 py-0.5 text-xs',
                        VERDICT_CLASS[row.verdict] ?? VERDICT_CLASS.unmeasured,
                      )}
                    >
                      {VERDICT_LABEL[row.verdict] ?? row.verdict}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Nakshatra boundary exposure</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Charts whose Moon sits inside the engine's own error bar of a nakshatra edge, so the
          arithmetic rather than the birth record decides the nakshatra.
        </p>
        <div className="grid grid-cols-3 gap-4">
          <ReportStat label="Before (180 arcsec)" value={String(report.exposure.moonBoundaryBefore)} />
          <ReportStat
            label={`After (${report.exposure.moonClaimArcsec} arcsec)`}
            value={String(report.exposure.moonBoundaryNow)}
            tone="good"
          />
          <ReportStat label="Charts removed from the band" value={String(boundaryDrop)} tone="good" />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Time scale caveat</h3>
        <div
          data-testid="deltat-caveat"
          className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm leading-relaxed text-foreground"
        >
          {report.deltaT.note}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Bodies are evaluated on TT. Angles - ascendant, MC, house cusps - stay on UT, because
          rising is Earth's rotation. Getting that backwards moves the ascendant by 0.267 degrees.
        </p>
      </section>

      <section>
        <h3 className="mb-1 text-sm font-semibold text-foreground">What is not verified</h3>
        <p className="mb-3 text-xs text-muted-foreground">{report.unverifiedNote}</p>
        <ul
          data-testid="unverified-list"
          className="divide-y divide-border rounded-xl border border-border"
        >
          {report.unverified.map((u) => (
            <li key={u.area} className="px-4 py-3">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">{u.area}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{u.why}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ReportStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'good' | 'bad';
}) {
  const colour =
    tone === 'good' ? 'text-green-600 dark:text-green-400'
    : tone === 'bad' ? 'text-red-600 dark:text-red-400'
    : 'text-foreground';
  return (
    <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-2xl font-semibold tabular-nums', colour)}>{value}</p>
    </div>
  );
}
