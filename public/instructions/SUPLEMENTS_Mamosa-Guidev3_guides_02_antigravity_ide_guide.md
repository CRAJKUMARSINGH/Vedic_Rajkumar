# Antigravity IDE — Implementation Guide
## Vedic Rajkumar: Enterprise Upgrade Specification

> **Who this is for:** You, working in Antigravity IDE on the real repo at  
> `https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar`
>
> **What this does:** Gives Antigravity IDE complete context about the existing codebase,
> the approved CLI generalisation plan, the 13-layer engine, and every queued enterprise
> upgrade — so every suggestion it makes is grounded in the actual code, not assumptions.

---

## 1. Codebase Orientation (paste this into Antigravity on first open)

```
You are working on Vedic Rajkumar — a production Vedic astrology SaaS.

REPO: https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar
LIVE: https://vedic-rajkumar.vercel.app

STACK:
- Frontend: React 19.2 + Vite 5 + TypeScript (src/)
- UI: Radix UI + shadcn/ui (src/components/ui/), Framer Motion 12
- State: TanStack Query v5 (@tanstack/react-query)
- Auth: Clerk (@clerk/react ^6.6.3) — ClerkProvider in src/App.tsx
- DB: Supabase PostgreSQL (@supabase/supabase-js ^2.97.0)
- API: Express serverless function at api/index.mjs (Vercel function)
- Ephemeris: astronomia ^4.2.0 (current); swisseph-wasm ^0.0.5 (installed, disabled)
- PDF: jsPDF + jspdf-autotable
- Tests: Vitest (unit), Playwright (e2e — playwright.config.ts)
- Linting: Husky pre-commit + pre-push hooks

ENTRY POINTS:
- src/App.tsx — router, all 40+ lazy-loaded routes, ClerkProvider wrapper
- api/index.mjs — Express serverless, Clerk middleware, Supabase client
- src/services/swissEphemerisService.ts — Swiss Ephemeris wrapper (feature-flagged)

KEY FEATURE FLAG:
- VITE_USE_SWISS_EPHEMERIS=false → set to true after Week 28-30 validation
- VITE_USE_CALC_WORKER=true → Web Worker for calc already enabled

CORE ENGINE:
- KNOWLEDGE_BASE/INTERPRETATION_ENGINE_v2.1.md — the 13-layer convergence engine spec
- Every reading resolves to a verdict. Never hedges. Always ends with "Therefore:"
- Architectural law: if D1 natal chart does not promise an event, NO yoga/transit/Dasha
  can manufacture it. The radix is the seed.

DO NOT:
- Touch jataks/ PDF files (read-only family chart archive)
- Enable VITE_USE_SWISS_EPHEMERIS=true until accuracy regression tests pass
- Remove the Clerk auth middleware from api/index.mjs
- Add hardcoded birth data for any specific person to new features
```

---

## 2. Approved Task: Generalise the CLI Forecast Tool

### What exists now (hardcoded — must be replaced)

The current `forecast_avani.ts` (or equivalent hardcoded script) targets a specific person's
birth data. This is the approved architectural decision: **delete it, replace with `forecast.ts`**.

### New file to create: `src/cli/forecast.ts`

