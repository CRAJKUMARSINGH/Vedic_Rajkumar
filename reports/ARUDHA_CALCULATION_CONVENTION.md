# ARUDHA CALCULATION CONVENTION — 2026-11-19

Engine: `src/services/jaiminiService.ts::calculateArudhaPada`
(houseNumber, ascendantRashi, planets) → PadaLagna.

Convention (single-lord map, sidereal rashi indices 0–11):
- target sign = (ascendantRashi + houseNumber − 1) mod 12
- lord = RASHI_LORDS[target] (Mars/Venus/Mercury/Moon/Sun/Jupiter/Saturn;
  one lord per sign — Capricorn→Saturn, Aquarius→Saturn, Sagittarius→
  Jupiter, Pisces→Jupiter, Aries→Mars, Libra→Mars; co-lord traditions
  NOT merged)
- distance = inclusive sign count target→lord (1..12)
- unadjusted = advance same inclusive distance from lord
- exception: result == target or target+6 → +10 signs

FINDING (OPEN): the +10 exception is mathematically unreachable —
unadjusted offset = 2d−1 (mod 12) is always odd, never 0 or 6.
Dead code; alternative BPHS/exception conventions need authoritative
review before changing. Test documents this (148/148 pass).

Matrix: 12 asc × 12 lord positions table-driven in
`src/tests/arudha.test.ts` — PASS.
