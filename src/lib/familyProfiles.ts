/**
 * familyProfiles.ts
 *
 * Week 8: Multi-Profile Family Mode — storage library.
 *
 * Stores up to 10 named family member birth profiles in localStorage.
 * Works offline and without authentication.
 * Profiles can be loaded into any chart calculation page.
 *
 * Storage key: 'vr-family-profiles'
 * Format: { version: '1.0', profiles: FamilyProfile[] }
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FamilyProfile {
  id: string;
  name: string;
  relationship: string;      // e.g. 'Self', 'Mother', 'Father', 'Spouse', 'Child'
  birthDate: string;         // YYYY-MM-DD
  birthTime: string;         // HH:MM (24h), empty string if unknown
  birthTimezone: string;     // IANA timezone, e.g. 'Asia/Kolkata'
  birthLat: number;
  birthLon: number;
  birthPlace: string;
  avatarInitials: string;    // 1–2 chars derived from name
  notes: string;
  createdAt: string;         // ISO 8601
  updatedAt: string;         // ISO 8601
}

export interface FamilyProfileStore {
  version: '1.0';
  profiles: FamilyProfile[];
}

export type NewFamilyProfile = Omit<FamilyProfile, 'id' | 'avatarInitials' | 'createdAt' | 'updatedAt'>;

// ─── Constants ────────────────────────────────────────────────────────────────

export const FAMILY_PROFILES_KEY = 'vr-family-profiles';
export const FAMILY_PROFILES_VERSION = '1.0' as const;
export const MAX_PROFILES = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return `fp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name.slice(0, 2)).toUpperCase() || '?';
}

function sanitize(s: string): string {
  // Remove dangerous tags including their content
  return s
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, '')  // strip remaining tags (keep text content)
    .trim();
}

// ─── Storage I/O ──────────────────────────────────────────────────────────────

export function loadProfiles(): FamilyProfile[] {
  try {
    const raw = localStorage.getItem(FAMILY_PROFILES_KEY);
    if (!raw) return [];
    const store = JSON.parse(raw) as FamilyProfileStore;
    if (!Array.isArray(store.profiles)) return [];
    return store.profiles.filter((p) => validateProfile(p));
  } catch {
    return [];
  }
}

function persistProfiles(profiles: FamilyProfile[]): void {
  const store: FamilyProfileStore = { version: FAMILY_PROFILES_VERSION, profiles };
  try {
    localStorage.setItem(FAMILY_PROFILES_KEY, JSON.stringify(store));
  } catch {
    // Private browsing or storage full — fail gracefully
  }
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

/**
 * Save a new family profile.
 * Throws if the name is empty, birth date is missing, or max 10 reached.
 */
export function saveProfile(payload: NewFamilyProfile): FamilyProfile {
  const name = sanitize(payload.name);
  if (!name) throw new Error('Profile name is required.');

  const birthDate = sanitize(payload.birthDate);
  if (!birthDate) throw new Error('Birth date is required.');

  const existing = loadProfiles();
  if (existing.length >= MAX_PROFILES) {
    throw new Error(`Maximum of ${MAX_PROFILES} family profiles reached. Delete one to add more.`);
  }

  const now = new Date().toISOString();
  const profile: FamilyProfile = {
    id:             generateId(),
    name,
    relationship:   sanitize(payload.relationship || ''),
    birthDate,
    birthTime:      sanitize(payload.birthTime || ''),
    birthTimezone:  sanitize(payload.birthTimezone || 'Asia/Kolkata'),
    birthLat:       isFinite(payload.birthLat) ? payload.birthLat : 0,
    birthLon:       isFinite(payload.birthLon) ? payload.birthLon : 0,
    birthPlace:     sanitize(payload.birthPlace || ''),
    avatarInitials: deriveInitials(name),
    notes:          sanitize(payload.notes || ''),
    createdAt:      now,
    updatedAt:      now,
  };

  persistProfiles([...existing, profile]);
  return profile;
}

/**
 * Update an existing profile by id.
 * Throws if the profile is not found.
 */
