# VISUAL REGRESSION — 2026-11-16

## Changes made to visuals this run

1. **Vedic design tokens** added to `src/index.css` `:root`:
   `--vedic-bg #FFF8EB`, `--vedic-ink #191631`, `--vedic-surface #292344`,
   `--vedic-saffron #E7B65A`, `--vedic-violet #8F70C8`, `--vedic-terracotta
#B8614D`, `--vedic-white`, `--radius-card 18px`, `--radius-button 10px`.
   They extend — not replace — the existing `--auspicious-*` theme.
2. **New utilities:** `.vedic-hero` (ink→surface gradient + saffron/violet
   radial glows), `.vedic-hero-accent`, `.vedic-card-premium`.
3. **Index hero** restyled to `.vedic-hero`; accent headline uses
   `--vedic-saffron`. Prashna card → terracotta family, Eternal Knowledge card
   → violet family; buttons use token colors.

## Verification

- `tsc --noEmit` clean; `npm run build` exit 0 (223 precache entries).
- Persona e2e suite exercises the home page (basic #1, calc #3, en/hi #4) —
  all PASS after the restyle; screenshots in `reports/persona/screenshots/`.
- No chart-legibility impact: KundliChart/tab content untouched; hero is
  decorative chrome above the form.

## PWD Tools reference

Not inspected via browser this run (no separate repo access in scope); PWD
tokens were **not** applied to this app per directive. Recorded as future
inspiration only.

## Remaining visual risks

- Dark-mode hero: `.vedic-hero` uses fixed dark hexes — acceptable (hero is a
  branded dark band in both themes) but worth a visual check in `.dark`.
- No pixel-diff baseline exists; recommend adding Playwright screenshot
  comparison (`toHaveScreenshot`) for the hero in CI.
