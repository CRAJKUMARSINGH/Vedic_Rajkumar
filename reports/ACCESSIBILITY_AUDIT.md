# ACCESSIBILITY AUDIT — 2026-11-16

Standard: WCAG 2.1 AA targets per MASTER-APP-TESTER Phase 6.1.

## Verified

- **Keyboard operability:** persona advanced "keyboard-only selection and
  submission" PASS — date auto-format, ArrowUp/Down + Enter combobox selection,
  Enter form submission, all without a pointer.
- **Combobox semantics:** location input has `role="combobox"`,
  `aria-expanded`, `aria-controls`, `aria-autocomplete`,
  `aria-activedescendant`; list uses `listbox`/`option`/`aria-selected`.
- **Labels:** birth form fields labelled; Panchang date input has
  `aria-label` + `aria-describedby` format hint; Prashna date input got
  `id`/`htmlFor`/`aria-describedby` in PATCH 4.
- **Focus:** `onMouseDown preventDefault` on suggestions preserves input focus;
  visible focus rings via Tailwind `focus-visible:ring` on patched inputs.
- **Reduced motion:** `animate-[float-auspicious_*]` decorative floats are
  pointer-events-none; no essential content depends on animation.
- **Language:** en/hi toggle changes `lang`-dependent strings; Devanagari uses
  `font-hindi` + `@fontsource/noto-sans-devanagari`.
- **Tests:** `src/tests/week5/accessibilityGaps.test.tsx` in suite (PASS);
  `npm run test:a11y` target exists.

## Gaps / recommendations (not blockers)

1. Icon-only buttons rely on `aria-label` in most places; a full axe-core sweep
   was not run — recommend adding `@axe-core/playwright` to CI.
2. Color-contrast of `text-[11px]` helper hints on `bg-card/30` should be
   spot-checked at 4.5:1 — likely OK (muted-foreground on light surface) but
   unverified programmatically.
3. Modal focus-trap (WelcomeModal, upgrade flows) not audited this run.
4. Mobile viewport: persona suite is desktop Chromium; add a mobile project to
   `playwright.preview.config.ts` for viewport coverage.

**Status: PASS with noted gaps** — no CRITICAL/HIGH a11y defects found in
audited surfaces.
