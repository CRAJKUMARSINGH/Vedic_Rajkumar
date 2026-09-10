/**
 * dataDeleteService.test.ts
 *
 * Tests for data delete service functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteUserData } from '@/services/dataDeleteService';
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

describe('dataDeleteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('deleteUserData', () => {
    it('should delete user data successfully', async () => {
      const mockResult = {
        deletedAt: '2024-01-01T00:00:00Z',
        userId: 'user_123',
        deleted: {
          saved_readings: 5,
          transit_readings: 1,
          prashna_sessions: 2,
          horoscope_analyses: 3,
          user_profile: 1,
        },
      };

      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.functions.invoke as any).mockResolvedValue({
        data: mockResult,
        error: null,
      });

      (assertNotRateLimited as any).mockReturnValue(true);

      const result = await deleteUserData(supabase);

      expect(result).toEqual(mockResult);
      expect(assertNotRateLimited).toHaveBeenCalledWith('user-data-delete', {
        capacity: 3,
        refillAmount: 3,
        windowMs: 24 * 60 * 60 * 1000,
      });
      expect(supabase.functions.invoke).toHaveBeenCalledWith('user-data-delete', {
        method: 'DELETE',
        body: { confirm: true },
      });
    });

    it('should throw error when rate limit is exceeded', async () => {
      (assertNotRateLimited as any).mockImplementation(() => {
        throw new Error('Rate limit reached');
      });

      const { supabase } = await import('@/integrations/supabase/client');

      await expect(deleteUserData(supabase)).rejects.toThrow('Rate limit reached');
    });

    it('should throw error when Supabase returns error', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.functions.invoke as any).mockResolvedValue({
        data: null,
        error: { message: 'Delete failed' },
      });

      (assertNotRateLimited as any).mockReturnValue(true);

      await expect(deleteUserData(supabase)).rejects.toThrow('Delete failed');
    });

    it('should throw error when no data is returned', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.functions.invoke as any).mockResolvedValue({
        data: null,
        error: null,
      });

      (assertNotRateLimited as any).mockReturnValue(true);

      await expect(deleteUserData(supabase)).rejects.toThrow('Delete failed: No data returned');
    });

    it('should handle empty dataset deletion', async () => {
      const mockResult = {
        deletedAt: '2024-01-01T00:00:00Z',
        userId: 'user_123',
        deleted: {
          saved_readings: 0,
          transit_readings: 0,
          prashna_sessions: 0,
          horoscope_analyses: 0,
          user_profile: 1,
        },
      };

      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.functions.invoke as any).mockResolvedValue({
        data: mockResult,
        error: null,
      });

      (assertNotRateLimited as any).mockReturnValue(true);

      const result = await deleteUserData(supabase);

      expect(result.deleted.saved_readings).toBe(0);
      expect(result.deleted.prashna_sessions).toBe(0);
    });
  });
});
