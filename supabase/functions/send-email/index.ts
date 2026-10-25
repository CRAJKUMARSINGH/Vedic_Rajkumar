/**
 * send-email edge function — Gap 2: Transactional Email Infrastructure
 * Routes email templates to Resend. Falls back to console when RESEND_API_KEY is absent.
 *
 * Hardened: Authenticated callers only (service role or authenticated user),
 * strictly validated sender addresses, and HTML escaping for user inputs.
 *
 * Templates supported: onboarding | chart_ready | consultation_reminder | transit_alert | data_export | account
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { logger } from '../_shared/observability.ts';
import { authenticateRequest } from '../_shared/auth.ts';

// ── Types ─────────────────────────────────────────────────────────────────────

type EmailTemplate =
  | 'onboarding'
  | 'chart_ready'
  | 'consultation_reminder'
  | 'transit_alert'
  | 'data_export'
  | 'account';

interface SendEmailRequest {
  to: string;
  template: EmailTemplate;
  data: Record<string, string>;
}

// ── Helper ────────────────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const ALLOWED_SENDERS = new Set([
  'Vedic Rajkumar <hello@vedic-rajkumar.app>',
  'Vedic Rajkumar <charts@vedic-rajkumar.app>',
  'Vedic Rajkumar <alerts@vedic-rajkumar.app>',
]);

const DEFAULT_FROM = 'Vedic Rajkumar <hello@vedic-rajkumar.app>';

// ── Template Builders ─────────────────────────────────────────────────────────

function buildSubjectAndHtml(
  template: EmailTemplate,
  data: Record<string, string>,
): { subject: string; html: string } {
  const APP_URL = 'https://vedic-rajkumar.app';
  const name = escapeHtml(data.name ?? 'Valued User');

  switch (template) {
    case 'onboarding':
      return {
        subject: '🙏 Welcome to your cosmic journey — Vedic Rajkumar',
        html: `
          <p>Namaste <strong>${name}</strong>,</p>
          <p>Your account is ready. Begin your Vedic journey by calculating your first Kundli birth chart.</p>
          <p><a href="${APP_URL}/kundli" style="background:#b45309;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">Calculate My Chart</a></p>
          <p style="font-size:12px;color:#888">Vedic Rajkumar · Jyotish Vidya for the modern seeker</p>
        `,
      };

    case 'chart_ready':
      return {
        subject: '✨ Your Kundli is ready — Vedic Rajkumar',
        html: `
          <p>Namaste <strong>${name}</strong>,</p>
          <p>Your birth chart has been calculated using the Lahiri (Chitrapaksha) ayanamsa.</p>
          <p><a href="${APP_URL}/charts/${encodeURIComponent(data.chartId ?? '')}" style="background:#b45309;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">View My Kundli</a></p>
        `,
      };

    case 'consultation_reminder': {
      const scheduledDate = data.scheduledAt ? new Date(data.scheduledAt) : new Date();
      const formattedDate = !isNaN(scheduledDate.getTime())
        ? scheduledDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        : 'Scheduled time';
      return {
        subject: '🗓️ Consultation reminder — Vedic Rajkumar',
        html: `
          <p>You have a consultation with <strong>${escapeHtml(data.clientName ?? 'Client')}</strong> scheduled for:</p>
          <p><strong>${formattedDate} IST</strong></p>
          <p><a href="${APP_URL}/practitioner/consultations">View Details</a></p>
        `,
      };
    }

    case 'transit_alert':
      return {
        subject: `🌙 Transit Alert: ${escapeHtml(data.alertType ?? 'Planetary Ingress')} — Vedic Rajkumar`,
        html: `
          <p>A significant transit has been detected in your chart:</p>
          <p><strong>${escapeHtml(data.alertType ?? '')}</strong></p>
          <p>${escapeHtml(data.description ?? '')}</p>
          <p><a href="${APP_URL}/transits">View Full Transit Report</a></p>
          <p style="font-size:11px;color:#aaa">Transit alerts are calculated using Vimshottari Dasha and Sidereal (Lahiri) positions.</p>
        `,
      };

    case 'data_export': {
      const expires = data.expiresAt ? new Date(data.expiresAt) : new Date(Date.now() + 86400000 * 7);
      const safeUrl = (data.downloadUrl ?? '').startsWith('https://') ? data.downloadUrl : APP_URL;
      return {
        subject: '📦 Your data export is ready — Vedic Rajkumar',
        html: `
          <p>Your personal data export is ready for download.</p>
          <p><a href="${safeUrl}" style="background:#b45309;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">Download My Data</a></p>
          <p style="font-size:12px;color:#888">This link expires on ${expires.toLocaleDateString('en-IN')}. Requested in compliance with GDPR Article 20 / DPDP Act.</p>
        `,
      };
    }

    case 'account':
      return {
        subject: escapeHtml(data.subject ?? 'Account notification — Vedic Rajkumar'),
        html: `<p>${escapeHtml(data.message ?? 'Please visit the app for more details.')}</p>`,
      };
  }
}

// ── Serve ─────────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') return corsResponse(req);

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // 1. Authenticate caller (prevents open relay)
    await authenticateRequest(req);

    // 2. Parse body safely
    let body: SendEmailRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { template, data } = body;
    let to = body.to;

    if (!to && (body as unknown as { userId?: string }).userId) {
      const serviceClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );
      const targetUserId = (body as unknown as { userId?: string }).userId!;
      const { data: userRecord } = await serviceClient.auth.admin.getUserById(targetUserId);
      to = userRecord?.user?.email ?? '';
    }

    if (!to || !template) {
      return new Response(JSON.stringify({ error: 'Missing required: to, template' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return new Response(JSON.stringify({ error: 'Invalid recipient email address' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { subject, html } = buildSubjectAndHtml(template, data ?? {});

    // Ensure sender cannot be spoofed to unapproved domains
    const candidateFrom = data?.from;
    const from = candidateFrom && ALLOWED_SENDERS.has(candidateFrom) ? candidateFrom : DEFAULT_FROM;

    const apiKey = Deno.env.get('RESEND_API_KEY');

    if (apiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ from, to, subject, html, tags: [{ name: 'template', value: template }] }),
      });

      if (!res.ok) {
        const err = await res.text();
        logger.error('resend_error', { status: res.status, error: err, to, template });
        return new Response(JSON.stringify({ error: 'Email delivery failed' }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      logger.info('email_sent', { to, template });
    } else {
      // No API key — log for dev/staging
      logger.info('email_noop_no_key', { to, template, subject });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    const message = err instanceof Error ? err.message : 'Internal server error';
    logger.error('send_email_error', { error: message });
    return new Response(JSON.stringify({ error: 'Email processing error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
