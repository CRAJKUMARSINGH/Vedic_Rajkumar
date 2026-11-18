#!/usr/bin/env node
/**
 * emit-status.mjs — writes ops/status/status.json from the live /status endpoint
 * so the file stops being hand-edited and cannot drift from reality.
 *
 * Usage: EDGE_URL=https://<ref>.supabase.co node scripts/emit-status.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const EDGE = process.env.EDGE_URL;
if (!EDGE) {
  console.error('EDGE_URL is required');
  process.exit(1);
}

const res = await fetch(`${EDGE}/functions/v1/status`);
if (!res.ok) {
  console.error(`status fetch failed: ${res.status}`);
  process.exit(1);
}

const body = await res.json();
const out = resolve(process.cwd(), 'ops/status/status.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(
  out,
  `${JSON.stringify({ _generated: 'scripts/emit-status.mjs', ...body }, null, 2)}\n`,
  'utf-8',
);
console.log(`status:emitted ${out} (${body.status})`);
