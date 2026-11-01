#!/usr/bin/env node
/**
 * drill-restore.mjs — prove the backup is restorable, not just that it exists.
 *
 * `ops/backups/restore.sh` had never been run in anger. This drill does what the
 * spec asks, end to end, and writes the receipt:
 *
 *   dump → restore into a scratch schema → assert row counts →
 *   assert RLS still behaves → assert birth_hash matches across languages →
 *   reports/drills/restore-<date>.md   (English + हिंदी sections)
 *
 * How the scratch restore works: `pg_dump --schema=public` is taken, its
 * `public.` qualification is rewritten to `<schema>.` (so the objects land in a
 * throwaway schema rather than over production), then applied with `psql`.
 * Nothing in `public` is written or dropped — the drill is read-only against
 * production and drops only its own scratch schema in `finally`.
 *
 * The HTTP half of "a stranger gets 404" (as opposed to "reads 0 rows") is not
 * asserted here — that is `scripts/smoke-edge.mjs` `ac-nonowner`, which runs
 * against the deployed edge function. This drill asserts the database-level
 * guarantee underneath it.
 *
 * Usage:
 *   DATABASE_URL=postgres://… node scripts/drill-restore.mjs
 *   node scripts/drill-restore.mjs --schema drill_restore --report reports/drills/restore-x.md
 *
 * Exit codes: 0 all assertions passed · 1 an assertion failed · 2 preflight/usage
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATABASE_URL = process.env.DATABASE_URL;

const arg = (name, fallback = null) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? (process.argv[i + 1] ?? true) : fallback;
};

const SCHEMA = String(arg('schema', 'drill_restore'));
const DATE = new Date().toISOString().slice(0, 10);
const REPORT = String(arg('report', join('reports', 'drills', `restore-${DATE}.md`)));

const results = [];
const record = (id, en, hi, status, detail = '') =>
  results.push({ id, en, hi, status, detail });

const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

async function check(id, en, hi, fn) {
  try {
    const detail = await fn();
    record(id, en, hi, 'pass', detail ?? '');
  } catch (err) {
    record(id, en, hi, 'fail', err.message);
  }
}

// ── Preflight ───────────────────────────────────────────────────────────────

if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  console.error('DATABASE_URL आवश्यक है');
  process.exit(2);
}
if (!/^[a-z_][a-z0-9_]*$/.test(SCHEMA)) {
  console.error(`invalid schema name: ${SCHEMA}`);
  process.exit(2);
}

const run = (cmd, args, opts = {}) =>
  spawnSync(cmd, args, { encoding: 'utf8', ...opts });

const has = cmd => run(cmd, ['--version']).status === 0;
for (const cmd of ['pg_dump', 'psql']) {
  if (!has(cmd)) {
    console.error(`${cmd} not found on PATH — install the postgres client`);
    console.error(`${cmd} PATH पर नहीं मिला — postgres क्लाइंट इंस्टॉल करें`);
    process.exit(2);
  }
}

const psql = sql => {
  const r = run('psql', [DATABASE_URL, '-tA', '-v', 'ON_ERROR_STOP=1', '-c', sql]);
  if (r.status !== 0) throw new Error(`psql failed: ${(r.stderr || r.stdout).trim()}`);
  return r.stdout.trim();
};

const psqlFile = file => {
  const r = run('psql', [DATABASE_URL, '-v', 'ON_ERROR_STOP=1', '-q', '-f', file]);
  if (r.status !== 0) throw new Error(`psql -f ${file} failed: ${(r.stderr || '').trim()}`);
  return r.stdout.trim();
};

// ── Dump ────────────────────────────────────────────────────────────────────

const WORK = mkdtempSync(join(tmpdir(), 'drill-restore-'));
const SCHEMA_DUMP = join(WORK, 'schema.sql');
const DATA_DUMP = join(WORK, 'data.sql');

console.log(`\ndrill-restore — dump → scratch restore → assert (${SCHEMA})`);
console.log(`drill-restore — डंप → स्क्रैच रीस्टोर → जाँच (${SCHEMA})\n`);

const dump = (args, file) => {
  const r = run('pg_dump', [DATABASE_URL, '--no-owner', '--no-privileges', '-f', file, ...args]);
  if (r.status !== 0) throw new Error(`pg_dump failed: ${(r.stderr || '').trim()}`);
};

let dumped = false;
try {
  await check(
    'dump',
    'the schema and data dump to files',
    'स्कीमा और डेटा फ़ाइलों में डंप होते हैं',
    async () => {
      dump(['--schema=public'], SCHEMA_DUMP);
      dump(['--schema=public', '--data-only'], DATA_DUMP);
      const schemaBytes = readFileSync(SCHEMA_DUMP, 'utf8').length;
      const dataBytes = readFileSync(DATA_DUMP, 'utf8').length;
      assert(schemaBytes > 0, 'schema dump is empty');
      dumped = true;
      return `${schemaBytes} B schema, ${dataBytes} B data`;
    },
  );

  if (!dumped) throw new Error('dump failed — cannot continue');

  // ── Restore into the scratch schema ───────────────────────────────────────
  // DDL: rewrite every `public.` reference so the objects land in the scratch
  // schema (self-consistent — the admin predicate and policies move with them).
  // Data: rewrite only the COPY/setval targets, so string values that happen to
  // contain "public." are left untouched.
  const rewriteDdl = s => s.replace(/\bpublic\./g, `${SCHEMA}.`);
  const rewriteData = s =>
    s
      .replace(/^COPY public\./gm, `COPY ${SCHEMA}.`)
      .replace(/setval\('public\./g, `setval('${SCHEMA}.`)
      .replace(/^ALTER TABLE public\./gm, `ALTER TABLE ${SCHEMA}.`);

  writeFileSync(SCHEMA_DUMP, rewriteDdl(readFileSync(SCHEMA_DUMP, 'utf8')), 'utf8');
  writeFileSync(DATA_DUMP, rewriteData(readFileSync(DATA_DUMP, 'utf8')), 'utf8');

  psql(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE`);
  psql(`CREATE SCHEMA ${SCHEMA}`);

  await check(
    'restore',
    'the dump restores into a scratch schema',
    'डंप स्क्रैच स्कीमा में रीस्टोर होता है',
    async () => {
      psqlFile(SCHEMA_DUMP);
      psqlFile(DATA_DUMP);
      const tables = psql(
        `SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace ` +
          `WHERE n.nspname = '${SCHEMA}' AND c.relkind = 'r'`,
      );
      assert(Number(tables) > 0, 'no tables restored');
      return `${tables} table(s)`;
    },
  );

  // ── Row counts ────────────────────────────────────────────────────────────
  await check(
    'row-counts',
    'every restored table has the same row count as production',
    'हर रीस्टोर की गई टेबल की पंक्ति-संख्या प्रोडक्शन के समान है',
    async () => {
      const tables = psql(
        `SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace ` +
          `WHERE n.nspname = 'public' AND c.relkind = 'r' ORDER BY c.relname`,
      )
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);
      assert(tables.length > 0, 'no base tables in public');

      const q = tables
        .map(
          t =>
            `SELECT '${t}' AS t, ` +
            `(SELECT count(*) FROM public."${t}") AS a, ` +
            `(SELECT count(*) FROM ${SCHEMA}."${t}") AS b`,
        )
        .join(' UNION ALL ');
      const rows = psql(q)
        .split('\n')
        .filter(Boolean)
        .map(l => l.split('|'));

      const mismatches = rows.filter(([, a, b]) => a !== b);
      assert(
        mismatches.length === 0,
        `row-count mismatch: ${mismatches.map(([t, a, b]) => `${t} ${a}≠${b}`).join(', ')}`,
      );
      const total = rows.reduce((n, [, a]) => n + Number(a), 0);
      return `${tables.length} table(s), ${total} row(s) match`;
    },
  );

  // ── Cross-language birth_hash parity after restore ────────────────────────
  await check(
    'birth-hash-parity',
    'restored cards keep one birth_hash per subject across languages',
    'रीस्टोर किए कार्ड प्रति विषय दोनों भाषाओं में एक ही birth_hash रखते हैं',
    async () => {
      const bad = psql(
        `SELECT slug FROM ${SCHEMA}.answer_cards ` +
          `GROUP BY slug HAVING count(DISTINCT card->'subject'->>'birth_hash') > 1`,
      );
      assert(!bad, `slug(s) with divergent birth_hash: ${bad.replace(/\n/g, ', ')}`);
      const langs = psql(
        `SELECT lang || '=' || count(*) FROM ${SCHEMA}.answer_cards GROUP BY lang ORDER BY lang`,
      );
      return langs.replace(/\n/g, ' ') || 'no rows';
    },
  );

  // ── RLS survives the restore ──────────────────────────────────────────────
  await check(
    'rls-enabled',
    'RLS is enabled on the restored answer_cards',
    'रीस्टोर किए answer_cards पर RLS सक्रिय है',
    async () => {
      const on = psql(
        `SELECT relrowsecurity FROM pg_class WHERE oid = '${SCHEMA}.answer_cards'::regclass`,
      );
      assert(on === 't', `relrowsecurity = ${on}`);
      const policies = psql(
        `SELECT count(*) FROM pg_policies WHERE schemaname = '${SCHEMA}' AND tablename = 'answer_cards'`,
      );
      assert(Number(policies) > 0, 'no policies restored');
      return `${policies} policy/policies`;
    },
  );

  await check(
    'rls-stranger',
    'a stranger reads zero rows from the restored table',
    'अनजान व्यक्ति रीस्टोर की गई टेबल से शून्य पंक्तियाँ पढ़ता है',
    async () => {
      const rows = psql(
        `SET ROLE authenticated; SELECT count(*) FROM ${SCHEMA}.answer_cards;`,
      );
      assert(rows === '0', `stranger read ${rows} row(s) — RLS is not enforcing`);
      return '0 rows visible to an unauthenticated role';
    },
  );

  // Best-effort: impersonate a real owner. Skipped (not failed) when the seed
  // bank has no UUID owner_id — the policy casts auth.uid() to uuid, so a
  // non-UUID subject would error rather than test the grant.
  const owner = (() => {
    try {
      return psql(
        `SELECT owner_id FROM ${SCHEMA}.answer_cards ` +
          `WHERE owner_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' LIMIT 1`,
      );
    } catch {
      return '';
    }
  })();

  if (!owner) {
    record(
      'rls-owner',
      'a real owner reads their own full card',
      'वास्तविक मालिक अपना पूरा कार्ड पढ़ता है',
      'skip',
      'no UUID owner_id in the seed bank to impersonate',
    );
  } else {
    await check(
      'rls-owner',
      'a real owner reads their own full card',
      'वास्तविक मालिक अपना पूरा कार्ड पढ़ता है',
      async () => {
        const rows = psql(
          `SET ROLE authenticated; ` +
            `SET request.jwt.claims = '{"sub":"${owner}"}'; ` +
            `SELECT count(*) FROM ${SCHEMA}.answer_cards;`,
        );
        assert(Number(rows) > 0, 'owner read 0 rows — the grant did not survive the restore');
        return `${rows} row(s) visible to owner ${owner.slice(0, 8)}…`;
      },
    );
  }
} catch (err) {
  record('drill', 'the drill ran to completion', 'ड्रिल पूरी हुई', 'fail', err.message);
} finally {
  try {
    psql(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE`);
  } catch {
    /* best-effort teardown; the scratch schema is harmless if it lingers */
  }
  rmSync(WORK, { recursive: true, force: true });
}

