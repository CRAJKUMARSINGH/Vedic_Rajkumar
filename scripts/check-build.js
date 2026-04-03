#!/usr/bin/env node
/**
 * scripts/check-build.js
 * Post-build sanity check — verifies dist output is healthy.
 * Run: node scripts/check-build.js
 */

import { existsSync, statSync, readdirSync } from 'fs';
import { join } from 'path';

const DIST = 'dist';
let passed = 0, failed = 0;

function check(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ❌ ${name}: ${e.message}`);
    failed++;
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Check failed');
}

console.log('\n🏗️  Build Output Sanity Check\n');

check('dist/ folder exists', () => assert(existsSync(DIST), 'dist/ not found — run npm run build'));
check('index.html present',  () => assert(existsSync(join(DIST, 'index.html')), 'index.html missing'));
check('assets/ folder present', () => assert(existsSync(join(DIST, 'assets')), 'assets/ missing'));

check('vendor-react chunk exists', () => {
  const assets = readdirSync(join(DIST, 'assets'));
  assert(assets.some(f => f.startsWith('vendor-react')), 'vendor-react chunk missing');
});

check('vendor-ui chunk exists', () => {
  const assets = readdirSync(join(DIST, 'assets'));
  assert(assets.some(f => f.startsWith('vendor-ui')), 'vendor-ui chunk missing');
});

check('No chunk > 600KB (gzipped)', () => {
  const assets = readdirSync(join(DIST, 'assets'));
  const jsFiles = assets.filter(f => f.endsWith('.js'));
  for (const f of jsFiles) {
    const size = statSync(join(DIST, 'assets', f)).size;
    assert(size < 600 * 1024, `${f} is ${(size/1024).toFixed(0)}KB — exceeds 600KB limit`);
  }
});

check('service-worker.js present', () => assert(existsSync(join(DIST, 'service-worker.js')), 'SW missing'));
check('manifest.json present',     () => assert(existsSync(join(DIST, 'manifest.json')), 'manifest missing'));

console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('✅ Build output looks healthy!\n');
  process.exit(0);
} else {
  console.log(`⚠️  ${failed} check(s) failed\n`);
  process.exit(1);
}
