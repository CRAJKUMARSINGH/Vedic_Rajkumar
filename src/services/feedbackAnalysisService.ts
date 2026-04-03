/**
 * Feedback Analysis Service
 * Week 28 - Tuesday Implementation
 * 
 * Features:
 * - Automatic categorization
 * - Priority scoring
 * - Sentiment analysis
 * - Trend identification
 * - Pain point detection
 * - Actionable insights
 */

import { feedbackService, type Feedback, type FeedbackType, type FeedbackCategory, type FeedbackPriority } from './feedbackService';

export interface FeedbackAnalysis {
  totalFeedback: number;
  averageRating: number;
  sentimentScore: number; // -1 to 1
  topIssues: Issue[];
  topRequests: FeatureRequest[];
  painPoints: PainPoint[];
  trends: Trend[];
  recommendations: Recommendation[];
  urgentItems: Feedback[];
}

export interface Issue {
  category: FeedbackCategory;
  count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  examples: string[];
  affectedPages: string[];
}

export interface FeatureRequest {
  title: string;
  votes: number;
  category: FeedbackCategory;
  estimatedEffort: 'small' | 'medium' | 'large';
  impact: 'low' | 'medium' | 'high';
  priority: number; // Calculated score
}

export interface PainPoint {
  area: string;
  description: string;
  frequency: number;
  impact: 'low' | 'medium' | 'high';
  suggestedFix: string;
}

export interface Trend {
  type: 'increasing' | 'decreasing' | 'stable';
  category: FeedbackCategory;
  description: string;
  dataPoints: number[];
  recommendation: string;
}

export interface Recommendation {
  priority: 'immediate' | 'short_term' | 'long_term';
  action: string;
  reason: string;
  estimatedImpact: 'low' | 'medium' | 'high';
  estimatedEffort: 'small' | 'medium' | 'large';
}

/**
 * Feedback Analysis Service Class
 */
class FeedbackAnalysisService {
  
  // ─── Main Analysis ──────────────────────────────────────────────────────────

  /**
   * Perform comprehensive feedback analysis
   */
  analyzeAllFeedback(): FeedbackAnalysis {
    const feedback = feedbackService.getAllFeedback();
    
    return {
      totalFeedback: feedback.length,
      averageRating: this.calculateAverageRating(feedback),
      sentimentScore: this.analyzeSentiment(feedback),
      topIssues: this.identifyTopIssues(feedback),
      topRequests: this.analyzeFeatureRequests(),
      painPoints: this.identifyPainPoints(feedback),
      trends: this.identifyTrends(feedback),
      recommendations: this.generateRecommendations(feedback),
      urgentItems: this.getUrgentItems(feedback)
    };
  }

  // ─── Categorization ─────────────────────────────────────────────────────────

  /**
   * Auto-categorize feedback based on content
   */
  categorizeFeedback(feedback: Feedback): FeedbackCategory {
    const text = `${feedback.title} ${feedback.description}`.toLowerCase();
    
    // UI/UX keywords
    if (this.containsKeywords(text, ['design', 'ui', 'ux', 'interface', 'layout', 'button', 'color', 'font', 'style'])) {
      return 'ui_ux';
    }
    
    // Accuracy keywords
    if (this.containsKeywords(text, ['wrong', 'incorrect', 'inaccurate', 'calculation', 'prediction', 'result', 'error'])) {
      return 'accuracy';
    }
    
    // Performance keywords
    if (this.containsKeywords(text, ['slow', 'fast', 'speed', 'loading', 'performance', 'lag', 'freeze', 'crash'])) {
      return 'performance';
    }
    
    // Features keywords
    if (this.containsKeywords(text, ['feature', 'function', 'add', 'missing', 'need', 'want', 'should'])) {
      return 'features';
    }
    
    // Content keywords
    if (this.containsKeywords(text, ['content', 'text', 'translation', 'language', 'hindi', 'english', 'description'])) {
      return 'content';
    }
    
    return 'other';
  }

