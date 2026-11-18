#!/usr/bin/env node
/**
 * check-dco.mjs — every commit in the PR must carry a Signed-off-by line.
 *
 * WHY THIS AND NOT A CLA BOT:
 *   swisseph-wasm is AGPL. If we ever exercise the commercial escape hatch
 *   (ADR-007), or relicense the repo, we need every contributor's consent ON
 *   RECORD. A DCO is that record. A CLA is stronger but needs a signing service;
 *   DCO is a trailer and works today. Upgrading later is a policy change, not a
 *   rewrite.
 *
 * Usage: node scripts/check-dco.mjs <base-sha> <head-sha>
 */
import { execSync } from 'node:child_process';

const [base, head] = process.argv.slice(2);
if (!base || !head) {
  console.error('usage: check-dco.mjs <base-sha> <head-sha>');
  process.exit(2);
}

const DCO = /^Signed-off-by: .+ <[^<>@]+@[^<>]+>$/m;
const SKIP = /^(chore\(release\)|Merge |Revert )/;

const log = execSync(`git log --format=%H%x00%an%x00%ae%x00%B%x00--- ${base}..${head}`, {
  encoding: 'utf-8',
  maxBuffer: 32 * 1024 * 1024,
});

const commits = log
  .split('\x00---\n')
  .filter(Boolean)
  .map((chunk) => {
    const [sha, , , ...rest] = chunk.split('\x00');
    return { sha, body: rest.join('\x00') };
  });

const missing = [];
for (const c of commits) {
  const subject = c.body.split('\n')[0];
  if (SKIP.test(subject)) continue;
  if (!DCO.test(c.body)) missing.push(c.sha.slice(0, 8));
}

console.log(`dco:check — ${commits.length} commit(s), ${missing.length} unsigned`);

if (missing.length) {
  console.log('\nFix with:  git commit --amend -s   (or git rebase --signoff main)');
  for (const sha of missing) console.log(`  FAIL ${sha} missing Signed-off-by`);
  process.exit(1);
}
console.log('PASS — every commit carries contributor consent');
