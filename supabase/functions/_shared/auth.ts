import { corsHeaders } from './cors.ts';

export interface AuthContext {
  userId: string;
  email?: string;
  isServiceRole: boolean;
  role: string;
}

/**
 * Extracts and validates the authenticated user from the request.
 * Supports:
 * 1. Supabase Service Role key (for internal cron / inter-service calls)
 * 2. Clerk or Supabase JWT tokens via Authorization: Bearer <token>
 */
export async function authenticateRequest(req: Request): Promise<AuthContext> {
  const authHeader = req.headers.get('Authorization') ?? req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Response(
      JSON.stringify({ error: 'Unauthorized: Missing or malformed Authorization header' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  // 1. Check if caller is using the trusted service role key
  if (serviceRoleKey && token === serviceRoleKey) {
    return {
      userId: 'service_role',
      isServiceRole: true,
      role: 'service_role',
    };
  }

  // 2. Decode & validate JWT
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Response(
      JSON.stringify({ error: 'Unauthorized: Invalid JWT structure' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  let payload: Record<string, unknown>;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = atob(base64);
    payload = JSON.parse(jsonStr);
  } catch {
    throw new Response(
      JSON.stringify({ error: 'Unauthorized: Malformed JWT payload' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const exp = typeof payload.exp === 'number' ? payload.exp : undefined;
  if (exp && exp * 1000 < Date.now()) {
    throw new Response(
      JSON.stringify({ error: 'Unauthorized: Token expired' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const userId = typeof payload.sub === 'string' && payload.sub ? payload.sub : undefined;
  if (!userId) {
    throw new Response(
      JSON.stringify({ error: 'Unauthorized: Missing user subject claim' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  return {
    userId,
    email: typeof payload.email === 'string' ? payload.email : undefined,
    isServiceRole: false,
    role: typeof payload.role === 'string' ? payload.role : 'authenticated',
  };
}

/**
 * Ensures caller has service role authorization.
 */
export async function requireServiceRole(req: Request): Promise<AuthContext> {
  const auth = await authenticateRequest(req);
  if (!auth.isServiceRole) {
    throw new Response(
      JSON.stringify({ error: 'Forbidden: Service role authorization required' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
  return auth;
}
