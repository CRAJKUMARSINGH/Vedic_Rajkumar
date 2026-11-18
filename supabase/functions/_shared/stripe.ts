/**
 * _shared/stripe.ts — minimal Stripe REST client + webhook signature verification.
 * No SDK: keeps the Deno edge bundle small and avoids a version pin to babysit.
 */
const API = 'https://api.stripe.com/v1';

function secretKey(): string {
  const k = Deno.env.get('STRIPE_SECRET_KEY');
  if (!k) throw new Error('STRIPE_SECRET_KEY missing');
  return k;
}

/** form-encode nested params: { a: { b: 1 } } -> a[b]=1 */
function encode(obj: Record<string, unknown>, prefix = ''): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    if (v === undefined || v === null) continue;
    if (typeof v === 'object') out.push(...encode(v as Record<string, unknown>, key));
    else out.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
  }
  return out;
}

export async function stripePost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${secretKey()}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: encode(body).join('&'),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? `stripe ${res.status}`);
  return json as T;
}

function hex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Verify the `stripe-signature` header against the raw request body. */
export async function verifyStripeSignature(
  rawBody: string,
  header: string | null,
  secret: string,
  toleranceSec = 300,
): Promise<boolean> {
  if (!header) return false;
  const parts: Record<string, string[]> = {};
  for (const kv of header.split(',')) {
    const [k, v] = kv.split('=');
    (parts[k] ??= []).push(v);
  }
  const t = parts.t?.[0];
  if (!t) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > toleranceSec) return false;

  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${rawBody}`));
  const expected = hex(mac);
  return (parts.v1 ?? []).some((sig) => timingSafeEqual(sig, expected));
}
