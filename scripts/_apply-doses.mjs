#!/usr/bin/env node
/**
 * _apply-doses.mjs — throwaway tool.
 *
 * Extracts every fenced ```diff block from the vedic-vijay spec bundles and
 * applies each per-file patch with `git apply --recount`. New-file patches whose
 * target already exists are skipped (dose-1 was applied earlier). Prints a
 * machine-readable report so failures can be reconciled by hand.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const root = process.cwd();
const sources = ['vedic-vijay/10 doses oct27.txt', 'vedic-vijay/Antidose.txt'];

const tmp = join(root, '.patch-tmp');
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

const fenceRe = /`{3,4}diff[ \t]*\r?\n([\s\S]*?)`{3,4}/g;
const results = [];
let idx = 0;

for (const src of sources) {
  const text = readFileSync(join(root, src), 'utf8').replace(/\r\n/g, '\n');
  let m;
  while ((m = fenceRe.exec(text))) {
    const block = m[1];
    const parts = block
      .split(/(?=^diff --git )/m)
      .filter((p) => p.trim().startsWith('diff --git'));
    for (const part of parts) {
      idx++;
      const id = 'p' + String(idx).padStart(3, '0');
      const patchFile = join(tmp, id + '.patch');
      writeFileSync(patchFile, part.endsWith('\n') ? part : part + '\n', 'utf8');
      const target =
        (part.match(/^\+\+\+ b\/(.+)$/m) || [])[1] ||
        (part.match(/^--- a\/(.+)$/m) || [])[1] ||
        '?';
      const chk = spawnSync(
        'git',
        ['apply', '--recount', '--whitespace=nowarn', '--check', patchFile],
        { cwd: root, encoding: 'utf8' },
      );
      let status;
      if (chk.status === 0) {
        const ap = spawnSync(
          'git',
          ['apply', '--recount', '--whitespace=nowarn', patchFile],
          { cwd: root, encoding: 'utf8' },
        );
        status = ap.status === 0 ? 'APPLIED' : 'APPLY_FAIL';
      } else {
        const err = ((chk.stderr || '') + (chk.stdout || '')).trim();
        if (/already exists/i.test(err)) status = 'SKIP_EXISTS';
        else status = 'CHECK_FAIL';
      }
      const detail =
        status.startsWith('CHECK') || status === 'APPLY_FAIL'
          ? ((chk.stderr || '') + (chk.stdout || '')).trim().split('\n')[0]
          : '';
      results.push({ id, src, target, status, detail });
    }
  }
}

const order = { APPLIED: 0, SKIP_EXISTS: 1, CHECK_FAIL: 2, APPLY_FAIL: 3 };
results.sort((a, b) => order[a.status] - order[b.status]);
for (const r of results) {
  console.log(`${r.status.padEnd(11)} ${r.target.padEnd(52)} ${r.id} ${r.detail}`);
}
const counts = {};
for (const r of results) counts[r.status] = (counts[r.status] || 0) + 1;
console.log('\nSUMMARY ' + JSON.stringify(counts) + ' total=' + results.length);
writeFileSync(
  join(tmp, 'report.json'),
  JSON.stringify(results, null, 2),
  'utf8',
);
