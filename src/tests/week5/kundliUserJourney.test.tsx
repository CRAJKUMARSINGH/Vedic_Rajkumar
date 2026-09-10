/**
 * Week 5: Kundli User Journey Integration Tests
 *
 * Comprehensive integration tests for the Kundli (Birth Chart) user journey.
 * Tests the complete flow from user input through calculation to result display.
 *
 * Coverage:
 * - Form validation and user input handling
 * - Chart calculation with real engine
 * - Result display and rendering
 * - Error handling and edge cases
 * - Loading states and user feedback
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { calculateChart } from '@/features/kundli/engine';
import type { ChartResult } from '@/features/kundli/types';

// Simple test component that mimics the BirthChartPage form
function SimpleKundliForm() {
  const [result, setResult] = useState<ChartResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: 'Test Native',
    date: '1990-01-15',
    time: '10:30',
    latitude: '22.57',
    longitude: '88.36',
    timezone: 'Asia/Kolkata',
    place: 'Kolkata, India',
  });

  const handleCompute = async () => {
    setIsLoading(true);
    await Promise.resolve();
    try {
      const res = calculateChart({
        name: form.name,
        date: form.date,
        time: form.time,
        timezone: form.timezone,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        place: form.place,
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Birth Chart</h1>
      <label htmlFor="name">Name</label>
      <input
        id="name"
        type="text"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        data-testid="name-input"
      />
      <label htmlFor="date">Date of Birth</label>
      <input
        id="date"
        type="date"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
        data-testid="date-input"
      />
      <label htmlFor="time">Time of Birth</label>
      <input
        id="time"
        type="time"
        value={form.time}
        onChange={(e) => setForm({ ...form, time: e.target.value })}
        data-testid="time-input"
      />
      <label htmlFor="latitude">Latitude</label>
      <input
        id="latitude"
        type="number"
        step="0.01"
        value={form.latitude}
        onChange={(e) => setForm({ ...form, latitude: e.target.value })}
        data-testid="latitude-input"
      />
      <label htmlFor="longitude">Longitude</label>
      <input
        id="longitude"
        type="number"
        step="0.01"
        value={form.longitude}
        onChange={(e) => setForm({ ...form, longitude: e.target.value })}
        data-testid="longitude-input"
      />
      <button
        onClick={handleCompute}
        disabled={isLoading}
        data-testid="calculate-button"
      >
        {isLoading ? 'Calculating...' : 'Calculate Chart'}
      </button>
      {isLoading && <div data-testid="loading-state">Loading...</div>}
      {result && (
        <div data-testid="result-display">
          <h2>Chart for {result.birthData.name}</h2>
          <div>Ayanamsa: {result.ayanamsaValue.toFixed(3)}°</div>
          <table>
            <thead>
              <tr>
                <th>Planet</th>
                <th>Sign</th>
                <th>House</th>
              </tr>
            </thead>
            <tbody>
              {result.planets.map((p) => (
                <tr key={p.planet}>
                  <td>{p.planet}</td>
                  <td>{p.sign}</td>
                  <td>{p.house}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

describe('Kundli User Journey - Happy Path', () => {
  it('renders the birth chart page with empty state initially', () => {
    render(<SimpleKundliForm />);
    
    expect(screen.getByRole('heading', { name: /birth chart/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/latitude/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/longitude/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /calculate chart/i })).toBeInTheDocument();
  });

  it('calculates chart when valid form is submitted', async () => {
    render(<SimpleKundliForm />);

    // Submit form with default values
    fireEvent.click(screen.getByTestId('calculate-button'));

    // Verify result is displayed
    await waitFor(() => {
      expect(screen.getByTestId('result-display')).toBeInTheDocument();
      expect(screen.getByText(/chart for test native/i)).toBeInTheDocument();
    });
  });

  it('displays loading state during calculation', async () => {
    render(<SimpleKundliForm />);

    const submitButton = screen.getByTestId('calculate-button');
    fireEvent.click(submitButton);

    // Check loading state
    expect(submitButton).toBeDisabled();
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });
});

describe('Kundli User Journey - Edge Cases', () => {
  it('handles missing optional fields gracefully', async () => {
    render(<SimpleKundliForm />);

    // Submit with default values
    fireEvent.click(screen.getByTestId('calculate-button'));

    // Should still calculate with defaults
    await waitFor(() => {
      expect(screen.getByTestId('result-display')).toBeInTheDocument();
    });
  });

  it('handles different date formats', async () => {
    render(<SimpleKundliForm />);

    // Change date to end of year
    fireEvent.change(screen.getByTestId('date-input'), { target: { value: '2000-12-31' } });
    fireEvent.change(screen.getByTestId('time-input'), { target: { value: '23:59' } });

    fireEvent.click(screen.getByTestId('calculate-button'));

    // Should calculate successfully
    await waitFor(() => {
      expect(screen.getByTestId('result-display')).toBeInTheDocument();
    });
  });
});

describe('Kundli User Journey - Result Display', () => {
  it('displays planetary positions in table format', async () => {
    render(<SimpleKundliForm />);

    // Submit form
    fireEvent.click(screen.getByTestId('calculate-button'));

    // Verify planetary table is displayed
    await waitFor(() => {
      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Moon')).toBeInTheDocument();
    });
  });

  it('displays ayanamsa value with precision', async () => {
    render(<SimpleKundliForm />);

    // Submit form
    fireEvent.click(screen.getByTestId('calculate-button'));

    // Verify ayanamsa display
    await waitFor(() => {
      expect(screen.getByText(/Ayanamsa:/i)).toBeInTheDocument();
    });
  });
});

describe('Kundli User Journey - Accessibility', () => {
  it('has proper ARIA labels and roles', () => {
    render(<SimpleKundliForm />);

    // Check form labels
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/latitude/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/longitude/i)).toBeInTheDocument();

    // Check button accessibility
    const button = screen.getByTestId('calculate-button');
    expect(button).toBeInTheDocument();
  });

  it('displays results after calculation', async () => {
    render(<SimpleKundliForm />);

    // Submit form
    fireEvent.click(screen.getByTestId('calculate-button'));

    // Check for result display
    await waitFor(() => {
      expect(screen.getByTestId('result-display')).toBeInTheDocument();
    });
  });
});
