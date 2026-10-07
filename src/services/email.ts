/**
 * email.ts — Transactional Email Service (Gap 2 remediation)
 * Uses Resend for welcome, chart-ready, and consultation reminder emails.
 * All emails are routed through the send-email edge function in production.
 */

import { logger } from '@/observability/logging/logger';

// ── Types ────────────────────────────────────────────────────────────────────

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  tags?: Array<{ name: string; value: string }>;
}

export type EmailCategory =
  | 'onboarding'
  | 'chart_ready'
  | 'consultation_reminder'
  | 'transit_alert'
  | 'data_export'
  | 'account';

// ── Constants ─────────────────────────────────────────────────────────────────

const FROM_DEFAULT = 'Vedic Rajkumar <hello@vedic-rajkumar.app>';
const FROM_CHARTS = 'Vedic Rajkumar <charts@vedic-rajkumar.app>';
const FROM_ALERTS = 'Vedic Rajkumar <alerts@vedic-rajkumar.app>';
const BASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

// ── Core send via Edge Function ───────────────────────────────────────────────

/**
 * Sends an email through the Supabase `send-email` edge function.
 * Falls back to console.warn in development (RESEND_API_KEY not available client-side).
 */
async function sendEmail(
  payload: { to: string; template: EmailCategory; data: Record<string, unknown> },
  authToken?: string,
): Promise<void> {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info('[email:dev]', payload);
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: ANON_KEY,
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`send-email edge function returned ${res.status}: ${text}`);
    }

    logger.info('email_sent', { to: payload.to, template: payload.template });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown email error';
    logger.error('email_send_failed', { to: payload.to, template: payload.template, error: message });
    // Non-blocking — don't rethrow; email failure must not break core flows.
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Send welcome email after user first sign-up. */
export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await sendEmail({
    to,
    template: 'onboarding',
    data: { name, from: FROM_DEFAULT },
  });
}

/** Notify user that their Kundli chart calculation is ready. */
export async function sendChartReadyEmail(to: string, chartId: string, name: string): Promise<void> {
  await sendEmail({
    to,
    template: 'chart_ready',
    data: { chartId, name, from: FROM_CHARTS },
  });
}

/** Remind practitioner of an upcoming consultation. */
export async function sendConsultationReminder(
  to: string,
  clientName: string,
  scheduledAt: Date,
): Promise<void> {
  await sendEmail({
    to,
    template: 'consultation_reminder',
    data: { clientName, scheduledAt: scheduledAt.toISOString(), from: FROM_DEFAULT },
  });
}

/** Send a critical transit alert (Chandrashtama, Sade Sati onset, etc.). */
export async function sendTransitAlertEmail(
  to: string,
  alertType: string,
  description: string,
  authToken?: string,
): Promise<void> {
  await sendEmail(
    {
      to,
      template: 'transit_alert',
      data: { alertType, description, from: FROM_ALERTS },
    },
    authToken,
  );
}

/** Notify user that their GDPR data export is ready for download. */
export async function sendDataExportReadyEmail(
  to: string,
  downloadUrl: string,
  expiresAt: Date,
): Promise<void> {
  await sendEmail({
    to,
    template: 'data_export',
    data: { downloadUrl, expiresAt: expiresAt.toISOString(), from: FROM_DEFAULT },
  });
}
