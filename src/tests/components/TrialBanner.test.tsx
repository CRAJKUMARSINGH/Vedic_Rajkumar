/**
 * TrialBanner.test.tsx
 *
 * Deterministic cover for the "Beta access · N days left" banner. The banner is a
 * pure projection of ONE piece of server state — a live `beta_trial` grant with an
 * expiry — so the tests pin both halves: the day arithmetic (`daysUntil`, exact,
 * with an injected clock) and the render contract (only a live trial shows; every
 * other tier/source stays silent).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import TrialBanner from '@/components/TrialBanner';
import { setServerTier } from '@/features/tier/resolveTier';
import { daysUntil } from '@/features/tier/useEntitlement';

const DAY = 86_400_000;
const T0 = Date.parse('2026-11-01T10:00:00.000Z');
const iso = (ms: number) => new Date(ms).toISOString();

beforeEach(() => {
  // Module state and the localStorage mirror outlive a single test.
  setServerTier(null);
  localStorage.clear();
});

describe('daysUntil', () => {
  it('counts whole days, rounded up', () => {
    expect(daysUntil(iso(T0 + 6 * DAY), T0)).toBe(6);
    // A part-day still counts as a day of access.
    expect(daysUntil(iso(T0 + 1), T0)).toBe(1);
    expect(daysUntil(iso(T0 + DAY + 1), T0)).toBe(2);
  });

  it('goes negative once the window has closed', () => {
    expect(daysUntil(iso(T0 - 2 * DAY), T0)).toBe(-2);
  });

  it('is null when there is no window, or it is unparseable', () => {
    expect(daysUntil(null, T0)).toBeNull();
    expect(daysUntil('not-a-date', T0)).toBeNull();
  });
});

describe('TrialBanner', () => {
  it('shows the countdown for a live beta_trial grant', () => {
    setServerTier('pro', { source: 'beta_trial', expiresAt: iso(Date.now() + 2 * DAY) });

    render(<TrialBanner />);

    const banner = screen.getByTestId('trial-banner');
    expect(banner).toHaveAttribute('data-trial-source', 'beta_trial');
    expect(banner.getAttribute('data-days-left')).toMatch(/^[0-9]+$/);
    expect(screen.getByText(/Beta access ·/)).toBeInTheDocument();
  });

  it('renders nothing for a paid, non-trial entitlement', () => {
    setServerTier('pro', { source: 'stripe', expiresAt: null });

    render(<TrialBanner />);

    expect(screen.queryByTestId('trial-banner')).toBeNull();
  });

  it('renders nothing for free / default', () => {
    setServerTier('free', { source: 'default', expiresAt: null });

    render(<TrialBanner />);

    expect(screen.queryByTestId('trial-banner')).toBeNull();
  });

  it('renders nothing once the trial window has closed', () => {
    setServerTier('pro', { source: 'beta_trial', expiresAt: iso(Date.now() - DAY) });

    render(<TrialBanner />);

    expect(screen.queryByTestId('trial-banner')).toBeNull();
  });

  it('appears live when the server entitlement lands after first paint', () => {
    render(<TrialBanner />);
    expect(screen.queryByTestId('trial-banner')).toBeNull();

    act(() => {
      setServerTier('pro', { source: 'beta_trial', expiresAt: iso(Date.now() + 3 * DAY) });
    });

    expect(screen.getByTestId('trial-banner')).toBeInTheDocument();
  });

  it('renders the Hindi copy when asked', () => {
    setServerTier('pro', { source: 'beta_trial', expiresAt: iso(Date.now() + 3 * DAY) });

    render(<TrialBanner isHi />);

    expect(screen.getByText(/बीटा एक्सेस · \d+ दिन शेष/)).toBeInTheDocument();
  });

  it('can be dismissed for the session', () => {
    setServerTier('pro', { source: 'beta_trial', expiresAt: iso(Date.now() + 3 * DAY) });

    render(<TrialBanner />);
    act(() => {
      screen.getByLabelText('Dismiss banner').click();
    });

    expect(screen.queryByTestId('trial-banner')).toBeNull();
  });
});
