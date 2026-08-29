# Vedic Rajkumar

Status: Active development — focused prototype, not production.

A React + TypeScript + Vedic astrology web application. Currently implements 4 core features (Kundli, Prashna, Matchmaking, Panchang/Muhurat) with several additional modules in advanced/coming-soon state. Calculations aspire to traditional Vedic astrological standards and are in active validation against reference chart datasets.

Architecture & product planning informed by `Grok vedic 3007.txt` review notes (kept in repo root for project-history purposes).

---

## What this project actually does

Four core features are actively built and tested in the prototype:

- **Kundli (Birth Chart)**: Generates north/central Indian style natal charts (D1 + divisional D9/D10 where available), planetary positions, nakshatras, padas, basic yogas, shadbala, and ascendant analysis. Aspires to match Parashari-style chart layout conventions.
- **Prashna (Horary)**: Accepts a horary number + time/location input, casts the Prashna kundali, and runs basic Prashna Marga derived interpretations. Includes reading history and subjective-analysis synthesis overlay.
- **Matchmaking (Kundli Milan)**: Compares two charts using Ashtakuta (Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoota, Nadi) + Mangal Dosha checks. Produces a compatibility score with breakdown tables and narrative notes.
- **Panchang / Muhurat**: Daily panchang (Tithi, Vaara, Nakshatra, Yoga, Karana, Sunrise/Sunset, Moonrise/Moonset, Rahu Kalam, Gulika, Yamaganda) with muhurat finder filters for events (marriage, job start, travel, etc.).

### Advanced modules (preview / coming soon)

The pages below exist as routes and UI components but are not yet fully polished. Several use stub or placeholder data in edge cases and are listed here for roadmap transparency:

- Ashtakavarga (Bindu charts, transit overlay)
- Dasha systems (Vimshottari, Ashtottari with dashboards and timeline)
- Transit / Gochara analysis
- Lal Kitab (red-book style remedies)
- KP System (Krishnamurti Paddhati — cuspal sublords)
- Jaimini (Karaka, Padakrama, Chara Dasha)
- Gemstone & Rudraksha recommendations
- Varshaphal / Tajik annual charts
- Enterprise dashboard / MTSS cohort analysis panel
- Knowledge base ingestion & search

Additional experimental pages (Nadi, Numerology, Vaastu, Medical, Mundane, Western/Chinese comparison, etc.) are routed but in early scaffold state and should be treated as previews only.

---

## Getting Started

### Prerequisites

- Node.js **20+** (see `engines` in `package.json`)

### Setup

1. Clone the repo and cd into the project root.

2. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

3. (Optional) Fill in real keys. If you skip keys, the app falls back to dev demo mode (Clerk disabled, Supabase read mocked, Swiss Ephemeris off).

4. Install dependencies:

   ```bash
   npm install
   ```

5. Start the dev server:

   ```bash
   npm run dev
   ```

   Visit `http://localhost:5173` (Vite default) in your browser.

### Available Scripts

```bash
npm run dev        # Start Vite dev server
npm run build      # Create production build
npm run preview    # Preview the build locally
npm run lint       # Run ESLint across .js/.jsx/.ts/.tsx
npm run typecheck  # Run TypeScript compiler (no emit)
npm run test       # Start Vitest in watch mode
npm run test:run   # Run Vitest once (CI mode)
npm run test:e2e   # Run Playwright E2E tests
```

### Environment Variables

| Variable                         | Required | Default if blank           | Purpose                                                          |
|----------------------------------|----------|----------------------------|------------------------------------------------------------------|
| `VITE_SUPABASE_URL`              | No       | `''` (demo fallback)       | Supabase project URL for saved charts and edge functions         |
| `VITE_SUPABASE_ANON_KEY`         | No       | `''` (demo fallback)       | Supabase anon public key                                         |
| `VITE_CLERK_PUBLISHABLE_KEY`     | No       | `''` (demo fallback)       | Clerk publishable key for auth; without it the app uses demo mode|
| `VITE_GA_MEASUREMENT_ID`         | No       | `''`                       | Google Analytics 4 measurement ID (optional telemetry)           |
| `VITE_USE_SWISS_EPHEMERIS`       | No       | `false`                    | If `true`, prefer `swisseph-wasm` for planetary calc; otherwise local engine|

---

## Architecture

Short, honest outline of how the codebase is structured:

### Frontend

- **Framework**: React 18 + TypeScript, built with Vite.
- **Routing & data**: React Router v6 (routes defined in `src/routes/`) + TanStack Query for server state / caching.
- **UI**: shadcn/ui-styled Radix primitives under `src/components/ui/`, composed with Tailwind CSS 3 + `class-variance-authority`. Theme toggling via `next-themes`.
- **Motion**: Framer Motion for page transitions and panel animations.

