/**
 * Feedback Collection Service
 * Week 28 - Monday Implementation
 * 
 * Features:
 * - In-app feedback forms
 * - User surveys
 * - Rating system
 * - Feature request portal
 * - Bug reporting
 */

export type FeedbackType = 
  | 'general'
  | 'bug'
  | 'feature_request'
  | 'improvement'
  | 'complaint'
  | 'praise';

export type FeedbackCategory =
  | 'ui_ux'
  | 'accuracy'
  | 'performance'
  | 'features'
  | 'content'
  | 'other';

export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical';

export type FeedbackStatus = 
  | 'new'
  | 'reviewing'
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'rejected';

export interface Feedback {
  id: string;
  type: FeedbackType;
  category: FeedbackCategory;
  title: string;
  description: string;
  rating?: number; // 1-5 stars
  priority: FeedbackPriority;
  status: FeedbackStatus;
  userEmail?: string;
  userName?: string;
  page: string;
  timestamp: number;
  deviceInfo: {
    type: 'mobile' | 'tablet' | 'desktop';
    browser: string;
    os: string;
  };
  metadata?: Record<string, any>;
  votes?: number; // Community voting
  responses?: FeedbackResponse[];
}

export interface FeedbackResponse {
  id: string;
  feedbackId: string;
  message: string;
  author: string;
  timestamp: number;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  active: boolean;
  startDate: number;
  endDate: number;
  responses: number;
}

export interface SurveyQuestion {
  id: string;
  type: 'rating' | 'multiple_choice' | 'text' | 'yes_no';
  question: string;
  options?: string[];
  required: boolean;
}

export interface SurveyResponse {
  surveyId: string;
  userId?: string;
  answers: Record<string, any>;
  timestamp: number;
}

export interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  category: FeedbackCategory;
  votes: number;
  status: FeedbackStatus;
  submittedBy: string;
  timestamp: number;
  estimatedEffort?: 'small' | 'medium' | 'large';
  plannedWeek?: number;
}

/**
 * Feedback Service Class
 */
class FeedbackService {
  private storageKey = 'vedic_feedback';
  private surveyKey = 'vedic_surveys';
  private featureRequestKey = 'vedic_feature_requests';

  // ─── Feedback Collection ────────────────────────────────────────────────────

  /**
   * Submit general feedback
   */
  submitFeedback(feedback: Omit<Feedback, 'id' | 'timestamp' | 'deviceInfo' | 'status' | 'votes'>): string {
    const id = this.generateId();
    
    const completeFeedback: Feedback = {
      ...feedback,
      id,
      timestamp: Date.now(),
      status: 'new',
      votes: 0,
      deviceInfo: this.getDeviceInfo(),
      responses: []
    };

    this.saveFeedback(completeFeedback);
    
    // In production: send to backend API
    console.log('Feedback submitted:', completeFeedback);
    
    return id;
  }

  /**
   * Submit bug report
   */
  submitBugReport(
    title: string,
    description: string,
    steps: string[],
    expected: string,
    actual: string,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): string {
    return this.submitFeedback({
      type: 'bug',
      category: 'other',
      title,
      description: `${description}\n\n**Steps to Reproduce:**\n${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n**Expected:** ${expected}\n**Actual:** ${actual}`,
      priority: severity,
      page: window.location.pathname,
      metadata: {
        steps,
        expected,
        actual,
        severity
      }
    });
  }

  /**
   * Submit feature request
   */
  submitFeatureRequest(
    title: string,
    description: string,
    category: FeedbackCategory,
    userName: string = 'Anonymous'
  ): string {
    const id = this.generateId();
    
    const request: FeatureRequest = {
      id,
      title,
      description,
      category,
      votes: 1, // Auto-vote by submitter
      status: 'new',
      submittedBy: userName,
      timestamp: Date.now()
    };

    this.saveFeatureRequest(request);
    
    return id;
  }

  /**
   * Vote for feature request
   */
  voteFeatureRequest(requestId: string): boolean {
    const requests = this.getFeatureRequests();
    const request = requests.find(r => r.id === requestId);
    
    if (!request) return false;
    
    // Check if user already voted (simple localStorage check)
    const votedKey = `voted_${requestId}`;
    if (localStorage.getItem(votedKey)) {
      return false; // Already voted
    }
    
    request.votes++;
    this.updateFeatureRequest(request);
    localStorage.setItem(votedKey, 'true');
    
    return true;
  }

