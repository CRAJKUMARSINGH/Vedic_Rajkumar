# Robotic Testing Guide (Pure Vedic)

Persona-driven Playwright testing for Vedic Rajkumar. Three personas are exercised so every
important flow runs continuously.

- **Suite:** [`tests/e2e/robotic/`](../../tests/e2e/robotic)
- **Runner:** the repo Playwright config (`playwright.config.ts`), which boots the dev server and
  resolves the base URL from `PLAYWRIGHT_BASE_URL` (default `http://127.0.0.1:5173`).

Run it with:

```bash
npx playwright test tests/e2e/robotic --project=chromium
```

## 1. Testing philosophy

Simulate three distinct user personas with **seeded** randomness so every run is both varied and
reproducible.

| Tier             | Persona                               | Core goals                                       | Randomisation                                            |
| ---------------- | ------------------------------------- | ------------------------------------------------ | -------------------------------------------------------- |
| **Basic**        | First-time visitor, mobile, impatient | Generate one free Kundli, see a chart            | Seeded DOB 1955–2005, seeded Indian city, EN/HI          |
| **Intermediate** | Returning family user                 | Kundli Milan (36-point), Prashna, Panchang       | Free-text Prashna question                               |
| **Advanced**     | Practitioner / power user             | Extreme dates, polar locations, bilingual stress | Polar places, historical dates, rapid language switching |

## 2. Basic persona flow

1. Land on home → click **Generate Free Kundli** (routes to `/horoscope`).
2. Fill Date of Birth (DD/MM/YYYY), Time of Birth, Place of Birth.
3. Submit → assert the chart renders without `NaN` / `undefined`.
4. Use Quick Actions: **Use Today**, **Use Current Time**, **Use Last Location**.
5. Switch language EN ↔ HI at least once.

## 3. Intermediate persona flow

1. Open **Kundli Milan** and confirm navigation.
2. Enter a free-text Prashna question.
3. Confirm **Panchang** is reachable.

## 4. Advanced persona flow

1. Force extreme dates (01/01/1901, leap-year edges).
2. Use polar / unusual places (Longyearbyen, Svalbard).
3. Rapid language switching while the form is filled.

## 5. Structure

```
tests/e2e/robotic/
├── _personas.ts        # seeded PRNG + form helpers (no external data deps)
├── basic.spec.ts
├── intermediate.spec.ts
└── advanced.spec.ts
```

All selectors are astrology-related. `_personas.ts` provides a seeded `mulberry32` generator so the
personas stay random across runs but a given seed reproduces exactly — the specs do **not** depend on
`@faker-js/faker`.

## 6. Form UX contract

The suite relies on stable hooks in `EnhancedBirthInputForm`:

- `data-testid="dob-input"`, `"tob-input"`, `"pob-input"` — birth fields
- `data-testid="get-transit-cta"` — submit button

The form keeps a single-page completion indicator (X/3 fields) and reports exactly which required
fields are still missing rather than a generic "please fill all fields" message.

## 7. Post-failure checklist

- Capture trace/screenshot (the config already retains traces on failure).
- Classify: UX validation, calculation accuracy, offline, bilingual, performance.
- Record findings in `app-robustness-testing.md` (the append-only defect logbook).
