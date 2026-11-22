# Vedic_Rajkumar — Masterstroke Patch Bundle

Prepared for CRAJKUMARSINGH / Jyoti after deep review of the public repo
https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar

## What is inside this ZIP

```
docs/
  ROBOTIC_USER_PERSONA_TESTING.md   ← how to robotically test as basic / interm / advanced
  ANSWER_SHORTCOMINGS_AND_CHART_BUGS.md ← web-informed analysis of answer quality + chart drafting bugs

patches/
  01-unify-chart-renderer.md        ← kill dual NorthIndianChart implementations
  02-harden-confidence-and-hedging.md ← protect users from over-confident / soft answers

tests/
  persona-robot.spec.ts             ← drop-in Playwright suite for the three grades

reference_NorthIndianChart.tsx      ← clean canonical version (features/charts)
legacy_NorthIndianChart.tsx         ← the older messy version (for comparison)
```

## Why this is the masterstroke

1. **One chart renderer** → geometry, accessibility, overflow, Rx markers, and tests live in a single place forever.
2. **Persona robot** → every PR is exercised by a basic user, an intermediate user, and an advanced practitioner. Catches UX and calculation regressions that unit tests miss.
3. **Confidence + anti-hedging** → the product stops sounding like generic AI astrology and starts sounding like a decisive classical tool (matching the "Zero Hedging Policy" already claimed in the interpretation engine).
4. **Explicit documentation of remaining risks** (personal data in client, dual renderers, etc.) so you can close them systematically.

## How to apply

```bash
# 1. Copy the persona test
cp tests/persona-robot.spec.ts <repo>/tests/e2e/

# 2. Follow the two patch markdown files (they are self-contained)

# 3. Add to package.json
"test:personas": "playwright test tests/e2e/persona-robot.spec.ts"

# 4. Wire into CI (see ROBOTIC_USER_PERSONA_TESTING.md)
```

## Post-test debug order (recommended)

1. Run `npm run test:core` + `npm run validate:accuracy`
2. Run persona robot (headed first time)
3. Manually open the three worst charts from the 15-chart corpus and verify North Indian layout + planet stacking
4. Check Answer Card confidence basis string is visible for approximate-time cases
5. Confirm Hindi UI has no tofu and verdicts are present in both languages

## Note on sandbox testing

Full `npm install` + production build of this large monorepo is memory-heavy. The analysis above was performed on a shallow clone of main + direct inspection of the chart components, interpretation engine, existing robotic docs, and BUGS_FOUND.md. The patches are designed to be minimal-diff and high-leverage.

You now have a concrete path that keeps the project shippable and trustworthy.

Om.
