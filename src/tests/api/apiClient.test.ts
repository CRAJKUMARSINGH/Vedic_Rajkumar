import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '@/api/client';
import { ApiError } from '@/api/types';
import { calculateChart } from '@/api/endpoints/charts';
import { calculateDoubleTransits } from '@/api/endpoints/transits';
import { calculateMatchmaking } from '@/api/endpoints/matchmaking';
import { getPanchang } from '@/api/endpoints/panchang';

describe('API Client Layer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('ApiClient Core', () => {
    it('applies request interceptors and handles successful responses', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, message: 'ok' }),
      });
      global.fetch = mockFetch;

      const client = new ApiClient({
        baseUrl: 'https://api.vedic.example',
        getAuthToken: () => 'test-jwt-token',
      });

      let intercepted = false;
      client.useRequestInterceptor((ctx) => {
        intercepted = true;
        ctx.options.headers = { ...ctx.options.headers, 'X-Custom-Header': 'CustomVal' };
        return ctx;
      });

      const res = await client.get<{ success: boolean; message: string }>('/health');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.vedic.example/health',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-jwt-token',
            'X-Custom-Header': 'CustomVal',
          }),
        })
      );
      expect(intercepted).toBe(true);
      expect(res.data.success).toBe(true);
      expect(res.source).toBe('remote');
    });

    it('transforms HTTP error response into typed ApiError', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Invalid astrological input parameters' }),
      });

      const client = new ApiClient({ baseUrl: 'https://api.vedic.example' });

      await expect(client.post('/calculate', {})).rejects.toThrow(ApiError);
    });
  });

  describe('Charts Endpoint Fallback', () => {
    it('falls back to local Vedic Kundli calculation when remote API is unreachable', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));

      const client = new ApiClient({ baseUrl: 'https://api.vedic.example', enableFallback: true });

      const response = await calculateChart(
        {
          birthData: {
            date: '1990-05-15',
            time: '14:30',
            location: 'New Delhi (28.6139, 77.2090)',
            timezone: 5.5,
          },
          chartStyle: 'north-indian',
        },
        client
      );

      expect(response.source).toBe('fallback-local');
      expect(response.status).toBe(200);
      expect(response.data.houses).toHaveLength(12);
      expect(response.data.planets.length).toBeGreaterThan(0);
      expect(response.data.ascendant).toBeDefined();
    });
  });

  describe('Transits Endpoint Fallback', () => {
    it('calculates double transits via local fallback', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('API offline'));

      const client = new ApiClient({ enableFallback: true });
      const response = await calculateDoubleTransits(
        {
          targetDate: '2026-10-07',
          doubleTransitInput: {
            natalMoonRashi: 0,
            transitJupiterRashi: 1,
            transitSaturnRashi: 11,
          },
        },
        client
      );

      expect(response.source).toBe('fallback-local');
      expect(response.data.results).toHaveLength(5);
      const marriageResult = response.data.results.find((r) => r.type === 'marriage');
      expect(marriageResult).toBeDefined();
      expect(typeof marriageResult?.isActive).toBe('boolean');
    });
  });

  describe('Matchmaking Endpoint Fallback', () => {
    it('calculates 36-point Ashta Koota via local fallback', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('API offline'));

      const client = new ApiClient({ enableFallback: true });
      const response = await calculateMatchmaking(
        {
          maleBirthData: {
            date: '1990-01-01',
            time: '10:00',
            location: 'Delhi',
          },
          femaleBirthData: {
            date: '1992-02-02',
            time: '12:00',
            location: 'Mumbai',
          },
        },
        client
      );

      expect(response.source).toBe('fallback-local');
      expect(response.data.maxPoints).toBe(36);
      expect(response.data.categories).toHaveLength(8);
      expect(response.data.totalPoints).toBeGreaterThanOrEqual(0);
      expect(response.data.totalPoints).toBeLessThanOrEqual(36);
    });
  });

  describe('Panchang Endpoint Fallback', () => {
    it('calculates daily Panchang via local fallback', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('API offline'));

      const client = new ApiClient({ enableFallback: true });
      const response = await getPanchang(
        {
          date: '2026-10-07',
          coordinates: { lat: 28.6139, lon: 77.209 },
        },
        client
      );

      expect(response.source).toBe('fallback-local');
      expect(response.data.tithi).toBeDefined();
      expect(response.data.nakshatra).toBeDefined();
      expect(response.data.yoga).toBeDefined();
      expect(response.data.karana).toBeDefined();
      expect(response.data.var).toBeDefined();
    });
  });
});
