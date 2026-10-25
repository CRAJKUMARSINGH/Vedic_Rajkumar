# Swiss Ephemeris Licensing & Enterprise Compliance Memo

**Document:** `docs/legal/SWISS_EPHEMERIS_LICENSE.md`  
**Applicability:** Vedic Rajkumar Core Engine & Distribution  
**Authority:** Swiss Ephemeris (Astrodienst AG, Zurich)  
**Status:** Canonical Policy

---

## 1. Executive Summary

Vedic Rajkumar utilizes Swiss Ephemeris algorithms via `swisseph-wasm` for high-precision planetary calculations (sub-arcsecond accuracy). Swiss Ephemeris is dual-licensed by Astrodienst AG under:

1. **GNU Affero General Public License version 3 (AGPL-3)** — for open-source software.
2. **Swiss Ephemeris Commercial License** — for proprietary/closed-source distribution.

---

## 2. AGPL-3 Obligations

Under AGPL-3:

- If Vedic Rajkumar is distributed or offered over a network as open-source software, the complete source code of the application (including modifications and communicating components) must be made available to network users under AGPL-3.
- The public GitHub repository at `https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar` complies with this requirement by publishing its full source code.

---

## 3. Commercial & White-Label Requirements

If Vedic Rajkumar or any derivative is deployed under a **closed-source enterprise white-label license** or proprietary SaaS where source code disclosure is prohibited:

1. A **Commercial License** must be procured directly from Astrodienst AG prior to commercial distribution.
2. The licensing fee structure depends on the distribution model (server-based vs client-distributed).
3. Contact: Astrodienst AG (info@astro.com / www.astro.com/swisseph).

---

## 4. Architectural Insulation & Fallback Engine

To mitigate vendor lock-in and provide a 100% permissive fallback:

- Vedic Rajkumar maintains an independent, high-precision astronomical engine (`precisionEphemerisService.ts`) implementing Jean Meeus (_Astronomical Algorithms_, ch. 47) with Lahiri Ayanamsa.
- The engine supports a runtime feature toggle (`USE_SWISS_EPHEMERIS=false`), allowing instant failover to the standalone Meeus engine if commercial licensing conditions require complete detachment from Swiss Ephemeris.
