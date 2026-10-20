/**
 * vimshottariTimeline.ts — Unified Vimshottari dasha tree as pure, deterministic data.
 *
 * Provides the whole Mahadasha → Antardasha → Pratyantardasha tree for a chart,
 * independent of the UI, plus timing-window extraction (start / peak / end).
 *
 * Design notes
 * ------------
 * - Chronology uses the classical 365.25-day sidereal year (`DASHA_YEAR_DAYS`), not
 *   calendar years, so period boundaries never drift across leap years or DST.
 * - All arithmetic is on epoch milliseconds. The first Mahadasha legitimately starts
 *   *before* birth (part of its balance was already spent); keeping that true start
 *   means every lookup at or after birth is correctly nested.
 * - Built on the independent minimal `vimshottari.ts` seed so it can be cross-checked
 *   against the engine — if the two disagree, one of them has a bug.
 *
 * Lord sequence: Ketu · Venus · Sun · Moon · Mars · Rahu · Jupiter · Saturn · Mercury.
 */

import {
  VIMSHOTTARI_LORDS,
  VIMSHOTTARI_YEARS,
  DASHA_YEAR_DAYS,
  vimshottariFirstDasha,
  type VimshottariLord,
} from './vimshottari';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const TOTAL_YEARS = 120;

export type DashaLevel = 1 | 2 | 3;

export const DASHA_LEVEL_NAME: Record<DashaLevel, string> = {
  1: 'Mahadasha',
  2: 'Antardasha',
  3: 'Pratyantardasha',
};

export interface DashaNode {
  level: DashaLevel;
  lord: VimshottariLord;
  /** Inclusive start, epoch ms. */
  startMs: number;
  /** Exclusive end, epoch ms. */
  endMs: number;
  start: Date;
  end: Date;
  durationDays: number;
  /** True when the period began before birth (the seed Mahadasha and its early sub-periods). */
  beforeBirth: boolean;
  /** Sub-periods (empty at level 3). */
  children: DashaNode[];
}

export interface VimshottariTree {
  /** Sidereal Moon longitude (degrees) used as the seed. */
  moonSiderealLongitude: number;
  /** Birth instant, epoch ms. */
  birthMs: number;
  /** The Mahadasha lord in force at birth. */
  firstLord: VimshottariLord;
  /** Nine Mahadashas starting from the seed lord — ~120 sidereal years. */
  mahadashas: DashaNode[];
}

/** A period expressed as an activation window: start → peak (midpoint) → end. */
export interface TimingWindow {
  level: DashaLevel;
  lord: VimshottariLord;
  start: Date;
  /** Activation peak — the midpoint of the window. */
  peak: Date;
  end: Date;
  durationDays: number;
}

function sequenceFrom(lord: VimshottariLord): VimshottariLord[] {
  const i = VIMSHOTTARI_LORDS.indexOf(lord);
  return [...VIMSHOTTARI_LORDS.slice(i), ...VIMSHOTTARI_LORDS.slice(0, i)];
}

function buildNode(
  level: DashaLevel,
  lord: VimshottariLord,
  startMs: number,
  endMs: number,
  birthMs: number,
): DashaNode {
  const node: DashaNode = {
    level,
    lord,
    startMs,
    endMs,
    start: new Date(startMs),
    end: new Date(endMs),
    durationDays: (endMs - startMs) / MS_PER_DAY,
    beforeBirth: startMs < birthMs,
    children: [],
  };

  if (level < 3) {
    const childLevel = (level + 1) as DashaLevel;
    const totalDays = node.durationDays;
    const seq = sequenceFrom(lord);
    let cursor = startMs;
    for (let i = 0; i < seq.length; i++) {
      const childLord = seq[i];
      const isLast = i === seq.length - 1;
      // Snap the last child to the parent's end so children tile the parent exactly.
      const childEnd = isLast
        ? endMs
        : cursor + ((totalDays * VIMSHOTTARI_YEARS[childLord]) / TOTAL_YEARS) * MS_PER_DAY;
      node.children.push(buildNode(childLevel, childLord, cursor, childEnd, birthMs));
      cursor = childEnd;
    }
  }

  return node;
}

/**
 * Build the full 3-level Vimshottari tree for a chart.
 *
 * @param moonSiderealLongitude sidereal Moon longitude in degrees
 * @param birth                 birth instant
 */
export function buildVimshottariTree(
  moonSiderealLongitude: number,
  birth: Date | number,
): VimshottariTree {
  const birthMs = birth instanceof Date ? birth.getTime() : birth;
  const seed = vimshottariFirstDasha(moonSiderealLongitude);
  // The seed Mahadasha's true start (may precede birth by the spent fraction).
  let cursor = birthMs + seed.startOffsetDays * MS_PER_DAY;

  const mahadashas: DashaNode[] = [];
  for (const lord of sequenceFrom(seed.lord)) {
    const fullDays = VIMSHOTTARI_YEARS[lord] * DASHA_YEAR_DAYS;
    const startMs = cursor;
    const endMs = startMs + fullDays * MS_PER_DAY;
    mahadashas.push(buildNode(1, lord, startMs, endMs, birthMs));
    cursor = endMs;
  }

  return { moonSiderealLongitude, birthMs, firstLord: seed.lord, mahadashas };
}

/** The chain of periods (Maha → Antar → Pratyantar) active at an instant. */
export function findDashaChain(tree: VimshottariTree, at: Date | number): DashaNode[] {
  const t = at instanceof Date ? at.getTime() : at;
  const chain: DashaNode[] = [];
  let nodes = tree.mahadashas;
  while (nodes.length > 0) {
    const node = nodes.find((n) => t >= n.startMs && t < n.endMs);
    if (!node) break;
    chain.push(node);
    nodes = node.children;
  }
  return chain;
}

/** Express a node as an activation window (start / peak / end). */
export function toTimingWindow(node: DashaNode): TimingWindow {
  return {
    level: node.level,
    lord: node.lord,
    start: node.start,
    peak: new Date((node.startMs + node.endMs) / 2),
    end: node.end,
    durationDays: node.durationDays,
  };
}

/**
 * All windows at `level` that overlap the half-open range [from, to), ordered by
 * start. Purely data — usable by any surface (UI, PDF, narrative) without the tree.
 */
export function extractTimingWindows(
  tree: VimshottariTree,
  level: DashaLevel,
  from: Date | number,
  to: Date | number,
): TimingWindow[] {
  const a = from instanceof Date ? from.getTime() : from;
  const b = to instanceof Date ? to.getTime() : to;
  const out: TimingWindow[] = [];

  const visit = (nodes: DashaNode[]): void => {
    for (const node of nodes) {
      if (node.level === level) {
        if (node.endMs > a && node.startMs < b) out.push(toTimingWindow(node));
      } else if (node.children.length > 0) {
        visit(node.children);
      }
    }
  };

  visit(tree.mahadashas);
  return out.sort((x, y) => x.start.getTime() - y.start.getTime());
}

/** Human-readable chain label, e.g. "Venus / Mercury / Saturn". */
export function dashaChainLabel(chain: DashaNode[]): string {
  return chain.map((n) => n.lord).join(' / ');
}
