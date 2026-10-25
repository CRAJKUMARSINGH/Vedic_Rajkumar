import { describe, it, expect } from 'vitest';
import { generateApiKey, safeEqual, uniformIndex } from '@/api/keys/keygen';

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

  // Regression: `byte % 62` over the full 0-255 range biases the first eight
  // symbols (A-H). Bytes >= 248 must be rejected instead of folded back in.
  it('uniformIndex rejects bytes above the unbiased limit', () => {
    expect(uniformIndex(0)).toBe(0);
    expect(uniformIndex(61)).toBe(61);
    expect(uniformIndex(62)).toBe(0);
    expect(uniformIndex(247)).toBe(247 % 62);
    expect(uniformIndex(248)).toBeNull();
    expect(uniformIndex(255)).toBeNull();
  });

  it('uniformIndex maps each accepted byte to a valid alphabet index', () => {
    for (let b = 0; b < 256; b++) {
      const i = uniformIndex(b);
      if (i !== null) {
        expect(i).toBeGreaterThanOrEqual(0);
        expect(i).toBeLessThan(62);
      }
    }
  });

  it('generates 32-char secrets without bias-prone symbols', async () => {
    const k = await generateApiKey('test');
    const secret = k.plaintext.slice('vk_test_'.length);
    expect(secret).toHaveLength(32);
    expect(secret).toMatch(/^[A-Za-z0-9]{32}$/);
  });
});
