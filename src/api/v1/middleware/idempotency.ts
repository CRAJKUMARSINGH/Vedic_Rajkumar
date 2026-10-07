import { supabase } from '@/integrations/supabase/client';

/**
 * If an Idempotency-Key header is present and was seen before,
 * return the stored response instead of recomputing.
 */
export const checkIdempotency = async (req: Request, keyId: string) => {
  const idem = req.headers.get('idempotency-key');
  if (!idem) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('idempotency_keys')
    .select('response, status')
    .eq('key_id', keyId)
    .eq('idempotency_key', idem)
    .maybeSingle();

  return data ? { status: data.status, body: data.response } : null;
};

export const storeIdempotency = async (
  keyId: string, idem: string, status: number, body: unknown,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('idempotency_keys').upsert({
    key_id: keyId,
    idempotency_key: idem,
    status,
    response: body,
    created_at: new Date().toISOString(),
  });
};
