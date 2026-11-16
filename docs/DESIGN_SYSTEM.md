# DESIGN SYSTEM — Vedic Rajkumar

Two cooperating token layers (do not create a third):

## 1. `--auspicious-*` (HSL triplets) — app-wide theme

Defined in `src/index.css` `:root`/`.dark`. Drives cards, headers, sacred
geometry, financial/element indicators via `hsl(var(--x) / α)` utilities.
Used by most feature pages — treat as the canonical theme.

## 2. `--vedic-*` (hex) — premium landing palette (added 2026-11-16)

```css
--vedic-bg: #fff8eb; /* warm paper */
--vedic-ink: #191631; /* deep violet-ink */
--vedic-surface: #292344; /* dark surface */
--vedic-saffron: #e7b65a; /* primary accent */
--vedic-violet: #8f70c8; /* secondary accent */
--vedic-terracotta: #b8614d; /* warm accent */
--vedic-white: #ffffff;
--radius-card: 18px;
--radius-button: 10px;
```

Utilities: `.vedic-hero` (hero gradient + glows), `.vedic-hero-accent`,
`.vedic-card-premium`. Use `text-[var(--vedic-saffron)]` /
`border-[#B8614D]/30` style arbitrary values for one-off accents.

## Rules

- New feature UI → `--auspicious-*`/shadcn tokens. Landing/marketing surfaces →
  `--vedic-*`.
- Devanagari: `font-hindi` (Noto Sans Devanagari via `@fontsource`).
- Dark mode: `.dark` overrides shadcn tokens; vedic hexes are theme-agnostic.
- Do not hardcode new brand colors — extend a token layer instead.
