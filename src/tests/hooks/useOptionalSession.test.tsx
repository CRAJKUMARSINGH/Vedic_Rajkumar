/**
 * useOptionalSession.test.tsx — Patch 01 regression guard.
 *
 * /privacy-settings, /beta and /settings/data used to call `useSession()` from
 * `@clerk/react` unconditionally. Clerk throws
 *   "useSession can only be used within the <ClerkProvider /> component."
 * whenever VITE_CLERK_PUBLISHABLE_KEY is unset — and Providers.tsx deliberately
 * skips <ClerkProvider> in exactly that case (the R4 Week 4 demo guard). The
 * result was a white-screen on any deployment without Clerk configured.
 *
 * useOptionalSession() must therefore resolve with no provider present, and the
 * pages must stop importing Clerk's own hook.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ReactNode } from 'react';

vi.mock('@clerk/react', () => ({
  useSession: vi.fn(),
}));

import { useSession } from '@clerk/react';
import {
  useOptionalSession,
  ClerkSessionBridge,
  hasClerkProvider,
} from '@/hooks/useOptionalSession';

const mockUseSession = useSession as unknown as ReturnType<typeof vi.fn>;

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('useOptionalSession — demo mode (no Clerk key)', () => {
  it('resolves without a <ClerkProvider> and reports no session', () => {
    const { result } = renderHook(() => useOptionalSession());
    expect(result.current).toEqual({ session: null, isLoaded: true });
  });

  it('never calls Clerk useSession when the bridge is absent', () => {
    renderHook(() => useOptionalSession());
    expect(mockUseSession).not.toHaveBeenCalled();
  });
});

describe('hasClerkProvider', () => {
  it('is false when the publishable key is unset', () => {
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', '');
    expect(hasClerkProvider()).toBe(false);
  });

  it('is true when the publishable key is set', () => {
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_123');
    expect(hasClerkProvider()).toBe(true);
  });
});

describe('ClerkSessionBridge — Clerk configured', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ClerkSessionBridge>{children}</ClerkSessionBridge>
  );

  it('publishes the live session to consumers', () => {
    const session = { user: { id: 'user_1' } };
    mockUseSession.mockReturnValue({ session, isLoaded: true });

    const { result } = renderHook(() => useOptionalSession(), { wrapper });

    expect(result.current.session).toBe(session);
    expect(result.current.isLoaded).toBe(true);
  });

  it('normalises an undefined Clerk session to null', () => {
    mockUseSession.mockReturnValue({ session: undefined, isLoaded: false });

    const { result } = renderHook(() => useOptionalSession(), { wrapper });

    expect(result.current).toEqual({ session: null, isLoaded: false });
  });
});

describe('demo-safe pages never import Clerk’s raw useSession', () => {
  const pages = [
    'src/pages/PrivacySettingsPage.tsx',
    'src/pages/BetaRedeemPage.tsx',
    'src/pages/settings/DataExportPage.tsx',
    'src/hooks/useAuthenticatedSupabase.ts',
  ];

  for (const page of pages) {
    it(`${page} uses the optional session hook`, () => {
      const source = readFileSync(join(process.cwd(), page), 'utf8');
      expect(source).not.toMatch(
        /import\s*\{[^}]*\buseSession\b[^}]*\}\s*from\s*['"]@clerk\/react['"]/,
      );
      expect(source).toContain('useOptionalSession');
    });
  }
});
