/**
 * User Feedback Service
 * Phase 2 Week 28: User Feedback System
 * Implements comprehensive feedback collection and analysis
 */

export interface UserFeedback {
  id: string;
  userId?: string;
  sessionId: string;
  type: 'bug' | 'feature' | 'improvement' | 'general' | 'rating';
  category: 'ui' | 'performance' | 'accuracy' | 'features' | 'documentation' | 'other';
  title: string;
  description: string;
  rating?: number; // 1-5 stars
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  userAgent: string;
  timestamp: Date;
  metadata: {
    page: string;
    feature?: string;
    browserInfo: string;
    screenResolution: string;
    language: string;
    timezone: string;
  };
  attachments?: string[];
  tags: string[];
}

export interface FeedbackAnalytics {
  totalFeedback: number;
  feedbackByType: Record<string, number>;
  feedbackByCategory: Record<string, number>;
  averageRating: number;
  feedbackTrend: {
    date: string;
    count: number;
    avgRating: number;
  }[];
  topIssues: {
    title: string;
    count: number;
    priority: string;
  }[];
  resolutionRate: number;
  responseTime: number; // hours
}

export interface FeedbackResponse {
  id: string;
  feedbackId: string;
  response: string;
  responder: string;
  timestamp: Date;
  internal: boolean;
}

class UserFeedbackService {
  private feedback: UserFeedback[] = [];
  private responses: FeedbackResponse[] = [];
  private readonly STORAGE_KEY = 'vedic_user_feedback';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Submit new feedback
   */
  async submitFeedback(feedbackData: Omit<UserFeedback, 'id' | 'timestamp' | 'metadata'>): Promise<UserFeedback> {
    const feedback: UserFeedback = {
      ...feedbackData,
      id: this.generateId(),
      timestamp: new Date(),
      metadata: {
        page: window.location.pathname,
        browserInfo: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...feedbackData.metadata
      }
    };

    this.feedback.push(feedback);
    this.saveToStorage();
    
    // Send to backend (if available)
    try {
      await this.sendToBackend(feedback);
    } catch (error) {
      console.warn('Failed to send feedback to backend:', error);
    }

    return feedback;
  }

