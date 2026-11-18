#!/usr/bin/env node
/**
 * preflight.mjs — the Friday 10 minutes (docs/ops/PRE_LAUNCH.md §E).
 *
 * Runs the FAIL-blocking checks that CAN be automated locally, then prints the
 * ones that cannot (a real phone, a real checkout, a person on call). One script,
 * one exit code: 0 = nothing blocking, 1 = something blocking failed.
 *
 * A missing SUPABASE_DB_URL makes the content check SKIP rather than pass — a
 * check that cannot run must never look like a check that passed.
 *
 * Usage: npm run preflight
 */
import { spawnSync } from 'node:child_process';

const steps = [
  {
    id: 'A1–A5',
    label: 'Deploy safety (migration shape, client floor, kill switch, SW cache, rollback artefact)',
    cmd: [process.execPath, 'scripts/deploy-safety.mjs', '--production'],
  },
  {
    id: 'B1',
    label: 'Every shipped surface has a kill flag',
    cmd: [process.execPath, 'scripts/deploy-safety.mjs'],
    note: 'covered by deploy-safety check 3 (new page without a flag in docs/flags.yaml)',
  },
  {
    id: 'C4',
    label: 'Festival golden fixture in sync with the database',
    cmd: [process.execPath, 'scripts/content-golden-sync.mjs', '--check'],
    needsDb: true,
  },
];

/** Cannot be automated from a build box. Read them, do not skim them. */
const manual = [
  ['A2', 'Rollback artefact present and complete', 'cat .deploy/rollback.json'],
  ['A6', 'Rollback rehearsed this month', 'docs/ops/rollback-log.md, dated < 30d'],
  ['A7', 'Connection headroom > 50%', 'psql -c "select count(*) from pg_stat_activity"'],
  ['B2', 'Flag endpoint healthy', 'curl -s $EDGE/flags | jq .'],
  ['B3', 'Kill switch works from a phone', 'open /?kill=checkout'],
  ['B7', 'Someone is on call today', 'calendar'],
  ['C1–C3', 'Content coverage + this and next year festival calendars ready', 'content_coverage / festival_year_health'],
  ['D1–D3', '/status reachable · real chart on real phone · real checkout completes', 'on a device, not a laptop'],
];

const results = [];

for (const step of steps) {
  if (step.needsDb && !process.env.SUPABASE_DB_URL) {
    results.push({ ...step, status: 'SKIP', detail: 'SUPABASE_DB_URL not set — cannot verify' });
    continue;
  }
  const r = spawnSync(step.cmd[0], step.cmd.slice(1), { stdio: 'pipe', encoding: 'utf-8' });
  results.push({
    ...step,
    status: r.status === 0 ? 'PASS' : 'FAIL',
    detail: (r.stdout || r.stderr || '').trim().split('\n').slice(-3).join(' | '),
  });
}

console.log('preflight — docs/ops/PRE_LAUNCH.md §E\n');
for (const r of results) {
  console.log(`  ${r.status.padEnd(4)} ${r.id.padEnd(7)} ${r.label}`);
  if (r.detail) console.log(`         ${r.detail}`);
}

console.log('\nManual (record the answer, do not skip):');
for (const [id, label, how] of manual) console.log(`  ???? ${id.padEnd(7)} ${label} — ${how}`);

const failed = results.filter((r) => r.status === 'FAIL');
if (failed.length) {
  console.log(`\n${failed.length} blocking check(s) FAILED: ${failed.map((r) => r.id).join(', ')}`);
  console.log('A FAIL blocks the deploy, not the fix. Fix it, or record why you accept it');
  console.log('in docs/ops/pre-launch-accepted.md with a date and an owner.');
  process.exit(1);
}

const skipped = results.filter((r) => r.status === 'SKIP');
if (skipped.length) console.log(`\n${skipped.length} check(s) skipped — those are unverified, not passing.`);

console.log('\nNothing blocking failed. Finish the manual list, then ship.');
