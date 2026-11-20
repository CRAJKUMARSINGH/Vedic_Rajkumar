# Licensing

Vedic Rajkumar ships under **two licenses, split by execution path**.

| Path                                                                              | License                                          |
| --------------------------------------------------------------------------------- | ------------------------------------------------ |
| Application code, UI, and all Vedic rule engines (default build)                  | **MIT** — see [LICENSE](LICENSE)                 |
| `swisseph-wasm` planetary layer, active only when `VITE_USE_SWISS_EPHEMERIS=true` | **AGPL-3.0-or-later** (Astrodienst dual license) |

Default builds ship the flag as `false` (see `.env.example`), so **the default
artifact is MIT-only**.

### The boundary is a tested structure

The split is only real if the default artifact never pulls the AGPL module into
its import graph. That is enforced, not assumed:

| Guarantee                                                                           | Enforced by                                             |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------- |
| No module statically imports or `require()`s `swisseph-wasm`                        | `src/tests/accuracy/agplBoundary.test.ts`               |
| Only `src/services/swissEphemerisService.ts` may reach it, via a **dynamic** import | same test (asserts the single allowed dynamic importer) |
| The Swiss path is gated by `VITE_USE_SWISS_EPHEMERIS === 'true'` at its call site   | same test                                               |
| The env schema defaults the flag to `false`                                         | same test                                               |
| Oracle/engine independence in accuracy tests                                        | `src/tests/accuracy/noEngineImports.test.ts`            |

A dynamic `import('swisseph-wasm')` keeps the WASM out of the default MIT
bundle; a static import would pull AGPL code into every build, so the test
fails loudly if one is ever introduced.

### Static vs dynamic import — what actually differs

- **Static import isolation.** No production module (`src/**`, excluding
  `src/tests/**`) contains a static `import`/`export … from 'swisseph-wasm'` or a
  `require('swisseph-wasm')`. This is the property that keeps AGPL code out of
  the default bundle: a bundler cannot drop a static edge it must evaluate at
  module-init.
- **Dynamic import behaviour.** The one permitted edge is
  `await import('swisseph-wasm')` inside `swissEphemerisService.ts`, reached only
  when the caller has passed the `VITE_USE_SWISS_EPHEMERIS === 'true'` gate. At
  runtime the WASM is fetched lazily on the first Swiss computation; on the
  default build that path is never taken.

### Runtime distribution and deployment model

- The **default** build (`VITE_USE_SWISS_EPHEMERIS=false`, the shipped value)
  contains only MIT code. The production Netlify deploy uses this build.
- An **AGPL-enabled** build is a _different artifact_, produced deliberately by
  setting the flag at build time. Distributing or network-serving that artifact
  is what raises AGPL-3.0 obligations; the default artifact is unaffected.
- Serving the default artifact over a network raises no AGPL obligation, because
  no AGPL code is present in it.

### What the test does NOT establish

**A passing import-boundary test is not legal clearance.** The test proves a
_structural_ fact about the import graph. It says nothing about:

- whether a particular deployment is "distribution" or "network use" under
  AGPL-3.0 §13;
- the terms of any Astrodienst commercial license;
- the obligations that attach to an AGPL-enabled artifact that is publicly
  served.

**AGPL-3.0 legal review remains an open release blocker.** Until a qualified
review records a decision (see
[docs/legal/SWISS_EPHEMERIS_LICENSE.md](docs/legal/SWISS_EPHEMERIS_LICENSE.md)),
no AGPL-enabled artifact may be published or deployed.

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
