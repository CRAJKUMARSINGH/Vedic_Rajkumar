/**
 * dashaTransitTimeline.test.tsx
 *
 * Week 08: Dasha + Transit Timeline Tests
 *
 * Basic tests to verify the timeline component can be:
 * - Imported successfully
 * - Rendered without errors
 * - Handle user interactions
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import DashaTransitTimelineView from '@/components/DashaTransitTimelineView';

function renderView() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <DashaTransitTimelineView />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

// Mock the necessary services
vi.mock('@/services/dashaTransitCorrelationService', () => ({
  computeCorrelation: vi.fn(() => new Promise((resolve) => setTimeout(() => resolve({
    activeDasha: {
      mahaLord: 'Jupiter',
      antarLord: 'Saturn',
      pratyanLord: 'Mercury',
      mahaStart: '2020-01-01',
      mahaEnd: '2036-01-01',
      antarStart: '2024-01-01',
      antarEnd: '2025-01-01',
      pratyanStart: '2024-06-01',
      pratyanEnd: '2024-09-01',
      balanceDays: 365,
      moonNakshatra: 'Punarvasu',
    },
    transitPositions: [
      {
        planet: 'Saturn',
        sign: 'Aquarius',
        houseFromMoon: 11,
        degrees: 15.5,
        nakshatra: 'Shatabhisha',
        isFavorable: true,
        savScore: 42,
        savStrength: 'Strong',
      },
      {
        planet: 'Jupiter',
        sign: 'Taurus',
        houseFromMoon: 2,
        degrees: 20.3,
        nakshatra: 'Rohini',
        isFavorable: true,
        savScore: 38,
        savStrength: 'Moderate',
      },
    ],
    correlation: {
      activationLevel: 'High',
      score: 88,
      prediction: {
        en: 'Favorable period for growth and expansion.',
        hi: 'विकास और विस्तार के लिए अनुकूल अवधि।',
      },
      timing: {
        en: 'Events likely within 1–3 months.',
        hi: 'घटनाएं 1-3 महीने के भीतर संभावित।',
      },
    },
    moonSign: 'Gemini',
    moonHouse: 3,
    targetDate: '2024-09-09',
    monthlyOutlook: [
      {
        month: 'Sep 2024',
        monthKey: '2024-09',
        activationLevel: 'High',
        score: 85,
        mahaLord: 'Jupiter',
        antarLord: 'Saturn',
      },
      {
        month: 'Oct 2024',
        monthKey: '2024-10',
        activationLevel: 'Medium',
        score: 65,
        mahaLord: 'Jupiter',
        antarLord: 'Saturn',
      },
    ],
    isChandrashtama: false,
    ashtakavargaSummary: {
      overallStrength: 'Strong',
      averageScore: 35.5,
      favorableTransits: 6,
      unfavorableTransits: 3,
    },
    calculatedAt: new Date().toISOString(),
  }), 120)))
}));

vi.mock('@/components/ui/loading-skeleton', () => ({
  LoadingSkeleton: () => <div>Loading...</div>,
}));

vi.mock('@/components/ChartErrorState', () => ({
  default: ({ message }: { message: string }) => (
    <div data-testid="error-state">Error: {message}</div>
  ),
}));

vi.mock('@/components/ChartEmptyState', () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid="empty-state">{title}</div>
  ),
}));

vi.mock('@/components/PrototypeStatusBanner', () => ({
  ValidationInProgressNotice: () => <div data-testid="validation-banner">Validation in progress</div>,
}));

vi.mock('@/components/FamilyProfileSelector', () => ({
  default: () => <div data-testid="profile-selector">Profile Selector</div>,
}));

vi.mock('@/components/EnhancedLanguageToggle', () => ({
  default: () => <button data-testid="lang-toggle">Toggle Language</button>,
}));

describe('DashaTransitTimelineView', () => {
  it('should render without crashing', () => {
    renderView();
    expect(screen.getByText('Dasha + Transit Timeline')).toBeInTheDocument();
  });

  it('should display the form initially', () => {
    renderView();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Date of Birth')).toBeInTheDocument();
    expect(screen.getByLabelText('Time of Birth')).toBeInTheDocument();
  });

  it('should have a calculate button', () => {
    renderView();
    const calculateButton = screen.getByText('Generate Timeline');
    expect(calculateButton).toBeInTheDocument();
  });

  it('should show loading state when calculating', async () => {
    renderView();
    
    const calculateButton = screen.getByText('Generate Timeline');
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });
  });

  it('should display results after successful calculation', async () => {
    renderView();
    
    // Fill in the form
    const nameInput = screen.getByLabelText('Name');
    const dateInput = screen.getByLabelText('Date of Birth');
    const timeInput = screen.getByLabelText('Time of Birth');
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(dateInput, { target: { value: '1990-01-01' } });
    fireEvent.change(timeInput, { target: { value: '12:00' } });
    
    const calculateButton = screen.getByText('Generate Timeline');
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Current Period')).toBeInTheDocument();
      expect(screen.getByText('Monthly Outlook')).toBeInTheDocument();
      expect(screen.getByText('Major Transits')).toBeInTheDocument();
    });
  });

  it('should support language toggle', () => {
    renderView();
    const langToggle = screen.getByTestId('lang-toggle');
    expect(langToggle).toBeInTheDocument();
  });

  it('should display family profile selector', () => {
    renderView();
    const profileSelector = screen.getByTestId('profile-selector');
    expect(profileSelector).toBeInTheDocument();
  });

  it('should show validation banner', () => {
    renderView();
    const validationBanner = screen.getByTestId('validation-banner');
    expect(validationBanner).toBeInTheDocument();
  });
});