  // ─── Survey System ──────────────────────────────────────────────────────────

  /**
   * Get active surveys
   */
  getActiveSurveys(): Survey[] {
    const surveys = this.getSurveys();
    const now = Date.now();
    
    return surveys.filter(s => 
      s.active && 
      s.startDate <= now && 
      s.endDate >= now
    );
  }

  /**
   * Submit survey response
   */
  submitSurveyResponse(response: SurveyResponse): void {
    const surveys = this.getSurveys();
    const survey = surveys.find(s => s.id === response.surveyId);
    
    if (!survey) return;
    
    survey.responses++;
    this.updateSurvey(survey);
    
    // Save response
    const responses = this.getSurveyResponses(response.surveyId);
    responses.push(response);
    localStorage.setItem(
      `survey_responses_${response.surveyId}`,
      JSON.stringify(responses)
    );
  }

  /**
   * Create default surveys
   */
  createDefaultSurveys(): void {
    const surveys: Survey[] = [
      {
        id: 'satisfaction_2026_q1',
        title: 'User Satisfaction Survey - Q1 2026',
        description: 'Help us improve by sharing your experience',
        active: true,
        startDate: Date.now(),
        endDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        responses: 0,
        questions: [
          {
            id: 'q1',
            type: 'rating',
            question: 'How satisfied are you with Vedic Rajkumar overall?',
            required: true
          },
          {
            id: 'q2',
            type: 'rating',
            question: 'How accurate do you find the predictions?',
            required: true
          },
          {
            id: 'q3',
            type: 'rating',
            question: 'How easy is the app to use?',
            required: true
          },
          {
            id: 'q4',
            type: 'multiple_choice',
            question: 'Which feature do you use most?',
            options: [
              'Transit Analysis',
              'Kundli Milan (Compatibility)',
              'Career Astrology',
              'Muhurat Calculator',
              'Baby Names',
              'Vaastu Assessment'
            ],
            required: true
          },
          {
            id: 'q5',
            type: 'text',
            question: 'What feature would you like to see added?',
            required: false
          },
          {
            id: 'q6',
            type: 'yes_no',
            question: 'Would you recommend this app to others?',
            required: true
          }
        ]
      },
      {
        id: 'feature_priorities_2026',
        title: 'Feature Priorities Survey',
        description: 'Help us prioritize upcoming features',
        active: true,
        startDate: Date.now(),
        endDate: Date.now() + 60 * 24 * 60 * 60 * 1000, // 60 days
        responses: 0,
        questions: [
          {
            id: 'q1',
            type: 'multiple_choice',
            question: 'Which advanced feature interests you most?',
            options: [
              'Dasha System (Mahadasha/Antardasha)',
              'Divisional Charts (D9, D10)',
              'Yogas Identification',
              'Ashtakavarga System',
              'Lal Kitab Predictions',
              'KP System'
            ],
            required: true
          },
          {
            id: 'q2',
            type: 'rating',
            question: 'How important is mobile app to you?',
            required: true
          },
          {
            id: 'q3',
            type: 'rating',
            question: 'How important is AI-powered predictions?',
            required: true
          },
          {
            id: 'q4',
            type: 'yes_no',
            question: 'Would you pay for premium features?',
            required: true
          }
        ]
      }
    ];

    surveys.forEach(survey => this.saveSurvey(survey));
  }

  // ─── Rating System ──────────────────────────────────────────────────────────

  /**
   * Submit quick rating
   */
  submitQuickRating(
    rating: number,
    page: string,
    comment?: string
  ): void {
    this.submitFeedback({
      type: 'general',
      category: 'other',
      title: `Quick Rating: ${rating}/5`,
      description: comment || 'No comment provided',
      rating,
      priority: 'low',
      page
    });
  }

  /**
   * Get average rating
   */
  getAverageRating(): number {
    const feedback = this.getAllFeedback();
    const rated = feedback.filter(f => f.rating !== undefined);
    
    if (rated.length === 0) return 0;
    
    const sum = rated.reduce((acc, f) => acc + (f.rating || 0), 0);
    return sum / rated.length;
  }

  // ─── Data Retrieval ─────────────────────────────────────────────────────────

