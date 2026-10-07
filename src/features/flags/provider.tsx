/**
 * Flagsmith provider — wraps the app and exposes feature flag state via context.
 * Uses @flagsmith/flagsmith v12. Falls back to built-in defaults when
 * VITE_FLAGSMITH_ENV_ID is not set or Flagsmith is unreachable.
 */

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import flagsmith from '@flagsmith/flagsmith';
import type { IFlagsmithFeature } from '@flagsmith/flagsmith/types';

interface FlagsmithContextValue {
  /** True once Flagsmith has initialised (or failed gracefully). */
  isReady: boolean;
  /** Returns true if the named flag is enabled in Flagsmith. */
  hasFeature: (flag: string) => boolean;
  /** Returns a remote config value, or defaultValue if not set. */
  getValue: <T>(flag: string, defaultValue: T) => T;
  /** Identify the current user so Flagsmith can apply segment targeting. */
  identify: (userId: string, traits?: Record<string, string | number | boolean>) => Promise<void>;
  /** Clear user identity (on sign-out). */
  logout: () => Promise<void>;
}

const FlagsmithContext = createContext<FlagsmithContextValue | null>(null);

// v12 IFlagsmithFeature shape: { enabled: boolean; value?: string | number | boolean | null }
const DEFAULT_FLAGS: Record<string, IFlagsmithFeature> = {
  kundli:               { enabled: true,  value: null },
  prashna:              { enabled: true,  value: null },
  matchmaking:          { enabled: true,  value: null },
  panchang:             { enabled: true,  value: null },
  family_profiles:      { enabled: true,  value: null },
  pdf_export:           { enabled: true,  value: null },
  chart_history:        { enabled: true,  value: null },
  export_data:          { enabled: true,  value: null },
  dasha_timeline:       { enabled: false, value: null },
  transit_alerts:       { enabled: false, value: null },
  advanced_pdf:         { enabled: false, value: null },
  unlimited_pdf:        { enabled: false, value: null },
  client_crm:           { enabled: false, value: null },
  consultation_notes:   { enabled: false, value: null },
  white_label:          { enabled: false, value: null },
  kp_system:            { enabled: false, value: null },
  ashtakavarga_v2:      { enabled: false, value: null },
  new_ui:               { enabled: false, value: null },
};

export const FlagsmithProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const envId = import.meta.env.VITE_FLAGSMITH_ENV_ID as string | undefined;

    if (!envId) {
      // No env id — operate in static/default mode immediately
      setIsReady(true);
      return;
    }

    flagsmith
      .init({
        environmentID: envId,
        cacheFlags: true,
        defaultFlags: DEFAULT_FLAGS,
      })
      .then(() => setIsReady(true))
      .catch(() => {
        // Flagsmith unreachable — degrade gracefully using defaults
        console.warn('[FlagsmithProvider] Could not reach Flagsmith; using default flags.');
        setIsReady(true);
      });
  }, []);

  const hasFeature = (flag: string): boolean => {
    if (!import.meta.env.VITE_FLAGSMITH_ENV_ID) {
      return DEFAULT_FLAGS[flag]?.enabled ?? false;
    }
    return flagsmith.hasFeature(flag);
  };

  const getValue = <T,>(flag: string, defaultValue: T): T => {
    if (!import.meta.env.VITE_FLAGSMITH_ENV_ID) return defaultValue;
    const val = flagsmith.getValue(flag);
    return (val as T) ?? defaultValue;
  };

  const identify = async (
    userId: string,
    traits?: Record<string, string | number | boolean>
  ) => {
    if (!import.meta.env.VITE_FLAGSMITH_ENV_ID) return;
    await flagsmith.identify(userId, traits);
  };

  const logout = async () => {
    if (!import.meta.env.VITE_FLAGSMITH_ENV_ID) return;
    await flagsmith.logout();
  };

  return (
    <FlagsmithContext.Provider value={{ isReady, hasFeature, getValue, identify, logout }}>
      {children}
    </FlagsmithContext.Provider>
  );
};

export const useFlagsmith = (): FlagsmithContextValue => {
  const ctx = useContext(FlagsmithContext);
  if (!ctx) throw new Error('useFlagsmith must be used within <FlagsmithProvider>');
  return ctx;
};
