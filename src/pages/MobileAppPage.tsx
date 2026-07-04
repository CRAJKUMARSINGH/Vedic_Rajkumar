/**
 * Mobile App Page Component
 * Phase 2 Week 30: Mobile App Foundation
 * Dedicated page for mobile app management
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
  Smartphone, 
  Tablet, 
  Monitor, 
  Wifi, 
  Battery, 
  HardDrive, 
  MemoryStick, 
  Bell, 
  Shield, 
  Settings, 
  Users, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Download, 
  Upload, 
  RefreshCw, 
  Search, 
  Filter,
  Globe,
  MapPin,
  Camera,
  Fingerprint,
  Volume2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Zap,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  Info,
  HelpCircle,
  Cpu,
  Database,
  Cloud,
  Server,
  Router,
  Signal,
  Power,
  Sun,
  Moon,
  Palette,
  Languages,
  Accessibility,
  Share2,
  Printer,
  Mic,
  Headphones,
  Gamepad2,
  Tv,
  Watch,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Copy,
  ExternalLink,
  Send
} from 'lucide-react';
import { 
  mobileAppFoundationService, 
  type MobileDevice, 
  type MobileNotification, 
  type MobileAnalytics, 
  type MobileAppSettings,
  type MobileAppConfig
} from '@/services/mobileAppFoundationService';
import MobileAppDashboard from '@/components/MobileAppDashboard';

const MobileAppPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [appConfig, setAppConfig] = useState<MobileAppConfig | null>(null);
  const [devices, setDevices] = useState<MobileDevice[]>([]);
  const [newNotification, setNewNotification] = useState({
    type: 'transit' as const,
    title: '',
    message: '',
    priority: 'normal' as const,
    userId: '',
    deviceId: ''
  });

  useEffect(() => {
    loadMobileAppData();
  }, []);

  const loadMobileAppData = async () => {
    try {
      const config = mobileAppFoundationService.getMobileAppConfig();
      setAppConfig(config);
      
      // Mock device data
      const mockDevices: MobileDevice[] = [
        {
          id: 'device_1',
          userId: 'user_1',
          platform: 'ios',
          deviceId: 'ios_device_123',
          deviceName: 'iPhone 14 Pro',
          osVersion: 'iOS 17.2',
          appVersion: '2.0.0',
          pushToken: 'ios_push_token_123',
          biometricAvailable: true,
          locationEnabled: true,
          cameraEnabled: true,
          lastActive: new Date(),
          createdAt: new Date('2026-01-15'),
          updatedAt: new Date()
        },
        {
          id: 'device_2',
          userId: 'user_2',
          platform: 'android',
          deviceId: 'android_device_456',
          deviceName: 'Samsung Galaxy S23',
          osVersion: 'Android 14',
          appVersion: '2.0.0',
          pushToken: 'android_push_token_456',
          biometricAvailable: true,
          locationEnabled: false,
          cameraEnabled: true,
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
          createdAt: new Date('2026-01-20'),
          updatedAt: new Date()
        }
      ];
      
      setDevices(mockDevices);
    } catch (error) {
      console.error('Failed to load mobile app data:', error);
    }
  };

  const handleSendNotification = async () => {
    try {
      await mobileAppFoundationService.sendNotification({
        type: newNotification.type,
        title: newNotification.title,
        message: newNotification.message,
        priority: newNotification.priority,
        userId: newNotification.userId,
        deviceId: newNotification.deviceId || undefined
      });
      
      setShowNotificationDialog(false);
      setNewNotification({
        type: 'transit',
        title: '',
        message: '',
        priority: 'normal',
        userId: '',
        deviceId: ''
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'ios': return <Smartphone className="w-4 h-4 text-blue-500" />;
      case 'android': return <Smartphone className="w-4 h-4 text-green-500" />;
      default: return <Tablet className="w-4 h-4 text-gray-500" />;
    }
  };

  const getFeatureIcon = (feature: string) => {
    const icons: Record<string, React.ReactNode> = {
      offlineMode: <Cloud className="w-4 h-4" />,
      pushNotifications: <Bell className="w-4 h-4" />,
      biometricAuth: <Fingerprint className="w-4 h-4" />,
      cameraAccess: <Camera className="w-4 h-4" />,
      locationAccess: <MapPin className="w-4 h-4" />,
      calendarIntegration: <Calendar className="w-4 h-4" />,
      sharing: <Share2 className="w-4 h-4" />,
      printing: <Printer className="w-4 h-4" />,
      voiceInput: <Mic className="w-4 h-4" />,
      arMode: <Eye className="w-4 h-4" />
    };
    return icons[feature] || <Settings className="w-4 h-4" />;
  };

  const renderConfigDialog = () => (
    <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Mobile App Configuration
          </DialogTitle>
        </DialogHeader>
        {appConfig && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <Label className="text-lg font-semibold">Basic Information</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input id="displayName" value={appConfig.displayName} readOnly />
                </div>
                <div>
                  <Label htmlFor="bundleId">Bundle ID</Label>
                  <Input id="bundleId" value={appConfig.bundleId} readOnly />
                </div>
                <div>
                  <Label htmlFor="version">Version</Label>
                  <Input id="version" value={appConfig.version} readOnly />
                </div>
                <div>
                  <Label htmlFor="buildNumber">Build Number</Label>
                  <Input id="buildNumber" value={appConfig.buildNumber} readOnly />
                </div>
              </div>
            </div>

            {/* Theme Configuration */}
            <div>
              <Label className="text-lg font-semibold">Theme Configuration</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: appConfig.theme.primaryColor }}></div>
                    <Input id="primaryColor" value={appConfig.theme.primaryColor} readOnly />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: appConfig.theme.secondaryColor }}></div>
                    <Input id="secondaryColor" value={appConfig.theme.secondaryColor} readOnly />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: appConfig.theme.accentColor }}></div>
                    <Input id="accentColor" value={appConfig.theme.accentColor} readOnly />
                  </div>
                </div>
                <div>
                  <Label htmlFor="backgroundColor">Background Color</Label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: appConfig.theme.backgroundColor }}></div>
                    <Input id="backgroundColor" value={appConfig.theme.backgroundColor} readOnly />
                  </div>
                </div>
                <div>
                  <Label htmlFor="textColor">Text Color</Label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: appConfig.theme.textColor }}></div>
                    <Input id="textColor" value={appConfig.theme.textColor} readOnly />
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <Label className="text-lg font-semibold">App Features</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                {Object.entries(appConfig.features).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center gap-2">
                    {getFeatureIcon(feature)}
                    <span className="text-sm capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <Badge variant={enabled ? 'default' : 'secondary'}>
                      {enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* API Configuration */}
            <div>
              <Label className="text-lg font-semibold">API Configuration</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="baseUrl">Base URL</Label>
                  <Input id="baseUrl" value={appConfig.api.baseUrl} readOnly />
                </div>
                <div>
                  <Label htmlFor="timeout">Timeout (ms)</Label>
                  <Input id="timeout" type="number" value={appConfig.api.timeout} readOnly />
                </div>
                <div>
                  <Label htmlFor="retryAttempts">Retry Attempts</Label>
                  <Input id="retryAttempts" type="number" value={appConfig.api.retryAttempts} readOnly />
                </div>
                <div>
                  <Label htmlFor="cacheExpiration">Cache Expiration (ms)</Label>
                  <Input id="cacheExpiration" type="number" value={appConfig.api.cacheExpiration} readOnly />
                </div>
              </div>
            </div>

            {/* Security Configuration */}
            <div>
              <Label className="text-lg font-semibold">Security Configuration</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (ms)</Label>
                  <Input id="sessionTimeout" type="number" value={appConfig.security.sessionTimeout} readOnly />
                </div>
                <div>
                  <Label htmlFor="dataRetention">Data Retention (ms)</Label>
                  <Input id="dataRetention" type="number" value={appConfig.security.dataRetention} readOnly />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Encryption</span>
                  <Badge variant={appConfig.security.encryptionEnabled ? 'default' : 'secondary'}>
                    {appConfig.security.encryptionEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4" />
                  <span>Biometric Required</span>
                  <Badge variant={appConfig.security.biometricRequired ? 'default' : 'secondary'}>
                    {appConfig.security.biometricRequired ? 'Required' : 'Optional'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>Secure Storage</span>
                  <Badge variant={appConfig.security.secureStorage ? 'default' : 'secondary'}>
                    {appConfig.security.secureStorage ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setShowConfigDialog(false)}>
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  const renderNotificationDialog = () => (
    <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Send Push Notification
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="notificationType">Notification Type</Label>
              <Select value={newNotification.type} onValueChange={(value) => setNewNotification({ ...newNotification, type: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transit">Transit Alert</SelectItem>
                  <SelectItem value="remedy">Remedy Reminder</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="promotion">Promotion</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={newNotification.priority} onValueChange={(value) => setNewNotification({ ...newNotification, priority: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={newNotification.title}
              onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
              placeholder="Enter notification title"
            />
          </div>
          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={newNotification.message}
              onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
              placeholder="Enter notification message"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="userId">User ID (optional)</Label>
              <Input
                id="userId"
                value={newNotification.userId}
                onChange={(e) => setNewNotification({ ...newNotification, userId: e.target.value })}
                placeholder="Leave empty for broadcast"
              />
            </div>
            <div>
              <Label htmlFor="deviceId">Device ID (optional)</Label>
              <Input
                id="deviceId"
                value={newNotification.deviceId}
                onChange={(e) => setNewNotification({ ...newNotification, deviceId: e.target.value })}
                placeholder="Leave empty for all devices"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowNotificationDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendNotification}
              disabled={!newNotification.title || !newNotification.message}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Notification
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
            <Smartphone className="w-8 h-8" />
            Mobile App Foundation
          </h1>
          <p className="text-muted-foreground">
            Comprehensive mobile app management and analytics platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowNotificationDialog(true)}>
            <Bell className="w-4 h-4 mr-2" />
            Send Notification
          </Button>
          <Button variant="outline" onClick={() => setShowConfigDialog(true)}>
            <Settings className="w-4 h-4 mr-2" />
            App Config
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <MobileAppDashboard />
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          {/* Device Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{devices.length}</div>
                  <div className="text-sm text-muted-foreground">Total Devices</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {devices.filter(d => d.platform === 'ios').length}
                  </div>
                  <div className="text-sm text-muted-foreground">iOS Devices</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {devices.filter(d => d.platform === 'android').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Android Devices</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Device Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Device Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
                        {getPlatformIcon(device.platform)}
                      </div>
                      <div>
                        <div className="font-medium">{device.deviceName}</div>
                        <div className="text-sm text-muted-foreground">{device.osVersion}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{device.platform}</Badge>
                          <Badge variant="outline">v{device.appVersion}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-sm font-medium">Last active</div>
                        <div className="text-sm text-muted-foreground">
                          {Math.floor((Date.now() - device.lastActive.getTime()) / (1000 * 60 * 60))}h ago
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
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

        <TabsContent value="notifications" className="space-y-6">
          {/* Notification Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">1,234</div>
                  <div className="text-sm text-muted-foreground">Total Sent</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">1,156</div>
                  <div className="text-sm text-muted-foreground">Delivered</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">892</div>
                  <div className="text-sm text-muted-foreground">Read</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">156</div>
                  <div className="text-sm text-muted-foreground">High Priority</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notification Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Push Notifications</h3>
                <p className="text-muted-foreground mb-4">
                  Send and manage push notifications to mobile devices
                </p>
                <Button onClick={() => setShowNotificationDialog(true)}>
                  <Bell className="w-4 h-4 mr-2" />
                  Send Notification
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Mobile Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Mobile Analytics Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  Comprehensive mobile app analytics and user behavior insights
                </p>
                <Button>
                  <LineChart className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {renderConfigDialog()}
      {renderNotificationDialog()}
    </div>
  );
};

export default MobileAppPage;
