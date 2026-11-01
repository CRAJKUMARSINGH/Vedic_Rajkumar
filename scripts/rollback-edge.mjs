#!/usr/bin/env node
/**
 * rollback-edge.mjs — redeploy the edge functions from a PREVIOUS commit.
 *
 * The non-obvious part: it does NOT re-run the current revision. It checks the
 * old commit out into a throwaway git worktree and deploys from there, so the
 * deployed code is byte-identical to what that commit shipped. Re-running
 * "deploy" from HEAD would just redeploy the broken thing.
 *
 * A worktree (not `git checkout`) is used deliberately: the main working tree
 * stays exactly where it is, so this is safe to run locally mid-task.
 *
 *   node scripts/rollback-edge.mjs --to <sha> --reason "429 regression"
 *   node scripts/rollback-edge.mjs --to <sha> --dry-run
 *
 * Exit codes: 0 rolled back and healthy · 1 rolled back but smoke failed
 *             2 preflight/usage · 3 deploy failed (nothing changed)
 *
 * Project ref is read from SUPABASE_PROJECT_REF (falling back to SUPABASE_REF,
 * the name the existing Deploy workflow already uses).
 */
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WORKTREE = join(ROOT, '.rollback-worktree');

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? process.env.SUPABASE_REF;
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

const arg = (name, fallback = null) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? (process.argv[i + 1] ?? true) : fallback;
};
const has = name => process.argv.includes(`--${name}`);

const TO = arg('to');
const REASON = arg('reason', 'unspecified');
const SMOKE_FROM = arg('smoke-from', 'current'); // 'current' | 'target'
const DRY = has('dry-run');
const KEEP = has('keep-worktree');
const REPORT = arg(
  'report',
  join('reports', 'deploys', `rollback-${new Date().toISOString().replace(/[:.]/g, '-')}.md`),
);

const log = (en, hi, detail = '') => {
  console.log(`  ${en}`);
  console.log(`  ${hi}`);
  if (detail) console.log(`    ${detail}`);
};
const die = (code, en, hi, detail = '') => {
  log(en, hi, detail);
  process.exit(code);
};

// ── git / bin helpers ───────────────────────────────────────────────────────

