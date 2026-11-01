#!/usr/bin/env node
/**
 * apply-branch-protection.mjs — push .github/branch-protection.json to GitHub.
 *
 * Needs a PAT with `administration:write` (GITHUB_TOKEN cannot set protection on
 * a private repo's rules the same way). Fails loudly if the token is missing
 * rather than silently no-op-ing.
 *
 * Usage: GH_TOKEN=... REPO=owner/name node scripts/apply-branch-protection.mjs [--check]
 */
import { readFileSync } from 'node:fs';

const token = process.env.GH_TOKEN;
const repo = process.env.REPO ?? process.env.GITHUB_REPOSITORY;
if (!token || !repo) {
  console.error('GH_TOKEN and REPO (owner/name) are required');
  process.exit(2);
}

const desired = JSON.parse(readFileSync(new URL('../.github/branch-protection.json', import.meta.url), 'utf-8'));
delete desired._comment;

const api = (path, init = {}) =>
  fetch(`https://api.github.com/repos/${repo}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      ...(init.headers ?? {}),
    },
  });

const checkOnly = process.argv.includes('--check');
let drift = 0;

for (const [branch, rule] of Object.entries(desired)) {
  const current = await api(`/branches/${branch}/protection`);
  if (!current.ok) {
    console.log(`  !  ${branch}: no protection (${current.status})`);
    drift++;
  } else {
    const got = await current.json();
    const checks = rule.required_status_checks?.contexts ?? [];
    const have = (got.required_status_checks?.contexts ?? []).slice().sort().join(',');
    if (have !== checks.slice().sort().join(',')) {
      console.log(`  !  ${branch}: required checks drift\n     want ${checks.join(', ')}\n     have ${have || '(none)'}`);
      drift++;
    }
  }

  if (!checkOnly) {
    const res = await api(`/branches/${branch}/protection`, {
      method: 'PUT',
      body: JSON.stringify({
        required_status_checks: rule.required_status_checks,
        enforce_admins: rule.enforce_admins,
        required_pull_request_reviews: rule.required_pull_request_reviews,
        restrictions: rule.restrictions,
        allow_force_pushes: rule.allow_force_pushes,
        allow_deletions: rule.allow_deletions,
        required_linear_history: rule.required_linear_history,
        required_conversation_resolution: rule.required_conversation_resolution,
      }),
    });
    console.log(`  ${res.ok ? 'ok ' : 'FAIL'} ${branch}`);
  }
}

process.exit(checkOnly && drift ? 1 : 0);
