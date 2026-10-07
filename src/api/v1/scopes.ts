export const SCOPES = [
  'charts:read',
  'charts:write',
  'transits:read',
  'panchang:read',
  'muhurta:read',
  'ashtakavarga:read',
  'webhooks:manage',
] as const;
export type Scope = (typeof SCOPES)[number];

export type Tier = 'free' | 'developer' | 'business' | 'enterprise';

/** Requests per minute per tier. */
export const RATE_LIMITS: Record<Tier, { rpm: number; burst: number; dailyQuota: number }> = {
  free:       { rpm: 20,    burst: 40,    dailyQuota: 1_000 },
  developer:  { rpm: 120,   burst: 240,   dailyQuota: 50_000 },
  business:   { rpm: 600,   burst: 1200,  dailyQuota: 500_000 },
  enterprise: { rpm: 3000,  burst: 6000,  dailyQuota: 5_000_000 },
};

export const TIER_SCOPES: Record<Tier, Scope[]> = {
  free: ['charts:read', 'panchang:read'],
  developer: ['charts:read', 'charts:write', 'transits:read', 'panchang:read', 'muhurta:read'],
  business: [...SCOPES.filter((s) => s !== 'webhooks:manage')],
  enterprise: [...SCOPES],
};
