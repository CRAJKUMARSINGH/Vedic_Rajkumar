# Quality Gate

This project currently uses a focused release gate while older generated modules are being consolidated.

## Required Before Merging Core App Changes

- `npm run test:core`
- `npm run build`
- Browser smoke check for the changed primary route on desktop and mobile width.

## Core Test Scope

The core gate covers:

- Feature registry and primary navigation integrity.
- Swiss ephemeris service behavior.
- Vedic engine boundary cases, including nakshatra and Vimshottari dasha totals.

## Definition Of Done

- New calculation logic includes Vitest coverage for normal cases and boundary cases.
- Vedic calculations use sidereal Lahiri ayanamsa unless a feature is explicitly Western astrology.
- User-facing route changes include unique SEO title/description and a canonical path.
- Roadmap or placeholder pages use `noindex` so search engines prioritize working tools.
- Production build must pass before deployment.

## Known Follow-Up

Full `npm run typecheck` and `npm run lint` still surface legacy issues outside the focused Week 3 to Week 8 scope. They should be restored to required CI gates after the older modules are normalized.
