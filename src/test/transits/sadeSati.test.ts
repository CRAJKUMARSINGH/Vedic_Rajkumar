import { describe, it, expect } from 'vitest';
import { detectSadeSati, detectAshtamaShani, detectKantakaShani } from '@/astrology/transits/sadeSati';

describe('Sade Sati', () => {
  const moon = 45; // Taurus

  it('detects peak when Saturn over Moon', () => {
    const r = detectSadeSati(48, moon);
    expect(r.phase).toBe('peak');
    expect(r.active).toBe(true);
  });
  it('detects rising in 12th from Moon', () => {
    expect(detectSadeSati(18, moon).phase).toBe('rising');
  });
  it('detects setting in 2nd from Moon', () => {
    expect(detectSadeSati(78, moon).phase).toBe('setting');
  });
  it('inactive when far', () => {
    expect(detectSadeSati(150, moon).active).toBe(false);
  });
  it('detects Ashtama and Kantaka Shani', () => {
    expect(detectAshtamaShani(255, moon)).toBe(true);
    expect(detectKantakaShani(135, moon)).toBe(true);
  });
});