```typescript
/**
 * forecast.ts — Generalised 13-layer Vedic forecast CLI tool
 *
 * Usage:
 *   npx tsx src/cli/forecast.ts \
 *     --name "Premlata" \
 *     --dob "1947-09-05" \
 *     --tob "05:00" \
 *     --lat 23.55 \
 *     --lng 74.08 \
 *     --question "What is the career outlook for next 2 years?"
 *
 * All parameters required. No hardcoded defaults for any person.
 */

import { parseArgs } from 'node:util';
import { runInterpretationEngine } from '../services/interpretationEngine';
import { calculateBirthChart } from '../services/ephemerisService';

interface ForecastInput {
  name: string;
  dob: string;       // ISO date: YYYY-MM-DD
  tob: string;       // 24h time: HH:MM
  lat: number;       // Decimal degrees
  lng: number;       // Decimal degrees
  question: string;  // The subscriber's query
}

async function main() {
  const { values } = parseArgs({
    options: {
      name:     { type: 'string' },
      dob:      { type: 'string' },
      tob:      { type: 'string' },
      lat:      { type: 'string' },
      lng:      { type: 'string' },
      question: { type: 'string' },
    }
  });

  // Validate — reject if any field missing (no silent defaults)
  const required = ['name', 'dob', 'tob', 'lat', 'lng', 'question'] as const;
  for (const field of required) {
    if (!values[field]) {
      console.error(`Missing required argument: --${field}`);
      process.exit(1);
    }
  }

  const input: ForecastInput = {
    name:     values.name!,
    dob:      values.dob!,
    tob:      values.tob!,
    lat:      parseFloat(values.lat!),
    lng:      parseFloat(values.lng!),
    question: values.question!,
  };

  console.log(`\n=== VEDIC RAJKUMAR — 13-Layer Forecast Engine ===`);
  console.log(`Subject: ${input.name}`);
  console.log(`Birth: ${input.dob} ${input.tob} | Lat ${input.lat}, Lng ${input.lng}`);
  console.log(`Question: "${input.question}"\n`);

  // Step 1: Calculate birth chart via ephemeris service
  const chart = await calculateBirthChart({
    dob: input.dob,
    tob: input.tob,
    lat: input.lat,
    lng: input.lng,
  });

  // Step 2: Route through 13-layer engine
  const verdict = await runInterpretationEngine({
    name: input.name,
    chart,
    question: input.question,
  });

  // Step 3: Print verdict — must include "Therefore:" clause
  console.log('=== VERDICT ===');
  console.log(verdict.output);
  console.log('\n=== REMEDY STACK ===');
  verdict.remedies.forEach((r, i) => console.log(`Layer ${i + 1}: ${r}`));
}

main().catch(console.error);
```

### Add to `package.json` scripts:
```json
"forecast": "npx tsx src/cli/forecast.ts"
```

### Usage after implementation:
```bash
# Any subscriber's chart — no person-specific code
npm run forecast -- \
  --name "Premlata" \
  --dob "1947-09-05" \
  --tob "05:00" \
  --lat 23.55 \
  --lng 74.08 \
  --question "What remedies are needed for health improvement?"
```

---

## 3. The 13-Layer Engine — Implementation Contract

The engine in `KNOWLEDGE_BASE/INTERPRETATION_ENGINE_v2.1.md` defines the mandatory processing
order. When Antigravity helps you implement `runInterpretationEngine()`, enforce this:

```typescript
// src/services/interpretationEngine.ts

interface EngineInput {
  name: string;
  chart: BirthChart;
  question: string;
}

interface EngineOutput {
  output: string;      // Must contain "Therefore:" clause
  remedies: string[];  // Six-Layer Remedy Stack
  confidence: number;  // 0–100 Virgin World Fame score if fame query
  layers: LayerResult[]; // Audit trail — one entry per layer
}

async function runInterpretationEngine(input: EngineInput): Promise<EngineOutput> {
  // LAYER 0  — Fame filter (score before any output)
  // LAYER 1  — Five-Layer Convergence: D1 natal promise check
  // LAYER 2  — Shadbala scoring for all yoga-forming planets
  // LAYER 3  — Yoga status: ACTIVE / EMERGING / LATENT / BROKEN
  // LAYER 4  — D1 vs Divisional conflict → one resolved verdict
  // LAYER 5  — Aspect weights (Parashari + Jaimini)
  // LAYER 6  — All predictions tagged [Level 1–5: Dasha details]
  // LAYER 7  — Double Transit check (Jupiter + Saturn)
  // LAYER 8  — Arudha Lagna: AL, UL, A10, A4
  // LAYER 9  — Every conflict → "Therefore:" clause
  // LAYER 10 — Failure Mode: probabilities + weakest planet
  // LAYER 11 — Psychological Profile Object
  // LAYER 12 — Six-Layer Remedy Stack (diagnostic, not generic)
  // LAYER 13 — Fame verdict if applicable

  // RULE: if Layer 1 finds no natal promise → stop, output "D1 does not support this event."
  // RULE: Layer 9 must produce at least one "Therefore:" statement in final output.
  // RULE: Layer 12 remedies must be planet-specific, not generic.
}
```

