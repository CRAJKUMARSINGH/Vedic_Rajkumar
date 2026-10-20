/**
 * chartTimezoneWiring.test.ts
 *
 * Enforces that production code routes through the timezone-aware wrappers
 * (calculateChartForBirth / calculatePlanetsForBirth), not the raw engine
 * functions (calculatePreciseChart / calculatePrecisePlanetaryPositions)
 * directly, so the resolved birth timezone is always used.
 *
 * RED ON PURPOSE the first time you run this against unmigrated code.
 * The failure message IS the worklist.  Clear it with:
 *
 *   npm run migrate:chart-tz          dry run
 *   npm run migrate:chart-tz:write    applies it
 *   npm run typecheck
 *   npm run test:run
 *
 * Tests are exempt (they pin offsets deliberately for determinism).
 * See tools/accuracy/chartTzAllowList.json for the exemption list.
 */
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT  = process.cwd();
const SRC   = join(ROOT, 'src');
const ALLOW = join(ROOT, 'tools', 'accuracy', 'chartTzAllowList.json');
// Matches both engine entry points that accept a tzOffsetHours argument:
// calculatePreciseChart(...) and calculatePrecisePlanetaryPositions(...).
// A production call that omits the offset silently defaults to modern IST.
const CALL  = /\bcalculatePrecise(?:Chart|PlanetaryPositions)\s*\(/;

// Non-form chart entry points (family-profile select, example chart, auto-load)
// invoke a page's own handleSubmit({...}) directly, bypassing the shared form
// that publishes the resolved timezone. Any page doing so MUST publish it too,
// or the engine silently falls back to modern IST.
const DIRECT_SUBMIT = /\bhandleSubmit\s*\(\s*\{/;
const PUBLISHES_TZ  = /\bsetBirthTimezone\s*\(/;

function toPosix(value: string): string {
  return value.split(sep).join('/');
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(toPosix(relative(ROOT, full)));
  }
  return out;
}

function globToRegExp(glob: string): RegExp {
  const escaped = glob.replace(/[.+?^$()|[\]{}\\]/g, '\\$&');
  // Replace ** with a placeholder string before replacing * so they don't overlap
  const DOUBLE_STAR = '__DOUBLESTAR__';
  return new RegExp(
    '^' +
    escaped
      .replace(/\*\*/g, DOUBLE_STAR)
      .replace(/\*/g, '[^/]*')
      .replace(new RegExp(DOUBLE_STAR, 'g'), '.*') +
    '$',
  );
}

const allow = existsSync(ALLOW)
  ? (JSON.parse(readFileSync(ALLOW, 'utf8')) as { files?: Record<string, string>; patterns?: string[] })
  : { files: {}, patterns: [] };
const allowedPatterns = (allow.patterns ?? []).map(globToRegExp);

function isAllowed(rel: string): boolean {
  return Boolean(allow.files?.[rel]) || allowedPatterns.some((p) => p.test(rel));
}

describe('chart timezone wiring', () => {
  it('allow list file exists', () => {
    expect(existsSync(ALLOW), 'tools/accuracy/chartTzAllowList.json is missing').toBe(true);
  });

  it('routes every production call through calculateChartForBirth', () => {
    const offenders: string[] = [];

    for (const rel of walk(SRC)) {
      if (isAllowed(rel)) continue;
      readFileSync(join(ROOT, rel), 'utf8')
        .split('\n')
        .forEach((line, index) => {
          // Skip import statements — they don't call the function
          if (CALL.test(line) && !/^\s*import\b/.test(line)) {
            offenders.push(`${rel}:${index + 1}  ${line.trim()}`);
          }
        });
    }

    expect(
      offenders,
      'un-migrated call sites found — run: npm run migrate:chart-tz:write\n\n' + offenders.join('\n'),
    ).toEqual([]);
  });

  it('publishes the timezone from every non-form chart entry point', () => {
    const offenders: string[] = [];

    for (const rel of walk(SRC)) {
      if (!rel.startsWith('src/pages/')) continue;
      const src = readFileSync(join(ROOT, rel), 'utf8');
      if (DIRECT_SUBMIT.test(src) && !PUBLISHES_TZ.test(src)) {
        offenders.push(rel);
      }
    }

    expect(
      offenders,
      'page invokes handleSubmit({...}) directly but never calls setBirthTimezone — a\n' +
        'non-form chart entry point (profile select / example chart) will silently use\n' +
        'modern IST instead of the resolved birth offset:\n\n' +
        offenders.join('\n'),
    ).toEqual([]);
  });

  it('has no stale allow-list entries', () => {
    for (const rel of Object.keys(allow.files ?? {})) {
      const full = join(ROOT, rel);
      expect(existsSync(full), `${rel} is allow-listed but the file is missing`).toBe(true);
      const src = readFileSync(full, 'utf8');
      expect(
        CALL.test(src) || /calculatePreciseChart/.test(src),
        `${rel} is allow-listed but no longer references calculatePreciseChart — remove the entry`,
      ).toBe(true);
    }
  });
});