  /**
   * Get all feedback
   */
  getAllFeedback(): Feedback[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Get feedback by type
   */
  getFeedbackByType(type: FeedbackType): Feedback[] {
    return this.getAllFeedback().filter(f => f.type === type);
  }

  /**
   * Get feedback by status
   */
  getFeedbackByStatus(status: FeedbackStatus): Feedback[] {
    return this.getAllFeedback().filter(f => f.status === status);
  }

  /**
   * Get feature requests
   */
  getFeatureRequests(): FeatureRequest[] {
    const data = localStorage.getItem(this.featureRequestKey);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Get top feature requests
   */
  getTopFeatureRequests(limit: number = 10): FeatureRequest[] {
    return this.getFeatureRequests()
      .sort((a, b) => b.votes - a.votes)
      .slice(0, limit);
  }

  /**
   * Get surveys
   */
  getSurveys(): Survey[] {
    const data = localStorage.getItem(this.surveyKey);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Get survey responses
   */
  getSurveyResponses(surveyId: string): SurveyResponse[] {
    const data = localStorage.getItem(`survey_responses_${surveyId}`);
    return data ? JSON.parse(data) : [];
  }

  // ─── Analytics ──────────────────────────────────────────────────────────────

  /**
   * Get feedback statistics
   */
  getStatistics() {
    const feedback = this.getAllFeedback();
    const requests = this.getFeatureRequests();
    
    return {
      total: feedback.length,
      byType: {
        general: feedback.filter(f => f.type === 'general').length,
        bug: feedback.filter(f => f.type === 'bug').length,
        feature_request: feedback.filter(f => f.type === 'feature_request').length,
        improvement: feedback.filter(f => f.type === 'improvement').length,
        complaint: feedback.filter(f => f.type === 'complaint').length,
        praise: feedback.filter(f => f.type === 'praise').length
      },
      byStatus: {
        new: feedback.filter(f => f.status === 'new').length,
        reviewing: feedback.filter(f => f.status === 'reviewing').length,
        planned: feedback.filter(f => f.status === 'planned').length,
        in_progress: feedback.filter(f => f.status === 'in_progress').length,
        completed: feedback.filter(f => f.status === 'completed').length,
        rejected: feedback.filter(f => f.status === 'rejected').length
      },
      byPriority: {
        low: feedback.filter(f => f.priority === 'low').length,
        medium: feedback.filter(f => f.priority === 'medium').length,
        high: feedback.filter(f => f.priority === 'high').length,
        critical: feedback.filter(f => f.priority === 'critical').length
      },
      averageRating: this.getAverageRating(),
      featureRequests: requests.length,
      topRequests: this.getTopFeatureRequests(5)
    };
  }

  // ─── Helper Methods ─────────────────────────────────────────────────────────

  private generateId(): string {
    return `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceInfo() {
    const w = window.innerWidth;
    return {
      type: (w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop') as 'mobile' | 'tablet' | 'desktop',
      browser: this.getBrowser(),
      os: this.getOS()
    };
  }

  private getBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private saveFeedback(feedback: Feedback): void {
    const all = this.getAllFeedback();
    all.push(feedback);
    localStorage.setItem(this.storageKey, JSON.stringify(all));
  }

  private saveFeatureRequest(request: FeatureRequest): void {
    const all = this.getFeatureRequests();
    all.push(request);
    localStorage.setItem(this.featureRequestKey, JSON.stringify(all));
  }

  private updateFeatureRequest(request: FeatureRequest): void {
    const all = this.getFeatureRequests();
    const index = all.findIndex(r => r.id === request.id);
    if (index !== -1) {
      all[index] = request;
      localStorage.setItem(this.featureRequestKey, JSON.stringify(all));
    }
  }

  private saveSurvey(survey: Survey): void {
    const all = this.getSurveys();
    const index = all.findIndex(s => s.id === survey.id);
    if (index !== -1) {
      all[index] = survey;
    } else {
      all.push(survey);
    }
    localStorage.setItem(this.surveyKey, JSON.stringify(all));
  }

  private updateSurvey(survey: Survey): void {
    this.saveSurvey(survey);
  }

  /**
   * Clear all feedback (for testing)
   */
  clearAll(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.surveyKey);
    localStorage.removeItem(this.featureRequestKey);
  }
}

// Create singleton instance
export const feedbackService = new FeedbackService();

// Initialize default surveys on first load
if (typeof window !== 'undefined' && !localStorage.getItem('vedic_surveys')) {
  feedbackService.createDefaultSurveys();
}

export default feedbackService;
