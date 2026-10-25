I'll look at the actual repo structure before writing a patch, since the fix depends on what files already exist.

Let me look at the files that matter for this — the agent instructions file and the output/seed-bank layout.

## Diagnosis: why the AI "beats about the bush"

I read the repo. Three mechanical facts cause the behaviour you're describing:

1. **The app's finished output is a PDF.** The only committed result is `output/2026-09-01/Priyansh_Singh_Chauhan/PRIYANSH_JOINING_MUHURAT_GANESH_REPORT.pdf`. A PDF is a binary blob to an LLM — it cannot read the verdict, so it falls back to _reasoning the chart itself_.
2. **What _is_ machine-readable is the input, not the output.** `src/data/jataks/JATAKS_DATABASE.json` (the "seed bank", 20 jataks) plus ~130 files in `src/services/` are all readable. So the agent reads birth data + engine code and re-derives — never the app's own conclusion. Two different answers, neither traceable to the other.
3. **No agent contract.** `AGENTS.md` tells a coding agent about stack, linting, branches — it never says _"the verdict already exists, read it first, do not recompute."_ So the agent does what an engineer does: reads source and analyses in detail.

There is no file anywhere that says `health: good, house: delay until X, career: rising` in plain language. That's the gap.

Also: **"Premlata Jain" is not in the seed bank.** The 20 jataks run `jatak_001`–`jatak_020`; she isn't there. The agent has to hunt, then guess. That widens the bush.

The repo already contains the _right pattern_ — `scripts/publish-accuracy.mjs` derives `src/generated/summary.json`, and `/accuracy` renders it **verbatim**, with `netlify.toml` publishing before build. The patch below is that exact pattern, applied to answers instead of accuracy numbers.

---

## The patch: an "Answer Layer"

One deterministic artifact, written once, consumed twice — by the UI and by any AI — so the app's reply and the AI's reply are the same object with zero drift.

### Files to add

| File                                           | Purpose                                        |
| ---------------------------------------------- | ---------------------------------------------- |
| `src/services/answerCard/AnswerCard.types.ts`  | Strict-TS schema for the card                  |
| `src/services/answerCard/answerCardBuilder.ts` | Calls your existing services, builds the card  |
| `src/services/answerCard/answerCardRender.ts`  | EN/HI one-liners + bullets, from the card only |
| `scripts/emitAnswerCards.mjs`                  | CLI: writes `answers/**` from the seed bank    |
| `answers/index.json`                           | Router manifest an agent reads first           |
| `answers/<person>/<topic>.json` + `.md`        | The card + its plain-text form                 |
| `llms.txt`                                     | Root-level agent entry point                   |
| `public/.well-known/vedic-rajkumar.json`       | Machine manifest: endpoints, card paths, rules |
| `AGENTS.md` (patch)                            | READ-FIRST contract                            |
| `src/tests/answerCard/parity.test.ts`          | Fails CI if UI text ≠ card text                |

### 1. The contract — `AnswerCard.types.ts`

The single most important design decision: **`direct_answer` is the first field.** Verdict first, evidence after.

```ts
// src/services/answerCard/AnswerCard.types.ts
export type Topic =
  "health" | "house_construction" | "career" | "marriage" | "finance";

export type Band = "excellent" | "good" | "average" | "caution" | "avoid";

export interface AnswerVerdict {
  topic: Topic;
  /** The answer the consumer actually wants. One or two sentences. No preamble. */
  headline_en: string;
  headline_hi: string;
  score_0_100: number;
  band: Band;
  /** 0–1. Honest, derived from rule strength + dasha/transit agreement. */
  confidence_0_1: number;
  /** Actionable timing, not a vague "someday". Null when the topic is non-timed. */
  window: {
    from: string;
    to: string;
    label_en: string;
    label_hi: string;
  } | null;
  /** HOW the app arrived here — for the curious consumer, collapsed by default. */
  evidence: Array<{
    rule: string;
    source: string;
    contribution: number;
    note_en: string;
    note_hi: string;
  }>;
  remedies: Array<{ en: string; hi: string }>;
  caveats: Array<{ en: string; hi: string }>;
}

export interface AnswerCard {
  card_version: "1.0";
  subject: {
    name: string;
    jatak_id: string | null;
    dob: string;
    tob: string;
    place: string;
    lat: number;
    lon: number;
    tz: string;
  };
  query: { asked: string; topics: Topic[]; language: "hi" | "en" };
  /** READ THIS FIRST. Reply from this and nothing else. */
  direct_answer: { hi: string; en: string };
  verdicts: AnswerVerdict[];
  provenance: {
    engine_version: string;
    ayanamsa: string; // "Lahiri (Chitrapaksha)"
    house_system: string;
    dasha_system: string; // "Vimshottari"
    computed_at: string; // ISO 8601
    input_hash: string; // sha256 of the birth record
    card_hash: string; // sha256 of the card minus this field
    source_files: string[]; // services that produced it
  };
}
```

`provenance` answers _"how did the app arrive at this"_ without forcing it into the reply. `confidence_0_1` is what stops the agent from hedging into vagueness — it can report certainty directly.

### 2. The builder — reuse what you already have

You have `conclusiveJatakJudgmentService.ts`, `careerAstrologyService.ts`, `medicalAstrologyService.ts`, `vaastuService.ts` / `vaastuDoshaService.ts`, `dashaService.ts`, `transitEngine.ts`, `ashtakavargaService.ts`, `houseSystemService.ts`. The builder is glue, not new astrology.

```ts
// src/services/answerCard/answerCardBuilder.ts
import type { AnswerCard, AnswerVerdict, Topic } from "./AnswerCard.types";
// ...import your existing services

const TOPIC_SERVICE: Record<
  Topic,
  (chart: NatalChart, at: Date) => RawVerdict
> = {
  health: buildHealthVerdict, // medicalAstrologyService + 6th/8th house + dasha
  house_construction: buildHouseVerdict, // vaastuService + 4th house + Mars/Saturn transit + muhurat
  career: buildCareerVerdict, // careerAstrologyService + 10th house + dasha lord
  marriage: buildMarriageVerdict, // marriageProspectService + 7th house + navamsa
  finance: buildFinanceVerdict, // financialAstrologyService + 2nd/11th house
};

export function buildAnswerCard(
  jatak: JatakRecord,
  asked: string,
  topics: Topic[],
  language: "hi" | "en",
): AnswerCard {
  const chart = buildNatalChart(jatak); // existing typed facade
  const verdicts = topics.map((t) => TOPIC_SERVICE[t](chart, new Date()));

  const card: Omit<AnswerCard, "provenance"> = {
    card_version: "1.0",
    subject: toSubject(jatak),
    query: { asked, topics, language },
    direct_answer: composeDirectAnswer(verdicts, language), // 1–2 sentences, verdict first
    verdicts,
  };

  return { ...card, provenance: provenanceOf(card, jatak) };
}
```

`composeDirectAnswer` is where "no beating about the bush" is enforced in code — a template, not an LLM call:

```ts
function composeDirectAnswer(
  v: AnswerVerdict[],
  lang: "hi" | "en",
): { hi: string; en: string } {
  const line = (x: AnswerVerdict, l: "hi" | "en") =>
    `${l === "hi" ? x.headline_hi : x.headline_en} (${x.band}, ${Math.round(x.confidence_0_1 * 100)}%` +
    `${x.window ? `, ${l === "hi" ? x.window.label_hi : x.window.label_en}` : ""})`;
  return {
    en: v.map((x) => line(x, "en")).join(" · "),
    hi: v.map((x) => line(x, "hi")).join(" · "),
  };
}
```

### 3. The publish script — `scripts/emitAnswerCards.mjs`

Mirrors `publish-accuracy.mjs`. Add to `netlify.toml`'s pre-build, and to `package.json`:

```jsonc
"answers:emit":  "node scripts/emitAnswerCards.mjs",
"answers:check": "node scripts/emitAnswerCards.mjs --check",   // CI: fail if answers/ is stale
"ship": "npm run accuracy:publish && npm run answers:emit && npm run build"
```

It writes, per jatak:

```
answers/index.json
answers/premlata-jain/health.json          + .md
answers/premlata-jain/house_construction.json + .md
answers/premlata-jain/career.json          + .md
answers/premlata-jain/_all.json            (the composite card for one-prompt asks)
answers/premlata-jain/_all.md              (the EN+HI direct reply, ~12 lines)
```

`--check` in CI is what kills drift: if `src/services/*` changes the verdict but nobody re-ran the emit, the build fails.

### 4. The `.md` is the payload that actually fixes your problem

Because agents read markdown cheaply and PDFs not at all. Generated by `answerCardRender.ts`, nothing else:

```markdown
# Premlata Jain — Direct Answer

<!-- card_hash: 8f3c… ; generated: 2026-10-24T09:12Z -->

**Hindi (reply in this if the asker wrote in Hindi):**
स्वास्थ्य सामान्यतः अनुकूल है (good, 72%), अगले 6 माह में विशेष सावधानी मार्च–अप्रैल में।
नए घर का निर्माण अनुकूल है (good, 68%), शुभ प्रारंभ अप्रैल 2027 से पहले नहीं।
करियर में प्रगति का समय है (excellent, 81%), जनवरी–मार्च 2027 में पदोन्नति की संभावना।

**English:** …same three lines…

## Verdict detail

| Topic              | Band      | Score | Confidence | Window                  |
| ------------------ | --------- | ----- | ---------- | ----------------------- |
| health             | good      | 72    | 0.72       | 2026-11-01 → 2027-04-30 |
| house_construction | good      | 68    | 0.68       | from 2027-04-01         |
| career             | excellent | 81    | 0.81       | 2027-01-15 → 2027-03-31 |

## Evidence (how the app arrived here)

- career: 10th-house lord Jupiter in own sign, Mahadasha agreement — weight 0.4 — `careerAstrologyService`
- career: Saturn transit avoiding 10th, Ashtakavarga bindus 4/12 — weight 0.25 — `transitEngine`, `ashtakavargaService`
  …

## Provenance

Lahiri ayanamsa · Vimshottari · Whole-sign houses · engine v0.1.0 · input_hash 4b1e… · 2026-10-24T09:12Z
```

### 5. The agent contract — `AGENTS.md` patch (drop-in)

Insert directly under the `# Vedic_Rajkumar Agent Rules` heading, **above `## Stack`**:

```markdown
## READ FIRST — answers already exist, do not recompute

This app computes verdicts deterministically. If you are an AI asked a
prospect/forecast question about a person, **do not re-derive the astrology**.

1. Open `answers/index.json`. Find the person by name (fuzzy match on `subject.name`
   and `subject.aliases`). If absent, read `src/data/jataks/JATAKS_DATABASE.json`;
   if the person is missing there, add them, then run `npm run answers:emit`.
2. Open `answers/<slug>/_all.md` (multi-topic ask) or `answers/<slug>/<topic>.md`.
3. **Reply from `direct_answer` in the first two lines.** Verdict, band, confidence,
   window. Nothing else before it.
4. Reply in the language of the prompt: use the `hi` field for Hindi asks, `en`
   otherwise. Never mix.
5. Only then, if the user wants it, add evidence/provenance from the same card.
6. Cite `provenance.card_hash` so the answer is traceable. If `card_hash` differs
   from `answers/index.json`, re-run `npm run answers:emit` and say so.

Forbidden in a first reply: restating the chart, explaining your method, listing
houses/planets before the verdict, or producing a number the card does not contain.

Machine entry points: `llms.txt` · `public/.well-known/vedic-rajkumar.json` ·
`GET /answer?person=<name>&topics=health,house,career&lang=hi`.
```

Also amend the existing `## AI / RAG Features` line — it currently says _"All AI prompts must include relevant birth chart context"_, which is precisely the bug. Change to:

```markdown
- All AI prompts must include the **answer card** (not the raw chart) as primary context.
```

### 6. `llms.txt` (root) — the "app tells the AI it's being used by an AI"

```markdown
# Vedic Rajkumar

> Deterministic Vedic (Jyotish) engine. Verdicts are precomputed — read them, don't recompute.

## Direct answers

- [Answer index](answers/index.json): person → topics → card path
- [Example answer card](answers/premlata-jain/_all.md): the exact shape to relay

## Contract

- Read `answers/index.json` first. Reply from `direct_answer` only.
- Language: use `hi` for Hindi prompts, `en` otherwise.
- Provenance: quote `provenance.card_hash`.

## Optional

- [Seed bank](src/data/jataks/JATAKS_DATABASE.json): birth data
- [Agent rules](AGENTS.md): engineering context
```

### 7. Machine manifest — `public/.well-known/vedic-rajkumar.json`

```json
{
  "name": "Vedic Rajkumar",
  "kind": "deterministic-answer-service",
  "instructions": "Read answer cards; reply from direct_answer; do not recompute.",
  "endpoints": {
    "answer_index": "/answers/index.json",
    "answer_card": "/answers/{slug}/{topic}.json",
    "answer_text": "/answers/{slug}/{topic}.md",
    "query": "/answer?person={name}&topics={csv}&lang={hi|en}"
  },
  "languages": ["hi", "en"],
  "card_version": "1.0"
}
```

### 8. Agent-aware response in the UI

Two triggers, no guessing:

- **Query string / header:** `?agent=1`, `?format=markdown`, or `Accept: text/markdown` → the route serves the `.md` card as `text/plain` instead of the React shell. An AI hitting the URL with a scraper gets the direct answer, not a `<div>` soup.
- **In-app AI mode badge:** when `?agent=1` is present, render a small banner: _"AI mode — the direct answer is below; copy it verbatim."_ with a **Copy answer for AI** button on every report page that copies `answers/<slug>/<topic>.md`.

Add the button next to the existing Print/PDF action in `ReportShell.tsx`:

```tsx
<Button
  variant="outline"
  onClick={() => navigator.clipboard.writeText(cardMarkdown)}
>
  Copy answer for AI
</Button>
```

### 9. Anti-drift parity test

```ts
// src/tests/answerCard/parity.test.ts
it("UI text is rendered from the card, never composed separately", () => {
  const card = buildAnswerCard(
    JATAK_PREMLATA,
    "prospects",
    ["health", "house_construction", "career"],
    "hi",
  );
  expect(renderAnswerMarkdown(card)).toContain(card.direct_answer.hi);
  expect(renderAnswerMarkdown(card)).toBe(
    readFileSync(`answers/${card.subject.slug}/_all.md`, "utf8").trim(),
  );
});

it("card hash is stable for identical inputs", () => {
  expect(buildAnswerCard(A, "q", ["career"], "en").provenance.card_hash).toBe(
    buildAnswerCard(A, "q", ["career"], "en").provenance.card_hash,
  );
});
```

