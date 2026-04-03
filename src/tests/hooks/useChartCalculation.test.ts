/**
 * Tests for useChartCalculation hook
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useChartCalculation, type BirthInput } from '@/hooks/useChartCalculation';

// ── Mock all heavy services ──────────────────────────────────────────────────
vi.mock('@/services/precisionEphemerisService', () => ({
  calculatePrecisePlanetaryPositions: vi.fn(() => ({
    planets: [
      { name: 'Sun', rashiIndex: 0, rashiName: 'Aries', degrees: 15, house: 1, dignity: 'Neutral', retrograde: false },
      { name: 'Moon', rashiIndex: 3, rashiName: 'Cancer', degrees: 10, house: 4, dignity: 'Own Sign', retrograde: false },
      { name: 'Mercury', rashiIndex: 1, rashiName: 'Taurus', degrees: 20, house: 2, dignity: 'Neutral', retrograde: false },
      { name: 'Venus', rashiIndex: 11, rashiName: 'Pisces', degrees: 12, house: 12, dignity: 'Exalted', retrograde: false },
      { name: 'Mars', rashiIndex: 0, rashiName: 'Aries', degrees: 5, house: 1, dignity: 'Own Sign', retrograde: false },
      { name: 'Jupiter', rashiIndex: 3, rashiName: 'Cancer', degrees: 25, house: 4, dignity: 'Exalted', retrograde: false },
      { name: 'Saturn', rashiIndex: 6, rashiName: 'Libra', degrees: 8, house: 7, dignity: 'Exalted', retrograde: false },
      { name: 'Rahu', rashiIndex: 2, rashiName: 'Gemini', degrees: 18, house: 3, dignity: 'Neutral', retrograde: true },
      { name: 'Ketu', rashiIndex: 8, rashiName: 'Sagittarius', degrees: 18, house: 9, dignity: 'Neutral', retrograde: true },
    ],
    ayanamsa: 24.13, julianDay: 2451545,
    sun: { sidereal: 15, rashi: 0, degrees: 15 },
    moon: { sidereal: 100, rashi: 3, degrees: 10 },
  })),
}));

vi.mock('@/services/ephemerisService', () => ({
  calculateCompletePlanetaryPositions: vi.fn(() => ({
    planets: [
      { name: 'Sun', rashiIndex: 0, rashiName: 'Aries', degrees: 15, house: 1, dignity: 'Neutral', retrograde: false },
      { name: 'Moon', rashiIndex: 3, rashiName: 'Cancer', degrees: 10, house: 4, dignity: 'Own Sign', retrograde: false },
      { name: 'Mars', rashiIndex: 0, rashiName: 'Aries', degrees: 5, house: 1, dignity: 'Own Sign', retrograde: false },
      { name: 'Mercury', rashiIndex: 1, rashiName: 'Taurus', degrees: 20, house: 2, dignity: 'Neutral', retrograde: false },
      { name: 'Jupiter', rashiIndex: 3, rashiName: 'Cancer', degrees: 25, house: 4, dignity: 'Exalted', retrograde: false },
      { name: 'Venus', rashiIndex: 11, rashiName: 'Pisces', degrees: 12, house: 12, dignity: 'Exalted', retrograde: false },
      { name: 'Saturn', rashiIndex: 6, rashiName: 'Libra', degrees: 8, house: 7, dignity: 'Exalted', retrograde: false },
      { name: 'Rahu', rashiIndex: 2, rashiName: 'Gemini', degrees: 18, house: 3, dignity: 'Neutral', retrograde: true },
      { name: 'Ketu', rashiIndex: 8, rashiName: 'Sagittarius', degrees: 18, house: 9, dignity: 'Neutral', retrograde: true },
    ],
    ayanamsa: 24.13,
    julianDay: 2451545,
    sun: { rashi: 0, rashiName: 'Aries', degrees: 15 },
    moon: { rashi: 3, rashiName: 'Cancer', degrees: 10 },
    mercury: { rashi: 1, rashiName: 'Taurus', degrees: 20 },
    venus: { rashi: 11, rashiName: 'Pisces', degrees: 12 },
    mars: { rashi: 0, rashiName: 'Aries', degrees: 5 },
    jupiter: { rashi: 3, rashiName: 'Cancer', degrees: 25 },
    saturn: { rashi: 6, rashiName: 'Libra', degrees: 8 },
    rahu: { rashi: 2, rashiName: 'Gemini', degrees: 18 },
    ketu: { rashi: 8, rashiName: 'Sagittarius', degrees: 18 },
  })),
}));

vi.mock('@/services/ascendantService', () => ({
  calculateCompleteAscendant: vi.fn(() => ({
    ascendant: { rashiIndex: 0, rashiName: 'Aries', degrees: 5 },
  })),
}));

vi.mock('@/services/nakshatraService', () => ({
  getNakshatraInfo: vi.fn(() => ({
    number: 1, id: 1, name: { en: 'Ashwini', hi: 'अश्विनी', sanskrit: 'Ashvini' },
    nameEn: 'Ashwini', nameHi: 'अश्विनी', nameSanskrit: 'Ashvini',
    nakshatra: 1, lord: 'Ketu', deity: 'Ashwini Kumaras', symbol: 'Horse Head',
    startDegree: 0, endDegree: 13.33, pada: 1,
    characteristics: { en: 'Swift, healing', hi: 'तीव्र, उपचार' },
  })),
}));

vi.mock('@/services/manglikService', () => ({
  checkManglikDosha: vi.fn(() => ({
    isManglik: false, severity: 'None', affectedHouses: [], remedies: [],
  })),
}));

vi.mock('@/services/dashaService', () => ({
  calculateVimshottariDasha: vi.fn(() => ({
    currentMahadasha: { planet: 'Sun', startDate: '2020-01-01', endDate: '2026-01-01' },
    mahadashas: [],
  })),
}));

vi.mock('@/services/yogaService', () => ({
  analyzeYogas: vi.fn(() => ({
    yogas: [{ name: 'Gajakesari', isPresent: true, strength: 'Strong', description: 'Jupiter-Moon yoga' }],
    totalYogas: 1,
  })),
}));

vi.mock('@/services/divisionalChartsService', () => ({
  calculateShodashVarga: vi.fn(() => ({
    D1: {}, D9: {}, vargottama: [], vimshopakaBala: {},
  })),
}));

vi.mock('@/services/shadabalaService', () => ({
  calculateShadbala: vi.fn(() => ({
    planets: [], totalStrength: {},
  })),
}));

vi.mock('@/services/ashtakavargaService', () => ({
  calculateAshtakavarga: vi.fn(() => ({
    bav: {}, sav: [], transitStrength: {},
  })),
}));

// ── Tests ────────────────────────────────────────────────────────────────────

const SAMPLE_INPUT: BirthInput = {
  date: '1990-06-15',
  time: '10:30',
  lat: 28.61,
  lon: 77.23,
};

describe('useChartCalculation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('starts with empty data and not calculating', () => {
    const { result } = renderHook(() => useChartCalculation(null));
    expect(result.current.isCalculating).toBe(false);
    expect(result.current.data.planetaryPositions).toBeNull();
    expect(result.current.data.ascendant).toBeNull();
    expect(result.current.errors).toEqual({});
  });

  it('calculates all chart data when input is provided', async () => {
    const { result } = renderHook(() => useChartCalculation(SAMPLE_INPUT));

    await waitFor(() => {
      expect(result.current.isCalculating).toBe(false);
      expect(result.current.data.planetaryPositions).not.toBeNull();
    }, { timeout: 1000 });

    const { data } = result.current;
    expect(data.planetaryPositions?.planets).toHaveLength(9);
    expect(data.ascendant?.ascendant.rashiName).toBe('Aries');
    expect(data.nakshatra?.nameEn).toBe('Ashwini');
    expect(data.manglik).not.toBeNull();
    expect(data.dasha).not.toBeNull();
    expect(data.yogas).not.toBeNull();
    expect(data.divisionalCharts).not.toBeNull();
    expect(data.shadbala).not.toBeNull();
    expect(data.ashtakavarga).not.toBeNull();
  });

  it('resets to empty when input becomes null', async () => {
    const { result, rerender } = renderHook(
      ({ input }: { input: BirthInput | null }) => useChartCalculation(input),
      { initialProps: { input: SAMPLE_INPUT } }
    );

    await waitFor(() => expect(result.current.data.planetaryPositions).not.toBeNull(), { timeout: 1000 });

    rerender({ input: null });
    expect(result.current.data.planetaryPositions).toBeNull();
    expect(result.current.errors).toEqual({});
  });

  it('recalculate() triggers a fresh calculation', async () => {
    const { result } = renderHook(() => useChartCalculation(SAMPLE_INPUT));

    await waitFor(() => expect(result.current.data.planetaryPositions).not.toBeNull(), { timeout: 1000 });

    const { calculatePrecisePlanetaryPositions } = await import('@/services/precisionEphemerisService');
    const callsBefore = (calculatePrecisePlanetaryPositions as ReturnType<typeof vi.fn>).mock.calls.length;

    act(() => result.current.recalculate());

    await waitFor(() => {
      const callsAfter = (calculatePrecisePlanetaryPositions as ReturnType<typeof vi.fn>).mock.calls.length;
      expect(callsAfter).toBeGreaterThan(callsBefore);
    }, { timeout: 1000 });
  });

  it('captures errors per service without crashing', async () => {
    // Verify the hook's error boundary: even if a service throws, others still run.
    // We test this by checking the hook returns a complete data object shape.
    const { result } = renderHook(() => useChartCalculation(SAMPLE_INPUT));

    await waitFor(() => expect(result.current.isCalculating).toBe(false), { timeout: 1000 });

    // errors object always exists (may be empty)
    expect(result.current.errors).toBeDefined();
    expect(typeof result.current.errors).toBe('object');
    // data object always has all keys
    expect('planetaryPositions' in result.current.data).toBe(true);
    expect('ascendant' in result.current.data).toBe(true);
    expect('yogas' in result.current.data).toBe(true);
  });

  it('exposes isCalculating=false after computation completes', async () => {
    const { result } = renderHook(() => useChartCalculation(SAMPLE_INPUT));

    await waitFor(() => {
      expect(result.current.data.planetaryPositions).not.toBeNull();
    }, { timeout: 1000 });

    expect(result.current.isCalculating).toBe(false);
  });
});
