#!/usr/bin/env node
/**
 * migrate-chart-tz.mjs
 *
 * Rewrites direct calculatePreciseChart calls in production code to use
 * calculateChartForBirth so the resolved birth timezone is honoured.
 *
 *   node scripts/migrate-chart-tz.mjs          dry-run (prints the plan)
 *   node scripts/migrate-chart-tz.mjs --write   applies the changes
 *
 * Files listed in tools/accuracy/chartTzAllowList.json are skipped.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT  = process.cwd();
const WRITE = process.argv.includes('--write');
const SRC   = join(ROOT, 'src');
const ALLOW = join(ROOT, 'tools', 'accuracy', 'chartTzAllowList.json');

const CALL      = /\bcalculatePreciseChart\s*\(/g;
const CALL_TEST = /\bcalculatePreciseChart\s*\(/;
const STILL_REF = /\bcalculatePreciseChart\b/;
const IMPORT    = /import\s*\{([^}]*)\}\s*from\s*['"]([^'"]*precisionEphemerisService)['"]\s*;?/;
const NEW_IMPORT = `import { calculateChartForBirth } from '@/services/chartWithTimezone';`;

function toPosix(value) {
  return value.split(sep).join('/');
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(toPosix(relative(ROOT, full)));
  }
  return out;
}

function globToRegExp(glob) {
  const escaped = glob.replace(/[.+?^$()|[\]{}\\]/g, '\\$&');
  return new RegExp('^' + escaped.replace(/\*\*/g, '\u0000').replace(/\*/g, '[^/]*').replace(/\u0000/g, '.*') + '$');
}

const allow = existsSync(ALLOW) ? JSON.parse(readFileSync(ALLOW, 'utf8')) : { files: {}, patterns: [] };
const allowedPatterns = (allow.patterns ?? []).map(globToRegExp);

function isAllowed(rel) {
  return Boolean(allow.files?.[rel]) || allowedPatterns.some((p) => p.test(rel));
}

function plan(rel, source) {
  const calls = (source.match(CALL) ?? []).length;
  if (calls === 0) return null;

  let out = source.replace(CALL, 'calculateChartForBirth(');

  const importMatch = source.match(IMPORT);
  if (importMatch) {
    const names       = importMatch[1].split(',').map((n) => n.trim()).filter(Boolean);
    const kept        = names.filter((n) => n.replace(/^type\s+/, '') !== 'calculatePreciseChart');
    const stillNeeded = STILL_REF.test(out);

    if (!stillNeeded) {
      const replacement = kept.length
        ? `import { ${kept.join(', ')} } from '${importMatch[2]}';`
        : '';
      out = out.replace(importMatch[0], replacement).replace(/\n{3,}/g, '\n\n');
    }
  }

  if (!/from\s*['"][^'"]*chartWithTimezone['"]/.test(out)) {
    const lines = out.split('\n');
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*import\s/.test(lines[i])) lastImport = i;
    }
    if (lastImport >= 0) {
      lines.splice(lastImport + 1, 0, NEW_IMPORT);
      out = lines.join('\n');
    }
  }

  return { out, calls };
}

const files   = walk(SRC, []);
const changes = [];
const skipped = [];

for (const rel of files) {
  const source = readFileSync(join(ROOT, rel), 'utf8');
  if (!CALL_TEST.test(source)) continue;

  if (isAllowed(rel)) {
    skipped.push(rel + '  (' + (allow.files?.[rel] ?? 'pattern') + ')');
    continue;
  }

  const result = plan(rel, source);
  if (!result) continue;
  changes.push({ rel, ...result });
  if (WRITE) writeFileSync(join(ROOT, rel), result.out, 'utf8');
}

const callCount = changes.reduce((sum, c) => sum + c.calls, 0);

console.log('\nchart timezone migration');
console.log('  mode:  ' + (WRITE ? 'WRITE' : 'DRY RUN — pass --write to apply'));
console.log('  ' + callCount + ' call site(s) across ' + changes.length + ' file(s)');
console.log('  ' + skipped.length + ' file(s) allow-listed\n');

for (const change of changes) {
  console.log('  ' + (WRITE ? 'M  ' : '?  ') + change.rel + '   (' + change.calls + ' call)');
}
for (const rel of skipped) console.log('  =  ' + rel);

if (changes.length === 0) {
  console.log('\nnothing to do — production code is fully migrated ✓');
} else if (!WRITE) {
  console.log('\nre-run with --write to apply');
} else {
  console.log('\nnow run: npm run typecheck && npm run test:run');
}
console.log('');