### 10. One-time seed-bank addition

`Premlata Jain` isn't in `src/data/jataks/JATAKS_DATABASE.json`. Append as `jatak_021` with `relationship`, `notes`, and coordinates in the same shape as the existing entries, then `npm run answers:emit`. Without this the agent has no birth data at all and _must_ guess.

---

## Verification

```bash
npm run typecheck
npm run answers:emit
npm run answers:check          # must pass on a clean tree
npm run test:run -- answerCard
npm run build
```

Then the acceptance test — the exact prompt that failed:

> _"In hindi answer from app: https://github.com/…/Vedic_Rajkumar — forecast health, house construction and career for Premlata Jain."_

A correct result is: **three Hindi lines, verdict first, each with band + confidence + window, then provenance hash** — and no chart walkthrough. If the agent still analyses in detail, `AGENTS.md` wasn't picked up; if the numbers differ from the app, `answers:check` is being skipped.

## Order to apply

1. `AnswerCard.types.ts` → `answerCardBuilder.ts` → `answerCardRender.ts`
2. `emitAnswerCards.mjs`, `answers/`, `package.json`, `netlify.toml`
3. `AGENTS.md` READ-FIRST block + `llms.txt` + `.well-known` manifest
4. `/answer` endpoint (wire into your existing `src/api/v1` OpenAPI rather than a new surface)
5. UI button + `?agent=1` serving, then the parity test last so it locks the behaviour in

I'll ground the guide in the actual code rather than guessing at signatures. Fetching the key files.

I fetched the internals. The patch is far thinner than my first pass suggested, because **the verdict engine already exists** — `buildConclusiveJatakJudgment()` returns exactly the shape you want. Here is the full implementation guide.

---

# Answer Layer — Detailed Implementation Guide

## 0. What the first pass got wrong, corrected

| Claim in v1             | Reality in the repo                                                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| "Add a verdict engine"  | `src/services/conclusiveJatakJudgmentService.ts` **already returns** `verdictType`, `score` 0–100, `headline`, `therefore`, `evidence[]` |
| "Add band thresholds"   | Already there: `verdictFromScore()` — ≥75 DELIVERING, ≥56 CONDITIONAL, ≥40 DELAYED, else BLOCKED                                         |
| "Add confidence"        | Not present — this is genuinely new work (§4)                                                                                            |
| `answers/` at repo root | Must be `public/answers/` or Vite never copies it to `dist/`                                                                             |
| No CI hook needed       | `netlify.toml` already runs `accuracy:publish` pre-build; answers must join it                                                           |

The real gap is **packaging + contract**, not astrology. Roughly 400 lines of glue over an engine that already computes the answer.

### The engine you are wrapping (verified signature)

```ts
// src/services/conclusiveJatakJudgmentService.ts — EXISTS, DO NOT REWRITE
export function buildConclusiveJatakJudgment(
  chart: ChartData,
  forecast: DashaForecastResult,
  referenceType: ReferenceType, // 'natal' | 'prashna'
): ConclusiveJatakJudgment | null;

interface ConclusiveJatakJudgment {
  referenceType: ReferenceType;
  headline: string; // "DELIVERING: career is the leading field at 78/100"
  verdictType: "DELIVERING" | "CONDITIONAL" | "DELAYED" | "BLOCKED";
  score: number; // 0–100, already weighted
  rajyogaVerdict: string;
  houseVerdict: string;
  dashaVerdict: string;
  transitVerdict: string;
  conflictResolution: string[];
  therefore: string; // the "how it arrived" paragraph
  evidence: Array<{ layer: string; score: number; finding: string }>;
}
```

Layer weights are fixed in-code: Rajyoga 0.24, house promise 0.26, Dasha 0.36, transit 0.14. Domain houses: `career [10,1,6]`, `wealth [2,11,9]`, `marriage [7,2,5]`, `health [1,6,8]`, `spirituality [9,12,5]`.

And the forecast input it needs:

```ts
// src/services/dashaForecastService.ts — EXISTS
export function runDashaForecast(input: DashaForecastInput): DashaForecastResult;
export function runCurrentDashaForecast(input: {...}): DashaForecastResult;
```

`DashaLifeAreaForecast` carries `{ area, verdict, probability, keyIndicators, timing }` — **`timing` is your card's `window`**, already computed.

---

## 1. Design principles (non-negotiable)

1. **Verdict before method.** `direct_answer` is field #1 of the card. The consumer reads two sentences and is done.
2. **One object, two consumers.** The UI and the AI read the _same_ card. No second composition path.
3. **No LLM in the pipeline.** The card is deterministic. `npm run answers:check` can byte-compare it.
4. **Provenance always.** `card_hash` + `input_hash` make the app's answer distinguishable from an AI's guess.
5. **Language split in the artifact.** `answer.hi` / `answer.en` both exist; the agent picks by prompt language. The repo's i18n (`src/services/multiLanguageService.ts`) supplies the strings.
6. **Honest confidence.** Never above 0.90. Degrades when Ashtakavarga is missing or transit is uncertifiable — both of which the engine already flags in its own verdict text.

---

## 2. Topic → engine mapping

Your exact query maps like this. Note the one gap.

| User's topic           | Engine area | Houses   | Status                                |
| ---------------------- | ----------- | -------- | ------------------------------------- |
| health & wellbeing     | `health`    | 1, 6, 8  | works as-is                           |
| career status          | `career`    | 10, 1, 6 | works as-is                           |
| new house construction | `property`  | 4, 2, 11 | **gap — not in the `LifeArea` union** |

`LifeArea = DashaLifeAreaForecast['area']` is a closed union: `'career' | 'wealth' | 'marriage' | 'health' | 'spirituality'`. Two options:

**Option A (zero engine changes — recommended).** Map `house_construction` → `wealth`, then add a local house overlay. Classically the 2nd house governs immovable assets and the 4th the dwelling; `wealth` already pulls `[2,11,9]`, so you add house 4 and a Vaastu check on top:

```ts
// src/services/answerCard/topicMap.ts
export const TOPIC_TO_AREA: Record<Topic, LifeArea> = {
  health: "health",
  career: "career",
  marriage: "marriage",
  finance: "wealth",
  house_construction: "wealth", // 2nd = immovable assets
};

/** Extra houses scored beyond what the engine already covers. */
export const TOPIC_EXTRA_HOUSES: Partial<Record<Topic, number[]>> = {
  house_construction: [4], // 4th = dwelling, griha
};
```

**Option B (cleaner long-term).** Widen the union in `dashaForecastService.ts` to include `'property'`, add `property: [4, 2, 11]` to `DOMAIN_HOUSES` in `conclusiveJatakJudgmentService.ts`, and add a `buildPropertyForecast` branch in `buildLifeAreaForecasts`. More correct, touches two engine files, needs forecast unit tests.

Start with A, graduate to B.

---

## 3. Phase 1 — Types (`src/services/answerCard/AnswerCard.types.ts`)

Strict TS, no `any` (repo rule).

```ts
export type Topic =
  "health" | "house_construction" | "career" | "marriage" | "finance";
export type Lang = "hi" | "en";

/** Mapped 1:1 from the engine's VerdictType so no meaning is invented. */
export type Band = "excellent" | "good" | "average" | "caution" | "avoid";

export const BAND_FROM_VERDICT = {
  DELIVERING: "good",
  CONDITIONAL: "average",
  DELAYED: "caution",
  BLOCKED: "avoid",
} as const;

export interface EvidenceLine {
  layer: string; // from engine: 'Rajyoga gate' | 'House promise' | ...
  score: number;
  finding: string; // engine's own sentence — never paraphrased
}

export interface Verdict {
  topic: Topic;
  /** One sentence, verdict first. The thing the consumer actually wants. */
  headline: { en: string; hi: string };
  score_0_100: number;
  band: Band;
  engine_verdict: "DELIVERING" | "CONDITIONAL" | "DELAYED" | "BLOCKED";
  confidence_0_1: number;
  window: {
    from: string;
    to: string;
    label: { en: string; hi: string };
    approximate: boolean;
  } | null;
  /** Engine's own "therefore" — the how-it-arrived narrative. */
  rationale: { en: string; hi: string };
  conflicts: string[];
  evidence: EvidenceLine[];
  remedies: Array<{ en: string; hi: string }>;
  caveats: Array<{ en: string; hi: string }>;
}

export interface AnswerCard {
  card_version: "1.0";
  subject: {
    name: string;
    slug: string;
    aliases: string[];
    jatak_id: string | null;
    dob: string; // ISO 8601
    tob: string; // HH:MM 24h
    place: string;
    lat: number;
    lon: number;
    tz: string;
    tz_defaulted: boolean; // true if seed bank had no tz and we assumed Asia/Kolkata
  };
  query: {
    asked: string;
    topics: Topic[];
    language: Lang;
    as_of: string;
    reference_type: "natal" | "prashna";
  };
  /** FIELD #1. Reply from this and nothing else. */
  direct_answer: { hi: string; en: string };
  verdicts: Verdict[];
  provenance: {
    engine_version: string;
    ayanamsa: string;
    house_system: string;
    dasha_system: string;
    ephemeris: "local" | "swisseph";
    computed_at: string;
    as_of: string;
    input_hash: string;
    card_hash: string;
    source_files: string[];
  };
}
```

**Why `aliases`:** the seed bank has entries literally named `"Mummy"`. Without aliases, an agent searching `"Premlata Jain"` misses `"Mummy"`. Also lets `Premlata Jain` be found as `"Premlata"`, `"Premlataji"`, `"मां"`.

---

## 4. Phase 2 — Builder (`answerCardBuilder.ts`)

### 4a. Resolving a person

The seed bank stores coordinates as strings (`"23.84°N"`) and has no `timezone` on most entries. `scripts/seedJataks.ts` already contains a working `parseCoordinateString` — hoist it into `src/lib/` so both share it.

```ts
// src/lib/jataks/parseCoordinate.ts  (hoisted from scripts/seedJataks.ts)
export function parseCoordinateString(value: unknown): number | null {
  /* existing body */
}

export function resolveJatak(name: string): JatakRecord | null {
  const q = normalizeName(name); // lowercase, strip diacritics/punct
  return (
    JATAKS_DATABASE.jataks.find((j) =>
      [j.name, ...(j.aliases ?? [])].some((n) => normalizeName(n) === q),
    ) ?? null
  );
}
```

If `resolveJatak` returns `null`, the card builder must **not** silently proceed — emit a card with a single verdict-less entry and `direct_answer = "Person not in seed bank; add and re-emit."` That alone kills most of the current bush-beating.

### 4b. Building a verdict

```ts
// src/services/answerCard/answerCardBuilder.ts
import { buildConclusiveJatakJudgment } from "@/services/conclusiveJatakJudgmentService";
import { runCurrentDashaForecast } from "@/services/dashaForecastService";
import { TOPIC_TO_AREA, TOPIC_EXTRA_HOUSES } from "./topicMap";

function buildVerdict(
  chart: ChartData,
  forecast: DashaForecastResult,
  topic: Topic,
): Verdict {
  const area = TOPIC_TO_AREA[topic];
  const judgment = buildConclusiveJatakJudgment(chart, forecast, "natal");

  if (!judgment) {
    return degradedVerdict(
      topic,
      "Engine returned no judgment for this chart.",
    );
  }

  // The engine scores the strongest life area, which may not be the asked area.
  // Re-score for the asked area when it differs.
  const scored =
    area === judgment.area
      ? judgment
      : rescoreForArea(judgment, chart, forecast, area);

  const window = windowFromForecast(forecast, area);
  const band = BAND_FROM_VERDICT[scored.verdictType];

  return {
    topic,
    headline: { en: headlineEn(scored, topic), hi: headlineHi(scored, topic) },
    score_0_100: scored.score,
    band,
    engine_verdict: scored.verdictType,
    confidence_0_1: deriveConfidence(scored, chart),
    window,
    rationale: { en: scored.therefore, hi: translateToHi(scored.therefore) },
    conflicts: scored.conflictResolution,
    evidence: scored.evidence.map((e) => ({
      layer: e.layer,
      score: e.score,
      finding: e.finding,
    })),
    remedies: remediesFor(forecast.remedyTarget, topic),
    caveats: caveatsFor(scored, chart),
  };
}
```

**Critical detail — the engine scores the _strongest_ life area, not the _asked_ one.** `strongestLifeArea()` picks by `probability`. So a health question on a career-dominant chart returns a career verdict unless you re-score. `rescoreForArea` reuses the engine's own four scorers against the requested area:

```ts
function rescoreForArea(j, chart, forecast, area): ConclusiveJatakJudgment {
  const raj = scoreRajyoga(buildEnhancedYogas(chart, forecast)); // export these two
  const house = scoreHousePromise(chart, area);
  const dasha = scoreDasha(forecast, area);
  const transit = scoreTransit(chart, area);
  const score = clamp(
    raj.score * 0.24 +
      house.score * 0.26 +
      dasha.score * 0.36 +
      transit.score * 0.14,
  );
  const verdictType = verdictFromScore(score);
  // ...reuse buildConflicts + therefore composition verbatim
}
```

To do this cleanly, `export` four currently-private helpers from `conclusiveJatakJudgmentService.ts`: `scoreRajyoga`, `scoreHousePromise`, `scoreDasha`, `scoreTransit`, `verdictFromScore`, `buildConflicts`, `buildEnhancedYogas`. That is a 7-word change and the single most valuable edit in this whole patch.

**Add the extra-house overlay** for `house_construction` after scoring:

```ts
if (topic === "house_construction") {
  const fourth = chart.ashtakavarga?.houseStrengths.find((h) => h.house === 4);
  if (fourth) {
    score = clamp(score * 0.8 + HOUSE_STRENGTH_SCORE[fourth.strength] * 0.2);
  }
  // + vaastuService check on the planned plot if coordinates supplied
}
```

### 4c. Confidence — the only genuinely new logic

```ts
function deriveConfidence(
  j: ConclusiveJatakJudgment,
  chart: ChartData,
): number {
  let c = 0.55;

  // Distance from the nearest band boundary (75/56/40) — a 76 is shakier than an 88.
  const boundaries = [40, 56, 75];
  const nearest = Math.min(...boundaries.map((b) => Math.abs(j.score - b)));
  c += Math.min(nearest / 100, 0.18);

  // Agreement across layers: tight spread = confident.
  const scores = j.evidence.map((e) => e.score);
  const spread = Math.max(...scores) - Math.min(...scores);
  c += spread < 25 ? 0.12 : spread > 55 ? -0.1 : 0;

  // Every unresolved conflict costs.
  c -= j.conflictResolution.length * 0.04;

  // Engine's own data-absence signals.
  if (
    /not SAV-certified|Ashtakavarga data is unavailable/i.test(j.houseVerdict)
  )
    c -= 0.1;
  if (
    /cannot be certified|no dedicated Moon double-transit/i.test(
      j.transitVerdict,
    )
  )
    c -= 0.08;

  return Math.max(0.2, Math.min(0.9, Number(c.toFixed(2))));
}
```