// ── Report ──────────────────────────────────────────────────────────────────

const pad = (s, n) => s + ' '.repeat(Math.max(0, n - s.length));
for (const r of results) {
  console.log(`${pad(r.status.toUpperCase(), 5)} ${pad(r.en, 58)} | ${r.hi}`);
  if (r.detail) console.log(`      ${r.detail}`);
}

const count = s => results.filter(r => r.status === s).length;
const summaryEn = `${count('pass')} passed, ${count('fail')} failed, ${count('skip')} skipped`;
const summaryHi = `${count('pass')} सफल, ${count('fail')} विफल, ${count('skip')} छोड़े गए`;
console.log(`\n${summaryEn}\n${summaryHi}`);

mkdirSync(dirname(REPORT), { recursive: true });
writeFileSync(
  REPORT,
  `# Restore drill — ${DATE}

## English

**${summaryEn}**

A dump was taken, restored into the scratch schema \`${SCHEMA}\`, checked, and the
scratch schema dropped. Production \`public\` was never written to.

${results.map(r => `- **${r.status}** ${r.en}${r.detail ? ` — ${r.detail}` : ''}`).join('\n')}

## हिंदी

**${summaryHi}**

डंप लिया गया, स्क्रैच स्कीमा \`${SCHEMA}\` में रीस्टोर किया गया, जाँचा गया, और
स्क्रैच स्कीमा हटा दिया गया। प्रोडक्शन \`public\` में कभी लिखा नहीं गया।

${results.map(r => `- **${r.status}** ${r.hi}`).join('\n')}

Source: \`${process.env.GITHUB_SHA ?? 'local'}\`
`,
  'utf8',
);
console.log(`report: ${REPORT}\n`);

process.exit(count('fail') > 0 ? 1 : 0);
