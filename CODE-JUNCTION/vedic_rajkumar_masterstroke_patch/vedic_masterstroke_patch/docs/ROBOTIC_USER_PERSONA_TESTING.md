# Robotic Testing as Random Basic / Intermediate / Advanced Users

**Masterstroke Guide for Vedic_Rajkumar**  
Target: Prove the product works for real humans of three skill levels without human QA on every PR.

## 1. Persona Definitions (use these exact seeds)

| Grade            | Persona Name      | Skill Profile                                              | Birth Data Strategy                                                                     | Question Style                                                                                       | Expected Behaviours                                                                 |
| ---------------- | ----------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **Basic**        | `random-basic`    | First-time visitor, Hindi/English mix, mobile-first        | Random Indian city + approximate time (e.g. "around 10 AM") or "don't know exact time"  | Short, emotional, one-topic ("Will I get job?", "Marriage when?")                                    | Must see clear verdict + confidence + one primary remedy. No jargon wall.           |
| **Intermediate** | `random-interm`   | Knows Lagna, Dasha, Ashtakavarga basics                    | Exact date/time/city from 15-chart corpus or generated                                  | Multi-part ("Career + finance in next 2 years, any yoga?")                                           | Expects layer transparency, D1+D9, current dasha context, export PDF.               |
| **Advanced**     | `random-advanced` | Practitioner / student of Prashna Marga, Jaimini, Shadbala | Edge cases: wartime, pre-IST, lat extremes, leap-second, midnight birth, foreign cities | Precise technical ("Show Arudha Lagna + Upapada, Shadbala of 7th lord, double transit for marriage") | Full intermediate data, citations, confidence basis, fail-closed on missing inputs. |

## 2. How to Run Robotic Personas (Playwright)

Extend the existing tier robot pattern already in the repo (`docs/testing/TIER_ROBOTIC_TESTING.md`).

```bash
# 1. Install browsers once
npx playwright install chromium

# 2. Start app
npm run dev -- --host 127.0.0.1

# 3. Run persona suite (new file you will add)
npx playwright test tests/e2e/persona-robot.spec.ts --project=chromium
```

### Recommended test structure (`tests/e2e/persona-robot.spec.ts`)

```ts
import { test, expect } from "@playwright/test";
import {
  BASIC_PERSONAS,
  INTERM_PERSONAS,
  ADVANCED_PERSONAS,
} from "./fixtures/personas";

for (const p of [...BASIC_PERSONAS, ...INTERM_PERSONAS, ...ADVANCED_PERSONAS]) {
  test(`[${p.grade}] ${p.name} – full journey`, async ({ page }) => {
    await page.goto("/");
    // 1. Language toggle if Hindi
    // 2. Navigate to Kundli / Prashna / Milan
    // 3. Fill form with p.birthData (use data-testid)
    // 4. Submit
    // 5. Assert:
    //    - chart SVG has 12 house polygons
    //    - ascendant marker present
    //    - no console.error
    //    - confidence badge visible and in range
    //    - for basic: no raw longitudes dumped without labels
    //    - for advanced: intermediate data accordion expands
    // 6. Export PDF / share and check no crash
  });
}
```

## 3. Post-Test Debug Checklist (from best expertise)

After every robotic run:

1. **Console & Network**
   - Zero uncaught exceptions.
   - No 4xx/5xx on calculation endpoints (or graceful degraded mode banner).

2. **Chart Geometry**
   - Exactly 12 `<polygon data-testid="house-polygon-N">`.
   - Lagna (house 1) always top-centre in North Indian.
   - Planet labels do not overflow outside polygon (use overflow badge when >3).
   - Sign numbers 1–12 correctly rotated from Lagna.

3. **Answer Quality**
   - Verdict is decisive ("Yes / No / Conditional") – no pure hedging.
   - Confidence has basis string (input quality + shadbala + dasha).
   - Remedies are actionable and ordered by priority.

4. **Bilingual & Accessibility**
   - Hindi mode has correct Devanagari, no tofu.
   - `aria-label` on every house contains planet names.

5. **Edge Cases that must not crash**
   - Time unknown → whole-sign or sunrise fallback + confidence penalty.
   - Latitude > 66° → polar warning.
   - Date before 1900 or after 2100 → ephemeris range banner.

## 4. CI Gate Suggestion

Add to `.github/workflows/ci.yml`:

```yaml
- name: Persona Robot
  run: npm run test:personas
  # fails the PR if any basic/interm/advanced journey fails
```

## 5. Random Generation Helpers

```ts
// tests/e2e/fixtures/personas.ts
export function randomIndianBirth() {
  const cities = [/* 30 major + 20 tier-2 */];
  // generate year 1950-2010, random time, random city
}
export function randomEdgeBirth() {
  // wartime, 29-Feb, 00:00, 23:59, high latitude
}
```

This turns "random users" into deterministic, repeatable robotic coverage.
