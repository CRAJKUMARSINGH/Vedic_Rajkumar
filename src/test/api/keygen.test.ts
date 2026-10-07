import { describe, it, expect } from 'vitest';
import { generateApiKey, safeEqual } from '@/api/keys/keygen';

describe('API keys', () => {
  it('generates prefixed keys with stable hash', async () => {
    const k = await generateApiKey('live');
    expect(k.plaintext.startsWith('vk_live_')).toBe(true);
    expect(k.prefix).toBe(k.plaintext.slice(0, 12));
    expect(k.hash).toHaveLength(64);
  });

  it('safeEqual is constant-time-correct', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
  });
});