---

## 4. Priority Queue for Antigravity — Ordered by Impact

Work through these in order. Each item has the exact file(s) to touch.

### P0-A: Generalise MTSS Panel (Marriage Timing & Spouse)

**Problem:** `src/components/MTSSPanel.tsx` — hardcoded birth data for Kanchi.  
**Fix:** Replace hardcoded birth constant with `<EnhancedBirthInputForm>` component.

```
Files to edit:
  src/components/MTSSPanel.tsx
  → Remove any hardcoded KANCHI_BIRTH or similar constants at the top of the file
  → Import EnhancedBirthInputForm from src/components/EnhancedBirthInputForm.tsx
  → Add state: const [birthInput, setBirthInput] = useState<BirthInput | null>(null)
  → Render <EnhancedBirthInputForm onSubmit={setBirthInput} /> when birthInput is null
  → Run all calculations using birthInput instead of hardcoded values
  → Add bilingual labels: "विवाह काल / Marriage Timing", "उपाय / Remedies"
```

### P0-B: Create `forecast.ts` CLI Tool

See Section 2 above. This is the approved plan. Implement it.

### P0-C: Swiss Ephemeris Accuracy Validation (Week 28–30)

**File:** `src/services/swissEphemerisService.ts` (already exists)  
**Flag:** `VITE_USE_SWISS_EPHEMERIS` in `.env`  
**Action:**

```
1. Run calcPlanetsAccurate() against all 16 jataks in jataks/JATAKS_DATABASE.json
2. Compare output against reports/app_values_summary.md (real verified positions)
3. Tolerance targets (from ADR-002):
   - Sun: ±0.001°
   - Moon: ±0.001°
   - Ascendant: ±0.01°
   - Ayanamsa: ±0.001°
4. If all 16 jataks pass → set VITE_USE_SWISS_EPHEMERIS=true in .env and Vercel dashboard
5. Add regression test in tests/ that runs on every commit via Husky
```

### P1-A: GitHub Actions CI/CD

**Create:** `.github/workflows/ci.yml`

```yaml
name: CI
on: [push, pull_request]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

### P1-B: Supabase Row Level Security Audit

**File to check:** `api/index.mjs`  
**Action:** Verify every Supabase table has RLS policies that scope data to `auth.uid()`.  
Open Supabase dashboard → Table Editor → each table → RLS tab.  
Tables that need RLS: `saved_readings`, `user_profiles`, `birth_profiles`, `subscriptions`.

### P1-C: Port Saved Readings API

**Source:** `Vedic_Rajkumar-V01/api/` (separate branch/folder referenced in implementation queue item 14)  
**Target:** `api/index.mjs` — add `/api/readings` endpoints  
**Schema needed:**
```sql
CREATE TABLE saved_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,           -- Clerk user ID
  subject_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  birth_time TIME NOT NULL,
  birth_lat FLOAT NOT NULL,
  birth_lng FLOAT NOT NULL,
  question TEXT,
  verdict TEXT,
  layer_results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE saved_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_own" ON saved_readings
  USING (user_id = auth.jwt() ->> 'sub');
