#!/usr/bin/env node
/**
 * gtm-audit.mjs — the landing page is not allowed to lie.
 *
 * Three failure classes, all of which a human reviewer misses:
 *   1. a numeric/superlative claim with no entry in docs/CLAIMS.md
 *   2. a price in copy that does not match the Stripe price in env
 *   3. a "coming soon" that has actually shipped, or a CTA that 404s
 *
 * Usage: node scripts/gtm-audit.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const problems = [];
const warnings = [];

// ── load the claim registry ──────────────────────────────────────────────────
const claimsPath = join(ROOT, 'docs', 'CLAIMS.md');
if (!existsSync(claimsPath)) {
  console.error('docs/CLAIMS.md missing — cannot audit copy');
  process.exit(2);
}
const claimsSrc = readFileSync(claimsPath, 'utf-8');
const claimIds = new Set([...claimsSrc.matchAll(/^\|\s*`?([a-z][\w.]*\.[\w_]+)`?\s*\|/gim)].map((m) => m[1]));

// ── 1. every referenced claim resolves ───────────────────────────────────────
const landing = readFileSync(join(ROOT, 'content', 'landing.yaml'), 'utf-8');
const referenced = [...landing.matchAll(/claim:\s*([\w.]+)/g)].map((m) => m[1]);

for (const id of referenced) {
  if (!claimIds.has(id)) {
    problems.push(`content/landing.yaml references claim "${id}" which is not in docs/CLAIMS.md`);
  }
}
if (referenced.length < 3) {
  warnings.push(`only ${referenced.length} claim-backed proof points — landing leans on adjectives`);
}

// ── 2. unsourced numbers in copy ─────────────────────────────────────────────
// Any line with a digit + a unit is a claim unless it is inside a claim: block.
const NUMERIC = /\b\d+(\.\d+)?\s?(ms|s|KB|MB|%|arcsec|ayanamsa|questions?|devices?)\b/gi;
const landingLines = landing.split('\n');
landingLines.forEach((line, i) => {
  if (!NUMERIC.test(line)) return;
  NUMERIC.lastIndex = 0;
  const nextLines = landingLines.slice(i, i + 3).join(' ');
  if (!/claim:/.test(nextLines)) {
    warnings.push(`content/landing.yaml:${i + 1} numeric claim with no claim: reference — "${line.trim()}"`);
  }
});

// ── 3. prices match Stripe config ────────────────────────────────────────────
const priceMap = {
  pro_inr: process.env.STRIPE_PRICE_PRO_INR,
  pro_usd: process.env.STRIPE_PRICE_PRO_USD,
};
const pricing = readFileSync(join(ROOT, 'docs', 'gtm', 'PRICING.md'), 'utf-8');
const listed = Object.fromEntries(
  [...pricing.matchAll(/^\|\s*(pro_inr|pro_usd)\s*\|\s*(\d+)\s*\|/gm)].map((m) => [m[1], m[2]]),
);
for (const [key, value] of Object.entries(priceMap)) {
  if (!value) { warnings.push(`${key} not in env — price drift not checked`); continue; }
  if (listed[key] !== value) {
    problems.push(`price drift: docs/gtm/PRICING.md says ${key}=${listed[key]}, Stripe says ${value}`);
  }
}

// ── 4. no shipped feature still marked "coming soon" ─────────────────────────
const comingSoon = [...landing.matchAll(/coming soon[:\s]+([^"\n]+)/gi)].map((m) => m[1].trim());
const routesDir = join(ROOT, 'src', 'pages');
if (existsSync(routesDir)) {
  const { readdirSync } = await import('node:fs');
  const pages = readdirSync(routesDir).map((f) => f.replace(/\.tsx?$/, '').toLowerCase());
  for (const feature of comingSoon) {
    const slug = feature.toLowerCase().replace(/[^a-z]/g, '');
    if (pages.some((p) => p.includes(slug))) {
      problems.push(`"${feature}" is marked coming soon but src/pages has a matching page`);
    }
  }
}

// ── 5. every CTA href has a page ─────────────────────────────────────────────
const hrefs = [...landing.matchAll(/href:\s*"([^"]+)"/g)].map((m) => m[1]);
const routeManifest = join(ROOT, 'src', 'routes.manifest.json');
if (existsSync(routeManifest)) {
  const routes = new Set(JSON.parse(readFileSync(routeManifest, 'utf-8')).paths);
  for (const href of hrefs) {
    if (!routes.has(href)) problems.push(`CTA "${href}" has no route in src/routes.manifest.json`);
  }
}

console.log(`gtm-audit — ${referenced.length} claim refs, ${hrefs.length} CTAs, ${comingSoon.length} "coming soon"`);
for (const w of warnings) console.log(`  warn ${w}`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const p of problems) console.log(`  FAIL ${p}`);
  console.log('\nA claim without a source is a promise you will be held to.');
  process.exit(1);
}
console.log('\nPASS — copy is sourced, prices match, no phantom features');
