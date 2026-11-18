/**
 * axe.test.tsx — real axe-core evidence, replacing hand-rolled a11y assertions.
 * The output of this file is what docs/legal/VPAT.md cites.
 */
import { describe, it, expect } from 'vitest';
import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axe from 'axe-core';
import ConsentBanner from '@/components/ConsentBanner';
import { UpgradeBanner } from '@/components/UpgradeBanner';

const CRITICAL = ['serious', 'critical'];

async function scan(ui: ReactElement) {
  const { container } = render(<MemoryRouter>{ui}</MemoryRouter>);
  const results = await axe.run(container);
  const blockers = results.violations.filter((v) => CRITICAL.includes(v.impact ?? ''));
  return { results, blockers };
}

describe('accessibility — axe-core', () => {
  it('ConsentBanner has no serious/critical violations', async () => {
    const { blockers, results } = await scan(<ConsentBanner />);
    expect(blockers.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
    expect(results.violations.filter((v) => CRITICAL.includes(v.impact ?? ''))).toEqual([]);
  });

  it('UpgradeBanner has no serious/critical violations', async () => {
    const { blockers } = await scan(<UpgradeBanner />);
    expect(blockers.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });

  it('documents the axe ruleset version so the VPAT can cite it', async () => {
    const { createRequire } = await import('node:module');
    const require = createRequire(import.meta.url);
    const pkg = require('axe-core/package.json');
    expect(pkg.version).toMatch(/^\d+\./);
  });
});

/**
 * NOT COVERED HERE (honest gaps for the VPAT):
 *   - keyboard traversal order across a full route
 *   - screen-reader announcement of the chart result (needs a live region audit)
 *   - colour contrast in the Hindi (Devanagari) rendering path
 *   - the Kundli chart itself (SVG) — needs a manual pass; axe cannot judge it
 */
