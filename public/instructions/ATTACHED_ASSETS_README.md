# Attached assets — documentation index

Use this folder as the **single entry point** for long-form planning and design notes that are not part of the app runtime.

## Start here

| File | Use |
|------|-----|
| [MERGED_DOCUMENTATION.md](./MERGED_DOCUMENTATION.md) | Hub: links and overview of project documentation |
| [VEDIC_PROJECT_ANALYSIS_AND_TASKS.md](./VEDIC_PROJECT_ANALYSIS_AND_TASKS.md) | Analysis, priorities, and task backlog |

## Deep-dive archives (large)

These files are **kept separate** because each is thousands of lines; merging them into one file would be harder to navigate than a clear index.

| File | Topic |
|------|--------|
| [BV_RAMAN_MAGAZINE_ENHANCEMENT_PLAN.md](./BV_RAMAN_MAGAZINE_ENHANCEMENT_PLAN.md) | BV Raman magazine integration |
| [TRIPLE_HYBRID_MASTER_PLAN.md](./TRIPLE_HYBRID_MASTER_PLAN.md) | Hybrid architecture / roadmap |
| [design.md](./design.md) | Design notes |

## App code consolidation (April 2026)

Duplicate feature **routes** were folded into canonical pages:

- `/dasha` — chart-based dasha + “Extended dashboard” tab (former `/vimshottari-dasha`)
- `/ashtakavarga` — chart Ashtakavarga + extended tab (former `/enhanced-ashtakavarga`)
- `/yogas` — chart yogas + extended tab (former `/yogas-identification`)

Old URLs still work via redirects in `App.tsx`.
