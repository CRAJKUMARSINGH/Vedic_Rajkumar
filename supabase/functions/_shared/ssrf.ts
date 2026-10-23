/**
 * Server-Side Request Forgery (SSRF) Protection Utility
 * Validates external URLs before fetching to prevent unauthorized access
 * to private IP ranges, loopback, and cloud provider metadata services.
 */

// Private IPv4 ranges (CIDR blocks)
const PRIVATE_IPV4_PATTERNS = [
  /^127\./,                         // Loopback
  /^10\./,                          // RFC 1918 Class A
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // RFC 1918 Class B (172.16.0.0 - 172.31.255.255)
  /^192\.168\./,                    // RFC 1918 Class C
  /^169\.254\./,                    // Link-local / Cloud metadata (AWS/GCP/Azure)
  /^0\./,                           // Current network
  /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./, // Carrier-grade NAT (100.64.0.0/10)
  /^198\.(1[89])\./,                // Benchmarking (198.18.0.0/15)
];

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  '[::1]',
  '0.0.0.0',
  'metadata.google.internal',
  'instance-data',
]);

export interface UrlValidationOptions {
  allowHttp?: boolean;
  allowedProtocols?: string[];
  maxContentLength?: number;
}

/**
 * Validates a URL against SSRF vulnerabilities.
 * Throws an Error if the URL violates security rules.
 */
export function validateUrl(rawUrl: string, options: UrlValidationOptions = {}): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Invalid URL format');
  }

  const allowedProtocols = options.allowedProtocols ?? (options.allowHttp ? ['http:', 'https:'] : ['https:']);
  if (!allowedProtocols.includes(parsed.protocol)) {
    throw new Error(`Protocol '${parsed.protocol}' is not allowed. Only ${allowedProtocols.join(', ')} permitted.`);
  }

  const hostname = parsed.hostname.toLowerCase().trim();

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    throw new Error(`Access to hostname '${hostname}' is prohibited`);
  }

  // Check against private/link-local IPv4 patterns
  for (const pattern of PRIVATE_IPV4_PATTERNS) {
    if (pattern.test(hostname)) {
      throw new Error(`Access to private IP range '${hostname}' is prohibited`);
    }
  }

  // Check for IPv6 loopback / unique local / link-local
  if (
    hostname.startsWith('fe80:') ||
    hostname.startsWith('fc00:') ||
    hostname.startsWith('fd00:') ||
    hostname === '::1' ||
    hostname === '[::1]'
  ) {
    throw new Error(`Access to private IPv6 address '${hostname}' is prohibited`);
  }

  // Prevent port-based internal attacks (e.g., standard internal service ports)
  const port = parsed.port ? parseInt(parsed.port, 10) : (parsed.protocol === 'https:' ? 443 : 80);
  const dangerousPorts = [21, 22, 23, 25, 110, 143, 3306, 5432, 6379, 9200, 11211, 27017];
  if (dangerousPorts.includes(port)) {
    throw new Error(`Port ${port} is restricted for external requests`);
  }

  return parsed;
}

/**
 * Safe fetch with SSRF validation, timeout, and response size limits.
 */
export async function safeFetch(
  rawUrl: string,
  init: RequestInit = {},
  options: UrlValidationOptions & { timeoutMs?: number; maxBytes?: number } = {},
): Promise<Response> {
  const validated = validateUrl(rawUrl, options);
  const timeoutMs = options.timeoutMs ?? 10_000;
  const maxBytes = options.maxBytes ?? 1_000_000; // 1MB default

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(validated.toString(), {
      ...init,
      signal: controller.signal,
    });

    const contentLength = res.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > maxBytes) {
      throw new Error(`Response size exceeds limit of ${maxBytes} bytes`);
    }

    return res;
  } finally {
    clearTimeout(timer);
  }
}
