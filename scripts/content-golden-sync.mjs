#!/usr/bin/env node
/**
 * content-golden-sync.mjs — publish the festival calendar as a pinned fixture.
 *
 * `src/tests/content/festivals.golden.test.ts` asserts against
 * `src/tests/content/festivals.golden.json`. That fixture is a *copy* of what is
 * live in the database, so a content edit that is not re-pinned is a build
 * failure rather than a silent drift. The commit diff IS the review.
 *
 * Usage:
 *   npm run content:golden:sync            # write the fixture from the DB
 *   npm run content:golden:sync -- --check # fail if the fixture is out of date
 *
 * Requires SUPABASE_DB_URL (same convention as scripts/enrich.mjs).
 * Exit codes: 0 = in sync (or written); 1 = --check found drift; 2 = cannot run.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';

const ROOT = process.cwd();
const OUT = join(ROOT, 'src', 'tests', 'content', 'festivals.golden.json');
const CHECK = process.argv.includes('--check');

const DB = process.env.SUPABASE_DB_URL;
if (!DB) {
  console.error('content:golden:sync — SUPABASE_DB_URL required (see docs/ops/SECRETS.md)');
  process.exit(2);
}

const sqlJson = (q) => JSON.parse(execFileSync('psql', [DB, '-tAc', q], { encoding: 'utf-8' }).trim() || 'null');

/** The fixture pins the current and next year — the same window the test asserts. */
const currentYear = new Date().getFullYear();
const years = [currentYear, currentYear + 1];

/** One year of festival rows, en locale only (the date is locale-independent). */
function yearFestivals(year) {
  const rows = sqlJson(`
    select coalesce(jsonb_agg(jsonb_build_object(
             'key',        key,
             'date',       coalesce(body->>'date', effective_from::text),
             'source_url', source_url
           ) order by key), '[]'::jsonb)
      from public.content_entries
     where kind = 'festival'
       and locale = 'en'
       and key like 'festival.%.${year}'
       and (effective_to is null or effective_to > current_date)`);
  return Array.isArray(rows) ? rows : [];
}

const fixture = { years: {} };
for (const y of years) {
  const list = yearFestivals(y);
  if (!list.length) {
    console.error(
      `content:golden:sync — no live festival entries for ${y}.\n` +
        `  Publish the year first (node scripts/enrich.mjs ...), then re-run.`,
    );
    process.exit(2);
  }
  const missingSource = list.filter((f) => !/^https?:\/\//.test(f.source_url ?? ''));
  if (missingSource.length) {
    console.error(
      `content:golden:sync — ${missingSource.length} entries in ${y} have no source_url:\n` +
        missingSource.map((f) => `    ${f.key}`).join('\n'),
    );
    process.exit(2);
  }
  fixture.years[String(y)] = list;
}

const next = `${JSON.stringify(fixture, null, 2)}\n`;

if (CHECK) {
  if (!existsSync(OUT)) {
    console.error(`content:golden:sync — ${OUT} is missing; run without --check to create it.`);
    process.exit(1);
  }
  if (readFileSync(OUT, 'utf-8') !== next) {
    console.error(
      'content:golden:sync — the golden fixture has drifted from the database.\n' +
        '  Re-run without --check, then commit the diff (that diff is the review).',
    );
    process.exit(1);
  }
  console.log(`content:golden:sync — in sync (${years.join(', ')})`);
  process.exit(0);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, next);
const total = years.reduce((n, y) => n + fixture.years[String(y)].length, 0);
console.log(`content:golden:sync — wrote ${total} festivals across ${years.join(', ')} → ${OUT}`);
console.log('Commit the diff: it is the record of what changed and why.');
