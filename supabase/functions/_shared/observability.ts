/**
 * Edge-side observability helper — Week 9
 * Structured JSON logging with correlation ID propagation.
 * Used by all Supabase Edge Functions.
 */

export interface LogContext {
  correlationId?: string;
  requestId?: string;
  userId?: string;
  route?: string;
  status?: number;
  durationMs?: number;
  [key: string]: unknown;
}

const log = (level: string, message: string, ctx: LogContext = {}) => {
  console.log(
    JSON.stringify({
      level,
      message,
      service: 'vedic-rajkumar-edge',
      ts: new Date().toISOString(),
      ...ctx,
    }),
  );
};

export const logger = {
  debug: (m: string, c?: LogContext) => log('debug', m, c),
  info:  (m: string, c?: LogContext) => log('info',  m, c),
  warn:  (m: string, c?: LogContext) => log('warn',  m, c),
  error: (m: string, c?: LogContext) => log('error', m, c),
};

export const getCorrelationId = (req: Request): string =>
  req.headers.get('x-correlation-id') ?? crypto.randomUUID();

/**
 * Wraps an edge handler with timing + success/error logging.
 * Adds x-correlation-id to the outgoing response headers.
 */
export const withTelemetry = (
  route: string,
  handler: (req: Request) => Promise<Response>,
) => {
  return async (req: Request): Promise<Response> => {
    const start = Date.now();
    const correlationId = getCorrelationId(req);
    try {
      const response = await handler(req);
      logger.info('request_complete', {
        route,
        status: response.status,
        durationMs: Date.now() - start,
        correlationId,
      });
      // Surface the correlation id to callers so client logs can join server logs
      response.headers.set('x-correlation-id', correlationId);
      return response;
    } catch (err) {
      logger.error('request_failed', {
        route,
        status: 500,
        durationMs: Date.now() - start,
        correlationId,
        error: (err as Error).message,
      });
      throw err;
    }
  };
};
