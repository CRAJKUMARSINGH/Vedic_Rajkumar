/**
 * Feedback Page Component
 * Phase 2 Week 28: User Feedback System
 * Dedicated page for comprehensive feedback management
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  Download, 
  Filter,
  Search,
  Calendar,
  Users,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  ThumbsUp,
  Bug,
  Lightbulb,
  Send
} from 'lucide-react';
import { 
  userFeedbackService, 
  type UserFeedback, 
  type FeedbackAnalytics 
} from '@/services/userFeedbackService';
import UserFeedbackWidget from '@/components/UserFeedbackWidget';

const FeedbackPage = () => {
  const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null);
  const [feedback, setFeedback] = useState<UserFeedback[]>([]);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    status: '',
    priority: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [analyticsData, feedbackData] = await Promise.all([
        Promise.resolve(userFeedbackService.getAnalytics()),
        Promise.resolve(userFeedbackService.getFeedback())
      ]);
      
      setAnalytics(analyticsData);
      setFeedback(feedbackData);
    } catch (error) {
      console.error('Failed to load feedback data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFeedback = feedback.filter(item => {
    if (filters.type && item.type !== filters.type) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.priority && item.priority !== filters.priority) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!item.title.toLowerCase().includes(searchLower) &&
          !item.description.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    return true;
  });

  const exportData = (format: 'json' | 'csv') => {
    const data = userFeedbackService.exportFeedback(format);
    const blob = new Blob([data], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback_export_${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'closed': return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return <Bug className="w-4 h-4" />;
      case 'feature': return <Lightbulb className="w-4 h-4" />;
      case 'improvement': return <TrendingUp className="w-4 h-4" />;
      case 'rating': return <Star className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading feedback data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
          <MessageSquare className="w-8 h-8" />
          User Feedback Center
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive feedback management system for continuous improvement of Vedic Rajkumar
        </p>
      </div>

      {/* Quick Stats */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Feedback</p>
                  <p className="text-3xl font-bold">{analytics.totalFeedback}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                  <p className="text-3xl font-bold">{analytics.averageRating.toFixed(2)}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
                  <p className="text-3xl font-bold">{analytics.resolutionRate.toFixed(1)}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                  <p className="text-3xl font-bold">{analytics.responseTime}h</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submit">Submit Feedback</TabsTrigger>
          <TabsTrigger value="history">Feedback History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Recent Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedback.slice(0, 5).map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          <Badge variant="outline">{item.type}</Badge>
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(item.status)}
                          <span className="text-sm text-muted-foreground">{item.status}</span>
                        </div>
                      </div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.metadata.page}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Issues */}
            {analytics && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Top Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topIssues.slice(0, 10).map((issue, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-lg">#{index + 1}</span>
                          <div>
                            <p className="font-medium">{issue.title}</p>
                            <p className="text-sm text-muted-foreground">{issue.count} reports</p>
                          </div>
                        </div>
                        <Badge className={getPriorityColor(issue.priority)}>
                          {issue.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Feedback Distribution */}
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Feedback by Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.feedbackByType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(type)}
                          <span className="capitalize">{type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(count / analytics.totalFeedback) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    7-Day Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.feedbackTrend.map((day, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{new Date(day.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <div className="flex items-center gap-2">
                          <span>{day.count}</span>
                          {day.avgRating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span>{day.avgRating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="submit">
          <UserFeedbackWidget showAnalytics={false} />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Search feedback..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="improvement">Improvement</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All priority</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({
                      type: '',
                      category: '',
                      status: '',
                      priority: '',
                      search: '',
                      dateFrom: '',
                      dateTo: ''
                    })}
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={() => exportData('csv')}
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback List */}
          <div className="space-y-4">
            {filteredFeedback.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(item.type)}
                      <div>
                        <Badge variant="outline">{item.type}</Badge>
                        <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className="text-sm font-medium">{item.status}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground mb-4">{item.description}</p>

                  {item.rating && (
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">({item.rating}/5)</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                      <span>{item.metadata.page}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{item.userId ? 'Registered User' : 'Anonymous'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredFeedback.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No feedback found</h3>
                <p className="text-muted-foreground">
                  {feedback.length === 0 
                    ? "No feedback has been submitted yet. Be the first to share your thoughts!"
                    : "No feedback matches your current filters. Try adjusting your search criteria."
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          {analytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Feedback Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">By Type</h4>
                        {Object.entries(analytics.feedbackByType).map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(type)}
                              <span className="capitalize">{type}</span>
                            </div>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Resolution Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Resolution Rate</span>
                        <span className="font-bold text-green-600">{analytics.resolutionRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Average Response Time</span>
                        <span className="font-bold">{analytics.responseTime} hours</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Total Feedback</span>
                        <span className="font-bold">{analytics.totalFeedback}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Average Rating</span>
                        <span className="font-bold">{analytics.averageRating.toFixed(2)}/5</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Button onClick={() => exportData('json')}>
                      <Download className="w-4 h-4 mr-2" />
                      Export as JSON
                    </Button>
                    <Button onClick={() => exportData('csv')} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export as CSV
                    </Button>
                    <Button onClick={() => window.print()} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Print Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeedbackPage;
