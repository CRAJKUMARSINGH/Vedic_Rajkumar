/** Format: vk_<env>_<32 random base62 chars> */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const randomString = (len: number): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
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
