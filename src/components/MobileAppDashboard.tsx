/**
 * Mobile App Dashboard Component
 * Phase 2 Week 30: Mobile App Foundation
 * Provides comprehensive mobile app management interface
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
  Watch
} from 'lucide-react';
import { 
  mobileAppFoundationService, 
  type MobileDevice, 
  type MobileNotification, 
  type MobileAnalytics, 
  type MobileAppSettings 
} from '@/services/mobileAppFoundationService';

const MobileAppDashboard = () => {
  const [devices, setDevices] = useState<MobileDevice[]>([]);
  const [notifications, setNotifications] = useState<MobileNotification[]>([]);
  const [analytics, setAnalytics] = useState<MobileAnalytics[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [selectedDevice, setSelectedDevice] = useState<MobileDevice | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');

  useEffect(() => {
    loadMobileData();
  }, []);

  const loadMobileData = async () => {
    setIsLoading(true);
    try {
      // Mock data loading
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
        },
        {
          id: 'device_3',
          userId: 'user_3',
          platform: 'android',
          deviceId: 'android_device_789',
          deviceName: 'Google Pixel 8',
          osVersion: 'Android 14',
          appVersion: '2.0.0',
          pushToken: 'android_push_token_789',
          biometricAvailable: true,
          locationEnabled: true,
          cameraEnabled: true,
          lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
          createdAt: new Date('2026-02-01'),
          updatedAt: new Date()
        }
      ];

      const mockNotifications: MobileNotification[] = [
        {
          id: 'notif_1',
          userId: 'user_1',
          deviceId: 'device_1',
          type: 'transit',
          title: 'Saturn Transit Alert',
          message: 'Saturn is transiting your 10th house today. Career opportunities ahead!',
          data: { planet: 'Saturn', house: 10 },
          sentAt: new Date(),
          readAt: new Date(),
          actionUrl: '/transit/saturn',
          priority: 'high',
          status: 'read'
        },
        {
          id: 'notif_2',
          userId: 'user_2',
          type: 'remedy',
          title: 'Daily Remedy Reminder',
          message: 'Time for your evening mantra practice. Find a quiet space.',
          data: { remedy: 'mantra', time: 'evening' },
          sentAt: new Date(Date.now() - 30 * 60 * 1000),
          priority: 'normal',
          status: 'delivered'
        },
        {
          id: 'notif_3',
          userId: 'user_3',
          type: 'consultation',
          title: 'Consultation Scheduled',
          message: 'Your consultation with Dr. Sharma is scheduled for tomorrow at 3 PM.',
          data: { astrologer: 'Dr. Sharma', time: '15:00' },
          sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          readAt: new Date(Date.now() - 30 * 60 * 1000),
          actionUrl: '/consultations/upcoming',
          priority: 'high',
          status: 'read'
        }
      ];

      setDevices(mockDevices);
      setNotifications(mockNotifications);
      setPerformanceMetrics(await mobileAppFoundationService.getPerformanceMetrics());
    } catch (error) {
      console.error('Failed to load mobile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'ios': return <Smartphone className="w-4 h-4" />;
      case 'android': return <Smartphone className="w-4 h-4" />;
      default: return <Tablet className="w-4 h-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'ios': return 'bg-blue-100 text-blue-800';
      case 'android': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'transit': return <Target className="w-4 h-4" />;
      case 'remedy': return <Star className="w-4 h-4" />;
      case 'consultation': return <Calendar className="w-4 h-4" />;
      case 'reminder': return <Clock className="w-4 h-4" />;
      case 'promotion': return <TrendingUp className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.osVersion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' || device.platform === filterPlatform;
    return matchesSearch && matchesPlatform;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading mobile app dashboard...</p>
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
            <Smartphone className="w-8 h-8" />
            Mobile App Foundation
          </h1>
          <p className="text-muted-foreground">
            Comprehensive mobile app management and analytics platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Devices</p>
                <p className="text-3xl font-bold">{devices.length}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">+12.5%</span>
                </div>
              </div>
              <Smartphone className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-3xl font-bold">{performanceMetrics?.activeUsers || 0}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Activity className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">Today</span>
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
                <p className="text-sm font-medium text-muted-foreground">Avg Session</p>
                <p className="text-3xl font-bold">{formatDuration(performanceMetrics?.avgSessionDuration || 0)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-blue-500">Per session</span>
                </div>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Crash Rate</p>
                <p className="text-3xl font-bold">{(performanceMetrics?.crashRate || 0).toFixed(1)}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-500">Stable</span>
                </div>
              </div>
              <Shield className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Platform Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Platform Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['ios', 'android'].map(platform => {
                    const count = devices.filter(d => d.platform === platform).length;
                    const percentage = (count / devices.length) * 100;
                    return (
                      <div key={platform} className="space-y-2">
                        <div className="flex justify-between">
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(platform)}
                            <span className="capitalize">{platform}</span>
                          </div>
                          <span className="text-sm font-medium">{count} devices ({percentage.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  App Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Network Latency</span>
                    <span className="font-medium">{(performanceMetrics?.networkLatency || 0).toFixed(0)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage Efficiency</span>
                    <span className="font-medium">{formatNumber(performanceMetrics?.storageEfficiency || 0)}MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Battery Usage</span>
                    <span className="font-medium">{(performanceMetrics?.batteryUsage || 0).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory Usage</span>
                    <span className="font-medium">{formatNumber(performanceMetrics?.memoryUsage || 0)}MB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices.slice(0, 5).map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(device.platform)}
                      <div>
                        <div className="font-medium">{device.deviceName}</div>
                        <div className="text-sm text-muted-foreground">{device.osVersion}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">Last active</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDuration(Date.now() - device.lastActive.getTime())} ago
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          {/* Device Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Device Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Devices</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Search by device name or OS..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="ios">iOS</SelectItem>
                      <SelectItem value="android">Android</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Device List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Registered Devices ({filteredDevices.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDevices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
                        {getPlatformIcon(device.platform)}
                      </div>
                      <div>
                        <div className="font-medium">{device.deviceName}</div>
                        <div className="text-sm text-muted-foreground">{device.osVersion}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getPlatformColor(device.platform)}>
                            {device.platform}
                          </Badge>
                          <Badge variant="outline">
                            v{device.appVersion}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-sm font-medium">Last active</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDuration(Date.now() - device.lastActive.getTime())} ago
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
                  <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
                  <div className="text-sm text-muted-foreground">Total Sent</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {notifications.filter(n => n.status === 'delivered' || n.status === 'read').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Delivered</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {notifications.filter(n => n.status === 'read').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Read</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {notifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length}
                  </div>
                  <div className="text-sm text-muted-foreground">High Priority</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notification List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-4 p-4 border rounded">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{notification.title}</span>
                        <Badge variant={notification.priority === 'high' ? 'destructive' : 'secondary'}>
                          {notification.priority}
                        </Badge>
                        <Badge className={getStatusColor(notification.status)}>
                          {notification.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Type: {notification.type}</span>
                        <span>Sent: {formatDuration(Date.now() - notification.sentAt.getTime())} ago</span>
                        {notification.readAt && (
                          <span>Read: {formatDuration(Date.now() - notification.readAt.getTime())} ago</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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
                <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
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

        <TabsContent value="settings" className="space-y-6">
          {/* App Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                App Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Mobile App Settings</h3>
                <p className="text-muted-foreground mb-4">
                  Configure mobile app features, permissions, and behavior
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

export default MobileAppDashboard;
