import { RASHIS } from '../core/constants';
import { signIndex } from './aspects';

export interface SadeSatiPhase {
  phase: 'rising' | 'peak' | 'setting' | 'none';
  active: boolean;
  severity: 'low' | 'moderate' | 'high';
  saturnSign: string;
  moonSign: string;
  progress: number;
}

/**
 * Sade Sati = Saturn transiting the 12th, 1st, or 2nd sign from natal Moon.
 * Rising = 12th from Moon, Peak = over Moon, Setting = 2nd from Moon.
 */
export const detectSadeSati = (
  saturnLong: number,
  natalMoonLong: number,
): SadeSatiPhase => {
  const sat = signIndex(saturnLong);
  const moon = signIndex(natalMoonLong);
  const offset = (sat - moon + 12) % 12;
  const degInSign = ((saturnLong % 30) + 30) % 30;
  const progress = degInSign / 30;
  const saturnSign = RASHIS[sat];
  const moonSign = RASHIS[moon];

  if (offset === 11) {
    return { phase: 'rising', active: true, severity: 'moderate', saturnSign, moonSign, progress };
  }
  if (offset === 0) {
    return { phase: 'peak', active: true, severity: 'high', saturnSign, moonSign, progress };
  }
  if (offset === 1) {
    return { phase: 'setting', active: true, severity: 'moderate', saturnSign, moonSign, progress };
  }
  return { phase: 'none', active: false, severity: 'low', saturnSign, moonSign, progress };
};

/** Ashtama Shani: Saturn in 8th from Moon. */
export const detectAshtamaShani = (saturnLong: number, natalMoonLong: number): boolean =>
  (signIndex(saturnLong) - signIndex(natalMoonLong) + 12) % 12 === 7;

/** Kantaka / Ardha Shani: Saturn in 4th from Moon. */
export const detectKantakaShani = (saturnLong: number, natalMoonLong: number): boolean =>
  (signIndex(saturnLong) - signIndex(natalMoonLong) + 12) % 12 === 3;
