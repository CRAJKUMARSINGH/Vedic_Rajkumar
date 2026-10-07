/**
 * Application Entry Point
 * Initializes the React app with all required providers and global setup.
 *
 * Boot order:
 *  1. validateEnv()           — warn about missing integrations without blocking the shell
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
import '@/config/env';
import { validateEnv } from '@/lib/envConfig';
import { initErrorMonitoring, captureException } from '@/lib/errorMonitoring';
import { initTelemetry } from '@/lib/telemetry';
import { initObservability } from '@/observability';
import { logger } from '@/observability/logging/logger';

// ─── Step 1: Validate environment variables ───────────────────────────────────
// Warns about missing integration variables; the shell can run in demo/offline mode.
validateEnv();

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

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// ─── Post-mount performance ───────────────────────────────────────────────────
if (typeof performance !== 'undefined') {
  performance.mark('app-init-end');
  performance.measure('app-init', 'app-init-start', 'app-init-end');
}
