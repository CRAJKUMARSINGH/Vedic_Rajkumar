/**
 * useFamilyProfiles.ts
 *
 * Week 8: React hook for family profile CRUD.
 *
 * Wraps familyProfiles.ts storage functions with React state.
 * State is kept in sync with localStorage changes across tabs.
 *
 * Usage:
 *   const { profiles, addProfile, updateProfile, removeProfile } = useFamilyProfiles();
 */

import { useState, useCallback, useEffect } from 'react';
import {
  loadProfiles,
  saveProfile,
  updateProfile as updateProfileStore,
  deleteProfile,
  reorderProfiles,
  validateProfile,
  FAMILY_PROFILES_KEY,
  type FamilyProfile,
  type NewFamilyProfile,
} from '@/lib/familyProfiles';

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface UseFamilyProfilesReturn {
  /** All stored profiles in display order */
  profiles: FamilyProfile[];
  /** True while loading from localStorage (only on first mount) */
  isLoading: boolean;
  /** Last error from a CRUD operation */
  error: string | null;
  /** Add a new profile — throws / sets error on validation failure */
  addProfile: (payload: NewFamilyProfile) => FamilyProfile | null;
  /** Update an existing profile by id */
  updateProfile: (id: string, updates: Partial<NewFamilyProfile>) => FamilyProfile | null;
  /** Delete a profile by id */
  removeProfile: (id: string) => void;
  /** Reorder profiles by providing sorted ids */
  reorder: (orderedIds: string[]) => void;
  /** Clear any current error */
  clearError: () => void;
}

export function useFamilyProfiles(): UseFamilyProfilesReturn {
  const [profiles, setProfiles] = useState<FamilyProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load on mount
  useEffect(() => {
    setProfiles(loadProfiles());
    setIsLoading(false);
  }, []);

  // Sync across tabs
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === FAMILY_PROFILES_KEY) {
        setProfiles(loadProfiles());
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addProfile = useCallback((payload: NewFamilyProfile): FamilyProfile | null => {
    try {
      setError(null);
      const profile = saveProfile(payload);
      // Validate the created profile before adding to state
      if (profile && validateProfile(profile)) {
        setProfiles(loadProfiles());
        return profile;
      } else {
        setError('Failed to create valid profile');
        return null;
      }
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  }, []);

  const updateProfile = useCallback((id: string, updates: Partial<NewFamilyProfile>): FamilyProfile | null => {
    try {
      setError(null);
      const updated = updateProfileStore(id, updates);
      // Validate the updated profile before updating state
      if (updated && validateProfile(updated)) {
        setProfiles(loadProfiles());
        return updated;
      } else {
        setError('Failed to update profile - invalid data');
        return null;
      }
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  }, []);

  const removeProfile = useCallback((id: string): void => {
    setError(null);
    deleteProfile(id);
    setProfiles(loadProfiles());
  }, []);

  const reorder = useCallback((orderedIds: string[]): void => {
    const reordered = reorderProfiles(orderedIds);
    setProfiles(reordered);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    profiles,
    isLoading,
    error,
    addProfile,
    updateProfile,
    removeProfile,
    reorder,
    clearError,
  };
}

export default useFamilyProfiles;
