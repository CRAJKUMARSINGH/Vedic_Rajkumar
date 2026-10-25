/** Format: vk_<env>_<32 random base62 chars> */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Largest multiple of the alphabet length that fits in a byte. Bytes at or above
 * this are rejected: mapping the whole 0–255 range with `% 62` would give the
 * first eight symbols (A–H) ~25 % more draws than the rest (modulo bias).
 */
const BYTE_LIMIT = 256 - (256 % ALPHABET.length); // 248

/** Map one random byte onto an alphabet index, or `null` if it must be rejected. */
export const uniformIndex = (byte: number): number | null =>
  byte < BYTE_LIMIT ? byte % ALPHABET.length : null;

const randomString = (len: number): string => {
  let out = '';
  while (out.length < len) {
    // Draw 2× per round so a rejection rarely forces another round.
    for (const b of crypto.getRandomValues(new Uint8Array(len * 2))) {
      const i = uniformIndex(b);
      if (i === null) continue;
      out += ALPHABET[i];
      if (out.length === len) break;
    }
  }
  return out;
};

export interface GeneratedKey {
  plaintext: string;   // shown once to the user
  prefix: string;      // e.g. vk_live_a1B2 — for display / lookup
  hash: string;        // sha256 hex — stored in DB
}

export const generateApiKey = async (env: 'live' | 'test'): Promise<GeneratedKey> => {
  const secret = randomString(32);
  const plaintext = `vk_${env}_${secret}`;
  const prefix = plaintext.slice(0, 12);
  const hash = await sha256(plaintext);
  return { plaintext, prefix, hash };
};

export const sha256 = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
};

export const hashApiKey = sha256;

/** Constant-time compare. */
export const safeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};
