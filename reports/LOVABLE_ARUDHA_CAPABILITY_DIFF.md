# LOVABLE ARUDHA CAPABILITY DIFF — 2026-11-19 (CODEX classification)

Lovable source: BLOCKED (no export). Existing engine audited per §3.

| Feature | Class | Evidence |
|---|---|---|
| Sign-distance Arudha calc | ALREADY IMPLEMENTED | jaiminiService.calculateArudhaPada |
| A4/A10/Upapada variants | ALREADY IMPLEMENTED | wrappers lines ~326-341 |
| Inclusive counting + wraparound | ALREADY IMPLEMENTED + TESTED | arudha.test.ts 148/148 |
| Self/seventh +10 exception | MATHEMATICALLY UNVERIFIED | unreachable under current formula — OPEN, documented |
| Single-lord map (no co-lord merge) | ALREADY IMPLEMENTED | RASHI_LORDS in engine |
| Manual sign-entry mode | NOT REQUIRED | computed mode only per spec |
| TanStack Start port | INCOMPATIBLE | rejected per §5 |
| Bilingual EN/HI UI | ALREADY IMPLEMENTED | /jaimini, /supplements/jaimini |
| "Why this interpretation?" toggle | REQUIRES ADAPTATION | interpretive text exists; per-claim trace toggle = backlog |
| Navratri N4–N9 provenance | REUSABLE | n9Raksha gate wired into HoroscopeCard |
| Calculated vs AI vs unavailable labels | PARTIAL | provenance claims typed; UI labels backlog |