  /**
   * Calculate priority score based on multiple factors
   */
  calculatePriorityScore(feedback: Feedback): number {
    let score = 0;
    
    // Type weight
    const typeWeights: Record<FeedbackType, number> = {
      bug: 40,
      complaint: 30,
      feature_request: 20,
      improvement: 15,
      general: 10,
      praise: 5
    };
    score += typeWeights[feedback.type] || 10;
    
    // Priority weight
    const priorityWeights: Record<FeedbackPriority, number> = {
      critical: 40,
      high: 30,
      medium: 20,
      low: 10
    };
    score += priorityWeights[feedback.priority] || 10;
    
    // Rating impact (low rating = higher priority)
    if (feedback.rating) {
      score += (6 - feedback.rating) * 5; // 1 star = +25, 5 stars = +5
    }
    
    // Votes (if applicable)
    if (feedback.votes) {
      score += Math.min(feedback.votes * 2, 20); // Max +20 from votes
    }
    
    // Recency (newer = slightly higher priority)
    const daysSince = (Date.now() - feedback.timestamp) / (1000 * 60 * 60 * 24);
    if (daysSince < 7) {
      score += 10; // Recent feedback gets boost
    }
    
    return Math.min(score, 100); // Cap at 100
  }

  // ─── Sentiment Analysis ─────────────────────────────────────────────────────

  /**
   * Analyze sentiment of feedback
   */
  analyzeSentiment(feedback: Feedback[]): number {
    if (feedback.length === 0) return 0;
    
    let totalSentiment = 0;
    
    feedback.forEach(f => {
      const text = `${f.title} ${f.description}`.toLowerCase();
      let sentiment = 0;
      
      // Positive keywords
      const positiveWords = ['great', 'excellent', 'amazing', 'love', 'perfect', 'wonderful', 'fantastic', 'good', 'nice', 'helpful', 'useful', 'easy', 'fast', 'accurate'];
      positiveWords.forEach(word => {
        if (text.includes(word)) sentiment += 0.1;
      });
      
      // Negative keywords
      const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'poor', 'worst', 'useless', 'difficult', 'hard', 'slow', 'wrong', 'broken', 'bug', 'error', 'crash'];
      negativeWords.forEach(word => {
        if (text.includes(word)) sentiment -= 0.1;
      });
      
      // Rating impact
      if (f.rating) {
        sentiment += (f.rating - 3) * 0.2; // 1 star = -0.4, 5 stars = +0.4
      }
      
      // Type impact
      if (f.type === 'praise') sentiment += 0.3;
      if (f.type === 'complaint') sentiment -= 0.3;
      if (f.type === 'bug') sentiment -= 0.2;
      
      totalSentiment += Math.max(-1, Math.min(1, sentiment)); // Clamp to [-1, 1]
    });
    
