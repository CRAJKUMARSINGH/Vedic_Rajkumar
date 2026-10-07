/**
 * send-email edge function — Gap 2: Transactional Email Infrastructure
 * Routes email templates to Resend. Falls back to console when RESEND_API_KEY is absent.
 *
 * Templates supported: onboarding | chart_ready | consultation_reminder | transit_alert | data_export | account
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { logger } from '../_shared/observability.ts';

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

// ── Template Builders ─────────────────────────────────────────────────────────

function buildSubjectAndHtml(
  template: EmailTemplate,
  data: Record<string, string>,
): { subject: string; html: string } {
  const APP_URL = 'https://vedic-rajkumar.app';
  const name = data.name ?? 'Valued User';

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
          <p><a href="${APP_URL}/charts/${data.chartId}" style="background:#b45309;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">View My Kundli</a></p>
        `,
      };

    case 'consultation_reminder':
      return {
        subject: '🗓️ Consultation reminder — Vedic Rajkumar',
        html: `
          <p>You have a consultation with <strong>${data.clientName}</strong> scheduled for:</p>
          <p><strong>${new Date(data.scheduledAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</strong></p>
          <p><a href="${APP_URL}/practitioner/consultations">View Details</a></p>
        `,
      };

    case 'transit_alert':
      return {
        subject: `🌙 Transit Alert: ${data.alertType} — Vedic Rajkumar`,
        html: `
          <p>A significant transit has been detected in your chart:</p>
          <p><strong>${data.alertType}</strong></p>
          <p>${data.description}</p>
          <p><a href="${APP_URL}/transits">View Full Transit Report</a></p>
          <p style="font-size:11px;color:#aaa">Transit alerts are calculated using Vimshottari Dasha and Sidereal (Lahiri) positions.</p>
        `,
      };

    case 'data_export':
      return {
        subject: '📦 Your data export is ready — Vedic Rajkumar',
        html: `
          <p>Your personal data export is ready for download.</p>
          <p><a href="${data.downloadUrl}" style="background:#b45309;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">Download My Data</a></p>
          <p style="font-size:12px;color:#888">This link expires on ${new Date(data.expiresAt).toLocaleDateString('en-IN')}. Requested in compliance with GDPR Article 20 / DPDP Act.</p>
        `,
      };

    case 'account':
      return {
        subject: data.subject ?? 'Account notification — Vedic Rajkumar',
        html: data.html ?? '<p>Please visit the app for more details.</p>',
      };
  }
}

// ── Serve ─────────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') return corsResponse();

  try {
    const body: SendEmailRequest = await req.json();
    const { to, template, data } = body;

    if (!to || !template) {
      return new Response(JSON.stringify({ error: 'Missing required: to, template' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { subject, html } = buildSubjectAndHtml(template, data ?? {});
    const from = data.from ?? 'Vedic Rajkumar <hello@vedic-rajkumar.app>';

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
    const message = err instanceof Error ? err.message : 'unknown error';
    logger.error('send_email_error', { error: message });
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