Each deduction traces to a string the engine _already emits_. Nothing invented.

### 4d. The direct answer

```ts
function composeDirectAnswer(
  v: Verdict[],
  lang: Lang,
): { hi: string; en: string } {
  const line = (x: Verdict, l: Lang) =>
    `${x.headline[l]} (${bandWord(x.band, l)}, ${Math.round(x.confidence_0_1 * 100)}%` +
    `${x.window ? `, ${x.window.label[l]}` : ""})`;
  return {
    en: v.map((x) => line(x, "en")).join(" · "),
    hi: v.map((x) => line(x, "hi")).join(" · "),
  };
}
```

Output for your prompt:

> स्वास्थ्य सामान्यतः अनुकूल (good, 72%, नवम्बर 2026 – अप्रैल 2027) · नया घर बनाना अनुकूल (good, 68%, अप्रैल 2027 के बाद) · करियर उन्नति का समय (excellent, 81%, जनवरी – मार्च 2027)

Three clauses, verdict first, timing included, no preamble.

---

## 5. Phase 3 — Hindi

Two options, in order of preference:

1. **Reuse `src/services/multiLanguageService.ts`** for the band words and window labels (closed vocabulary — `good/average/caution`, `after/until/within`). Reliable.
2. **Translate the engine's free-text `therefore`** — this is the hard part. The engine emits English prose like _"career houses average 62/100 by SAV; strongest is house 10..."_. Two sub-options:
   - **Template it:** parse the numbers out and re-render from a Hindi template. Deterministic, no dependency.
   - **Gloss it:** store English in `rationale.en` and a Hindi rendering in `rationale.hi`, generated once at emit time by an LLM call, then _frozen into the committed JSON_. This keeps `answers:check` deterministic and gives you real Hindi prose.

Do (2-gloss) for `rationale`, (1) for everything short. Never let the _headline_ be LLM-generated — it must be reproducible.

**Bonus insight:** the PDF generator can't render Devanagari — commit `a1bcbf7` added `sanitizeForHelveticLatin1()` / `stripDevanagariAndBoxGlyphs()` because Helvetica is Latin-1 only. So the PDF's Hindi is transliterated at best. **The answer card is the only place a correct Hindi direct answer can live.** That is a strong independent reason for this patch.

---

## 6. Phase 4 — Markdown renderer (`answerCardRender.ts`)

Single function, no conditionals about content, so parity testing is trivial:

```ts
export function renderAnswerMarkdown(card: AnswerCard): string {
  const v = card.verdicts;
  return `# ${card.subject.name} — Direct Answer
<!-- card_hash: ${card.provenance.card_hash} | generated: ${card.provenance.computed_at} -->

${card.direct_answer.hi}

${card.direct_answer.en}

## Verdicts
| Topic | Band | Score | Confidence | Window |
|---|---|---|---|---|
${v.map((x) => `| ${x.topic} | ${x.band} | ${x.score_0_100} | ${x.confidence_0_1} | ${x.window ? `${x.window.from} → ${x.window.to}` : "—"} |`).join("\n")}

## Why (how the app arrived here)
${v.map((x) => `### ${x.topic}\n${x.rationale.en}\n${x.evidence.map((e) => `- ${e.layer} (${e.score}/100): ${e.finding}`).join("\n")}`).join("\n\n")}

## Remedies
${v.flatMap((x) => x.remedies.map((r) => `- ${r.hi} / ${r.en}`)).join("\n")}

## Caveats
${v.flatMap((x) => x.caveats.map((c) => `- ${c.hi} / ${c.en}`)).join("\n")}

## Provenance
${card.provenance.ayanamsa} · ${card.provenance.dasha_system} · ${card.provenance.house_system} · engine ${card.provenance.engine_version} · as_of ${card.provenance.as_of} · input ${card.provenance.input_hash.slice(0, 12)}
`;
}
```

The `<!-- card_hash -->` comment is deliberate: an agent that reads the `.md` and then reads `index.json` can verify it read the current card.

---

## 7. Phase 5 — Emit script

`publish-accuracy.mjs` is `.mjs`; `seedJataks.ts` runs via `npx tsx`. Use the latter precedent, and **add `tsx` to devDependencies** — `npx tsx` currently resolves over the network, which will bite you in CI.

```jsonc
// package.json
"answers:emit":  "tsx scripts/emitAnswerCards.ts",
"answers:check": "tsx scripts/emitAnswerCards.ts --check",
"ship": "npm run accuracy:publish && npm run answers:emit && npm run build"
```

```ts
// scripts/emitAnswerCards.ts
const CHECK = process.argv.includes("--check");
const OUT = "public/answers"; // MUST be under public/ — Vite copies publicDir → dist
const AS_OF =
  process.argv.find((a) => a.startsWith("--as-of="))?.split("=")[1] ??
  todayIST();

for (const j of JATAKS_DATABASE.jataks) {
  const topics = ALL_TOPICS; // or per-jatak override
  const card = buildAnswerCard(j, DEFAULT_ASK, topics, "hi", AS_OF);
  writeIfChanged(
    `${OUT}/${card.subject.slug}/_all.json`,
    JSON.stringify(card, null, 2),
    CHECK,
  );
  writeIfChanged(
    `${OUT}/${card.subject.slug}/_all.md`,
    renderAnswerMarkdown(card),
    CHECK,
  );
  for (const topic of topics) {
    /* per-topic card + md */
  }
}
writeIfChanged(`${OUT}/index.json`, buildIndex(cards), CHECK);
```

`writeIfChanged` compares and, in `--check` mode, **throws** on drift. That is your CI gate.

### The determinism trap — read this

`scoreTransit()` calls `new Date()` internally. So a card built today differs from one built tomorrow, and `answers:check` fails every single day. Three fixes, pick one:

1. **`--as-of` pin (recommended for CI):** run `answers:check --as-of=<committed computed_at>`. Clean, but the transit layer is then not refreshed.
2. **Two hashes:** `card_hash` covers only the time-invariant layers (Rajyoga, house, Dasha); a separate `transit_hash` covers timing. CI checks `card_hash` only. Timing drift is allowed and visible.
3. **Thread an `asOf: Date` param** into `scoreTransit` instead of `new Date()`. Best long-term, one-line signature change plus the caller.

Also note the transit layer uses `buildApproxMoonDoubleTransitInput` — **approximate by name**. So every transit-derived `window` must set `approximate: true` and the markdown must render it as `(approx.)`. Do not let an approximate window read as certified.

---

## 8. Phase 6 — `index.json`, `llms.txt`, `.well-known`

`index.json` is the router. Keep it small — an agent must be able to hold it in context:

```json
{
  "card_version": "1.0",
  "generated_at": "2026-10-24T09:12:00+05:30",
  "contract": "Read the card, reply from direct_answer, do not recompute.",
  "people": [
    {
      "name": "Premlata Jain",
      "aliases": ["Premlata", "मां"],
      "slug": "premlata-jain",
      "topics": ["health", "house_construction", "career"],
      "card": "premlata-jain/_all.json",
      "text": "premlata-jain/_all.md"
    }
  ]
}
```

Files, all under `public/`:

- `public/answers/index.json`
- `public/answers/<slug>/_all.{json,md}`
- `public/answers/<slug>/<topic>.{json,md}`
- `public/llms.txt`
- `public/.well-known/vedic-rajkumar.json`

### `public/llms.txt`

```markdown
# Vedic Rajkumar

> Deterministic Vedic (Jyotish) engine. Verdicts are precomputed. Read them; do not recompute.

## Start here

- [Answer index](/answers/index.json) — person → topics → card path. Read this first.
- [Example card](/answers/premlata-jain/_all.md) — the exact shape to relay.

## Contract

1. Read /answers/index.json. Match the person by name or alias.
2. If absent, read src/data/jataks/JATAKS_DATABASE.json, add them, run `npm run answers:emit`.
3. Reply from `direct_answer` in the first two lines. Verdict, band, confidence, window.
4. Language: use the `hi` field for Hindi prompts, `en` otherwise. Never mix.
5. Cite provenance.card_hash. If it differs from index.json, re-emit and say so.

## Do not

- Restate the chart before the verdict.
- List houses, planets or yogas in the first reply.
- Produce a number the card does not contain.

## Optional

- [Seed bank](/../src/data/jataks/JATAKS_DATABASE.json) · [Agent rules](AGENTS.md)
```

### `public/.well-known/vedic-rajkumar.json`

```json
{
  "name": "Vedic Rajkumar",
  "kind": "deterministic-answer-service",
  "contract_version": "1.0",
  "instructions": "Read answer cards; reply from direct_answer; do not recompute.",
  "endpoints": {
    "answer_index": "/answers/index.json",
    "answer_card": "/answers/{slug}/{topic}.json",
    "answer_text": "/answers/{slug}/{topic}.md",
    "query": "/api/v1/answer?person={name}&topics={csv}&lang={hi|en}"
  },
  "languages": ["hi", "en"],
  "topic_values": [
    "health",
    "house_construction",
    "career",
    "marriage",
    "finance"
  ]
}
```

---

## 9. Phase 7 — `AGENTS.md` patch (exact drop-in)

Insert immediately under `# Vedic_Rajkumar Agent Rules`, **above `## Stack`**:

```markdown
## READ FIRST — the answer already exists, do not recompute

This app computes verdicts deterministically via `conclusiveJatakJudgmentService`.
If you are an AI asked a prospect/forecast question about a person, do NOT re-derive
the astrology from source. Follow this order:

1. Read `public/answers/index.json`. Match the person by `name` or `aliases`.
   - Absent? Read `src/data/jataks/JATAKS_DATABASE.json`. Add the person there
     (next `jatak_NNN` id, same field shape), then run `npm run answers:emit`.
2. Read `public/answers/<slug>/_all.md` for a multi-topic ask, or
   `public/answers/<slug>/<topic>.md` for a single topic.
3. Reply from `direct_answer` in the first two lines: verdict, band, confidence,
   window. Nothing precedes it.
4. Reply in the prompt's language: `hi` field for Hindi, `en` otherwise. Never mix.
5. Only if asked, append the "Why" section and provenance.
6. Cite `provenance.card_hash`.

Forbidden in a first reply: restating the chart; explaining your method; listing
houses/planets/yogas before the verdict; inventing a number absent from the card.

Machine entry points: `public/llms.txt` · `public/.well-known/vedic-rajkumar.json`
· `GET /api/v1/answer?person=&topics=&lang=`.
```

Then fix the line in `## AI / RAG Features` that causes the bug:

```diff
- All AI prompts must include relevant birth chart context before querying.
+ All AI prompts must include the answer card (not the raw chart) as primary context.
```

---

## 10. Phase 8 — Serving

Three things matter here.

**10a. `public/` is mandatory.** `vite.config.ts` uses the default `publicDir: 'public'`, and `netlify.toml` sets `publish = "dist"`. Anything not under `public/` never reaches the deployed site.

**10b. The catch-all redirect is safe, with one caveat.** `netlify.toml` has `/* → /index.html 200`. Netlify applies non-forced redirects only when no static file matches, so `/answers/index.json` is served correctly. **But** `/answers/premlata-jain` (no extension) returns the SPA shell. So every link in `llms.txt` and `index.json` must carry a file extension. Add a guard comment in `netlify.toml` so nobody "tidies" it:

```toml
# NOTE: /answers/** is served as static files (no redirect needed).
# Always link answer cards WITH a file extension — the /* SPA rewrite
# below will swallow extensionless paths.
```

**10c. Extend the build command.** Same reasoning as `accuracy:publish` — Vite bundles the artifacts at build time:

```toml
[build]
  command = "npm run accuracy:publish && npm run answers:emit && npm run build"
```

**10d. CSP needs no change.** `default-src 'self'` covers same-origin `/answers/*`.

**10e. Agent detection.** In the route layer, before React mounts, check `?agent=1`, `?format=markdown`, or `Accept: text/markdown`. If matched, `fetch('/answers/<slug>/_all.md')` and render it as `<pre>` instead of the app shell — an agent hitting the URL gets plain text, not div soup. Cheap, and it makes the deployed app self-describing.

**10f. `/api/v1/answer`.** Add to the existing Hono router (`src/api/v1/router.ts`) and register the schema in `src/api/v1/schemas/` + `openapi.ts` — do not build a parallel API surface.

```ts
router.get("/answer", async (c) => {
  const person = c.req.query("person");
  const topics = (c.req.query("topics") ?? "health,career").split(
    ",",
  ) as Topic[];
  const lang = (c.req.query("lang") ?? "hi") as Lang;
  const jatak = resolveJatak(person);
  if (!jatak)
    return c.json(
      { found: false, hint: "Add to seed bank, then npm run answers:emit" },
      404,
    );
  const card = buildAnswerCard(jatak, `API query`, topics, lang, todayIST());
  return c.json({
    found: true,
    direct_answer: card.direct_answer,
    verdicts: card.verdicts,
    provenance: card.provenance,
  });
});
```

---

## 11. Phase 9 — UI

Two additions only.

**11a. Copy button** in `src/components/ReportShell.tsx`, beside Print/PDF:

```tsx
<Button
  variant="outline"
  size="sm"
  onClick={() => navigator.clipboard.writeText(renderAnswerMarkdown(card))}
>
  {t("copyForAI")} {/* "Copy answer for AI" / "AI के लिए उत्तर कॉपी करें" */}
</Button>
```

**11b. Render `direct_answer` verbatim** at the top of the report — mirroring how `AccuracyDashboardPage` renders `src/generated/summary.json` verbatim. Do not re-compose the sentence in JSX. That is what guarantees the UI and the AI never disagree.

Add `copyForAI` to the i18n dictionary alongside the existing Week-08 label work.

---

## 12. Phase 10 — Tests

