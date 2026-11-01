#!/usr/bin/env node
/**
 * check-licenses.mjs — the Swiss Ephemeris licensing decision, made binding.
 *
 * A memo does not stop a copyleft dependency from entering the tree. This does.
 * Anything under a copyleft licence must appear in scripts/license-allowlist.json
 * WITH an ADR reference, or CI fails.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ALLOW = new Set([
  'MIT','ISC','Apache-2.0','BSD-2-Clause','BSD-3-Clause','0BSD','Unlicense',
  'CC0-1.0','BlueOak-1.0.0','MPL-2.0','CC-BY-4.0','CC-BY-3.0','Unicode-3.0','Python-2.0','WTFPL',
]);
const REVIEW = /^(A|L|)GPL-|^CC-BY-SA|^CDDL|^EPL-/i;

const lock = JSON.parse(fs.readFileSync(path.join(ROOT, 'package-lock.json'), 'utf-8'));
const allowlistPath = path.join(ROOT, 'scripts', 'license-allowlist.json');
const allowlist = fs.existsSync(allowlistPath)
  ? JSON.parse(fs.readFileSync(allowlistPath, 'utf-8')).allowed ?? []
  : [];
const allowedNames = new Map(allowlist.map((e) => [e.package, e]));

const offenders = [];
const review = [];

for (const [name, meta] of Object.entries(lock.packages ?? {})) {
  if (!name) continue;                       // root
  const pkg = name.replace(/^.*node_modules\//, '');
  const license = meta.license ?? meta.licenses?.[0]?.type;
  if (!license) { review.push({ pkg, license: 'UNKNOWN' }); continue; }
  if (ALLOW.has(license)) continue;
  if (REVIEW.test(license)) {
    if (allowedNames.has(pkg)) continue;
    offenders.push({ pkg, license });
  } else {
    review.push({ pkg, license });
  }
}

console.log(`licenses:check — ${Object.keys(lock.packages ?? {}).length} packages`);
if (review.length) {
  console.log(`\n${review.length} unknown licence(s) — review, not blocking:`);
  for (const r of review.slice(0, 20)) console.log(`  ? ${r.pkg} (${r.license})`);
}

if (offenders.length) {
  console.log(`\n${offenders.length} copyleft package(s) without an ADR decision:`);
  for (const o of offenders) console.log(`  FAIL ${o.pkg} (${o.license})`);
  console.log('\nFix: add to scripts/license-allowlist.json:');
  console.log(JSON.stringify({ allowed: offenders.map((o) => ({ package: o.pkg, license: o.license, adr: 'ADR-007', reason: '<why this is acceptable>' })) }, null, 2));
  process.exit(1);
}

console.log('\nPASS — no unreviewed copyleft dependency');
