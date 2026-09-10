# Week 9: Dasha–Transit PDF Report Spec
Status: Implementation Complete
Last updated: 2026-09-04
Owner: Kiro (spec-driven)

---

## 1. Context

The 8-week plan is complete. Week 9 extends it with a focused deliverable that compounds
Week 7 (Dasha+Transit Correlation) — the ability to export the correlation result as a
professional PDF report.

---

## 2. Goals

Deliver a production-quality PDF export service for the Dasha+Transit correlation result that:
- Generates a structured 2-4 page PDF from a DashaTransitCorrelationResult
- Includes: active dasha banner, transit table (9 planets), 12-month outlook, disclaimer
- Supports English + Hindi language toggle
- Works in the browser (no server required) via jsPDF
- Has zero @ts-nocheck — fully typed
- Has complete unit tests (pure function coverage, no DOM required)
- Is wired into DashaTransitCorrelationPage as an "Export PDF" button

---

## 3. Requirements

### R1 — dashaTransitPdfService.ts
- `src/services/dashaTransitPdfService.ts`
- `exportDashaTransitPdf(result, options)` — main entry point
  - Input: `DashaTransitCorrelationResult` + `{ lang, nativeName }`
  - Output: triggers browser PDF download
- `buildPdfContent(result, options)` — pure function returning structured content object
  - Testable without jsPDF (returns data, not a side effect)
  - Output: `PdfContent` interface with sections array

### R2 — PdfContent types
- `PdfSection` union: `PdfTextSection | PdfTableSection | PdfDividerSection | PdfScoreSection`
- All types fully typed — no `any` without explicit justification

### R3 — DashaTransitCorrelationPage integration
- Add "Export PDF" button after result appears
- Shows loading state while PDF generates
- Error handled gracefully (toast on failure)

### R4 — Week 9 tests
- `src/tests/week9/dashaTransitPdf.test.ts`
- Tests for `buildPdfContent()` — pure function, no browser required:
  - Returns correct section count
  - Active dasha section contains mahaLord + antarLord
  - Transit table section has 9 rows
  - Monthly outlook section has 12 items
  - Hindi labels appear when lang=hi

---

## 4. Design

### buildPdfContent return shape
```ts
interface PdfContent {
  title: string;
  subtitle: string;
  metadata: { nativeName: string; targetDate: string; moonSign: string; generatedAt: string }
  sections: PdfSection[];
}

type PdfSection =
  | { type: 'heading';   text: string }
  | { type: 'text';      text: string }
  | { type: 'divider' }
  | { type: 'kv';        rows: { label: string; value: string }[] }
  | { type: 'table';     headers: string[]; rows: string[][] }
  | { type: 'score';     score: number; level: string; label: string }
  | { type: 'outlook';   items: { month: string; level: string; score: number }[] }
```

---

## 5. Acceptance Criteria

- [x] buildPdfContent() is a pure function — no side effects, fully testable
- [x] exportDashaTransitPdf() triggers PDF download using jsPDF
- [x] PDF contains: dasha section, correlation score, transit table, 12-month outlook
- [x] Hindi labels appear when lang='hi'
- [x] DashaTransitCorrelationPage shows "Export PDF" button after result
- [x] Week 9 tests pass
- [x] Full test suite passes
- [x] Build passes
