/**
 * useConsent.ts
 *
 * Week 4: Hook for managing user privacy consent state.
 *
 * Reads/writes consent from localStorage under the key 'vr-consent'.
 * Consent record shape:
 *   { given: boolean, timestamp: string (ISO), version: string }
 *
 * Usage:
 *   const { hasConsented, hasDismissed, giveConsent, declineConsent } = useConsent();
 */

import { useState, useCallback, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export const CONSENT_STORAGE_KEY = 'vr-consent';
export const CONSENT_VERSION = '1.0';

export interface ConsentRecord {
  given: boolean;
  timestamp: string; // ISO 8601
  version: string;
}

export interface UseConsentReturn {
  /** True if the user has explicitly accepted */
  hasConsented: boolean;
  /** True if the user has interacted (accepted or declined) */
  hasDismissed: boolean;
  /** The raw stored consent record, or null if not yet set */
  consentRecord: ConsentRecord | null;
  /** Accept consent */
  giveConsent: () => void;
  /** Decline consent (banner hides, analytics disabled) */
  declineConsent: () => void;
  /** Clear stored consent (for testing / settings page) */
  clearConsent: () => void;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

function readConsent(): ConsentRecord | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;
    // Validate shape
    if (typeof parsed.given !== 'boolean' || !parsed.timestamp) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeConsent(given: boolean): ConsentRecord {
  const record: ConsentRecord = {
    given,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Private browsing mode may throw — ignore gracefully
  }
  return record;
}

function clearConsentStorage(): void {
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useConsent(): UseConsentReturn {
  const [consentRecord, setConsentRecord] = useState<ConsentRecord | null>(() =>
    readConsent(),
  );

  // Keep in sync if another tab changes localStorage
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === CONSENT_STORAGE_KEY) {
        setConsentRecord(readConsent());
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const giveConsent = useCallback(() => {
    const record = writeConsent(true);
    setConsentRecord(record);
  }, []);

  const declineConsent = useCallback(() => {
    const record = writeConsent(false);
    setConsentRecord(record);
  }, []);

  const clearConsent = useCallback(() => {
    clearConsentStorage();
    setConsentRecord(null);
  }, []);

  return {
    hasConsented: consentRecord?.given === true,
    hasDismissed: consentRecord !== null,
    consentRecord,
    giveConsent,
    declineConsent,
    clearConsent,
  };
}

export default useConsent;