### Astrology engine

- **Local computations** (always available, no network required):
  - `src/services/ephemerisService.ts` — planetary position calculations (simplified ephemeris; aspires to J2000-equivalent accuracy; in active validation).
  - `src/services/panchangService.ts` — daily panchang (tithi / nakshatra / yoga / karana / vaasara) + sunrise/sunset via solar approximations.
  - `src/services/muhuratService.ts` — muhurat filtering over panchang windows.
  - Supporting engines live in `src/lib/vedic/` (kundli match, mangal dosha, navamsa, etc.) and `src/lib/mtss/`.
- **Optional Swiss Ephemeris integration**: gated by the `VITE_USE_SWISS_EPHEMERIS` flag. If enabled, `swisseph-wasm` is used for higher-precision positions; otherwise the local engine remains the path. Flag is off by default for portability.

### Persistence

- **Supabase**: Used for saved readings, user profile, and optional server-side Prashna/Knowledge logic.
  - Edge functions: `supabase/functions/prashna/`, `supabase/functions/knowledge/`.
  - SQL migrations: `supabase/migrations/` (two applied migrations so far).
  - Client wrapper + types: `src/integrations/supabase/`.

### Auth

- **Clerk** via `@clerk/react`. If no publishable key is set, the app boots in a dev demo mode that skips sign-in and treats the session as a demo user. This is intentional so the prototype runs without config bloat.

### PDF export

- A4 Ganesh-motif PDF templates for kundli / matchmaking / prashna / event reports are implemented in `src/services/vedicGaneshPDFGenerator.ts` using `jspdf` + `jspdf-autotable`.

### Folder layout reference

```
src/
  components/         # UI primitives (ui/), feature cards, layouts, panels
  features/
    kundli/           # Kundli feature types + index
    prashna/          # Prashna feature types + index
    matchmaking/      # Matchmaking feature types + index
    panchang/         # Panchang/Muhurat feature types + index
    shared/           # Shared cross-feature types
  pages/              # Route-level pages (core + advanced/preview)
  routes/
    appRoutes.tsx     # Route definitions
    featureRegistry.ts# Feature flag / availability registry
  services/           # Astrology services, PDF, synthesis, Supabase wrappers
  lib/                # Lower-level astrology engines (vedic, mtss)
  integrations/supabase/  # Supabase client + types
  hooks/              # Custom React hooks (useChartCalculation etc.)
  tests/              # Vitest unit tests for services + hooks
  workers/            # Web-worker scaffolding (ephemeris worker, in progress)
  styles/             # Tailwind / design-system CSS
```

---

## Known Limitations

These are called out explicitly to avoid misleading anyone:

- **Deep astrology validation is in-progress.** Engine accuracy claims require more reference-chart side-by-side comparisons. Unit tests cover ascendant, nakshatra, basic dasa, and ashtakavarga; many edge-case rules (varsha charts, divisional D4/D7/D20, deep sublord cusps) do not have full test coverage yet.
- **Some advanced modules use stubs or placeholder data in edge cases.** Specifically KP, Jaimini, Lal Kitab, and Nadi pages are built on partial rule sets and may return synthetic interpretation text for uncommon inputs.
- **Offline / Web-Worker mode is in active development.** The ephemeris worker at `src/workers/ephemeris.worker.ts` exists but is not the default codepath. Not recommended for critical decisions.
- **Production hardening is ongoing.** Supabase RLS policies, rate limits, audit logging, and subscription billing flows are not wired end-to-end. This repo is a prototype, not a deployed SaaS.

---

## Roadmap next: Grok plan alignment

Priority work for the coming weeks (aligned with the 10-week Grok evaluation plan):

- (a) **Chart accuracy unit tests** — expand `src/tests/services/` with more Parashar reference-chart comparisons for D1, D9, and Vimshottari start dates.
- (b) **Prashna error boundary fixes** — harden the Prashna route against invalid horary numbers, missing coordinates, and synthesis engine edge cases (see `src/components/ErrorBoundary.tsx`).
- (c) **Supabase RLS / privacy work** — apply Row Level Security to saved-chart tables and confirm that edge functions only read a user's own readings.
- (d) **Accessibility improvements** — audit Radix components, add visible focus states, keyboard-navigation polish, and screen-reader labels to chart canvases.

---

## Notes

- `netlify.toml` is pre-configured to build with `npm run build` on Node 20.
- The project was originally scaffolded from a public sync and then restored locally per the `Grok vedic 3007.txt` plan document.
- `src/App.tsx` intentionally stays small; the route/provider sprawl is delegated to `src/main.tsx`, `src/Providers.tsx`, and `src/routes/`.