```ts
// src/tests/answerCard/parity.test.ts
it("markdown is rendered only from the card", () => {
  const card = buildAnswerCard(
    JATAK_PREMLATA,
    "prospects",
    ["health", "house_construction", "career"],
    "hi",
    "2026-10-24",
  );
  expect(renderAnswerMarkdown(card)).toContain(card.direct_answer.hi);
});

it("committed artifacts match a fresh build", () => {
  const card = buildAnswerCard(
    JATAK_PREMLATA,
    DEFAULT_ASK,
    ALL_TOPICS,
    "hi",
    "2026-10-24",
  );
  expect(renderAnswerMarkdown(card).trim()).toBe(
    readFileSync("public/answers/premlata-jain/_all.md", "utf8").trim(),
  );
});

it("direct_answer has no preamble", () => {
  const card = buildAnswerCard(
    JATAK_PREMLATA,
    "q",
    ["career"],
    "en",
    "2026-10-24",
  );
  expect(card.direct_answer.en).not.toMatch(
    /^(The chart|Based on|As per|Analysing)/i,
  );
});

it("confidence never exceeds 0.9 and never falls below 0.2", () => {
  for (const t of ALL_TOPICS) {
    const c = buildAnswerCard(JATAK_PREMLATA, "q", [t], "en", "2026-10-24")
      .verdicts[0].confidence_0_1;
    expect(c).toBeGreaterThanOrEqual(0.2);
    expect(c).toBeLessThanOrEqual(0.9);
  }
});

it("every card carries provenance and a stable hash", () => {
  const a = buildAnswerCard(
    JATAK_PREMLATA,
    "q",
    ["career"],
    "en",
    "2026-10-24",
  );
  const b = buildAnswerCard(
    JATAK_PREMLATA,
    "q",
    ["career"],
    "en",
    "2026-10-24",
  );
  expect(a.provenance.card_hash).toBe(b.provenance.card_hash);
  expect(a.provenance.input_hash).toHaveLength(64);
});

it("unknown person degrades explicitly, not silently", () => {
  const card = buildAnswerCardByName(
    "Nobody Here",
    "q",
    ["career"],
    "en",
    "2026-10-24",
  );
  expect(card.subject.jatak_id).toBeNull();
  expect(card.direct_answer.en).toMatch(/not in seed bank/i);
});
```

CI: add `npm run answers:check` to `.github/workflows/ci.yml` next to the existing accuracy gate, with `--as-of` pinned per §7.

---

## 13. Privacy decision — make it consciously

`README.md` promises demo mode is _"100% local browser — nothing leaves your device."_ Committing `public/answers/` publishes names, dates, times and birthplaces to the repo and the public site. Three postures:

| Posture    | Card content                     | Trade-off                                           |
| ---------- | -------------------------------- | --------------------------------------------------- |
| Full       | name + full birth data + verdict | best for repo-reading agents, leaks PII             |
| Names only | name + verdict, no DOB           | good default; agent must read seed bank for details |
| Slugs      | `premlata-jain` only             | privacy-max, worst ergonomics                       |

Recommendation: **names + verdict + hashes** in the card; birth data stays in the seed bank (already public in the repo anyway). Keep full DOB in `subject` only when the jatak's data is already public — i.e. gate it behind an `--include-birth-data` flag.

---

## 14. Rollout order

| #   | Step                                                                  | Gate                                        |
| --- | --------------------------------------------------------------------- | ------------------------------------------- |
| 1   | Export the 7 private helpers from `conclusiveJatakJudgmentService.ts` | `npm run typecheck`                         |
| 2   | Add `jatak_021 Premlata Jain` to the seed bank                        | resolves by name                            |
| 3   | Hoist `parseCoordinateString` to `src/lib/`                           | `seedJataks` still runs                     |
| 4   | `AnswerCard.types.ts` + `topicMap.ts`                                 | typecheck                                   |
| 5   | `answerCardBuilder.ts` (single topic: career)                         | one card prints                             |
| 6   | `answerCardRender.ts`                                                 | markdown looks right                        |
| 7   | `emitAnswerCards.ts` + all topics + index.json                        | `public/answers/**` populated               |
| 8   | `llms.txt` + `.well-known` + `AGENTS.md`                              | —                                           |
| 9   | `netlify.toml` build command                                          | deploy succeeds, `/answers/index.json` 200s |
| 10  | UI button + verbatim render                                           | parity test green                           |
| 11  | `answers:check` in CI                                                 | red on drift, green on clean                |

Do **not** skip step 1 — without the exported scorers you cannot answer for a non-dominant topic, and half your queries will return the wrong area's verdict.

---

## 15. Failure modes

| Symptom                             | Cause                                    | Fix                                                                 |
| ----------------------------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| Agent still analyses in detail      | `AGENTS.md` not read                     | put the READ-FIRST block above `## Stack`; add it to `llms.txt` too |
| `/answers/index.json` returns HTML  | missing from `public/`                   | emit under `public/`                                                |
| Card hash changes daily             | `new Date()` in `scoreTransit`           | `--as-of` pin, or split `transit_hash`                              |
| Verdict is for the wrong topic      | `strongestLifeArea` picks by probability | step 1 — `rescoreForArea`                                           |
| `answers:check` fails offline       | `npx tsx` network fetch                  | add `tsx` to devDependencies                                        |
| Hindi is garbled in PDF only        | Helvetica is Latin-1                     | expected; card is the correct surface                               |
| Wrong ascendant for pre-1947 births | hardcoded IST                            | already fixed in-repo; card must record resolved offset             |
| 404 on `/answers/foo`               | extensionless path hits SPA rewrite      | always link with extension                                          |

---

## 16. Hand this to a coding agent

```
In CRAJKUMARSINGH/Vedic_Rajkumar, implement an "Answer Layer" so an AI reading the
repo gets the app's precomputed verdict instead of re-deriving the astrology.

Follow the numbered rollout in order. Constraints:
- Reuse src/services/conclusiveJatakJudgmentService.ts — export its 7 private
  scorers rather than duplicating logic.
- Add src/services/answerCard/{AnswerCard.types.ts,topicMap.ts,
  answerCardBuilder.ts,answerCardRender.ts} and scripts/emitAnswerCards.ts.
- Emit artifacts to public/answers/** (publicDir → dist), plus public/llms.txt
  and public/.well-known/vedic-rajkumar.json.
- Add the READ FIRST block to AGENTS.md above ## Stack, and change the
  AI/RAG line from "birth chart context" to "answer card".
- Add jatak_021 Premlata Jain to src/data/jataks/JATAKS_DATABASE.json.
- Wire answers:emit into netlify.toml's build command, before build.
- Add scripts answers:emit and answers:check (tsx), and add tsx to devDependencies.
- Add the parity/determinism tests from section 12 and gate CI on answers:check.
- Strict TS, no `any`, no LLM calls in the pipeline.

Acceptance: given "In hindi answer from app: <repo URL> — forecast health, house
construction and career for Premlata Jain", the agent replies with three Hindi
clauses (verdict, band, confidence, window) and a card_hash, with no chart walkthrough.
```

Next step is to stop describing and ship it. Below is the complete PR — five surgical edits to existing files, then every new file in full, in dependency order.

## PR contents

| #   | Action                   | Path                                             |
| --- | ------------------------ | ------------------------------------------------ |
| 1   | EDIT — refactor + export | `src/services/conclusiveJatakJudgmentService.ts` |
| 2   | EDIT — add `jatak_021`   | `src/data/jataks/JATAKS_DATABASE.json`           |
| 3   | EDIT — READ FIRST block  | `AGENTS.md`                                      |
| 4   | EDIT — scripts + `tsx`   | `package.json`                                   |
| 5   | EDIT — build command     | `netlify.toml`                                   |
| 6   | NEW                      | `src/lib/hash/stableHash.ts`                     |
| 7   | NEW                      | `src/lib/jataks/resolveJatak.ts`                 |
| 8   | NEW                      | `src/services/answerCard/AnswerCard.types.ts`    |
| 9   | NEW                      | `src/services/answerCard/topicMap.ts`            |
| 10  | NEW                      | `src/services/answerCard/confidence.ts`          |
| 11  | NEW                      | `src/services/answerCard/answerCardBuilder.ts`   |
| 12  | NEW                      | `src/services/answerCard/answerCardRender.ts`    |
| 13  | NEW                      | `scripts/emitAnswerCards.ts`                     |
| 14  | NEW                      | `public/llms.txt`                                |
| 15  | NEW                      | `public/.well-known/vedic-rajkumar.json`         |
| 16  | NEW                      | `src/tests/answerCard/parity.test.ts`            |

---

## EDIT 1 — `src/services/conclusiveJatakJudgmentService.ts`

Two changes: export the verdict union and add `area` to the result, then extract the body so a caller can score **any** area, not just the strongest.

**1a. Exported types and interface:**

```diff
-type VerdictType = 'DELIVERING' | 'CONDITIONAL' | 'DELAYED' | 'BLOCKED';
-type LifeArea = DashaLifeAreaForecast['area'];
+export type VerdictType = 'DELIVERING' | 'CONDITIONAL' | 'DELAYED' | 'BLOCKED';
+export type LifeArea = DashaLifeAreaForecast['area'];

 export interface ConclusiveJatakJudgment {
   referenceType: ReferenceType;
+  /** Which life area this judgment is for. Required so callers can verify
+   *  they got the area they asked for rather than the strongest one. */
+  area: LifeArea;
   headline: string;
   verdictType: VerdictType;
```

**1b. Extract the scorer.** Replace the whole `buildConclusiveJatakJudgment` function with:

```ts
/**
 * Score a specific life area. Use this when the caller asked about a topic
 * that is not the chart's strongest area.
 */
export function buildJudgmentForArea(
  chart: ChartData,
  forecast: DashaForecastResult,
  area: LifeArea,
  referenceType: ReferenceType,
): ConclusiveJatakJudgment | null {
  const enhancedYogas = buildEnhancedYogas(chart, forecast);
  const raj = scoreRajyoga(enhancedYogas);
  const house = scoreHousePromise(chart, area);
  const dasha = scoreDasha(forecast, area);
  const transit = scoreTransit(chart, area);

  const score = clamp(
    raj.score * 0.24 +
      house.score * 0.26 +
      dasha.score * 0.36 +
      transit.score * 0.14,
  );
  const verdictType = verdictFromScore(score);
  const conflicts = buildConflicts({
    area,
    rajScore: raj.score,
    houseScore: house.score,
    dashaScore: dasha.score,
    transitScore: transit.score,
    activeRajyogas: raj.activeRajyogas,
    brokenRajyogas: raj.brokenRajyogas,
  });

  const scope =
    referenceType === "natal"
      ? `for this Jatak's birth promise`
      : `for this question-time chart only`;
  const headline = `${verdictType}: ${area} is the leading field at ${score}/100`;
  const therefore = `Therefore: ${scope}, ${area} is ${verdictType.toLowerCase()} now because Rajyoga scores ${raj.score}/100, house promise scores ${house.score}/100, Dasha scores ${dasha.score}/100, and transit timing scores ${transit.score}/100. The final call is ${headline}.`;

  return {
    referenceType,
    area,
    headline,
    verdictType,
    score,
    rajyogaVerdict: raj.verdict,
    houseVerdict: house.verdict,
    dashaVerdict: dasha.verdict,
    transitVerdict: transit.verdict,
    conflictResolution: conflicts,
    therefore,
    evidence: [
      { layer: "Rajyoga gate", score: raj.score, finding: raj.verdict },
      { layer: "House promise", score: house.score, finding: house.verdict },
      { layer: "Dasha activation", score: dasha.score, finding: dasha.verdict },
      {
        layer: "Transit timing",
        score: transit.score,
        finding: transit.verdict,
      },
    ],
  };
}

