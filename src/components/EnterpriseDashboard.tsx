/**
 * Enterprise Dashboard Component
 * Phase 4 Week 51: Enterprise SaaS Platform
 * Provides comprehensive enterprise management interface
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Building2, 
  Users, 
  BarChart3, 
  Settings, 
  Globe, 
  Shield, 
  CreditCard, 
  Database, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Mail, 
  Phone, 
  Key, 
  Zap, 
  Target, 
  FileText, 
  Download, 
  Upload, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Lock,
  Unlock,
  UserPlus,
  UserMinus,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { 
  enterpriseSaaSService, 
  type EnterpriseTenant, 
  type EnterpriseUser, 
  type EnterpriseSubscription 
} from '@/services/enterpriseSaaSService';

const EnterpriseDashboard = () => {
  const [tenants, setTenants] = useState<EnterpriseTenant[]>([]);
  const [users, setUsers] = useState<EnterpriseUser[]>([]);
  const [subscriptions, setSubscriptions] = useState<EnterpriseSubscription[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<EnterpriseTenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadEnterpriseData();
  }, []);

  const loadEnterpriseData = async () => {
    setIsLoading(true);
    try {
      // Mock data loading - in production, this would fetch from API
      const mockTenant: EnterpriseTenant = {
        id: 'tenant_1',
        name: 'Astrology Corp',
        domain: 'astrology-corp.vedic-rajkumar.com',
        logo: '/logos/astrology-corp.png',
        theme: {
          primaryColor: '#8b5cf6',
          secondaryColor: '#ec4899',
          accentColor: '#f59e0b'
        },
        branding: {
          companyName: 'Astrology Corporation',
          contactEmail: 'admin@astrology-corp.com',
          supportPhone: '+1-555-0123',
          website: 'https://astrology-corp.com'
        },
        subscription: {
          plan: 'enterprise',
          seats: 100,
          features: ['all'],
          billingCycle: 'annual',
          nextBillingDate: new Date('2026-12-31'),
          status: 'active'
        },
        configuration: {
          defaultLanguage: 'en',
          timezone: 'America/New_York',
          currency: 'USD',
          dateFormat: 'MM/DD/YYYY',
          astrologySystem: 'all',
          calculationMethod: 'swiss-ephemeris'
        },
        apiKeys: {
          publicKey: 'pk_live_1234567890',
          privateKey: 'sk_live_1234567890',
          webhookSecret: 'whsec_1234567890',
          rateLimit: 10000
        },
        security: {
          ssoEnabled: true,
          ssoProvider: 'saml',
          ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
          twoFactorAuth: true,
          sessionTimeout: 3600
        },
        analytics: {
          apiUsage: 45678,
          storageUsed: 2340,
          usersCount: 87,
          reportsGenerated: 1234,
          lastActivity: new Date()
        },
        createdAt: new Date('2026-01-15'),
        updatedAt: new Date()
      };

      setTenants([mockTenant]);
      setSelectedTenant(mockTenant);
    } catch (error) {
      console.error('Failed to load enterprise data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'starter': return 'bg-gray-100 text-gray-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trial': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatBytes = (bytes: number) => {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return bytes + ' B';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading enterprise dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Building2 className="w-8 h-8" />
            Enterprise SaaS Platform
          </h1>
          <p className="text-muted-foreground">
            Comprehensive enterprise management and analytics platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Tenant
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tenants</p>
                <p className="text-3xl font-bold">{tenants.length}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">+12.5%</span>
                </div>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{formatNumber(tenants.reduce((sum, t) => sum + t.analytics.usersCount, 0))}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">+8.3%</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">API Usage</p>
                <p className="text-3xl font-bold">{formatNumber(tenants.reduce((sum, t) => sum + t.analytics.apiUsage, 0))}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-blue-500">This month</span>
                </div>
              </div>
              <Zap className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-3xl font-bold">$45.2K</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">+15.7%</span>
                </div>
              </div>
              <CreditCard className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Selected Tenant Overview */}
          {selectedTenant && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {selectedTenant.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Domain</Label>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span>{selectedTenant.domain}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Subscription</Label>
                      <div className="flex items-center gap-2">
                        <Badge className={getPlanBadgeColor(selectedTenant.subscription.plan)}>
                          {selectedTenant.subscription.plan}
                        </Badge>
                        <Badge className={getStatusBadgeColor(selectedTenant.subscription.status)}>
                          {selectedTenant.subscription.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Contact</Label>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{selectedTenant.branding.contactEmail}</span>
                        </div>
                        {selectedTenant.branding.supportPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{selectedTenant.branding.supportPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Usage Statistics</Label>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>API Calls</span>
                          <span>{formatNumber(selectedTenant.analytics.apiUsage)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Storage Used</span>
                          <span>{formatBytes(selectedTenant.analytics.storageUsed)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Users</span>
                          <span>{selectedTenant.analytics.usersCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reports Generated</span>
                          <span>{selectedTenant.analytics.reportsGenerated}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label>Security</Label>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span>SSO Enabled: {selectedTenant.security.ssoEnabled ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        <span>2FA Required: {selectedTenant.security.twoFactorAuth ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                  <Button variant="outline" className="w-full">
                    <UserMinus className="w-4 h-4 mr-2" />
                    Remove User
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    User Permissions
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </Button>
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  API Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <Key className="w-4 h-4 mr-2" />
                    Generate API Key
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    View API Keys
                  </Button>
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    API Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tenants" className="space-y-6">
          {/* Tenant List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Enterprise Tenants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tenants.map((tenant) => (
                  <div key={tenant.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                        {tenant.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{tenant.name}</div>
                        <div className="text-sm text-muted-foreground">{tenant.domain}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getPlanBadgeColor(tenant.subscription.plan)}>
                            {tenant.subscription.plan}
                          </Badge>
                          <Badge className={getStatusBadgeColor(tenant.subscription.status)}>
                            {tenant.subscription.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">User Management</h3>
                <p className="text-muted-foreground mb-4">
                  Manage enterprise users, permissions, and access controls
                </p>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add New User
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Enterprise Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  Comprehensive analytics and reporting for enterprise clients
                </p>
                <Button>
                  <Target className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Platform Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Platform Configuration</h3>
                <p className="text-muted-foreground mb-4">
                  Configure enterprise platform settings and preferences
                </p>
                <Button>
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnterpriseDashboard;
