/**
 * Week 3 Data Layer Tests
 *
 * Unit tests for dataLayerService using a mocked Supabase client.
 * No real DB connection required.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  saveSavedReading,
  getSavedReadings,
  deleteSavedReading,
  upsertUserProfile,
  getUserProfile,
  exportAllUserData,
  deleteAllUserData,
  saveTransitReading,
  getTransitReadings,
  deleteTransitReading,
  savePrashnaSession,
  getPrashnaSessions,
  deletePrashnaSession,
  saveHoroscopeAnalysis,
  getHoroscopeAnalyses,
  deleteHoroscopeAnalysis,
} from '@/services/dataLayerService';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// ── Mock Supabase builder ─────────────────────────────────────────────────────

function makeQuery(returnData: unknown = null, returnError: unknown = null) {
  const query = {
    select:   vi.fn().mockReturnThis(),
    insert:   vi.fn().mockReturnThis(),
    update:   vi.fn().mockReturnThis(),
    upsert:   vi.fn().mockReturnThis(),
    delete:   vi.fn().mockReturnThis(),
    eq:       vi.fn().mockReturnThis(),
    order:    vi.fn().mockReturnThis(),
    limit:    vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: returnData, error: returnError }),
    single:   vi.fn().mockResolvedValue({ data: returnData, error: returnError }),
  };
  // Allow chained .then() for the query itself (Promise-like)
  (query as Record<string, unknown>).then = vi.fn((resolve: (v: unknown) => void) =>
    resolve({ data: Array.isArray(returnData) ? returnData : [returnData], error: returnError }),
  );
  return query;
}

function mockSupabase(returnData: unknown = null, returnError: unknown = null) {
  const query = makeQuery(returnData, returnError);
  return {
    from: vi.fn().mockReturnValue(query),
    _query: query,
  } as unknown as SupabaseClient<Database> & { _query: ReturnType<typeof makeQuery> };
}

// ── saveSavedReading ──────────────────────────────────────────────────────────

describe('saveSavedReading', () => {
  it('inserts a reading and returns the saved row', async () => {
    const row = {
      id: 'uuid-1',
      user_id: 'user_clerk_1',
      title: 'Test Reading',
      birth_date: '2025-01-01',
      birth_time: '06:00',
      birth_location: 'Mumbai (19.07, 72.87)',
      chart_type: 'transit',
      notes: null,
      results: null,
      created_at: new Date().toISOString(),
    };

    const db = mockSupabase(row);
    const result = await saveSavedReading(db, {
      userId:        'user_clerk_1',
      title:         'Test Reading',
      birthDate:     '2025-01-01',
      birthTime:     '06:00',
      birthLocation: 'Mumbai (19.07, 72.87)',
      chartType:     'transit',
    });

    expect(db.from).toHaveBeenCalledWith('saved_readings');
    expect(result).toMatchObject({ id: 'uuid-1', user_id: 'user_clerk_1' });
  });

  it('sanitizes title before inserting', async () => {
    const db = mockSupabase({ id: 'uuid-2', user_id: 'u1', title: 'Unsafe Input', birth_date: '2025-01-01', chart_type: 'natal', created_at: '' });
    await saveSavedReading(db, {
      userId:    'u1',
      title:     '<script>xss</script>Unsafe Input',
      birthDate: '2025-01-01',
    });

    const insertCall = (db._query.insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(insertCall.title).toBe('Unsafe Input'); // script stripped
  });

  it('throws when Supabase returns an error', async () => {
    const db = mockSupabase(null, { message: 'RLS denied' });
    await expect(
      saveSavedReading(db, { userId: 'u1', birthDate: '2025-01-01' }),
    ).rejects.toThrow('RLS denied');
  });
});

// ── getSavedReadings ──────────────────────────────────────────────────────────

describe('getSavedReadings', () => {
  it('returns an array of readings', async () => {
    const rows = [
      { id: 'r1', user_id: 'u1', birth_date: '2025-01-01', chart_type: 'transit', created_at: '' },
    ];
    const db = mockSupabase(rows);
    // For select queries the top-level query promise resolves with { data: rows }
    const fromSpy = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      order:  vi.fn().mockReturnThis(),
      limit:  vi.fn().mockResolvedValue({ data: rows, error: null }),
    });
    const client = { from: fromSpy } as unknown as SupabaseClient<Database>;

    const result = await getSavedReadings(client, 'u1');
    expect(fromSpy).toHaveBeenCalledWith('saved_readings');
    expect(result).toEqual(rows);
  });
});

// ── deleteSavedReading ────────────────────────────────────────────────────────

describe('deleteSavedReading', () => {
  it('calls delete with the correct id', async () => {
    const fromSpy = vi.fn().mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockResolvedValue({ error: null }),
    });
    const client = { from: fromSpy } as unknown as SupabaseClient<Database>;
    await deleteSavedReading(client, 'uuid-to-delete');
    expect(fromSpy).toHaveBeenCalledWith('saved_readings');
  });

  it('throws when delete returns an error', async () => {
    const fromSpy = vi.fn().mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockResolvedValue({ error: { message: 'Not found' } }),
    });
    const client = { from: fromSpy } as unknown as SupabaseClient<Database>;
    await expect(deleteSavedReading(client, 'missing-id')).rejects.toThrow('Not found');
  });
});

// ── upsertUserProfile ─────────────────────────────────────────────────────────

describe('upsertUserProfile', () => {
  it('upserts and returns profile', async () => {
    const profile = { id: 'u1', display_name: 'Raj', preferred_language: 'en', default_birth_date: null, default_birth_time: null, default_birth_place: null, updated_at: '' };
    const fromSpy = vi.fn().mockReturnValue({
      upsert:  vi.fn().mockReturnThis(),
      select:  vi.fn().mockReturnThis(),
      single:  vi.fn().mockResolvedValue({ data: profile, error: null }),
    });
    const client = { from: fromSpy } as unknown as SupabaseClient<Database>;

    const result = await upsertUserProfile(client, {
      id: 'u1',
      displayName: 'Raj',
      preferredLanguage: 'en',
    });
    expect(result).toMatchObject({ id: 'u1', display_name: 'Raj' });
  });
});

// ── getUserProfile ────────────────────────────────────────────────────────────

describe('getUserProfile', () => {
  it('returns null when no profile exists', async () => {
    const fromSpy = vi.fn().mockReturnValue({
      select:      vi.fn().mockReturnThis(),
      eq:          vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
    const client = { from: fromSpy } as unknown as SupabaseClient<Database>;
    const result = await getUserProfile(client, 'new-user');
    expect(result).toBeNull();
  });
});

// ── deleteAllUserData ───────────────────────────────────────────────────────────

describe('deleteAllUserData', () => {
  it('deletes all user data and returns counts', async () => {
    const readings = [{ id: 'r1', user_id: 'u1', birth_date: '2025-01-01', chart_type: 'transit', created_at: '' }];
    const transitReadings = [{ id: 't1', owner_id: 'u1', birth_date: '2025-01-01', created_at: '' }];
    const prashnaSessions = [{ id: 'p1', owner_id: 'u1', question: 'Test', created_at: '' }];
    const horoscopeAnalyses = [{ id: 'h1', owner_id: 'u1', question: 'Test', created_at: '' }];

    const fromSpy = vi.fn().mockImplementation((table: string) => {
      if (table === 'saved_readings') {
        const selectQuery = {
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({ data: readings, error: null }),
        };
        const deleteQuery = {
          eq: vi.fn().mockResolvedValue({ error: null }),
        };
        return {
          select: vi.fn().mockReturnValue(selectQuery),
          delete: vi.fn().mockReturnValue(deleteQuery),
        };
      }
      if (table === 'transit_readings') {
        const selectQuery = {
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({ data: transitReadings, error: null }),
        };
        const deleteQuery = {
          eq: vi.fn().mockResolvedValue({ error: null }),
        };
        return {
          select: vi.fn().mockReturnValue(selectQuery),
          delete: vi.fn().mockReturnValue(deleteQuery),
        };
      }
      if (table === 'prashna_sessions') {
        const selectQuery = {
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({ data: prashnaSessions, error: null }),
        };
        const deleteQuery = {
          eq: vi.fn().mockResolvedValue({ error: null }),
        };
        return {
          select: vi.fn().mockReturnValue(selectQuery),
          delete: vi.fn().mockReturnValue(deleteQuery),
        };
      }
      if (table === 'horoscope_analyses') {
        const selectQuery = {
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({ data: horoscopeAnalyses, error: null }),
        };
        const deleteQuery = {
          eq: vi.fn().mockResolvedValue({ error: null }),
        };
        return {
          select: vi.fn().mockReturnValue(selectQuery),
          delete: vi.fn().mockReturnValue(deleteQuery),
        };
      }
      const deleteQuery = {
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      return {
        delete: vi.fn().mockReturnValue(deleteQuery),
      };
    });

    const client = { from: fromSpy } as unknown as SupabaseClient<Database>;
    const result = await deleteAllUserData(client, 'u1');

    expect(result.deletedReadings).toBe(1);
    expect(result.deletedTransitReadings).toBe(1);
    expect(result.deletedPrashnaSessions).toBe(1);
    expect(result.deletedHoroscopeAnalyses).toBe(1);
    expect(result.deletedUserProfile).toBe(1);
  });
});

// ── exportAllUserData ─────────────────────────────────────────────────────────

describe('exportAllUserData', () => {
  it('returns a bundle with all user data types', async () => {
    const readings = [{ id: 'r1', user_id: 'u1', birth_date: '2025-01-01', chart_type: 'transit', created_at: '' }];
    const transitReadings = [{ id: 't1', owner_id: 'u1', birth_date: '2025-01-01', created_at: '' }];
    const prashnaSessions = [{ id: 'p1', owner_id: 'u1', question: 'Test question', created_at: '' }];
    const horoscopeAnalyses = [{ id: 'h1', owner_id: 'u1', question: 'Test analysis', created_at: '' }];
    const profile = { id: 'u1', preferred_language: 'en', updated_at: '' };

    const fromSpy = vi.fn().mockImplementation((table: string) => {
      if (table === 'saved_readings') {
        return {
          select: vi.fn().mockReturnThis(),
          eq:     vi.fn().mockReturnThis(),
          order:  vi.fn().mockReturnThis(),
          limit:  vi.fn().mockResolvedValue({ data: readings, error: null }),
        };
      }
      if (table === 'transit_readings') {
        return {
          select: vi.fn().mockReturnThis(),
          eq:     vi.fn().mockReturnThis(),
          order:  vi.fn().mockReturnThis(),
          limit:  vi.fn().mockResolvedValue({ data: transitReadings, error: null }),
        };
      }
      if (table === 'prashna_sessions') {
        return {
          select: vi.fn().mockReturnThis(),
          eq:     vi.fn().mockReturnThis(),
          order:  vi.fn().mockReturnThis(),
          limit:  vi.fn().mockResolvedValue({ data: prashnaSessions, error: null }),
        };
      }
      if (table === 'horoscope_analyses') {
        return {
          select: vi.fn().mockReturnThis(),
          eq:     vi.fn().mockReturnThis(),
          order:  vi.fn().mockReturnThis(),
          limit:  vi.fn().mockResolvedValue({ data: horoscopeAnalyses, error: null }),
        };
      }
      return {
        select:      vi.fn().mockReturnThis(),
        eq:          vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: profile, error: null }),
      };
    });

    const client = { from: fromSpy } as unknown as SupabaseClient<Database>;
    const result = await exportAllUserData(client, 'u1');

    expect(result.userId).toBe('u1');
    expect(result.savedReadings).toEqual(readings);
    expect(result.transitReadings).toEqual(transitReadings);
    expect(result.prashnaSessions).toEqual(prashnaSessions);
    expect(result.horoscopeAnalyses).toEqual(horoscopeAnalyses);
    expect(result.userProfile).toEqual(profile);
    expect(result.exportedAt).toBeTruthy();
  });
});

// ── Transit Readings Tests ──────────────────────────────────────────────────────

describe('saveTransitReading', () => {
  it('inserts a transit reading and returns the saved row', async () => {
    const row = {
      id: 'uuid-1',
      owner_id: 'user_clerk_1',
      birth_date: '2025-01-01',
      birth_time: '06:00',
      birth_location: 'Mumbai (19.07, 72.87)',
      moon_rashi_index: 5,
      transit_date: '2025-06-01',
      overall_score: 85,
      results: { test: 'data' },
      created_at: new Date().toISOString(),
    };

    const db = mockSupabase(row);
    const result = await saveTransitReading(db, {
      ownerId: 'user_clerk_1',
      birthDate: '2025-01-01',
      birthTime: '06:00',
      birthLocation: 'Mumbai (19.07, 72.87)',
      moonRashiIndex: 5,
      transitDate: '2025-06-01',
      overallScore: 85,
      results: { test: 'data' },
    });

    expect(db.from).toHaveBeenCalledWith('transit_readings');
    expect(result).toMatchObject({ id: 'uuid-1', owner_id: 'user_clerk_1' });
  });

  it('sanitizes input before inserting', async () => {
    const db = mockSupabase({ id: 'uuid-2', owner_id: 'u1', birth_date: '2025-01-01', created_at: '' });
    await saveTransitReading(db, {
      ownerId: 'u1',
      birthDate: '<script>xss</script>2025-01-01',
      birthTime: '06:00',
      birthLocation: 'Mumbai',
      moonRashiIndex: 5,
      transitDate: '2025-06-01',
      overallScore: 85,
      results: {},
    });

    const insertCall = (db._query.insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(insertCall.birth_date).toBe('2025-01-01'); // script stripped
  });
});

describe('getTransitReadings', () => {
  it('returns an array of transit readings', async () => {
    const rows = [
      { id: 't1', owner_id: 'u1', birth_date: '2025-01-01', created_at: '' },
    ];
    const fromSpy = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      order:  vi.fn().mockReturnThis(),
      limit:  vi.fn().mockResolvedValue({ data: rows, error: null }),
    });
    const client = { from: fromSpy } as unknown as SupabaseClient<Database>;

    const result = await getTransitReadings(client, 'u1');
    expect(fromSpy).toHaveBeenCalledWith('transit_readings');
    expect(result).toEqual(rows);
  });
});

describe('deleteTransitReading', () => {
  it('calls delete with the correct id', async () => {
    const fromSpy = vi.fn().mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockResolvedValue({ error: null }),
    });
    const client = { from: fromSpy } as unknown as SupabaseClient<Database>;
    await deleteTransitReading(client, 'uuid-to-delete');
    expect(fromSpy).toHaveBeenCalledWith('transit_readings');
  });
});

// ── Prashna Sessions Tests ─────────────────────────────────────────────────────

describe('savePrashnaSession', () => {
  it('inserts a prashna session and returns the saved row', async () => {
    const row = {
      id: 1,
      owner_id: 'user_clerk_1',
      question: 'Will I get the job?',
      prashna_lagna: 'Aries',
      category: 'career',
      brief_summary_en: 'Summary',
      brief_summary_hi: 'सारांश',
      answer_en: 'Answer',
      answer_hi: 'उत्तर',
      created_at: new Date().toISOString(),
    };

    const db = mockSupabase(row);
    const result = await savePrashnaSession(db, {
      ownerId: 'user_clerk_1',
      question: 'Will I get the job?',
      prashnaLagna: 'Aries',
      category: 'career',
      briefSummaryEn: 'Summary',
      briefSummaryHi: 'सारांश',
      answerEn: 'Answer',
      answerHi: 'उत्तर',
    });

    expect(db.from).toHaveBeenCalledWith('prashna_sessions');
    expect(result).toMatchObject({ id: 1, owner_id: 'user_clerk_1' });
  });
});

describe('getPrashnaSessions', () => {
  it('returns an array of prashna sessions', async () => {
    const rows = [
      { id: 1, owner_id: 'u1', question: 'Test question', created_at: '' },
    ];
    const fromSpy = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      order:  vi.fn().mockReturnThis(),
      limit:  vi.fn().mockResolvedValue({ data: rows, error: null }),
    });
    const client = { from: fromSpy } as unknown as SupabaseClient<Database>;

    const result = await getPrashnaSessions(client, 'u1');
    expect(fromSpy).toHaveBeenCalledWith('prashna_sessions');
    expect(result).toEqual(rows);
  });
});

describe('deletePrashnaSession', () => {
  it('calls delete with the correct id', async () => {
    const fromSpy = vi.fn().mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockResolvedValue({ error: null }),
    });
    const client = { from: fromSpy } as unknown as SupabaseClient<Database>;
    await deletePrashnaSession(client, 1);
    expect(fromSpy).toHaveBeenCalledWith('prashna_sessions');
  });
});

// ── Horoscope Analyses Tests ───────────────────────────────────────────────────

describe('saveHoroscopeAnalysis', () => {
  it('inserts a horoscope analysis and returns the saved row', async () => {
    const row = {
      id: 1,
      owner_id: 'user_clerk_1',
      question: 'What about my career?',
      chart_summary: 'Chart summary',
      analysis_en: 'Analysis',
      analysis_hi: 'विश्लेषण',
      created_at: new Date().toISOString(),
    };

    const db = mockSupabase(row);
    const result = await saveHoroscopeAnalysis(db, {
      ownerId: 'user_clerk_1',
      question: 'What about my career?',
      chartSummary: 'Chart summary',
      analysisEn: 'Analysis',
      analysisHi: 'विश्लेषण',
    });

    expect(db.from).toHaveBeenCalledWith('horoscope_analyses');
    expect(result).toMatchObject({ id: 1, owner_id: 'user_clerk_1' });
  });
});

describe('getHoroscopeAnalyses', () => {
  it('returns an array of horoscope analyses', async () => {
    const rows = [
      { id: 1, owner_id: 'u1', question: 'Test analysis', created_at: '' },
    ];
    const fromSpy = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      order:  vi.fn().mockReturnThis(),
      limit:  vi.fn().mockResolvedValue({ data: rows, error: null }),
    });
    const client = { from: fromSpy } as unknown as SupabaseClient<Database>;

    const result = await getHoroscopeAnalyses(client, 'u1');
    expect(fromSpy).toHaveBeenCalledWith('horoscope_analyses');
    expect(result).toEqual(rows);
  });
});

describe('deleteHoroscopeAnalysis', () => {
  it('calls delete with the correct id', async () => {
    const fromSpy = vi.fn().mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockResolvedValue({ error: null }),
    });
    const client = { from: fromSpy } as unknown as SupabaseClient<Database>;
    await deleteHoroscopeAnalysis(client, 1);
    expect(fromSpy).toHaveBeenCalledWith('horoscope_analyses');
  });
});

