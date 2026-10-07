import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// Create a service client to call the rate limit function
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface RateLimitOptions {
  endpoint: string;
  maxRequestsAnon?: number;
  maxRequestsAuth?: number;
  windowSeconds?: number;
}

export async function checkRateLimit(req: Request, options: RateLimitOptions): Promise<boolean> {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const authHeader = req.headers.get('Authorization');
  const isAuth = !!authHeader;
  
  const maxRequests = isAuth ? (options.maxRequestsAuth ?? 1000) : (options.maxRequestsAnon ?? 100);
  const windowSeconds = options.windowSeconds ?? 60; // default 1 min
  
  const { data, error } = await supabase.rpc('check_rate_limit', {
    client_ip: ip,
    target_endpoint: options.endpoint,
    max_requests: maxRequests,
    window_seconds: windowSeconds
  });
  
  if (error) {
    console.error('Rate limit error:', error);
    // On error, fail open to not block traffic if DB is slow
    return true;
  }
  
  return !!data;
}

export const rateLimitResponse = () => new Response(
  JSON.stringify({ error: 'Too many requests. Please try again later.' }),
  { status: 429, headers: { 'Content-Type': 'application/json' } }
);
