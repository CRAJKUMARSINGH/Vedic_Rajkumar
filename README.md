# Vedic Rajkumar

Vedic Rajkumar is a large React + TypeScript Vite application for Vedic astrology workflows such as kundli analysis, prashna, panchang, matchmaking, reports, and knowledge tools.

This local workspace was synchronized from the public GitHub repository and then updated with the missing root project scaffold described by `Grok vedic 3007.txt`, so a clean clone now has the basic files needed to install and run.

## Current Status

- Application source exists under `src/`
- Supabase edge functions live under `supabase/functions/`
- Tests exist under `src/tests/` and `tests/`
- Build scaffolding was missing in the synced repo and has been restored locally
- The app is still broad in scope and may need additional dependency/version tuning after the first install

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Clerk
- Supabase
- Framer Motion
- shadcn/ui-style Radix components

## Getting Started

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env`.
3. Fill in the required Clerk and Supabase values.
4. Install dependencies:

```bash
npm install
```

5. Start the dev server:

```bash
npm run dev
```

## Available Scripts

- `npm run dev` starts the Vite dev server
- `npm run build` creates a production build
- `npm run preview` previews the build locally
- `npm run lint` runs ESLint
- `npm run typecheck` runs TypeScript checks
- `npm run test` starts Vitest in watch mode
- `npm run test:run` runs Vitest once
- `npm run test:e2e` runs Playwright tests

## Environment Variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_GA_MEASUREMENT_ID`
- `VITE_USE_SWISS_EPHEMERIS`

## Notes

- `Grok vedic 3007.txt` remains untracked in the repo root as the instruction source used for these foundation updates.
- `netlify.toml` is already configured to build with `npm run build` on Node 20.
- The next guide-aligned step is architectural cleanup, especially reducing route and provider sprawl in `src/App.tsx`.
