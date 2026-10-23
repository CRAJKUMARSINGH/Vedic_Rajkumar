/**
 * Shared CORS and security headers for all Supabase Edge Functions
 */

export const securityHeaders: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-correlation-id, idempotency-key',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE, PUT',
  ...securityHeaders,
};

export const getCorsHeaders = (req?: Request): Record<string, string> => {
  const origin = req?.headers.get('origin');
  return {
    ...corsHeaders,
    ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
  };
};

export const corsResponse = (req?: Request) =>
  new Response('ok', {
    status: 200,
    headers: req ? getCorsHeaders(req) : corsHeaders,
  });
