/**
 * vimshottariTimeline.test.ts — tests for the unified Vimshottari timeline API.
 *
 * Acceptance (roadmap N4): seed lord verified, and timing windows returned as data.
 */
import { describe, it, expect } from 'vitest';
import {
  buildVimshottariTree,
  findDashaChain,
  toTimingWindow,
  extractTimingWindows,
  dashaChainLabel,
  type DashaNode,
} from '@/lib/vimshottariTimeline';
import { DASHA_YEAR_DAYS } from '@/lib/vimshottari';

const SPAN = 360 / 27; // 13.3333° per nakshatra
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const BIRTH = new Date('1990-01-01T00:00:00Z');

/** Flatten every node in the tree. */
function flatten(nodes: DashaNode[]): DashaNode[] {
  return nodes.flatMap((n) => [n, ...flatten(n.children)]);
}

describe('buildVimshottariTree — seed lord (accuracy anchor)', () => {
  it('seeds Ketu at the start of Ashwini', () => {
    const tree = buildVimshottariTree(0, BIRTH);
    expect(tree.firstLord).toBe('Ketu');
    const first = tree.mahadashas[0];
    expect(first.lord).toBe('Ketu');
    expect(first.startMs).toBe(BIRTH.getTime());
    expect(first.durationDays).toBeCloseTo(7 * DASHA_YEAR_DAYS, 6);
  });

  it('seeds Mercury in Revati (three-quarters spent)', () => {
    const tree = buildVimshottariTree(26 * SPAN + 0.25 * SPAN, BIRTH);
    expect(tree.firstLord).toBe('Mercury');
  });

  it('starts the seed Mahadasha before birth when the nakshatra is half-spent', () => {
    const tree = buildVimshottariTree(SPAN / 2, BIRTH);
    const first = tree.mahadashas[0];
    // Half of Ketu (3.5 sidereal years) already elapsed at birth.
    expect(first.beforeBirth).toBe(true);
    expect(first.startMs).toBeCloseTo(BIRTH.getTime() - 3.5 * DASHA_YEAR_DAYS * MS_PER_DAY, 0);
    expect(first.endMs).toBeCloseTo(BIRTH.getTime() + 3.5 * DASHA_YEAR_DAYS * MS_PER_DAY, 0);
    expect(first.durationDays).toBeCloseTo(7 * DASHA_YEAR_DAYS, 6);
  });
});

describe('buildVimshottariTree — structure', () => {
  const tree = buildVimshottariTree(SPAN / 2, BIRTH);

  it('has nine contiguous Mahadashas totalling 120 sidereal years', () => {
    expect(tree.mahadashas).toHaveLength(9);
    const totalDays = tree.mahadashas.reduce((s, n) => s + n.durationDays, 0);
    expect(totalDays).toBeCloseTo(120 * DASHA_YEAR_DAYS, 6);
    for (let i = 1; i < tree.mahadashas.length; i++) {
      expect(tree.mahadashas[i].startMs).toBe(tree.mahadashas[i - 1].endMs);
    }
  });

  it('tiles each parent with 9 children that sum to the parent duration', () => {
    for (const node of flatten(tree.mahadashas)) {
      if (node.level === 3) {
        expect(node.children).toHaveLength(0);
        continue;
      }
      expect(node.children).toHaveLength(9);
      expect(node.children[0].startMs).toBe(node.startMs);
      expect(node.children[8].endMs).toBe(node.endMs);
      const sum = node.children.reduce((s, c) => s + c.durationDays, 0);
      expect(sum).toBeCloseTo(node.durationDays, 6);
      for (let i = 1; i < node.children.length; i++) {
        expect(node.children[i].startMs).toBe(node.children[i - 1].endMs);
      }
    }
  });

  it('starts each parent sub-sequence with the parent lord and cycles the 9 lords', () => {
    const maha = tree.mahadashas.find((n) => !n.beforeBirth)!;
    const lords = maha.children.map((c) => c.lord);
    expect(lords[0]).toBe(maha.lord);
    expect(new Set(lords).size).toBe(9);
  });
});

describe('findDashaChain', () => {
  const tree = buildVimshottariTree(SPAN / 2, BIRTH);

  it('returns a nested 3-level chain at birth', () => {
    const chain = findDashaChain(tree, BIRTH);
    expect(chain).toHaveLength(3);
    expect(chain.map((n) => n.level)).toEqual([1, 2, 3]);
    expect(chain[1].startMs).toBeGreaterThanOrEqual(chain[0].startMs);
    expect(chain[1].endMs).toBeLessThanOrEqual(chain[0].endMs);
    expect(chain[2].endMs).toBeLessThanOrEqual(chain[1].endMs);
    expect(dashaChainLabel(chain)).toBe(chain.map((n) => n.lord).join(' / '));
  });

  it('returns the node intervals that actually contain the queried instant', () => {
    const at = new Date('2015-06-15T12:00:00Z');
    const chain = findDashaChain(tree, at);
    expect(chain.length).toBeGreaterThan(0);
    for (const node of chain) {
      expect(at.getTime()).toBeGreaterThanOrEqual(node.startMs);
      expect(at.getTime()).toBeLessThan(node.endMs);
    }
  });

  it('is deterministic for the same input', () => {
    const a = buildVimshottariTree(SPAN / 2, BIRTH);
    const b = buildVimshottariTree(SPAN / 2, BIRTH);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

describe('timing windows', () => {
  const tree = buildVimshottariTree(0, BIRTH); // Ketu seed, first Mahadasha starts at birth

  it('expresses a node as start → peak (midpoint) → end', () => {
    const node = tree.mahadashas[0];
    const w = toTimingWindow(node);
    expect(w.start.getTime()).toBe(node.startMs);
    expect(w.end.getTime()).toBe(node.endMs);
    expect(w.peak.getTime()).toBeCloseTo((node.startMs + node.endMs) / 2, 0);
    expect(w.start.getTime()).toBeLessThan(w.peak.getTime());
    expect(w.peak.getTime()).toBeLessThan(w.end.getTime());
  });

  it('extracts all Antardashas overlapping a Mahadasha range, ordered and non-overlapping', () => {
    const maha = tree.mahadashas[0];
    const windows = extractTimingWindows(tree, 2, maha.start, maha.end);
    expect(windows).toHaveLength(9);
    expect(windows[0].level).toBe(2);
    for (let i = 1; i < windows.length; i++) {
      expect(windows[i].start.getTime()).toBeGreaterThanOrEqual(windows[i - 1].end.getTime());
    }
    // Every returned window is inside the queried Mahadasha.
    for (const w of windows) {
      expect(w.start.getTime()).toBeGreaterThanOrEqual(maha.startMs);
      expect(w.end.getTime()).toBeLessThanOrEqual(maha.endMs);
    }
  });

  it('filters windows to the requested range', () => {
    const maha = tree.mahadashas[0];
    const head = new Date(maha.startMs);
    const tail = new Date(maha.startMs + maha.durationDays / 4 * MS_PER_DAY);
    const windows = extractTimingWindows(tree, 2, head, tail);
    expect(windows.length).toBeGreaterThan(0);
    expect(windows.length).toBeLessThan(9);
  });
});
