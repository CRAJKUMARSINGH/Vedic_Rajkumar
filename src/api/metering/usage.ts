/**
 * usage.ts — API Usage Metering (Week 11/13 gap fill)
 *
 * READER + optional writer. The AUTHORITY is the edge: admit_request() increments
 * api_usage_daily atomically inside the same call that rate-limits. The client no
 * longer reports its own usage on the hot path, so a tampered browser cannot
 * exceed its plan.
 *
 *   const usage = await metering.getDailyUsage(keyId);   // reads the counter
 *   await metering.recordRaw({ keyId, endpoint, status }); // analytics rows, sampled
 */

import { supabase } from '@/integrations/supabase/client';
import { RATE_LIMITS, type Tier } from '@/api/v1/scopes';
import { createLogger } from '@/observability/logging/logger';

const log = createLogger('api.metering');

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UsageRecord {
  keyId: string;
  endpoint: string;
  method: string;
  status: number;
  latencyMs?: number;
}

export interface DailyUsage {
  requests: number;
  errors: number;
  avgLatency: number;
}

// ─── Service (server-authoritative reads) ─────────────────────────────────────

class MeteringService {
  /**
   * Analytics-only row. Sampled; NOT the quota authority. Fire-and-forget.
   */
  recordRaw(usage: UsageRecord): void {
    void this._write(usage);
  }

  private async _write(usage: UsageRecord): Promise<void> {
    try {
      const { error } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('api_usage' as any)
        .insert({
          key_id: usage.keyId,
          endpoint: usage.endpoint,
          method: usage.method,
          status: usage.status,
          latency_ms: usage.latencyMs ?? null,
          day: new Date().toISOString().slice(0, 10),
        });

      if (error) {
        log.warn('metering_write_failed', { error: error.message, keyId: usage.keyId });
      }
    } catch (err) {
      // Never surface metering errors — just log
      log.warn('metering_exception', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  /**
   * READ the server counter. O(1) — the previous implementation did
   * `select count(*)` over api_usage on every check, which is O(n) per request.
   */
  async getQuotaState(keyId: string, tier: Tier): Promise<{ allowed: boolean; used: number; quota: number }> {
    const { dailyQuota } = RATE_LIMITS[tier];
    if (dailyQuota === Infinity || dailyQuota <= 0) return { allowed: true, used: 0, quota: -1 };

    const today = new Date().toISOString().slice(0, 10);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('api_usage_daily')
        .select('requests')
        .eq('key_id', keyId)
        .eq('day', today)
        .maybeSingle();

      if (error) {
        log.warn('quota_read_failed', { error: error.message });
        return { allowed: true, used: 0, quota: dailyQuota }; // fail-open
      }

      const used = Number(data?.requests ?? 0);
      return { allowed: used <= dailyQuota, used, quota: dailyQuota };
    } catch {
      return { allowed: true, used: 0, quota: dailyQuota };
    }
  }

  /**
   * Fetch today's aggregated usage for a key (for the developer portal).
   */
  async getDailyUsage(keyId: string, date?: string): Promise<DailyUsage> {
    const day = date ?? new Date().toISOString().slice(0, 10);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('api_usage_daily')
        .select('requests, errors, avg_latency')
        .eq('key_id', keyId)
        .eq('day', day)
        .maybeSingle();

      if (error || !data) return { requests: 0, errors: 0, avgLatency: 0 };

      return {
        requests: data.requests ?? 0,
        errors: data.errors ?? 0,
        avgLatency: data.avg_latency ?? 0,
      };
    } catch {
      return { requests: 0, errors: 0, avgLatency: 0 };
    }
  }

  /**
   * Update the `last_used_at` timestamp on the key (background, non-blocking).
   */
  touchKey(keyId: string): void {
    void supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('api_keys' as any)
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyId);
  }
}

export const metering = new MeteringService();