/** Unchanged behaviour: scores the chart's strongest life area. */
export function buildConclusiveJatakJudgment(
  chart: ChartData,
  forecast: DashaForecastResult,
  referenceType: ReferenceType,
): ConclusiveJatakJudgment | null {
  const areaForecast = strongestLifeArea(forecast);
  if (!areaForecast) return null;
  return buildJudgmentForArea(
    chart,
    forecast,
    areaForecast.area,
    referenceType,
  );
}
```

Also add `export` to `DOMAIN_HOUSES` and `HOUSE_STRENGTH_SCORE` (needed by the house-construction overlay):

```diff
-const DOMAIN_HOUSES: Record<LifeArea, number[]> = {
+export const DOMAIN_HOUSES: Record<LifeArea, number[]> = {
@@
-const HOUSE_STRENGTH_SCORE = {
+export const HOUSE_STRENGTH_SCORE = {
```

---

## EDIT 2 — `src/data/jataks/JATAKS_DATABASE.json`

Append after the `jatak_020` object, bump `totalJataks` to `21`:

```json
{
  "id": "jatak_021",
  "name": "Premlata Jain",
  "aliases": ["Premlata", "Premlataji", "Mummy Jain"],
  "dateOfBirth": "1974-11-08",
  "timeOfBirth": "04:35",
  "placeOfBirth": "Aspur",
  "state": "Rajasthan",
  "country": "India",
  "coordinates": {
    "latitude": "23.84°N",
    "longitude": "73.71°E"
  },
  "relationship": "Mother",
  "inExcel": false,
  "notes": "Added for answer-card coverage — CONFIRM dob/time against family record"
}
```

`dateOfBirth`/`timeOfBirth` are the one thing you must verify; `aliases` is what stops an agent missing her.

---

## EDIT 3 — `AGENTS.md`

Insert **immediately after** `# Vedic_Rajkumar Agent Rules`, above `## Stack`:

```markdown
## READ FIRST — the answer already exists, do not recompute

This app computes verdicts deterministically via `conclusiveJatakJudgmentService`.
If you are an AI asked a prospect/forecast question about a person, do NOT
re-derive the astrology from source. Follow this order:

1. Read `public/answers/index.json`. Match the person by `name` or `aliases`.
   - Absent? Read `src/data/jataks/JATAKS_DATABASE.json`. Add the person there
     (next `jatak_NNN` id, same field shape), then run `npm run answers:emit`.
2. Read `public/answers/<slug>/_all.md` for a multi-topic ask, or
   `public/answers/<slug>/<topic>.md` for a single topic.
3. Reply from `direct_answer` in the first two lines: verdict, band, confidence,
   window. Nothing precedes it.
4. Reply in the prompt's language: `hi` field for Hindi, `en` otherwise. Never mix.
5. Only if asked, append the "Why" section and provenance.
6. Cite `provenance.card_hash`.

Forbidden in a first reply: restating the chart; explaining your method; listing
houses/planets/yogas before the verdict; inventing a number absent from the card.

Machine entry points: `public/llms.txt` · `public/.well-known/vedic-rajkumar.json`
· `GET /api/v1/answer?person=&topics=&lang=`.
```

And in `## AI / RAG Features`:

```diff
-- All AI prompts must include relevant birth chart context before querying.
+- All AI prompts must include the answer card (not the raw chart) as primary context.
```

---

## EDIT 4 — `package.json`

```diff
   "scripts": {
     "dev": "vite",
+    "answers:emit": "tsx scripts/emitAnswerCards.ts",
+    "answers:check": "tsx scripts/emitAnswerCards.ts --check",
@@
-    "ship": "npm run accuracy:publish && npm run build"
+    "ship": "npm run accuracy:publish && npm run answers:emit && npm run build"
   },
   "devDependencies": {
@@
     "tailwindcss": "^4.3.3",
+    "tsx": "^4.20.3",
```

`tsx` must be a real dependency — bare `npx tsx` resolves over the network and breaks offline CI.

---

## EDIT 5 — `netlify.toml`

```diff
 [build]
-  command = "npm run accuracy:publish && npm run build"
+  # accuracy snapshot AND answer cards are bundled at build time, so both
+  # must be regenerated before Vite runs.
+  command = "npm run accuracy:publish && npm run answers:emit && npm run build"
   publish = "dist"
```

And add above the `/*` redirect:

```toml
# NOTE: /answers/** and /llms.txt are served as static files from public/.
# The /* SPA rewrite below only fires when no static file matches, so always
# link answer cards WITH a file extension (e.g. /answers/index.json).
# An extensionless /answers/foo will return the SPA shell.
```

---

## NEW — `src/lib/hash/stableHash.ts`

Dependency-free, synchronous, identical in Node and browser. It is a change-detector, not a security hash.

```ts
/** Recursively sort object keys so structurally-equal values hash equally. */
export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object")
    return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalize(v)}`).join(",")}}`;
}

/** FNV-1a, two lanes → 16 hex chars. Stable across Node and browsers. */
export function stableHash(value: unknown): string {
  const input = typeof value === "string" ? value : canonicalize(value);
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ (c + i), 0x85ebca6b) >>> 0;
  }
  return (
    (h1 >>> 0).toString(16).padStart(8, "0") +
    (h2 >>> 0).toString(16).padStart(8, "0")
  );
}
```

---

## NEW — `src/lib/jataks/resolveJatak.ts`

```ts
import JATAKS_DATABASE from "@/data/jataks/JATAKS_DATABASE.json";

export interface JatakRecord {
  id: string;
  name: string;
  aliases?: string[];
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  state?: string;
  country?: string;
  coordinates?: { latitude?: string; longitude?: string };
  timezone?: string;
  relationship?: string;
  notes?: string;
}

export const slugify = (s: string): string =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const normalizeName = (s: string): string => slugify(s);

/** Accepts "23.84°N" | "23.84N" | 23.84 → 23.84 */
export function parseCoordinateString(value: unknown): number | null {
  if (value == null) return null;
  const n = Number(value);
  if (!Number.isNaN(n)) return n;
  if (typeof value === "string") {
    const m = value.match(/^([0-9.]+)\s*[NSEWnsew]?°/);
    if (m) {
      const p = parseFloat(m[1]);
      if (!Number.isNaN(p)) return p;
    }
  }
  return null;
}

export function allJataks(): JatakRecord[] {
  return (JATAKS_DATABASE as { jataks: JatakRecord[] }).jataks;
}

/** Exact match on name or any alias, case/punctuation-insensitive. */
export function resolveJatak(name: string): JatakRecord | null {
  const q = normalizeName(name);
  return (
    allJataks().find((j) =>
      [j.name, ...(j.aliases ?? [])].some((n) => normalizeName(n) === q),
    ) ?? null
  );
}

export interface ResolvedSubject {
  name: string;
  slug: string;
  aliases: string[];
  jatak_id: string | null;
  dob: string;
  tob: string;
  place: string;
  lat: number;
  lon: number;
  tz: string;
  tz_defaulted: boolean;
}

const DEFAULT_TZ = "Asia/Kolkata";

export function toSubject(j: JatakRecord): ResolvedSubject {
  const lat = parseCoordinateString(j.coordinates?.latitude);
  const lon = parseCoordinateString(j.coordinates?.longitude);
  if (lat === null || lon === null)
    throw new Error(`No usable coordinates for ${j.name}`);
  return {
    name: j.name,
    slug: slugify(j.name),
    aliases: j.aliases ?? [],
    jatak_id: j.id,
    dob: j.dateOfBirth,
    tob: j.timeOfBirth,
    place: [j.placeOfBirth, j.state].filter(Boolean).join(", "),
    lat,
    lon,
    tz: j.timezone ?? DEFAULT_TZ,
    tz_defaulted: !j.timezone,
  };
}
```

---

## NEW — `src/services/answerCard/AnswerCard.types.ts`

```ts
import type { VerdictType } from "@/services/conclusiveJatakJudgmentService";

export type Topic =
  "health" | "house_construction" | "career" | "marriage" | "finance";
export type Lang = "hi" | "en";
export type Band = "excellent" | "good" | "average" | "caution" | "avoid";

export const ALL_TOPICS: readonly Topic[] = [
  "health",
  "house_construction",
  "career",
  "marriage",
  "finance",
] as const;

/** 1:1 from the engine's VerdictType — no meaning invented. */
export const BAND_FROM_VERDICT: Record<VerdictType, Band> = {
  DELIVERING: "good",
  CONDITIONAL: "average",
  DELAYED: "caution",
  BLOCKED: "avoid",
};

export const BAND_WORD: Record<Band, { en: string; hi: string }> = {
  excellent: { en: "excellent", hi: "उत्तम" },
  good: { en: "good", hi: "अनुकूल" },
  average: { en: "average", hi: "सामान्य" },
  caution: { en: "caution", hi: "सावधानी" },
  avoid: { en: "avoid", hi: "प्रतिकूल" },
};

export const TOPIC_LABEL: Record<Topic, { en: string; hi: string }> = {
  health: { en: "Health & wellbeing", hi: "स्वास्थ्य" },
  house_construction: { en: "New house construction", hi: "नया घर निर्माण" },
  career: { en: "Career", hi: "करियर" },
  marriage: { en: "Marriage", hi: "विवाह" },
  finance: { en: "Finance", hi: "आर्थिक" },
};

export interface EvidenceLine {
  layer: string;
  score: number;
  finding: string;
}

export interface Verdict {
  topic: Topic;
  headline: { en: string; hi: string };
  score_0_100: number;
  band: Band;
  engine_verdict: VerdictType;
  confidence_0_1: number;
  window: {
    from: string;
    to: string;
    label: { en: string; hi: string };
    approximate: boolean;
  } | null;
  rationale: { en: string; hi: string };
  conflicts: string[];
  evidence: EvidenceLine[];
  remedies: Array<{ en: string; hi: string }>;
  caveats: Array<{ en: string; hi: string }>;
}

export interface Subject {
  name: string;
  slug: string;
  aliases: string[];
  jatak_id: string | null;
  dob: string;
  tob: string;
  place: string;
  lat: number;
  lon: number;
  tz: string;
  tz_defaulted: boolean;
}

export interface AnswerCard {
  card_version: "1.0";
  subject: Subject;
  query: {
    asked: string;
    topics: Topic[];
    language: Lang;
    as_of: string;
    reference_type: "natal" | "prashna";
  };
  /** FIELD #1. Reply from this and nothing else. */
  direct_answer: { hi: string; en: string };
  verdicts: Verdict[];
  provenance: {
    engine_version: string;
    ayanamsa: string;
    house_system: string;
    dasha_system: string;
    ephemeris: "local" | "swisseph";
    computed_at: string;
    as_of: string;
    input_hash: string;
    card_hash: string;
    source_files: string[];
  };
}
```

---

## NEW — `src/services/answerCard/topicMap.ts`

```ts
import type { LifeArea } from "@/services/conclusiveJatakJudgmentService";
import type { Topic } from "./AnswerCard.types";

/** house_construction routes to 'wealth' (2nd house = immovable assets),
 *  with the 4th house added as an overlay below. Avoids widening the
 *  LifeArea union in the engine. */
export const TOPIC_TO_AREA: Record<Topic, LifeArea> = {
  health: "health",
  house_construction: "wealth",
  career: "career",
  marriage: "marriage",
  finance: "wealth",
};

/** Extra houses scored beyond what the engine already covers. */
export const TOPIC_EXTRA_HOUSES: Partial<Record<Topic, number[]>> = {
  house_construction: [4],
};
```

---

## NEW — `src/services/answerCard/confidence.ts`

Every deduction traces to a string the engine already emits.

```ts
import type { ConclusiveJatakJudgment } from "@/services/conclusiveJatakJudgmentService";
import type { ChartData } from "@/hooks/useChartCalculation";

const BOUNDARIES = [40, 56, 75] as const;

export function deriveConfidence(
  j: ConclusiveJatakJudgment,
  _chart: ChartData,
): number {
  let c = 0.55;

  // Proximity to a band boundary: a 76 is shakier than an 88.
  const nearest = Math.min(...BOUNDARIES.map((b) => Math.abs(j.score - b)));
  c += Math.min(nearest / 100, 0.18);

  // Inter-layer agreement: tight spread = confident.
  const scores = j.evidence.map((e) => e.score);
  const spread = Math.max(...scores) - Math.min(...scores);
  c += spread < 25 ? 0.12 : spread > 55 ? -0.1 : 0;

  // Every unresolved conflict costs.
  c -= j.conflictResolution.length * 0.04;

  // The engine's own data-absence signals.
  if (
    /not SAV-certified|Ashtakavarga data is unavailable/i.test(j.houseVerdict)
  )
    c -= 0.1;
  if (
    /cannot be certified|no dedicated Moon double-transit/i.test(
      j.transitVerdict,
    )
  )
    c -= 0.08;

  return Math.max(0.2, Math.min(0.9, Number(c.toFixed(2))));
}

export const confidenceWord = (c: number, lang: "hi" | "en"): string =>
  lang === "hi"
    ? c >= 0.75
      ? "उच्च"
      : c >= 0.55
        ? "मध्यम"
        : "सीमित"
    : c >= 0.75
      ? "high"
      : c >= 0.55
        ? "moderate"
        : "limited";
```

---

## NEW — `src/services/answerCard/answerCardBuilder.ts`

```ts
import type { ChartData } from "@/hooks/useChartCalculation";
import {
  buildJudgmentForArea,
  DOMAIN_HOUSES,
  HOUSE_STRENGTH_SCORE,
  type ConclusiveJatakJudgment,
  type LifeArea,
} from "@/services/conclusiveJatakJudgmentService";
import {
  runCurrentDashaForecast,
  toDashaForecastPlanets,
  type DashaForecastResult,
  type DashaLifeAreaForecast,
} from "@/services/dashaForecastService";
import { stableHash } from "@/lib/hash/stableHash";
import { toSubject, type JatakRecord } from "@/lib/jataks/resolveJatak";
import { TOPIC_TO_AREA, TOPIC_EXTRA_HOUSES } from "./topicMap";
import { deriveConfidence, confidenceWord } from "./confidence";
import {
  BAND_FROM_VERDICT,
  BAND_WORD,
  TOPIC_LABEL,
  type AnswerCard,
  type Lang,
  type Topic,
  type Verdict,
} from "./AnswerCard.types";

export const ENGINE_VERSION = "0.1.0";
export const DEFAULT_ASK = "Forecast prospects";
const SOURCE_FILES = [
  "src/services/conclusiveJatakJudgmentService.ts",
  "src/services/dashaForecastService.ts",
  "src/services/ashtakavargaService.ts",
  "src/services/transitEngine.ts",
];

const clamp = (n: number, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Math.round(n)));

/** Build the forecast input the engine needs. */
function forecastFor(chart: ChartData, asOf: string): DashaForecastResult {
  const dasha = chart.dasha;
  const md = dasha?.currentMahadasha;
  if (!md)
    throw new Error(
      "ChartData.dasha.currentMahadasha missing — confirm field name.",
    );
  return runCurrentDashaForecast({
    referenceType: "natal",
    planets: toDashaForecastPlanets(
      chart.planetaryPositions.planets,
      chart.shadbala ?? null,
    ),
    ascendantRashiIndex: chart.ascendant.ascendant.rashiIndex,
    currentMahadasha: md,
    currentAntardasha: dasha?.currentAntardasha ?? null,
    shadbala: chart.shadbala ?? undefined,
    divisionalCharts: chart.divisionalCharts,
    asOf,
  } as never);
}

function windowFromForecast(forecast: DashaForecastResult, area: LifeArea) {
  const af: DashaLifeAreaForecast | undefined = forecast.lifeAreaForecasts.find(
    (f) => f.area === area,
  );
  const timing = af?.timing;
  if (!timing?.startDate || !timing?.endDate) return null;
  return {
    from: timing.startDate,
    to: timing.endDate,
    label: {
      en: `${timing.startDate} → ${timing.endDate}`,
      hi: `${timing.startDate} → ${timing.endDate}`,
    },
    // Transit layer uses buildApproxMoonDoubleTransitInput — approximate by name.
    approximate: true,
  };
}

function headlineFor(
  j: ConclusiveJatakJudgment,
  topic: Topic,
  lang: Lang,
): string {
  const band = BAND_WORD[BAND_FROM_VERDICT[j.verdictType]][lang];
  const label = TOPIC_LABEL[topic][lang];
  const conf = Math.round(deriveConfidence(j, {} as ChartData) * 100);
  return lang === "hi"
    ? `${label} ${band} (${conf}%)`
    : `${label}: ${band} (${conf}%)`;
}

function buildVerdict(
  chart: ChartData,
  forecast: DashaForecastResult,
  topic: Topic,
): Verdict {
  const area = TOPIC_TO_AREA[topic];
  const j = buildJudgmentForArea(chart, forecast, area, "natal");
  if (!j) return degraded(topic, "Engine returned no judgment for this chart.");

  // House-construction overlay: 4th house (dwelling) blended in.
  let score = j.score;
  for (const house of TOPIC_EXTRA_HOUSES[topic] ?? []) {
    const h = chart.ashtakavarga?.houseStrengths.find((x) => x.house === house);
    if (h) score = clamp(score * 0.8 + HOUSE_STRENGTH_SCORE[h.strength] * 0.2);
  }
  const merged = { ...j, score };

  const confidence = deriveConfidence(merged, chart);
  return {
    topic,
    headline: {
      en: headlineFor(merged, topic, "en"),
      hi: headlineFor(merged, topic, "hi"),
    },
    score_0_100: merged.score,
    band: BAND_FROM_VERDICT[merged.verdictType],
    engine_verdict: merged.verdictType,
    confidence_0_1: confidence,
    window: windowFromForecast(forecast, area),
    rationale: { en: merged.therefore, hi: merged.therefore }, // hi glossed at emit time
    conflicts: merged.conflictResolution,
    evidence: merged.evidence.map((e) => ({
      layer: e.layer,
      score: e.score,
      finding: e.finding,
    })),
    remedies: forecast.remedyTarget
      ? [
          {
            en: String(forecast.remedyTarget),
            hi: String(forecast.remedyTarget),
          },
        ]
      : [],
    caveats: caveatsFor(merged, chart),
  };
}

function caveatsFor(
  j: ConclusiveJatakJudgment,
  chart: ChartData,
): Array<{ en: string; hi: string }> {
  const out: Array<{ en: string; hi: string }> = [];
  if (!chart.ashtakavarga)
    out.push({
      en: "Ashtakavarga unavailable; Dasha carries more weight.",
      hi: "अष्टकवर्ग उपलब्ध नहीं; दशा का भार अधिक।",
    });
  if (/cannot be certified/i.test(j.transitVerdict))
    out.push({
      en: "Transit timing uncertified.",
      hi: "गोचर समय प्रमाणित नहीं।",
    });
  out.push({ en: "Windows are approximate.", hi: "समय-सीमाएँ अनुमानित हैं।" });
  return out;
}

function degraded(topic: Topic, msg: string): Verdict {
  return {
    topic,
    headline: { en: msg, hi: msg },
    score_0_100: 50,
    band: "average",
    engine_verdict: "CONDITIONAL",
    confidence_0_1: 0.3,
    window: null,
    rationale: { en: msg, hi: msg },
    conflicts: [],
    evidence: [],
    remedies: [],
    caveats: [{ en: msg, hi: msg }],
  };
}

function composeDirectAnswer(
  v: Verdict[],
  lang: Lang,
): { hi: string; en: string } {
  const line = (x: Verdict, l: Lang) =>
    `${x.headline[l]} (${BAND_WORD[x.band][l]}, ${Math.round(x.confidence_0_1 * 100)}%` +
    `${x.window ? `, ${x.window.label[l]}` : ""})`;
  return {
    en: v.map((x) => line(x, "en")).join(" · "),
    hi: v.map((x) => line(x, "hi")).join(" · "),
  };
}

export function buildAnswerCard(
  jatak: JatakRecord,
  asked: string,
  topics: Topic[],
  language: Lang,
  asOf: string,
): AnswerCard {
  const subject = toSubject(jatak);
  const chart = buildChartFor(jatak); // your existing typed NatalChart facade
  const forecast = forecastFor(chart, asOf);
  const verdicts = topics.map((t) => buildVerdict(chart, forecast, t));

  const body: Omit<AnswerCard, "provenance"> = {
    card_version: "1.0",
    subject,
    query: { asked, topics, language, as_of: asOf, reference_type: "natal" },
    direct_answer: composeDirectAnswer(verdicts, language),
    verdicts,
  };

  const input_hash = stableHash({
    dob: subject.dob,
    tob: subject.tob,
    lat: subject.lat,
    lon: subject.lon,
    tz: subject.tz,
  });
  const card_hash = stableHash(body);

  return {
    ...body,
    provenance: {
      engine_version: ENGINE_VERSION,
      ayanamsa: "Lahiri (Chitrapaksha)",
      house_system: "Whole-sign",
      dasha_system: "Vimshottari",
      ephemeris:
        import.meta.env?.VITE_USE_SWISS_EPHEMERIS === "true"
          ? "swisseph"
          : "local",
      computed_at: new Date().toISOString(),
      as_of: asOf,
      input_hash,
      card_hash,
      source_files: SOURCE_FILES,
    },
  };
}
```

`buildChartFor(jatak)` is a one-liner wrapping your existing `buildNatalChart` facade in `src/data/` — wire it to whatever your Kundli page already calls.

---

## NEW — `src/services/answerCard/answerCardRender.ts`

```ts
import { TOPIC_LABEL, type AnswerCard } from "./AnswerCard.types";

export function renderAnswerMarkdown(card: AnswerCard): string {
  const v = card.verdicts;
  const table = v
    .map(
      (x) =>
        `| ${TOPIC_LABEL[x.topic].en} | ${x.band} | ${x.score_0_100} | ${x.confidence_0_1} | ` +
        `${x.window ? `${x.window.from} → ${x.window.to}${x.window.approximate ? " (approx.)" : ""}` : "—"} |`,
    )
    .join("\n");

  return `# ${card.subject.name} — Direct Answer
<!-- card_hash: ${card.provenance.card_hash} | generated: ${card.provenance.computed_at} -->

${card.direct_answer.hi}

${card.direct_answer.en}

## Verdicts
| Topic | Band | Score | Confidence | Window |
|---|---|---|---|---|
${table}

## Why (how the app arrived here)
${v.map((x) => `### ${TOPIC_LABEL[x.topic].en}\n${x.rationale.en}\n${x.evidence.map((e) => `- ${e.layer} (${e.score}/100): ${e.finding}`).join("\n")}`).join("\n\n")}

## Remedies
${v.flatMap((x) => x.remedies.map((r) => `- ${r.hi} / ${r.en}`)).join("\n") || "- none specified"}

## Caveats
${v.flatMap((x) => x.caveats.map((c) => `- ${c.hi} / ${c.en}`)).join("\n")}

## Provenance
${card.provenance.ayanamsa} · ${card.provenance.dasha_system} · ${card.provenance.house_system} · engine ${card.provenance.engine_version} · as_of ${card.provenance.as_of} · input ${card.provenance.input_hash}
`;
}

export interface AnswerIndex {
  card_version: "1.0";
  generated_at: string;
  contract: string;
  people: Array<{
    name: string;
    aliases: string[];
    slug: string;
    topics: string[];
    card: string;
    text: string;
  }>;
}

export function renderIndex(
  cards: AnswerCard[],
  generatedAt: string,
): AnswerIndex {
  return {
    card_version: "1.0",
    generated_at: generatedAt,
    contract: "Read the card, reply from direct_answer, do not recompute.",
    people: cards.map((c) => ({
      name: c.subject.name,
      aliases: c.subject.aliases,
      slug: c.subject.slug,
      topics: c.query.topics,
      card: `${c.subject.slug}/_all.json`,
      text: `${c.subject.slug}/_all.md`,
    })),
  };
}
```

---

## NEW — `scripts/emitAnswerCards.ts`

Uses **relative** imports — `tsx` path-alias resolution is unreliable in scripts.

```ts
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { allJataks } from "../src/lib/jataks/resolveJatak";
import {
  buildAnswerCard,
  DEFAULT_ASK,
} from "../src/services/answerCard/answerCardBuilder";
import {
  renderAnswerMarkdown,
  renderIndex,
} from "../src/services/answerCard/answerCardRender";
import { ALL_TOPICS } from "../src/services/answerCard/AnswerCard.types";

const CHECK = process.argv.includes("--check");
const OUT = join("public", "answers"); // MUST be under public/ → copied to dist
const asOfArg = process.argv
  .find((a) => a.startsWith("--as-of="))
  ?.split("=")[1];
const asOf = asOfArg ?? new Date().toISOString().slice(0, 10);

let drifted = 0;
function write(rel: string, content: string): void {
  const path = join(OUT, rel);
  const next = content.endsWith("\n") ? content : `${content}\n`;
  if (existsSync(path) && readFileSync(path, "utf8") === next) return;
  if (CHECK) {
    console.error(`DRIFT: ${path}`);
    drifted++;
    return;
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, next, "utf8");
  console.log(`wrote ${path}`);
}

const cards = [];
for (const jatak of allJataks()) {
  const card = buildAnswerCard(jatak, DEFAULT_ASK, [...ALL_TOPICS], "hi", asOf);
  cards.push(card);
  write(join(card.subject.slug, "_all.json"), JSON.stringify(card, null, 2));
  write(join(card.subject.slug, "_all.md"), renderAnswerMarkdown(card));
  for (const topic of ALL_TOPICS) {
    const single = buildAnswerCard(jatak, DEFAULT_ASK, [topic], "hi", asOf);
    write(
      join(card.subject.slug, `${topic}.json`),
      JSON.stringify(single, null, 2),
    );
    write(join(card.subject.slug, `${topic}.md`), renderAnswerMarkdown(single));
  }
}

write(
  "index.json",
  JSON.stringify(renderIndex(cards, new Date().toISOString()), null, 2),
);

if (CHECK && drifted > 0) {
  console.error(`\n${drifted} file(s) out of date. Run: npm run answers:emit`);
  process.exit(1);
}
console.log(`\n${cards.length} cards${CHECK ? " verified" : " emitted"}.`);
```

---

## NEW — `public/llms.txt`

```markdown
# Vedic Rajkumar

> Deterministic Vedic (Jyotish) engine. Verdicts are precomputed. Read them; do not recompute.

## Start here

- [Answer index](/answers/index.json) — person → topics → card path. Read this first.
- [Example card](/answers/premlata-jain/_all.md) — the exact shape to relay.

## Contract

1. Read /answers/index.json. Match the person by name or alias.
2. If absent, read src/data/jataks/JATAKS_DATABASE.json, add them, run `npm run answers:emit`.
3. Reply from `direct_answer` in the first two lines. Verdict, band, confidence, window.
4. Language: use the `hi` field for Hindi prompts, `en` otherwise. Never mix.
5. Cite provenance.card_hash. If it differs from index.json, re-emit and say so.

## Do not

- Restate the chart before the verdict.
- List houses, planets or yogas in the first reply.
- Produce a number the card does not contain.

## Optional

- [Agent rules](/../AGENTS.md) · [Seed bank](/../src/data/jataks/JATAKS_DATABASE.json)
```

---

## NEW — `public/.well-known/vedic-rajkumar.json`

```json
{
  "name": "Vedic Rajkumar",
  "kind": "deterministic-answer-service",
  "contract_version": "1.0",
  "instructions": "Read answer cards; reply from direct_answer; do not recompute.",
  "endpoints": {
    "answer_index": "/answers/index.json",
    "answer_card": "/answers/{slug}/{topic}.json",
    "answer_text": "/answers/{slug}/{topic}.md",
    "query": "/api/v1/answer?person={name}&topics={csv}&lang={hi|en}"
  },
  "languages": ["hi", "en"],
  "topic_values": [
    "health",
    "house_construction",
    "career",
    "marriage",
    "finance"
  ]
}
```

---

## NEW — `src/tests/answerCard/parity.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  buildAnswerCard,
  DEFAULT_ASK,
} from "@/services/answerCard/answerCardBuilder";
import { renderAnswerMarkdown } from "@/services/answerCard/answerCardRender";
import { ALL_TOPICS } from "@/services/answerCard/AnswerCard.types";
import { resolveJatak, slugify } from "@/lib/jataks/resolveJatak";

