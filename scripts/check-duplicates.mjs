#!/usr/bin/env node
/**
 * check-duplicates.mjs — fails if a deliberately-deleted duplicate reappears,
 * if a generated file loses its header, or if a retired concern comes back.
 *
 * Run: npm run duplicates:check
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const manifest = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'scripts', 'duplicates.manifest.json'), 'utf-8'),
);

const problems = [];
const notes = [];

const exists = (p) => fs.existsSync(path.join(ROOT, p));

for (const entry of manifest.banned) {
  if (exists(entry.path)) {
    problems.push(
      `REAPPEARED  ${entry.path}\n            ${entry.reason}\n            use ${entry.replacedBy} (${entry.adr})`,
    );
  } else {
    notes.push(`gone        ${entry.path}`);
  }
}

for (const entry of manifest.generated) {
  const full = path.join(ROOT, entry.path);
  if (!exists(entry.path)) {
    problems.push(`MISSING     ${entry.path}\n            regenerate with: ${entry.emit} (${entry.adr})`);
    continue;
  }
  const head = fs.readFileSync(full, 'utf-8').split('\n').slice(0, 3).join('\n');
  if (!head.includes(entry.header)) {
    problems.push(
      `NO HEADER   ${entry.path}\n            expected first lines to contain: ${entry.header}\n            regenerate with: ${entry.emit} (${entry.adr})`,
    );
  } else {
    notes.push(`generated   ${entry.path}`);
  }
}

// Retired env keys must not be read anywhere in src/.
for (const concern of manifest.singleSource) {
  for (const key of concern.retired ?? []) {
    const hits = [];
    const walk = (dir) => {
      for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, name.name);
        if (name.isDirectory()) walk(p);
        else if (/\.(ts|tsx|js|jsx)$/.test(name.name)) {
          if (fs.readFileSync(p, 'utf-8').includes(key)) hits.push(path.relative(ROOT, p));
        }
      }
    };
    walk(path.join(ROOT, 'src'));
    if (hits.length) {
      problems.push(`RETIRED KEY ${key} still read in: ${hits.join(', ')}\n            owner for "${concern.concern}" is ${concern.owner} (${concern.adr})`);
    }
  }
}

console.log(`duplicates:check — ${manifest.banned.length} banned, ${manifest.generated.length} generated, ${manifest.singleSource.length} concerns`);
for (const n of notes) console.log(`  ok   ${n}`);

if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const p of problems) console.log(`  FAIL ${p}`);
  process.exit(1);
}
console.log('\nPASS — one source of truth per subsystem');
