# Regression-Test Strategy for Ayanamsa Accuracy
## Deep research: Swiss Ephemeris alternatives and benchmarking harnesses

**Date:** 2026-11-20 · **Target repo:** `Vedic_Rajkumar` @ `6b1c0fbf`
**Question:** which regression-test strategy actually proves ayanamsa accuracy, rather than proving that a library agrees with itself?

---

## 1 · Executive answer

**Ayanamsa accuracy cannot be validated by an ephemeris.** This is the finding that reorganises the whole problem.

An ephemeris gives you *tropical* positions. The ayanamsa is a *definition* — Lahiri is not "a number Swiss Ephemeris knows", it is the construction that puts Spica (Chitra) at exactly 180° of sidereal longitude, fixed at a specific epoch. Swiss Ephemeris is the de facto reference because it implements those definitions carefully, not because its Chebyshev coefficients are better.

Consequence: if you generate golden ayanamsa values **from Swiss Ephemeris and then test Swiss Ephemeris against them**, you have proven nothing. The current repo avoids that trap only by accident — `scripts/accuracy-golden.mjs` generates golden values from `swisseph-wasm` while production charts run on the local polynomial, so the oracle and the subject are different. **The moment production moves to `swisseph-wasm`, that test becomes circular.**

**Recommended strategy: a four-tier ladder, where Tier 1 is the tier the repo does not have.**

| Tier | What it proves | Oracle | Tolerance | Cost |
|---|---|---|---|---|
| **T0** | Invariants — ratios, monotonicity, derivative consistency | none (pure math) | exact | free, instant |
| **T1** | The *definition* is implemented correctly | independent astrometric computation of Spica from a star catalogue + precession | 1–2″ | one offline script |
| **T2** | The *body pipeline* matches an authority | Swiss Ephemeris golden vectors at fixed JDs | Tier A 1″ / Tier B 5″ | already exists |
| **T3** | The authority itself is not drifting | JPL Horizons spot checks | 1″ | quarterly |

Tiers 0, 2, 3 the repo has or nearly has. **Tier 1 is the missing one, and it is the only tier that would have caught the Fagan-Bradley `24.0440` typo and the missing T² precession term.**

---

## 2 · The candidate engines, compared

Accuracy figures below are the claims made by the respective projects and their documentation; where sources conflict, both figures are given.

| Engine | Method | Planets | Moon | Range | Licence | Fit for this repo |
|---|---|---|---|---|---|---|
| **Swiss Ephemeris** (`swisseph-wasm`) | Compressed Chebyshev files derived from JPL DE; own ayanamsa implementations; Moshier mode as a fileless fallback | Reproduces its parent JPL ephemeris to ~**0.001″**; one open benchmark reports a **median 0.05″** difference from JPL Horizons. Moshier mode is coarser: **~1″** for planets | Moshier mode **~3″** | Files: 1800–2399 typical; Moshier −3000…+3000 | **AGPL-3.0-or-later** or commercial (~CHF 700) | **Already the licence decision** (ADR-007). Keep as the oracle. |
| **JPL DE440 / DE441 via Skyfield** | Direct Chebyshev kernel evaluation | Effectively exact for astrology (sub-arcsecond by construction) | Exact | DE440 **1550–2650**; DE441 **−13200…+17191** | Skyfield MIT; kernels free | **Best independent oracle.** Different codebase, same underlying DE data → catches *implementation* bugs, not *data* bugs. Kernel is a large download, so it belongs in a scheduled job, not in `vitest`. |
| **astropy `builtin`** (ERFA `epv00`/`plan94`) | Analytical, no download | ~arcsecond-class | Limited | wide | BSD | Convenient Tier-1 helper for precession/obliquity via ERFA; not a strong positional oracle. |
| **astropy + DE430** | Chebyshev | Sub-arcsecond | Exact | **1550–2650** | BSD | Heavier Skyfield equivalent; no reason to prefer it here. |
| **VSOP87** | Analytical series | **~1″** over ±2000 yr | *none* (needs ELP2000) | ±4000 yr | public domain-ish | Useful as a *third* opinion for planets; useless for the Moon, which is the body that actually matters in Jyotish. |
| **Moshier** | Analytical, in-memory, no files | **0.1″–1″** depending on source | **~3″** | −3000…+3000 | via SE (AGPL) | Attractive for a WASM-less client, but 3″ on the Moon ≈ 0.0008° — fine for a rashi, marginal for a pada edge. Only with the Tier-1 star anchor as a backstop. |

**Reading of the table.** For this product the accuracy bottleneck is *not* planetary theory — every candidate is sub-arcsecond to a couple of arcseconds, and a pada is 1867″ wide. The bottleneck is (a) the ayanamsa definition, (b) time scales, (c) time zones. All three are engineering, not astronomy. The repo's own defects confirm this: F-01, F-02, F-03 and F-06 are all anchor/time bugs, not ephemeris-quality bugs.

---

## 3 · Why the ayanamsa needs its own oracle (Tier 1)

### 3.1 What Lahiri actually is

