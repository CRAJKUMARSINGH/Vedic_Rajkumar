# Husky Pre-Push Repair and Delivery Audit

**Repository:** `E:\Rajkumar\Vedic_Rajkumar`
**Branch under audit:** `feature/lovable-hub-landing`
**Audit HEAD:** `40e9002eca98e018b95dba1dfb6f9f2fc4650bdc`
**Date:** 2026-11-21
**Release state:** **HOLD** (unchanged). No remote push, merge, deployment or history rewrite was performed.

---

## 1. Remote-push audit

Commands recorded (run from the repository root):

```
git status --short
git rev-parse HEAD
git rev-parse origin/main
git log -5 --oneline
git diff --name-status HEAD~2..HEAD
git rev-list --left-right --count origin/main...HEAD
git rev-list --left-right --count '@{u}...HEAD'
git ls-remote origin refs/heads/feature/lovable-hub-landing
```

| Observation | Value |
| --- | --- |
| `HEAD` | `40e9002eca98e018b95dba1dfb6f9f2fc4650bdc` |
| `origin/main` | `907d11e5991183e3f88f757def9e7707e5b80781` |
| Upstream of current branch | `origin/feature/lovable-hub-landing` |
| `origin/feature/lovable-hub-landing` | `40e9002…` (**identical to HEAD**) |
| ahead/behind vs upstream | `0 0` |
| ahead/behind vs `origin/main` | `0 4` (4 ahead, 0 behind) |

Last five commits:

```
40e9002 chore(docs): retire spent g1-patch and add CODE-JUNCTION standing order
65eaed3 feat(kundli): single-source Lahiri core and fail-loud ephemeris
b454281 docs(infra): align test-count pins with the 2651-test suite
65aca6c chore(infra): untrack generated artifacts, drop dead commitlint config, fix Suspense fallback
907d11e fix(infra): align Netlify prod config and regenerate prerendered assets
```

**Commits pushed (range `907d11e..40e9002`)** — four commits: `65aca6c`, `b454281`, `65eaed3`, `40e9002`.

**Change-set content (`git diff --name-status HEAD~2..HEAD`, i.e. the last two commits):**

```
D  CODE-JUNCTION/g1-patch/…                       (7 files: brief + patch + phase1 sources)
M  README.md                                      (CODE-JUNCTION standing order #8)
M  src/astrology/core/ephemeris.ts
R100 CODE-JUNCTION/g1-patch/phase1/src/lib/vedic/ayanamsaCore.ts → src/lib/vedic/ayanamsaCore.ts
M  src/lib/vedic/ayanamsaEngine.ts
M  src/lib/vedic/vedicCalc.ts
M  src/services/ayanamsaService.ts
M  src/services/ephemerisService.ts
M  src/services/precisionEphemerisService.ts
```

Findings:

- **Remote contains only intended changes.** The branch tip equals the audited HEAD and equals the local HEAD; the working tree carries only the ongoing hook repair (see §3) and the CODE-JUNCTION untracked briefs (§5).
- **No unrelated changes were included.** Every path in the pushed range belongs to the ayanamsa/ephemeris consolidation or to its documentation.
- **Certification evidence retained.** The `g1-patch/` transit-bay copy was *retired*, but its substance was relocated rather than lost — the core was promoted to `src/lib/vedic/ayanamsaCore.ts` (git records this as a 100% rename, `R100`) and the remaining phase-1 sources were merged into the live `src/` files. The patch's own brief is intentionally deleted per standing order #8 (transit bay = delete once applied).
- **No history rewrite was required or performed.**

---

## 2. Husky diagnosis

Inspected:

- `core.hooksPath` → **`.husky/_`**
- `.husky/_/h` — the Husky v9 wrapper. Its operative lines:

  ```sh
  export PATH="node_modules/.bin:$PATH"
  sh -e "$s" "$@"        # <-- runs the per-hook script with `set -e`
  c=$?
  [ $c != 0 ] && echo "husky - $n script failed (code $c)"
  exit $c
  ```

- `.husky/_/pre-push` — `#!/usr/bin/env sh` + `. "$(dirname "$0")/h"` (LF).
- `.husky/pre-push` (before repair) — began with a shell builtin that writes to stdout:

  ```sh
  echo "🔍 Running typecheck + tests before push..."
  npx tsc --noEmit || { echo "❌ Typecheck failed — push aborted."; exit 1; }
  npm run test:run || { echo "❌ Tests failed — push aborted."; exit 1; }
  ```

- `package.json` — `typecheck: tsc --noEmit`, `test:run: vitest run`; husky `^9.1.7`.

**Root cause: shell builtin writing to an invalid stdout handle, amplified by `sh -e`.**

On this Windows terminal the msys `sh` is handed an unusable stdout handle. The *shell builtin* `echo` therefore fails with

