/**
 * Analytics & Monitoring System
 * Week 27 - Monday Implementation
 * 
 * Features:
 * - Google Analytics 4 integration
 * - Custom event tracking
 * - User journey mapping
 * - Conversion funnel analysis
 * - Privacy-compliant tracking
 */

// Analytics configuration
export interface AnalyticsConfig {
  measurementId: string;
  enabled: boolean;
  debug: boolean;
  anonymizeIp: boolean;
  cookieConsent: boolean;
}

// Event types
export type EventCategory = 
  | 'engagement'
  | 'conversion'
  | 'navigation'
  | 'feature_usage'
  | 'error'
  | 'performance';

export interface AnalyticsEvent {
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  customParams?: Record<string, any>;
}

// User properties
export interface UserProperties {
  userId?: string;
  userType?: 'new' | 'returning' | 'premium';
  language?: 'en' | 'hi';
  platform?: 'web' | 'mobile' | 'desktop';
  signupDate?: string;
}

// Page view tracking
export interface PageView {
  path: string;
  title: string;
  referrer?: string;
  timestamp: number;
}

// Conversion tracking
export interface Conversion {
  type: 'kundli_generated' | 'compatibility_checked' | 'report_downloaded' | 'feature_used';
  value?: number;
  currency?: string;
  timestamp: number;
}

/**
 * Analytics Manager Class
 */
class AnalyticsManager {
  private config: AnalyticsConfig;
  private initialized: boolean = false;
  private queue: AnalyticsEvent[] = [];
  private sessionId: string;
  private sessionStart: number;

  constructor() {
    this.config = {
      measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX',
      enabled: import.meta.env.PROD,
      debug: import.meta.env.DEV,
      anonymizeIp: true,
      cookieConsent: false
    };
    
    this.sessionId = this.generateSessionId();
    this.sessionStart = Date.now();
  }

