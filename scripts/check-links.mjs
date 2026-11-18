#!/usr/bin/env node
/**
 * check-links.mjs — fails when a tracked source file is reachable from no entry point.
 *
 * "Linked" means: an entry point (app entry, package.json script, a config file,
 * a test file, a Supabase function, or a CI workflow) imports, references or
 * registers the file, directly or transitively. Committing a file creates no
 * such edge — this gate is what makes the difference explicit.
 *
 * Run: npm run links:check
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CODE_EXT = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];

// Source files that MUST be reachable. Tests are entry points, not targets.
const TARGET_ROOTS = ['src', 'scripts'];
const TARGET_EXCLUDE = [
  /(^|\/)src\/tests?\//,
  /\.(test|spec)\.(ts|tsx|js|jsx)$/,
  /\.d\.ts$/,
  /(^|\/)__mocks__\//,
];

// Where we look for import edges.
const SCAN_ROOTS = ['src', 'scripts', 'tests', 'supabase/functions'];

// Modules that are intentionally not wired into the app graph (test-only helpers,
// ambient types, etc.). Every entry needs a reason — this is not a mute button.
const ALLOWLIST = new Map([
  // example: ['src/lib/thing.ts', 'reason — owner ADR-000'],
]);

const notes = [];

// ── helpers ────────────────────────────────────────────────────────────────
const abs = (p) => path.join(ROOT, p);
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const isCode = (p) => CODE_EXT.includes(path.extname(p));

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) {
      if (name.name === 'node_modules' || name.name === 'dist' || name.name.startsWith('.')) continue;
      walk(p, out);
    } else {
      out.push(p);
    }
  }
  return out;
}

function readText(p) {
  try {
    return fs.readFileSync(p, 'utf-8');
  } catch {
    return '';
  }
}

/** Resolve a specifier to a real file on disk, or null. */
function resolveSpecifier(fromFile, spec) {
  let base;
  if (spec.startsWith('@/')) base = path.join(ROOT, 'src', spec.slice(2));
  else if (spec.startsWith('./') || spec.startsWith('../') || spec.startsWith('/')) {
    base = path.resolve(path.dirname(fromFile), spec);
  } else {
    return null; // bare import — node_modules or builtin
  }
  if (fs.existsSync(base) && fs.statSync(base).isFile()) return base;
  for (const ext of CODE_EXT) {
    if (fs.existsSync(base + ext)) return base + ext;
    const idx = path.join(base, `index${ext}`);
    if (fs.existsSync(idx)) return idx;
  }
  return null;
}

const IMPORT_RE = [
  /\bimport\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g,
  /\bexport\s+(?:\*|\{[^}]*\})\s+from\s+['"]([^'"]+)['"]/g,
  /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
  /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g,
  /\bnew\s+URL\(\s*['"]([^'"]+)['"]/g,
];

function edgesFrom(file) {
  const text = readText(file);
  const out = [];
  for (const re of IMPORT_RE) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text))) {
      const target = resolveSpecifier(file, m[1]);
      if (target && isCode(target)) out.push(target);
    }
  }
  return out;
}

/** Any quoted string in a config-like file that resolves to a real project file. */
function quotedRefs(file) {
  const text = readText(file);
  const out = [];
  const re = /['"]([^'"\n]+)['"]/g;
  let m;
  while ((m = re.exec(text))) {
    const s = m[1];
    if (!/\.[a-z0-9]+$/i.test(s) && !s.includes('/')) continue;
    for (const candidate of [path.resolve(ROOT, s), path.resolve(path.dirname(file), s)]) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile() && isCode(candidate)) {
        out.push(candidate);
        break;
      }
    }
  }
  return out;
}

// ── entry points ───────────────────────────────────────────────────────────
const roots = new Set();
const missingRoots = [];

function addRoot(p) {
  if (p && fs.existsSync(p)) roots.add(path.resolve(p));
}

addRoot(abs('src/main.tsx'));

