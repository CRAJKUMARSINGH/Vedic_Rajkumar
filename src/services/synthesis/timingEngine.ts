import { AstrologicalContext, DashaLevel, SynthesisDomain } from './signalTypes';

export function determineDashaLevel(
  context: AstrologicalContext,
  domain: SynthesisDomain
): { dashaLevel: DashaLevel; levelTag: string } {
  // In the MVP, we approximate the DashaLevel logic from interpretationEngine.ts
  // A true implementation would re-use the exact same logic or extract it.

  // Simplified logic based on transits + dasha
  const hasJupiter = context.transits.some(t => t.planet === 'Jupiter');
  const hasSaturn = context.transits.some(t => t.planet === 'Saturn');

  const doubleTransitCertifies = hasJupiter && hasSaturn; // Simplified
  const md = context.dasha.currentMahadasha;
  const ad = context.dasha.currentAntardasha;

  let level: DashaLevel = 1;
  let rationale = 'No significant activation';

  if (md && ad && doubleTransitCertifies) {
    level = 5;
    rationale = `${md.planet} MD / ${ad.planet} AD — Double Transit Certified`;
  } else if (md && ad) {
    level = 4;
    rationale = `${md.planet} MD / ${ad.planet} AD`;
  } else if (md) {
    level = 3;
    rationale = `${md.planet} MD`;
  } else {
    level = 2;
    rationale = 'Future Dasha required';
  }

  const levelTag = `[Level ${level}: ${rationale}]`;

  return { dashaLevel: level, levelTag };
}
