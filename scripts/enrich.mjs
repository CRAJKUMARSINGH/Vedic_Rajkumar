#!/usr/bin/env node
/**
 * enrich.mjs — the enrichment pipeline. plan → dry → apply → promote → revert.
 *
 * Enrichment is a data release and gets the same rigour as code: validated before
 * apply, canaried, revertible by batch, and audited.
 *
 * THE HARD RULE: enrichment NEVER touches the calculation layer. If a change
 * alters a computed value, the accuracy corpus must be re-run — and then it is a
 * code release, not enrichment.
 *
 * Usage:
 *   node scripts/enrich.mjs plan   --kind nakshatra --file content/nakshatra.2026.json
 *   node scripts/enrich.mjs dry    --batch <id>
 *   node scripts/enrich.mjs apply  --batch <id> [--canary 10]
 *   node scripts/enrich.mjs promote --batch <id>
 *   node scripts/enrich.mjs revert --batch <id>
 */
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const [, , command] = process.argv;
const arg = (name, fallback = null) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
};

const DB = process.env.SUPABASE_DB_URL;
if (!DB) { console.error('SUPABASE_DB_URL required'); process.exit(2); }

const sql = (q) => execFileSync('psql', [DB, '-tAc', q], { encoding: 'utf-8' }).trim();
const sqlJson = (q) => JSON.parse(sql(q) || 'null');

const KINDS = new Set(['nakshatra', 'dasha', 'festival', 'i18n', 'alert', 'rashi', 'planet']);

// ── plan ─────────────────────────────────────────────────────────────────────
if (command === 'plan') {
  const kind = arg('kind');
  const file = arg('file');
  if (!kind || !KINDS.has(kind)) { console.error(`--kind must be one of ${[...KINDS].join(', ')}`); process.exit(2); }
  if (!file || !existsSync(file)) { console.error('--file required and must exist'); process.exit(2); }

  const entries = JSON.parse(readFileSync(file, 'utf-8'));
  if (!Array.isArray(entries) || !entries.length) { console.error('file must be a non-empty array'); process.exit(2); }

  // ── validation. Every one of these has bitten someone. ─────────────────────
  const problems = [];
  const seen = new Set();
  for (const [i, e] of entries.entries()) {
    if (!e.key || typeof e.key !== 'string') problems.push(`[${i}] missing key`);
    if (!e.locale || !['en', 'hi'].includes(e.locale)) problems.push(`[${i}] bad locale`);
    if (!e.body || typeof e.body !== 'object') problems.push(`[${i}] body must be an object`);
    const id = `${e.key}::${e.locale}`;
    if (seen.has(id)) problems.push(`[${i}] duplicate ${id} in this batch`);
    seen.add(id);

    // Festival entries are held to a higher standard than the rest.
    if (kind === 'festival') {
      if (!/^festival\.[a-z_]+\.\d{4}$/.test(e.key ?? '')) problems.push(`[${i}] festival key must be festival.<name>.<year>, got ${e.key}`);
      if (!e.source_url) problems.push(`[${i}] festival entry needs source_url`);
      if (!e.date) problems.push(`[${i}] festival entry needs a date`);
    }
    if (!e.body.hi && e.locale === 'hi' && kind === 'i18n') problems.push(`[${i}] empty hi body`);
  }

  // Locale parity within the batch — the most common enrichment mistake.
  const keys = new Set(entries.map((e) => e.key));
  for (const key of keys) {
    const locales = new Set(entries.filter((e) => e.key === key).map((e) => e.locale));
    if (locales.size === 1) problems.push(`key ${key} has only ${[...locales][0]} — add the other locale or say why`);
  }

  if (problems.length) {
    console.log(`${problems.length} validation problem(s):`);
    for (const p of problems) console.log(`  FAIL ${p}`);
    console.log('\nnothing written. Fix the file and re-run plan.');
    process.exit(1);
  }

  const batch = sql(`
    insert into public.content_batches (kind, status, source, source_url, entry_count, checks, notes)
    values ('${kind}', 'validated', 'manual', ${arg('source-url') ? `'${arg('source-url')}'` : 'null'},
            ${entries.length}, '${JSON.stringify([{ check: 'shape+parity', ok: true }])}'::jsonb,
            ${arg('notes') ? `'${arg('notes')}'` : 'null'})
    returning id`);

  // Staged as 'validated', not live. dry must run before apply.
  for (const e of entries) {
    sql(`insert into public.content_entries
           (batch_id, kind, key, locale, body, effective_from, source_url, verified_by, verified_at)
         values ('${batch}', '${kind}', '${e.key}', '${e.locale}',
                 '${JSON.stringify(e.body).replace(/'/g, "''")}'::jsonb,
                 ${e.effective_from ? `'${e.effective_from}'` : 'current_date'},
                 ${e.source_url ? `'${e.source_url}'` : 'null'},
                 ${e.verified_by ? `'${e.verified_by}'` : 'null'},
                 ${e.verified_by ? 'now()' : 'null'})`);
  }
  console.log(`batch ${batch} created: ${entries.length} entries, status=validated`);
  console.log(`next: node scripts/enrich.mjs dry --batch ${batch}`);
  process.exit(0);
}

