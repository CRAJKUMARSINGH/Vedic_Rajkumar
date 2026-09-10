/**
 * useUserDataPrivacy.test.ts
 *
 * Unit tests for the useUserDataPrivacy hook.
 * Uses vitest + @testing-library/react.
 *
 * The hook depends on:
 *  - useUser (Clerk) — mocked
 *  - useAuthenticatedSupabase — mocked
 *  - exportAndDownloadUserData — mocked
 *  - deleteUserData — mocked
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUserDataPrivacy } from '@/hooks/useUserDataPrivacy';

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Mock Clerk useUser
vi.mock('@clerk/react', () => ({
  useUser: vi.fn(),
}));

// Mock useAuthenticatedSupabase — returns a dummy client
vi.mock('@/hooks/useAuthenticatedSupabase', () => ({
  useAuthenticatedSupabase: vi.fn(() => ({}) ),
  default: vi.fn(() => ({})),
}));

// Mock export service
vi.mock('@/services/dataExportService', () => ({
  exportAndDownloadUserData: vi.fn(),
}));

// Mock delete service
vi.mock('@/services/dataDeleteService', () => ({
  deleteUserData: vi.fn(),
}));

import { useUser } from '@clerk/react';
import { exportAndDownloadUserData } from '@/services/dataExportService';
import { deleteUserData } from '@/services/dataDeleteService';

// ── Helpers ───────────────────────────────────────────────────────────────────

function mockSignedIn() {
  (useUser as ReturnType<typeof vi.fn>).mockReturnValue({ isSignedIn: true, user: { id: 'u1' } });
}

function mockSignedOut() {
  (useUser as ReturnType<typeof vi.fn>).mockReturnValue({ isSignedIn: false, user: null });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useUserDataPrivacy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── isAuthenticated ────────────────────────────────────────────────────────

  describe('isAuthenticated', () => {
    it('returns true when signed in', () => {
      mockSignedIn();
      const { result } = renderHook(() => useUserDataPrivacy());
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('returns false when signed out', () => {
      mockSignedOut();
      const { result } = renderHook(() => useUserDataPrivacy());
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  // ── exportData ─────────────────────────────────────────────────────────────

  describe('exportData', () => {
    it('sets isExporting=true during the call and false after', async () => {
      mockSignedIn();
      let resolveExport!: () => void;
      (exportAndDownloadUserData as ReturnType<typeof vi.fn>).mockReturnValue(
        new Promise<void>((res) => { resolveExport = res; }),
      );

      const { result } = renderHook(() => useUserDataPrivacy());

      let exportPromise: Promise<unknown>;
      act(() => {
        exportPromise = result.current.exportData();
      });

      // Should be exporting
      expect(result.current.isExporting).toBe(true);

      await act(async () => {
        resolveExport();
        await exportPromise;
      });

      expect(result.current.isExporting).toBe(false);
    });

    it('resolves without throwing when the export succeeds', async () => {
      mockSignedIn();
      (exportAndDownloadUserData as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      const { result } = renderHook(() => useUserDataPrivacy());
      await act(async () => {
        await expect(result.current.exportData()).resolves.toBeUndefined();
      });
    });

    it('returns undefined and sets exportError when not signed in', async () => {
      mockSignedOut();
      const { result } = renderHook(() => useUserDataPrivacy());
      await act(async () => {
        const res = await result.current.exportData();
        expect(res).toBeUndefined();
      });
      expect(result.current.exportError).toBeInstanceOf(Error);
      expect(result.current.exportError?.message).toMatch(/signed in/i);
    });

    it('sets exportError and rethrows on service failure', async () => {
      mockSignedIn();
      (exportAndDownloadUserData as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Rate limit reached'),
      );
      const { result } = renderHook(() => useUserDataPrivacy());
      await act(async () => {
        await expect(result.current.exportData()).rejects.toThrow('Rate limit reached');
      });
      expect(result.current.exportError?.message).toBe('Rate limit reached');
      expect(result.current.isExporting).toBe(false);
    });
  });

  // ── deleteData ─────────────────────────────────────────────────────────────

  describe('deleteData', () => {
    const mockDeleteResult = {
      deletedAt: '2026-09-05T00:00:00Z',
      userId: 'u1',
      deleted: {
        saved_readings: 3,
        prashna_sessions: 1,
        horoscope_analyses: 0,
        transit_readings: 0,
        user_profile: 1,
      },
    };

    it('sets isDeleting=true during the call and false after', async () => {
      mockSignedIn();
      let resolveDelete!: (v: typeof mockDeleteResult) => void;
      (deleteUserData as ReturnType<typeof vi.fn>).mockReturnValue(
        new Promise<typeof mockDeleteResult>((res) => { resolveDelete = res; }),
      );

      const { result } = renderHook(() => useUserDataPrivacy());

      let deletePromise: Promise<unknown>;
      act(() => {
        deletePromise = result.current.deleteData();
      });

      expect(result.current.isDeleting).toBe(true);

      await act(async () => {
        resolveDelete(mockDeleteResult);
        await deletePromise;
      });

      expect(result.current.isDeleting).toBe(false);
    });

    it('returns the DeleteResult on success', async () => {
      mockSignedIn();
      (deleteUserData as ReturnType<typeof vi.fn>).mockResolvedValue(mockDeleteResult);
      const { result } = renderHook(() => useUserDataPrivacy());
      await act(async () => {
        const res = await result.current.deleteData();
        expect(res).toEqual(mockDeleteResult);
      });
    });

    it('returns undefined and sets deleteError when not signed in', async () => {
      mockSignedOut();
      const { result } = renderHook(() => useUserDataPrivacy());
      await act(async () => {
        const res = await result.current.deleteData();
        expect(res).toBeUndefined();
      });
      expect(result.current.deleteError).toBeInstanceOf(Error);
      expect(result.current.deleteError?.message).toMatch(/signed in/i);
    });

    it('sets deleteError and rethrows on service failure', async () => {
      mockSignedIn();
      (deleteUserData as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Deletion failed'),
      );
      const { result } = renderHook(() => useUserDataPrivacy());
      await act(async () => {
        await expect(result.current.deleteData()).rejects.toThrow('Deletion failed');
      });
      expect(result.current.deleteError?.message).toBe('Deletion failed');
      expect(result.current.isDeleting).toBe(false);
    });
  });
});
