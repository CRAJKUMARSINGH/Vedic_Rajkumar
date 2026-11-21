#!/usr/bin/env node
// Cross-platform pre-push gate: typecheck, then unit tests.
//
// Why this file exists
// --------------------
// Husky runs `.husky/pre-push` through `sh -e`. On some Windows terminals the
// msys `sh` is handed an unusable stdout handle, so *shell builtins* such as
// `echo` and `printf` fail with `Bad file descriptor` (EBADF). The previous
// hook began with `echo "🔍 Running typecheck + tests before push..."`; because
// of `sh -e`, that very first failed write aborted the hook before any check
// ran, blocking every push.
//
// The gate itself has to stay identical on Git-Bash, Linux and macOS, so the
// shell shim now only hands off to Node. Node writes through its own runtime
// (which tolerates the broken handle) and, crucially, this script treats the
// *exit code* as the contract: verification is never skipped and output
// failures are non-fatal.

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// A terminal or pipe that cannot accept output must never crash the gate.
for (const stream of [process.stdout, process.stderr]) {
  stream.on('error', () => {});
}

const repoRoot = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));

/** Ordered gates. The first failure aborts the push (fail fast). */
const steps = [
  { name: 'typecheck', args: ['run', 'typecheck'] },
  { name: 'unit tests', args: ['run', 'test:run'] },
];

function log(line) {
  try {
    // stderr keeps git's own stdout parsing clean; best-effort only.
    process.stderr.write(`${line}\n`);
  } catch {
    /* output is best-effort — the exit code is the contract */
  }
}

for (const step of steps) {
  log(`pre-push: running ${step.name}...`);
  const result = spawnSync('npm', step.args, {
    cwd: repoRoot,
    stdio: 'inherit', // inherited: stderr is never suppressed
    // npm is a .cmd shim on Windows and needs a shell to resolve; on
    // POSIX npm is a normal executable and needs none.
    shell: process.platform === 'win32',
  });

  const code = result.status ?? 1; // null (spawn error / signal) fails closed
  if (code !== 0) {
    log(`pre-push: ${step.name} failed (exit ${code}) — push aborted.`);
    process.exit(code);
  }
}

log('pre-push: typecheck and unit tests passed.');