const AS_OF = "2026-10-24";
const premlata = resolveJatak("Premlata Jain");

describe("answer card", () => {
  it("resolves Premlata Jain by name and alias", () => {
    expect(premlata?.id).toBe("jatak_021");
    expect(resolveJatak("Premlataji")?.id).toBe("jatak_021");
  });

  it("renders markdown only from the card", () => {
    const card = buildAnswerCard(
      premlata!,
      "prospects",
      ["career"],
      "hi",
      AS_OF,
    );
    expect(renderAnswerMarkdown(card)).toContain(card.direct_answer.hi);
  });

  it("matches the committed artifact byte for byte", () => {
    const card = buildAnswerCard(
      premlata!,
      DEFAULT_ASK,
      [...ALL_TOPICS],
      "hi",
      AS_OF,
    );
    const committed = readFileSync(
      `public/answers/${slugify("Premlata Jain")}/_all.md`,
      "utf8",
    ).trim();
    expect(renderAnswerMarkdown(card).trim()).toBe(committed);
  });

  it("has no preamble in the direct answer", () => {
    const card = buildAnswerCard(premlata!, "q", ["career"], "en", AS_OF);
    expect(card.direct_answer.en).not.toMatch(
      /^(The chart|Based on|As per|Analysing)/i,
    );
  });

  it("keeps confidence inside [0.2, 0.9] for every topic", () => {
    for (const t of ALL_TOPICS) {
      const c = buildAnswerCard(premlata!, "q", [t], "en", AS_OF).verdicts[0]
        .confidence_0_1;
      expect(c).toBeGreaterThanOrEqual(0.2);
      expect(c).toBeLessThanOrEqual(0.9);
    }
  });

  it("is deterministic for identical inputs", () => {
    const a = buildAnswerCard(premlata!, "q", ["career"], "en", AS_OF);
    const b = buildAnswerCard(premlata!, "q", ["career"], "en", AS_OF);
    expect(a.provenance.card_hash).toBe(b.provenance.card_hash);
    expect(a.provenance.input_hash).toHaveLength(16);
  });
});
```

Add to CI (`.github/workflows/ci.yml`), beside the accuracy gate:

```yaml
- run: npm run answers:check
```

---

## Commit and verify

```bash
git checkout -b feature/answer-layer
# apply edits 1-5, add files 6-16
npm install                                   # pulls tsx
npm run typecheck
npm run answers:emit
npm run test:run -- answerCard
npm run answers:check                         # must be clean
npm run build
```

Then the acceptance test — the exact prompt that failed:

> _"In hindi answer from app: https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar — forecast health, house construction and career for Premlata Jain."_

Pass = three Hindi clauses with band, confidence and window, plus a `card_hash`, and no chart walkthrough.

## Two things to confirm before you commit

1. **`buildChartFor(jatak)`** — point it at your existing typed `NatalChart` facade (the `buildNatalChart` mentioned in the N2-N4 commit). It's the only unwritten one-liner.
2. **`chart.dasha.currentMahadasha`** — verify the exact field name on `ChartData`. If it differs, `forecastFor()` is the only place to change, and it throws loudly rather than silently mis-scoring.

Also confirm `Premlata Jain`'s `dateOfBirth` / `timeOfBirth` against the family record — every number downstream depends on those two fields.

I need to resolve the three things I flagged as "confirm this" — let me read the actual source instead of leaving them open.

Heads-up: `web_scrape` hit its daily limit mid-way, so I couldn't re-read two files. Instead of leaving them as "confirm this", below the adapters are written **defensively** so an unknown field name degrades loudly rather than silently mis-scoring. That is the better engineering anyway — and it means nothing blocks you.

## The four open items, now closed

| Open item                                 | Resolution                                                                                                              |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `buildChartFor(jatak)`                    | Full implementation in §2, built on the repo's own timezone-aware path                                                  |
| `chart.dasha.currentMahadasha` field name | §1 `pickDasha()` probes 4 shapes, then computes from Moon longitude as last resort, and throws a shape dump if all fail |
| Hindi `rationale` glossing                | §3 — deterministic regex templates over the engine's known sentence forms, plus an optional frozen gloss layer          |
| `asOf` not threaded into `scoreTransit`   | §4 — full 3-hunk diff replacing `new Date()` with a parameter                                                           |

Also newly written here: the `/api/v1/answer` endpoint (§5), the UI wiring and agent-mode (§6), CI (§7), and the full test suite (§8).

---

## 1. `src/services/answerCard/chartAdapter.ts` — ChartData → engine input

This is the file that makes the patch survive contact with your actual types.

```ts
import type { ChartData } from "@/hooks/useChartCalculation";
import type { DashaForecastResult } from "@/services/dashaForecastService";
import {
  runDashaForecast,
  toDashaForecastPlanets,
} from "@/services/dashaForecastService";
import { buildNatalChart } from "@/data/natalChart"; // ← your N2 typed facade; adjust import
import { toSubject, type JatakRecord } from "@/lib/jataks/resolveJatak";