const git = (args, opts = {}) => spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', ...opts });
const gitOut = args => {
  const r = git(args);
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} → ${r.stderr.trim()}`);
  return r.stdout.trim();
};
const bin = name => {
  const p = join(ROOT, 'node_modules', '.bin', process.platform === 'win32' ? `${name}.cmd` : name);
  return existsSync(p) ? p : name;
};

// ── Preflight ───────────────────────────────────────────────────────────────

console.log('\nrollback-edge — redeploy edge functions from an earlier commit');
console.log('rollback-edge — पहले के कमिट से एज फ़ंक्शन फिर से डिप्लॉय करें\n');

if (!PROJECT_REF || !TOKEN) {
  die(
    2,
    'SUPABASE_PROJECT_REF (or SUPABASE_REF) and SUPABASE_ACCESS_TOKEN are required',
    'SUPABASE_PROJECT_REF (या SUPABASE_REF) और SUPABASE_ACCESS_TOKEN आवश्यक हैं',
  );
}
if (!TO) die(2, '--to <sha> is required', '--to <sha> आवश्यक है');

let sha;
try {
  sha = gitOut(['rev-parse', '--verify', `${TO}^{commit}`]);
} catch {
  die(2, `not a commit: ${TO}`, `कमिट नहीं: ${TO}`);
}

const head = gitOut(['rev-parse', 'HEAD']);

const ancestor = git(['merge-base', '--is-ancestor', sha, head]).status === 0;
if (!ancestor) {
  log(
    `warning: ${sha.slice(0, 8)} is not an ancestor of HEAD`,
    `चेतावनी: ${sha.slice(0, 8)} HEAD का पूर्वज नहीं`,
  );
}

const changed = gitOut(['diff', '--name-only', sha, head, '--', 'supabase/functions'])
  .split('\n')
  .filter(Boolean);

log(
  `target ${sha.slice(0, 8)} · HEAD ${head.slice(0, 8)} · reason: ${REASON}`,
  `लक्ष्य ${sha.slice(0, 8)} · HEAD ${head.slice(0, 8)} · कारण: ${REASON}`,
);

if (changed.length === 0) {
  log(
    'warning: no edge function changed between the two — this rollback is a no-op',
    'चेतावनी: दोनों के बीच कोई एज फ़ंक्शन नहीं बदला — यह रोलबैक निष्प्रभावी है',
  );
} else {
  log(`${changed.length} function file(s) differ`, `${changed.length} फ़ंक्शन फ़ाइलें भिन्न हैं`);
}

if (DRY) die(0, 'dry run — nothing deployed', 'ड्राई रन — कुछ डिप्लॉय नहीं हुआ');

// ── Stage the old revision in a worktree ────────────────────────────────────

let deployed = false;
let smokeStatus = null;

try {
  rmSync(WORKTREE, { recursive: true, force: true });
  const wt = git(['worktree', 'add', '--detach', WORKTREE, sha]);
  if (wt.status !== 0) die(3, `worktree add failed: ${wt.stderr.trim()}`, `worktree add विफल`);

  log(`staged ${sha.slice(0, 8)} at .rollback-worktree`, `${sha.slice(0, 8)} .rollback-worktree में तैयार`);

  // Fail closed: never deploy code that doesn't typecheck.
  if (existsSync(bin('deno')) || process.env.DENO_INSTALL) {
    const tc = spawnSync(bin('deno'), ['check', 'supabase/functions/**/index.ts'], {
      cwd: WORKTREE,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    if (tc.status !== 0)
      die(3, 'deno check failed on the target revision', 'लक्ष्य रिवीज़न पर deno check विफल');
    log('typecheck passed', 'टाइपचेक सफल');
  } else {
    log('deno not on PATH — skipping typecheck', 'deno नहीं मिला — टाइपचेक छोड़ा गया');
  }

  // ── Deploy from the old tree ──────────────────────────────────────────────
  const dep = spawnSync(bin('supabase'), ['functions', 'deploy', '--project-ref', PROJECT_REF], {
    cwd: WORKTREE,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (dep.status !== 0)
    die(3, 'deploy failed — production unchanged', 'डिप्लॉय विफल — प्रोडक्शन अपरिवर्तित');
  deployed = true;

  // ── Judge it by TODAY's contract, not the old one ─────────────────────────
  const smokeScript =
    SMOKE_FROM === 'target'
      ? join(WORKTREE, 'scripts', 'smoke-edge.mjs')
      : join(ROOT, 'scripts', 'smoke-edge.mjs');

  log(
    `running smoke from ${SMOKE_FROM === 'target' ? 'the target revision' : 'HEAD'}`,
    `स्मोक ${SMOKE_FROM === 'target' ? 'लक्ष्य रिवीज़न' : 'HEAD'} से चल रहा है`,
  );

  smokeStatus = spawnSync(process.execPath, [smokeScript, '--require-all'], {
    cwd: SMOKE_FROM === 'target' ? WORKTREE : ROOT,
    stdio: 'inherit',
  }).status;
} finally {
  if (!KEEP && existsSync(WORKTREE)) {
    git(['worktree', 'remove', '--force', WORKTREE]);
    git(['worktree', 'prune']);
  }
}

// ── Report ──────────────────────────────────────────────────────────────────

const healthy = smokeStatus === 0;
const verdictEn = !deployed
  ? 'not deployed'
  : healthy
    ? 'rolled back, smoke green'
    : 'rolled back, smoke FAILED (degraded)';
const verdictHi = !deployed
  ? 'डिप्लॉय नहीं हुआ'
  : healthy
    ? 'रोलबैक हुआ, स्मोक सफल'
    : 'रोलबैक हुआ, स्मोक विफल (क्षीण)';

mkdirSync(dirname(REPORT), { recursive: true });
writeFileSync(
  REPORT,
  `# Edge rollback — ${new Date().toISOString()}

## English
- **Verdict:** ${verdictEn}
- **Rolled back to:** \`${sha}\`
- **HEAD at time of rollback:** \`${head}\`
- **Reason:** ${REASON}
- **Functions differing:** ${changed.length}
- **Smoke:** ${smokeStatus === null ? 'not run' : healthy ? 'green' : `failed (exit ${smokeStatus})`}

**Follow-up:** production edge functions are now pinned to an older revision while
\`main\` is still at \`${head}\`. This is a temporary re-pin, not a revert — land a
revert commit (or fix-forward) so the next deploy doesn't silently undo it.

## हिंदी
- **निर्णय:** ${verdictHi}
- **इस पर रोलबैक:** \`${sha}\`
- **रोलबैक के समय HEAD:** \`${head}\`
- **कारण:** ${REASON}
- **भिन्न फ़ाइलें:** ${changed.length}
- **स्मोक:** ${smokeStatus === null ? 'नहीं चला' : healthy ? 'सफल' : `विफल (exit ${smokeStatus})`}

**अनुवर्ती कार्य:** एज फ़ंक्शन अब पुराने रिवीज़न पर पिन हैं जबकि \`main\` अभी
\`${head}\` पर है। यह अस्थायी री-पिन है, रिवर्ट नहीं — एक रिवर्ट कमिट लाएँ ताकि
अगला डिप्लॉय इसे चुपचाप पलट न दे।
`,
  'utf8',
);

console.log(`\n  verdict: ${verdictEn}\n           ${verdictHi}`);
console.log(`  report:  ${REPORT}\n`);

if (!deployed) process.exit(3);
process.exit(healthy ? 0 : 1);
