// SPDX-License-Identifier: MIT
/**
 * tools/accuracy/lib/varga.mjs — independent varga transform.
 *
 * Written from docs/accuracy/VARGA-CONVENTIONS.md. MUST NOT import from src/.
 * The whole point of this file is to be a second implementation of the varga
 * mapping so the shipped engine can be checked against something other than
 * itself. If this file imported the engine the gate would be a tautology.
 *
 * Returns 0-indexed signs (Aries = 0), matching `shadbalaReference.mjs` and
 * `VargaPosition.vargaRashi`.
 */

/** Cyclic-closed-form vargas: [key, division]. */
const DIVISIONS = {
  D2: 2, D3: 3, D7: 7, D10: 10, D12: 12,
  D20: 20, D24: 24, D30: 30, D40: 40, D45: 45, D60: 60,
};

/** The vargas this slice pins. */
export const VARGA_KEYS = ['D2', 'D3', 'D7', 'D10', 'D12', 'D20', 'D24', 'D30', 'D40', 'D45', 'D60'];

const norm = (lon) => ((lon % 360) + 360) % 360;

/**
 * Varga sign (0..11) for `lon` in `key`.
 * @param {number} lon sidereal longitude, 0..360
 * @param {string} key e.g. 'D7'
 * @returns {number} 0..11
 */
export function vargaSign(lon, key) {
  const l = norm(lon);
  const s = Math.floor(l / 30);   // sign index, 0..11 (Aries = 0)
  const d = l % 30;               // degrees within the sign
  const odd = s % 2 === 0;        // Aries is the first (odd) sign
  const mov = [0, 4, 8][s % 3];   // movable / fixed / dual starts

  switch (key) {
    case 'D2':
      // Hora: odd sign starts Leo then Cancer; even sign the reverse.
      return odd === (d < 15) ? 4 : 3;
    case 'D3':
      // Drekkana: from the sign, the 5th, the 9th.
      return (s + [0, 4, 8][Math.floor(d / 10)]) % 12;
    case 'D7':
      // Saptamsha: odd from the sign, even from the 7th. `7s + part` is that closed form.
      return (7 * s + Math.floor(d / (30 / 7))) % 12;
    case 'D10':
      // Dashamsha: odd from the sign, even from the 9th.
      return ((odd ? s : s + 8) + Math.floor(d / 3)) % 12;
    case 'D12':
      // Dwadashamsha: counted from the sign.
      return (s + Math.floor(d / 2.5)) % 12;
    case 'D20':
      // Vimshamsha: movable Aries / fixed Leo / dual Sagittarius.
      return (mov + Math.floor(d / 1.5)) % 12;
    case 'D24':
      // Chaturvimshamsha: odd from Leo, even from Cancer.
      return ((odd ? 4 : 3) + Math.floor(d / 1.25)) % 12;
    case 'D30': {
      // Trimshamsha: unequal, odd/even tables differ.
      const table = odd
        ? [[5, 0], [5, 10], [8, 8], [7, 2], [5, 6]]   // Mars, Saturn, Jupiter, Mercury, Venus
        : [[5, 6], [7, 2], [8, 8], [5, 10], [5, 0]];
      let acc = 0;
      for (const [span, target] of table) {
        acc += span;
        if (d < acc) return target;
      }
      return table[4][1];
    }
    case 'D40':
      // Khavedamsha: odd from Aries, even from Libra.
      return ((odd ? 0 : 6) + Math.floor(d / 0.75)) % 12;
    case 'D45':
      // Akshavedamsha: movable Aries / fixed Leo / dual Sagittarius.
      return (mov + Math.floor(d / (30 / 45))) % 12;
    case 'D60':
      // Shashtiamsha: counted from the sign.
      return (s + Math.floor(d / 0.5)) % 12;
    default:
      throw new Error(`unknown varga ${key}`);
  }
}

/** All varga signs for `lon`, keyed by VARGA_KEYS. */
export function vargaSigns(lon) {
  return Object.fromEntries(VARGA_KEYS.map((k) => [k, vargaSign(lon, k)]));
}

/** Division number for a key, e.g. 'D7' → 7. */
export function divisionOf(key) {
  const n = DIVISIONS[key];
  if (!n) throw new Error(`unknown varga ${key}`);
  return n;
}
