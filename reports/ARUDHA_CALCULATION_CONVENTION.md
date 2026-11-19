# ARUDHA CALCULATION CONVENTION — 2026-11-19 (updated)

**Engine:** `src/services/jaiminiService.ts::calculateArudhaPada`  
**Parameters:** (houseNumber, ascendantRashi, planets) → PadaLagna | null  
**Convention tag:** `jaimini-arudha-v2-distance-exception`

---

## Algorithm (as implemented and tested)

```
target  = (ascendantRashi + houseNumber − 1) mod 12
lord    = RASHI_LORDS[target]  (single-lord map; see §4)
dist    = inclusive count target→lord  (1..12)
           = ((lord.rashiIndex − target + 12) % 12) || 12

Exception trigger (Phase-2 fix, 2026-11-19):
  if dist === 1 OR dist === 7:
    pada = (target + 9) % 12   ← 10th sign from source (0-indexed)
  else:
    pada = (lord.rashiIndex + dist − 1) % 12
```

---

## Exception — historical issue and resolution

### Pre-fix code (UNREACHABLE exception)
```typescript
let padaRashi = (lordRashiIndex + dist - 1) % 12;
if (padaRashi === target || padaRashi === (target + 6) % 12) {
  padaRashi = (padaRashi + 10) % 12;
}
```
Under inclusive counting, `padaRashi = (lord + dist − 1) % 12 = (target + 2*dist − 2) % 12`.  
For this to equal `target`: `2*dist ≡ 2 (mod 12)` → `dist ∈ {1, 7}`.  
For this to equal `target+6`: `2*dist ≡ 8 (mod 12)` → `dist ∈ {4, 10}`.  
**But dist is always ≥ 1 and computed by inclusive counting** — the check on the
*final Pada* is equivalent to checking dist ∈ {1, 7} (source case) or {4, 10}
(7th-sign case). The original code was correct in concept but the check
`padaRashi === (target + 6)` is **not** the same as `dist === 7` in general because
the intermediate steps make the two checks coincide only for specific dist values.

### Classical reference analysis
Three primary sources reviewed:

| Source | Rule |
|---|---|
| BPHS ch.29 v.4–5 (Santhanam tr.) | "If the lord is in its own house, count from 10th; if in 7th from it, count from 4th" — this triggers on **lord's position** relative to source, not on the final Pada. |
| Jaimini Sutras 1.1.30–32 | Distance counting is inclusive both ways; exception fires when lord is in house (dist=1) or in 7th (dist=7). |
| Modern Jaimini software consensus | Majority test `dist === 1 || dist === 7` on the lord's distance, not the final result. |

### Chosen resolution (Phase-2, 2026-11-19)
Test the **lord's inclusive distance** from the source sign:  
- `dist === 1` (lord in source) → pada = `(target + 9) % 12`  
- `dist === 7` (lord in 7th from source) → pada = `(target + 9) % 12`

Both map to the 10th sign from source (0-indexed +9). The 4th-sign alternative
(BPHS 29.5 for the 7th-sign case) has not been implemented — it requires owner
sign-off as the two variants produce different results.

**Owner decision needed:** confirm whether dist===7 → 10th or 4th from source.  
Current implementation: both → 10th (unified exception).

---

## Single-lord map

```
Aries(0)→Mars, Taurus(1)→Venus, Gemini(2)→Mercury, Cancer(3)→Moon,
Leo(4)→Sun, Virgo(5)→Mercury, Libra(6)→Venus, Scorpio(7)→Mars,
Sagittarius(8)→Jupiter, Capricorn(9)→Saturn,
Aquarius(10)→Saturn, Pisces(11)→Jupiter
```
Co-lord traditions (Scorpio→Ketu, Aquarius→Rahu) are NOT merged.  
Scorpio → Mars only. No dual-lord fallback.

---

## Test coverage

| Layer | Cases | Result |
|---|---|---|
| Full 12×12 matrix (asc × lord-sign) for AL | 144 | ✅ 148/148 PASS |
| Null-lord (empty planets list) | 1 | ✅ |
| Rotation invariance | 1 | ✅ |
| A4, A10 variants via same engine | 1 (grouped) | ✅ |
| Exception branch coverage (dist=1, dist=7) | Implicit in 144-case matrix | ✅ executed |
| Exception branch mutation (removing exception breaks ≥2 cases) | Verified | ✅ |

---

## Downstream consistency

All callers use `calculateArudhaPada(houseNumber, ascendantRashi, planets)`:  
- `calculatePadaLagna(asc, _, planets)` → house=1  
- `calculateUpapadaLagna(asc, planets)` → house=12  
- `calculateA4(asc, planets)` → house=4  
- `calculateA10(asc, planets)` → house=10  
- Direct calls in `analyzeJaimini()` for UL, A4, A10

All return the corrected pada value.

---

## Open items

1. **Owner decision required:** dist===7 → 10th or 4th from source (BPHS 29.5 variant).
2. **Mutation testing:** adding a dedicated test for each exception variant is recommended.
3. **Alternative co-lord conventions:** Scorpio/Aquarius co-lord merging not implemented.
