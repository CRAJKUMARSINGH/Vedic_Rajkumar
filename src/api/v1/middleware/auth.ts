import { supabase } from '@/integrations/supabase/client';
import { hashApiKey } from '../../keys/keygen';
import { TIER_SCOPES, type Scope, type Tier } from '../scopes';

export interface ApiContext {
  keyId: string;
  userId: string;
  tier: Tier;
  scopes: Scope[];
}

export const authenticate = async (req: Request): Promise<ApiContext | null> => {
  const header = req.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.headers.get('x-api-key');
  if (!token) return null;

  const hash = await hashApiKey(token);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('api_keys')
    .select('id, user_id, tier, scopes, revoked, expires_at')
    .eq('key_hash', hash)
    .single();

  if (error || !data || data.revoked) return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;

  const tier = (data.tier as Tier) || 'free';
  return {
    keyId: data.id,
    userId: data.user_id,
    tier,
    scopes: (data.scopes as Scope[])?.length ? (data.scopes as Scope[]) : (TIER_SCOPES[tier] ?? TIER_SCOPES.free),
  };
};

export const requireScope = (ctx: ApiContext, scope: Scope): boolean =>
  ctx.scopes.includes(scope);
