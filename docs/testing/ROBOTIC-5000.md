# Robotic Test Plan — 5,000 Synthetic Users (Tiered) + Bug-Fix Workflow

**Status: PLAN ONLY — declared artifact, not a runnable harness.**

This document is the specification. The harness it describes
(`tests/robots/**`, `load/k6-*.js`, `.github/workflows/robotic.yml`,
`playwright.robustness.config.ts`, `budgets.json`) **does not exist in this
repository** and deliberately has not been fabricated. Fabricated harness files
would reference fixtures that are absent here and could never go green, which
would violate the "no-masking" rule for CI gates. Build the harness when the
toolchain (Playwright robustness config, k6) is provisioned.

What _is_ implemented today, from the Roman-Hindi feature these tiers exercise:

| Invariant                                           | Where it is guarded now                                                                                                                                   |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `T1-c` no Devanagari in `hi-Latn` output            | [hinglish.test.ts](file:///c:/Users/Rajkumar/Vedic_Rajkumar/src/tests/hinglish.test.ts) (`deepTransliterate`, `toRomanHindi`)                             |
| `T1-d` classification parity EN ↔ Hinglish          | [questionAnalysisService.ts](file:///c:/Users/Rajkumar/Vedic_Rajkumar/src/services/questionAnalysisService.ts) (`classifyQuestion` → `normalizeQuestion`) |
| `T2-f` transliteration idempotence                  | [hinglish.test.ts](file:///c:/Users/Rajkumar/Vedic_Rajkumar/src/tests/hinglish.test.ts)                                                                   |
| `T2-e` code-mixed question lands in the right house | `questionAnalysisService.ts` keyword tables (house 2 / 7 / 10 seeds)                                                                                      |

Everything else below is unbuilt and is the work list.

---

## 1. Purpose

Drive 5,000 machine-generated users through the app in three escalating tiers,
catch the failures that a human tester will not type twice, and turn every
failure into a reproducible test plus a fix. The population is imaginary, but it
is **seeded and re-runnable** — run 41 tomorrow produces the same 5,000 users as
run 41 today.

**Non-goals:** visual taste, prose quality grading, Swiss Ephemeris numeric
accuracy (already gated by `test:accuracy:corpus`), real payment rails.

---

## 2. System under test

| Surface                 | Endpoint / route                                         | Tier that touches it |
| ----------------------- | -------------------------------------------------------- | -------------------- |
| Question form (Prashna) | `/question`, `/question?lang=hi-Latn`                    | T1–T3                |
| Classifier              | `classifyQuestion()` → `normalizeQuestion()`             | T1–T3                |
| Transliterator          | `toRomanHindi()`, `deepTransliterate()`                  | T1–T3                |
| Answer engine           | `analyzeQuestion()`, `generateEnhancedClassicalAnswer()` | T1–T2                |
| Answer Layer API        | `GET /v1/answer`, `/v1/transits/:chartId`                | T2–T3                |
| Edge functions          | `answer-cards`, `health`, `metrics`                      | T2–T3                |
| Static shell / SW       | `/`, `/manifest.webmanifest`, service worker             | T1                   |

---

## 3. Determinism contract

No tier is allowed to be flaky-by-design. Before a run starts, the harness asserts:

1. `SEED` env var present (`ROBOT_SEED`, default `41`). All randomness flows
   through `mulberry32(SEED)` — no bare `Math.random()` in generators.
2. Clock frozen at `2026-11-01T09:15:00+05:30` via `page.clock.install()` and
   `vi.setSystemTime()`.
3. Network: Supabase, Clerk, GA4, Sentry all stubbed with `page.route()`. `POST`
   bodies captured to `artifacts/<run>/net/`.
4. `Math.random` shimmed inside the page for chart-layout stability.
5. Corpus files written to `artifacts/<run>/corpus/*.jsonl` and **committed as
   the run record** — a failure is replayed from the corpus file, never from
   prose.

A run that cannot satisfy §3 is invalid and does not count toward a gate.

---

## 4. Virtual population

5,000 users split by tier. Personas are weighted so the population resembles
real traffic, not a uniform grid.

| Tier            | Users | Concurrency | Personas (weight)                                                                                                         |
| --------------- | ----- | ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| T1 Basic        | 3,500 | 200         | `first-time-en` (.30) · `first-time-hi` (.25) · `first-time-hinglish` (.30) · `mobile-android` (.15)                      |
| T2 Intermediate | 1,200 | 60          | `returning-en` (.25) · `returning-hinglish` (.30) · `code-mixed` (.15) · `devanagari-typo` (.15) · `family-profile` (.15) |
| T3 Advanced     | 300   | 20          | `adversarial-text` (.35) · `offline-flap` (.20) · `slow-3g` (.20) · `api-prober` (.15) · `a11y-keyboard` (.10)            |

Persona definitions live in `tests/robots/personas.ts` as data, not code branches.

```ts
export interface Persona {
  id: string;
  lang: "en" | "hi" | "hi-Latn";
  device: "desktop" | "android" | "ios";
  viewport: { width: number; height: number };
  typing: { wpm: number; typoRate: number };
  network: "fast" | "slow-3g" | "flap";
  corpus: "en" | "hi" | "hinglish" | "mixed" | "adversarial";
}
```

**Corpus sizing:** T1 1 question/user · T2 4 questions/user · T3 10 questions/user
→ 3,500 + 4,800 + 3,000 = **11,300 question submissions** per full run.

---

## 5. Tier 1 — Basic (3,500 users)

**Question:** does the happy path work for every input script?

Per user, in order:

1. Load `/` → assert no console error, LCP budget from `budgets.json` respected.
2. Navigate to `/question`, pick language by persona.
3. Fill birth details from a fixed fixture, submit one corpus question.
4. Assert a verdict card renders with a score, an outcome label, and a chart tab.

**Oracles**

| #    | Invariant                                                                                                                                                                                                                   |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1-a | Zero `console.error`, zero unhandled rejection                                                                                                                                                                              |
| T1-b | Outcome label non-empty in the selected language                                                                                                                                                                            |
| T1-c | `hi-Latn` render contains **no** `[\u0900-\u097F]` characters                                                                                                                                                               |
| T1-d | Genuinely equivalent pairs produce the **same house** (classification parity). Pair on the same proposition, never on the same word: `"Will I get a job?"` / `"kya mujhe naukri milegi"` — different scripts, identical ask |
| T1-e | Score is an integer in `[-9, 9]`                                                                                                                                                                                            |
| T1-f | Every `hi` string in the app's own fixtures transliterates with **no Devanagari left** and **no word longer than its source**. A miss is a B-LEAK, not a cosmetic                                                           |

**Exit gate:** ≥ 99.0 % pass, zero S1, T1-c and T1-d at 100 %.

---

## 6. Tier 2 — Intermediate (1,200 users)

**Question:** does it survive realistic mess — code-mixing, typos, saved profiles,
the API contract?

1. Seed a family profile, reload, prefill from it.
2. Submit 4 questions: native, code-mixed, one Devanagari typo variant, one
   Hinglish with English loanwords.
3. Hit `GET /v1/answer` and `/v1/transits/:chartId?asOf=<bad>`; assert contract
   codes (200 / 422 / 401 / 404).
4. Toggle language mid-session twice; assert the manual pick stops auto-detect.
5. Copy-to-clipboard share text; assert it contains no PII fields (dob, tob, place).

**Oracles**

| #    | Invariant                                                                                         |
| ---- | ------------------------------------------------------------------------------------------------- |
| T2-a | Prefill round-trips all 6 birth fields exactly                                                    |
| T2-b | `asOf=2026-13-40` → 422, not 500                                                                  |
| T2-c | Unauthenticated `/v1/answer` → redacted shape, no `dob`/`tob`/`place` keys                        |
| T2-d | After manual language pick, typing Hinglish does not flip the language                            |
| T2-e | Code-mixed `"meri naukri kab theek hogi bhai"` classifies to house 10, not 1                      |
| T2-f | Transliteration is stable: `toRomanHindi(toRomanHindi(x)) === toRomanHindi(x)`                    |
| T2-g | Particle invariance: appending `"kya hoga bhai"` to an English question must not change its house |

**Exit gate:** ≥ 97.0 % pass, zero S1/S2, T2-c 100 %, T2-e ≥ 95 %.

---

## 7. Tier 3 — Advanced (300 users)

**Question:** where does it break under stress, hostility and decay?

1. **Adversarial text** — 500-char Hinglish, emoji storms, RTL marks, ZWJ, `"।"`,
   lone surrogates, `kya hoga` × 40, SQL-ish `' OR 1=1`, `<script>`.
2. **Offline flap** — `page.route` abort 30 % of requests mid-run, toggle
   offline/online 3×, assert service worker recovers and no chart is lost or
   duplicated.
3. **Slow 3G** — 400 kbps / 400 ms RTT; assert skeleton states render, no layout
   shift over CLS budget.
4. **API prober** — malformed JSON, oversized body, missing fields, 60 req/min
   burst for rate-limiter behaviour.
5. **A11y keyboard** — tab-only traversal to submit, focus trap in the modal,
   `aria-live` announced on result.

**Oracles**

| #    | Invariant                                                                          |
| ---- | ---------------------------------------------------------------------------------- |
| T3-a | No uncaught exception on any adversarial string; classifier always returns a house |
| T3-b | Reconnect restores state; reading history count matches submissions                |
| T3-c | Rate limiter returns 429 with `Retry-After`, never 500                             |
| T3-d | Keyboard-only user reaches the submit button in ≤ 18 tabs                          |
| T3-e | CLS ≤ 0.1, INP ≤ 200 ms on slow-3G profile                                         |
| T3-f | Soak: 60 min at 20 concurrent — heap growth < 15 %, zero OOM                       |

**Exit gate:** zero S1/S2, T3-a/T3-c/T3-f at 100 %.

---

## 8. Harness layout

```
tests/robots/
  personas.ts          persona matrix
  rng.ts               mulberry32 seeded RNG
  corpus/
    generate.ts        seeded corpus writer (jsonl)
    adversarial.ts     T3 string fuzzer
  oracles/
    hinglish.ts        T1-c, T1-d, T1-f, T2-f, T2-g
    contract.ts        T2-b, T2-c, T3-c
    a11y.ts            T3-d
  t1-basic.spec.ts
  t2-intermediate.spec.ts
  t3-advanced.spec.ts
  soak.spec.ts
load/
  k6-static.js         CDN shell ramp
  k6-answer.js         /v1/answer ramp
artifacts/<run>/       corpus, net captures, traces, report
```

### Seeded RNG

```ts
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

### Corpus generator

```ts
import { mulberry32 } from "../rng";
import { PERSONAS } from "../personas";

export function generateCorpus(seed: number, outDir: string): void {
  const rnd = mulberry32(seed);
  const pick = <T>(xs: readonly T[]): T => xs[Math.floor(rnd() * xs.length)];
  const lines: string[] = [];
  for (let i = 0; i < 11_300; i++) {
    const persona = pick(PERSONAS);
    lines.push(
      JSON.stringify({
        i,
        persona: persona.id,
        q: pick(QUESTION_BANK[persona.corpus]),
      }),
    );
  }
  writeFileSync(join(outDir, "corpus.jsonl"), lines.join("\n"));
}
```

### k6 ramp (answer layer)

```js
import http from "k6/http";
import { check } from "k6";

export const options = {
  scenarios: {
    answer: {
      executor: "ramping-vus",
      startVUs: 5,
      stages: [
        { duration: "2m", target: 20 },
        { duration: "10m", target: 20 },
        { duration: "2m", target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<800", "p(99)<1500"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const res = http.get(`${__ENV.BASE}/v1/answer?chartId=demo`);
  check(res, { "status 200/401": (r) => r.status === 200 || r.status === 401 });
}
```

### Oracle — classification parity

```ts
import { classifyQuestion } from "@/services/questionAnalysisService";

const PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["Will I get the job?", "kya meri naukri lagegi"],
  ["When will my marriage happen?", "meri shaadi kab hogi"],
  ["Will I clear the exam?", "kya main exam pass karunga"],
  [
    "Is this a good time to buy a house?",
    "kya ghar kharidne ka sahi samay hai",
  ],
];

test("Hinglish and English land in the same house", () => {
  for (const [en, hi] of PAIRS) {
    expect(classifyQuestion(hi).house, hi).toBe(classifyQuestion(en).house);
  }
});
```

---

## 9. Pass/fail gates

| Gate                      | T1       | T2       | T3        | Blocking |
| ------------------------- | -------- | -------- | --------- | -------- |
| Overall pass rate         | ≥ 99.0 % | ≥ 97.0 % | ≥ 95.0 %  | yes      |
| S1 defects                | 0        | 0        | 0         | yes      |
| S2 defects                | ≤ 3      | 0        | 0         | yes      |
| `hi-Latn` Devanagari leak | 0        | 0        | 0         | yes      |
| Classification parity     | 100 %    | 100 %    | 100 %     | yes      |
| p95 answer latency        | —        | < 800 ms | < 1500 ms | yes      |
| Soak heap growth          | —        | —        | < 15 %    | yes      |

A gate is green only when the run is valid (§3) **and** the corpus file is committed.

---

## 10. Bug taxonomy

| ID           | Class             | Example from this patch                                       |
| ------------ | ----------------- | ------------------------------------------------------------- |
| B-CLASS      | Misclassification | `"naukri"` scores house 1 — `TOKENS` missing the key          |
| B-LEAK       | Script leak       | Devanagari in `hi-Latn` output — a `hi` branch bypassed `L()` |
| B-CONTRACT   | API contract      | `asOf` bad value returns 500                                  |
| B-STATE      | State machine     | Auto-detect overrides a manual language pick                  |
| B-PII        | Confidentiality   | `dob` present in unauthenticated `/v1/answer`                 |
| B-RESILIENCE | Recovery          | Offline flap loses the reading history entry                  |
| B-A11Y       | Accessibility     | Modal not focus-trapped                                       |
| B-PERF       | Budget            | LCP over `budgets.json` on slow-3G                            |

---

## 11. Severity and SLA

| Sev | Definition                                                                  | Ack  | Fix         | Gate effect |
| --- | --------------------------------------------------------------------------- | ---- | ----------- | ----------- |
| S1  | Data leak, blank page, wrong house for > 10 % of a persona                  | 4 h  | 24 h        | hard block  |
| S2  | Wrong house for a single common question, script leak, 500 on a valid input | 12 h | 72 h        | hard block  |
| S3  | Cosmetic transliteration, missing particle, wrong label casing              | 3 d  | next sprint | soft        |
| S4  | Nits, copy tone                                                             | —    | backlog     | none        |

---

## 12. Repro contract

Every filed bug carries: `ROBOT_SEED`, corpus line number, persona id, the exact
question string, viewport, language, expected vs actual house/label, and a
Playwright trace path. A bug without a seed and a corpus line is not triaged — it
is closed as unreproducible after 48 h.

Template:

```md
### [S2][B-CLASS] "naukri" classifies to house 1

- seed: 41 · corpus line: 887 · persona: first-time-hinglish
- input: `kya meri naukri lagegi`
- expected: house 10 (career) · actual: house 1
- trace: artifacts/41/traces/887.zip
- suspect: TOKENS missing `naukri` → `job`
```

---

## 13. Fix workflow

1. Branch `fix/robot-<bugid>`.
2. Add the **failing** test first — corpus line becomes a permanent case in
   `tests/robots/oracles/`.
3. Red. Commit `test:` before touching source.
4. Minimal fix. No unrelated refactors in the same commit.
5. Green locally: `npx vitest run` + `npx playwright test -c playwright.robustness.config.ts --grep <bugid>`.
6. Add a guard so the class cannot return: extend the oracle table, not just the one case.
7. Full gate re-run at the same seed. Ship only if the seed-41 corpus goes green
   with the new test in place.
8. Close with the trace and the guard test linked.

**Class-specific guards**

| Class            | Permanent guard                                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| B-CLASS          | Add pair to `PAIRS` in `oracles/hinglish.ts`                                                                               |
| B-CLASS (RB-001) | `normalizeQuestion` drops particles **unconditionally**, so `kab`/`kaise` can no longer outscore keywords; covered by T2-g |
| B-LEAK           | Run `toRomanHindi` over every `hi` string in the fixture set, assert no Devanagari survives                                |
| B-CONTRACT       | Add the malformed input to `oracles/contract.ts`                                                                           |
| B-STATE          | Assert `langLocked` after manual pick in T2-d                                                                              |
| B-PII            | `assertNoPii()` over the redacted shape                                                                                    |
| B-RESILIENCE     | Offline-flap replay with history count assertion                                                                           |
| B-A11Y           | Tab-count ceiling in `oracles/a11y.ts`                                                                                     |

---

## 14. Known-bug register (open at plan start)

| ID     | Sev | Class        | Status                                                                                     |
| ------ | --- | ------------ | ------------------------------------------------------------------------------------------ |
| RB-001 | S2  | B-CLASS      | Closed 2026-11-01 — moved to the §13 guard table; the particle filter is now unconditional |
| RB-002 | S3  | B-LEAK       | Open — `pranakshara` letter is a Latin char under `hi-Latn`, nakshatra unresolved          |
| RB-003 | S2  | B-PII        | Open — verify `answer-cards` 404s for non-owner under T2-c                                 |
| RB-004 | S3  | B-CLASS      | Open — English loanwords inside Hindi prose are transliterated lossily                     |
| RB-005 | S2  | B-RESILIENCE | Open — SW cache version vs deploy, regression of PR #2                                     |

---

## 15. CI wiring

```yaml
name: robotic
on: [pull_request, schedule]
jobs:
  t1:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    env: { ROBOT_SEED: 41, TIER: t1 }
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install chromium
      - run: node tests/robots/corpus/generate.ts --seed $ROBOT_SEED
      - run: npx playwright test -c playwright.robustness.config.ts t1-basic
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: artifacts-t1, path: artifacts/ }
  t3-nightly:
    if: github.event_name == 'schedule'
    runs-on: ubuntu-latest
    env: { ROBOT_SEED: 41, TIER: t3 }
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install chromium
      - run: node tests/robots/corpus/generate.ts --seed $ROBOT_SEED
      - run: npx playwright test -c playwright.robustness.config.ts t3-advanced soak
      - run: k6 run -e BASE=${{ secrets.PREVIEW_URL }} load/k6-answer.js
```

T1 blocks merge. T2 blocks release. T3 runs nightly and blocks the release tag.

---

## 16. Reporting

`artifacts/<run>/report.json`:

```json
{
  "seed": 41,
  "tier": "t3",
  "users": 300,
  "submissions": 3000,
  "passRate": 0.961,
  "defects": [
    { "id": "RB-006", "sev": "S2", "class": "B-LEAK", "corpusLine": 2214 }
  ],
  "gate": "red"
}
```

`npm run robot:report` renders `report.json` into `reports/robot-<run>.md`.
Reports are attached to the release PR; the gate verdict line is the first line,
not the last.

> `npm run robot:report` is **not wired** in this repo yet. Add it together with
> the harness, not before.

---

## 17. Exit criteria and rollback

Release is cleared when all three gates are green at the recorded seed, the
known-bug register has zero S1/S2, and the run corpus is committed.

Rollback: the Roman-Hindi feature is additive — reverting drops
[hinglish.ts](file:///c:/Users/Rajkumar/Vedic_Rajkumar/src/lib/hinglish.ts), the
`hi-Latn` union member, and the `QuestionPage` hunks. If T1-c (script leak) or
T2-c (PII) goes red post-deploy, revert and re-open as S1; do not hot-patch in
place.

---

## Appendix A — seed registry

| Seed  | Use                    |
| ----- | ---------------------- |
| 41    | canonical PR gate      |
| 42    | nightly variance sweep |
| 43–50 | pre-release rotation   |

## Appendix B — invariants summary

`T1-c` no Devanagari in `hi-Latn` · `T1-d` classification parity · `T2-f`
transliteration idempotence · `T2-c` no PII unauthenticated · `T3-a` classifier
never throws · `T3-c` 429 not 500 · `T3-f` soak heap < 15 %. These seven are the
ones that, if they ever go red, mean the Roman Hindi feature is not shippable
regardless of pass rate.