```
.husky/pre-push: line 1: echo: write error: Bad file descriptor
```

Because Husky invokes the hook as `sh -e "$s"`, that very first failed builtin write aborts the script **before any check runs**, so *every* push is rejected. Diagnostics confirmed the shell, not Node: `sh -c "echo"` returned exit 1 with no output and `sh -c "node -e …"` failed (exit 2), while running `node -e …` directly succeeded (exit 0).

Ruled out, with evidence:

| Hypothesis | Verdict |
| --- | --- |
| CRLF line endings | **No** — `.husky/pre-push` and `.husky/_/h` contain no CR bytes (LF only). |
| Wrong interpreter | **No** — `sh` exists and Node executes fine; only shell *builtins* fail. |
| Husky wrapper defect | **No** — `.husky/_/h` behaved exactly as designed; it faithfully reported the child's failure. |
| Hook recursion | **No** — no self-invocation. |
| File-descriptor / stdout handle | **Yes** — the EBADF on builtin writes is the trigger. |
| Shell initialisation (`init.sh`) | Not the origin; no init script is present. |

Per the brief, generated Husky internals (`.husky/_/**`) were **not** modified.

---

## 3. Cross-platform repair

Design: keep the *contract* (exit code) in a repository-maintained Node script, and reduce the hook shell to a shell-free hand-off that writes nothing to stdout.

**New — `scripts/hooks/pre-push.mjs`** (repository-maintained gate):

- Runs the ordered gates `npm run typecheck` then `npm run test:run` via `spawnSync`.
- `stdio: 'inherit'` — stderr is never suppressed; output streams are given `.on('error', …)` no-ops so a broken terminal handle can never crash the gate.
- `shell: process.platform === 'win32'` — so npm's `.cmd` shim resolves on Windows while POSIX uses the real executable.
- `process.exit(code)` with `code = result.status ?? 1` — **fails closed** on spawn error/signal, and propagates the child's nonzero exit code.
- Messages are written to **stderr** only, best-effort; the exit code is the contract.

**Rewritten — `.husky/pre-push`** (shell-free shim, contains no stdout-writing builtins):

```sh
#!/usr/bin/env sh
# Deterministic pre-push gate. All logic lives in scripts/hooks/pre-push.mjs,
# which runs identically on Git-Bash, Linux and macOS.
#
# This shim deliberately contains no shell builtins that write to stdout:
# msys `sh` can be handed a broken stdout handle on Windows, and because Husky
# runs this script with `sh -e`, a failing `echo` used to abort the gate.
exec node "$(dirname -- "$0")/../scripts/hooks/pre-push.mjs" "$@"
```

Guarantees against the brief:

- Works on Windows Git-Bash and on Linux/macOS/CI — one Node process, no shell builtins in the gate path.
- Propagates nonzero exit codes (`process.exit(code)`; `exec` preserves it to Husky, which re-emits it).
- Does **not** suppress stderr (`stdio: 'inherit'`).
- Does **not** use `--no-verify`.
- Does **not** skip tests — both `typecheck` and `test:run` always execute in order; a failure aborts the push.
- No shell-specific assumptions beyond `exec node <file>`.

### Before / after hook behaviour

| | Before | After |
| --- | --- | --- |
| First action | `echo "🔍 …"` (builtin → EBADF) | `exec node scripts/hooks/pre-push.mjs` |
| Failure mode on this terminal | aborts on line 1, *no check runs*, every push blocked | runs typecheck → tests; blocks only on real failure |
| Gate logic | inline shell (`npx tsc`, `npm run test:run`) | Node `spawnSync` over `npm run typecheck` / `npm run test:run` |
| Exit-code contract | `exit 1` on either failure | child's own code, or `1` if the child could not start (fail-closed) |
| stdout dependence | required & fatal | none (stderr, best-effort) |

---

## 4. Hook verification — commands and exit codes

