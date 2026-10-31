/**
 * Application Entry Point
 * Initializes the React app with all required providers and global setup.
 *
 * Boot order:
 *  1. assertProdEnv()/warnMissingObservability() — fail fast in prod, warn in dev
 *  2. initObservability()     — Sentry error tracking + PostHog analytics + Web Vitals
 *                               + structured pino logger + correlation IDs (Week 9)
 *  2b. initErrorMonitoring()  — legacy Sentry adapter (kept for existing call sites)
 *  2c. initTelemetry()        — legacy PostHog adapter (kept for existing call sites)
 *  3. Global error listeners  — forward window errors to logger + captureException
 *  4. createRoot / render     — mount the React tree
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { assertProdEnv, warnMissingObservability } from '@/config/env';
import { initErrorMonitoring, captureException } from '@/lib/errorMonitoring';
import { initTelemetry } from '@/lib/telemetry';
import { initObservability } from '@/observability';
import { logger } from '@/observability/logging/logger';
import { serveAgentText } from '@/lib/agentMode';
import { hydrateFlags, installKillOverrides } from '@/flags';
import { installFunnelFlush } from '@/lib/funnel';
import { detectLocale, setLocale } from '@/i18n';
import { warmWorker } from '@/workers/client';

// ─── Step 1: Validate environment variables ───────────────────────────────────
// Prod throws when Supabase/Clerk keys are missing; dev warns and runs in
// demo/offline mode. Observability stays non-fatal in every mode.
assertProdEnv();
warnMissingObservability();

// ─── Step 1b: kill switches + analytics queue (must exist before first render)
// A `?kill=checkout` URL override has to be installed before anything reads a
// flag, and the funnel queue needs its unload path wired once, here.
installKillOverrides();
hydrateFlags();
installFunnelFlush();

// ─── Step 1c: locale + worker warm-up (cheap, keeps both bootstrap paths live)
// Locale is resolved from the browser once; the ephemeris worker is constructed
// eagerly so the first chart does not pay worker start-up cost.
setLocale(detectLocale());
warmWorker();

// ─── Step 2: Week 9 observability (Sentry + PostHog + Web Vitals + correlation)
initObservability();

// ─── Step 2b: Legacy adapters remain for call sites still on lib/errorMonitoring
initErrorMonitoring().catch((err) => {
  console.warn('[main.tsx] Error monitoring failed to initialize:', err);
});
initTelemetry();

// ─── Global error handler (before React mounts) ───────────────────────────────
window.addEventListener('error', (event) => {
  logger.error('window_error', { message: event.message, source: event.filename });
  captureException(event.error ?? new Error(event.message), {
    context: 'window.onerror',
    extra: { filename: event.filename, lineno: event.lineno, colno: event.colno },
  });
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error('unhandled_rejection', { reason: String(event.reason) });
  captureException(event.reason instanceof Error ? event.reason : new Error(String(event.reason)), {
    context: 'unhandledrejection',
  });
});

// ─── Performance mark ─────────────────────────────────────────────────────────
if (typeof performance !== 'undefined') {
  performance.mark('app-init-start');
}

// ─── Mount ────────────────────────────────────────────────────────────────────
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('[main.tsx] Root element #root not found in DOM');
}

const root = createRoot(rootElement);

// ─── Agent mode (verdict-first contract) ──────────────────────────────────────
// When the URL asks for the machine answer (?agent=1 / ?format=markdown), print
// the precomputed answer card instead of mounting the app shell.
void serveAgentText().then((served) => {
  if (served) return;

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  // ─── Post-mount performance ─────────────────────────────────────────────────
  if (typeof performance !== 'undefined') {
    performance.mark('app-init-end');
    performance.measure('app-init', 'app-init-start', 'app-init-end');
  }
});
