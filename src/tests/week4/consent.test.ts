/**
 * Week 4: Consent Hook Tests
 *
 * Tests for useConsent() — localStorage read/write, state transitions,
 * and edge cases (corrupted storage, private browsing, cross-tab sync).
 *
 * Uses @testing-library/react renderHook for the React hook tests.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useConsent,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  type ConsentRecord,
} from '@/hooks/useConsent';

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  localStorage.clear();
});

// ─── Initial state ────────────────────────────────────────────────────────────

describe('useConsent — initial state', () => {
  it('hasConsented is false when localStorage is empty', () => {
    const { result } = renderHook(() => useConsent());
    expect(result.current.hasConsented).toBe(false);
  });

  it('hasDismissed is false when localStorage is empty', () => {
    const { result } = renderHook(() => useConsent());
    expect(result.current.hasDismissed).toBe(false);
  });

  it('consentRecord is null when localStorage is empty', () => {
    const { result } = renderHook(() => useConsent());
    expect(result.current.consentRecord).toBeNull();
  });

  it('reads existing consent from localStorage', () => {
    const existing: ConsentRecord = {
      given: true,
      timestamp: '2026-09-04T10:00:00.000Z',
      version: CONSENT_VERSION,
    };
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(existing));

    const { result } = renderHook(() => useConsent());
    expect(result.current.hasConsented).toBe(true);
    expect(result.current.hasDismissed).toBe(true);
    expect(result.current.consentRecord).toMatchObject({ given: true });
  });

  it('reads declined consent correctly', () => {
    const existing: ConsentRecord = {
      given: false,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(existing));

    const { result } = renderHook(() => useConsent());
    expect(result.current.hasConsented).toBe(false);
    expect(result.current.hasDismissed).toBe(true);
  });
});

// ─── giveConsent ──────────────────────────────────────────────────────────────

describe('useConsent — giveConsent()', () => {
  it('sets hasConsented to true', () => {
    const { result } = renderHook(() => useConsent());
    act(() => result.current.giveConsent());
    expect(result.current.hasConsented).toBe(true);
    expect(result.current.hasDismissed).toBe(true);
  });

  it('writes a valid record to localStorage', () => {
    const { result } = renderHook(() => useConsent());
    act(() => result.current.giveConsent());

    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!) as ConsentRecord;
    expect(parsed.given).toBe(true);
    expect(parsed.version).toBe(CONSENT_VERSION);
    expect(parsed.timestamp).toBeTruthy();
  });

  it('consentRecord has correct shape after giveConsent', () => {
    const { result } = renderHook(() => useConsent());
    act(() => result.current.giveConsent());
    expect(result.current.consentRecord).toMatchObject({
      given: true,
      version: CONSENT_VERSION,
    });
    expect(new Date(result.current.consentRecord!.timestamp).getTime()).toBeGreaterThan(0);
  });
});

// ─── declineConsent ───────────────────────────────────────────────────────────

describe('useConsent — declineConsent()', () => {
  it('sets hasDismissed to true but hasConsented remains false', () => {
    const { result } = renderHook(() => useConsent());
    act(() => result.current.declineConsent());
    expect(result.current.hasDismissed).toBe(true);
    expect(result.current.hasConsented).toBe(false);
  });

  it('writes given: false to localStorage', () => {
    const { result } = renderHook(() => useConsent());
    act(() => result.current.declineConsent());

    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    const parsed = JSON.parse(raw!) as ConsentRecord;
    expect(parsed.given).toBe(false);
  });
});

// ─── clearConsent ─────────────────────────────────────────────────────────────

describe('useConsent — clearConsent()', () => {
  it('resets state after clearing', () => {
    const { result } = renderHook(() => useConsent());
    act(() => result.current.giveConsent());
    expect(result.current.hasConsented).toBe(true);

    act(() => result.current.clearConsent());
    expect(result.current.hasConsented).toBe(false);
    expect(result.current.hasDismissed).toBe(false);
    expect(result.current.consentRecord).toBeNull();
  });

  it('removes the localStorage key', () => {
    const { result } = renderHook(() => useConsent());
    act(() => result.current.giveConsent());
    act(() => result.current.clearConsent());
    expect(localStorage.getItem(CONSENT_STORAGE_KEY)).toBeNull();
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('useConsent — edge cases', () => {
  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, 'not-valid-json{{{');
    const { result } = renderHook(() => useConsent());
    expect(result.current.consentRecord).toBeNull();
    expect(result.current.hasConsented).toBe(false);
  });

  it('handles missing required fields in stored record', () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ foo: 'bar' }));
    const { result } = renderHook(() => useConsent());
    // Invalid shape — should be treated as null
    expect(result.current.consentRecord).toBeNull();
  });

  it('handles localStorage.setItem throwing (private browsing simulation)', () => {
    const { result } = renderHook(() => useConsent());
    // Temporarily replace setItem on the mock to throw
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn().mockImplementationOnce(() => {
      throw new Error('QuotaExceededError');
    });
    // Should not throw even when storage is unavailable
    expect(() => act(() => result.current.giveConsent())).not.toThrow();
    // Restore
    localStorage.setItem = originalSetItem;
  });
});


// ─── Initial state ────────────────────────────────────────────────────────────

describe('useConsent — initial state', () => {
  it('hasConsented is false when localStorage is empty', () => {
    const { result } = renderHook(() => useConsent());
    expect(result.current.hasConsented).toBe(false);
  });

  it('hasDismissed is false when localStorage is empty', () => {
    const { result } = renderHook(() => useConsent());
    expect(result.current.hasDismissed).toBe(false);
  });

  it('consentRecord is null when localStorage is empty', () => {
    const { result } = renderHook(() => useConsent());
    expect(result.current.consentRecord).toBeNull();
  });

  it('reads existing consent from localStorage', () => {
    const existing: ConsentRecord = {
      given: true,
      timestamp: '2026-09-04T10:00:00.000Z',
      version: CONSENT_VERSION,
    };
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(existing));

    const { result } = renderHook(() => useConsent());
    expect(result.current.hasConsented).toBe(true);
    expect(result.current.hasDismissed).toBe(true);
    expect(result.current.consentRecord).toMatchObject({ given: true });
  });

  it('reads declined consent correctly', () => {
    const existing: ConsentRecord = {
      given: false,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(existing));

    const { result } = renderHook(() => useConsent());
    expect(result.current.hasConsented).toBe(false);
    expect(result.current.hasDismissed).toBe(true);
  });
});

// ─── giveConsent ──────────────────────────────────────────────────────────────

describe('useConsent — giveConsent()', () => {
  it('sets hasConsented to true', () => {
    const { result } = renderHook(() => useConsent());
    act(() => result.current.giveConsent());
    expect(result.current.hasConsented).toBe(true);
    expect(result.current.hasDismissed).toBe(true);
  });

  it('writes a valid record to localStorage', () => {
    const { result } = renderHook(() => useConsent());
    act(() => result.current.giveConsent());

    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!) as ConsentRecord;
    expect(parsed.given).toBe(true);
    expect(parsed.version).toBe(CONSENT_VERSION);
    expect(parsed.timestamp).toBeTruthy();
  });

  it('consentRecord has correct shape after giveConsent', () => {
    const { result } = renderHook(() => useConsent());
    act(() => result.current.giveConsent());
    expect(result.current.consentRecord).toMatchObject({
      given: true,
      version: CONSENT_VERSION,
    });
    expect(new Date(result.current.consentRecord!.timestamp).getTime()).toBeGreaterThan(0);
  });
});

// ─── declineConsent ───────────────────────────────────────────────────────────

describe('useConsent — declineConsent()', () => {
  it('sets hasDismissed to true but hasConsented remains false', () => {
    const { result } = renderHook(() => useConsent());
    act(() => result.current.declineConsent());
    expect(result.current.hasDismissed).toBe(true);
    expect(result.current.hasConsented).toBe(false);
  });

  it('writes given: false to localStorage', () => {
    const { result } = renderHook(() => useConsent());
    act(() => result.current.declineConsent());

    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    const parsed = JSON.parse(raw!) as ConsentRecord;
    expect(parsed.given).toBe(false);
  });
});

// ─── clearConsent ─────────────────────────────────────────────────────────────

describe('useConsent — clearConsent()', () => {
  it('resets state after clearing', () => {
    const { result } = renderHook(() => useConsent());
    act(() => result.current.giveConsent());
    expect(result.current.hasConsented).toBe(true);

    act(() => result.current.clearConsent());
    expect(result.current.hasConsented).toBe(false);
    expect(result.current.hasDismissed).toBe(false);
    expect(result.current.consentRecord).toBeNull();
  });

  it('removes the localStorage key', () => {
    const { result } = renderHook(() => useConsent());
    act(() => result.current.giveConsent());
    act(() => result.current.clearConsent());
    expect(localStorage.getItem(CONSENT_STORAGE_KEY)).toBeNull();
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('useConsent — edge cases', () => {
  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, 'not-valid-json{{{');
    const { result } = renderHook(() => useConsent());
    expect(result.current.consentRecord).toBeNull();
    expect(result.current.hasConsented).toBe(false);
  });

  it('handles missing required fields in stored record', () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ foo: 'bar' }));
    const { result } = renderHook(() => useConsent());
    // Invalid shape — should be treated as null
    expect(result.current.consentRecord).toBeNull();
  });

  it('handles localStorage.setItem throwing (private browsing)', () => {
    const { result } = renderHook(() => useConsent());
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    // Should not throw even when storage is unavailable
    expect(() => act(() => result.current.giveConsent())).not.toThrow();
  });
});
