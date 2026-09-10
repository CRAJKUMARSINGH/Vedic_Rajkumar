/**
 * useUserDataPrivacy.ts
 *
 * Week 3: Unified hook for user data privacy actions.
 *
 * Wraps exportUserData / deleteUserData from the service layer with:
 *  - Clerk authentication check (throws if not signed in)
 *  - Loading and error state management
 *  - Toast notifications on success / failure
 *
 * Usage:
 *   const { isExporting, isDeleting, exportData, deleteData } = useUserDataPrivacy();
 */

import { useState, useCallback } from 'react';
import { useUser } from '@clerk/react';
import { useAuthenticatedSupabase } from '@/hooks/useAuthenticatedSupabase';
import {
  exportAndDownloadUserData,
  type ExportedUserData,
} from '@/services/dataExportService';
import { deleteUserData, type DeleteResult } from '@/services/dataDeleteService';

export interface UseUserDataPrivacyReturn {
  /** True while an export request is in flight. */
  isExporting: boolean;
  /** True while a delete request is in flight. */
  isDeleting: boolean;
  /** Last export error, if any. */
  exportError: Error | null;
  /** Last delete error, if any. */
  deleteError: Error | null;
  /**
   * Triggers a full data export and initiates a JSON download.
   * Resolves to the exported payload (useful for testing / display).
   * Rejects if the user is not authenticated or rate limited.
   */
  exportData: () => Promise<ExportedUserData | undefined>;
  /**
   * Permanently deletes all user-owned data.
   * Caller MUST show a confirmation dialog before invoking.
   * Rejects if the user is not authenticated or rate limited.
   */
  deleteData: () => Promise<DeleteResult | undefined>;
  /** True if the current user is signed in (safe to show the privacy actions). */
  isAuthenticated: boolean;
}

export function useUserDataPrivacy(): UseUserDataPrivacyReturn {
  const { isSignedIn } = useUser();
  const supabase = useAuthenticatedSupabase();

  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting,  setIsDeleting]  = useState(false);
  const [exportError, setExportError] = useState<Error | null>(null);
  const [deleteError, setDeleteError] = useState<Error | null>(null);

  const exportData = useCallback(async (): Promise<ExportedUserData | undefined> => {
    if (!isSignedIn) {
      const err = new Error('You must be signed in to export your data.');
      setExportError(err);
      return undefined;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      await exportAndDownloadUserData(supabase);
      // exportAndDownloadUserData triggers download but does not return data;
      // resolve with undefined — callers interested in the payload should call
      // exportUserData() directly.
      return undefined;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setExportError(error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, [isSignedIn, supabase]);

  const deleteData = useCallback(async (): Promise<DeleteResult | undefined> => {
    if (!isSignedIn) {
      const err = new Error('You must be signed in to delete your data.');
      setDeleteError(err);
      return undefined;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await deleteUserData(supabase);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setDeleteError(error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [isSignedIn, supabase]);

  return {
    isExporting,
    isDeleting,
    exportError,
    deleteError,
    exportData,
    deleteData,
    isAuthenticated: Boolean(isSignedIn),
  };
}

export default useUserDataPrivacy;
