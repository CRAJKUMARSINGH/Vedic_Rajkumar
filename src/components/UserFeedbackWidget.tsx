/**
 * User Feedback Widget Component
 * Phase 2 Week 28: User Feedback System
 * Provides comprehensive feedback collection interface
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  ThumbsUp, 
  Send, 
  Filter,
  Download,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  User
} from 'lucide-react';
import { 
  userFeedbackService, 
  type UserFeedback, 
  type FeedbackAnalytics,
  type FeedbackResponse 
} from '@/services/userFeedbackService';
import { mirrorUserFeedbackToLegacy } from '@/services/unifiedFeedbackSubmit';

interface Props {
  lang?: 'en' | 'hi';
  compact?: boolean;
  showAnalytics?: boolean;
}

const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug Report', icon: Bug, color: 'bg-red-500' },
  { value: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'bg-blue-500' },
  { value: 'improvement', label: 'Improvement', icon: TrendingUp, color: 'bg-green-500' },
  { value: 'general', label: 'General', icon: MessageSquare, color: 'bg-gray-500' },
  { value: 'rating', label: 'Rating', icon: Star, color: 'bg-yellow-500' }
] as const;

const FEEDBACK_CATEGORIES = [
  { value: 'ui', label: 'User Interface' },
  { value: 'performance', label: 'Performance' },
  { value: 'accuracy', label: 'Calculation Accuracy' },
  { value: 'features', label: 'Features' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'other', label: 'Other' }
] as const;

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-gray-200 text-gray-700' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-200 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-200 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-200 text-red-800' }
] as const;

export default function UserFeedbackWidget({ lang = 'en', compact = false, showAnalytics = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<Partial<UserFeedback>>({});
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedFeedback, setSubmittedFeedback] = useState<UserFeedback | null>(null);
  const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState('submit');
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    status: '',
    priority: ''
  });

  const isHi = lang === 'hi';

  useEffect(() => {
    if (showAnalytics) {
      setAnalytics(userFeedbackService.getAnalytics());
    }
  }, [showAnalytics]);

  const handleSubmit = async () => {
    if (!feedback.title?.trim() || !feedback.description?.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const submitted = await userFeedbackService.submitFeedback({
        type: feedback.type || 'general',
        category: feedback.category || 'other',
        title: feedback.title,
        description: feedback.description,
        rating: feedback.type === 'rating' ? rating : undefined,
        priority: feedback.priority || 'medium',
        status: 'pending',
        userAgent: navigator.userAgent,
        sessionId: sessionStorage.getItem('sessionId') || 'anonymous',
        tags: []
      });

      mirrorUserFeedbackToLegacy(submitted);

      setSubmittedFeedback(submitted);
      setFeedback({});
      setRating(0);
      setActiveTab('history');
      
      // Refresh analytics
      if (showAnalytics) {
        setAnalytics(userFeedbackService.getAnalytics());
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = () => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="transition-transform hover:scale-110"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoveredStar(star)}
          onMouseLeave={() => setHoveredStar(0)}
        >
          <Star
            className={`w-6 h-6 ${
              star <= (hoveredStar || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  const renderFeedbackForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Feedback Type</Label>
          <Select
            value={feedback.type}
            onValueChange={(value) => setFeedback({ ...feedback, type: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {FEEDBACK_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <type.icon className="w-4 h-4" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={feedback.category}
            onValueChange={(value) => setFeedback({ ...feedback, category: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {FEEDBACK_CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={feedback.title || ''}
          onChange={(e) => setFeedback({ ...feedback, title: e.target.value })}
          placeholder="Brief description of your feedback"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={feedback.description || ''}
          onChange={(e) => setFeedback({ ...feedback, description: e.target.value })}
          placeholder="Detailed description of your feedback"
          rows={4}
          required
        />
      </div>

      {feedback.type === 'rating' && (
        <div>
          <Label>Rating</Label>
          {renderStarRating()}
        </div>
      )}

      <div>
        <Label htmlFor="priority">Priority</Label>
        <Select
          value={feedback.priority}
          onValueChange={(value) => setFeedback({ ...feedback, priority: value as any })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_LEVELS.map((priority) => (
              <SelectItem key={priority.value} value={priority.value}>
                <Badge className={priority.color}>
                  {priority.label}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !feedback.title?.trim() || !feedback.description?.trim()}
        className="w-full"
      >
        {isSubmitting ? (
          <>Submitting...</>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Submit Feedback
          </>
        )}
      </Button>
    </div>
  );

  const renderAnalytics = () => {
    if (!analytics) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{analytics.totalFeedback}</div>
              <div className="text-sm text-muted-foreground">Total Feedback</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{analytics.averageRating.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{analytics.resolutionRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Resolution Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{analytics.responseTime}h</div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Feedback by Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(analytics.feedbackByType).map(([type, count]) => (
                  <div key={type} className="flex justify-between">
                    <span className="capitalize">{type}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Top Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.topIssues.slice(0, 5).map((issue, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm truncate">{issue.title}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{issue.count}</Badge>
                      <Badge className={`${PRIORITY_LEVELS.find(p => p.value === issue.priority)?.color || 'bg-gray-200'}`}>
                        {issue.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderHistory = () => {
    const feedbackList = userFeedbackService.getFeedback(filters);

    return (
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {FEEDBACK_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              const data = userFeedbackService.exportFeedback('csv');
              const blob = new Blob([data], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `feedback_${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="space-y-3">
          {feedbackList.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={FEEDBACK_TYPES.find(t => t.value === item.type)?.color || 'bg-gray-500'}>
                      {item.type}
                    </Badge>
                    <Badge variant="outline">{item.category}</Badge>
                    <Badge className={PRIORITY_LEVELS.find(p => p.value === item.priority)?.color || 'bg-gray-200'}>
                      {item.priority}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </div>
                </div>
                
                <h4 className="font-semibold mb-1">{item.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                
                {item.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <Badge 
                    variant={item.status === 'resolved' ? 'default' : 'secondary'}
                    className="flex items-center gap-1"
                  >
                    {item.status === 'resolved' && <CheckCircle className="w-3 h-3" />}
                    {item.status === 'in_progress' && <Clock className="w-3 h-3" />}
                    {item.status}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {item.metadata.page}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  if (compact) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            Feedback
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
          </DialogHeader>
          {renderFeedbackForm()}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          User Feedback System
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="submit">Submit Feedback</TabsTrigger>
            {showAnalytics && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="submit" className="mt-4">
            {submittedFeedback ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Feedback Submitted!</h3>
                <p className="text-muted-foreground mb-4">
                  Thank you for your feedback. We'll review it and get back to you soon.
                </p>
                <Button onClick={() => {
                  setSubmittedFeedback(null);
                  setActiveTab('history');
                }}>
                  View Your Feedback
                </Button>
              </div>
            ) : (
              renderFeedbackForm()
            )}
          </TabsContent>
          
          {showAnalytics && (
            <TabsContent value="analytics" className="mt-4">
              {renderAnalytics()}
            </TabsContent>
          )}
          
          <TabsContent value="history" className="mt-4">
            {renderHistory()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
