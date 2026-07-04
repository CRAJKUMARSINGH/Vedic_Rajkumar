/**
 * SEO Analytics Dashboard Component
 * Phase 2 Week 29: Advanced SEO Optimization
 * Provides comprehensive SEO analytics and monitoring
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  Clock, 
  Search,
  Globe,
  Smartphone,
  Monitor,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  Activity,
  FileText,
  Link,
  Star,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { 
  advancedSEOService, 
  type SEOAnalytics 
} from '@/services/advancedSEOService';

const SEOAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<SEOAnalytics | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const analyticsData = advancedSEOService.getAnalytics();
      const recommendationsData = advancedSEOService.getRecommendations(analyticsData);
      
      setAnalytics(analyticsData);
      setRecommendations(recommendationsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load SEO analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return { text: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 70) return { text: 'Good', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Needs Improvement', color: 'bg-red-100 text-red-800' };
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const exportReport = () => {
    const report = advancedSEOService.generateReport();
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading SEO analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unable to load SEO analytics</h3>
            <p className="text-muted-foreground mb-4">
              Please check your connection and try again.
            </p>
            <Button onClick={loadAnalytics}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8" />
            SEO Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive SEO performance monitoring and optimization insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadAnalytics} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-muted-foreground">
        Last updated: {lastUpdated.toLocaleString()}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Page Views</p>
                <p className="text-3xl font-bold">{formatNumber(analytics.pageViews)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">+12.5%</span>
                </div>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Visitors</p>
                <p className="text-3xl font-bold">{formatNumber(analytics.uniqueVisitors)}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Bounce Rate</p>
                <p className="text-3xl font-bold">{analytics.bounceRate}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">-2.1%</span>
                </div>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Time on Page</p>
                <p className="text-3xl font-bold">{formatTime(analytics.avgTimeOnPage)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">+15s</span>
                </div>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Traffic Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formatNumber(analytics.organicSearch)}</div>
              <div className="text-sm text-muted-foreground">Organic Search</div>
              <div className="text-xs text-muted-foreground mt-1">
                {((analytics.organicSearch / analytics.pageViews) * 100).toFixed(1)}% of total
              </div>
              <Progress value={(analytics.organicSearch / analytics.pageViews) * 100} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatNumber(analytics.directTraffic)}</div>
              <div className="text-sm text-muted-foreground">Direct Traffic</div>
              <div className="text-xs text-muted-foreground mt-1">
                {((analytics.directTraffic / analytics.pageViews) * 100).toFixed(1)}% of total
              </div>
              <Progress value={(analytics.directTraffic / analytics.pageViews) * 100} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formatNumber(analytics.referralTraffic)}</div>
              <div className="text-sm text-muted-foreground">Referral Traffic</div>
              <div className="text-xs text-muted-foreground mt-1">
                {((analytics.referralTraffic / analytics.pageViews) * 100).toFixed(1)}% of total
              </div>
              <Progress value={(analytics.referralTraffic / analytics.pageViews) * 100} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{formatNumber(analytics.socialTraffic)}</div>
              <div className="text-sm text-muted-foreground">Social Traffic</div>
              <div className="text-xs text-muted-foreground mt-1">
                {((analytics.socialTraffic / analytics.pageViews) * 100).toFixed(1)}% of total
              </div>
              <Progress value={(analytics.socialTraffic / analytics.pageViews) * 100} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Page Speed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  <span>Desktop</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${getPerformanceColor(analytics.pageSpeed.desktop)}`}>
                    {analytics.pageSpeed.desktop}/100
                  </span>
                  <Badge className={getPerformanceBadge(analytics.pageSpeed.desktop).color}>
                    {getPerformanceBadge(analytics.pageSpeed.desktop).text}
                  </Badge>
                </div>
              </div>
              <Progress value={analytics.pageSpeed.desktop} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span>Mobile</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${getPerformanceColor(analytics.pageSpeed.mobile)}`}>
                    {analytics.pageSpeed.mobile}/100
                  </span>
                  <Badge className={getPerformanceBadge(analytics.pageSpeed.mobile).color}>
                    {getPerformanceBadge(analytics.pageSpeed.mobile).text}
                  </Badge>
                </div>
              </div>
              <Progress value={analytics.pageSpeed.mobile} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Core Web Vitals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Largest Contentful Paint (LCP)</span>
                  <span className={`text-sm font-semibold ${analytics.coreWebVitals.lcp <= 2.5 ? 'text-green-600' : 'text-red-600'}`}>
                    {analytics.coreWebVitals.lcp}s
                  </span>
                </div>
                <Progress value={Math.min((2.5 / analytics.coreWebVitals.lcp) * 100, 100)} className="h-2" />
                <div className="text-xs text-muted-foreground">Target: &lt;2.5s</div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">First Input Delay (FID)</span>
                  <span className={`text-sm font-semibold ${analytics.coreWebVitals.fid <= 100 ? 'text-green-600' : 'text-red-600'}`}>
                    {analytics.coreWebVitals.fid}ms
                  </span>
                </div>
                <Progress value={Math.min((100 / analytics.coreWebVitals.fid) * 100, 100)} className="h-2" />
                <div className="text-xs text-muted-foreground">Target: &lt;100ms</div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Cumulative Layout Shift (CLS)</span>
                  <span className={`text-sm font-semibold ${analytics.coreWebVitals.cls <= 0.1 ? 'text-green-600' : 'text-red-600'}`}>
                    {analytics.coreWebVitals.cls}
                  </span>
                </div>
                <Progress value={Math.min((0.1 / analytics.coreWebVitals.cls) * 100, 100)} className="h-2" />
                <div className="text-xs text-muted-foreground">Target: &lt;0.1</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="pages" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
          <TabsTrigger value="keywords">Top Keywords</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Most Visited Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{page.url}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatNumber(page.views)} views • {formatTime(page.avgTime)} avg time
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatNumber(page.views)}</div>
                      <div className="text-sm text-muted-foreground">{formatTime(page.avgTime)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Top Search Keywords
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topKeywords.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">"{keyword.keyword}"</div>
                        <div className="text-sm text-muted-foreground">
                          {keyword.impressions.toLocaleString()} impressions • {keyword.ctr}% CTR
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{keyword.clicks.toLocaleString()} clicks</div>
                      <div className="text-sm text-muted-foreground">{keyword.ctr}% CTR</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                SEO Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.length > 0 ? (
                  recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 text-sm font-semibold mt-0.5">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{recommendation}</div>
                      </div>
                      <Badge variant="outline">
                        {recommendation.includes('High') ? 'High Priority' : 
                         recommendation.includes('Low') ? 'Low Priority' : 'Medium Priority'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Great SEO Performance!</h3>
                    <p className="text-muted-foreground">
                      Your SEO metrics are excellent. Keep up the good work!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Crawl Errors */}
      {analytics.crawlErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Crawl Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.crawlErrors.map((error, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Link className="w-4 h-4 text-red-500" />
                    <span>{error}</span>
                  </div>
                  <Badge variant="destructive">Error</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SEOAnalyticsDashboard;
