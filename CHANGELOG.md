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

### Changed

- Navigation collapsed to 4 core features + Labs link
- calculatePrecisePlanetaryPositions accepts tzOffsetHours (was hardcoded IST)
- PreciseAscendant interface gains `seconds` field
- README screenshots use real app captures (no AI placeholders)
- ESLint: deleted duplicate eslint.config.cjs (eslint.config.js wins)

### Fixed

- 1943 Mumbai wartime chart: 16.5° ascendant correction (one full rashi)
- Pre-existing typecheck errors: auth/roles barrel file, tailwind darkMode type
- Cache key collision: IST vs wartime charts no longer share the same key
