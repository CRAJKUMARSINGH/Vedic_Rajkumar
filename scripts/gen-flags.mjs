#!/usr/bin/env node
/**
 * gen-flags.mjs — bake docs/flags.yaml into src/flags.generated.json.
 *
 * WHY BAKE: src/flags.ts must have a value to fall back on when the flag server
 * is unreachable. That value is the `failsafe` direction, and it belongs in a
 * reviewable file — not a magic string buried in the client. Editing flags.yaml
 * without re-baking would leave the client on a stale fail-safe, so the build
 * runs this (see the `prebuild` script) and CI can run `--check`.
 *
 * Usage:
 *   node scripts/gen-flags.mjs           # write src/flags.generated.json
 *   node scripts/gen-flags.mjs --check   # exit 1 if the committed file is stale
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'docs', 'flags.yaml');
const OUT = join(ROOT, 'src', 'flags.generated.json');
const CHECK = process.argv.includes('--check');

if (!existsSync(SRC)) {
  console.error(`✖ flags:gen — ${SRC} not found`);
  process.exit(1);
}

/**
 * The one shape docs/flags.yaml uses:
 *
 *   flags:
 *     <key>:
 *       default:  <bool>
 *       failsafe: <bool>
 *       owner:    <word>
 *       ...
 *
 * A full YAML parser would be a second dependency for a file with two levels;
 * this reads exactly those levels and fails loudly on anything it cannot place.
 */
function parseFlags(yaml) {
  const flags = {};
  let inBlock = false;
  let key = null;

  for (const line of yaml.split(/\r?\n/)) {
    if (!line.trim() || /^\s*#/.test(line)) continue;

    const section = line.match(/^([A-Za-z_][\w-]*):\s*$/);
    if (section) {
      inBlock = section[1] === 'flags';
      key = null;
      continue;
    }
    if (!inBlock) continue;

    const flag = line.match(/^ {2}([A-Za-z_][\w-]*):\s*$/);
    if (flag) {
      key = flag[1];
      flags[key] = {};
      continue;
    }

    const field = line.match(/^ {4}([a-z_][\w-]*):\s*(.+?)\s*$/);
    if (field && key && field[1] === 'failsafe') {
      const value = field[2].replace(/^["']|["']$/g, '');
      if (value !== 'true' && value !== 'false') {
        console.error(`✖ flags:gen — ${key}.failsafe must be true or false, got "${value}"`);
        process.exit(1);
      }
      flags[key].failsafe = value === 'true';
    }
  }
  return flags;
}

const flags = parseFlags(readFileSync(SRC, 'utf-8'));
const names = Object.keys(flags);

if (!names.length) {
  console.error('✖ flags:gen — no flags parsed from docs/flags.yaml');
  process.exit(1);
}
const missing = names.filter((k) => typeof flags[k].failsafe !== 'boolean');
if (missing.length) {
  console.error(`✖ flags:gen — missing failsafe for: ${missing.join(', ')}`);
  process.exit(1);
}

const json = `${JSON.stringify(flags, null, 2)}\n`;

if (CHECK) {
  const current = existsSync(OUT) ? readFileSync(OUT, 'utf-8') : '';
  if (current !== json) {
    console.error(
      '✖ flags:gen --check — src/flags.generated.json is stale.\n' +
        '  Run: npm run flags:gen   (and commit the result)',
    );
    process.exit(1);
  }
  console.log(`✔ flags:gen --check — ${names.length} flags in sync`);
  process.exit(0);
}

writeFileSync(OUT, json);
console.log(`flags:gen — ${names.length} flags → src/flags.generated.json`);
