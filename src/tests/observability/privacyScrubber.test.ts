import { describe, it, expect } from 'vitest';
import { hashUserId, scrubPII } from '@/observability/privacy-scrubber';

describe('privacy scrubber', () => {
  it('redacts PII fields and hashes userId', () => {
    const out = scrubPII({
      email: 'a@b.com',
      name: 'Ada',
      birthDate: '1970-01-01',
      location: 'Delhi',
      userId: 'user_123',
      route: '/kundli',
    });
    expect(out.email).toBe('[REDACTED]');
    expect(out.name).toBe('[REDACTED]');
    expect(out.birthDate).toBe('[REDACTED]');
    expect(out.location).toBe('[REDACTED]');
    expect(out.userId).toBe(hashUserId('user_123'));
    expect(out.route).toBe('/kundli');
  });
});