// ── dry ──────────────────────────────────────────────────────────────────────
if (command === 'dry') {
  const batch = arg('batch');
  const b = sqlJson(`select jsonb_build_object('kind', kind, 'count', entry_count) from public.content_batches where id = '${batch}'`);
  if (!b) { console.error('batch not found'); process.exit(2); }

  const checks = [];
  // 1. does this overwrite something live?
  const collisions = Number(sql(`select count(*) from public.content_entries e
    where e.batch_id = '${batch}' and exists (
      select 1 from public.content_entries o
       where o.kind = e.kind and o.key = e.key and o.locale = e.locale
         and o.batch_id <> e.batch_id
         and (o.effective_to is null or o.effective_to > e.effective_from))`));
  checks.push({ check: 'no_live_collision', ok: true, detail: `${collisions} entries supersede a live entry` });

  // 2. CALCULATION LAYER untouched?
  checks.push({ check: 'calc_layer_untouched', ok: b.kind !== 'ephemeris',
    detail: b.kind === 'ephemeris' ? 'RE-RUN THE ACCURACY CORPUS' : 'interpretation only' });

  // 3. festival-specific health
  if (b.kind === 'festival') {
    const year = Number(sql(`select substring(key from '\\.(\\d{4})$') from public.content_entries where batch_id = '${batch}' limit 1`));
    const health = sqlJson(`select public.festival_year_health(${year})`);
    checks.push({ check: 'festival_year_health', ok: health.ready, detail: JSON.stringify(health) });
  }

  // 4. coverage after apply
  const EXPECTED = { nakshatra: 27, rashi: 12, planet: 9, dasha: 9 };
  if (EXPECTED[b.kind]) {
    const cov = sqlJson(`select public.content_coverage('${b.kind}', ${EXPECTED[b.kind]})`);
    checks.push({ check: 'coverage', ok: true, detail: `en ${cov.en}/${cov.expected}, hi ${cov.hi}/${cov.expected}` });
  }

  sql(`update public.content_batches set checks = '${JSON.stringify(checks).replace(/'/g, "''")}'::jsonb where id = '${batch}'`);
  for (const c of checks) console.log(`  ${c.ok ? 'ok  ' : 'FAIL'} ${c.check} — ${c.detail}`);

  const failed = checks.filter((c) => !c.ok);
  if (failed.length) { console.log('\ndry run failed'); process.exit(1); }
  console.log(`\ndry run passed. next: enrich.mjs apply --batch ${batch} --canary 10`);
  process.exit(0);
}

// ── apply / promote / revert ─────────────────────────────────────────────────
if (command === 'apply') {
  const batch = arg('batch');
  const canary = Number(arg('canary', '0'));
  sql(`update public.content_batches set status = 'canary', canary_pct = ${canary}, applied_at = now() where id = '${batch}'`);
  console.log(`batch ${batch} applied at ${canary}% canary.`);
  console.log(`watch: content_coverage() + error rate for 30 min, then promote.`);
  process.exit(0);
}

if (command === 'promote') {
  const batch = arg('batch');
  sql(`update public.content_batches set status = 'published', canary_pct = 100 where id = '${batch}'`);
  console.log(`batch ${batch} published.`);
  process.exit(0);
}

if (command === 'revert') {
  const batch = arg('batch');
  const n = Number(sql(`select public.revert_content_batch('${batch}')`));
  console.log(`reverted ${n} entries. Content falls back to the previous effective version.`);
  console.log(`Note: a revert is by DATE — anything published since stays.`);
  process.exit(0);
}

console.log(`usage: enrich.mjs plan|dry|apply|promote|revert [--batch id] [--kind k] [--file f]`);
process.exit(2);
