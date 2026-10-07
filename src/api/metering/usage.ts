/**
 * usage.ts — API Usage Metering (Week 11/13 gap fill)
 *
 * Records every API request to the `api_usage` table for:
 *   - Billing: per-key daily/monthly usage aggregation
 *   - Rate-limit enforcement: daily quota top-up check
 *   - Analytics: endpoint popularity + latency percentiles
 *
 * Usage:
 *   await metering.record({ keyId, endpoint, method, status, latencyMs });
 *   const ok = await metering.checkDailyQuota(keyId, tier);
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

// ─── Service ──────────────────────────────────────────────────────────────────

class MeteringService {
  /**
   * Record a single API request.
   * Fire-and-forget — never throws; metering must not break the request path.
   */
  record(usage: UsageRecord): void {
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
   * Check whether a key has remaining daily quota.
   * Returns true (allowed) or false (quota exhausted).
   */
  async checkDailyQuota(keyId: string, tier: Tier): Promise<boolean> {
    const { dailyQuota } = RATE_LIMITS[tier];
    if (dailyQuota === Infinity || dailyQuota <= 0) return true; // unlimited

    const today = new Date().toISOString().slice(0, 10);

    try {
      const { count, error } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('api_usage' as any)
        .select('*', { count: 'exact', head: true })
        .eq('key_id', keyId)
        .eq('day', today);

      if (error) {
        log.warn('quota_check_failed', { error: error.message });
        return true; // fail-open to avoid blocking legitimate traffic
      }

      return (count ?? 0) < dailyQuota;
    } catch {
      return true; // fail-open
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
