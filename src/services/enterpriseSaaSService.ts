/**
 * Enterprise SaaS Platform Service
 * Phase 4 Week 51: Enterprise SaaS Platform
 * Implements comprehensive enterprise-grade SaaS features
 */

export interface EnterpriseTenant {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    customCSS?: string;
  };
  branding: {
    companyName: string;
    contactEmail: string;
    supportPhone?: string;
    website?: string;
  };
  subscription: {
    plan: 'starter' | 'professional' | 'enterprise' | 'custom';
    seats: number;
    features: string[];
    billingCycle: 'monthly' | 'annual';
    nextBillingDate: Date;
    status: 'active' | 'trial' | 'expired' | 'cancelled';
  };
  configuration: {
    defaultLanguage: string;
    timezone: string;
    currency: string;
    dateFormat: string;
    astrologySystem: 'vedic' | 'western' | 'chinese' | 'all';
    calculationMethod: 'swiss-ephemeris' | 'lahiri' | 'rama' | 'custom';
  };
  apiKeys: {
    publicKey: string;
    privateKey: string;
    webhookSecret: string;
    rateLimit: number;
  };
  security: {
    ssoEnabled: boolean;
    ssoProvider?: 'saml' | 'oauth2' | 'ldap' | 'azure-ad';
    ipWhitelist: string[];
    twoFactorAuth: boolean;
    sessionTimeout: number;
  };
  analytics: {
    apiUsage: number;
    storageUsed: number;
    usersCount: number;
    reportsGenerated: number;
    lastActivity: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface EnterpriseUser {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'analyst' | 'user' | 'readonly';
  permissions: string[];
  department?: string;
  lastLogin: Date;
  isActive: boolean;
  preferences: {
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    dashboard: {
      layout: string;
      widgets: string[];
      theme: 'light' | 'dark' | 'auto';
    };
  };
}

export interface EnterpriseReport {
  id: string;
  tenantId: string;
  userId: string;
  name: string;
  type: 'kundli' | 'transit' | 'matchmaking' | 'varshaphal' | 'custom';
  template: string;
  parameters: Record<string, any>;
  data: any;
  generatedAt: Date;
  expiresAt?: Date;
  isPublic: boolean;
  shareToken?: string;
  downloadCount: number;
  viewCount: number;
}

export interface EnterpriseAPIUsage {
  tenantId: string;
  date: Date;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  requestSize: number;
  responseSize: number;
  userId?: string;
  ipAddress: string;
  userAgent: string;
}

export interface EnterpriseSubscription {
  id: string;
  tenantId: string;
  plan: 'starter' | 'professional' | 'enterprise' | 'custom';
  features: {
    apiCalls: number;
    storage: number; // GB
    users: number;
    reports: number;
    customBranding: boolean;
    ssoIntegration: boolean;
    apiAccess: boolean;
    webhookSupport: boolean;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    customIntegrations: boolean;
    whiteLabel: boolean;
  };
  pricing: {
    basePrice: number;
    perUserPrice: number;
    setupFee: number;
    annualDiscount: number;
  };
  billing: {
    cycle: 'monthly' | 'annual';
    nextBillingDate: Date;
    paymentMethod: 'card' | 'wire' | 'check';
    autoRenew: boolean;
    invoiceEmail: string;
  };
  usage: {
    currentUsers: number;
    currentStorage: number;
    currentApiCalls: number;
    currentReports: number;
  };
  status: 'active' | 'trial' | 'expired' | 'cancelled' | 'suspended';
  trialEndsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class EnterpriseSaaSService {
  private tenants: Map<string, EnterpriseTenant> = new Map();
  private users: Map<string, EnterpriseUser> = new Map();
  private reports: Map<string, EnterpriseReport> = new Map();
  private apiUsage: EnterpriseAPIUsage[] = [];
  private subscriptions: Map<string, EnterpriseSubscription> = new Map();

  /**
   * Create a new enterprise tenant
   */
  async createTenant(tenantData: Omit<EnterpriseTenant, 'id' | 'createdAt' | 'updatedAt' | 'analytics'>): Promise<EnterpriseTenant> {
    const tenant: EnterpriseTenant = {
      ...tenantData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      analytics: {
        apiUsage: 0,
        storageUsed: 0,
        usersCount: 1,
        reportsGenerated: 0,
        lastActivity: new Date()
      }
    };

    this.tenants.set(tenant.id, tenant);
    
    // Create default admin user
    await this.createUser({
      tenantId: tenant.id,
      email: tenant.branding.contactEmail,
      name: 'Admin',
      role: 'admin',
      permissions: this.getDefaultPermissions('admin'),
      isActive: true,
      preferences: {
        language: tenant.configuration.defaultLanguage,
        timezone: tenant.configuration.timezone,
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        dashboard: {
          layout: 'default',
          widgets: ['overview', 'usage', 'recent-reports'],
          theme: 'light'
        }
      }
    });

    // Create default subscription
    await this.createSubscription({
      tenantId: tenant.id,
      plan: tenant.subscription.plan,
      billing: {
        cycle: tenant.subscription.billingCycle,
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentMethod: 'card',
        autoRenew: true,
        invoiceEmail: tenant.branding.contactEmail
      }
    });

    return tenant;
  }

  /**
   * Get tenant by ID or domain
   */
  async getTenant(identifier: string): Promise<EnterpriseTenant | null> {
    // Try by ID first
    let tenant = this.tenants.get(identifier);
    
    // If not found, try by domain
    if (!tenant) {
      for (const [id, t] of this.tenants) {
        if (t.domain === identifier) {
          tenant = t;
          break;
        }
      }
    }
    
    return tenant || null;
  }

  /**
   * Update tenant configuration
   */
  async updateTenant(tenantId: string, updates: Partial<EnterpriseTenant>): Promise<EnterpriseTenant | null> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return null;

    const updatedTenant = {
      ...tenant,
      ...updates,
      updatedAt: new Date()
    };

    this.tenants.set(tenantId, updatedTenant);
    return updatedTenant;
  }

  /**
   * Create enterprise user
   */
  async createUser(userData: Omit<EnterpriseUser, 'id' | 'lastLogin'>): Promise<EnterpriseUser> {
    const user: EnterpriseUser = {
      ...userData,
      id: this.generateId(),
      lastLogin: new Date()
    };

    this.users.set(user.id, user);
    
    // Update tenant user count
    const tenant = this.tenants.get(user.tenantId);
    if (tenant) {
      tenant.analytics.usersCount++;
      tenant.analytics.lastActivity = new Date();
    }

    return user;
  }

  /**
   * Authenticate user
   */
  async authenticateUser(email: string, password: string, tenantDomain?: string): Promise<EnterpriseUser | null> {
    // Find user by email
    let user: EnterpriseUser | undefined;
    for (const [id, u] of this.users) {
      if (u.email === email) {
        user = u;
        break;
      }
    }

    if (!user || !user.isActive) return null;

    // Check tenant if specified
    if (tenantDomain) {
      const tenant = await this.getTenant(tenantDomain);
      if (!tenant || tenant.id !== user.tenantId) return null;
    }

    // Mock password verification (in production, use proper hashing)
    const isValidPassword = await this.verifyPassword(password, user.email);
    if (!isValidPassword) return null;

    // Update last login
    user.lastLogin = new Date();
    this.users.set(user.id, user);

    return user;
  }

  /**
   * Create enterprise subscription
   */
  async createSubscription(subscriptionData: Omit<EnterpriseSubscription, 'id' | 'features' | 'pricing' | 'usage' | 'status' | 'createdAt' | 'updatedAt'>): Promise<EnterpriseSubscription> {
    const subscription: EnterpriseSubscription = {
      ...subscriptionData,
      id: this.generateId(),
      features: this.getPlanFeatures(subscriptionData.plan),
      pricing: this.getPlanPricing(subscriptionData.plan),
      usage: {
        currentUsers: 0,
        currentStorage: 0,
        currentApiCalls: 0,
        currentReports: 0
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.subscriptions.set(subscription.id, subscription);
    return subscription;
  }

  /**
   * Generate enterprise report
   */
  async generateReport(reportData: Omit<EnterpriseReport, 'id' | 'generatedAt' | 'downloadCount' | 'viewCount'>): Promise<EnterpriseReport> {
    const report: EnterpriseReport = {
      ...reportData,
      id: this.generateId(),
      generatedAt: new Date(),
      downloadCount: 0,
      viewCount: 0
    };

    this.reports.set(report.id, report);
    
    // Update tenant analytics
    const tenant = this.tenants.get(report.tenantId);
    if (tenant) {
      tenant.analytics.reportsGenerated++;
      tenant.analytics.lastActivity = new Date();
    }

    return report;
  }

  /**
   * Track API usage
   */
  async trackAPIUsage(usageData: Omit<EnterpriseAPIUsage, 'date'>): Promise<void> {
    const usage: EnterpriseAPIUsage = {
      ...usageData,
      date: new Date()
    };

    this.apiUsage.push(usage);

    // Update tenant analytics
    const tenant = this.tenants.get(usage.tenantId);
    if (tenant) {
      tenant.analytics.apiUsage++;
      tenant.analytics.lastActivity = new Date();
    }
  }

  /**
   * Get tenant analytics
   */
  async getTenantAnalytics(tenantId: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    apiUsage: number;
    storageUsed: number;
    usersCount: number;
    reportsGenerated: number;
    topEndpoints: { endpoint: string; count: number }[];
    activeUsers: number;
    errorRate: number;
    avgResponseTime: number;
  }> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    const now = new Date();
    const periodStart = this.getPeriodStart(now, period);
    
    const filteredUsage = this.apiUsage.filter(u => 
      u.tenantId === tenantId && u.date >= periodStart
    );

    const apiUsage = filteredUsage.length;
    const errorRate = filteredUsage.filter(u => u.statusCode >= 400).length / apiUsage;
    const avgResponseTime = filteredUsage.reduce((sum, u) => sum + u.responseTime, 0) / apiUsage;

    const endpointCounts = filteredUsage.reduce((acc, u) => {
      acc[u.endpoint] = (acc[u.endpoint] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topEndpoints = Object.entries(endpointCounts)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const activeUsers = new Set(
      filteredUsage
        .filter(u => u.userId)
        .map(u => u.userId)
    ).size;

    return {
      apiUsage,
      storageUsed: tenant.analytics.storageUsed,
      usersCount: tenant.analytics.usersCount,
      reportsGenerated: tenant.analytics.reportsGenerated,
      topEndpoints,
      activeUsers,
      errorRate,
      avgResponseTime
    };
  }

  /**
   * Get available plans
   */
  getAvailablePlans(): Array<{
    id: string;
    name: string;
    description: string;
    features: string[];
    pricing: { basePrice: number; perUserPrice: number };
    limits: { users: number; storage: number; apiCalls: number };
  }> {
    return [
      {
        id: 'starter',
        name: 'Starter',
        description: 'Perfect for small teams getting started with enterprise astrology',
        features: [
          'Up to 10 users',
          '100 GB storage',
          '10,000 API calls/month',
          'Basic analytics',
          'Email support',
          'Standard branding'
        ],
        pricing: { basePrice: 99, perUserPrice: 10 },
        limits: { users: 10, storage: 100, apiCalls: 10000 }
      },
      {
        id: 'professional',
        name: 'Professional',
        description: 'Advanced features for growing organizations',
        features: [
          'Up to 50 users',
          '500 GB storage',
          '100,000 API calls/month',
          'Advanced analytics',
          'Priority support',
          'Custom branding',
          'SSO integration',
          'API access'
        ],
        pricing: { basePrice: 299, perUserPrice: 8 },
        limits: { users: 50, storage: 500, apiCalls: 100000 }
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Complete solution for large organizations',
        features: [
          'Unlimited users',
          '5 TB storage',
          '1M API calls/month',
          'Enterprise analytics',
          'Dedicated support',
          'White-label solution',
          'Advanced SSO',
          'Custom integrations',
          'Webhook support',
          'SLA guarantee'
        ],
        pricing: { basePrice: 999, perUserPrice: 5 },
        limits: { users: -1, storage: 5120, apiCalls: 1000000 }
      }
    ];
  }

  /**
   * Private helper methods
   */
  private generateId(): string {
    return `ent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultPermissions(role: EnterpriseUser['role']): string[] {
    const permissions = {
      admin: ['*'],
      manager: ['users.read', 'users.write', 'reports.read', 'reports.write', 'analytics.read'],
      analyst: ['reports.read', 'analytics.read', 'data.export'],
      user: ['reports.read', 'dashboard.read'],
      readonly: ['reports.read', 'dashboard.read']
    };
    return permissions[role] || [];
  }

  private getPlanFeatures(plan: EnterpriseSubscription['plan']): EnterpriseSubscription['features'] {
    const features = {
      starter: {
        apiCalls: 10000,
        storage: 100,
        users: 10,
        reports: 100,
        customBranding: false,
        ssoIntegration: false,
        apiAccess: false,
        webhookSupport: false,
        advancedAnalytics: false,
        prioritySupport: false,
        customIntegrations: false,
        whiteLabel: false
      },
      professional: {
        apiCalls: 100000,
        storage: 500,
        users: 50,
        reports: 1000,
        customBranding: true,
        ssoIntegration: true,
        apiAccess: true,
        webhookSupport: true,
        advancedAnalytics: true,
        prioritySupport: true,
        customIntegrations: false,
        whiteLabel: false
      },
      enterprise: {
        apiCalls: 1000000,
        storage: 5120,
        users: -1,
        reports: -1,
        customBranding: true,
        ssoIntegration: true,
        apiAccess: true,
        webhookSupport: true,
        advancedAnalytics: true,
        prioritySupport: true,
        customIntegrations: true,
        whiteLabel: true
      },
      custom: {
        apiCalls: -1,
        storage: -1,
        users: -1,
        reports: -1,
        customBranding: true,
        ssoIntegration: true,
        apiAccess: true,
        webhookSupport: true,
        advancedAnalytics: true,
        prioritySupport: true,
        customIntegrations: true,
        whiteLabel: true
      }
    };
    return features[plan] || features.starter;
  }

  private getPlanPricing(plan: EnterpriseSubscription['plan']): EnterpriseSubscription['pricing'] {
    const pricing = {
      starter: { basePrice: 99, perUserPrice: 10, setupFee: 0, annualDiscount: 0.1 },
      professional: { basePrice: 299, perUserPrice: 8, setupFee: 500, annualDiscount: 0.15 },
      enterprise: { basePrice: 999, perUserPrice: 5, setupFee: 2000, annualDiscount: 0.2 },
      custom: { basePrice: 0, perUserPrice: 0, setupFee: 0, annualDiscount: 0 }
    };
    return pricing[plan] || pricing.starter;
  }

  private getPeriodStart(date: Date, period: 'day' | 'week' | 'month' | 'year'): Date {
    const start = new Date(date);
    switch (period) {
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
      case 'year':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        break;
    }
    return start;
  }

  private async verifyPassword(password: string, email: string): Promise<boolean> {
    // Mock password verification - in production, use proper password hashing
    return password === 'demo123' || password === email.split('@')[0];
  }
}

// Export singleton instance
export const enterpriseSaaSService = new EnterpriseSaaSService();

// Export types for use in components
export type { 
  EnterpriseTenant, 
  EnterpriseUser, 
  EnterpriseReport, 
  EnterpriseAPIUsage, 
  EnterpriseSubscription 
};
