/**
 * depth.ts — how long the answer should be.
 * A yes/no deserves six lines; "should I change city, job and profession"
 * deserves structure. Keyword-based over English and roman-Hindi;
 * defaults to `standard` when unsure. Pure.
 */
export type Depth = 'brief' | 'standard' | 'deep';

const BRIEF = [
  'will i', 'should i', 'can i', 'is it', 'kya', 'hoga', 'milega', 'banega',
];

const DEEP = [
  ' or ', ' vs ', 'versus', 'compare', 'which one', ' ya ', ' aur ', 'all three',
  'should i change', 'prospects', 'outlook',
];

export function classifyDepth(asked: string): Depth {
  const q = ` ${asked.toLowerCase().trim()} `;
  const deepHits = DEEP.filter(k => q.includes(k)).length;
  if (deepHits >= 2) return 'deep';
  if (deepHits === 1) return 'standard';
  if (BRIEF.some(k => q.includes(k))) return 'brief';
  return 'standard';
}

export const sectionBudget = (depth: Depth): number =>
  depth === 'brief' ? 2 : depth === 'standard' ? 4 : 6;
