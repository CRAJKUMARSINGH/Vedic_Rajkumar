/**
 * Audit Service
 * Week 4: Writes immutable audit log entries to Supabase.
 * The audit_logs table has NO UPDATE/DELETE rules — entries are permanent.
 *
 * Usage:
 *   await audit.log('export', 'chart', chartId);
 *   await audit.log('update', 'profile', profileId, { before: old, after: updated });
 */

import { supabase } from '@/integrations/supabase/client';

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'export'
  | 'invite'
  | 'login'
  | 'logout'
  | 'mfa_enable'
  | 'mfa_disable'
  | 'role_change'
  | 'data_export';    // GDPR Article 20 export

export type AuditResourceType =
  | 'chart'
  | 'profile'
  | 'consultation'
  | 'organization'
  | 'user_role'
  | 'pdf_export'
  | 'session';

export interface AuditContext {
  orgId?: string;
  changes?: { before?: unknown; after?: unknown };
  metadata?: Record<string, unknown>;
}

class AuditService {
  private queue: Array<() => Promise<void>> = [];
  private flushing = false;

  /**
   * Write a single audit log entry.
   * Failures are swallowed (logged to console) — audit must never break UX.
   */
  async log(
    action: AuditAction,
    resourceType: AuditResourceType,
    resourceId?: string,
    context?: AuditContext
  ): Promise<void> {
    const entry = () => this._write(action, resourceType, resourceId, context);
    this.queue.push(entry);
    void this._flush();
  }

  private async _flush(): Promise<void> {
    if (this.flushing) return;
    this.flushing = true;
    while (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) {
        try {
          await next();
        } catch {
          // Audit failures must never surface to users
        }
      }
    }
    this.flushing = false;
  }

  private async _write(
    action: AuditAction,
    resourceType: AuditResourceType,
    resourceId?: string,
    context?: AuditContext
  ): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    const { error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('audit_logs' as any)
      .insert({
        user_id: userId ?? null,
        org_id: context?.orgId ?? null,
        action,
        resource_type: resourceType,
        resource_id: resourceId ?? null,
        changes: context?.changes
          ? JSON.parse(JSON.stringify(context.changes))
          : null,
        user_agent:
          typeof navigator !== 'undefined' ? navigator.userAgent : null,
        session_id: userId ?? null,
      });

    if (error) {
      console.warn('[AuditService] Failed to write audit log:', error.message);
    }
  }

  /**
   * Convenience: log a chart export event.
   */
  logChartExport(chartId: string, orgId?: string): Promise<void> {
    return this.log('export', 'chart', chartId, { orgId });
  }

  /**
   * Convenience: log a GDPR data export.
   */
  logDataExport(orgId?: string): Promise<void> {
    return this.log('data_export', 'profile', undefined, { orgId });
  }

  /**
   * Convenience: log a role change.
   */
  logRoleChange(
    targetUserId: string,
    oldRole: string,
    newRole: string,
    orgId?: string
  ): Promise<void> {
    return this.log('role_change', 'user_role', targetUserId, {
      orgId,
      changes: { before: { role: oldRole }, after: { role: newRole } },
    });
  }
}

/**
 * Singleton audit service instance.
 * Import and call `audit.log(...)` anywhere in the app.
 */
export const audit = new AuditService();
