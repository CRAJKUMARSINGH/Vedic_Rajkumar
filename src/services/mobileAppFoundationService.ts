/**
 * Mobile App Foundation Service
 * Phase 2 Week 30: Mobile App Foundation
 * Implements comprehensive mobile app architecture and services
 */

export interface MobileAppConfig {
  platform: 'ios' | 'android' | 'both';
  version: string;
  buildNumber: string;
  bundleId: string;
  displayName: string;
  description: string;
  icon: string;
  splashScreen: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
  };
  features: {
    offlineMode: boolean;
    pushNotifications: boolean;
    biometricAuth: boolean;
    cameraAccess: boolean;
    locationAccess: boolean;
    calendarIntegration: boolean;
    sharing: boolean;
    printing: boolean;
    voiceInput: boolean;
    arMode: boolean;
  };
  api: {
    baseUrl: string;
    apiKey: string;
    timeout: number;
    retryAttempts: number;
    cacheEnabled: boolean;
    cacheExpiration: number;
  };
  security: {
    encryptionEnabled: boolean;
    biometricRequired: boolean;
    sessionTimeout: number;
    dataRetention: number;
    secureStorage: boolean;
  };
}

export interface MobileDevice {
  id: string;
  userId: string;
  platform: 'ios' | 'android';
  deviceId: string;
  deviceName: string;
  osVersion: string;
  appVersion: string;
  pushToken?: string;
  biometricAvailable: boolean;
  locationEnabled: boolean;
  cameraEnabled: boolean;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MobileNotification {
  id: string;
  userId: string;
  deviceId?: string;
  type: 'transit' | 'remedy' | 'consultation' | 'reminder' | 'promotion' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  scheduledAt?: Date;
  sentAt?: Date;
  readAt?: Date;
  actionUrl?: string;
  imageUrl?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface MobileOfflineData {
  id: string;
  userId: string;
  deviceId: string;
  entityType: 'kundli' | 'transit' | 'report' | 'settings' | 'cache';
  entityId: string;
  data: any;
  checksum: string;
  compressed: boolean;
  encrypted: boolean;
  size: number;
  lastModified: Date;
  expiresAt?: Date;
  syncStatus: 'pending' | 'synced' | 'conflict' | 'error';
}

export interface MobileAnalytics {
  userId: string;
  deviceId: string;
  sessionId: string;
  eventType: 'app_open' | 'app_close' | 'screen_view' | 'feature_used' | 'error' | 'purchase' | 'share';
  eventName: string;
  properties: Record<string, any>;
  timestamp: Date;
  duration?: number;
  networkType: 'wifi' | 'cellular' | 'none';
  batteryLevel?: number;
  storageUsed?: number;
  memoryUsed?: number;
}

export interface MobileAppSettings {
  userId: string;
  deviceId: string;
  notifications: {
    enabled: boolean;
    transitAlerts: boolean;
    remedyReminders: boolean;
    consultationReminders: boolean;
    promotional: boolean;
    quietHours: {
      enabled: boolean;
      startTime: string;
      endTime: string;
    };
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    language: string;
    animations: boolean;
    hapticFeedback: boolean;
  };
  privacy: {
    analytics: boolean;
    crashReporting: boolean;
    locationSharing: boolean;
    biometricAuth: boolean;
    dataCollection: boolean;
  };
  performance: {
    offlineMode: boolean;
    imageQuality: 'low' | 'medium' | 'high';
    autoSync: boolean;
    cacheSize: number;
    backgroundSync: boolean;
  };
  astrology: {
    defaultSystem: 'vedic' | 'western' | 'chinese';
    ayanamsa: 'lahiri' | 'rama' | 'krishnamurti';
    timezone: string;
    language: string;
    locationSharing: boolean;
  };
}

export class MobileAppFoundationService {
  private devices: Map<string, MobileDevice> = new Map();
  private notifications: Map<string, MobileNotification> = new Map();
  private offlineData: Map<string, MobileOfflineData> = new Map();
  private analytics: MobileAnalytics[] = [];
  private settings: Map<string, MobileAppSettings> = new Map();

  /**
   * Get mobile app configuration
   */
  getMobileAppConfig(): MobileAppConfig {
    return {
      platform: 'both',
      version: '2.0.0',
      buildNumber: '200',
      bundleId: 'com.vedicrajkumar.mobile',
      displayName: 'Vedic Rajkumar',
      description: 'World\'s most comprehensive Vedic astrology platform',
      icon: '/icons/app-icon.png',
      splashScreen: '/images/splash-screen.png',
      theme: {
        primaryColor: '#8b5cf6',
        secondaryColor: '#ec4899',
        accentColor: '#f59e0b',
        backgroundColor: '#0f172a',
        textColor: '#f8fafc'
      },
      features: {
        offlineMode: true,
        pushNotifications: true,
        biometricAuth: true,
        cameraAccess: true,
        locationAccess: true,
        calendarIntegration: true,
        sharing: true,
        printing: true,
        voiceInput: true,
        arMode: false
      },
      api: {
        baseUrl: 'https://api.vedic-rajkumar.com',
        apiKey: 'mobile_api_key_2026',
        timeout: 30000,
        retryAttempts: 3,
        cacheEnabled: true,
        cacheExpiration: 3600000 // 1 hour
      },
      security: {
        encryptionEnabled: true,
        biometricRequired: false,
        sessionTimeout: 3600000, // 1 hour
        dataRetention: 7776000000, // 90 days
        secureStorage: true
      }
    };
  }

  /**
   * Register mobile device
   */
  async registerDevice(deviceData: Omit<MobileDevice, 'id' | 'createdAt' | 'updatedAt'>): Promise<MobileDevice> {
    const device: MobileDevice = {
      ...deviceData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.devices.set(device.id, device);
    
    // Initialize default settings
    await this.initializeDefaultSettings(device.userId, device.id);
    
    // Track device registration
    this.trackAnalytics({
      userId: device.userId,
      deviceId: device.id,
      sessionId: this.generateId(),
      eventType: 'app_open',
      eventName: 'device_registered',
      properties: {
        platform: device.platform,
        osVersion: device.osVersion,
        appVersion: device.appVersion
      },
      timestamp: new Date(),
      networkType: 'wifi'
    });

    return device;
  }

  /**
   * Update device information
   */
  async updateDevice(deviceId: string, updates: Partial<MobileDevice>): Promise<MobileDevice | null> {
    const device = this.devices.get(deviceId);
    if (!device) return null;

    const updatedDevice = {
      ...device,
      ...updates,
      updatedAt: new Date()
    };

    this.devices.set(deviceId, updatedDevice);
    return updatedDevice;
  }

  /**
   * Send push notification
   */
  async sendNotification(notificationData: Omit<MobileNotification, 'id' | 'status' | 'sentAt'>): Promise<MobileNotification> {
    const notification: MobileNotification = {
      ...notificationData,
      id: this.generateId(),
      status: 'pending',
      sentAt: new Date()
    };

    this.notifications.set(notification.id, notification);

    // Simulate sending notification
    try {
      await this.sendPushNotification(notification);
      notification.status = 'sent';
      this.notifications.set(notification.id, notification);
    } catch (error) {
      notification.status = 'failed';
      this.notifications.set(notification.id, notification);
      throw error;
    }

    return notification;
  }

  /**
   * Store offline data
   */
  async storeOfflineData(data: Omit<MobileOfflineData, 'id' | 'checksum' | 'compressed' | 'encrypted' | 'size' | 'lastModified' | 'syncStatus'>): Promise<MobileOfflineData> {
    const serializedData = JSON.stringify(data.data);
    const checksum = this.generateChecksum(serializedData);
    const compressed = this.compressData(serializedData);
    const encrypted = this.encryptData(compressed);
    
    const offlineData: MobileOfflineData = {
      ...data,
      id: this.generateId(),
      checksum,
      compressed: true,
      encrypted: true,
      size: encrypted.length,
      lastModified: new Date(),
      syncStatus: 'pending'
    };

    this.offlineData.set(offlineData.id, offlineData);
    return offlineData;
  }

  /**
   * Sync offline data
   */
  async syncOfflineData(deviceId: string): Promise<{ synced: number; failed: number; conflicts: number }> {
    const deviceData = Array.from(this.offlineData.values()).filter(d => d.deviceId === deviceId);
    let synced = 0;
    let failed = 0;
    let conflicts = 0;

    for (const data of deviceData) {
      try {
        if (data.syncStatus === 'pending') {
          // Simulate sync process
          await this.syncDataToServer(data);
          data.syncStatus = 'synced';
          this.offlineData.set(data.id, data);
          synced++;
        } else if (data.syncStatus === 'conflict') {
          conflicts++;
        }
      } catch (error) {
        data.syncStatus = 'error';
        this.offlineData.set(data.id, data);
        failed++;
      }
    }

    return { synced, failed, conflicts };
  }

  /**
   * Track mobile analytics
   */
  async trackAnalytics(analyticsData: MobileAnalytics): Promise<void> {
    this.analytics.push(analyticsData);
    
    // Keep only last 10000 records
    if (this.analytics.length > 10000) {
      this.analytics = this.analytics.slice(-10000);
    }
  }

  /**
   * Get mobile app settings
   */
  async getSettings(userId: string, deviceId: string): Promise<MobileAppSettings | null> {
    const key = `${userId}_${deviceId}`;
    return this.settings.get(key) || null;
  }

  /**
   * Update mobile app settings
   */
  async updateSettings(userId: string, deviceId: string, updates: Partial<MobileAppSettings>): Promise<MobileAppSettings> {
    const key = `${userId}_${deviceId}`;
    let settings = this.settings.get(key);
    
    if (!settings) {
      settings = await this.initializeDefaultSettings(userId, deviceId);
    }

    const updatedSettings = {
      ...settings,
      ...updates,
      userId,
      deviceId
    };

    this.settings.set(key, updatedSettings);
    return updatedSettings;
  }

  /**
   * Get device analytics
   */
  async getDeviceAnalytics(deviceId: string, period: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<{
    sessions: number;
    avgSessionDuration: number;
    topScreens: Array<{ screen: string; views: number; avgTime: number }>;
    crashes: number;
    networkUsage: number;
    storageUsage: number;
  }> {
    const now = new Date();
    const periodStart = this.getPeriodStart(now, period);
    
    const deviceAnalytics = this.analytics.filter(a => 
      a.deviceId === deviceId && a.timestamp >= periodStart
    );

    const sessions = new Set(deviceAnalytics.map(a => a.sessionId)).size;
    const avgSessionDuration = deviceAnalytics.reduce((sum, a) => sum + (a.duration || 0), 0) / sessions;
    
    const screenViews = deviceAnalytics.filter(a => a.eventType === 'screen_view');
    const screenStats = screenViews.reduce((acc, a) => {
      const screen = a.properties.screen || 'unknown';
      if (!acc[screen]) {
        acc[screen] = { views: 0, totalTime: 0 };
      }
      acc[screen].views++;
      acc[screen].totalTime += a.duration || 0;
      return acc;
    }, {} as Record<string, { views: number; totalTime: number }>);

    const topScreens = Object.entries(screenStats)
      .map(([screen, stats]) => ({
        screen,
        views: stats.views,
        avgTime: stats.totalTime / stats.views
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const crashes = deviceAnalytics.filter(a => a.eventType === 'error').length;
    const networkUsage = deviceAnalytics.reduce((sum, a) => sum + (a.properties.networkUsage || 0), 0);
    const storageUsage = deviceAnalytics.reduce((sum, a) => sum + (a.storageUsed || 0), 0);

    return {
      sessions,
      avgSessionDuration,
      topScreens,
      crashes,
      networkUsage,
      storageUsage
    };
  }

  /**
   * Get app performance metrics
   */
  async getPerformanceMetrics(): Promise<{
    totalDevices: number;
    activeUsers: number;
    avgSessionDuration: number;
    crashRate: number;
    networkLatency: number;
    storageEfficiency: number;
    batteryUsage: number;
    memoryUsage: number;
  }> {
    const now = new Date();
    const dayStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const todayAnalytics = this.analytics.filter(a => a.timestamp >= dayStart);
    const activeUsers = new Set(todayAnalytics.map(a => a.userId)).size;
    const totalDevices = this.devices.size;
    
    const sessions = todayAnalytics.filter(a => a.eventType === 'app_open').length;
    const avgSessionDuration = todayAnalytics.reduce((sum, a) => sum + (a.duration || 0), 0) / sessions;
    
    const crashes = todayAnalytics.filter(a => a.eventType === 'error').length;
    const crashRate = sessions > 0 ? (crashes / sessions) * 100 : 0;
    
    const networkLatency = todayAnalytics.reduce((sum, a) => sum + (a.properties.latency || 0), 0) / todayAnalytics.length;
    const storageEfficiency = todayAnalytics.reduce((sum, a) => sum + (a.storageUsed || 0), 0) / todayAnalytics.length;
    const batteryUsage = todayAnalytics.reduce((sum, a) => sum + (a.batteryLevel || 0), 0) / todayAnalytics.length;
    const memoryUsage = todayAnalytics.reduce((sum, a) => sum + (a.memoryUsed || 0), 0) / todayAnalytics.length;

    return {
      totalDevices,
      activeUsers,
      avgSessionDuration,
      crashRate,
      networkLatency,
      storageEfficiency,
      batteryUsage,
      memoryUsage
    };
  }

  /**
   * Private helper methods
   */
  private generateId(): string {
    return `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async initializeDefaultSettings(userId: string, deviceId: string): Promise<MobileAppSettings> {
    const settings: MobileAppSettings = {
      userId,
      deviceId,
      notifications: {
        enabled: true,
        transitAlerts: true,
        remedyReminders: true,
        consultationReminders: true,
        promotional: false,
        quietHours: {
          enabled: false,
          startTime: '22:00',
          endTime: '08:00'
        }
      },
      appearance: {
        theme: 'auto',
        fontSize: 'medium',
        language: 'en',
        animations: true,
        hapticFeedback: true
      },
      privacy: {
        analytics: true,
        crashReporting: true,
        locationSharing: false,
        biometricAuth: false,
        dataCollection: true
      },
      performance: {
        offlineMode: true,
        imageQuality: 'medium',
        autoSync: true,
        cacheSize: 100,
        backgroundSync: true
      },
      astrology: {
        defaultSystem: 'vedic',
        ayanamsa: 'lahiri',
        timezone: 'Asia/Kolkata',
        language: 'en',
        locationSharing: false
      }
    };

    const key = `${userId}_${deviceId}`;
    this.settings.set(key, settings);
    return settings;
  }

  private async sendPushNotification(notification: MobileNotification): Promise<void> {
    // Simulate push notification sending
    console.log('Sending push notification:', notification);
    
    // In production, this would integrate with:
    // - Firebase Cloud Messaging (FCM) for Android
    // - Apple Push Notification Service (APNS) for iOS
    // - Or unified push service like OneSignal
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private generateChecksum(data: string): string {
    // Simple checksum generation (in production, use proper hashing)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  private compressData(data: string): string {
    // Mock compression (in production, use proper compression like gzip)
    return data;
  }

  private encryptData(data: string): string {
    // Mock encryption (in production, use proper encryption like AES)
    return Buffer.from(data).toString('base64');
  }

  private async syncDataToServer(data: MobileOfflineData): Promise<void> {
    // Mock sync process (in production, this would sync to actual server)
    console.log('Syncing data to server:', data.id);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private getPeriodStart(date: Date, period: 'hour' | 'day' | 'week' | 'month'): Date {
    const start = new Date(date);
    switch (period) {
      case 'hour':
        start.setMinutes(0, 0, 0);
        break;
      case 'day':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(start.getDate() - start.getDay());
        start.setHours(0, 0, 0, 0);
        break;
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
    }
    return start;
  }
}

// Export singleton instance
export const mobileAppFoundationService = new MobileAppFoundationService();
