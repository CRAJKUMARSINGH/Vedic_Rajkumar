/**
 * Performance Monitoring Utility
 * Measures and optimizes app performance with Lighthouse metrics
 */

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint (ms)
  fid: number; // First Input Delay (ms)
  cls: number; // Cumulative Layout Shift
  tti: number; // Time to Interactive (ms)
  fcp: number; // First Contentful Paint (ms)
  
  // Custom metrics
  pageLoadTime: number;
  domReadyTime: number;
  scriptLoadTime: number;
  styleLoadTime: number;
  imageLoadTime: number;
  
  // Memory usage
  memoryUsed: number; // MB
  memoryLimit: number; // MB
  
  // Network metrics
  totalRequests: number;
  totalBytes: number;
  cachedRequests: number;
  
  // Custom timings
  calculationTime: number;
  renderTime: number;
  apiResponseTime: number;
}

export interface PerformanceReport {
  timestamp: number;
  url: string;
  metrics: PerformanceMetrics;
  score: number;
  recommendations: string[];
}

export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];
  private startTime: number = 0;
  private reportCallback?: (report: PerformanceReport) => void;

  constructor() {
    this.startTime = performance.now();
  }

  /**
   * Start monitoring performance
   */
  startMonitoring(reportCallback?: (report: PerformanceReport) => void): void {
    this.reportCallback = reportCallback;
    
    // Set up Performance Observers
    this.setupObservers();
    
    // Start collecting metrics
    this.collectInitialMetrics();
    
    // Schedule periodic reporting
    this.scheduleReporting();
    
    console.log('Performance monitoring started');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    console.log('Performance monitoring stopped');
  }

  /**
   * Measure custom timing
   */
  measure<T>(name: string, operation: () => T | Promise<T>): T | Promise<T> {
    const start = performance.now();
    
    try {
      const result = operation();
      
      if (result instanceof Promise) {
        return result.then(res => {
          const duration = performance.now() - start;
          this.recordCustomTiming(name, duration);
          return res;
        });
      } else {
        const duration = performance.now() - start;
        this.recordCustomTiming(name, duration);
        return result;
      }
    } catch (error) {
      const duration = performance.now() - start;
      this.recordCustomTiming(`${name}_error`, duration);
      throw error;
    }
  }

  /**
   * Get current performance score (0-100)
   */
  getPerformanceScore(): number {
    const metrics = this.getCurrentMetrics();
    
    // Calculate score based on Core Web Vitals
    let score = 100;
    
    // LCP scoring (good: <2500ms, poor: >4000ms)
    if (metrics.lcp > 4000) score -= 30;
    else if (metrics.lcp > 2500) score -= 15;
    
    // FID scoring (good: <100ms, poor: >300ms)
    if (metrics.fid > 300) score -= 30;
    else if (metrics.fid > 100) score -= 15;
    
    // CLS scoring (good: <0.1, poor: >0.25)
    if (metrics.cls > 0.25) score -= 30;
    else if (metrics.cls > 0.1) score -= 15;
    
    // TTI scoring (good: <3800ms, poor: >7300ms)
    if (metrics.tti > 7300) score -= 20;
    else if (metrics.tti > 3800) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(): string[] {
    const metrics = this.getCurrentMetrics();
    const recommendations: string[] = [];

    // LCP recommendations
    if (metrics.lcp > 2500) {
      recommendations.push(
        'Optimize Largest Contentful Paint:',
        '- Remove render-blocking resources',
        '- Optimize images (use WebP, lazy loading)',
        '- Implement server-side rendering for critical content',
        '- Use a CDN for static assets'
      );
    }

    // FID recommendations
    if (metrics.fid > 100) {
      recommendations.push(
        'Improve First Input Delay:',
        '- Reduce JavaScript execution time',
        '- Minimize main thread work',
        '- Break up long tasks',
        '- Optimize event handlers'
      );
    }

    // CLS recommendations
    if (metrics.cls > 0.1) {
      recommendations.push(
        'Reduce Cumulative Layout Shift:',
        '- Include size attributes for images and videos',
        '- Reserve space for ads, embeds, and iframes',
        '- Avoid inserting content above existing content',
        '- Preload web fonts'
      );
    }

    // Memory recommendations
    if (metrics.memoryUsed > metrics.memoryLimit * 0.8) {
      recommendations.push(
        'Reduce Memory Usage:',
        '- Implement virtual scrolling for large lists',
        '- Clean up event listeners and timers',
        '- Use weak references where possible',
        '- Implement pagination for large datasets'
      );
    }

    // Bundle size recommendations
    if (metrics.totalBytes > 2 * 1024 * 1024) { // 2MB
      recommendations.push(
        'Reduce Bundle Size:',
        '- Implement code splitting',
        '- Remove unused dependencies',
        '- Use tree shaking',
        '- Compress assets (Brotli/Gzip)'
      );
    }

    return recommendations;
  }

  /**
   * Generate performance report
   */
  generateReport(): PerformanceReport {
    const metrics = this.getCurrentMetrics();
    const score = this.getPerformanceScore();
    const recommendations = this.getRecommendations();

    const report: PerformanceReport = {
      timestamp: Date.now(),
      url: window.location.href,
      metrics,
      score,
      recommendations
    };

    // Send report if callback is provided
    if (this.reportCallback) {
      this.reportCallback(report);
    }

    return report;
  }

  /**
   * Get current metrics
   */
  private getCurrentMetrics(): PerformanceMetrics {
    // Get navigation timing
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const resourceTiming = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    // Calculate metrics
    const metrics: PerformanceMetrics = {
      // Core Web Vitals (simplified - in production use web-vitals library)
      lcp: this.metrics.lcp || this.estimateLCP(),
      fid: this.metrics.fid || this.estimateFID(),
      cls: this.metrics.cls || this.estimateCLS(),
      tti: this.metrics.tti || this.estimateTTI(),
      fcp: this.metrics.fcp || this.estimateFCP(),
      
      // Navigation timing
      pageLoadTime: navigationTiming?.loadEventEnd || 0,
      domReadyTime: navigationTiming?.domContentLoadedEventEnd || 0,
      
      // Resource timing
      scriptLoadTime: this.calculateResourceLoadTime(resourceTiming, 'script'),
      styleLoadTime: this.calculateResourceLoadTime(resourceTiming, 'stylesheet'),
      imageLoadTime: this.calculateResourceLoadTime(resourceTiming, 'image'),
      
      // Memory (if available)
      memoryUsed: (performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0,
      memoryLimit: (performance as any).memory?.jsHeapSizeLimit / 1024 / 1024 || 0,
      
      // Network metrics
      totalRequests: resourceTiming.length,
      totalBytes: this.calculateTotalBytes(resourceTiming),
      cachedRequests: this.countCachedRequests(resourceTiming),
      
      // Custom timings
      calculationTime: this.metrics.calculationTime || 0,
      renderTime: this.metrics.renderTime || 0,
      apiResponseTime: this.metrics.apiResponseTime || 0
    };

    return metrics;
  }

  /**
   * Set up Performance Observers
   */
  private setupObservers(): void {
    // Observe largest contentful paint
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(lcpObserver);
    } catch (e) {
      console.warn('LCP observer not supported');
    }

    // Observe layout shifts
    try {
      const clsObserver = new PerformanceObserver((entryList) => {
        let cls = 0;
        entryList.getEntries().forEach(entry => {
          if (!(entry as any).hadRecentInput) {
            cls += (entry as any).value;
          }
        });
        this.metrics.cls = cls;
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(clsObserver);
    } catch (e) {
      console.warn('CLS observer not supported');
    }

    // Observe first input delay
    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          this.metrics.fid = (entry as any).processingStart - entry.startTime;
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      this.observers.push(fidObserver);
    } catch (e) {
      console.warn('FID observer not supported');
    }
  }

  /**
   * Collect initial metrics
   */
  private collectInitialMetrics(): void {
    // Collect initial resource timing
    const resources = performance.getEntriesByType('resource');
    this.metrics.totalRequests = resources.length;
    this.metrics.totalBytes = this.calculateTotalBytes(resources as PerformanceResourceTiming[]);
  }

  /**
   * Schedule periodic reporting
   */
  private scheduleReporting(): void {
    // Report immediately
    setTimeout(() => this.generateReport(), 5000);
    
    // Report every 30 seconds
    setInterval(() => this.generateReport(), 30000);
  }

  /**
   * Record custom timing
   */
  private recordCustomTiming(name: string, duration: number): void {
    switch (name) {
      case 'calculation':
        this.metrics.calculationTime = duration;
        break;
      case 'render':
        this.metrics.renderTime = duration;
        break;
      case 'api_response':
        this.metrics.apiResponseTime = duration;
        break;
    }
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Estimate LCP (simplified)
   */
  private estimateLCP(): number {
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return navigationTiming?.loadEventEnd || 0;
  }

  /**
   * Estimate FID (simplified)
   */
  private estimateFID(): number {
    return 50; // Default estimate
  }

  /**
   * Estimate CLS (simplified)
   */
  private estimateCLS(): number {
    return 0.05; // Default estimate
  }

  /**
   * Estimate TTI (simplified)
   */
  private estimateTTI(): number {
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return navigationTiming?.domInteractive || 0;
  }

  /**
   * Estimate FCP (simplified)
   */
  private estimateFCP(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcpEntry?.startTime || 0;
  }

  /**
   * Calculate resource load time by type
   */
  private calculateResourceLoadTime(resources: PerformanceResourceTiming[], type: string): number {
    const filtered = resources.filter(resource => 
      resource.initiatorType === type
    );
    
    if (filtered.length === 0) return 0;
    
    const totalTime = filtered.reduce((sum, resource) => {
      return sum + (resource.responseEnd - resource.startTime);
    }, 0);
    
    return totalTime / filtered.length;
  }

  /**
   * Calculate total bytes transferred
   */
  private calculateTotalBytes(resources: PerformanceResourceTiming[]): number {
    return resources.reduce((sum, resource) => {
      return sum + resource.transferSize;
    }, 0);
  }

  /**
   * Count cached requests
   */
  private countCachedRequests(resources: PerformanceResourceTiming[]): number {
    return resources.filter(resource => {
      return resource.transferSize === 0 && resource.decodedBodySize > 0;
    }).length;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Performance optimization utilities
export const PerformanceUtils = {
  /**
   * Debounce function for performance
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle function for performance
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Batch updates for better performance
   */
  batchUpdates(callback: () => void): void {
    // Use requestAnimationFrame for batching
    requestAnimationFrame(() => {
      callback();
    });
  },

  /**
   * Use web workers for heavy calculations
   */
  async runInWorker<T>(workerScript: string, data: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(workerScript);
      
      worker.onmessage = (event) => {
        resolve(event.data);
        worker.terminate();
      };
      
      worker.onerror = (error) => {
        reject(error);
        worker.terminate();
      };
      
      worker.postMessage(data);
    });
  },

  /**
   * Optimize animations with will-change
   */
  optimizeAnimation(element: HTMLElement, property: string): void {
    element.style.willChange = property;
    
    // Clean up after animation
    element.addEventListener('animationend', () => {
      element.style.willChange = 'auto';
    }, { once: true });
  },

  /**
   * Use passive event listeners for better scrolling performance
   */
  addPassiveEventListener(
    element: HTMLElement | Window,
    event: string,
    handler: EventListener,
    options: AddEventListenerOptions = {}
  ): void {
    element.addEventListener(event, handler, {
      ...options,
      passive: true
    });
  },

  /**
   * Implement virtual scrolling for large lists
   */
  virtualScroll<T>(
    items: T[],
    containerHeight: number,
    itemHeight: number,
    renderItem: (item: T, index: number) => HTMLElement
  ): {
    visibleItems: T[];
    startIndex: number;
    endIndex: number;
  } {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const startIndex = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount, items.length);
    
    return {
      visibleItems: items.slice(startIndex, endIndex),
      startIndex,
      endIndex
    };
  }
};