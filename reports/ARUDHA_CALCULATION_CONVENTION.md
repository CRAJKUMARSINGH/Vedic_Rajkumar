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

## Phase-2 resolution analysis (CODEX2, 2026-11-19)

Authoritative references reviewed (BPHS ch.29, Jaimini Sutras 1.1.30–32,
Parashara/Santhanam summaries):

1. Ordinary rule: count INCLUSIVELY house→lord (d), then count d signs
   onward from lord. Sources differ on whether the second count includes
   the lord's sign — code uses inclusive (lordSign + d − 1).
2. Result exception (BPHS 29.4): pada in source sign → 10th from it;
   pada in 7th → 4th from source. Under inclusive-advance the result
   offset is 2d−1 (always odd) → can NEVER be 0 or 6 → exception dead.
   Under EXCLUSIVE-advance (lordSign + d) offset = 2d (even) → 0/6
   reachable → exception meaningful. This strongly suggests the second
   count should be exclusive, i.e. code likely off-by-one.
3. Swasthe exception (alternate convention): LORD in 1st → pada = 10th
   from house; LORD in 7th → pada = 4th. Different trigger entirely.

DECISION: convention NOT changed (per CODEX2 §2 — verify before
replacing). Engine kept as-is; exception documented dead-code. Recommended
convention for owner sign-off: inclusive house→lord, EXCLUSIVE lord→pada,
result-in-1st → +9 (10th), result-in-7th → +3 (4th) per BPHS 29.4/29.5.
Public API preserved.
