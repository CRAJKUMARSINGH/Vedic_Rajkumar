#!/usr/bin/env node
/** Aggregate per-grade tier-robot evidence -> reports/tiers/report.json; exit 1 on NO-GO. */
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('reports', 'tiers');
const GRADES = ['free', 'pro', 'enterprise'];
const grades = [];

for (const g of GRADES) {
  const f = path.join(DIR, `${g}.json`);
  if (!fs.existsSync(f)) { grades.push({ grade: g, status: 'MISSING', failed: -1 }); continue; }
  const data = JSON.parse(fs.readFileSync(f, 'utf-8'));
  const failed = data.checks.filter((c) => c.status !== 'pass').length;
  grades.push({ grade: g, status: failed === 0 ? 'PASS' : 'FAIL', checks: data.checks.length, failed });
}

const verdict = grades.every((g) => g.status === 'PASS') ? 'GO' : 'NO-GO';
fs.writeFileSync(path.join(DIR, 'report.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), verdict, grades }, null, 2));

console.log(`tier-robot: ${verdict} — ${grades.map((g) => `${g.grade}:${g.status}`).join('  ')}`);
process.exit(verdict === 'GO' ? 0 : 1);
