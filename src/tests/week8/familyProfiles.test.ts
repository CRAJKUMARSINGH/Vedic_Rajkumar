/**
 * Week 8: Family Profiles Storage Library Tests
 *
 * Tests for src/lib/familyProfiles.ts:
 *  - loadProfiles / saveProfile / updateProfile / deleteProfile
 *  - reorderProfiles / clearAllProfiles
 *  - Validation (required fields, max capacity, sanitization)
 *  - Edge cases (corrupted storage, unknown id, empty names)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  loadProfiles,
  saveProfile,
  updateProfile,
  deleteProfile,
  reorderProfiles,
  clearAllProfiles,
  FAMILY_PROFILES_KEY,
  MAX_PROFILES,
  type FamilyProfile,
  type NewFamilyProfile,
} from '@/lib/familyProfiles';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BASE_PAYLOAD: NewFamilyProfile = {
  name:          'Mummy',
  relationship:  'Mother',
  birthDate:     '1947-09-05',
  birthTime:     '05:00',
  birthTimezone: 'Asia/Kolkata',
  birthLat:      23.5,
  birthLon:      74.32,
  birthPlace:    'Nandli, Rajasthan',
  notes:         '',
};

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  localStorage.clear();
});

// ─── loadProfiles ─────────────────────────────────────────────────────────────

describe('loadProfiles', () => {
  it('returns empty array when localStorage is empty', () => {
    expect(loadProfiles()).toEqual([]);
  });

  it('returns empty array for corrupted storage', () => {
    localStorage.setItem(FAMILY_PROFILES_KEY, 'not-json{{{');
    expect(loadProfiles()).toEqual([]);
  });

  it('returns empty array when profiles field is missing', () => {
    localStorage.setItem(FAMILY_PROFILES_KEY, JSON.stringify({ version: '1.0' }));
    expect(loadProfiles()).toEqual([]);
  });

  it('returns stored profiles', () => {
    const profile = saveProfile(BASE_PAYLOAD);
    const loaded = loadProfiles();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe(profile.id);
  });
});

// ─── saveProfile ──────────────────────────────────────────────────────────────

describe('saveProfile', () => {
  it('creates a profile with all required fields', () => {
    const p = saveProfile(BASE_PAYLOAD);
    expect(p.id).toBeTruthy();
    expect(p.name).toBe('Mummy');
    expect(p.relationship).toBe('Mother');
    expect(p.birthDate).toBe('1947-09-05');
    expect(p.birthTimezone).toBe('Asia/Kolkata');
    expect(p.birthLat).toBe(23.5);
    expect(p.birthLon).toBe(74.32);
  });

  it('derives avatarInitials from name', () => {
    const p = saveProfile({ ...BASE_PAYLOAD, name: 'Rajkumar Singh' });
    expect(p.avatarInitials).toBe('RS');
  });

  it('derives single-word initials', () => {
    const p = saveProfile({ ...BASE_PAYLOAD, name: 'Mummy' });
    expect(p.avatarInitials).toBe('MU');
  });

  it('sets createdAt and updatedAt as valid ISO strings', () => {
    const p = saveProfile(BASE_PAYLOAD);
    expect(new Date(p.createdAt).getTime()).toBeGreaterThan(0);
    expect(new Date(p.updatedAt).getTime()).toBeGreaterThan(0);
  });

  it('persists to localStorage', () => {
    saveProfile(BASE_PAYLOAD);
    const raw = localStorage.getItem(FAMILY_PROFILES_KEY);
    expect(raw).not.toBeNull();
    const store = JSON.parse(raw!);
    expect(store.version).toBe('1.0');
    expect(store.profiles).toHaveLength(1);
  });

  it('throws when name is empty', () => {
    expect(() => saveProfile({ ...BASE_PAYLOAD, name: '' })).toThrow('name is required');
  });

  it('throws when name is whitespace only', () => {
    expect(() => saveProfile({ ...BASE_PAYLOAD, name: '   ' })).toThrow('name is required');
  });

  it('throws when birthDate is empty', () => {
    expect(() => saveProfile({ ...BASE_PAYLOAD, birthDate: '' })).toThrow('Birth date is required');
  });

  it('strips HTML tags from name (sanitization)', () => {
    const p = saveProfile({ ...BASE_PAYLOAD, name: '<script>evil</script>Mummy' });
    expect(p.name).toBe('Mummy');
    expect(p.name).not.toContain('<script>');
  });

  it('strips HTML from notes', () => {
    const p = saveProfile({ ...BASE_PAYLOAD, notes: '<b>bold</b> note' });
    expect(p.notes).not.toContain('<b>');
    expect(p.notes).toContain('note');
  });

  it('allows up to MAX_PROFILES profiles', () => {
    for (let i = 0; i < MAX_PROFILES; i++) {
      saveProfile({ ...BASE_PAYLOAD, name: `Member ${i + 1}` });
    }
    expect(loadProfiles()).toHaveLength(MAX_PROFILES);
  });

  it('throws when MAX_PROFILES is exceeded', () => {
    for (let i = 0; i < MAX_PROFILES; i++) {
      saveProfile({ ...BASE_PAYLOAD, name: `Member ${i + 1}` });
    }
    expect(() => saveProfile({ ...BASE_PAYLOAD, name: 'One Too Many' }))
      .toThrow(`Maximum of ${MAX_PROFILES}`);
  });

  it('multiple profiles accumulate correctly', () => {
    saveProfile({ ...BASE_PAYLOAD, name: 'Alice' });
    saveProfile({ ...BASE_PAYLOAD, name: 'Bob' });
    const all = loadProfiles();
    expect(all).toHaveLength(2);
    expect(all.map((p) => p.name)).toContain('Alice');
    expect(all.map((p) => p.name)).toContain('Bob');
  });
});

// ─── updateProfile ────────────────────────────────────────────────────────────

describe('updateProfile', () => {
  it('updates name and sets new updatedAt', () => {
    const p = saveProfile(BASE_PAYLOAD);
    const originalUpdatedAt = p.updatedAt;

    // Ensure some time passes
    const updated = updateProfile(p.id, { name: 'New Name' });
    expect(updated.name).toBe('New Name');
    expect(updated.id).toBe(p.id);
    // updatedAt should be >= original
    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(originalUpdatedAt).getTime(),
    );
  });

  it('updates avatarInitials when name changes', () => {
    const p = saveProfile({ ...BASE_PAYLOAD, name: 'Alice Smith' });
    const updated = updateProfile(p.id, { name: 'Bob Jones' });
    expect(updated.avatarInitials).toBe('BJ');
  });

  it('preserves unchanged fields', () => {
    const p = saveProfile(BASE_PAYLOAD);
    const updated = updateProfile(p.id, { notes: 'Updated note' });
    expect(updated.name).toBe(p.name);
    expect(updated.birthDate).toBe(p.birthDate);
    expect(updated.notes).toBe('Updated note');
  });

  it('persists changes to localStorage', () => {
    const p = saveProfile(BASE_PAYLOAD);
    updateProfile(p.id, { name: 'Updated' });
    const loaded = loadProfiles();
    expect(loaded[0].name).toBe('Updated');
  });

  it('throws when id not found', () => {
    expect(() => updateProfile('non-existent-id', { name: 'X' })).toThrow('not found');
  });

  it('throws when updating name to empty string', () => {
    const p = saveProfile(BASE_PAYLOAD);
    expect(() => updateProfile(p.id, { name: '' })).toThrow('name is required');
  });
});

// ─── deleteProfile ────────────────────────────────────────────────────────────

describe('deleteProfile', () => {
  it('removes a profile by id', () => {
    const p = saveProfile(BASE_PAYLOAD);
    expect(loadProfiles()).toHaveLength(1);
    deleteProfile(p.id);
    expect(loadProfiles()).toHaveLength(0);
  });

  it('is a no-op for unknown id', () => {
    saveProfile(BASE_PAYLOAD);
    expect(() => deleteProfile('unknown-id')).not.toThrow();
    expect(loadProfiles()).toHaveLength(1);
  });

  it('only removes the specified profile when multiple exist', () => {
    const a = saveProfile({ ...BASE_PAYLOAD, name: 'Alice' });
    const b = saveProfile({ ...BASE_PAYLOAD, name: 'Bob' });
    deleteProfile(a.id);
    const remaining = loadProfiles();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(b.id);
  });
});

// ─── reorderProfiles ──────────────────────────────────────────────────────────

describe('reorderProfiles', () => {
  it('reorders profiles in the given id order', () => {
    const a = saveProfile({ ...BASE_PAYLOAD, name: 'Alice' });
    const b = saveProfile({ ...BASE_PAYLOAD, name: 'Bob' });
    const c = saveProfile({ ...BASE_PAYLOAD, name: 'Charlie' });

    const reordered = reorderProfiles([c.id, a.id, b.id]);
    expect(reordered[0].name).toBe('Charlie');
    expect(reordered[1].name).toBe('Alice');
    expect(reordered[2].name).toBe('Bob');
  });

  it('appends profiles not in orderedIds at the end', () => {
    const a = saveProfile({ ...BASE_PAYLOAD, name: 'Alice' });
    const b = saveProfile({ ...BASE_PAYLOAD, name: 'Bob' });

    const reordered = reorderProfiles([b.id]); // Alice not in list
    expect(reordered[0].name).toBe('Bob');
    expect(reordered[1].name).toBe('Alice');
  });

  it('persists the new order', () => {
    const a = saveProfile({ ...BASE_PAYLOAD, name: 'Alice' });
    const b = saveProfile({ ...BASE_PAYLOAD, name: 'Bob' });
    reorderProfiles([b.id, a.id]);
    const loaded = loadProfiles();
    expect(loaded[0].name).toBe('Bob');
    expect(loaded[1].name).toBe('Alice');
  });
});

// ─── clearAllProfiles ─────────────────────────────────────────────────────────

describe('clearAllProfiles', () => {
  it('removes all profiles', () => {
    saveProfile(BASE_PAYLOAD);
    saveProfile({ ...BASE_PAYLOAD, name: 'Dad' });
    clearAllProfiles();
    expect(loadProfiles()).toHaveLength(0);
  });

  it('removes the localStorage key', () => {
    saveProfile(BASE_PAYLOAD);
    clearAllProfiles();
    expect(localStorage.getItem(FAMILY_PROFILES_KEY)).toBeNull();
  });

  it('does not throw when already empty', () => {
    expect(() => clearAllProfiles()).not.toThrow();
  });
});

// ─── localStorage failure ─────────────────────────────────────────────────────

describe('storage failure handling', () => {
  it('does not throw when localStorage.setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('QuotaExceededError');
    });
    // Should complete without throwing
    expect(() => saveProfile(BASE_PAYLOAD)).not.toThrow();
  });
});
