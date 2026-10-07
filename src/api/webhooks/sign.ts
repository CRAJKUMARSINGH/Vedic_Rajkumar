/** HMAC-SHA256 signature over `${timestamp}.${body}` — Stripe-style. */
export const signPayload = async (secret: string, timestamp: number, body: string): Promise<string> => {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${body}`));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
};

export const verifySignature = async (
  secret: string, timestamp: number, body: string, signature: string,
): Promise<boolean> => {
  const expected = await signPayload(secret, timestamp, body);
  return expected === signature;
};