Lahiri (Chitrapaksha) anchors the sidereal zodiac so that **Spica sits at 180°00′** — the Virgo/Libra cusp — at a defined epoch; the Swiss Ephemeris discussion list records Lahiri's own 1980 formulation as "mean equinox 285, mean Sun at the vernal point, mean new moon, Spica at 180°". This is why the system is called *Chitrapaksha*: Chitra = Spica, paksha = the side/quarter.

The same literature notes that Spica's *actual* longitude today is nearer **29° Virgo than 0° Libra**, which is precisely the ~1° gap between the Lahiri construction and a naive "Spica is at 180° right now" reading. **A test that assumes Spica is at 180° today would be wrong by ~1°** — larger than every other error in this document combined. The definition is epoch-anchored; the test must be too.

### 3.2 The Tier-1 test, concretely

```
Given:  epoch T0 (the Lahiri anchor epoch, as implemented by SE's SE_SIDM_LAHIRI)
        star catalogue position of Spica (α, δ) at J2000 with proper motion
        1. propagate Spica to T0 (proper motion + precession + aberration)
        2. λ_Spica(T0) = ecliptic longitude of Spica at T0, tropical
        3. required ayanamsa(T0) = λ_Spica(T0) − 180°
        4. assert |ayanamsa_impl(T0) − required| ≤ 1–2″
       5. repeat at J2000 and at 2026 by propagating the implementation's
          precession, asserting the annual rate is 50.2–50.4″/yr
```

This is a genuine independent check: it uses a star catalogue and a precession model, **not** the code under test. It would have caught:

* Fagan-Bradley at `24.0440` (the wrong-family anchor, 0.699° out) — because the anchor registry would be checked against *its own* defining star, and FB's definition implies a value in the 24.7 range at J2000;
* the missing T² precession term — because the rate assertion at two epochs 26 years apart resolves it.

A lighter-weight variant that needs no catalogue: assert the **relations between systems**, which are fixed by their definitions. This is what the delivered `validateLahiriFormula()` does: Lahiri−FB ∈ [0.85°, 0.93°], Lahiri−Raman ∈ [1.38°, 1.41°], |Lahiri−KP| < 0.02°. Measured on the patched code at 2026-09-04: **FB−Lahiri = 0.8894°, Raman−Lahiri = −1.3933°, KP−Lahiri = −0.0030°.** These are definitional relations, so they hold regardless of engine — and they fail loudly on a typo.

---

## 4 · Harness options, scored

| Harness | Strengths | Weaknesses | Verdict |
|---|---|---|---|
| **Vitest + committed golden JSON** (what the repo has: `tools/accuracy/golden/`, `scripts/accuracy-golden.mjs`) | In-process, fast, `git diff --exit-code` makes drift visible in review | Oracle must be generated offline; binary/float noise; circular if oracle == subject | **Adopt for T2.** Keep the golden files small and the generator separate from the test. |
| **pytest + `pytest-regressions` `data_regression`** | Purpose-built for golden data; per-key `Tolerance(atol=...)`; test-data review workflow | Adds a Python toolchain to a TS repo | **Adopt for T1 only**, as an offline generator script whose output is a committed JSON that Vitest then consumes. This is the standard "generate in one language, assert in another" pattern and it keeps the TS CI clean. |
| **Skyfield as an offline oracle** | Different codebase from Swiss Ephemeris; DE440/DE441; genuinely independent | ~100 MB+ kernel; needs network on first run | **Adopt for T3**, quarterly job, output committed. |
| **JPL Horizons API spot checks** | The actual ground truth | Rate-limited, not reproducible offline | **Adopt for T3**, a handful of fixed epochs, results cached to JSON. |
| **Property-based testing** (fast-check) | Finds the cases you did not think of: JDs near sign boundaries, ΔT discontinuities, negative JDs | Needs invariants, not values | **Adopt for T0.** Excellent fit: "sidereal longitude is monotonic in tropical longitude for fixed JD", "round-trip tropical↔sidereal is identity within 1e-9", "no jump > 0.001° between JD and JD+1e-6". |
| **Snapshot of full chart output** | Catches any change | Catches *every* change; unmaintainable | **Reject.** |

### Why not simply benchmark Swiss Ephemeris against Swiss Ephemeris

Because the repo's own history is the counter-example: three ayanamsa implementations disagreed by 0.699° **while each was internally consistent**. No amount of self-consistency testing finds that. Only a check anchored outside the family does.

---

## 5 · The strategy, as a concrete build

```
tools/accuracy/
  ayanamsa/
    anchors.golden.json        # T1 — committed; {system, seSidMode, valueAtJ2000, valueAt(JD), tolerance}
    gen-anchor-golden.mjs      # T1 generator: star catalogue + precession, pytest/Skyfield offline
    README.md                  # how to regenerate; what the epoch is; why 1-2"
  corpus/charts.jsonl          # 120 charts: 1900-2050, 30 high-latitude, 20 pre-1950 tz-odd
  golden/<chartId>.json        # T2 — Swiss Ephemeris truth, per chart
  golden/manifest.json         # swisseph-wasm version, SE_SIDM id, corpus hash
scripts/
  accuracy-ayanamsa-lock.mjs   # writes anchors.golden.json; CI does git diff --exit-code
src/tests/ayanamsa/
  ayanamsaInvariants.test.ts   # T0 — structural, no oracle, runs in <1s
  ayanamsaAnchor.test.ts       # T1 — implementation vs anchors.golden.json, 1-2"
  ayanamsaCorpus.test.ts       # T2 — Tier A 1" / Tier B 5"
```

