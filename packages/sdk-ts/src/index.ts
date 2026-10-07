export interface VedicClientOptions {
  apiKey: string;
  baseUrl?: string;
  maxRetries?: number;
}

export class VedicClient {
  private baseUrl: string;
  private apiKey: string;
  private maxRetries: number;

  constructor(opts: VedicClientOptions) {
    this.apiKey = opts.apiKey;
    this.baseUrl = opts.baseUrl ?? 'https://api.vedic-rajkumar.app';
    this.maxRetries = opts.maxRetries ?? 3;
  }

  private async request<T>(path: string, init: RequestInit = {}, attempt = 0): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    });

    if (res.status === 429 && attempt < this.maxRetries) {
      const retryAfter = Number(res.headers.get('X-RateLimit-Reset') ?? 1) * 1000;
      await new Promise((r) => setTimeout(r, retryAfter));
      return this.request<T>(path, init, attempt + 1);
    }
    if (res.status >= 500 && attempt < this.maxRetries) {
      await new Promise((r) => setTimeout(r, 2 ** attempt * 500));
      return this.request<T>(path, init, attempt + 1);
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Vedic API ${res.status}: ${JSON.stringify(err)}`);
    }
    return res.json() as Promise<T>;
  }

  charts = {
    create: (input: object, idempotencyKey?: string) =>
      this.request('/v1/charts', {
        method: 'POST',
        body: JSON.stringify(input),
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
      }),
    get: (id: string) => this.request(`/v1/charts/${id}`),
  };

  transits = {
    get: (chartId: string, asOf?: Date) =>
      this.request(`/v1/transits/${chartId}${asOf ? `?asOf=${asOf.toISOString()}` : ''}`),
  };
}
