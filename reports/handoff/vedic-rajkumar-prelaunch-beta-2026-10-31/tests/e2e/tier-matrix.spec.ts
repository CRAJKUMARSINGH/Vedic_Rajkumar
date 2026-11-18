/**
 * tier-matrix.spec.ts — the tier robot.
 * Executes once per project (free | pro | enterprise); each project carries the
 * matching storage state. Writes per-grade evidence to reports/tiers/<grade>.json.
 *
 * HOME ROUTE: `/app` (src/pages/Index.tsx), not `/`. `/` renders LandingPageV3 —
 * the public marketing page — which carries no grade identity. `/app` is the
 * chart workspace and is where TierBadge / UpgradeBanner / WeeklyDriveCard mount.
 *
 * BACKED vs UNBACKED CHECKS: a check may only assert a surface that exists in the
 * app. `pdf-export-button`, `feature-gate` (dasha) and `white-label-toggle` are
 * part of the contract but no page renders them yet, so they are `test.fixme`
 * (skipped, visible in the run) rather than asserted vacuously. Progress is
 * tracked in to-do-list.md (Dose 1.5 / Dose 2 wiring).
 */
import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { personaForProject, type GradePersona } from './fixtures/tierSessions';

const REPORT_DIR = path.join(process.cwd(), 'reports', 'tiers');
fs.mkdirSync(REPORT_DIR, { recursive: true });

interface Check { name: string; status: 'pass' | 'fail'; detail?: string }
const checks: Check[] = [];
let pageErrors: string[] = [];

const p = (): GradePersona => personaForProject(test.info().project.name);

function record(name: string, ok: boolean, detail?: string): void {
  checks.push({ name, status: ok ? 'pass' : 'fail', detail });
  expect(ok, `${name} — ${detail ?? ''}`).toBe(true);
}

test.beforeEach(async ({ page }) => {
  pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  await page.goto('/app');
  await expect(page.locator('body')).not.toContainText('Application Error');
  // `/app` is a LAZY route and MainLayout deliberately renders no banner shell on
  // `/app` (see MainLayout.isLandingPage), so every tier surface — including
  // UpgradeBanner — only exists once the Index chunk has mounted. Without this
  // anchor, assertions run against the Suspense "Loading…" fallback: the free
  // case reads as a false-red and the paid "banner absent" cases pass vacuously.
  await expect(page.getByTestId('tier-badge').first()).toBeVisible({ timeout: 30_000 });
});

test('grade identity is visible and correct', async ({ page }) => {
  const persona = p();
  const badge = page.getByTestId('tier-badge').first();
  await expect(badge).toBeVisible();
  const tier = await badge.getAttribute('data-tier');
  record('tier-badge', tier === persona.userTier, `expected ${persona.userTier}, got ${tier}`);
});

test('upgrade banner visibility matches grade', async ({ page }) => {
  const persona = p();
  // Retrying assertions (not a bare count()) so the presence check waits for the
  // banner to paint and the absence check only runs once the app has mounted.
  const expected = persona.expect.upgradeBannerVisible ? 1 : 0;
  await expect(page.getByTestId('upgrade-banner')).toHaveCount(expected);
  const observed = await page.getByTestId('upgrade-banner').count();
  record('upgrade-banner', observed === expected,
    `expected banner ${persona.expect.upgradeBannerVisible ? 'present' : 'absent'}, found ${observed}`);
});

test.fixme('PDF export gate matches grade', async ({ page }) => {
  // TODO(Dose 1.5): no page renders a `data-testid="pdf-export-button"` with
  // `data-gated` yet. HoroscopePage only reveals Print/Copy after a birth form
  // submit, so the contract button must be added there first.
  const persona = p();
  await page.goto('/horoscope');
  const btn = page.getByTestId('pdf-export-button').first();
  await expect(btn).toBeVisible();
  const gated = await btn.getAttribute('data-gated');
  record('pdf-export', persona.expect.pdfExportEnabled ? gated !== 'true' : gated === 'true',
    `pdf data-gated=${gated}`);
});

test.fixme('advanced feature gate matches grade', async ({ page }) => {
  // TODO(Dose 2): the dasha timeline is not wrapped in <FeatureGate> yet, so
  // /dasha renders no `feature-gate` for gated grades (and passes vacuously for
  // entitled ones). Wire `dasha_timeline` behind FeatureGate on DashaPage.
  const persona = p();
  await page.goto('/dasha');
  const gate = page.getByTestId('feature-gate').first();
  const count = await gate.count();

  if (persona.expect.dashaTimelineEnabled) {
    record('dasha-gate', count === 0, 'expected no gate on /dasha');
  } else {
    record('dasha-gate', count > 0, 'expected a feature gate on /dasha');
    record('dasha-gate-feature', (await gate.getAttribute('data-feature')) === 'dasha_timeline');
  }
});

test('weekly drive allowance matches grade', async ({ page }) => {
  const persona = p();
  const card = page.getByTestId('weekly-drive-card');
  await expect(card).toBeVisible();
  const remaining = Number(await card.getAttribute('data-remaining'));
  expect(Number.isFinite(remaining)).toBe(true);

  if (persona.expect.weeklyUnlimited) {
    record('weekly-drive', remaining === -1, `paid grade must be unlimited, got ${remaining}`);
  } else {
    record('weekly-drive', remaining > 0 && remaining <= 21, `expected 1..21, got ${remaining}`);
  }
});

test.fixme('enterprise-only capability surfaces', async ({ page }) => {
  // TODO(Dose 1.5): EnterprisePage shows white-label copy only; no toggle with
  // `data-testid="white-label-toggle"` exists yet.
  const persona = p();
  const expected = persona.expect.whiteLabelEnabled;
  const route = expected ? '/enterprise' : '/';
  await page.goto(route);
  const count = await page.getByTestId('white-label-toggle').count();
  record('white-label', expected ? count > 0 : count === 0,
    `expected white-label ${expected ? 'present' : 'absent'}, found ${count}`);
});

test('zero uncaught page errors', async () => {
  record('page-errors', pageErrors.length === 0, pageErrors.join(' | '));
});

test.afterAll(() => {
  const grade = test.info().project.name;
  fs.writeFileSync(
    path.join(REPORT_DIR, `${grade}.json`),
    JSON.stringify({ grade, generatedAt: new Date().toISOString(), checks }, null, 2),
  );
});
