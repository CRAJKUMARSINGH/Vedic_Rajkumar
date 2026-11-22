# Patch 02 — Harden Confidence + Kill Hedging (Answer Quality)

**Files to touch:**

- `src/services/answerCard/confidence.ts` (or deriveConfidenceV2 location)
- `src/services/answerCard/answerComposer.ts` / `verdictNormalizer.ts`
- `src/services/interpretationEngine.ts` (layer that produces executiveVerdict)

## 1. Hard input-quality caps (already partially present — make them mandatory)

```ts
// confidence.ts — add or strengthen
export function applyInputQualityCaps(
  base: number,
  meta: {
    timeKnown: boolean;
    placeKnown: boolean;
    engine: "swiss" | "portable" | "degraded";
  },
): number {
  let c = base;
  if (!meta.timeKnown) c = Math.min(c, 55); // approximate time
  if (!meta.placeKnown) c = Math.min(c, 45);
  if (meta.engine === "degraded") c = Math.min(c, 60);
  if (meta.engine === "portable") c = Math.min(c, 85);
  return Math.max(0, Math.min(100, Math.round(c)));
}
```

Always display the basis string next to the confidence badge:

```
Confidence 62% · birth time approximate · portable ephemeris
```

## 2. Post-processor that removes hedging

```ts
// verdictNormalizer.ts
const HEDGE_MAP: Record<string, string> = {
  "may indicate": "indicates",
  "could suggest": "suggests",
  "might be": "is",
  possibly: "",
  perhaps: "",
  "it appears that": "",
  "there is a chance that": "",
};

export function killHedging(text: string): string {
  let out = text;
  for (const [soft, hard] of Object.entries(HEDGE_MAP)) {
    out = out.replace(new RegExp(soft, "gi"), hard);
  }
  return out.replace(/\s{2,}/g, " ").trim();
}
```

Call it on every executiveVerdict and thereforeClause before they reach the Answer Card.

## 3. Early exit for low-promise cases

In the orchestrator, after Layer 1 (Natal Promise):

```ts
if (!natalPromise.promised && confidence < 35) {
  return {
    executiveVerdict:
      "The natal chart does not promise this outcome with usable strength. Further analysis would be speculative.",
    confidence: confidence,
    // still return remedies that strengthen the relevant houses
  };
}
```

This protects basic users from over-confident nonsense.
