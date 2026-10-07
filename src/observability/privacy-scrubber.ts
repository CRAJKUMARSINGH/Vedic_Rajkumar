const SENSITIVE_FIELDS = new Set([
  'email',
  'name',
  'birthdate',
  'birthDate',
  'location',
  'phone',
  'address',
  'latitude',
  'longitude',
]);

const hashUserId = (userId: string): string => {
  let h = 5381;
  for (let i = 0; i < userId.length; i++) {
    h = ((h << 5) + h) ^ userId.charCodeAt(i);
  }
  return `u_${(h >>> 0).toString(16)}`;
};

export const scrubPII = (event: Record<string, unknown>): Record<string, unknown> => {
  const scrubbed: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(event)) {
    if (SENSITIVE_FIELDS.has(key) || SENSITIVE_FIELDS.has(key.toLowerCase())) {
      scrubbed[key] = '[REDACTED]';
      continue;
    }
    if (key === 'userId' && typeof value === 'string') {
      scrubbed[key] = hashUserId(value);
      continue;
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      scrubbed[key] = scrubPII(value as Record<string, unknown>);
      continue;
    }
    scrubbed[key] = value;
  }
  return scrubbed;
};

export { hashUserId };
