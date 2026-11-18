#!/usr/bin/env node
/**
 * bundle-budget.mjs — fails when a build exceeds budgets.json.
 *
 * Baselines exist so the failure message can say "you added 14KB" instead of
 * "178 > 190". A budget without a baseline is a number; with one it is a diff.
 *
 * Usage: node scripts/bundle-budget.mjs [--update-baseline]
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const budgets = JSON.parse(readFileSync(join(ROOT, 'budgets.json'), 'utf-8'));
const DIST = join(ROOT, 'dist');

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );

const kb = (bytes) => Math.round((bytes / 1024) * 10) / 10;
const gz = (file) => gzipSync(readFileSync(file)).length;

let files;
try {
  files = walk(DIST);
} catch {
  console.error('dist/ not found — run `npm run build` first');
  process.exit(2);
}

const js = files.filter((f) => f.endsWith('.js'));
const css = files.filter((f) => f.endsWith('.css'));

const entry = js.find((f) => /assets\/index-[^/]+\.js$/.test(f));
const vendor = js.find((f) => /assets\/vendor-[^/]+\.js$/.test(f));
const lazy = js.filter((f) => f !== entry && f !== vendor);
const largestLazy = lazy.sort((a, b) => gz(b) - gz(a))[0];

const measured = {
  entry: entry ? kb(gz(entry)) : 0,
  vendor: vendor ? kb(gz(vendor)) : 0,
  largestLazyChunk: largestLazy ? kb(gz(largestLazy)) : 0,
  totalJs: kb(js.reduce((n, f) => n + gz(f), 0)),
  totalCss: kb(css.reduce((n, f) => n + gz(f), 0)),
};

const update = process.argv.includes('--update-baseline');
const problems = [];

console.log('bundle-budget — gzip KB\n');
for (const [key, spec] of Object.entries(budgets.bundle)) {
  if (key.startsWith('_')) continue;
  const got = measured[key] ?? 0;
  const delta = Math.round((got - spec.baseline) * 10) / 10;
  const over = got > spec.max;
  const sign = delta > 0 ? '+' : '';
  console.log(
    `  ${over ? 'FAIL' : 'ok  '} ${key.padEnd(18)} ${String(got).padStart(7)} / ${spec.max}  (${sign}${delta} vs baseline)`,
  );
  if (over) problems.push(`${key}: ${got}KB exceeds ${spec.max}KB (${sign}${delta}KB vs baseline)`);
  if (update) spec.baseline = got;
}

if (update) {
  writeFileSync(join(ROOT, 'budgets.json'), `${JSON.stringify(budgets, null, 2)}\n`);
  console.log('\nbaselines updated');
}

if (problems.length) {
  console.log(`\n${problems.length} budget(s) exceeded:`);
  for (const p of problems) console.log(`  ${p}`);
  console.log('\nIf the growth is justified, update the baseline in the SAME PR and say why.');
  process.exit(1);
}
console.log('\nPASS — within budget');
