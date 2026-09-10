/**
 * profileValidation.test.ts
 *
 * Week 7: Profile validation and data isolation tests.
 *
 * Tests the new validation functions added to prevent data leakage:
 * - validateProfile() ensures profile data integrity
 * - getProfileById() safely retrieves profiles with validation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  validateProfile,
  getProfileById,
  saveProfile,
  clearAllProfiles,
  type FamilyProfile,
} from '@/lib/familyProfiles';

describe('Profile Validation and Data Isolation', () => {
  beforeEach(() => {
    clearAllProfiles();
  });

  afterEach(() => {
    clearAllProfiles();
  });

  describe('validateProfile', () => {
    it('should return true for valid profile', () => {
      const validProfile: FamilyProfile = {
        id: 'test-123',
        name: 'Test User',
        relationship: 'Self',
        birthDate: '1990-01-01',
        birthTime: '12:00',
        birthTimezone: 'Asia/Kolkata',
        birthLat: 28.6139,
        birthLon: 77.2090,
        birthPlace: 'New Delhi',
        avatarInitials: 'TU',
        notes: 'Test notes',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      expect(validateProfile(validProfile)).toBe(true);
    });

    it('should return false for profile missing required fields', () => {
      const invalidProfile: Partial<FamilyProfile> = {
        id: 'test-123',
        name: 'Test User',
        // Missing required fields
      };

      expect(validateProfile(invalidProfile as FamilyProfile)).toBe(false);
    });

    it('should return false for profile with invalid data types', () => {
      const invalidProfile: FamilyProfile = {
        id: 'test-123',
        name: 'Test User',
        relationship: 'Self',
        birthDate: '1990-01-01',
        birthTime: '12:00',
        birthTimezone: 'Asia/Kolkata',
        birthLat: 'invalid' as any, // Should be number
        birthLon: 77.2090,
        birthPlace: 'New Delhi',
        avatarInitials: 'TU',
        notes: 'Test notes',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      expect(validateProfile(invalidProfile)).toBe(false);
    });

    it('should return false for profile with empty required fields', () => {
      const invalidProfile: FamilyProfile = {
        id: '', // Empty ID
        name: '', // Empty name
        relationship: 'Self',
        birthDate: '', // Empty birth date
        birthTime: '12:00',
        birthTimezone: 'Asia/Kolkata',
        birthLat: 28.6139,
        birthLon: 77.2090,
        birthPlace: 'New Delhi',
        avatarInitials: 'TU',
        notes: 'Test notes',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      expect(validateProfile(invalidProfile)).toBe(false);
    });
  });

  describe('getProfileById', () => {
    it('should return null for invalid ID', () => {
      expect(getProfileById('')).toBe(null);
      expect(getProfileById(null as any)).toBe(null);
      expect(getProfileById(undefined as any)).toBe(null);
    });

    it('should return null for non-existent profile', () => {
      expect(getProfileById('non-existent-id')).toBe(null);
    });

    it('should return profile if it exists and is valid', () => {
      const profile = saveProfile({
        name: 'Test User',
        relationship: 'Self',
        birthDate: '1990-01-01',
        birthTime: '12:00',
        birthTimezone: 'Asia/Kolkata',
        birthLat: 28.6139,
        birthLon: 77.2090,
        birthPlace: 'New Delhi',
        notes: 'Test notes',
      });

      const retrieved = getProfileById(profile.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(profile.id);
      expect(retrieved?.name).toBe('Test User');
    });

    it('should return null if profile exists but is invalid (data corruption scenario)', () => {
      // First save a valid profile
      const profile = saveProfile({
        name: 'Test User',
        relationship: 'Self',
        birthDate: '1990-01-01',
        birthTime: '12:00',
        birthTimezone: 'Asia/Kolkata',
        birthLat: 28.6139,
        birthLon: 77.2090,
        birthPlace: 'New Delhi',
        notes: 'Test notes',
      });

      // Manually corrupt the data in localStorage to simulate data corruption
      const key = 'vr-family-profiles';
      const rawData = localStorage.getItem(key);
      if (rawData) {
        const data = JSON.parse(rawData);
        if (data.profiles && data.profiles[0]) {
          // Corrupt the profile by removing required fields
          data.profiles[0].name = '';
          data.profiles[0].birthDate = '';
          localStorage.setItem(key, JSON.stringify(data));
        }
      }

      // getProfileById should return null for corrupted data
      const retrieved = getProfileById(profile.id);
      expect(retrieved).toBe(null);
    });
  });

  describe('Data Isolation', () => {
    it('should prevent access to profiles with missing required fields', () => {
      const profile = saveProfile({
        name: 'Test User',
        relationship: 'Self',
        birthDate: '1990-01-01',
        birthTime: '12:00',
        birthTimezone: 'Asia/Kolkata',
        birthLat: 28.6139,
        birthLon: 77.2090,
        birthPlace: 'New Delhi',
        notes: 'Test notes',
      });

      // Simulate data corruption by directly modifying localStorage
      const key = 'vr-family-profiles';
      const rawData = localStorage.getItem(key);
      let corruptedData;
      if (rawData) {
        corruptedData = JSON.parse(rawData);
        if (corruptedData.profiles && corruptedData.profiles[0]) {
          // Remove birth date to make it invalid
          corruptedData.profiles[0].birthDate = '';
          localStorage.setItem(key, JSON.stringify(corruptedData));
        }
      }

      // The corrupted profile should not be accessible
      const retrieved = getProfileById(profile.id);
      expect(retrieved).toBe(null);
      if (corruptedData && corruptedData.profiles && corruptedData.profiles[0]) {
        expect(validateProfile(corruptedData.profiles[0])).toBe(false);
      }
    });

    it('should prevent access to profiles with wrong data types', () => {
      const profile = saveProfile({
        name: 'Test User',
        relationship: 'Self',
        birthDate: '1990-01-01',
        birthTime: '12:00',
        birthTimezone: 'Asia/Kolkata',
        birthLat: 28.6139,
        birthLon: 77.2090,
        birthPlace: 'New Delhi',
        notes: 'Test notes',
      });

      // Simulate data corruption by changing data types
      const key = 'vr-family-profiles';
      const rawData = localStorage.getItem(key);
      if (rawData) {
        const data = JSON.parse(rawData);
        if (data.profiles && data.profiles[0]) {
          // Change latitude to string
          data.profiles[0].birthLat = 'invalid';
          localStorage.setItem(key, JSON.stringify(data));
        }
      }

      // The corrupted profile should not be accessible
      const retrieved = getProfileById(profile.id);
      expect(retrieved).toBe(null);
    });
  });
});