export function updateProfile(id: string, updates: Partial<NewFamilyProfile>): FamilyProfile {
  const profiles = loadProfiles();
  const idx = profiles.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error(`Profile with id "${id}" not found.`);

  const existing = profiles[idx];
  const name = updates.name !== undefined ? sanitize(updates.name) : existing.name;
  if (!name) throw new Error('Profile name is required.');

  const updated: FamilyProfile = {
    ...existing,
    name,
    relationship:   updates.relationship !== undefined ? sanitize(updates.relationship) : existing.relationship,
    birthDate:      updates.birthDate    !== undefined ? sanitize(updates.birthDate)    : existing.birthDate,
    birthTime:      updates.birthTime    !== undefined ? sanitize(updates.birthTime)    : existing.birthTime,
    birthTimezone:  updates.birthTimezone !== undefined ? sanitize(updates.birthTimezone) : existing.birthTimezone,
    birthLat:       updates.birthLat     !== undefined && isFinite(updates.birthLat) ? updates.birthLat : existing.birthLat,
    birthLon:       updates.birthLon     !== undefined && isFinite(updates.birthLon) ? updates.birthLon : existing.birthLon,
    birthPlace:     updates.birthPlace   !== undefined ? sanitize(updates.birthPlace)   : existing.birthPlace,
    notes:          updates.notes        !== undefined ? sanitize(updates.notes)        : existing.notes,
    avatarInitials: deriveInitials(name),
    updatedAt:      new Date().toISOString(),
  };

  const newProfiles = [...profiles];
  newProfiles[idx] = updated;
  persistProfiles(newProfiles);
  return updated;
}

/**
 * Delete a profile by id.
 * No-op if the id doesn't exist.
 */
export function deleteProfile(id: string): void {
  const profiles = loadProfiles().filter((p) => p.id !== id);
  persistProfiles(profiles);
}

/**
 * Reorder profiles by providing an ordered array of ids.
 * Ids not in the list are appended at the end.
 */
export function reorderProfiles(orderedIds: string[]): FamilyProfile[] {
  const profiles = loadProfiles();
  const map = new Map(profiles.map((p) => [p.id, p]));
  const ordered: FamilyProfile[] = [];
  for (const id of orderedIds) {
    const p = map.get(id);
    if (p) { ordered.push(p); map.delete(id); }
  }
  // Append any remaining (not in orderedIds)
  for (const p of map.values()) ordered.push(p);
  persistProfiles(ordered);
  return ordered;
}

/**
 * Clear all profiles (used in tests / account deletion).
 */
export function clearAllProfiles(): void {
  try {
    localStorage.removeItem(FAMILY_PROFILES_KEY);
  } catch {
    // ignore
  }
}

/**
 * Get a single profile by ID with validation.
 * Returns null if profile not found or ID is invalid.
 * This prevents data leakage by ensuring only valid, existing profiles can be accessed.
 */
export function getProfileById(id: string): FamilyProfile | null {
  if (!id || typeof id !== 'string') {
    return null;
  }
  
  const profiles = loadProfiles();
  const profile = profiles.find((p) => p.id === id);
  
  // Validate that the profile has all required fields and correct data types
  if (!profile || !validateProfile(profile)) {
    return null;
  }
  
  return profile;
}

/**
 * Validate profile data integrity.
 * Returns true if profile has all required fields and valid data types.
 */
export function validateProfile(profile: FamilyProfile): boolean {
  return !!(
    profile.id &&
    typeof profile.id === 'string' &&
    profile.name &&
    typeof profile.name === 'string' &&
    profile.birthDate &&
    typeof profile.birthDate === 'string' &&
    typeof profile.birthTime === 'string' &&
    typeof profile.birthTimezone === 'string' &&
    typeof profile.birthLat === 'number' &&
    typeof profile.birthLon === 'number' &&
    typeof profile.birthPlace === 'string' &&
    typeof profile.avatarInitials === 'string' &&
    typeof profile.createdAt === 'string' &&
    typeof profile.updatedAt === 'string'
  );
}
