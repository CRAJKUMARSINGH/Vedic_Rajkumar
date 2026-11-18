/**
 * funnel.ts — client event queue.
 *
 * Hard rule: analytics must never break the product. Every failure path here
 * ends in "drop the event", never "throw".
 *
 * Flush policy: on idle, on visibilitychange→hidden (the reliable mobile unload
 * signal), and at 20 events. NOT on every event.
 */
import { EDGE_URL } from '@/config';

export type FunnelEvent =
  | 'landing_view' | 'pricing_view' | 'signup_start' | 'signup_complete'
  | 'chart_created' | 'weekly_limit_hit' | 'upgrade_click'
  | 'checkout_start' | 'checkout_complete' | 'export_attempted' | 'export_gated'
  | 'invite_sent' | 'share_clicked' | 'feedback_submitted';

const ANON_KEY = 'vr.anon_id';
const MAX_QUEUE = 50;

let queue: Array<{ event: FunnelEvent; anon_id: string; props?: Record<string, unknown>; at: string }> = [];
let timer: number | null = null;
let flushing = false;

function anonId(): string {
  try {
    let id = localStorage.getItem(ANON_KEY);
    if (!id) { id = crypto.randomUUID(); localStorage.setItem(ANON_KEY, id); }
    return id;
  } catch {
    return '00000000-0000-4000-8000-000000000000';
  }
}

export function track(event: FunnelEvent, props?: Record<string, unknown>): void {
  try {
    queue.push({ event, anon_id: anonId(), props, at: new Date().toISOString() });
    if (queue.length >= 20) void flush();
    else schedule();
  } catch { /* never throw from analytics */ }
}

function schedule(): void {
  if (timer !== null) return;
  const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
  timer = idle
    ? idle(() => { timer = null; void flush(); }, { timeout: 3000 })
    : window.setTimeout(() => { timer = null; void flush(); }, 3000);
}

export async function flush(useBeacon = false): Promise<void> {
  if (flushing || !queue.length) return;
  const batch = queue.splice(0, 100);
  const body = JSON.stringify({ events: batch });

  // On unload, fetch is cancelled. sendBeacon is the only reliable option.
  if (useBeacon && navigator.sendBeacon) {
    try {
      navigator.sendBeacon(`${EDGE_URL}/funnel`, new Blob([body], { type: 'application/json' }));
      return;
    } catch { /* fall through to fetch */ }
  }

  flushing = true;
  try {
    const res = await fetch(`${EDGE_URL}/funnel`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true,
    });
    if (!res.ok && res.status !== 429) queue.unshift(...batch);   // retry once
  } catch {
    queue.unshift(...batch);                                       // offline: keep
  } finally {
    flushing = false;
    queue = queue.slice(0, MAX_QUEUE);
  }
}

/** Wire the reliable unload path. Called once from main.tsx. */
export function installFunnelFlush(): void {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flush(true);
  });
  window.addEventListener('pagehide', () => void flush(true));
}

export const anonIdForSignup = anonId;
