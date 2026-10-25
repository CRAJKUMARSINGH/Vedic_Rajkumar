/**
 * stableHash.ts — dependency-free, synchronous, identical in Node and browser.
 *
 * It is a change-detector for answer cards, not a security hash: it lets the
 * emit script, the CI gate and the UI agree on "this is the same card" without
 * pulling in a crypto dependency.
 */

/** Recursively sort object keys so structurally-equal values hash equally. */
export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalize(v)}`).join(',')}}`;
}

/** FNV-1a, two lanes → 16 hex chars. Stable across Node and browsers. */
export function stableHash(value: unknown): string {
  const input = typeof value === 'string' ? value : canonicalize(value);
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ (c + i), 0x85ebca6b) >>> 0;
  }
  return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
}
