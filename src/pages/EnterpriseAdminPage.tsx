/**
 * Enterprise Admin Page Component
 * Phase 4 Week 51: Enterprise SaaS Platform
 * Dedicated page for enterprise administration
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Filter,
  Save,
  X,
  Copy,
  ExternalLink,
  HelpCircle,
  Info,
  Wifi,
  Server,
  Cloud,
  Monitor,
  Smartphone
} from 'lucide-react';
import { 
  enterpriseSaaSService, 
  type EnterpriseTenant, 
  type EnterpriseUser, 
  type EnterpriseSubscription 
} from '@/services/enterpriseSaaSService';
import EnterpriseDashboard from '@/components/EnterpriseDashboard';

const EnterpriseAdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateTenantDialog, setShowCreateTenantDialog] = useState(false);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<EnterpriseTenant | null>(null);
  const [newTenantData, setNewTenantData] = useState({
    name: '',
    domain: '',
    companyName: '',
    contactEmail: '',
    supportPhone: '',
    website: '',
    plan: 'starter' as const,
    billingCycle: 'monthly' as const,
    defaultLanguage: 'en',
    timezone: 'UTC',
    currency: 'USD',
    astrologySystem: 'vedic' as const
  });

  const availablePlans = enterpriseSaaSService.getAvailablePlans();

  const handleCreateTenant = async () => {
    try {
      const tenant = await enterpriseSaaSService.createTenant({
        name: newTenantData.name,
        domain: newTenantData.domain,
        theme: {
          primaryColor: '#8b5cf6',
          secondaryColor: '#ec4899',
          accentColor: '#f59e0b'
        },
        branding: {
          companyName: newTenantData.companyName,
          contactEmail: newTenantData.contactEmail,
          supportPhone: newTenantData.supportPhone || undefined,
          website: newTenantData.website || undefined
        },
        subscription: {
          plan: newTenantData.plan,
          seats: 10,
          features: [],
          billingCycle: newTenantData.billingCycle,
          nextBillingDate: new Date(),
          status: 'active'
        },
        configuration: {
          defaultLanguage: newTenantData.defaultLanguage,
          timezone: newTenantData.timezone,
          currency: newTenantData.currency,
          dateFormat: 'MM/DD/YYYY',
          astrologySystem: newTenantData.astrologySystem,
          calculationMethod: 'swiss-ephemeris'
        },
        apiKeys: {
          publicKey: `pk_${Math.random().toString(36).substr(2, 32)}`,
          privateKey: `sk_${Math.random().toString(36).substr(2, 32)}`,
          webhookSecret: `whsec_${Math.random().toString(36).substr(2, 32)}`,
          rateLimit: 1000
        },
        security: {
          ssoEnabled: false,
          ipWhitelist: [],
          twoFactorAuth: false,
          sessionTimeout: 3600
        }
      });

      setSelectedTenant(tenant);
      setShowCreateTenantDialog(false);
      setNewTenantData({
        name: '',
        domain: '',
        companyName: '',
        contactEmail: '',
        supportPhone: '',
        website: '',
        plan: 'starter',
        billingCycle: 'monthly',
        defaultLanguage: 'en',
        timezone: 'UTC',
        currency: 'USD',
        astrologySystem: 'vedic'
      });
    } catch (error) {
      console.error('Failed to create tenant:', error);
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

  const renderCreateTenantDialog = () => (
    <Dialog open={showCreateTenantDialog} onOpenChange={setShowCreateTenantDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Create New Enterprise Tenant
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tenantName">Tenant Name *</Label>
              <Input
                id="tenantName"
                value={newTenantData.name}
                onChange={(e) => setNewTenantData({ ...newTenantData, name: e.target.value })}
                placeholder="Enter tenant name"
              />
            </div>
            <div>
              <Label htmlFor="domain">Domain *</Label>
              <Input
                id="domain"
                value={newTenantData.domain}
                onChange={(e) => setNewTenantData({ ...newTenantData, domain: e.target.value })}
                placeholder="tenant.vedic-rajkumar.com"
              />
            </div>
            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={newTenantData.companyName}
                onChange={(e) => setNewTenantData({ ...newTenantData, companyName: e.target.value })}
                placeholder="Company Name"
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={newTenantData.contactEmail}
                onChange={(e) => setNewTenantData({ ...newTenantData, contactEmail: e.target.value })}
                placeholder="admin@company.com"
              />
            </div>
            <div>
              <Label htmlFor="supportPhone">Support Phone</Label>
              <Input
                id="supportPhone"
                value={newTenantData.supportPhone}
                onChange={(e) => setNewTenantData({ ...newTenantData, supportPhone: e.target.value })}
                placeholder="+1-555-0123"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={newTenantData.website}
                onChange={(e) => setNewTenantData({ ...newTenantData, website: e.target.value })}
                placeholder="https://company.com"
              />
            </div>
            <div>
              <Label htmlFor="plan">Subscription Plan *</Label>
              <Select value={newTenantData.plan} onValueChange={(value) => setNewTenantData({ ...newTenantData, plan: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{plan.name}</span>
                        <span className="text-sm text-muted-foreground">${plan.pricing.basePrice}/mo</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="billingCycle">Billing Cycle</Label>
              <Select value={newTenantData.billingCycle} onValueChange={(value) => setNewTenantData({ ...newTenantData, billingCycle: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual (Save 15%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="defaultLanguage">Default Language</Label>
              <Select value={newTenantData.defaultLanguage} onValueChange={(value) => setNewTenantData({ ...newTenantData, defaultLanguage: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={newTenantData.timezone} onValueChange={(value) => setNewTenantData({ ...newTenantData, timezone: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                  <SelectItem value="Europe/Paris">Paris</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
                  <SelectItem value="Asia/Kolkata">Mumbai</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={newTenantData.currency} onValueChange={(value) => setNewTenantData({ ...newTenantData, currency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="CNY">CNY (¥)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="astrologySystem">Astrology System</Label>
              <Select value={newTenantData.astrologySystem} onValueChange={(value) => setNewTenantData({ ...newTenantData, astrologySystem: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vedic">Vedic</SelectItem>
                  <SelectItem value="western">Western</SelectItem>
                  <SelectItem value="chinese">Chinese</SelectItem>
                  <SelectItem value="all">All Systems</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateTenantDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTenant} disabled={!newTenantData.name || !newTenantData.domain || !newTenantData.companyName || !newTenantData.contactEmail}>
              <Save className="w-4 h-4 mr-2" />
              Create Tenant
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Building2 className="w-8 h-8" />
            Enterprise Administration
          </h1>
          <p className="text-muted-foreground">
            Comprehensive enterprise SaaS platform management
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCreateTenantDialog} onOpenChange={setShowCreateTenantDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Tenant
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <EnterpriseDashboard />
        </TabsContent>

        <TabsContent value="tenants" className="space-y-6">
          {/* Available Plans */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Available Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {availablePlans.map((plan) => (
                  <Card key={plan.id} className="relative">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{plan.name}</span>
                        <Badge className={getPlanBadgeColor(plan.id)}>
                          {plan.id === 'enterprise' ? 'Premium' : plan.id === 'professional' ? 'Popular' : 'Basic'}
                        </Badge>
                      </CardTitle>
                      <div className="text-2xl font-bold">
                        ${plan.pricing.basePrice}
                        <span className="text-sm font-normal text-muted-foreground">/month</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm font-medium">Features:</div>
                        <ul className="text-sm space-y-1">
                          {plan.features.slice(0, 5).map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <div className="text-sm text-muted-foreground">
                          {plan.features.length > 5 && `+${plan.features.length - 5} more features`}
                        </div>
                        <div className="pt-3 border-t">
                          <div className="text-sm font-medium">Limits:</div>
                          <div className="text-sm text-muted-foreground">
                            {plan.limits.users === -1 ? 'Unlimited users' : `Up to ${plan.limits.users} users`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {plan.limits.storage === -1 ? 'Unlimited storage' : `${plan.limits.storage} GB storage`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {plan.limits.apiCalls === -1 ? 'Unlimited API calls' : `${plan.limits.apiCalls.toLocaleString()} API calls/month`}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tenant Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Tenant Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Enterprise Tenants</h3>
                <p className="text-muted-foreground mb-4">
                  Manage enterprise tenants, subscriptions, and configurations
                </p>
                <Button onClick={() => setShowCreateTenantDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Tenant
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Platform Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Platform Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">127</div>
                  <div className="text-sm text-muted-foreground">Total Tenants</div>
                  <div className="text-xs text-green-600 mt-1">+12.5% this month</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">3,456</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                  <div className="text-xs text-green-600 mt-1">+8.3% this month</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">45.2K</div>
                  <div className="text-sm text-muted-foreground">API Calls</div>
                  <div className="text-xs text-blue-600 mt-1">Today</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">$12.3K</div>
                  <div className="text-sm text-muted-foreground">Revenue</div>
                  <div className="text-xs text-green-600 mt-1">+15.7% this month</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Detailed Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  Comprehensive usage analytics and performance metrics
                </p>
                <Button>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Platform Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Platform Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label>Platform Configuration</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="maxTenants">Maximum Tenants</Label>
                      <Input id="maxTenants" type="number" defaultValue="1000" />
                    </div>
                    <div>
                      <Label htmlFor="defaultPlan">Default Plan</Label>
                      <Select defaultValue="starter">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="starter">Starter</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="apiRateLimit">Default API Rate Limit</Label>
                      <Input id="apiRateLimit" type="number" defaultValue="1000" />
                    </div>
                    <div>
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input id="sessionTimeout" type="number" defaultValue="60" />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Security Settings</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Require Two-Factor Authentication</div>
                        <div className="text-sm text-muted-foreground">Enforce 2FA for all enterprise users</div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Lock className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">IP Whitelisting</div>
                        <div className="text-sm text-muted-foreground">Restrict access to specific IP ranges</div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Wifi className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">SSO Integration</div>
                        <div className="text-sm text-muted-foreground">Enable SSO for enterprise authentication</div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Shield className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {renderCreateTenantDialog()}
    </div>
  );
};

export default EnterpriseAdminPage;
