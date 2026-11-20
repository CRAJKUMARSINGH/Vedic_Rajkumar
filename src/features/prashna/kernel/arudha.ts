/**
 * ============================================================
 * PRASNA KERNEL — ARUDHA (Prasnalove.txt §5.5)
 * ============================================================
 *
 * Prasna Marga Ch. IV §47 (the gold piece) and Ch. V §59 (Arudha sphuta).
 *
 *   • The Arudha Rasi is the rasi the querist taps on the Kerala chakra
 *     after calming the mind — the "gold piece" placement.
 *   • The Arudha sphuta = the Arudha rasi carrying the Lagna's degrees
 *     within its sign. Raman's example: Lagna 12°25′ with Arudha Virgo
 *     gives Virgo 12°25′.
 * ============================================================
 */

const norm360 = (x: number): number => ((x % 360) + 360) % 360;

/** Normalise any tapped sign index to [0, 11]. */
export function arudhaSignIndex(tapped: number): number {
  return ((Math.trunc(tapped) % 12) + 12) % 12;
}

/**
 * Arudha sphuta = (Arudha sign) + (Lagna's degrees within its own sign).
 *
 * @param arudhaSignIndex  0-based rasi index of the tapped Arudha sign.
 * @param lagnaLongitude   sidereal longitude of the Udaya Lagna [0, 360).
 */
export function arudhaSphuta(arudhaSignIndexValue: number, lagnaLongitude: number): number {
  const sign = arudhaSignIndex(arudhaSignIndexValue);
  const degreesWithinSign = norm360(lagnaLongitude) % 30;
  return norm360(sign * 30 + degreesWithinSign);
}

/** The navamsa (D9) rasi index of a longitude — used by the Amsaka sutra. */
export function navamsaRasiIndex(longitude: number): number {
  return Math.floor(norm360(longitude) / (30 / 9)) % 12;
}
