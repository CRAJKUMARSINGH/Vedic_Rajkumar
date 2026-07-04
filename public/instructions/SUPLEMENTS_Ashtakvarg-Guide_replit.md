# Vedic Astrology API

A full classical Vedic Jyotish forecast API — 22 endpoints covering the complete classical stack: Panchang, Gochara, Ashtakavarga (BAV/SAV), Sade Sati, Vimshottari Dasha through Prana level, FES, CDS, Wealth, Longevity, and Master Report.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000, proxied at `/api`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (not yet in use; charts are in-memory)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (schema ready, in-memory store in use for charts)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Astronomy: custom Keplerian + Meeus algorithms (no external dependency)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract
- `artifacts/api-server/src/lib/astronomy.ts` — planetary position engine (Julian date, Lahiri ayanamsha, Keplerian orbits, Moon via Meeus)
- `artifacts/api-server/src/lib/vedic-core.ts` — nakshatras, signs, tithis, yogas, karanas, Tara/Chandra Bala
- `artifacts/api-server/src/lib/ashtakavarga.ts` — BAV tables (BPHS), SAV calculation
- `artifacts/api-server/src/lib/dasha.ts` — Vimshottari dasha tree down to Prana level
- `artifacts/api-server/src/lib/panchang.ts` — 5 limbs + inauspicious yogas
- `artifacts/api-server/src/lib/sade-sati.ts` — Saturn 7.5yr tracker with BAV-driven severity
- `artifacts/api-server/src/lib/analysis.ts` — Gochara, FES, CDS, Wealth, Longevity
- `artifacts/api-server/src/lib/charts-store.ts` — in-memory chart CRUD
- `artifacts/api-server/src/routes/charts/` — one file per analysis domain

## The 22 API Endpoints

| # | Method | Path | Description |
|---|--------|------|-------------|
| 1 | POST | `/api/charts` | Create birth chart |
| 2 | GET | `/api/charts` | List all charts |
| 3 | GET | `/api/charts/:id` | Get full chart |
| 4 | GET | `/api/charts/:id/panchang?date=` | Daily panchang (5 limbs) |
| 5 | GET | `/api/panchang?date=&lat=&lon=&tz=` | Standalone panchang |
| 6 | GET | `/api/charts/:id/gochara?date=` | Transit analysis |
| 7 | GET | `/api/charts/:id/gochara/weekly?date=` | 7-day transit overview |
| 8 | GET | `/api/charts/:id/tara-bala?date=` | Tara Bala |
| 9 | GET | `/api/charts/:id/chandra-bala?date=` | Chandra Bala |
| 10 | GET | `/api/charts/:id/kakshya` | Natal Kakshya (1/8 sign) |
| 11 | GET | `/api/charts/:id/kakshya/transit?date=` | Transit Kakshya |
| 12 | GET | `/api/charts/:id/sade-sati?date=` | Sade Sati tracker |
| 13 | GET | `/api/charts/:id/dasha` | Full Maha Dasha timeline |
| 14 | GET | `/api/charts/:id/dasha/current?date=` | Current Maha/Antar/Pratyantar |
| 15 | GET | `/api/charts/:id/dasha/sookshma?date=` | Sookshma + Prana dasha |
| 16 | GET | `/api/charts/:id/dasha/timeline?years=` | Dasha timeline (Maha+Antar) |
| 17 | GET | `/api/charts/:id/fes?date=` | Favorable Event Score |
| 18 | GET | `/api/charts/:id/cds?date=` | Combined Dasha Score |
| 19 | GET | `/api/charts/:id/sav` | Full SAV + BAV analysis |
| 20 | GET | `/api/charts/:id/sav/transit?date=` | Transit Ashtakavarga |
| 21 | GET | `/api/charts/:id/wealth` | Wealth & Dhana Yoga analysis |
| 22 | GET | `/api/charts/:id/longevity` | Longevity (Ayurkaraka) |
| 23 | GET | `/api/charts/:id/report?date=` | Master report (all combined) |
| 24 | GET | `/api/charts/:id/muhurta?from=&to=&type=&limit=&minGrade=` | Muhurta finder — best windows in date range |
| 25 | GET | `/api/charts/:id/sav/forecast?from=&to=&interval=` | Ashtakavarga forecast — BAV strength time-series |

## Architecture decisions

- **In-memory chart store**: Charts live in a `Map<UUID, Chart>` for now — fast, zero-dep. Swap to Postgres via `@workspace/db` when persistence is needed.
- **Lahiri ayanamsha**: Standard for Indian astrology (~23.85° at J2000, +1.39659°/century). Hardcoded. Configurable per chart if needed later.
- **Keplerian orbital mechanics**: Sun (Meeus ~0.01°), Moon (Meeus ~0.1°), planets (Keplerian ~1–2°). Good enough for sign/nakshatra level; use Swiss Ephemeris binding for arcsecond accuracy.
- **BAV tables from BPHS**: Using Brihat Parashara Hora Shastra tables for all 7 planets. SAV standard total = 337.
- **Severity via BAV score**: Saturn BAV ≥ 5 = Mild Sade Sati; 3–4 = Moderate; 1–2 = Intense; 0 = Very Intense (Kaksha Bhrashta).

## Product

Users submit a birth date/time/place → receive a full classical Vedic Jyotish chart with all timing layers: daily Panchang, transit strength, Sade Sati phase with Ashtakavarga severity, Dasha down to the Prana sub-period, wealth/longevity profiling, and a master report combining every indicator.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Chart data is in-memory only — restarts clear all charts. Add DB persistence before production use.
- `pnpm run dev` at workspace root will fail — always use `--filter @workspace/api-server`.
- `dasha/sookshma` returns a 5-level stack (Maha/Antar/Pratyantar/Sookshma/Prana) — Prana durations are very short (days).
- The weekly gochara uses JD arithmetic; dates are UTC-normalized.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
