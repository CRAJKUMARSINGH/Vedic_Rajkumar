import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { isFestivalActive, resolveFestival } from '@/lib/festival';
import { FESTIVALS } from '@/lib/festivals';
import FestivalGreeting from '@/components/FestivalGreeting';

const onWindow = (iso: string) => new Date(`${iso}T12:00:00+05:30`);

describe('festival window', () => {
  it('is active inside the window', () => {
    expect(isFestivalActive(onWindow('2026-11-08'))).toBe(true);
  });

  it('is inactive the day before and after', () => {
    expect(isFestivalActive(onWindow('2026-10-31'))).toBe(false);
    expect(isFestivalActive(onWindow('2026-11-16'))).toBe(false);
  });

  it('uses the IST day boundary, not the host clock', () => {
    // 22:30 UTC on 31 Oct is already 04:00 IST on 1 Nov — Diwali is live.
    expect(isFestivalActive(new Date('2026-10-31T22:30:00Z'))).toBe(true);
  });

  it('honours the ?festival override', () => {
    expect(resolveFestival('?festival=off', onWindow('2026-11-08'))).toBeNull();
    expect(resolveFestival('?festival=diwali', onWindow('2026-12-25'))?.id).toBe('diwali');
    expect(resolveFestival('', onWindow('2026-11-08'))?.id).toBe('diwali');
  });
});

describe('festival registry', () => {
  it('no two windows overlap', () => {
    const skins = Object.values(FESTIVALS);
    for (let i = 0; i < skins.length; i++) {
      for (let j = i + 1; j < skins.length; j++) {
        const a = skins[i];
        const b = skins[j];
        expect(a.end < b.start || b.end < a.start, `${a.id} overlaps ${b.id}`).toBe(true);
      }
    }
  });
});

describe('FestivalGreeting', () => {
  beforeEach(() => {
    // `?festival=diwali` forces the skin, so these tests do not depend on the
    // wall clock falling inside the real window.
    window.history.replaceState({}, '', '/?festival=diwali');
    window.localStorage.clear();
  });

  it('renders the greeting with five diyas', () => {
    render(<FestivalGreeting />);
    expect(screen.getByTestId('festival-greeting')).toBeInTheDocument();
    expect(document.querySelectorAll('.festival-diya')).toHaveLength(5);
  });

  it('dismisses, persists, and stays gone across a remount', () => {
    const first = render(<FestivalGreeting />);
    fireEvent.click(screen.getByRole('button'));
    expect(window.localStorage.getItem('festival-greeting-dismissed')).toBe('true');
    first.unmount();
    render(<FestivalGreeting />);
    expect(screen.queryByTestId('festival-greeting')).toBeNull();
  });

  it('renders Roman Hindi copy without Devanagari', () => {
    render(<FestivalGreeting lang="hi-Latn" />);
    const text = screen.getByTestId('festival-greeting').textContent ?? '';
    expect(text).toContain('Shubh Deepavali');
    expect(text).not.toMatch(/[\u0900-\u097F]/);
  });
});

describe('festival guards', () => {
  const relativeLuminance = (hex: string): number => {
    const channel = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };

  const contrastRatio = (a: string, b: string): number => {
    const la = relativeLuminance(a);
    const lb = relativeLuminance(b);
    const [hi, lo] = la > lb ? [la, lb] : [lb, la];
    return (hi + 0.05) / (lo + 0.05);
  };

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('greeting text meets AA contrast on the light background', () => {
    // #1b1410 on the amber wash sits at ~15:1 — assert the token pair.
    const ratio = contrastRatio('#1b1410', '#fdf3e3');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('flames stop animating under reduced motion', () => {
    // A computed `animationName` needs a real CSS engine, which jsdom is not.
    // Assert instead that the stylesheet carries the reduced-motion rule that
    // the browser will apply to the flame.
    const css = readFileSync('src/styles/festival.css', 'utf8');
    const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
    expect(reduced).toContain('.festival-diya__flame');
    expect(reduced).toMatch(/animation:\s*none/);
  });

  it('renders nothing outside any window', () => {
    window.history.replaceState({}, '', '/');
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2027-01-15T12:00:00+05:30'));
    render(<FestivalGreeting />);
    expect(screen.queryByTestId('festival-greeting')).toBeNull();
    vi.useRealTimers();
  });

  it('cleans up tokens on unmount', () => {
    window.history.replaceState({}, '', '/?festival=diwali');
    const { unmount } = render(<FestivalGreeting />);
    expect(document.documentElement.dataset.festival).toBe('diwali');
    unmount();
    expect(document.documentElement.dataset.festival).toBeUndefined();
  });
});