  /**
   * Get all feedback with optional filtering
   */
  getFeedback(filters?: {
    type?: UserFeedback['type'];
    category?: UserFeedback['category'];
    status?: UserFeedback['status'];
    priority?: UserFeedback['priority'];
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
  }): UserFeedback[] {
    let filtered = [...this.feedback];

    if (filters) {
      if (filters.type) {
        filtered = filtered.filter(f => f.type === filters.type);
      }
      if (filters.category) {
        filtered = filtered.filter(f => f.category === filters.category);
      }
      if (filters.status) {
        filtered = filtered.filter(f => f.status === filters.status);
      }
      if (filters.priority) {
        filtered = filtered.filter(f => f.priority === filters.priority);
      }
      if (filters.dateFrom) {
        filtered = filtered.filter(f => f.timestamp >= filters.dateFrom);
      }
      if (filters.dateTo) {
        filtered = filtered.filter(f => f.timestamp <= filters.dateTo);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(f => 
          f.title.toLowerCase().includes(searchLower) ||
          f.description.toLowerCase().includes(searchLower) ||
          f.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Update feedback status
   */
  updateFeedbackStatus(id: string, status: UserFeedback['status']): void {
    const feedback = this.feedback.find(f => f.id === id);
    if (feedback) {
      feedback.status = status;
      this.saveToStorage();
    }
  }

  /**
   * Add response to feedback
   */
  async addResponse(feedbackId: string, response: string, responder: string, internal: boolean = false): Promise<FeedbackResponse> {
    const feedbackResponse: FeedbackResponse = {
      id: this.generateId(),
      feedbackId,
      response,
      responder,
      timestamp: new Date(),
      internal
    };

    this.responses.push(feedbackResponse);
    this.saveToStorage();

    return feedbackResponse;
  }

  /**
   * Get responses for feedback
   */
  getResponses(feedbackId: string): FeedbackResponse[] {
    return this.responses
      .filter(r => r.feedbackId === feedbackId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Get feedback analytics
   */
  getAnalytics(): FeedbackAnalytics {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentFeedback = this.feedback.filter(f => f.timestamp >= thirtyDaysAgo);
    
    // Feedback by type
    const feedbackByType: Record<string, number> = {};
    recentFeedback.forEach(f => {
      feedbackByType[f.type] = (feedbackByType[f.type] || 0) + 1;
    });

    // Feedback by category
    const feedbackByCategory: Record<string, number> = {};
    recentFeedback.forEach(f => {
      feedbackByCategory[f.category] = (feedbackByCategory[f.category] || 0) + 1;
    });

    // Average rating
    const ratedFeedback = recentFeedback.filter(f => f.rating !== undefined);
    const averageRating = ratedFeedback.length > 0 
      ? ratedFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / ratedFeedback.length 
      : 0;

    // Feedback trend (last 7 days)
    const feedbackTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayFeedback = recentFeedback.filter(f => 
        f.timestamp.toISOString().split('T')[0] === dateStr
      );
      
      const dayRatedFeedback = dayFeedback.filter(f => f.rating !== undefined);
      const dayAvgRating = dayRatedFeedback.length > 0
        ? dayRatedFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / dayRatedFeedback.length
        : 0;

      feedbackTrend.push({
        date: dateStr,
        count: dayFeedback.length,
        avgRating: dayAvgRating
      });
    }

    // Top issues
    const issueCounts: Record<string, { count: number; priority: string }> = {};
    recentFeedback.forEach(f => {
      if (f.type === 'bug' || f.type === 'improvement') {
        const key = f.title;
        if (!issueCounts[key]) {
          issueCounts[key] = { count: 0, priority: f.priority };
        }
        issueCounts[key].count++;
      }
    });

    const topIssues = Object.entries(issueCounts)
      .map(([title, data]) => ({ title, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Resolution rate
    const resolvedFeedback = recentFeedback.filter(f => f.status === 'resolved' || f.status === 'closed');
    const resolutionRate = recentFeedback.length > 0 
      ? (resolvedFeedback.length / recentFeedback.length) * 100 
      : 0;

    // Average response time (mock calculation)
    const responseTime = 24; // hours (mock value)

    return {
      totalFeedback: recentFeedback.length,
      feedbackByType,
      feedbackByCategory,
      averageRating,
      feedbackTrend,
      topIssues,
      resolutionRate,
      responseTime
    };
  }

  /**
   * Export feedback data
   */
  exportFeedback(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify({
        feedback: this.feedback,
        responses: this.responses,
        analytics: this.getAnalytics(),
        exportedAt: new Date().toISOString()
      }, null, 2);
    } else {
      // CSV format
      const headers = ['ID', 'Type', 'Category', 'Title', 'Description', 'Rating', 'Priority', 'Status', 'Timestamp', 'Page', 'User Agent'];
      const rows = this.feedback.map(f => [
        f.id,
        f.type,
        f.category,
        f.title,
        f.description,
        f.rating || '',
        f.priority,
        f.status,
        f.timestamp.toISOString(),
        f.metadata.page,
        f.userAgent
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
  }

  /**
   * Generate feedback report
   */
  generateReport(): string {
    const analytics = this.getAnalytics();
    const report = `
# User Feedback Report
Generated: ${new Date().toLocaleString()}

## Summary
- Total Feedback: ${analytics.totalFeedback}
- Average Rating: ${analytics.averageRating.toFixed(2)}/5
- Resolution Rate: ${analytics.resolutionRate.toFixed(1)}%
- Average Response Time: ${analytics.responseTime} hours

## Feedback by Type
${Object.entries(analytics.feedbackByType)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join('\n')}

## Feedback by Category
${Object.entries(analytics.feedbackByCategory)
  .map(([category, count]) => `- ${category}: ${count}`)
  .join('\n')}

## Top Issues
${analytics.topIssues
  .map((issue, index) => `${index + 1}. ${issue.title} (${issue.count} reports, ${issue.priority} priority)`)
  .join('\n')}

## Recent Trend (Last 7 Days)
${analytics.feedbackTrend
  .map(day => `${day.date}: ${day.count} feedback, avg rating ${day.avgRating.toFixed(2)}`)
  .join('\n')}
    `.trim();

    return report;
  }

  /**
   * Private helper methods
   */
  private generateId(): string {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        feedback: this.feedback,
        responses: this.responses
      }));
    } catch (error) {
      console.warn('Failed to save feedback to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.feedback = (data.feedback || []).map((f: any) => ({
          ...f,
          timestamp: new Date(f.timestamp)
        }));
        this.responses = (data.responses || []).map((r: any) => ({
          ...r,
          timestamp: new Date(r.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Failed to load feedback from storage:', error);
    }
  }

  private async sendToBackend(feedback: UserFeedback): Promise<void> {
    // Mock backend integration - replace with actual API call
    console.log('Sending feedback to backend:', feedback);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, this would be:
    // await fetch('/api/feedback', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(feedback)
    // });
  }
}

// Export singleton instance
export const userFeedbackService = new UserFeedbackService();

// Export types for use in components
export type { UserFeedback, FeedbackAnalytics, FeedbackResponse };
