#!/usr/bin/env node
/**
 * verify-claims.mjs — doc-truth gate (CDR-2026-001 finding F-07).
 *
 * Documentation drift ("claim inflation") is the cheapest credibility fix an
 * enterprise buyer checks. This script derives the canonical figures from the
 * repository itself and fails if any tracked document still states a stale one.
 *
 * Canonical truth is derived — never hand-maintained:
 *   version       ← package.json
 *   corpusCharts  ← non-empty lines in tools/accuracy/corpus/charts.jsonl
 *   goldenCharts  ← chart files in tools/accuracy/golden/ (manifest excluded)
 *   tests/files   ← the vitest JSON reporter (run by this script)
 *
 * Usage:
 *   node scripts/verify-claims.mjs              # runs the suite, then verifies
 *   node scripts/verify-claims.mjs --no-tests   # docs-only (uses last report)
 *
 * Exit codes: 0 = docs agree with the code; 1 = drift or tests failed.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const REPORT = join(ROOT, '.vitest-report.json');
const runTests = !process.argv.includes('--no-tests');

// ─── Canonical values ────────────────────────────────────────────────────────

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const version = pkg.version;

const corpusPath = join(ROOT, 'tools', 'accuracy', 'corpus', 'charts.jsonl');
const corpusCharts = readFileSync(corpusPath, 'utf8')
  .split('\n')
  .filter((l) => l.trim() !== '').length;

const goldenDir = join(ROOT, 'tools', 'accuracy', 'golden');
const goldenCharts = readdirSync(goldenDir).filter(
  (f) => f.endsWith('.json') && f !== 'manifest.json',
).length;

if (runTests) {
  // Invoke vitest's own entry with the current Node binary: no `npx`/shell hop,
  // so the same invocation works on Windows and POSIX without argument-quoting
  // hazards.
  const vitestPkg = JSON.parse(
    readFileSync(join(ROOT, 'node_modules', 'vitest', 'package.json'), 'utf8'),
  );
  const vitestBin = join(
    ROOT,
    'node_modules',
    'vitest',
    vitestPkg.bin.vitest.replace(/^\.\//, ''),
  );
  spawnSync(
    process.execPath,
    [
      vitestBin,
      'run',
      '--reporter=default',
      '--reporter=json',
      '--outputFile=.vitest-report.json',
    ],
    { cwd: ROOT, stdio: 'inherit' },
  );
  if (!existsSync(REPORT)) {
    console.error('✖ verify-claims: vitest produced no report; cannot verify test counts.');
    process.exit(1);
  }
  // A non-zero vitest exit is expected when tests fail; the report is still
  // written and the failure is surfaced explicitly below.
}

const report = JSON.parse(readFileSync(REPORT, 'utf8'));
const tests = report.numTotalTests;
const testFiles = report.testResults.length;
const failedTests = report.numFailedTests ?? 0;

console.log('Canonical (derived from the repository):');
console.log(`  version       : ${version}`);
console.log(`  corpus charts : ${corpusCharts}`);
console.log(`  golden charts : ${goldenCharts}`);
console.log(`  tests         : ${tests} across ${testFiles} files`);
console.log('');

// ─── Assertions: a captured doc value must equal the canonical value ─────────
// Each rule: { file, pattern (capture groups), join, expected, label }.
// `found` is the capture groups joined by `join`; it must equal `expected`.
// A missing match is a failure too — the claim site must still exist, so a
// doc that silently drops its metric is caught rather than passing vacuously.

const rules = [
  { file: 'README.md', pattern: /tests-(\d+)%20passing/, expected: String(tests), label: 'README test-count badge' },
  { file: 'README.md', pattern: /\((\d+) tests\)/, expected: String(tests), label: 'README test:run comment' },
  { file: 'README.md', pattern: /Tailwind_CSS-(\d)/, expected: '4', label: 'README Tailwind badge (v4)' },
  { file: 'README.md', pattern: /engine%20accuracy-(\d+)%2F(\d+)/, join: '%2F', expected: '15%2F15', label: 'README accuracy badge (charts)' },
  { file: 'docs/ENTERPRISE_LAUNCH_GUIDE.md', pattern: /# (\d+) tests/, expected: String(tests), label: 'ENTERPRISE test count' },
  { file: 'docs/SOC2_PREPARATION_CHECKLIST.md', pattern: /(\d+) charts · \d+ assertions/, expected: String(corpusCharts), label: 'SOC2 accuracy corpus size' },
  { file: 'docs/CLAIMS.md', pattern: /\| \*\*Reference Golden Corpus\*\* \| \*\*(\d+) charts\*\*/, expected: String(corpusCharts), label: 'CLAIMS golden corpus' },
  { file: 'docs/CLAIMS.md', pattern: /\*\*(\d+) tests\*\* across \*\*(\d+) test files\*\*/, join: ' tests across ', expected: `${tests} tests across ${testFiles}`, label: 'CLAIMS total test suite' },
];

// ─── Stale-token guard ───────────────────────────────────────────────────────
// Retired figures that must not reappear in the *claim* docs. docs/CLAIMS.md is
// deliberately exempt: as the reconciliation record it is allowed to cite the
// superseded values it explains.
const staleTokens = ['1476', '1316', '155/155', '"version":"1.0.0"'];
const staleGuardFiles = [
  'README.md',
  'docs/ENTERPRISE_LAUNCH_GUIDE.md',
  'docs/SOC2_PREPARATION_CHECKLIST.md',
];

// ─── Evaluate ────────────────────────────────────────────────────────────────

const problems = [];

for (const rule of rules) {
  const full = join(ROOT, rule.file);
  if (!existsSync(full)) {
    problems.push(`${rule.file}: file not found (${rule.label})`);
    continue;
  }
  const src = readFileSync(full, 'utf8');
  const m = src.match(rule.pattern);
  if (!m) {
    problems.push(`${rule.file}: ${rule.label} — claim site not found; update the doc or this rule`);
    continue;
  }
  const found = m.slice(1).join(rule.join ?? '');
  if (found !== rule.expected) {
    problems.push(`${rule.file}: ${rule.label} — doc says "${found}", code says "${rule.expected}"`);
  }
}

for (const file of staleGuardFiles) {
  const full = join(ROOT, file);
  if (!existsSync(full)) continue;
  const src = readFileSync(full, 'utf8');
  for (const token of staleTokens) {
    if (src.includes(token)) {
      problems.push(`${file}: stale token "${token}" present — superseded figure`);
    }
  }
}

// ─── Report ──────────────────────────────────────────────────────────────────

if (failedTests > 0) {
  console.error(`✖ ${failedTests} test(s) failed during verification.`);
  problems.push(`${failedTests} test(s) failed — test counts cannot be trusted`);
}

if (problems.length > 0) {
  console.error('✖ docs:verify — documentation drift detected:\n');
  for (const p of problems) console.error(`  • ${p}`);
  console.error('\nFix the documents to match the code, then re-run: npm run docs:verify');
  process.exit(1);
}

console.log('✔ docs:verify — every tracked claim matches the code.');
