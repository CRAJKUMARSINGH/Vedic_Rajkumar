/**
 * Week 8: Family Profiles Page + Component Tests
 *
 * Tests for:
 *  - FamilyProfilesPage initial render (empty state, heading)
 *  - Add profile flow (form visible, save, appears in list)
 *  - Edit and delete flows
 *  - FamilyProfileForm validation
 *  - FamilyProfileSelector rendering
 *  - Route registration
 *  - useFamilyProfiles hook behavior
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { clearAllProfiles, saveProfile, loadProfiles } from '@/lib/familyProfiles';
import FamilyProfilesPage from '@/pages/FamilyProfilesPage';
import FamilyProfileSelector from '@/components/FamilyProfileSelector';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderPage() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <FamilyProfilesPage />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  clearAllProfiles();
});

afterEach(() => {
  localStorage.clear();
  clearAllProfiles();
  vi.restoreAllMocks();
});

// ─── FamilyProfilesPage — initial state ──────────────────────────────────────

describe('FamilyProfilesPage — initial state', () => {
  it('renders the page heading', () => {
    renderPage();
    // Use heading level 1 specifically
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('shows empty state when no profiles exist', () => {
    renderPage();
    expect(screen.getByText(/No family profiles yet/i)).toBeInTheDocument();
  });

  it('shows "Add First Member" button in empty state', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /add first member/i })).toBeInTheDocument();
  });

  it('shows Add Member button in the toolbar', () => {
    renderPage();
    // Two "Add Member" buttons are present (toolbar + empty-state action)
    const addBtns = screen.getAllByRole('button', { name: /add.*member/i });
    expect(addBtns.length).toBeGreaterThanOrEqual(1);
  });

  it('shows 0/10 profile count badge', () => {
    renderPage();
    expect(screen.getByText('0/10')).toBeInTheDocument();
  });
});

// ─── FamilyProfilesPage — add flow ───────────────────────────────────────────

describe('FamilyProfilesPage — add profile flow', () => {
  // Helper — click the toolbar "Add Member" button (not empty-state "Add First Member")
  function clickAddToolbar() {
    const buttons = screen.getAllByRole('button', { name: /add.*member/i });
    // Toolbar button has aria-label containing "Add a new family member" or text "Add Member"
    // Pick the one that is NOT "Add First Member"
    const toolbarBtn = buttons.find((b) => !/first/i.test(b.textContent ?? ''));
    if (toolbarBtn) fireEvent.click(toolbarBtn);
    else fireEvent.click(buttons[0]);
  }

  it('shows add form when Add Member is clicked', () => {
    renderPage();
    clickAddToolbar();
    expect(screen.getByRole('heading', { name: /add family member/i })).toBeInTheDocument();
  });

  it('form has name and date inputs with labels', () => {
    renderPage();
    clickAddToolbar();
    expect(document.getElementById('fp-name')).toBeInTheDocument();
    expect(document.getElementById('fp-date')).toBeInTheDocument();
  });

  it('shows error when trying to save with empty name', async () => {
    renderPage();
    clickAddToolbar();
    fireEvent.click(screen.getByRole('button', { name: /add profile/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('shows error about required name', async () => {
    renderPage();
    clickAddToolbar();
    fireEvent.click(screen.getByRole('button', { name: /add profile/i }));
    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert.textContent).toMatch(/name is required/i);
    });
  });

  it('saves a valid profile and returns to list view', async () => {
    renderPage();
    clickAddToolbar();
    fireEvent.change(document.getElementById('fp-name')!, { target: { value: 'Mummy' } });
    fireEvent.change(document.getElementById('fp-date')!, { target: { value: '1947-09-05' } });
    fireEvent.click(screen.getByRole('button', { name: /add profile/i }));
    await waitFor(() => {
      expect(screen.getByText('Mummy')).toBeInTheDocument();
    });
  });

  it('updates profile count after adding', async () => {
    renderPage();
    clickAddToolbar();
    fireEvent.change(document.getElementById('fp-name')!, { target: { value: 'Papa' } });
    fireEvent.change(document.getElementById('fp-date')!, { target: { value: '1950-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: /add profile/i }));
    await waitFor(() => {
      expect(screen.getByText('1/10')).toBeInTheDocument();
    });
  });

  it('Cancel returns to list without saving', async () => {
    renderPage();
    clickAddToolbar();
    expect(screen.getByRole('heading', { name: /add family member/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /add family member/i })).not.toBeInTheDocument();
    });
    expect(loadProfiles()).toHaveLength(0);
  });
});

// ─── FamilyProfilesPage — profile list ───────────────────────────────────────

describe('FamilyProfilesPage — profile list', () => {
  it('renders existing profiles on mount', () => {
    saveProfile({
      name: 'Rajkumar', relationship: 'Self', birthDate: '1963-09-15',
      birthTime: '06:00', birthTimezone: 'Asia/Kolkata',
      birthLat: 23.5, birthLon: 74.32, birthPlace: 'Aspur', notes: '',
    });
    renderPage();
    expect(screen.getByText('Rajkumar')).toBeInTheDocument();
  });

  it('shows relationship badge', () => {
    saveProfile({
      name: 'Mummy', relationship: 'Mother', birthDate: '1947-09-05',
      birthTime: '', birthTimezone: 'Asia/Kolkata',
      birthLat: 0, birthLon: 0, birthPlace: '', notes: '',
    });
    renderPage();
    expect(screen.getByText('Mother')).toBeInTheDocument();
  });

  it('each profile has edit and delete buttons', () => {
    saveProfile({
      name: 'Papa', relationship: 'Father', birthDate: '1940-01-01',
      birthTime: '', birthTimezone: 'Asia/Kolkata',
      birthLat: 0, birthLon: 0, birthPlace: '', notes: '',
    });
    renderPage();
    expect(screen.getByRole('button', { name: /edit Papa/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete Papa/i })).toBeInTheDocument();
  });

  it('delete shows confirm step before removing', async () => {
    saveProfile({
      name: 'TestMember', relationship: '', birthDate: '1970-01-01',
      birthTime: '', birthTimezone: 'Asia/Kolkata',
      birthLat: 0, birthLon: 0, birthPlace: '', notes: '',
    });
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /delete TestMember/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /confirm delete/i })).toBeInTheDocument();
    });
  });

  it('profile disappears after confirmed delete', async () => {
    saveProfile({
      name: 'ToDelete', relationship: '', birthDate: '1970-01-01',
      birthTime: '', birthTimezone: 'Asia/Kolkata',
      birthLat: 0, birthLon: 0, birthPlace: '', notes: '',
    });
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /delete ToDelete/i }));
    await waitFor(() => {
      const confirmBtn = screen.getByRole('button', { name: /confirm delete/i });
      fireEvent.click(confirmBtn);
    });
    await waitFor(() => {
      expect(screen.queryByText('ToDelete')).not.toBeInTheDocument();
    });
  });
});

// ─── FamilyProfileForm validation ────────────────────────────────────────────

describe('FamilyProfileForm — validation', () => {
  it('shows error when date is missing but name is filled', async () => {
    renderPage();
    // Click toolbar Add Member (not "Add First Member")
    const buttons = screen.getAllByRole('button', { name: /add.*member/i });
    const toolbarBtn = buttons.find((b) => !/first/i.test(b.textContent ?? ''));
    fireEvent.click(toolbarBtn ?? buttons[0]);

    fireEvent.change(document.getElementById('fp-name')!, { target: { value: 'Valid Name' } });
    // Don't fill date
    fireEvent.click(screen.getByRole('button', { name: /add profile/i }));
    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert.textContent).toMatch(/birth date is required/i);
    });
  });
});

// ─── FamilyProfileSelector ───────────────────────────────────────────────────

describe('FamilyProfileSelector', () => {
  it('renders trigger button', () => {
    render(
      <MemoryRouter>
        <FamilyProfileSelector onSelect={() => {}} triggerLabel="Family Profiles" />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /family profiles/i })).toBeInTheDocument();
  });

  it('button has aria-haspopup="listbox"', () => {
    render(
      <MemoryRouter>
        <FamilyProfileSelector onSelect={() => {}} />
      </MemoryRouter>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-haspopup', 'listbox');
  });

  it('opens popover on click', () => {
    render(
      <MemoryRouter>
        <FamilyProfileSelector onSelect={() => {}} triggerLabel="Family Profiles" />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('shows empty message when no profiles saved', () => {
    render(
      <MemoryRouter>
        <FamilyProfileSelector onSelect={() => {}} triggerLabel="Family Profiles" />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/no family profiles yet/i)).toBeInTheDocument();
  });

  it('shows saved profiles in listbox', () => {
    saveProfile({
      name: 'Alice', relationship: 'Self', birthDate: '1990-01-01',
      birthTime: '', birthTimezone: 'Asia/Kolkata',
      birthLat: 0, birthLon: 0, birthPlace: '', notes: '',
    });
    render(
      <MemoryRouter>
        <FamilyProfileSelector onSelect={() => {}} triggerLabel="Family Profiles" />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('option', { name: /alice/i })).toBeInTheDocument();
  });

  it('calls onSelect with the profile when option clicked', () => {
    const profile = saveProfile({
      name: 'Bob', relationship: 'Father', birthDate: '1960-06-06',
      birthTime: '', birthTimezone: 'Asia/Kolkata',
      birthLat: 0, birthLon: 0, birthPlace: '', notes: '',
    });
    const onSelect = vi.fn();
    render(
      <MemoryRouter>
        <FamilyProfileSelector onSelect={onSelect} triggerLabel="Family Profiles" />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('option', { name: /bob/i }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: profile.id, name: 'Bob' }));
  });
});

// ─── Source structure checks ──────────────────────────────────────────────────

import * as fs from 'fs';
import * as path from 'path';

describe('Route and registry registration', () => {
  it('/family-profiles is in appRoutes', () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../routes/appRoutes.tsx'), 'utf-8',
    );
    expect(source).toContain('/family-profiles');
    expect(source).toContain('FamilyProfilesPage');
  });

  it('/family-profiles is in featureRegistry', () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../routes/featureRegistry.ts'), 'utf-8',
    );
    expect(source).toContain('/family-profiles');
    expect(source).toContain('Family Profiles');
  });
});

describe('FamilyProfilesPage — source structure', () => {
  it('uses aria-live on list region', () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../pages/FamilyProfilesPage.tsx'), 'utf-8',
    );
    expect(source).toContain('aria-live');
  });

  it('has noIndex SEO meta', () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../pages/FamilyProfilesPage.tsx'), 'utf-8',
    );
    expect(source).toContain('noIndex={true}');
  });

  it('uses tabIndex={-1} for focus management', () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../pages/FamilyProfilesPage.tsx'), 'utf-8',
    );
    expect(source).toContain('tabIndex={-1}');
  });
});

// ─── useFamilyProfiles hook ───────────────────────────────────────────────────

describe('useFamilyProfiles hook', () => {
  it('loads profiles on mount', async () => {
    saveProfile({
      name: 'Hook Test', relationship: '', birthDate: '2000-01-01',
      birthTime: '', birthTimezone: 'Asia/Kolkata',
      birthLat: 0, birthLon: 0, birthPlace: '', notes: '',
    });
    const { renderHook, act } = await import('@testing-library/react');
    const { useFamilyProfiles } = await import('@/hooks/useFamilyProfiles');
    const { result } = renderHook(() => useFamilyProfiles());
    await act(async () => {});
    expect(result.current.profiles.some((p) => p.name === 'Hook Test')).toBe(true);
  });

  it('addProfile adds to the list', async () => {
    const { renderHook, act } = await import('@testing-library/react');
    const { useFamilyProfiles } = await import('@/hooks/useFamilyProfiles');
    const { result } = renderHook(() => useFamilyProfiles());
    await act(async () => {});
    act(() => {
      result.current.addProfile({
        name: 'New Member', relationship: 'Sibling', birthDate: '1995-05-15',
        birthTime: '', birthTimezone: 'Asia/Kolkata',
        birthLat: 0, birthLon: 0, birthPlace: '', notes: '',
      });
    });
    expect(result.current.profiles.some((p) => p.name === 'New Member')).toBe(true);
  });

  it('removeProfile removes from the list', async () => {
    const p = saveProfile({
      name: 'To Remove', relationship: '', birthDate: '1980-01-01',
      birthTime: '', birthTimezone: 'Asia/Kolkata',
      birthLat: 0, birthLon: 0, birthPlace: '', notes: '',
    });
    const { renderHook, act } = await import('@testing-library/react');
    const { useFamilyProfiles } = await import('@/hooks/useFamilyProfiles');
    const { result } = renderHook(() => useFamilyProfiles());
    await act(async () => {});
    act(() => result.current.removeProfile(p.id));
    expect(result.current.profiles.some((pr) => pr.id === p.id)).toBe(false);
  });

  it('addProfile with invalid data sets error state', async () => {
    const { renderHook, act } = await import('@testing-library/react');
    const { useFamilyProfiles } = await import('@/hooks/useFamilyProfiles');
    const { result } = renderHook(() => useFamilyProfiles());
    await act(async () => {});
    act(() => {
      result.current.addProfile({
        name: '', relationship: '', birthDate: '',
        birthTime: '', birthTimezone: 'Asia/Kolkata',
        birthLat: 0, birthLon: 0, birthPlace: '', notes: '',
      });
    });
    expect(result.current.error).toBeTruthy();
  });
});
