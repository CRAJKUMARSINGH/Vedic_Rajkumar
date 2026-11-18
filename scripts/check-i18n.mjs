#!/usr/bin/env node
/**
 * check-i18n.mjs — three failures that a reviewer cannot see:
 *   1. a Hindi key missing (renders English silently)
 *   2. an interpolated token that differs between locales ({n} vs {count})
 *   3. a hardcoded English string in a component that should use t()
 *
 * Usage: node scripts/check-i18n.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

const read = (p) => readFileSync(p, 'utf-8');
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(e.name) ? [p] : [];
  });

const i18nFile = join(SRC, 'i18n', 'index.ts');
const src = read(i18nFile);

// Extract the en and hi blocks crudely but reliably enough for a guard.
const block = (name) => {
  const start = src.indexOf(`export const ${name} `);
  if (start < 0) return '';
  const open = src.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    if (src[i] === '}' && --depth === 0) return src.slice(open, i + 1);
  }
  return '';
};

const keys = (text) => [...text.matchAll(/^\s*'([^']+)':/gm)].map((m) => m[1]);
const tokens = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);

const enKeys = keys(block('en'));
const hiKeys = keys(block('hi'));
const problems = [];

if (!enKeys.length) problems.push('could not parse the `en` catalogue — check the file shape');

const missing = enKeys.filter((k) => !hiKeys.includes(k));
if (missing.length) problems.push(`hi is missing ${missing.length} key(s): ${missing.slice(0, 8).join(', ')}`);

const extra = hiKeys.filter((k) => !enKeys.includes(k));
if (extra.length) problems.push(`hi has ${extra.length} key(s) not in en: ${extra.slice(0, 8).join(', ')}`);

// Token parity per key.
const enBlock = block('en');
const hiBlock = block('hi');
for (const key of enKeys) {
  const line = (b) => b.split('\n').find((l) => l.includes(`'${key}':`)) ?? '';
  const a = tokens(line(enBlock)).sort().join(',');
  const b = tokens(line(hiBlock)).sort().join(',');
  if (a !== b) problems.push(`token mismatch in "${key}": en[${a}] vs hi[${b}]`);
}

// Hardcoded-string heuristic: JSX text with 2+ words and no t( on the line.
const suspicious = [];
for (const f of walk(SRC)) {
  if (f.includes('/i18n/') || f.includes('/tests/')) continue;
  for (const [i, line] of read(f).split('\n').entries()) {
    if (/^\s*(aria-label|placeholder|title)=["'][A-Z][a-z]+ [a-z]/.test(line) && !line.includes('t(')) {
      suspicious.push(`${relative(ROOT, f)}:${i + 1}`);
    }
  }
}

console.log(`i18n:check — ${enKeys.length} keys x 2 locales`);
if (suspicious.length) console.log(`  warn ${suspicious.length} hardcoded attribute(s), e.g. ${suspicious.slice(0, 5).join(', ')}`);

if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const p of problems) console.log(`  FAIL ${p}`);
  process.exit(1);
}
console.log('\nPASS — locales in parity');