// index.html module scripts
const indexHtml = readText(abs('index.html'));
for (const m of indexHtml.matchAll(/<script[^>]+src=["']([^"']+)["']/g)) {
  const src = m[1].replace(/^\//, '');
  addRoot(abs(src));
}

// Supabase edge function entries
for (const f of walk(abs('supabase/functions'))) {
  if (path.basename(f) === 'index.ts') addRoot(f);
}

// Test files are entry points
for (const f of walk(abs('src'))) {
  if (/\.(test|spec)\.(ts|tsx|js|jsx)$/.test(f)) addRoot(f);
}
for (const f of walk(abs('tests'))) addRoot(f);

// Config files + package.json scripts (and any quoted project file in them)
const CONFIG_FILES = [
  'vite.config.ts', 'vitest.config.ts', 'playwright.config.ts',
  'playwright.tiers.config.ts', 'playwright.screenshots.config.ts',
  'tailwind.config.ts', 'postcss.config.cjs', 'eslint.config.js', '.eslintrc.cjs',
  'tsconfig.json', 'tsconfig.tests.json', 'lighthouserc.json', '.lighthouserc.json',
];
for (const c of CONFIG_FILES) {
  const p = abs(c);
  if (!fs.existsSync(p)) continue;
  addRoot(p);
  for (const r of quotedRefs(p)) addRoot(r);
}

for (const wf of walk(abs('.github/workflows'))) {
  for (const r of quotedRefs(wf)) addRoot(r);
}

const pkg = JSON.parse(readText(abs('package.json')));
for (const cmd of Object.values(pkg.scripts ?? {})) {
  for (const m of String(cmd).matchAll(/\b(?:node|tsx)\s+([\w./-]+\.(?:mjs|js|cjs|ts))/g)) {
    addRoot(abs(m[1]));
  }
}
for (const r of quotedRefs(abs('package.json'))) addRoot(r);

// ── reachability fixpoint ──────────────────────────────────────────────────
const isTestFile = (f) => {
  const r = rel(f);
  return /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(f) || r.startsWith('tests/');
};

const reachable = new Set();
const queue = [...roots];
while (queue.length) {
  const file = queue.pop();
  if (reachable.has(file)) continue;
  reachable.add(file);
  const next = edgesFrom(file);
  // A test that names a file path (fs.readFileSync('../../routes/x.tsx')) links it.
  if (isTestFile(file)) next.push(...quotedRefs(file));
  for (const n of next) if (!reachable.has(n)) queue.push(n);
}

// A ratchet: scripts/links.baseline.json lists the orphans we knowingly carry.
// New orphans fail the gate; the baseline only ever shrinks.
const BASELINE_PATH = abs('scripts/links.baseline.json');
const baseline = new Set(
  fs.existsSync(BASELINE_PATH) ? JSON.parse(readText(BASELINE_PATH)) : [],
);

// ── report ─────────────────────────────────────────────────────────────────
const allCode = [];
for (const root of SCAN_ROOTS) for (const f of walk(abs(root))) if (isCode(f)) allCode.push(f);

const isTarget = (f) => {
  const r = rel(f);
  return TARGET_ROOTS.some((t) => r.startsWith(`${t}/`)) && !TARGET_EXCLUDE.some((re) => re.test(r));
};

const orphans = [];
for (const f of allCode) {
  if (!isTarget(f)) continue;
  if (reachable.has(f)) continue;
  const r = rel(f);
  if (ALLOWLIST.has(r)) {
    notes.push(`allowlisted ${r} — ${ALLOWLIST.get(r)}`);
    continue;
  }
  orphans.push(r);
}
orphans.sort();

if (process.argv.includes('--write-baseline')) {
  fs.writeFileSync(BASELINE_PATH, `${JSON.stringify(orphans, null, 2)}\n`);
  console.log(`wrote ${orphans.length} entries to scripts/links.baseline.json`);
  process.exit(0);
}

const fresh = orphans.filter((o) => !baseline.has(o));
const stale = [...baseline].filter((b) => !orphans.includes(b)).sort();

// Separate, non-fatal signal: files the *app* never reaches and only a test
// imports. Legitimate for test helpers, suspicious for product code.
const appReachable = new Set();
const appQueue = [...roots].filter((f) => !isTestFile(f));
while (appQueue.length) {
  const file = appQueue.pop();
  if (appReachable.has(file)) continue;
  appReachable.add(file);
  for (const n of edgesFrom(file)) if (!appReachable.has(n)) appQueue.push(n);
}
const testOnly = orphans.filter((o) => appReachable.has(abs(o)));

const rootList = [...roots].map(rel).sort();
console.log(`links:check — ${rootList.length} entry points, ${allCode.length} code files scanned`);
console.log(`  reachable: ${reachable.size} · orphans: ${orphans.length} (baseline ${baseline.size})`);
for (const n of notes) console.log(`  ok    ${n}`);
if (stale.length) {
  console.log(`\n${stale.length} baseline entr${stale.length === 1 ? 'y is' : 'ies are'} now reachable — prune scripts/links.baseline.json:`);
  for (const s of stale) console.log(`  STALE ${s}`);
}
if (testOnly.length) {
  console.log(`\n${testOnly.length} file(s) reached only from a test, not the app (warn — not fatal):`);
  for (const t of testOnly) console.log(`  TEST-ONLY ${t}`);
}

if (fresh.length) {
  console.log(`\n${fresh.length} NEW unreachable source file(s) — wire them into an entry point or delete them:`);
  for (const p of fresh) console.log(`  ORPHAN ${p}`);
  process.exit(1);
}
console.log('\nPASS — no new orphans; every tracked source file is accounted for');
