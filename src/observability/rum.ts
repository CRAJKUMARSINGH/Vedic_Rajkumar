/**
 * rum.ts — batches Web Vitals and ships them to /functions/v1/ingest-rum.
 * The existing web-vitals reporter measured; this is what delivers.
 */
const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL ?? ''}/functions/v1/ingest-rum`;
const MAX_BATCH = 20;
const FLUSH_MS = 10_000;

interface Sample { metric: string; value: number; route: string }
let buffer: Sample[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

function normalize(path: string): string {
  return path
    .split('?')[0]
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
    .replace(/\/\d+/g, '/:n');
}

export function reportVital(metric: string, value: number, route?: string): void {
  if (!ENDPOINT.startsWith('http')) return;
  buffer.push({ metric, value, route: normalize(route ?? window.location.pathname) });
  if (buffer.length >= MAX_BATCH) return void flushRum();
  timer ??= setTimeout(() => void flushRum(), FLUSH_MS);
}

export async function flushRum(): Promise<void> {
  if (timer) { clearTimeout(timer); timer = null; }
  if (!buffer.length) return;
  const samples = buffer.slice(0, MAX_BATCH);
  buffer = buffer.slice(MAX_BATCH);

  try {
    await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ samples }),
      keepalive: true,
    });
  } catch {
    /* best-effort */
  }
}

/** Flush on tab hide so the last window is not lost. */
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') void flushRum(); });
}
