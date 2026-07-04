
## astronomy-engine usage
- MUST use named imports: `import { GeoVector, Ecliptic, Body } from "astronomy-engine"`
- Default import does not exist — will throw at build time.
- `Body.Sun`, `Body.Moon` etc. are plain strings at runtime ("Sun", "Moon").
- Rahu/Ketu: use IAU mean node formula (not astronomy-engine) — `rahuTropical()` in ephemeris/index.ts.

## Lahiri ayanamsha
- Formula: `23.85 + T * 1.3972` where T = Julian centuries from J2000.0.
- J2000.0 offset in ms: `(date.getTime() / 86_400_000 - 10957.5) / 36525`.

## Complete endpoint surface (all live)
Ephemeris: /now, /now/:planet, /at, /kakshya-live, /panchang
Charts: POST, GET list, GET :id
Ashtakavarga: /insights, /wealth, /life-phases, /transit, /sav-analysis
Dasha: /dasha-tree, /active-dasha, /micro-dasha, /forecast, /dasha-transit-matrix
Kakshya: POST /kakshya
Transit: /gochara, /tara-bala
Report: /report

## Key lib files
- `artifacts/api-server/src/lib/ephemeris/index.ts` — positions + Lahiri
- `artifacts/api-server/src/lib/ashtakavarga/` — tables, compute, reductions, interpret
- `artifacts/api-server/src/lib/vimshottari/` — constants, periods, bavPower, fes, forecast, kakshya
- `artifacts/api-server/src/lib/panchang/index.ts` — Tithi/Vara/Nakshatra/Yoga/Karana
- `artifacts/api-server/src/lib/vedic/tara-bala.ts` — 9-Tara system
- `artifacts/api-server/src/lib/vedic/gochara.ts` — 9-planet transit analysis
- `artifacts/api-server/src/lib/vedic/sav-analysis.ts` — SAV thresholds + longevity

**Why:** astronomy-engine default import crashes silently with esbuild — always use named imports.
