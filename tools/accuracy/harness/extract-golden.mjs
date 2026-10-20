/**
 * extract-golden.mjs
 * 
 * Prints engine output values for pasting into golden JSON files.
 * Run: node tools/accuracy/harness/extract-golden.mjs
 * 
 * This uses Vitest's module resolution via a quick test run that writes
 * directly to the golden dir.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
console.log('Running via Vitest — see src/tests/accuracy/generateGolden.test.ts');
console.log('Usage: npx vitest run src/tests/accuracy/generateGolden.test.ts');
