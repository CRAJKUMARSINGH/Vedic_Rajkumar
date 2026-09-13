/**
 * profileSelectorIntegration.test.tsx
 *
 * Week 7: Integration tests for FamilyProfileSelector with validation.
 *
 * Tests that the selector properly validates profiles and prevents
 * data leakage by only displaying valid profiles.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import FamilyProfileSelector from '@/components/FamilyProfileSelector';
import { saveProfile, clearAllProfiles } from '@/lib/familyProfiles';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Users: () => <div data-testid="users-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  User: () => <div data-testid="user-icon" />,
}));

describe('FamilyProfileSelector Integration with Validation', () => {
  beforeEach(() => {
    clearAllProfiles();
  });

  afterEach(() => {
    clearAllProfiles();
  });

  it('should render selector with no profiles initially', () => {
    const onSelect = vi.fn();
    render(
      <BrowserRouter>
        <FamilyProfileSelector onSelect={onSelect} triggerLabel="Test" />
      </BrowserRouter>
    );

    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should display valid profiles in dropdown', async () => {
    const onSelect = vi.fn();
    
    // Create a valid profile
    const validProfile = saveProfile({
      name: 'Valid User',
      relationship: 'Self',
      birthDate: '1990-01-01',
      birthTime: '12:00',
      birthTimezone: 'Asia/Kolkata',
      birthLat: 28.6139,
      birthLon: 77.2090,
      birthPlace: 'New Delhi',
      notes: 'Test notes',
    });

    render(
      <BrowserRouter>
        <FamilyProfileSelector onSelect={onSelect} triggerLabel="Test" />
      </BrowserRouter>
    );

    // Open the dropdown
    const trigger = screen.getByText('Test');
    await userEvent.click(trigger);

    // Wait for dropdown to appear
    await waitFor(() => {
      expect(screen.getByText('Valid User')).toBeInTheDocument();
    });
  });

  it('should not display invalid profiles in dropdown', async () => {
    const onSelect = vi.fn();
    
    // Create a valid profile first
    const validProfile = saveProfile({
      name: 'Valid User',
      relationship: 'Self',
      birthDate: '1990-01-01',
      birthTime: '12:00',
      birthTimezone: 'Asia/Kolkata',
      birthLat: 28.6139,
      birthLon: 77.2090,
      birthPlace: 'New Delhi',
      notes: 'Test notes',
    });

    // Simulate data corruption
    const key = 'vr-family-profiles';
    const rawData = localStorage.getItem(key);
    if (rawData) {
      const data = JSON.parse(rawData);
      if (data.profiles && data.profiles[0]) {
        // Corrupt the profile
        data.profiles[0].name = '';
        localStorage.setItem(key, JSON.stringify(data));
      }
    }

    render(
      <BrowserRouter>
        <FamilyProfileSelector onSelect={onSelect} triggerLabel="Test" />
      </BrowserRouter>
    );

    // Open the dropdown
    const trigger = screen.getByText('Test');
    await userEvent.click(trigger);

    // The corrupted profile should not be displayed
    await waitFor(() => {
      expect(screen.queryByText('Valid User')).not.toBeInTheDocument();
    });
  });

  it('should call onSelect with validated profile data', async () => {
    const onSelect = vi.fn();
    
    const validProfile = saveProfile({
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

    render(
      <BrowserRouter>
        <FamilyProfileSelector onSelect={onSelect} triggerLabel="Test" />
      </BrowserRouter>
    );

    // Open the dropdown
    const trigger = screen.getByText('Test');
    await userEvent.click(trigger);

    // Click on the profile
    await waitFor(() => {
      const profileOption = screen.getByText('Test User');
      expect(profileOption).toBeInTheDocument();
    });

    const profileOption = screen.getByText('Test User');
    await userEvent.click(profileOption);

    // Verify onSelect was called with the profile
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: validProfile.id,
        name: 'Test User',
        birthDate: '1990-01-01',
      })
    );
  });

  it('should show empty state when no valid profiles exist', async () => {
    const onSelect = vi.fn();
    
    render(
      <BrowserRouter>
        <FamilyProfileSelector onSelect={onSelect} triggerLabel="Test" />
      </BrowserRouter>
    );

    // Open the dropdown
    const trigger = screen.getByText('Test');
    await userEvent.click(trigger);

    // Should show empty state message (without trailing period)
    await waitFor(() => {
      expect(screen.getByText(/No family profiles yet/i)).toBeInTheDocument();
    });
  });

  it('should handle multiple profiles and filter invalid ones', async () => {
    const onSelect = vi.fn();
    
    // Create multiple profiles
    const profile1 = saveProfile({
      name: 'User 1',
      relationship: 'Self',
      birthDate: '1990-01-01',
      birthTime: '12:00',
      birthTimezone: 'Asia/Kolkata',
      birthLat: 28.6139,
      birthLon: 77.2090,
      birthPlace: 'New Delhi',
      notes: 'Test notes',
    });

    const profile2 = saveProfile({
      name: 'User 2',
      relationship: 'Spouse',
      birthDate: '1995-05-15',
      birthTime: '08:30',
      birthTimezone: 'Asia/Kolkata',
      birthLat: 19.0760,
      birthLon: 72.8777,
      birthPlace: 'Mumbai',
      notes: 'Test notes',
    });

    // Corrupt the first profile
    const key = 'vr-family-profiles';
    const rawData = localStorage.getItem(key);
    if (rawData) {
      const data = JSON.parse(rawData);
      if (data.profiles && data.profiles[0]) {
        data.profiles[0].birthDate = '';
        localStorage.setItem(key, JSON.stringify(data));
      }
    }

    render(
      <BrowserRouter>
        <FamilyProfileSelector onSelect={onSelect} triggerLabel="Test" />
      </BrowserRouter>
    );

    // Open the dropdown
    const trigger = screen.getByText('Test');
    await userEvent.click(trigger);

    // Only the valid profile should be displayed
    await waitFor(() => {
      expect(screen.queryByText('User 1')).not.toBeInTheDocument();
      expect(screen.getByText('User 2')).toBeInTheDocument();
    });
  });
});
