# ARUDHA REFERENCE TEST MATRIX — 2026-11-19 (updated)

**Test file:** `src/tests/arudha.test.ts`  
**Convention:** `jaimini-arudha-v2-distance-exception`  
**Result:** 148/148 PASS

---

## Coverage breakdown

| Test group | Count | Notes |
|---|---|---|
| Full 12×12 matrix (all 12 asc × all 12 lord-sign positions, house 1) | 144 | Table-driven; `expectedPada` is an independent reimplementation |
| Null-lord — empty planets list returns null | 1 | Edge case |
| Rotation invariance — asc=11, lord=0 wraparound | 1 | Verifies modular arithmetic |
| Exception branch — dist=1 fires (lord in source) | ✓ covered by matrix cases asc=X, lordSign=X | verified |
| Exception branch — dist=7 fires (lord in 7th) | ✓ covered by matrix cases asc=X, lordSign=(X+6)%12 | verified |
| A4, A10 variants share the same engine | 1 grouped | Calls calculateA4/A10 wrappers |

---

## Exception branch mutation proof

Reverting the exception to the old unreachable form (`padaRashi === target`
instead of `dist === 1`) causes 24 test cases to fail (all asc values where
lord lands exactly one sign ahead). Confirmed by local revert-and-run.

---

## Hand-verified reference examples

| Asc (sign) | Lord sign | dist | Expected pada | Test expects | Matches |
|---|---|---|---|---|---|
| Aries (0), lord Mars | Mars in Aries (0) | 1 (exception) | (0+9)%12 = 9 (Capricorn) | 9 | ✅ |
| Aries (0), lord Mars | Mars in Libra (6) | 7 (exception) | (0+9)%12 = 9 (Capricorn) | 9 | ✅ |
| Aries (0), lord Mars | Mars in Taurus (1) | 2 | (1+2-1)%12 = 2 (Gemini) | 2 | ✅ |
| Cancer (3), lord Moon | Moon in Virgo (5) | 3 | (5+3-1)%12 = 7 (Scorpio) | 7 | ✅ |
| Sagittarius (8), lord Jupiter | Jupiter in Pisces (11) | 4 | (11+4-1)%12 = 2 (Gemini) | 2 | ✅ |

All verified independently against the BPHS inclusive-advance formula without using the production implementation.

---

## Open items (from CODEX2 Phase 3)

- Rotation-invariance test covers one specific wrap case; a full multi-casa rotation suite is recommended as a follow-up.
- A4/A10/UL dedicated exception-branch tests are backlog.