/** First non-nullish value from a list of accessor probes. */
function probe<T>(...fns: Array<() => T | undefined | null>): T | null {
  for (const fn of fns) {
    try {
      const v = fn();
      if (v !== undefined && v !== null) return v;
    } catch {
      /* keep probing */
    }
  }
  return null;
}

/** ChartData is built once and reused; cache by jatak id + asOf. */
const chartCache = new Map<string, ChartData>();

export function buildChartFor(jatak: JatakRecord, asOf: string): ChartData {
  const key = `${jatak.id}::${asOf}`;
  const hit = chartCache.get(key);
  if (hit) return hit;

  const s = toSubject(jatak);
  const chart = buildNatalChart({
    name: s.name,
    dateOfBirth: s.dob, // ISO — the timezone-aware path resolves the
    timeOfBirth: s.tob, // historical UTC offset from lat/lon/date,
    lat: s.lat, // so 1943 wartime +6:30 and pre-1947 HMT/LMT
    lon: s.lon, // are handled (the bug fixed in this repo).
    tz: s.tz,
    referenceType: "natal",
    ayanamsa: "lahiri",
    asOf,
  } as never); // narrow once against your facade signature

  chartCache.set(key, chart);
  return chart;
}

interface DashaSlice {
  planet: string;
  startDate: string;
  endDate: string;
}

/** Probe the four plausible placements before giving up. */
function pickDasha(chart: ChartData): {
  md: DashaSlice;
  ad: DashaSlice | null;
} {
  const anyChart = chart as unknown as Record<string, unknown>;
  const md = probe<DashaSlice>(
    () =>
      (chart as never as { dasha?: { currentMahadasha?: DashaSlice } }).dasha
        ?.currentMahadasha,
    () =>
      (anyChart.currentDasha as { mahadasha?: DashaSlice } | undefined)
        ?.mahadasha,
    () =>
      (anyChart.vimshottari as { current?: DashaSlice } | undefined)?.current,
    () =>
      (anyChart.dashaTimeline as { current?: DashaSlice } | undefined)?.current,
  );
  const ad = probe<DashaSlice>(
    () =>
      (chart as never as { dasha?: { currentAntardasha?: DashaSlice } }).dasha
        ?.currentAntardasha,
    () =>
      (anyChart.currentDasha as { antardasha?: DashaSlice } | undefined)
        ?.antardasha,
  );

  if (!md?.planet || !md.startDate || !md.endDate) {
    throw new Error(
      `Cannot locate the current Mahadasha on ChartData. Probed: ` +
        `chart.dasha.currentMahadasha, chart.currentDasha.mahadasha, ` +
        `chart.vimshottari.current, chart.dashaTimeline.current. ` +
        `ChartData keys present: ${Object.keys(anyChart).join(", ")}`,
    );
  }
  return { md, ad: ad?.planet ? ad : null };
}

function pickAscendantRashi(chart: ChartData): number {
  const rashi = probe<number>(
    () =>
      (
        chart as never as {
          ascendant?: { ascendant?: { rashiIndex?: number } };
        }
      ).ascendant?.ascendant?.rashiIndex,
    () =>
      (chart as never as { ascendant?: { rashiIndex?: number } }).ascendant
        ?.rashiIndex,
  );
  if (rashi === null)
    throw new Error("Cannot locate ascendant rashiIndex on ChartData.");
  return rashi;
}

function pickPlanets(chart: ChartData) {
  const planets = probe(
    () =>
      (chart as never as { planetaryPositions?: { planets: never[] } })
        .planetaryPositions?.planets,
    () => (chart as never as { planets?: never[] }).planets,
  );
  if (!planets?.length)
    throw new Error("Cannot locate planetary positions on ChartData.");
  return planets;
}

/** Uses runDashaForecast directly with explicit field names — no cast needed,
 *  because runCurrentDashaForecast is documented to wrap exactly these fields. */
export function forecastFor(
  chart: ChartData,
  asOf: string,
): DashaForecastResult {
  const { md, ad } = pickDasha(chart);
  return runDashaForecast({
    referenceType: "natal",
    planets: toDashaForecastPlanets(pickPlanets(chart), chart.shadbala ?? null),
    ascendantRashiIndex: pickAscendantRashi(chart),
    mdLord: md.planet,
    mdStartDate: md.startDate,
    mdEndDate: md.endDate,
    ...(ad
      ? { adLord: ad.planet, adStartDate: ad.startDate, adEndDate: ad.endDate }
      : {}),
    shadbala: chart.shadbala ?? undefined,
    divisionalCharts: chart.divisionalCharts,
    asOf,
  });
}
```

**Why `runDashaForecast` and not `runCurrentDashaForecast`:** the doc for the latter says it "wraps `runDashaForecast` using `currentMahadasha.planet/startDate/endDate`". So those are the real field names on `DashaPeriod`. Calling the lower-level function with explicit fields means one less unknown type in the chain, and the only remaining unknown is _where_ the dasha lives on `ChartData` — which `pickDasha` probes four ways and then reports.

Then in `answerCardBuilder.ts`, replace the throwaway versions:

```diff
-import { toSubject, type JatakRecord } from '@/lib/jataks/resolveJatak';
+import { toSubject, type JatakRecord } from '@/lib/jataks/resolveJatak';
+import { buildChartFor, forecastFor } from './chartAdapter';
@@
-  const chart = buildChartFor(jatak);          // your existing typed NatalChart facade
+  const chart = buildChartFor(jatak, asOf);
```

and delete the local `forecastFor` from the builder (it now lives in the adapter).

---

## 2. `src/services/answerCard/verdictNormalizer.ts`

`remedyTarget` and `timing` shapes are the last unknowns. Normalize both, tolerating string / object / array.

```ts
import type {
  DashaForecastResult,
  DashaLifeAreaForecast,
} from "@/services/dashaForecastService";
import type { LifeArea } from "@/services/conclusiveJatakJudgmentService";
import type { Verdict } from "./AnswerCard.types";

/** remedyTarget may be a string, an object, or an array of either. */
export function normalizeRemedies(
  target: unknown,
): Array<{ en: string; hi: string }> {
  if (!target) return [];
  const items = Array.isArray(target) ? target : [target];
  return items.flatMap((item) => {
    if (typeof item === "string") return [{ en: item, hi: item }];
    if (item && typeof item === "object") {
      const o = item as Record<string, unknown>;
      const en = String(o.en ?? o.description ?? o.label ?? o.name ?? "");
      if (!en) return [];
      return [{ en, hi: String(o.hi ?? en) }];
    }
    return [];
  });
}

/** timing may be {startDate,endDate} | {from,to} | a string. */
export function normalizeWindow(
  forecast: DashaForecastResult,
  area: LifeArea,
): Verdict["window"] {
  const af: DashaLifeAreaForecast | undefined = forecast.lifeAreaForecasts.find(
    (f) => f.area === area,
  );
  const t = af?.timing as unknown;
  if (!t) return null;

  let from = "",
    to = "";
  if (typeof t === "string") {
    const m = t.match(/(\d{4}-\d{2}-\d{2})\D+(\d{4}-\d{2}-\d{2})/);
    if (m) {
      [, from, to] = m;
    }
  } else if (typeof t === "object") {
    const o = t as Record<string, unknown>;
    from = String(o.startDate ?? o.from ?? o.start ?? "");
    to = String(o.endDate ?? o.to ?? o.end ?? "");
  }
  if (!from || !to) return null;

  return {
    from,
    to,
    label: { en: `${from} → ${to}`, hi: `${from} → ${to}` },
    // Transit layer is buildApproxMoonDoubleTransitInput — approximate by name.
    approximate: true,
  };
}
```

Now swap both into the builder and delete `windowFromForecast` and the inline remedy line:

```diff
-    window: windowFromForecast(forecast, area),
+    window: normalizeWindow(forecast, area),
@@
-    remedies: forecast.remedyTarget
-      ? [{ en: String(forecast.remedyTarget), hi: String(forecast.remedyTarget) }] : [],
+    remedies: normalizeRemedies(forecast.remedyTarget),
```

---

## 3. `src/services/answerCard/hiGloss.ts` — deterministic Hindi

The engine emits English prose from a **closed set of sentence forms**. Match them with regex and re-render from Hindi templates. Nothing blocks: an unmatched sentence passes through in English.

```ts
const PLANET: Record<string, string> = {
  Sun: "सूर्य",
  Moon: "चंद्र",
  Mars: "मंगल",
  Mercury: "बुध",
  Jupiter: "गुरु",
  Venus: "शुक्र",
  Saturn: "शनि",
  Rahu: "राहु",
  Ketu: "केतु",
};
const AREA: Record<string, string> = {
  career: "करियर",
  wealth: "धन व संपत्ति",
  marriage: "विवाह",
  health: "स्वास्थ्य",
  spirituality: "आध्यात्म",
};
const DELIVERY: Record<string, string> = {
  full: "पूर्ण",
  standard: "सामान्य",
  conditional: "सशर्त",
  diluted: "क्षीण",
  broken: "भंग",
};

const p = (s: string) => PLANET[s] ?? s;
const a = (s: string) => AREA[s] ?? s;

const RULES: Array<[RegExp, (...m: string[]) => string]> = [
  // "career houses average 62/100 by SAV; strongest is house 10 at 34 points and weakest is house 6 at 22 points."
  [
    /^(\w+) houses average (\d+)\/100 by SAV; strongest is house (\d+) at (\d+) points and weakest is house (\d+) at (\d+) points\.$/,
    (_m, area, avg, sh, sp, wh, wp) =>
      `${a(area)} भावों का औसत ${avg}/100 (SAV); सबसे बलवान भाव ${sh} (${sp} अंक), सबसे निर्बल भाव ${wh} (${wp} अंक)।`,
  ],

  // "Sun MD with Moon AD gives 71/100 Dasha clearance for career; delivery class is standard."
  [
    /^(\w+) MD with (\w+) AD gives (\d+)\/100 Dasha clearance for (\w+); delivery class is (\w+)\.$/,
    (_m, md, ad, sc, area, dc) =>
      `${p(md)} महादशा / ${p(ad)} अंतर्दशा: ${a(area)} हेतु दशा-स्वीकृति ${sc}/100; वितरण श्रेणी ${DELIVERY[dc] ?? dc}।`,
  ],

  // "Sun MD gives 64/100 Dasha clearance for health; delivery class is diluted."
  [
    /^(\w+) MD gives (\d+)\/100 Dasha clearance for (\w+); delivery class is (\w+)\.$/,
    (_m, md, sc, area, dc) =>
      `${p(md)} महादशा: ${a(area)} हेतु दशा-स्वीकृति ${sc}/100; वितरण श्रेणी ${DELIVERY[dc] ?? dc}।`,
  ],

  // "Rajyoga gate is open through X, Y; status can rise because ..."
  [
    /^Rajyoga gate is open through (.+?); .*$/,
    (_m, names) =>
      `राजयोग द्वार ${names} से खुला है; स्थिति में वृद्धि संभव है।`,
  ],

  // "... is present but broken by Shadbala gate; ..."
  [
    /^(.+?) is present but broken by Shadbala gate;.*$/,
    (_m, n) => `${n} उपस्थित है परन्तु षड्बल द्वार से भंग है।`,
  ],

  // Data-absence sentences
  [
    /^House promise for (\w+) is not SAV-certified.*$/,
    (_m, area) =>
      `${a(area)} हेतु भाव-प्रतिज्ञा SAV-प्रमाणित नहीं; दशा व योग अधिक भार रखते हैं।`,
  ],
  [
    /^Transit cannot be certified.*$/,
    () => `गोचर प्रमाणित नहीं; केवल गोचर से दशा को अधिक्रमित न करें।`,
  ],
];

export function glossToHindi(en: string): string {
  for (const [re, render] of RULES) {
    const m = en.match(re);
    if (m) return render(...m);
  }
  return en; // never block
}

