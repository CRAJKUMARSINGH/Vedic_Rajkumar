#!/usr/bin/env node
/**
 * dr-restore-drill.mjs — the drill that turns RTO/RPO from adjectives into numbers.
 *
 * What it does, in order:
 *   1. records the start time (this is the RTO clock)
 *   2. dumps the source DB (pg_dump) — stands in for "the last backup"
 *   3. restores into a scratch database
 *   4. asserts row counts on the tables that matter
 *   5. runs reopen_erasure_after_restore() — the dose-7 trap
 *   6. verifies an erasure chain still verifies after restore
 *   7. records measured RTO/RPO and PASS/FAIL into dr_drill_runs
 *
 * It is deliberately NOT clever. A drill that is hard to run does not get run.
 *
 * Usage: SOURCE_DB_URL=... TARGET_DB_URL=... node scripts/dr-restore-drill.mjs
 *        [--dry-run]
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SOURCE = process.env.SOURCE_DB_URL;
const TARGET = process.env.TARGET_DB_URL;
const DRY = process.argv.includes('--dry-run');

if (!SOURCE || !TARGET) {
  console.error('SOURCE_DB_URL and TARGET_DB_URL are required');
  process.exit(2);
}
if (SOURCE === TARGET) {
  console.error('refusing to restore onto the source');
  process.exit(2);
}

// Tables where a wrong count means the restore is a lie.
const CRITICAL = ['profiles', 'charts', 'weekly_drive_grants', 'user_entitlements', 'erasure_ledger'];

const startedAt = Date.now();
const checks = [];
let failure = null;

const psql = (url, sql) =>
  execFileSync('psql', [url, '-tAc', sql], { encoding: 'utf-8' }).trim();

const record = (name, ok, detail) => {
  checks.push({ name, ok, detail });
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
};

try {
  // ── 1. RPO: how old is the freshest data we are about to restore? ─────────
  const sourceLatest = psql(SOURCE, 'select coalesce(max(created_at), now()) from public.audit_logs');
  const backupTakenAt = new Date(sourceLatest);
  const rpoSec = Math.max(0, Math.round((Date.now() - backupTakenAt.getTime()) / 1000));
  console.log(`\ndr-drill — source freshness ${rpoSec}s (RPO clock)\n`);

  // ── 2. counts on the source, so we know what "correct" means ──────────────
  const expected = {};
  for (const t of CRITICAL) {
    try { expected[t] = Number(psql(SOURCE, `select count(*) from public.${t}`)); }
    catch { expected[t] = -1; }   // table absent in this environment
  }

  if (DRY) {
    console.log('dry run — counts:', expected);
    process.exit(0);
  }

  // ── 3. dump ───────────────────────────────────────────────────────────────
  const dir = mkdtempSync(join(tmpdir(), 'dr-'));
  const dump = join(dir, 'drill.dump');
  const t0 = Date.now();
  execFileSync('pg_dump', ['--format=custom', '--no-owner', '--no-acl', '--file', dump, SOURCE], { stdio: 'inherit' });
  const dumpSec = Math.round((Date.now() - t0) / 1000);
  record('dump', statSync(dump).size > 0, `${(statSync(dump).size / 1e6).toFixed(1)}MB in ${dumpSec}s`);

  // ── 4. restore ────────────────────────────────────────────────────────────
  const t1 = Date.now();
  execFileSync('psql', [TARGET, '-c', 'drop schema public cascade; create schema public;'], { stdio: 'inherit' });
  execFileSync('pg_restore', ['--no-owner', '--no-acl', '--clean', '--if-exists', '--dbname', TARGET, dump], { stdio: 'inherit' });
  const restoreSec = Math.round((Date.now() - t1) / 1000);
  const rtoSec = Math.round((Date.now() - startedAt) / 1000);
  record('restore', true, `${restoreSec}s (cumulative RTO ${rtoSec}s)`);

  // ── 5. row counts ─────────────────────────────────────────────────────────
  for (const t of CRITICAL) {
    if (expected[t] < 0) continue;
    const got = Number(psql(TARGET, `select count(*) from public.${t}`));
    record(`rows:${t}`, got === expected[t], `expected ${expected[t]}, got ${got}`);
  }

  // ── 6. RLS actually survived the restore ──────────────────────────────────
  const policies = Number(psql(TARGET,
    `select count(*) from pg_policies where schemaname = 'public' and cmd = 'SELECT'`));
  record('rls-policies-restored', policies > 0, `${policies} SELECT policies`);

  // ── 7. the dose-7 trap: re-apply erasure for subjects deleted after backup ─
  const reopened = Number(psql(TARGET,
    `select public.reopen_erasure_after_restore('${backupTakenAt.toISOString()}'::timestamptz)`));
  record('erasure-reapplied', true, `${reopened} request(s) reopened`);

  // ── 8. a chain must still verify after a round trip ───────────────────────
  const sampleId = psql(TARGET,
    `select request_id from public.erasure_ledger order by id desc limit 1`);
  if (sampleId) {
    const verifies = psql(TARGET, `select public.verify_erasure_chain('${sampleId}'::uuid)`);
    record('erasure-chain-verifies', verifies === 't', `request ${sampleId.slice(0, 8)}`);
  } else {
    record('erasure-chain-verifies', true, 'no ledger rows in this environment');
  }
} catch (err) {
  failure = err instanceof Error ? err.message : String(err);
  console.error(`\ndrill threw: ${failure}`);
}

const failed = checks.filter((c) => !c.ok).length;
const status = failure || failed ? 'failed' : 'passed';

console.log(`\ndr-drill: ${status} — ${checks.length - failed}/${checks.length} checks`);
console.log(JSON.stringify({ status, checks, failure }, null, 2));

// Record into the TARGET (the restored copy) so the evidence travels with it.
try {
  const sql = `select public.record_dr_drill(
    'restore', '${status}', '${new Date().toISOString()}'::timestamptz,
    ${Math.round((Date.now() - startedAt) / 1000)}, 0, null, null,
    '${JSON.stringify(checks).replace(/'/g, "''")}'::jsonb,
    ${failure ? `'${failure.replace(/'/g, "''")}'` : 'null'})`;
  psql(TARGET, sql);
} catch (e) {
  console.error('could not record the drill result:', e instanceof Error ? e.message : e);
}

process.exit(status === 'passed' ? 0 : 1);
