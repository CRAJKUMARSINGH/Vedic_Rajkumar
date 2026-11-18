import { describe, it, expect } from 'vitest';
import { signPayload, verifySignature } from '@/api/webhooks/sign';

describe('Webhook signing', () => {
  const secret = 'whsec_test_secret_key_12345';
  const body = JSON.stringify({ event: 'chart.created', id: '123' });
  const timestamp = Math.floor(Date.now() / 1000);

  it('generates consistent HMAC-SHA256 signature', async () => {
    const sig1 = await signPayload(secret, timestamp, body);
    const sig2 = await signPayload(secret, timestamp, body);
    expect(sig1).toBe(sig2);
    expect(sig1).toHaveLength(64);
  });

  it('verifies valid signature successfully', async () => {
    const sig = await signPayload(secret, timestamp, body);
    const isValid = await verifySignature(secret, timestamp, body, sig);
    expect(isValid).toBe(true);
  });

  it('rejects tampered body or incorrect secret', async () => {
    const sig = await signPayload(secret, timestamp, body);
    const tampered = await verifySignature(secret, timestamp, body + ' ', sig);
    expect(tampered).toBe(false);

    const wrongSecret = await verifySignature('whsec_wrong', timestamp, body, sig);
    expect(wrongSecret).toBe(false);
  });
});
