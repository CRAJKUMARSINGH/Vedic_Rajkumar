#!/usr/bin/env node
/**
 * new-incident.mjs — append an entry to docs/audit/INCIDENT_LOG.md.
 *
 * The logbook is append-only, and the field list is fixed (see the Template at
 * the top of the file). Writing it by hand is how a field gets quietly dropped —
 * usually "detection gap", the one number that tells you whether the monitoring
 * is doing its job. So the shape is enforced here and the human fills the blanks.
 *
 * Usage:
 *   node scripts/new-incident.mjs --sev S1 --title "Checkout 500 for INR" \
 *     [--detected-by monitoring|user|self] [--lever "kill flag (kill_checkout)"]
 *
 * Every field left out is written as `<TODO>` — an entry that admits what it does
 * not know is more useful than one that reads complete.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const LOG = join(ROOT, 'docs', 'audit', 'INCIDENT_LOG.md');

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const sev = arg('sev');
const title = arg('title');

if (!sev || !title) {
  console.error('✖ incident:new — --sev and --title are required');
  console.error('  e.g. node scripts/new-incident.mjs --sev S2 --title "PDF export empty for hi"');
  process.exit(1);
}
if (!/^S[1-4]$/.test(sev)) {
  console.error(`✖ incident:new — --sev must be S1–S4, got "${sev}"`);
  process.exit(1);
}
if (!existsSync(LOG)) {
  console.error(`✖ incident:new — ${LOG} not found`);
  process.exit(1);
}

/** IST, because every timestamp in the logbook is read in IST. */
function istTimestamp() {
  const parts = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' });
  return `${parts.replace(' ', 'T')}+05:30`;
}

const entry = [
  `### [${istTimestamp()}] — ${sev} — ${title}`,
  `- Detected by: ${arg('detected-by', '<TODO>')}`,
  '- Detection gap: <TODO>',
  `- Mitigation lever: ${arg('lever', '<TODO>')}`,
  '- Time to mitigate: <TODO>',
  '- Time to resolve: <TODO>',
  '- Data impact: <TODO>',
  '- Root cause: <TODO>',
  '- DEF-: <TODO>',
  '- Post-incident doc: <TODO>',
  '',
].join('\n');

const current = readFileSync(LOG, 'utf-8');
if (!current.includes('## Log')) {
  console.error('✖ incident:new — the logbook has no "## Log" section to append to');
  process.exit(1);
}

writeFileSync(LOG, `${current.replace(/\s*$/, '')}\n\n${entry}`);

console.log(entry);
console.log(`incident:new — appended to docs/audit/INCIDENT_LOG.md`);
console.log('Fill every <TODO> before you close the incident.');