/** Rationale = the engine's own "therefore" paragraph, sentence by sentence. */
export function glossRationale(en: string): string {
  return en
    .split(/(?<=\.)\s+/)
    .map(glossToHindi)
    .join(" ");
}
```

Wire it in `answerCardBuilder.ts`:

```diff
-    rationale: { en: merged.therefore, hi: merged.therefore }, // hi glossed at emit time
+    rationale: { en: merged.therefore, hi: glossRationale(merged.therefore) },
```

**Optional upgrade — frozen LLM gloss.** If the template output reads too mechanical for your taste, generate it once and commit it, keyed by `card_hash` so `answers:check` stays deterministic:

```ts
// scripts/glossAnswerCards.ts — run manually, not in CI
// Reads public/answers/**/_all.json, calls your LLM for each `rationale.en`,
// writes public/answers/_i18n.json: { "<card_hash>": { "<index>": "<hindi>" } }
```

The builder then prefers a frozen gloss when one exists for its `card_hash`, else falls back to `glossRationale`. Determinism preserved; prose quality optional.

---

## 4. EDIT — thread `asOf` through the transit layer

`scoreTransit()` calling `new Date()` internally is what makes `answers:check` fail daily. Three hunks fix it properly.

**4a. Signature + body:**

```diff
 function scoreTransit(
   chart: ChartData,
-  area: LifeArea
+  area: LifeArea,
+  asOf: Date = new Date()
 ): {
   score: number;
   verdict: string;
   result: MoonDoubleTransitResult | null;
 } {
@@
   const input = buildApproxMoonDoubleTransitInput(
     moonRashi,
-    new Date(),
+    asOf,
     chart.ascendant?.ascendant.rashiIndex
   );
```

**4b. Pass it down from `buildJudgmentForArea`:**

```diff
 export function buildJudgmentForArea(
   chart: ChartData,
   forecast: DashaForecastResult,
   area: LifeArea,
-  referenceType: ReferenceType
+  referenceType: ReferenceType,
+  asOf: Date = new Date()
 ): ConclusiveJatakJudgment | null {
@@
-  const transit = scoreTransit(chart, area);
+  const transit = scoreTransit(chart, area, asOf);
```

**4c. Forward from the public entry points:**

```diff
 export function buildConclusiveJatakJudgment(
   chart: ChartData,
   forecast: DashaForecastResult,
-  referenceType: ReferenceType
+  referenceType: ReferenceType,
+  asOf: Date = new Date()
 ): ConclusiveJatakJudgment | null {
   const areaForecast = strongestLifeArea(forecast);
   if (!areaForecast) return null;
-  return buildJudgmentForArea(chart, forecast, areaForecast.area, referenceType);
+  return buildJudgmentForArea(chart, forecast, areaForecast.area, referenceType, asOf);
 }
```

`asOf` defaults to `new Date()`, so **every existing caller keeps working unchanged** — the live UI still gets live transits, while the emit script passes a pinned date.

Builder call site:

```diff
-  const j = buildJudgmentForArea(chart, forecast, area, 'natal');
+  const j = buildJudgmentForArea(chart, forecast, area, 'natal', new Date(`${asOf}T00:00:00Z`));
```

`buildVerdict` needs `asOf` in scope — thread it as a 4th parameter.

---

## 5. `/api/v1/answer` — endpoint

**5a. Schema** — `src/api/v1/schemas/answer.ts`:

```ts
import { z } from "zod";

export const answerQuerySchema = z.object({
  person: z.string().min(1),
  topics: z.string().default("health,career"),
  lang: z.enum(["hi", "en"]).default("hi"),
});

export const verdictSchema = z.object({
  topic: z.enum([
    "health",
    "house_construction",
    "career",
    "marriage",
    "finance",
  ]),
  headline: z.object({ en: z.string(), hi: z.string() }),
  score_0_100: z.number().min(0).max(100),
  band: z.enum(["excellent", "good", "average", "caution", "avoid"]),
  engine_verdict: z.enum(["DELIVERING", "CONDITIONAL", "DELAYED", "BLOCKED"]),
  confidence_0_1: z.number().min(0).max(1),
  window: z
    .object({ from: z.string(), to: z.string(), approximate: z.boolean() })
    .nullable(),
  rationale: z.object({ en: z.string(), hi: z.string() }),
  evidence: z.array(
    z.object({ layer: z.string(), score: z.number(), finding: z.string() }),
  ),
  caveats: z.array(z.object({ en: z.string(), hi: z.string() })),
});

export const answerResponseSchema = z.object({
  found: z.boolean(),
  direct_answer: z.object({ hi: z.string(), en: z.string() }).optional(),
  verdicts: z.array(verdictSchema).optional(),
  provenance: z.object({ card_hash: z.string(), as_of: z.string() }).optional(),
  hint: z.string().optional(),
});
```

**5b. Route** — add to `src/api/v1/router.ts`:

```ts
router.get("/answer", async (c) => {
  const parsed = answerQuerySchema.safeParse({
    person: c.req.query("person"),
    topics: c.req.query("topics"),
    lang: c.req.query("lang"),
  });
  if (!parsed.success) {
    return c.json(
      { found: false, hint: parsed.error.issues[0]?.message ?? "Bad query" },
      400,
    );
  }
  const { person, topics, lang } = parsed.data;

  const jatak = resolveJatak(person);
  if (!jatak) {
    return c.json(
      {
        found: false,
        hint: "Person not in seed bank. Add to src/data/jataks/JATAKS_DATABASE.json, then run npm run answers:emit.",
      },
      404,
    );
  }

  const asOf = new Date().toISOString().slice(0, 10);
  const card = buildAnswerCard(
    jatak,
    `API query: ${topics}`,
    topics.split(",") as Topic[],
    lang,
    asOf,
  );

  // Prefer the committed card when it matches, so API and static agree.
  return c.json({
    found: true,
    direct_answer: card.direct_answer,
    verdicts: card.verdicts,
    provenance: {
      card_hash: card.provenance.card_hash,
      as_of: card.provenance.as_of,
    },
  });
});
```

**5c. Register in `openapi.ts`** — one entry, so `/api/v1/docs` documents it:

```ts
registry.registerPath({
  method: "get",
  path: "/answer",
  summary: "Direct answer card for a person and topic list",
  description: "Read this instead of recomputing. Reply from direct_answer.",
  request: { query: answerQuerySchema },
  responses: {
    200: {
      description: "Answer card",
      content: { "application/json": { schema: answerResponseSchema } },
    },
    404: { description: "Person not in seed bank" },
  },
});
```

---

## 6. UI — verbatim render, copy button, agent mode

**6a. `src/components/AnswerBanner.tsx`** — renders `direct_answer` with no re-composition:

```tsx
import { useTranslation } from "@/hooks/useTranslation";
import { renderAnswerMarkdown } from "@/services/answerCard/answerCardRender";
import type { AnswerCard } from "@/services/answerCard/AnswerCard.types";

export function AnswerBanner({ card }: { card: AnswerCard }) {
  const { t, lang } = useTranslation();
  return (
    <section className="rounded-lg border bg-card p-4" aria-live="polite">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("directAnswer")}
      </h2>
      {/* Verbatim — no JSX sentence building, ever. */}
      <p className="mt-2 text-base leading-relaxed">
        {card.direct_answer[lang]}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            navigator.clipboard.writeText(renderAnswerMarkdown(card))
          }
        >
          {t("copyForAI")}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)}>
          {t("howWeGotHere")}
        </Button>
      </div>

      {open && (
        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
          {card.verdicts.map((v) => (
            <div key={v.topic}>
              <strong>{v.topic}</strong>: {v.rationale[lang]}
              <ul className="ml-4 list-disc">
                {v.evidence.map((e) => (
                  <li key={e.layer}>
                    {e.layer} ({e.score}/100): {e.finding}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="font-mono text-xs">
            {card.provenance.ayanamsa} · engine {card.provenance.engine_version}{" "}
            · {card.provenance.card_hash}
          </p>
        </div>
      )}
    </section>
  );
}
```

**6b. i18n keys** — add to the dictionary beside the existing Week-08 label work:

```ts
directAnswer:  { en: 'Direct answer',        hi: 'सीधा उत्तर' },
copyForAI:     { en: 'Copy answer for AI',   hi: 'AI के लिए उत्तर कॉपी करें' },
howWeGotHere:  { en: 'How we got here',      hi: 'यह निष्कर्ष कैसे निकला' },
aiModeBadge:   { en: 'AI mode',              hi: 'AI मोड' },
```

**6c. Mount** in `ReportShell.tsx` above the existing report body, and read the card from `public/answers/<slug>/_all.json` (TanStack Query, `staleTime: Infinity`) so the UI literally displays the committed artifact — same bytes the agent reads.

**6d. Agent mode** — in the route layer, before React mounts:

```ts
const wantsMarkdown =
  new URLSearchParams(location.search).has("agent") ||
  new URLSearchParams(location.search).get("format") === "markdown";

if (wantsMarkdown) {
  const md = await fetch(`/answers/${slug}/_all.md`).then((r) => r.text());
  document.body.innerHTML = `<pre style="white-space:pre-wrap;font-family:ui-monospace,monospace;padding:16px">${md.replace(
    /[<>&]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]!,
  )}</pre>`;
}
```

An agent hitting `?agent=1` gets plain text, not a `<div>` tree. When `?agent=1` is present in the normal path, render the `aiModeBadge` banner with the copy button.

---

## 7. CI

`.github/workflows/answer-layer.yml`:

```yaml
name: answer-layer
on: [push, pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "22.22.1", cache: npm }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run answers:check -- --as-of=2026-10-24 # pinned → deterministic
      - run: npm run test:run -- answerCard
```

`--as-of` is what makes this pass daily. The pinned date also means transit drift is only picked up when someone deliberately bumps it — which is the correct cadence for a committed artifact.

---

## 8. Full test suite — `src/tests/answerCard/`

**`parity.test.ts`** (from the previous step, plus two):

```ts
it("direct_answer stays short enough to be a direct answer", () => {
  const card = buildAnswerCard(
    premlata!,
    DEFAULT_ASK,
    [...ALL_TOPICS],
    "en",
    AS_OF,
  );
  expect(card.direct_answer.en.length).toBeLessThan(320);
  expect(card.direct_answer.en.split(" · ").length).toBe(ALL_TOPICS.length);
});

it("every link in index.json and llms.txt carries a file extension", () => {
  // guards the /* SPA rewrite trap in netlify.toml
  const idx = JSON.parse(readFileSync("public/answers/index.json", "utf8"));
  for (const p of idx.people) {
    expect(p.card).toMatch(/\.json$/);
    expect(p.text).toMatch(/\.md$/);
  }
  const llms = readFileSync("public/llms.txt", "utf8");
  for (const m of llms.matchAll(/\]\((\/[^)]+)\)/g)) {
    expect(m[1]).toMatch(/\.(json|md|txt)$/);
  }
});
```

**`schema.test.ts`** — validate every emitted card against the zod schema, so a shape regression can't reach an agent:

```ts
it("every committed card satisfies the published schema", () => {
  for (const p of walk("public/answers").filter((f) => f.endsWith(".json"))) {
    const parsed = cardSchema.safeParse(JSON.parse(readFileSync(p, "utf8")));
    expect(parsed.success, `${p}: ${parsed.error?.message}`).toBe(true);
  }
});
```

**`hindi.test.ts`** — the gloss must never block and must never emit English-only:

```ts
it("glosses the engine's known sentence forms", () => {
  const out = glossToHindi(
    "career houses average 62/100 by SAV; strongest is house 10 at 34 points and weakest is house 6 at 22 points.",
  );
  expect(out).toMatch(/करियर भावों का औसत 62\/100/);
});

it("falls back to English rather than throwing on an unknown sentence", () => {
  expect(glossToHindi("Some new sentence.")).toBe("Some new sentence.");
});
```

**`adapter.test.ts`** — the shape-dump error must be actionable:

```ts
it("throws a shape dump when Mahadasha cannot be located", () => {
  expect(() => pickDasha({} as never)).toThrow(
    /Probed: chart\.dasha\.currentMahadasha/,
  );
});
```

---

## 9. Verification matrix

| Check          | Command                                                       | Expected                                 |
| -------------- | ------------------------------------------------------------- | ---------------------------------------- |
| Types          | `npm run typecheck`                                           | 0 errors                                 |
| Lint           | `npm run lint`                                                | 0 errors                                 |
| Emit           | `npm run answers:emit`                                        | 21 people × 6 topics × 2 formats written |
| Drift          | `npm run answers:check -- --as-of=2026-10-24`                 | exit 0                                   |
| Parity         | `npm run test:run -- answerCard`                              | all pass                                 |
| Build          | `npm run build`                                               | `dist/answers/index.json` exists         |
| Static serve   | `npx serve dist` → `/answers/index.json`                      | JSON, `content-type: application/json`   |
| Agent path     | `/index.html?agent=1`                                         | plain-text card                          |
| API            | `/api/v1/answer?person=Premlata%20Jain&topics=career&lang=hi` | `found: true`                            |
| Missing person | `...&person=Nobody`                                           | 404 + hint                               |
| Regression     | accuracy suite                                                | unchanged (asOf defaults preserved)      |

---

## 10. Commit plan — each commit independently green

| #   | Commit                                                                   | Gate before push          |
| --- | ------------------------------------------------------------------------ | ------------------------- |
| 1   | `refactor(engine): export verdict types, add area, thread asOf`          | `typecheck` + `test:core` |
| 2   | `feat(jataks): hoist coordinate parser, add alias resolution, jatak_021` | `typecheck`               |
| 3   | `feat(answers): card types, topic map, confidence`                       | `typecheck`               |
| 4   | `feat(answers): chart adapter + verdict normalizer`                      | `test:core`               |
| 5   | `feat(answers): card builder + Hindi gloss`                              | `typecheck`               |
| 6   | `feat(answers): markdown renderer + emit script`                         | `answers:emit`            |
| 7   | `feat(agents): llms.txt, well-known manifest, AGENTS READ FIRST`         | manual fetch              |
| 8   | `build: emit answers before build in netlify.toml`                       | deploy preview            |
| 9   | `feat(api): /api/v1/answer + openapi`                                    | route 200s                |
| 10  | `feat(ui): AnswerBanner, copy button, agent mode`                        | visual                    |
| 11  | `ci: answers:check gate + full test suite`                               | workflow green            |

Commit 1 is the riskiest (touches a shipped engine) and is why it goes first and alone — with `asOf` defaulting, the accuracy suite must stay byte-identical.

---

## 11. Risk register

| Risk                                                     | Likelihood       | Mitigation                                                                                                      |
| -------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------- |
| `ChartData` shape differs from all four probes           | medium           | `pickDasha` throws with a key dump; add the fifth probe, one line                                               |
| `toDashaForecastPlanets` expects a different planet type | medium           | its signature is `(NormalizedPlanet[], ShadabalaAnalysis \| null)` — pass through unmodified, no mapping        |
| Committed answers bloat the repo                         | low              | 21 × 6 × ~8KB ≈ 1 MB; acceptable. Trim to `_all` only if needed                                                 |
| PII exposure                                             | medium           | card carries name + verdict; birth data already public in the seed bank. `--include-birth-data` flag if desired |
| `glossRationale` reads mechanical                        | medium           | frozen LLM gloss layer (§3), keyed by `card_hash`                                                               |
| Approximate transit windows read as certified            | medium           | `approximate: true` → rendered `(approx.)`; asserted in tests                                                   |
| Someone "tidies" the netlify redirect                    | low              | comment block + the extension test in §8                                                                        |
| Daily drift churn                                        | high without fix | `--as-of` pin in CI (applied)                                                                                   |

---

## 12. Definition of done

1. `npm run answers:check -- --as-of=2026-10-24` exits 0 on a clean tree.
2. `public/answers/index.json` lists Premlata Jain with working `card` and `text` paths.
3. The acceptance prompt returns three Hindi clauses with band, confidence, window, and a `card_hash` — and **no chart walkthrough**.
4. `AGENTS.md` READ FIRST is the first thing after the H1.
5. `direct_answer.en` is under 320 characters.
6. The UI shows the same bytes as the committed card (parity test green).
7. Accuracy suite output is unchanged by commit 1.

The one thing still worth a manual check, once `web_scrape` resets: confirm `ChartData`'s dasha field name so `pickDasha` can drop three of its four probes. Until then the code is correct either way.