    return totalSentiment / feedback.length;
  }

  // ─── Issue Identification ───────────────────────────────────────────────────

  /**
   * Identify top issues from feedback
   */
  identifyTopIssues(feedback: Feedback[]): Issue[] {
    const bugs = feedback.filter(f => f.type === 'bug' || f.type === 'complaint');
    const issueMap = new Map<FeedbackCategory, Issue>();
    
    bugs.forEach(bug => {
      const category = bug.category;
      
      if (!issueMap.has(category)) {
        issueMap.set(category, {
          category,
          count: 0,
          severity: 'low',
          examples: [],
          affectedPages: []
        });
      }
      
      const issue = issueMap.get(category)!;
      issue.count++;
      
      if (issue.examples.length < 3) {
        issue.examples.push(bug.title);
      }
      
      if (!issue.affectedPages.includes(bug.page)) {
        issue.affectedPages.push(bug.page);
      }
      
      // Update severity based on priority
      if (bug.priority === 'critical' || bug.priority === 'high') {
        issue.severity = bug.priority;
      }
    });
    
    return Array.from(issueMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * Identify pain points from feedback patterns
   */
  identifyPainPoints(feedback: Feedback[]): PainPoint[] {
    const painPoints: PainPoint[] = [];
    
    // Analyze common complaints
    const complaints = feedback.filter(f => 
      f.type === 'complaint' || f.type === 'bug' || (f.rating && f.rating <= 2)
    );
    
    // Group by keywords
    const keywordGroups = this.groupByKeywords(complaints);
    
    Object.entries(keywordGroups).forEach(([keyword, items]) => {
      if (items.length >= 2) { // At least 2 mentions
        painPoints.push({
          area: keyword,
          description: this.summarizePainPoint(items),
          frequency: items.length,
          impact: items.length >= 5 ? 'high' : items.length >= 3 ? 'medium' : 'low',
          suggestedFix: this.suggestFix(keyword, items)
        });
      }
    });
    
    return painPoints.sort((a, b) => b.frequency - a.frequency).slice(0, 5);
  }

  // ─── Feature Request Analysis ───────────────────────────────────────────────

  /**
   * Analyze and prioritize feature requests
   */
  analyzeFeatureRequests(): FeatureRequest[] {
    const requests = feedbackService.getFeatureRequests();
    
    return requests.map(req => {
      const effort = this.estimateEffort(req.title, req.description);
      const impact = this.estimateImpact(req.votes, req.category);
      const priority = this.calculateFeaturePriority(req.votes, effort, impact);
      
      return {
        title: req.title,
        votes: req.votes,
        category: req.category,
        estimatedEffort: effort,
        impact,
        priority
      };
    }).sort((a, b) => b.priority - a.priority).slice(0, 10);
  }

  /**
   * Estimate effort for feature request
   */
  private estimateEffort(title: string, description: string): 'small' | 'medium' | 'large' {
    const text = `${title} ${description}`.toLowerCase();
    
    // Large effort keywords
    if (this.containsKeywords(text, ['system', 'integration', 'ai', 'ml', 'mobile', 'app', 'platform', 'architecture'])) {
      return 'large';
    }
    
    // Small effort keywords
    if (this.containsKeywords(text, ['button', 'color', 'text', 'label', 'icon', 'tooltip', 'minor', 'small'])) {
      return 'small';
    }
    
    return 'medium';
  }

  /**
   * Estimate impact of feature
   */
  private estimateImpact(votes: number, category: FeedbackCategory): 'low' | 'medium' | 'high' {
    // High vote count = high impact
    if (votes >= 10) return 'high';
    if (votes >= 5) return 'medium';
    
    // Core features have higher impact
    if (category === 'features' || category === 'accuracy') {
      return votes >= 3 ? 'high' : 'medium';
    }
    
    return 'low';
  }

  /**
   * Calculate feature priority score
   */
  private calculateFeaturePriority(votes: number, effort: string, impact: string): number {
    let score = votes * 10; // Base score from votes
    
    // Impact multiplier
    const impactMultiplier = { low: 1, medium: 1.5, high: 2 };
    score *= impactMultiplier[impact as keyof typeof impactMultiplier];
    
    // Effort divisor (easier = higher priority)
    const effortDivisor = { small: 1, medium: 1.5, large: 2 };
    score /= effortDivisor[effort as keyof typeof effortDivisor];
    
    return Math.round(score);
  }

  // ─── Trend Analysis ─────────────────────────────────────────────────────────

  /**
   * Identify trends in feedback over time
   */
  identifyTrends(feedback: Feedback[]): Trend[] {
    const trends: Trend[] = [];
    const categories: FeedbackCategory[] = ['ui_ux', 'accuracy', 'performance', 'features', 'content', 'other'];
    
    categories.forEach(category => {
      const categoryFeedback = feedback.filter(f => f.category === category);
      const dataPoints = this.getWeeklyDataPoints(categoryFeedback);
      
      if (dataPoints.length >= 2) {
        const trend = this.calculateTrend(dataPoints);
        trends.push({
          type: trend,
          category,
          description: this.describeTrend(category, trend, dataPoints),
          dataPoints,
          recommendation: this.getTrendRecommendation(category, trend)
        });
      }
    });
    
    return trends;
  }

  /**
   * Get weekly data points for trend analysis
   */
  private getWeeklyDataPoints(feedback: Feedback[]): number[] {
    const weeks = 4; // Last 4 weeks
    const dataPoints: number[] = [];
    const now = Date.now();
    
    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = now - (i + 1) * 7 * 24 * 60 * 60 * 1000;
      const weekEnd = now - i * 7 * 24 * 60 * 60 * 1000;
      
      const count = feedback.filter(f => 
        f.timestamp >= weekStart && f.timestamp < weekEnd
      ).length;
      
      dataPoints.push(count);
    }
    
    return dataPoints;
  }

  /**
   * Calculate trend direction
   */
  private calculateTrend(dataPoints: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (dataPoints.length < 2) return 'stable';
    
    const first = dataPoints[0];
    const last = dataPoints[dataPoints.length - 1];
    const change = ((last - first) / (first || 1)) * 100;
    
    if (change > 20) return 'increasing';
    if (change < -20) return 'decreasing';
    return 'stable';
  }

  // ─── Recommendations ────────────────────────────────────────────────────────

  /**
   * Generate actionable recommendations
   */
  generateRecommendations(feedback: Feedback[]): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Critical bugs
    const criticalBugs = feedback.filter(f => 
      f.type === 'bug' && f.priority === 'critical' && f.status === 'new'
    );
    if (criticalBugs.length > 0) {
      recommendations.push({
        priority: 'immediate',
        action: `Fix ${criticalBugs.length} critical bug(s)`,
        reason: 'Critical bugs affect core functionality',
        estimatedImpact: 'high',
        estimatedEffort: 'medium'
      });
    }
    
    // Low ratings
    const lowRatings = feedback.filter(f => f.rating && f.rating <= 2);
    if (lowRatings.length >= 5) {
      recommendations.push({
        priority: 'immediate',
        action: 'Address user satisfaction issues',
        reason: `${lowRatings.length} users gave 1-2 star ratings`,
        estimatedImpact: 'high',
        estimatedEffort: 'medium'
      });
    }
    
    // Top feature requests
    const topRequests = this.analyzeFeatureRequests().slice(0, 3);
    topRequests.forEach(req => {
      recommendations.push({
        priority: req.impact === 'high' ? 'short_term' : 'long_term',
        action: `Implement: ${req.title}`,
        reason: `${req.votes} votes, ${req.impact} impact`,
        estimatedImpact: req.impact,
        estimatedEffort: req.estimatedEffort
      });
    });
    
    // Performance issues
    const perfIssues = feedback.filter(f => f.category === 'performance');
    if (perfIssues.length >= 3) {
      recommendations.push({
        priority: 'short_term',
        action: 'Optimize performance',
        reason: `${perfIssues.length} performance-related complaints`,
        estimatedImpact: 'medium',
        estimatedEffort: 'medium'
      });
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { immediate: 0, short_term: 1, long_term: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  // ─── Helper Methods ─────────────────────────────────────────────────────────

  private containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  private calculateAverageRating(feedback: Feedback[]): number {
    const rated = feedback.filter(f => f.rating !== undefined);
    if (rated.length === 0) return 0;
    return rated.reduce((sum, f) => sum + (f.rating || 0), 0) / rated.length;
  }

  private getUrgentItems(feedback: Feedback[]): Feedback[] {
    return feedback
      .filter(f => 
        (f.priority === 'critical' || f.priority === 'high') && 
        f.status === 'new'
      )
      .sort((a, b) => this.calculatePriorityScore(b) - this.calculatePriorityScore(a))
      .slice(0, 10);
  }

  private groupByKeywords(feedback: Feedback[]): Record<string, Feedback[]> {
    const groups: Record<string, Feedback[]> = {};
    const keywords = ['slow', 'crash', 'error', 'wrong', 'missing', 'confusing', 'difficult'];
    
    keywords.forEach(keyword => {
      groups[keyword] = feedback.filter(f => 
        f.title.toLowerCase().includes(keyword) || 
        f.description.toLowerCase().includes(keyword)
      );
    });
    
    return groups;
  }

  private summarizePainPoint(items: Feedback[]): string {
    return items[0].title; // Simplified - could use more sophisticated summarization
  }

  private suggestFix(keyword: string, items: Feedback[]): string {
    const fixes: Record<string, string> = {
      slow: 'Optimize performance and reduce load times',
      crash: 'Fix stability issues and add error handling',
      error: 'Improve error messages and validation',
      wrong: 'Review and fix calculation accuracy',
      missing: 'Add requested feature or functionality',
      confusing: 'Improve UI/UX and add helpful tooltips',
      difficult: 'Simplify workflow and add guidance'
    };
    return fixes[keyword] || 'Review and address user concerns';
  }

  private describeTrend(category: FeedbackCategory, trend: string, dataPoints: number[]): string {
    const total = dataPoints.reduce((a, b) => a + b, 0);
    return `${category} feedback is ${trend} (${total} total in last 4 weeks)`;
  }

  private getTrendRecommendation(category: FeedbackCategory, trend: string): string {
    if (trend === 'increasing') {
      return `Investigate and address increasing ${category} concerns`;
    }
    if (trend === 'decreasing') {
      return `Continue current approach for ${category}`;
    }
    return `Monitor ${category} feedback for changes`;
  }
}

// Create singleton instance
export const feedbackAnalysisService = new FeedbackAnalysisService();

export default feedbackAnalysisService;
