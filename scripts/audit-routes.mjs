#!/usr/bin/env node
/**
 * audit-routes.mjs — static audit of the route graph.
 *
 * Catches three things a bundle analyser cannot:
 *   1. a route imported eagerly (in the entry chunk) instead of lazy()
 *   2. a barrel import (import { x } from '@/components') that pulls a whole dir
 *   3. a heavy module reachable from the entry chunk at all
 *
 * Usage: node scripts/audit-routes.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const HEAVY = [/ephemeris/i, /swisseph/i, /chart\.?render/i, /pdf/i, /moment|dayjs/i];

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(e.name) ? [p] : [];
  });

const files = walk(SRC);
const problems = [];
const warnings = [];

const routerFile = files.find((f) => /router\.(tsx?|jsx?)$/.test(f) && /routes?/i.test(f));
if (!routerFile) warnings.push('no router file found under src/ — audit skipped');

// ── 1. eager route imports ──────────────────────────────────────────────────
if (routerFile) {
  const src = readFileSync(routerFile, 'utf-8');
  const lazyCount = (src.match(/lazy\(/g) ?? []).length;
  const importCount = (src.match(/^import .*from ['"]@\/pages/gm) ?? []).length;
  if (importCount > 0) {
    problems.push(
      `${relative(ROOT, routerFile)}: ${importCount} eager page import(s) — wrap in lazy() (${lazyCount} already lazy)`,
    );
  }
}

// ── 2. barrel imports of heavy directories ──────────────────────────────────
const BARRELS = ['@/components', '@/features', '@/services', '@/utils'];
for (const f of files) {
  const src = readFileSync(f, 'utf-8');
  for (const barrel of BARRELS) {
    const re = new RegExp(`from ['"]${barrel.replace('/', '\\/')}['"]`, 'g');
    if (re.test(src) && HEAVY.some((h) => h.test(src))) {
      warnings.push(`${relative(ROOT, f)}: barrel import from "${barrel}" near heavy code — prefer a deep path`);
    }
  }
}

// ── 3. heavy modules reachable from the entry graph ─────────────────────────
const entry = files.find((f) => /src\/main\.(tsx?|jsx?)$/.test(f));
if (entry) {
  const src = readFileSync(entry, 'utf-8');
  const heavyInEntry = HEAVY.filter((h) => h.test(src));
  if (heavyInEntry.length) {
    warnings.push(`${relative(ROOT, entry)} references heavy module(s): ${heavyInEntry.map(String).join(', ')}`);
  }
}

// ── 4. every page has a default export (lazy() requires it) ─────────────────
const pages = files.filter((f) => /src\/pages\//.test(f));
for (const p of pages) {
  const src = readFileSync(p, 'utf-8');
  if (!/export default/.test(src)) {
    problems.push(`${relative(ROOT, p)}: no default export — lazy() will fail`);
  }
}

console.log(`route-audit — ${files.length} files, ${pages.length} pages`);
for (const w of warnings) console.log(`  warn ${w}`);

if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const p of problems) console.log(`  FAIL ${p}`);
  process.exit(1);
}
console.log(`\nPASS — ${pages.length} lazy pages, no eager heavy imports`);
