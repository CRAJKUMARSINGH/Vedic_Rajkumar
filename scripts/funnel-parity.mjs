#!/usr/bin/env node
/**
 * funnel-parity.mjs — the funnel event enum lives in two places.
 *
 * `20261110_gtm.sql` constrains funnel_events.event to a list, and
 * `supabase/functions/funnel/index.ts` drops anything not in its own EVENTS set.
 * Add an event to one and not the other and it fails silently: either the edge
 * accepts an event the DB then rejects (a logged warning, no row), or the DB
 * allows an event the edge never sends.
 *
 * This guard makes that drift a build failure.
 *
 * Run: npm run funnel:parity
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SQL = join(ROOT, 'supabase', 'migrations', '20261110_gtm.sql');
const FN = join(ROOT, 'supabase', 'functions', 'funnel', 'index.ts');

for (const f of [SQL, FN]) {
  if (!existsSync(f)) {
    console.error(`✖ funnel:parity — ${f} not found`);
    process.exit(2);
  }
}

/** Names inside `check (event in ( ... ))`. */
function fromSql(sql) {
  const block = sql.match(/check\s*\(\s*event\s+in\s*\(([\s\S]*?)\)\s*\)/i);
  if (!block) return null;
  return new Set(
    [...block[1].matchAll(/'([a-z0-9_]+)'/gi)].map((m) => m[1]),
  );
}

/** Names inside `const EVENTS = new Set([ ... ])`. */
function fromEdge(ts) {
  const block = ts.match(/const\s+EVENTS\s*=\s*new\s+Set\(\s*\[([\s\S]*?)\]\s*\)/);
  if (!block) return null;
  return new Set(
    [...block[1].matchAll(/'([a-z0-9_]+)'/gi)].map((m) => m[1]),
  );
}

const sqlEvents = fromSql(readFileSync(SQL, 'utf-8'));
const edgeEvents = fromEdge(readFileSync(FN, 'utf-8'));

if (!sqlEvents || !sqlEvents.size) {
  console.error(`✖ funnel:parity — could not read the event enum from ${SQL}`);
  process.exit(2);
}
if (!edgeEvents || !edgeEvents.size) {
  console.error(`✖ funnel:parity — could not read EVENTS from ${FN}`);
  process.exit(2);
}

const problems = [];
for (const e of sqlEvents) {
  if (!edgeEvents.has(e)) problems.push(`"${e}" is allowed by the DB but never sent by the edge (missing from EVENTS)`);
}
for (const e of edgeEvents) {
  if (!sqlEvents.has(e)) problems.push(`"${e}" is sent by the edge but rejected by the DB (missing from the check constraint)`);
}

console.log(`funnel:parity — db ${sqlEvents.size} events, edge ${edgeEvents.size} events`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const p of problems) console.log(`  FAIL ${p}`);
  console.log('\nAn event enum in two places is a coin-flip. Fix both, or delete one.');
  process.exit(1);
}
console.log('\nPASS — the funnel enum agrees in both places');