  /**
   * Initialize Google Analytics 4
   */
  async initialize(): Promise<void> {
    if (this.initialized || !this.config.enabled) {
      return;
    }

    try {
      // Load GA4 script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.measurementId}`;
      document.head.appendChild(script);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      window.gtag = gtag;

      gtag('js', new Date());
      gtag('config', this.config.measurementId, {
        anonymize_ip: this.config.anonymizeIp,
        cookie_flags: 'SameSite=None;Secure',
        send_page_view: false // We'll handle this manually
      });

      this.initialized = true;

      // Process queued events
      this.processQueue();

      if (this.config.debug) {
        console.log('Analytics initialized:', this.config.measurementId);
      }
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  /**
   * Track page view
   */
  trackPageView(pageView: PageView): void {
    if (!this.config.enabled) return;

    const event: AnalyticsEvent = {
      category: 'navigation',
      action: 'page_view',
      label: pageView.path,
      customParams: {
        page_title: pageView.title,
        page_path: pageView.path,
        page_referrer: pageView.referrer || document.referrer,
        session_id: this.sessionId,
        timestamp: pageView.timestamp
      }
    };

    this.trackEvent(event);

    if (this.config.debug) {
      console.log('Page view tracked:', pageView);
    }
  }

  /**
   * Track custom event
   */
  trackEvent(event: AnalyticsEvent): void {
    if (!this.config.enabled) return;

    if (!this.initialized) {
      this.queue.push(event);
      return;
    }

    try {
      const eventName = `${event.category}_${event.action}`.toLowerCase();
      
      window.gtag?.('event', eventName, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        session_id: this.sessionId,
        ...event.customParams
      });

      if (this.config.debug) {
        console.log('Event tracked:', eventName, event);
      }
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(featureName: string, details?: Record<string, any>): void {
    this.trackEvent({
      category: 'feature_usage',
      action: 'feature_used',
      label: featureName,
      customParams: {
        feature_name: featureName,
        ...details
      }
    });
  }

  /**
   * Track conversion
   */
  trackConversion(conversion: Conversion): void {
    this.trackEvent({
      category: 'conversion',
      action: conversion.type,
      value: conversion.value,
      customParams: {
        conversion_type: conversion.type,
        currency: conversion.currency || 'USD',
        timestamp: conversion.timestamp
      }
    });
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: string): void {
    this.trackEvent({
      category: 'error',
      action: 'error_occurred',
      label: error.message,
      customParams: {
        error_name: error.name,
        error_message: error.message,
        error_stack: error.stack,
        context: context,
        session_id: this.sessionId
      }
    });
  }

  /**
   * Track performance metric
   */
  trackPerformance(metric: string, value: number, unit: string = 'ms'): void {
    this.trackEvent({
      category: 'performance',
      action: 'metric_recorded',
      label: metric,
      value: value,
      customParams: {
        metric_name: metric,
        metric_value: value,
        metric_unit: unit
      }
    });
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: UserProperties): void {
    if (!this.initialized || !this.config.enabled) return;

    try {
      window.gtag?.('set', 'user_properties', properties);

      if (this.config.debug) {
        console.log('User properties set:', properties);
      }
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }

  /**
   * Track user journey
   */
  trackUserJourney(step: string, data?: Record<string, any>): void {
    this.trackEvent({
      category: 'engagement',
      action: 'journey_step',
      label: step,
      customParams: {
        journey_step: step,
        session_id: this.sessionId,
        session_duration: Date.now() - this.sessionStart,
        ...data
      }
    });
  }

  /**
   * Track engagement time
   */
  trackEngagementTime(duration: number): void {
    this.trackEvent({
      category: 'engagement',
      action: 'time_spent',
      value: duration,
      customParams: {
        engagement_time: duration,
        session_id: this.sessionId
      }
    });
  }

  /**
   * Get session info
   */
  getSessionInfo(): { sessionId: string; duration: number } {
    return {
      sessionId: this.sessionId,
      duration: Date.now() - this.sessionStart
    };
  }

  /**
   * Process queued events
   */
  private processQueue(): void {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) {
        this.trackEvent(event);
      }
    }
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    
    if (enabled && !this.initialized) {
      this.initialize();
    }
  }

  /**
   * Set cookie consent
   */
  setCookieConsent(consent: boolean): void {
    this.config.cookieConsent = consent;
    
    if (consent && !this.initialized) {
      this.initialize();
    }
  }
}

// Create singleton instance
export const analytics = new AnalyticsManager();

/**
 * React Hook for Analytics
 */
export function useAnalytics() {
  const trackPageView = (path: string, title: string) => {
    analytics.trackPageView({
      path,
      title,
      timestamp: Date.now()
    });
  };

  const trackFeature = (featureName: string, details?: Record<string, any>) => {
    analytics.trackFeatureUsage(featureName, details);
  };

  const trackConversion = (type: Conversion['type'], value?: number) => {
    analytics.trackConversion({
      type,
      value,
      timestamp: Date.now()
    });
  };

  const trackError = (error: Error, context?: string) => {
    analytics.trackError(error, context);
  };

  return {
    trackPageView,
    trackFeature,
    trackConversion,
    trackError,
    analytics
  };
}

/**
 * Predefined tracking functions
 */
export const trackKundliGenerated = (birthData: any) => {
  analytics.trackConversion({
    type: 'kundli_generated',
    timestamp: Date.now()
  });
  
  analytics.trackFeatureUsage('kundli_analysis', {
    has_coordinates: !!birthData.latitude,
    language: birthData.language || 'en'
  });
};

export const trackCompatibilityCheck = (score: number) => {
  analytics.trackConversion({
    type: 'compatibility_checked',
    value: score,
    timestamp: Date.now()
  });
  
  analytics.trackFeatureUsage('compatibility_check', {
    compatibility_score: score
  });
};

export const trackReportDownload = (reportType: string) => {
  analytics.trackConversion({
    type: 'report_downloaded',
    timestamp: Date.now()
  });
  
  analytics.trackFeatureUsage('report_download', {
    report_type: reportType
  });
};

export const trackFeatureAccess = (featureName: string) => {
  analytics.trackFeatureUsage(featureName, {
    access_time: new Date().toISOString()
  });
};

// Auto-initialize on import
if (typeof window !== 'undefined') {
  analytics.initialize();
}

export default analytics;

// Type declarations for gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}