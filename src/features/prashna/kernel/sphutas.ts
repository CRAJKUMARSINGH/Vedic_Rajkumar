/**
 * ============================================================
 * PRASNA KERNEL — SPHUTAS (Prasnalove.txt §5.3)
 * ============================================================
 *
 * Prasna Marga Ch. V §55–57 and the glossary define three composite
 * "sphutas" and three navamsa (×9) sphutas. A "sphuta" is a sensitive
 * point obtained by adding sidereal longitudes together.
 *
 * All results are normalised to [0, 360).
 * ============================================================
 */

const norm = (x: number): number => ((x % 360) + 360) % 360;

/** Trisphuta = Lagna + Moon + Gulika (PM Ch. V §55). */
export const trisphuta = (lagna: number, moon: number, gulika: number): number =>
  norm(lagna + moon + gulika);

/** Chatusphuta = Trisphuta + Sun (PM Ch. V §56). */
export const chatusphuta = (tri: number, sun: number): number => norm(tri + sun);

/** Panchasphuta = Chatusphuta + Rahu (PM Ch. V §57). */
export const panchasphuta = (chatus: number, rahu: number): number => norm(chatus + rahu);

/**
 * Prana sphuta = Udaya Lagna × 9 (navamsa sphuta). PM Ch. V §56 also
 * lists alternative Prana/Deha formulas — expose those as a future
 * setting and label them; this is the primary formula from Raman's notes.
 */
export const pranaSphuta = (lagna: number): number => norm(lagna * 9);

/** Deha sphuta = Chandra (Moon) × 9. */
export const dehaSphuta = (moon: number): number => norm(moon * 9);

/** Mrityu sphuta = Gulika × 9. */
export const mrityuSphuta = (gulika: number): number => norm(gulika * 9);

export interface SphutaSet {
  trisphuta: number;
  chatusphuta: number;
  panchasphuta: number;
  prana: number;
  deha: number;
  mrityu: number;
}

export interface SphutaInputs {
  lagna: number;
  moon: number;
  gulika: number;
  sun: number;
  rahu: number;
}

/** Compute the full sphuta set from the six source longitudes. */
export function computeSphutas(p: SphutaInputs): SphutaSet {
  const tri = trisphuta(p.lagna, p.moon, p.gulika);
  const chatus = chatusphuta(tri, p.sun);
  return {
    trisphuta: tri,
    chatusphuta: chatus,
    panchasphuta: panchasphuta(chatus, p.rahu),
    prana: pranaSphuta(p.lagna),
    deha: dehaSphuta(p.moon),
    mrityu: mrityuSphuta(p.gulika),
  };
}
