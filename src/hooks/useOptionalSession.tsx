/**
 * useOptionalSession
 *
 * Demo-safe accessor for the Clerk session — Patch 01 (robotic advanced tier).
 *
 * Why this exists:
 *   `useSession()` from `@clerk/react` throws
 *   "useSession can only be used within the <ClerkProvider /> component."
 *   when `VITE_CLERK_PUBLISHABLE_KEY` is unset. Providers.tsx deliberately
 *   skips <ClerkProvider> in that case (the R4 Week 4 demo guard), so any page
 *   that calls useSession() unconditionally — /privacy-settings, /beta,
 *   /settings/data — white-screens on a deployment without Clerk configured.
 *
 * How it works — no conditional hooks, no `require()`:
 *   <ClerkSessionBridge> is mounted *inside* <ClerkProvider> (only when the key
 *   is present) and publishes the live session through a React context. When
 *   Clerk is absent the bridge never mounts, so consumers read the context's
 *   default "demo" value { session: null, isLoaded: true }.
 *
 * Contract:
 *   - session === null → Clerk absent, or signed out.
 *   - isLoaded        → true once auth state is known (always true in demo mode).
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useSession } from '@clerk/react';

type ClerkSession = NonNullable<ReturnType<typeof useSession>['session']>;

export interface OptionalSessionValue {
  session: ClerkSession | null;
  isLoaded: boolean;
}

const DEMO_SESSION: OptionalSessionValue = { session: null, isLoaded: true };

const OptionalSessionContext = createContext<OptionalSessionValue>(DEMO_SESSION);

/** True when a Clerk publishable key is configured for this build. */
export function hasClerkProvider(): boolean {
  return Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
}

/**
 * Publishes the live Clerk session to <OptionalSessionContext>.
 * MUST be rendered inside <ClerkProvider> — it is the only place that calls
 * Clerk's `useSession()`, so no hook is ever called without its provider.
 */
export function ClerkSessionBridge({ children }: { children: ReactNode }) {
  const { session, isLoaded } = useSession();
  const value = useMemo<OptionalSessionValue>(
    () => ({ session: session ?? null, isLoaded }),
    [session, isLoaded],
  );
  return (
    <OptionalSessionContext.Provider value={value}>
      {children}
    </OptionalSessionContext.Provider>
  );
}

/** Read the session without requiring <ClerkProvider> to be mounted. */
export function useOptionalSession(): OptionalSessionValue {
  return useContext(OptionalSessionContext);
}

export default useOptionalSession;
