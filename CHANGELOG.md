# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/), auto-generated
from [Conventional Commits](https://www.conventionalcommits.org/).

## [Unreleased]

### Added

- Historical India timezone resolver (wartime +6:30, 1941–1945)
- Full Meeus ch.47 Moon series with delta-T
- Delta-T on bodies, never on angles (UT/TT split)
- 15-chart adversarial accuracy corpus with Tier A/B gates
- Exact ascendant with nutation + geometric proof across 13 latitudes
- Public /accuracy page with honest unverified list
- Playwright screenshot pipeline (heading-wait, frozen clock, demo jataks)
- Labs nav dropdown for preview modules
- BirthTimezoneChip — amber badge when historical offset is active
- CI accuracy gate workflow (.github/workflows/accuracy.yml)
- CODEOWNERS, .nvmrc, Dependabot config
- Single deploy pipeline (verify → migrate → deploy-functions → deploy-frontend → smoke)
- Answer Layer: deterministic, redacted verdict-only cards under `public/answers/**`, with full (unredacted) cards served only to an owner/admin via the RLS-locked `answer-cards` Edge Function
- `birth_hash` on the public answer-card `subject` — stable provenance/parity without exposing raw birth data
- `.gitattributes` normalising all text to LF, plus an `answers:check` drift gate in CI

### Changed

- **BREAKING — `/v1/answer` v1.1**: the `subject` object no longer carries `dob`, `tob`, `place`, `lat`, `lon` or `tz`; it now carries `birth_hash`. Consumers that read raw birth fields must move to the authenticated `answer-cards` Edge Function.
- Discovery docs (`public/llms.txt`, `public/.well-known/vedic-rajkumar.json`) published as v1.1
- `.well-known/vedic-rajkumar.json`: the `/functions/v1/answer-cards` surface is marked `"fetchable": false`, so a crawler reads its 401 as intentional rather than as a broken surface
- Answer Layer `as_of` is now a single pinned constant (`src/services/answerCard/answerCardAsOf.ts`), shared by the emitter default and the parity guard — never wall-clock, so `answers:check` cannot drift just because a day passed
- Navigation collapsed to 4 core features + Labs link
- calculatePrecisePlanetaryPositions accepts tzOffsetHours (was hardcoded IST)
- PreciseAscendant interface gains `seconds` field
- README screenshots use real app captures (no AI placeholders)
- ESLint: deleted duplicate eslint.config.cjs (eslint.config.js wins)

### Fixed

- 1943 Mumbai wartime chart: 16.5° ascendant correction (one full rashi)
- Pre-existing typecheck errors: auth/roles barrel file, tailwind darkMode type
- Cache key collision: IST vs wartime charts no longer share the same key
- Load-sensitive test suites de-flaked (DEF-010): `schema.test.ts` and `chartTimezoneWiring.test.ts` now read the answer corpus and walk `src/` once at module load instead of per assertion, and carry an explicit 30 s timeout; `testTimeout` raised 10 s → 20 s and `hookTimeout` set to 30 s (insurance for the Swiss Ephemeris `beforeAll`), so a saturated CI filesystem cannot fail a gate on wall-clock
- `public/llms.txt`: the deploy-drift paragraph documented a bug already fixed — with `as_of` pinned end-to-end, public artifacts are byte-reproducible from a checkout and `generated_at` / `provenance.computed_at` do not move from one deploy to the next
