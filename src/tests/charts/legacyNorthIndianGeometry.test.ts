/**
 * Geometry sanity tests for the legacy NorthIndianChart polygon table (NORTH_INDIAN).
 *
 * These tests run on the raw data constants, not the React component, so they
 * have no DOM dependency and run fast in Vitest's node environment.
 *
 * Rules checked:
 *   1. Exactly 12 entries, one per house (1–12).
 *   2. Each polygon has ≥ 3 coordinate pairs (non-degenerate).
 *   3. Each coordinate pair holds two finite numbers within the 440×400 viewBox.
 *   4. No two polygons share identical point strings (no silent copy-paste duplicates).
 *   5. Text anchor (tx, ty) lies inside the declared viewBox.
 *   6. House-number anchor (hx, hy) lies inside the declared viewBox.
 */

// ---------------------------------------------------------------------------
// Inline the NORTH_INDIAN table so this test has zero runtime coupling to the
// component. If the component is later refactored the test must be updated
// alongside it — that is intentional; it makes changes visible.
// ---------------------------------------------------------------------------
const NORTH_INDIAN = [
  { id: 1,  pts: '220,10 410,10 310,110 220,110', tx: 278, ty: 55,  hn: '१', hx: 252, hy: 26  },
  { id: 2,  pts: '410,10 430,10 430,110 310,110', tx: 395, ty: 65,  hn: '२', hx: 412, hy: 20  },
  { id: 3,  pts: '430,10 430,200 330,200 430,10',  tx: 410, ty: 100, hn: '३', hx: 422, hy: 100 },
  { id: 4,  pts: '430,200 430,390 330,200 430,200',tx: 410, ty: 295, hn: '४', hx: 422, hy: 300 },
  { id: 5,  pts: '430,390 310,290 220,390 430,390',tx: 370, ty: 355, hn: '५', hx: 412, hy: 382 },
  { id: 6,  pts: '220,390 310,290 130,290 220,390',tx: 220, ty: 360, hn: '६', hx: 222, hy: 390 },
  { id: 7,  pts: '130,290 10,390 220,390 130,290', tx: 110, ty: 355, hn: '७', hx: 50,  hy: 382 },
  { id: 8,  pts: '10,390 10,200 130,200 10,390',   tx: 42,  ty: 295, hn: '८', hx: 18,  hy: 300 },
  { id: 9,  pts: '10,200 10,10 130,200 10,200',    tx: 42,  ty: 100, hn: '९', hx: 18,  hy: 100 },
  { id: 10, pts: '10,10 130,10 130,110 10,110',    tx: 72,  ty: 65,  hn: '१०', hx: 25, hy: 20  },
  { id: 11, pts: '130,10 220,10 220,110 130,110',  tx: 165, ty: 65,  hn: '११', hx: 148, hy: 20  },
  { id: 12, pts: '220,10 310,10 310,110 220,110',  tx: 265, ty: 65,  hn: 'ल',  hx: 252, hy: 26  },
] as const;

const VIEWBOX_W = 440;
const VIEWBOX_H = 400;

/** Parse "x1,y1 x2,y2 …" into [[x1,y1],[x2,y2],…]. */
function parsePoints(pts: string): [number, number][] {
  return pts.trim().split(/\s+/).map(pair => {
    const [x, y] = pair.split(',').map(Number);
    return [x, y];
  });
}

/** Deduplicate consecutive-identical points (polygon may repeat the first to close). */
function uniquePoints(pairs: [number, number][]): [number, number][] {
  const seen = new Set<string>();
  return pairs.filter(([x, y]) => {
    const k = `${x},${y}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

describe('Legacy NorthIndianChart — NORTH_INDIAN polygon table', () => {
  it('has exactly 12 entries', () => {
    expect(NORTH_INDIAN).toHaveLength(12);
  });

  it('contains houses 1 through 12 with no gaps or duplicates', () => {
    const ids = NORTH_INDIAN.map(h => h.id).sort((a, b) => a - b);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it.each(NORTH_INDIAN)('house $id has ≥ 3 unique coordinate pairs', ({ id, pts }) => {
    const pairs = uniquePoints(parsePoints(pts));
    expect(pairs.length, `house ${id} polygon is degenerate`).toBeGreaterThanOrEqual(3);
  });

  it.each(NORTH_INDIAN)('house $id coordinates are finite and inside the viewBox', ({ id, pts }) => {
    for (const [x, y] of parsePoints(pts)) {
      expect(Number.isFinite(x), `house ${id}: x=${x} is not finite`).toBe(true);
      expect(Number.isFinite(y), `house ${id}: y=${y} is not finite`).toBe(true);
      expect(x, `house ${id}: x=${x} outside viewBox width`).toBeGreaterThanOrEqual(0);
      expect(x, `house ${id}: x=${x} outside viewBox width`).toBeLessThanOrEqual(VIEWBOX_W);
      expect(y, `house ${id}: y=${y} outside viewBox height`).toBeGreaterThanOrEqual(0);
      expect(y, `house ${id}: y=${y} outside viewBox height`).toBeLessThanOrEqual(VIEWBOX_H);
    }
  });

  it('no two polygons share identical point strings', () => {
    const ptStrings = NORTH_INDIAN.map(h => h.pts);
    const unique = new Set(ptStrings);
    expect(unique.size).toBe(ptStrings.length);
  });

  it.each(NORTH_INDIAN)('house $id text anchor is inside the viewBox', ({ id, tx, ty }) => {
    expect(tx, `house ${id}: tx=${tx}`).toBeGreaterThanOrEqual(0);
    expect(tx, `house ${id}: tx=${tx}`).toBeLessThanOrEqual(VIEWBOX_W);
    expect(ty, `house ${id}: ty=${ty}`).toBeGreaterThanOrEqual(0);
    expect(ty, `house ${id}: ty=${ty}`).toBeLessThanOrEqual(VIEWBOX_H);
  });

  it.each(NORTH_INDIAN)('house $id house-number anchor is inside the viewBox', ({ id, hx, hy }) => {
    expect(hx, `house ${id}: hx=${hx}`).toBeGreaterThanOrEqual(0);
    expect(hx, `house ${id}: hx=${hx}`).toBeLessThanOrEqual(VIEWBOX_W);
    expect(hy, `house ${id}: hy=${hy}`).toBeGreaterThanOrEqual(0);
    expect(hy, `house ${id}: hy=${hy}`).toBeLessThanOrEqual(VIEWBOX_H);
  });
});
