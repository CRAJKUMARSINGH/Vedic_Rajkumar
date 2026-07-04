/**
 * Performance Monitoring Service
 * Week 27 - Tuesday Implementation
 * Real User Monitoring (RUM) + Core Web Vitals
 */

export interface WebVitalsMetric {
  name: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

export interface PerformanceReport {
  url: string;
  timestamp: number;
  metrics: WebVitalsMetric[];
  deviceType: 'mobile' | 'tablet' | 'desktop';
  connectionType: string;
  memoryUsage?: number;
}

// Thresholds per Google's Core Web Vitals
const THRESHOLDS = {
  LCP:  { good: 2500,  poor: 4000  },
  FID:  { good: 100,   poor: 300   },
  CLS:  { good: 0.1,   poor: 0.25  },
  FCP:  { good: 1800,  poor: 3000  },
  TTFB: { good: 800,   poor: 1800  },
  INP:  { good: 200,   poor: 500   }
};

function getRating(name: WebVitalsMetric['name'], value: number): WebVitalsMetric['rating'] {
  const t = THRESHOLDS[name];
  if (value <= t.good) return 'good';
  if (value <= t.poor) return 'needs-improvement';
  return 'poor';
}

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

function getConnectionType(): string {
  const nav = navigator as any;
  return nav.connection?.effectiveType || nav.mozConnection?.effectiveType || 'unknown';
}

class PerformanceMonitoringService {
  private metrics: WebVitalsMetric[] = [];
  private observers: PerformanceObserver[] = [];

  /**
   * Start monitoring all Core Web Vitals
   */
  startMonitoring(): void {
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeFCP();
    this.observeTTFB();
    this.observeINP();
  }

  private observeLCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1] as any;
        this.recordMetric('LCP', last.startTime);
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(observer);
    } catch (_) {}
  }

  private observeFID(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          this.recordMetric('FID', entry.processingStart - entry.startTime);
        }
      });
      observer.observe({ type: 'first-input', buffered: true });
      this.observers.push(observer);
    } catch (_) {}
  }

  private observeCLS(): void {
    let clsValue = 0;
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.recordMetric('CLS', clsValue);
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(observer);
    } catch (_) {}
  }

  private observeFCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric('FCP', entry.startTime);
          }
        }
      });
      observer.observe({ type: 'paint', buffered: true });
      this.observers.push(observer);
    } catch (_) {}
  }

  private observeTTFB(): void {
    try {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (nav) {
        this.recordMetric('TTFB', nav.responseStart - nav.requestStart);
      }
    } catch (_) {}
  }

  private observeINP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          this.recordMetric('INP', entry.duration);
        }
      });
      observer.observe({ type: 'event', buffered: true, durationThreshold: 16 } as any);
      this.observers.push(observer);
    } catch (_) {}
  }

  private recordMetric(name: WebVitalsMetric['name'], value: number): void {
    const metric: WebVitalsMetric = {
      name,
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      rating: getRating(name, value),
      delta: value,
      id: `${name}-${Date.now()}`
    };

    // Update or add metric
    const idx = this.metrics.findIndex(m => m.name === name);
    if (idx >= 0) {
      this.metrics[idx] = metric;
    } else {
      this.metrics.push(metric);
    }
  }

  /**
   * Get current performance report
   */
  getReport(): PerformanceReport {
    return {
      url: window.location.pathname,
      timestamp: Date.now(),
      metrics: [...this.metrics],
      deviceType: getDeviceType(),
      connectionType: getConnectionType(),
      memoryUsage: (performance as any).memory?.usedJSHeapSize
    };
  }

  /**
   * Get overall score (0-100)
   */
  getScore(): number {
    if (this.metrics.length === 0) return 100;
    const scores = this.metrics.map(m =>
      m.rating === 'good' ? 100 : m.rating === 'needs-improvement' ? 60 : 20
    );
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  /**
   * Cleanup observers
   */
  disconnect(): void {
    this.observers.forEach(o => o.disconnect());
    this.observers = [];
  }
}

export const performanceMonitor = new PerformanceMonitoringService();
export default performanceMonitor;