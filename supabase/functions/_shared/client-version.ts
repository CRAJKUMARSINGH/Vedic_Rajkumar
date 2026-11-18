/**
 * client-version.ts — deploy-skew guard.
 *
 * THE PROBLEM: deploys are instant, clients are not. A client from last month
 * calls today's function. If the function changed a response shape, that user
 * breaks — and only that user, so it looks like a random bug.
 *
 * RULES:
 *   1. Additive-only response changes. Never rename or remove a field in place.
 *   2. A field is removed only after the old client is below the support floor.
 *   3. MIN_CLIENT_VERSION rises only when a breaking change has shipped AND the
 *      previous version has been out for 7 days.
 */

/** Bump ONLY with a breaking change. See docs/ops/UPDATE_SAFETY.md. */
export const MIN_CLIENT_VERSION = '1.4.0';

/** Current client, for the X-Server-Version response header. */
export const SERVER_VERSION = '1.7.3';

export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return 0;
}

export interface ClientCheck {
  ok: boolean;
  clientVersion: string | null;
  upgradeRequired: boolean;
  headers: Record<string, string>;
}

/**
 * Does NOT hard-fail by default. A hard 426 is reserved for endpoints where an
 * old shape is genuinely unusable — otherwise we break clients unnecessarily.
 */
export function checkClient(req: Request, opts: { hard?: boolean } = {}): ClientCheck {
  const clientVersion = req.headers.get('x-client-version');
  const headers: Record<string, string> = {
    'X-Min-Client-Version': MIN_CLIENT_VERSION,
    'X-Server-Version': SERVER_VERSION,
  };

  if (!clientVersion) {
    // Unknown client: assume old, be lenient, but advertise the floor.
    return { ok: true, clientVersion: null, upgradeRequired: false, headers };
  }

  const tooOld = compareVersions(clientVersion, MIN_CLIENT_VERSION) < 0;
  return {
    ok: !(tooOld && opts.hard),
    clientVersion,
    upgradeRequired: tooOld,
    headers,
  };
}

/** Attach version headers to any response. Cheap, and it makes skew visible. */
export function withVersionHeaders(res: Response, check: ClientCheck): Response {
  const h = new Headers(res.headers);
  for (const [k, v] of Object.entries(check.headers)) h.set(k, v);
  if (check.upgradeRequired) h.set('X-Upgrade-Required', 'true');
  return new Response(res.body, { status: res.status, headers: h });
}
