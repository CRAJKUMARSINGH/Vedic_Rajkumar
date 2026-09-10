/**
 * dataExportService.test.ts
 *
 * Tests for data export service functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportUserData, exportAndDownloadUserData } from '@/services/dataExportService';
import { assertNotRateLimited } from '@/lib/rateLimiter';

// Mock dependencies
vi.mock('@/lib/rateLimiter');
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('dataExportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exportUserData', () => {
    it('should export user data successfully', async () => {
      const mockData = {
        exportedAt: '2024-01-01T00:00:00Z',
        userId: 'user_123',
        userProfile: null,
        savedReadings: [],
        prashnaSessions: [],
        horoscopeAnalyses: [],
        transitReadings: [],
      };

      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.functions.invoke as any).mockResolvedValue({
        data: mockData,
        error: null,
      });

      (assertNotRateLimited as any).mockReturnValue(true);

      const result = await exportUserData(supabase);

      expect(result).toEqual(mockData);
      expect(assertNotRateLimited).toHaveBeenCalledWith('user-data-export', {
        capacity: 5,
        refillAmount: 5,
        windowMs: 60 * 60 * 1000,
      });
    });

    it('should throw error when rate limit is exceeded', async () => {
      (assertNotRateLimited as any).mockImplementation(() => {
        throw new Error('Rate limit reached');
      });

      const { supabase } = await import('@/integrations/supabase/client');

      await expect(exportUserData(supabase)).rejects.toThrow('Rate limit reached');
    });

    it('should throw error when Supabase returns error', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.functions.invoke as any).mockResolvedValue({
        data: null,
        error: { message: 'Export failed' },
      });

      (assertNotRateLimited as any).mockReturnValue(true);

      await expect(exportUserData(supabase)).rejects.toThrow('Export failed');
    });

    it('should throw error when no data is returned', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.functions.invoke as any).mockResolvedValue({
        data: null,
        error: null,
      });

      (assertNotRateLimited as any).mockReturnValue(true);

      await expect(exportUserData(supabase)).rejects.toThrow('Export failed: No data returned');
    });
  });

  describe('exportAndDownloadUserData', () => {
    it('should trigger file download', async () => {
      const mockData = {
        exportedAt: '2024-01-01T00:00:00Z',
        userId: 'user_123',
        userProfile: null,
        savedReadings: [],
        prashnaSessions: [],
        horoscopeAnalyses: [],
        transitReadings: [],
      };

      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.functions.invoke as any).mockResolvedValue({
        data: mockData,
        error: null,
      });

      (assertNotRateLimited as any).mockReturnValue(true);

      // Mock DOM methods
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      document.createElement = vi.fn().mockReturnValue(mockLink);
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();
      URL.createObjectURL = vi.fn().mockReturnValue('blob:url');
      URL.revokeObjectURL = vi.fn();

      await exportAndDownloadUserData(supabase);

      expect(mockLink.download).toBe('vedic-data-export-user_123.json');
      expect(mockLink.click).toHaveBeenCalled();
    });
  });
});
