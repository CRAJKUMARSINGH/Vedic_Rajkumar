# LOVABLE ARUDHA CAPABILITY DIFF — 2026-11-19

Lovable source: NOT accessible (export unavailable) → independent
implementation against spec. Existing engine reused — no second calculator.

| Candidate feature | Target equivalent | Decision |
|---|---|---|
| Arudha sign calc (sign-distance + self/7th exception) | `jaiminiService.calculateArudhaPada` (+A4/A10/UL wrappers) | ADAPT — reused; convention documented |
| Manual sign entry mode | n/a — target computes from chart | REJECT manual-only mode; computed mode only |
| Planet influences per house | JaiminiPanel padas + navratri N4–N9 provenance pipeline | ADAPT — existing + N9 gate wired in HoroscopeCard |
| Bilingual EN/HI reading | JaiminiPage `/jaimini`, `/supplements/jaimini` (RASHI_NAMES_HI) | ALREADY SATISFIED |
| TanStack Start migration | React/Vite app | REJECT per patch §4 |
| Forecast sections (image/work/resources/relations) | JaiminiPanel pada narratives + N7 Vani | PARTIAL — interpretive depth documented as backlog |
| Provenance/tradition claims | `provenanceContract.ts` + n9Raksha gate | ADAPT — gate wired into HoroscopeCard (uncommitted→committed) |