**Tolerance policy (this is the part teams get wrong).** A single tolerance is either too tight (fails on legitimate library upgrades, gets widened, then is useless) or too loose (passes a real regression). Use three:

* **Tier A = 1″** — pure ayanamsa values and body positions from a deterministic polynomial path. A regression here is a *code* regression and must fail the build.
* **Tier B = 5″** — positions that traverse a time-zone or ΔT boundary, where a legitimate library change could move things slightly. A regression here opens a PR with the diff, not a red build.
* **Tier C = report-only** — Moon at high latitude, pre-1900 dates. Logged and trended, never blocking.

And a **tolerance-increase guard**: any commit that raises a tolerance must also add a line to `docs/accuracy/METHODOLOGY.md` explaining why. That is the mechanism that stops "fix the test" from being the default response to a red build.

---

## 6 · What to fix in the existing harness first

1. **`scripts/validate-ephemeris.js` uses a fourth ayanamsa formula** (`23.85 + (year-2000)*0.0139`) that disagrees with production by **0.0144°** at 2026 — a validator that validates a different thing than it ships. Delete its ayanamsa function and import the core.
2. **`validateLahiriFormula()`'s 0.05° tolerance is 3 arcmin** — 180× wider than the 1″ the product claims. Structural invariants (delivered) replace it.
3. **The golden manifest must record the `SE_SIDM` id, not the string `'Lahiri'`.** A string is a wish; an id is a binding. `manifest.json` currently records an ayanamsa *mode* — make it the integer.
4. **Nothing today tests the ayanamsa in isolation.** Every existing test is end-to-end, so a 0.7° anchor error is absorbed by whatever else is wrong in the chart.

---

## 7 · Residual uncertainty, stated plainly

* The **exact Lahiri anchor epoch as Swiss Ephemeris implements it** is not stated in the sources I retrieved; the "mean equinox 285" formulation is Lahiri's own description as quoted on the swisseph list, not SE's source comment. The Tier-1 generator must derive the epoch from SE's behaviour (or read the SE source) rather than assume 285 CE.
* Accuracy figures for Swiss Ephemeris are **vendor/practitioner claims** (0.001″, median 0.05″) and for Moshier **conflicting** between sources (0.1″ vs ~1″). None is a peer-reviewed benchmark of the wasm build specifically.
* `swisseph-wasm` is a WASM port; its fidelity to the C library is **untested by anything I found**. That is a real gap and it belongs in Tier 3.
* I did not run any candidate engine — the comparison is documentary. The delivered Phase 1 patch is the only code that was compiled and executed here.

---

## Sources

Swiss Ephemeris vs JPL DE440 / licensing and accuracy — https://openephemeris.com/blog/swiss-ephemeris-vs-jpl-de440
Swiss Ephemeris accuracy, AGPL, Moshier figures — https://roxyapi.com/blogs/swiss-ephemeris-explained-developers
Skyfield accuracy and JPL ephemeris files — https://rhodesmill.org/skyfield/accuracy-efficiency.html · https://rhodesmill.org/skyfield/planets.html
JPL DE440/DE441 (Park 2021) — https://ssd.jpl.nasa.gov/doc/Park.2021.AJ.DE440.pdf
Astropy solar-system ephemerides (DE430 range, `builtin` ERFA) — https://docs.astropy.org/en/latest/coordinates/solarsystem.html
Moshier ephemeris accuracy (0.1″ planets / 3″ Moon) — https://hackage.haskell.org/package/swiss-ephemeris · https://www.moshier.net/aadoc.html
Swiss Ephemeris sidereal-mode functions (`swe_set_sid_mode`, `SE_SIDM_*`) — https://rstub.github.io/swephR/reference/Section10.html
Lahiri definition, Spica at 180°, epoch discussion — https://groups.io/g/swisseph/topic/more_on_lahiri_ayanamsha/73398209
Spica's true longitude vs the Lahiri construction (~1° gap) — https://en.wikipedia.org/wiki/Ayan%C4%81%E1%B9%83%C5%9Ba
pytest-regressions tolerance API — https://pytest-regressions.readthedocs.io/en/latest/api.html
Standish & Williams, orbital ephemerides of the Sun, Moon and planets (ephemeris comparison method) — http://fgg-web.fgg.uni-lj.si/~/mkuhar/pouk/GA/Seminar/Zvezdni_katalogi_in_efemeride/JPL-DE_LE405-Orbital%20Ephemerides%20of%20the%20Sun,%20Moon,%20and%20Planets.pdf
