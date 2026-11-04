# Varga conventions

Varga mapping is not universal — Parashari, Jaimini and KP differ, and JHora
exposes configuration for it. A golden corpus is worthless unless the convention
is pinned first, so this document _is_ the specification: the independent
transform in `tools/accuracy/lib/varga.mjs` is written from it, and the gate
(`src/tests/accuracy/varga.test.ts`) compares the shipped engine against that
transform.

## Base quantities

    s   = floor(siderealLongitude / 30)     // sign index 0..11 (Aries = 0, Meena = 11)
    d   = siderealLongitude mod 30          // 0..30, degrees within the sign
    odd = (s mod 2 === 0)                   // Aries is the first (odd) sign

Sign indices are 0-based throughout, matching `shadbalaReference.mjs` and the
engine's `VargaPosition.vargaRashi`. Classical texts number signs 1..12, so add 1
when reading against a printed table.

## Vargas in this slice

| Key | Name             | Rule                                                                               |
| --- | ---------------- | ---------------------------------------------------------------------------------- |
| D2  | Hora             | two 15° halves; odd sign → Leo/Cancer, even sign → Cancer/Leo                      |
| D3  | Drekkana         | three 10° parts from the sign, the 5th, the 9th (+4 each)                          |
| D7  | Saptamsha        | seven 30/7° parts; odd signs from the sign, even signs from the 7th                |
| D10 | Dashamsha        | ten 3° parts; odd signs from the sign, even signs from the 9th                     |
| D12 | Dwadashamsha     | twelve 2.5° parts counted from the sign                                            |
| D20 | Vimshamsha       | twenty 1.5° parts; movable from Aries, fixed from Leo, dual from Sagittarius       |
| D24 | Chaturvimshamsha | twenty-four 1.25° parts; odd signs from Leo, even signs from Cancer                |
| D30 | Trimshamsha      | five unequal parts; the odd/even tables differ                                     |
| D40 | Khavedamsha      | forty 0.75° parts; odd signs from Aries, even signs from Libra                     |
| D45 | Akshavedamsha    | forty-five 30/45° parts; movable from Aries, fixed from Leo, dual from Sagittarius |
| D60 | Shashtiamsha     | sixty 0.5° parts counted from the sign                                             |

## Closed forms

The oracle (`tools/accuracy/lib/varga.mjs`) implements exactly these:

    D2:  odd === (d < 15) ? 4 : 3
    D3:  (s + [0,4,8][floor(d/10)]) mod 12
    D7:  (7*s + floor(d / (30/7))) mod 12
    D10: ((odd ? s : s + 8) + floor(d / 3)) mod 12
    D12: (s + floor(d / 2.5)) mod 12
    D20: ([0,4,8][s mod 3] + floor(d / 1.5)) mod 12
    D24: ((odd ? 4 : 3) + floor(d / 1.25)) mod 12
    D30: odd  — d<5→0,  d<10→10, d<18→8,  d<25→2,  else 6
         even — d<5→6,  d<12→2,  d<20→8,  d<25→10, else 0
    D40: ((odd ? 0 : 6) + floor(d / 0.75)) mod 12
    D45: ([0,4,8][s mod 3] + floor(d / (30/45))) mod 12
    D60: (s + floor(d / 0.5)) mod 12

`[0,4,8]` is Aries / Leo / Sagittarius — the movable / fixed / dual starts.

## Engine divergence (recorded, not tolerated)

The shipped engine (`src/services/divisionalChartsService.ts`) implements special
rules for D2, D3, D9, D12 and D30 only. Every other division falls through to
`(s * division + part) mod 12`, which is _not_ the classical rule for D10, D20,
D24, D40, D45 or D60. The gate pins each divergence explicitly (the `DEF-VARGA-*`
block in `varga.test.ts`) so it cannot be silently forgotten; fixing the engine
must update that block and this document in the same change.

| Key | Engine (generic fall-through)         | Classical                                    | Status |
| --- | ------------------------------------- | -------------------------------------------- | ------ |
| D10 | `(10s + part) mod 12`                 | odd from sign, even from the 9th             | DEF    |
| D20 | `(20s + part) mod 12`                 | movable Aries / fixed Leo / dual Sagittarius | DEF    |
| D24 | `(24s + part) mod 12` ≡ `part mod 12` | odd Leo / even Cancer                        | DEF    |
| D40 | `(40s + part) mod 12`                 | odd Aries / even Libra                       | DEF    |
| D45 | `(45s + part) mod 12`                 | movable Aries / fixed Leo / dual Sagittarius | DEF    |
| D60 | `(60s + part) mod 12` ≡ `part mod 12` | counted from the sign                        | DEF    |

Divisions that agree exactly today: **D2, D3, D7, D12, D30**.

## JHora cross-check configuration

The reference export uses Parashari with the classical starts tabulated above and
the mean node. Longitudes come from the Lahiri `swisseph-wasm` values already
committed under `tools/accuracy/golden/`; the corpus hash and ayanamsa are copied
into `tools/accuracy/golden/varga/manifest.json` under `convention`, `ayanamsa`
and `corpusHash`. Any deviation from this document must be recorded there.

## Non-goals

D1, D4, D5, D6, D8, D9, D11, D16, D27, D32 and D50 are not in this slice. D9 is
already shipped and joins the corpus in a later PR (ACC-01b) to keep this change's
blast radius small.
