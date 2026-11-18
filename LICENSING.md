# Licensing

Vedic Rajkumar ships under **two licenses, split by execution path**.

| Path                                                                              | License                                          |
| --------------------------------------------------------------------------------- | ------------------------------------------------ |
| Application code, UI, and all Vedic rule engines (default build)                  | **MIT** — see [LICENSE](LICENSE)                 |
| `swisseph-wasm` planetary layer, active only when `VITE_USE_SWISS_EPHEMERIS=true` | **AGPL-3.0-or-later** (Astrodienst dual license) |

Default builds ship the flag as `false` (see `.env.example`), so **the default
artifact is MIT-only**.

## What this means

- **Self-hosted / internal / research use:** MIT covers you. AGPL obligations
  attach to _network_ distribution of a Swiss-Ephemeris-enabled build.
- **Publicly hosted derivative:** if you enable the Swiss path, publish your
  modifications to that path.
- **Closed-source commercial product:** either keep
  `VITE_USE_SWISS_EPHEMERIS=false` and ship the MIT local engine
  (`src/services/precisionEphemerisService.ts`), or procure a Swiss Ephemeris
  commercial license from Astrodienst AG.

## Canonical policy and decision record

- [docs/legal/SWISS_EPHEMERIS_LICENSE.md](docs/legal/SWISS_EPHEMERIS_LICENSE.md)
  — the canonical licensing memo (AGPL obligations, commercial path, fallback engine).
- [docs/adr/ADR-007-swiss-ephemeris-licensing.md](docs/adr/ADR-007-swiss-ephemeris-licensing.md)
  — the architecture decision record.

SPDX headers mark the boundary in source: MIT on the Vedic rule engines and the
local ephemeris, `AGPL-3.0-or-later` on the `swisseph-wasm` wrapper
(`src/services/swissEphemerisService.ts`).