```

### P2-A: Ebook Knowledge Base Ingestion

**Queued ebooks (from implementation_queue.md items 7–13, 19–22):**
- `ATTACHED_ASSETS/ebharati-pdf-1621000298Prasnatantra-Raman-B-V.pdf` — Prasnatantra (Raman)
- `data/astrology-library/` — Mathematical Longevity, CIJ01-03, Chara Dasha, Lal Kitab series

**Approach:** Extract text → chunk by chapter → embed into Supabase `pgvector` table →
query via similarity search during Layer 1 (natal promise check) and Layer 12 (remedies).

---

## 5. File Map — Where Everything Lives

```
src/
├── App.tsx                          ← Router + all routes + ClerkProvider
├── pages/                           ← 40+ page components (all lazy-loaded)
├── components/
│   ├── MTSSPanel.tsx                ← P0-A: replace hardcoded birth data
│   ├── EnhancedBirthInputForm.tsx   ← Generic form — use this everywhere
│   ├── DashaCard.tsx                ← Dasha period display
│   ├── TransitTable.tsx             ← Transit view (per-planet remedies: line 194–203)
│   ├── synthesis/                   ← Synthesis dashboard + evidence/score/timing/verdict
│   └── ui/                          ← shadcn/ui components
├── services/
│   └── swissEphemerisService.ts     ← Swiss Ephemeris wrapper (flag: VITE_USE_SWISS_EPHEMERIS)
├── data/
│   ├── transitData.ts               ← PLANET_REMEDIES (line 320+)
│   ├── enhancedTransitEffects.ts    ← LIFE_AREA_EFFECTS
│   └── jataks/JATAKS_DATABASE.json  ← 16 family birth charts
├── cli/
│   └── forecast.ts                  ← CREATE THIS (see Section 2)
api/
└── index.mjs                        ← Vercel serverless — Clerk + Supabase
KNOWLEDGE_BASE/
├── INTERPRETATION_ENGINE_v2.1.md    ← 13-layer engine spec (read before any engine work)
└── implementation_queue.md          ← Full priority queue with status
docs/architecture/
├── ADR-001-saas-modernization.md    ← 100-week roadmap, design decisions
└── ADR-002-swiss-ephemeris-migration.md ← Swiss Ephemeris migration plan
jataks/
└── JATAKS_DATABASE.json             ← Real birth charts for testing/validation
```

---

## 6. Environment Variables Reference

From `.env.example`:

```env
# Required for all features
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Required for auth
# Clerk keys are loaded via publishableKeyFromHost() in api/index.mjs
# Set CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in Vercel dashboard

# Feature flags — safe defaults, enable after validation only
VITE_USE_SWISS_EPHEMERIS=false     # Enable at Week 28-30 after accuracy tests pass
VITE_USE_CALC_WORKER=true          # Web Worker for calcs — already enabled

# Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 7. Rules Antigravity Must Never Break

These come from the actual ADRs and engine spec in the repo:

1. **Do NOT hardcode any person's birth data** in new features. Always use the `EnhancedBirthInputForm` component for input.

2. **Do NOT enable `VITE_USE_SWISS_EPHEMERIS=true`** until accuracy regression tests pass against all 16 jataks in `JATAKS_DATABASE.json`.

3. **Do NOT migrate away from react-router-dom v6** — 40+ pages use it. ADR-001 explicitly defers this to Week 50+.

4. **Every interpretation output must contain a "Therefore:" clause.** This is the engine's contractual guarantee. Any output function that omits it is a bug.

5. **The D1 natal promise check (Layer 1) is a gate.** If D1 does not support the predicted event, stop processing and output "D1 does not support this event." Do not let Layer 6 or 7 override Layer 1.

6. **Layer 12 remedies must be planet-specific and diagnostically tied to the chart.** Never output generic remedies like "chant Om daily" without a chart-based reason.

7. **Clerk middleware must remain on all API routes** that access user data. See `requireAuth` in `api/index.mjs`.

8. **Run `npm run typecheck` and `npm run lint` before committing.** Husky enforces this on pre-commit.

---

## 8. How to Use This Guide in Antigravity IDE

1. **Open this file first** in Antigravity. Paste Section 1's codebase orientation block into Antigravity's context/system prompt pane.

2. **Work P0-A before P0-B.** Fix the MTSS generalisation first — it's the most visible user-facing issue. Then implement the CLI `forecast.ts` tool.

3. **Use the File Map (Section 5)** every time Antigravity asks "which file should I look at?" — point it to the exact file.

4. **For any engine work**, tell Antigravity: *"Read `KNOWLEDGE_BASE/INTERPRETATION_ENGINE_v2.1.md` before suggesting any interpretation logic. The 14 layers are mandatory and in strict order."*

5. **For Swiss Ephemeris work**, tell Antigravity: *"Read `docs/architecture/ADR-002-swiss-ephemeris-migration.md` first. The wrapper already exists in `src/services/swissEphemerisService.ts`. The feature flag is `VITE_USE_SWISS_EPHEMERIS`."*

6. **After each implementation session**, update `KNOWLEDGE_BASE/implementation_queue.md` to mark completed items ✅.
