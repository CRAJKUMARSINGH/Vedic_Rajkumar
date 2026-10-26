/**
 * unverifiedDoc.test.ts — doc-truth gate for docs/accuracy/UNVERIFIED.md.
 *
 * The public /accuracy page renders `UNVERIFIED_AREAS` from
 * src/lib/accuracyReport.ts at data-testid="unverified-list". This document is
 * the longer-form disclosure of the same list. If the two can drift, one of them
 * is lying to a reader — so the table in the document is parsed and compared to
 * the array the page actually renders.
 *
 * Same discipline as guideContract.test.ts: the document is checked against the
 * code, never the other way round.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { UNVERIFIED_AREAS } from '@/lib/accuracyReport';

const DOC = join(process.cwd(), 'docs', 'accuracy', 'UNVERIFIED.md');

interface Row {
  area: string;
  why: string;
}

/** Parse the first markdown table in the file into rows. */
function firstTable(md: string): Row[] {
  const lines = md.split(/\r?\n/);
  const rows: Row[] = [];
  let started = false;

  for (const line of lines) {
    if (!line.startsWith('|')) {
      if (started) break; // table ended at the first non-pipe line
      continue;
    }
    started = true;
    const cells = line
      .split('|')
      .slice(1, -1) // drop the empty leading/trailing cells
      .map((c) => c.trim());
    if (cells.length < 2) continue;
    if (cells[0] === 'Area') continue; // header
    if (cells.every((c) => /^-+$/.test(c))) continue; // separator
    rows.push({ area: cells[0], why: cells[1] });
  }
  return rows;
}

describe('docs/accuracy/UNVERIFIED.md', () => {
  const md = readFileSync(DOC, 'utf8');
  const rows = firstTable(md);

  it('has a non-empty table', () => {
    expect(rows.length).toBeGreaterThan(0);
  });

  it('lists exactly the areas the /accuracy page discloses', () => {
    expect(rows.map((r) => r.area)).toEqual(UNVERIFIED_AREAS.map((a) => a.area));
  });

  it('gives each area the same reason the page gives', () => {
    expect(rows.map((r) => r.why)).toEqual(UNVERIFIED_AREAS.map((a) => a.why));
  });

  it('states the verified/unverified labelling requirement', () => {
    expect(md).toMatch(/label(?:l)?ed\s+\*\*verified\*\*\s+or\s+\n?\*\*unverified\*\*/i);
  });
});