All tests used a **local bare test remote** (`E:\Rajkumar\_hooktest_remote.git`, git remote name `hooktest`). **The real remote was never contacted.** Long runs were launched detached (outside the tool's process job) and drove the full Husky → shim → Node-gate → `git push` chain.

| # | Scenario | Exact command | Push exit | Blocked? | Evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | Typecheck success | (part of run A) | — | — | gate announced `pre-push: running unit tests…` → typecheck passed |
| 2 | Unit-test success | (part of run A) | — | — | `Test Files 164 passed \| 1 skipped (165)` · `Tests 2651 passed \| 4 skipped (2655)` |
| 5 | Normal invocation, all pass | `git push hooktest HEAD:refs/heads/probe-success` | **0** | no | `pre-push: typecheck and unit tests passed.` · `* [new branch] HEAD -> probe-success` |
| 3 | Intentional typecheck failure | probe `src/tests/__prepush_typecheck_probe.ts`; `git push hooktest HEAD:refs/heads/probe-tc` | **1** | **yes** | `error TS2322` · `pre-push: typecheck failed (exit 2) — push aborted.` · `husky - pre-push script failed (code 2)` · `error: failed to push some refs` |
| 4 | Intentional test failure | probe `src/tests/__prepush_test_probe.test.ts`; `git push hooktest HEAD:refs/heads/probe-test` | **1** | **yes** | `Test Files 1 failed \| 164 passed` · `Tests 1 failed \| 2651 passed` · `pre-push: unit tests failed (exit 1) — push aborted.` · `husky - pre-push script failed (code 1)` |

Observations:

- Tests 3 and 4 designed the failure in a throwaway probe (valid TS for #4), then the probe was deleted. Tree restored; no probe file remains.
- Test 3 confirms **fail-fast ordering**: a typecheck failure aborts before the test phase runs.
- Test 4 confirms the gate **cannot be satisfied by typecheck alone** — a genuine test failure blocks the push.
- Resulting refs on the test remote: only `refs/heads/probe-success` (the passing run). The two blocked runs created **no** refs — the gate prevented the push.
- **Incidental defect found and explained:** the first attempt of run A exited 1 with `Test Files 77 failed` — 77 files failed to *collect* with `ENOENT … AppData\Local\Temp\<dir>\client\<hash>`. Cause: the Vite/Vitest temp cache directory was removed mid-run by contention with earlier orphaned runs sharing the same `TEMP`. Fixed for the record by isolating `TEMP` per run, after which the same tree passed cleanly (2651 tests, exit 0). This is a **test-harness/environment flakiness**, not a code defect — and the gate behaved correctly by failing closed.

Exact commands used (representative):

```powershell
# detached, isolated TEMP, real hook chain:
git push hooktest HEAD:refs/heads/probe-success   # exit 0
git ls-remote hooktest                            # → refs/heads/probe-success only
```

---

## 5. CODE-JUNCTION reconciliation

Standing order §8 ([README.md](file:///e:/Rajkumar/Vedic_Rajkumar/README.md#L358-L366)) declares `CODE-JUNCTION/` a **transit bay**: only new enhancement guides and patch files, deleted once applied, returning to a `.gitkeep`-only resting state; the **folder itself is kept** (instruction #6).

### 5a. Untracked assets (the 16 paths `git status` reports)

Every untracked CODE-JUNCTION entry is a **pending brief / instruction / reference note** — precisely what the transit bay is for. None is generated evidence, none is redundant scratch.

| Path | Size | Classification |
| --- | --- | --- |
| `CODE-JUNCTION/21 N/vedic-rajkumar-enrichment-guide.md` + `vedic-rajkumar-enrichment.patch` | ~5.8 KB | **Pending implementation instruction** (guide + patch) |
| `CODE-JUNCTION/AARUDH-LAGNA/VEDIC_RAJKUMAR_LOVABLE_ARUDHA_INTEGRATION_PATCH.md` | 10.2 KB | **Pending implementation instruction** |
| `CODE-JUNCTION/AARUDH-LAGNA/CODEX.txt`, `CODEX2.txt`, `lovable chat.txt` | 7.2 / 4.1 / 4.0 KB | **Pending implementation instruction / reference** |
| `CODE-JUNCTION/ENRICH REPOSITORY GUIDE.txt` | 13.4 KB | **Pending implementation instruction** (master directive) |
| `CODE-JUNCTION/MASTER-APP-TESTER.md` | 14.1 KB | **Pending implementation instruction** |
| `CODE-JUNCTION/GITHUB_REACH_MAXIMUM.md` | 7.7 KB | **Pending implementation instruction** |
| `CODE-JUNCTION/0 test by senior AI software testing.txt` | 2.4 KB | **Pending implementation instruction** |
| `CODE-JUNCTION/c1.txt`, `c2.txt` | 5.2 / 2.7 KB | **Pending implementation instruction** (E2E / certification briefs) |
| `CODE-JUNCTION/CODEX.txt`, `CODEX2outer.txt` | 3.8 / 6.7 KB | **Pending implementation instruction** (Arudha convention / remote audit) |
| `CODE-JUNCTION/Tex21.txt`, `Grok28.txt`, `Budget.txt` | 25.7 / 28.4 / 7.2 KB | **Pending implementation instruction / reference** (roadmap, gap audit, budget) |

**Action: preserve.** Per the brief and the confidentiality order these are left untracked (not committed) and **not deleted**; deleting a spent guide is a post-application step that needs the pending work to be applied first.

One `.gitkeep` was added — `CODE-JUNCTION/21 N/.gitkeep` — so this guide/patch staging folder survives when the spent guide/patch is eventually retired (mirroring the existing `CODE-JUNCTION/.gitkeep` and `CODE-JUNCTION/AARUDH-LAGNA/.gitkeep`).

### 5b. Tracked bundle (context / risk)

`git ls-files CODE-JUNCTION` reports **255 tracked files**, imported earlier in `5dfbebf chore(infra): import CODE-JUNCTION reference bundle and raw gate logs` — i.e. **before** standing order §8 existed:

| Folder | Files | Nature |
| --- | --- | --- |
| `Venice Agent - Venice Uncensored AI_files/` (+ `.htm`) | 220 | Redundant artifact (third-party page capture) |
| `g3-patch/` | 9 | Pending instruction + generated evidence (xlsx/pptx/png) |
| `WhatsApp Unknown …/` | 6 | **Reference images — possible personal birth charts (privacy)** |
| `CHART IMAGES/` | 5 | Reference images |
| `Vedic Rajkumar … _files/` (+ `.html`) | 5 | Redundant artifact (capture of the project's own landing page) |
| `AARUDH-LAGNA/` (pdf + CODEX\*) | 2 | Reference PDF (`pdfcoffee.com_arudha-lagna…pdf`) |
| `g2-patch/`, `g4-patch/`, `g5-patch - Copy/` | 4 | Pending instruction / temporary scratch |
| `V1-CLAUDE`, `V2-CLAUDE`, `V3-CLAUD-ALL` | 3 | Temporary scratch / notes |
| `.gitkeep` | 1 | Folder-retention marker |

These tracked assets predate the transit-bay rule and now sit in tension with it. They were **not** removed: doing so requires a commit (out of scope under §7), and any attempt to scrub the already-published WhatsApp images would require a **history rewrite**, which is explicitly forbidden without owner authorisation. Flagged in §7.

**Privacy check (confidentiality order):** no untracked asset contains secrets or private birth data; the only sensitive candidates (WhatsApp chart images, the Arudha PDF) are *already tracked*. No new private data was staged or committed.

---

## 6. Files changed in this task

| File | Change | Status |
| --- | --- | --- |
| `.husky/pre-push` | rewritten as shell-free Node shim | **uncommitted** (working tree) |
| `scripts/hooks/pre-push.mjs` | new cross-platform gate | **uncommitted** (untracked) |
| `CODE-JUNCTION/21 N/.gitkeep` | new folder-retention marker | **uncommitted** (untracked) |
| `reports/HUSKY_PRE_PUSH_REPAIR.md` | this report | **uncommitted** (untracked) |

No source, configuration, generated artifact, or published bundle was otherwise altered. Probe files created for §4 were deleted.

---

## 7. Remaining risks

1. **RELEASE HOLD maintained.** No remote push, merge, deployment or history rewrite was performed. `origin/feature/lovable-hub-landing` and `origin/main` are unchanged from the audit.
2. **Hook changes are uncommitted.** The repair is verified but not landed; it will only take effect from a committed `.husky/pre-push` + `scripts/hooks/pre-push.mjs`. Committing/pushing requires explicit owner authorisation.
3. **`--no-verify` bypass.** A client-side hook is bypassable and is not a security boundary. The authoritative gate must remain CI; the hook is a developer-convenience floor only.
4. **Full-suite runtime and Windows temp flakiness.** `npm run test:run` takes ~165 s here, and a **shared `TEMP` Vite cache wiped mid-run** produced 77 spurious collection failures (`ENOENT …\client\<hash>`). Mitigation used for verification: a per-run isolated `TEMP`. Recommend either isolating `TEMP`/pinning Vite `cacheDir` or ensuring no concurrent Vitest runs, so a local push never fails for environmental reasons.
5. **CODE-JUNCTION bloat vs. standing order §8.** 255 tracked files (incl. a 219-file third-party capture, the project's own page capture, and an Arudha PDF + WhatsApp chart images) predate the transit-bay rule and are inconsistent with `CODE-JUNCTION/.gitkeep`-only intent. Remediation (untracking / removal) requires an owner-authorised commit; the possibly-personal WhatsApp images additionally need an owner privacy decision, and removal from published history would need a forbidden rewrite.
6. **Sensitive-content watch.** Keep enforcing the confidentiality order: never stage the seed-bank data, secrets, or sensitive PDFs; `public/` stays free of seed data.

---

## Final status

| Item | Result |
| --- | --- |
| **Pre-push repair** | **DONE & VERIFIED** (success path exit 0; both failure paths block with exit 1) |
| **Remote-push audit** | **CLEAN** (only intended ayanamsa/docs change-set; evidence retained via `R100` relocation) |
| **CODE-JUNCTION reconciliation** | **DONE** (all untracked assets = pending instructions → preserved; `.gitkeep` added) |
| **Release** | **HOLD** — awaiting explicit owner authorisation to commit/push |
