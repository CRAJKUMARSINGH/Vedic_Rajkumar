# VPAT / ACR — WCAG 2.1 Level AA

**Owner:** Frontend Lead · **Version:** 2.4 · **Date:** 2026-11-01 · **Method:** axe-core automated + manual pass

Statuses are honest. `Not Evaluated` is used where no evidence exists yet — a
false "Supports" is worse than a gap.

| #      | Criterion              | Level | Status             | Evidence / note                                         |
| ------ | ---------------------- | ----- | ------------------ | ------------------------------------------------------- |
| 1.1.1  | Non-text content       | A     | Partially Supports | chart SVG has a text alternative; `AccessibleChart.tsx` |
| 1.3.1  | Info and relationships | A     | Supports           | semantic landmarks; axe clean                           |
| 1.4.3  | Contrast (minimum)     | AA    | Partially Supports | Hindi/Devanagari path not audited                       |
| 1.4.10 | Reflow                 | AA    | Supports           | mobile layout                                           |
| 2.1.1  | Keyboard               | A     | Partially Supports | Radix primitives; full-route traversal not audited      |
| 2.4.1  | Bypass blocks          | A     | Supports           | skip link                                               |
| 2.4.7  | Focus visible          | AA    | Supports           | Radix focus ring                                        |
| 3.3.1  | Error identification   | A     | Supports           | form errors are announced                               |
| 3.3.2  | Labels or instructions | A     | Supports           | every birth input has a label + micro-help              |
| 4.1.2  | Name, role, value      | A     | Supports           | axe clean on scanned components                         |
| 4.1.3  | Status messages        | AA    | Not Evaluated      | chart result live region                                |

## Automated coverage

`src/tests/a11y/axe.test.tsx` — axe-core, serious + critical blocking.
Covers: ConsentBanner, UpgradeBanner. Expanding coverage is tracked, not claimed.

## Manual coverage

Not yet done: full keyboard traversal per route, screen-reader announcement of the
Prashna verdict, colour contrast in the Devanagari path, and the SVG chart.

## Statement for procurement

> Automated axe-core scans pass with zero serious/critical violations on the
> scanned components. Manual WCAG 2.1 AA evaluation is partially complete; the
> chart SVG and the Hindi rendering path remain unevaluated. No third-party
> accessibility audit has been performed.
