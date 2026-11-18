#!/usr/bin/env node
/**
 * deploy-rollback.mjs — the 2-minute undo.
 *
 * Reads .deploy/rollback.json (captured by the deploy step) and re-deploys the
 * previous artefact. Deliberately dumb: no build, no CI, no npm install.
 *
 * Usage: node scripts/deploy-rollback.mjs --target frontend|edge [--dry-run]
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const target = process.argv[2 + process.argv.indexOf('--target')] ?? 'edge';
const DRY = process.argv.includes('--dry-run');
const FILE = '.deploy/rollback.json';

if (!existsSync(FILE)) {
  console.error(`${FILE} missing — no rollback target recorded. Deploy once first.`);
  process.exit(2);
}

const state = JSON.parse(readFileSync(FILE, 'utf-8'));
const prev = state.previous?.[target];
if (!prev) {
  console.error(`no previous ${target} recorded in ${FILE}`);
  process.exit(2);
}

console.log(`rollback → ${target}`);
console.log(`  from: ${state.current?.[target] ?? 'unknown'}`);
console.log(`  to:   ${prev.version} @ ${prev.commit?.slice(0, 8)}  (deployed ${prev.at})`);

if (DRY) process.exit(0);

const run = (cmd, args) => execFileSync(cmd, args, { stdio: 'inherit' });

if (target === 'edge') {
  // Supabase supports deploying a specific version.
  run('supabase', ['functions', 'deploy', '--project-ref', process.env.SUPABASE_PROJECT_REF ?? '', '--version', prev.version]);
} else {
  // Frontend rollback = re-deploy the previous build artefact.
  run('npx', ['netlify', 'deploy', '--dir', 'dist', '--alias', prev.alias ?? 'rollback']);
}

// Swap current/previous so a double rollback returns you forward.
writeFileSync(FILE, JSON.stringify({
  ...state,
  current: { ...state.current, [target]: prev },
  previous: { ...state.previous, [target]: state.current?.[target] ?? null },
  lastRollbackAt: new Date().toISOString(),
}, null, 2));

console.log(`\nrolled back. Verify with the original repro, then log it.`);
console.log(`Reminder: a rollback is a mitigation, not a fix. File the DEF-.`);
