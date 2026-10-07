/**
 * Observability and Telemetry Helper
 * Week 7: Unified Error Tracking, Feature Usage, and Calculation Performance.
 */

export interface CalculationMetrics {
  type: string;
  durationMs: number;
  accuracyScore?: number;
  metadata?: Record<string, unknown>;
}

export interface TelemetryEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp: string;
}

class TelemetryService {
  private events: TelemetryEvent[] = [];

  /**
   * Capture and report exceptions
   */
  public captureException(error: Error, context?: Record<string, unknown>): void {
    console.error('[Telemetry Exception]', error.message, context);
    // Hook for Sentry or custom error logger if initialized
    if (typeof window !== 'undefined' && (window as unknown as { Sentry?: { captureException: (e: Error, ctx?: unknown) => void } }).Sentry) {
      (window as unknown as { Sentry: { captureException: (e: Error, ctx?: unknown) => void } }).Sentry.captureException(error, { extra: context });
    }
  }

  /**
   * Track feature adoption and user interaction
   */
  public trackFeature(feature: string, properties?: Record<string, unknown>): void {
    const event: TelemetryEvent = {
      name: `feature_${feature}`,
      properties,
      timestamp: new Date().toISOString(),
    };
    this.events.push(event);

    if (import.meta.env.DEV) {
      console.debug('[Telemetry Feature]', feature, properties);
    }
  }

  /**
   * Track computation duration and accuracy metrics
   */
  public trackCalculation(metrics: CalculationMetrics): void {
    const event: TelemetryEvent = {
      name: 'calculation_complete',
      properties: { ...metrics },
      timestamp: new Date().toISOString(),
    };
    this.events.push(event);

    if (import.meta.env.DEV) {
      console.debug('[Telemetry Calc]', `${metrics.type} completed in ${metrics.durationMs}ms`);
    }
  }

  public getRecentEvents(): readonly TelemetryEvent[] {
    return this.events.slice(-50);
  }
}

export const telemetry = new TelemetryService();
export default telemetry;
