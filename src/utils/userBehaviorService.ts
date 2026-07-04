/**
 * User Behavior Analysis Service
 * Week 27 - Wednesday Implementation
 * Heatmaps, session tracking, A/B testing
 */

export interface ClickEvent {
  x: number;
  y: number;
  element: string;
  page: string;
  timestamp: number;
}

export interface ScrollEvent {
  depth: number;       // 0-100 percentage
  page: string;
  timestamp: number;
}

export interface SessionData {
  id: string;
  startTime: number;
  endTime?: number;
  pages: string[];
  clicks: ClickEvent[];
  scrollDepths: ScrollEvent[];
  features: string[];
  language: 'en' | 'hi';
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

export interface ABTest {
  id: string;
  name: string;
  variant: 'A' | 'B';
  startTime: number;
}

class UserBehaviorService {
  private session: SessionData;
  private abTests: Map<string, ABTest> = new Map();
  private maxClicks = 500;   // cap to avoid memory bloat
  private maxScrolls = 200;

  constructor() {
    this.session = this.createSession();
    this.attachListeners();
  }

  // ─── Session ────────────────────────────────────────────────────────────────

  private createSession(): SessionData {
    const w = window.innerWidth;
    return {
      id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      startTime: Date.now(),
      pages: [window.location.pathname],
      clicks: [],
      scrollDepths: [],
      features: [],
      language: (localStorage.getItem('language') as 'en' | 'hi') || 'en',
      deviceType: w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop'
    };
  }

  trackPageVisit(path: string): void {
    if (!this.session.pages.includes(path)) {
      this.session.pages.push(path);
    }
  }

  trackFeatureUse(featureName: string): void {
    if (!this.session.features.includes(featureName)) {
      this.session.features.push(featureName);
    }
  }

  getSession(): SessionData {
    return { ...this.session };
  }

  getSessionDuration(): number {
    return Date.now() - this.session.startTime;
  }

  // ─── Click Heatmap ──────────────────────────────────────────────────────────

  private attachListeners(): void {
    document.addEventListener('click', this.handleClick.bind(this), { passive: true });
    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
  }

  private handleClick(e: MouseEvent): void {
    if (this.session.clicks.length >= this.maxClicks) return;

    const target = e.target as HTMLElement;
    this.session.clicks.push({
      x: Math.round((e.clientX / window.innerWidth) * 100),
      y: Math.round((e.clientY / window.innerHeight) * 100),
      element: target.tagName.toLowerCase() + (target.className ? `.${target.className.split(' ')[0]}` : ''),
      page: window.location.pathname,
      timestamp: Date.now()
    });
  }

  private handleScroll(): void {
    if (this.session.scrollDepths.length >= this.maxScrolls) return;

    const scrolled = window.scrollY + window.innerHeight;
    const total = document.documentElement.scrollHeight;
    const depth = Math.round((scrolled / total) * 100);

    const last = this.session.scrollDepths[this.session.scrollDepths.length - 1];
    if (!last || depth > last.depth) {
      this.session.scrollDepths.push({
        depth,
        page: window.location.pathname,
        timestamp: Date.now()
      });
    }
  }

  getHeatmapData(page?: string): ClickEvent[] {
    return page
      ? this.session.clicks.filter(c => c.page === page)
      : this.session.clicks;
  }

  getMaxScrollDepth(page?: string): number {
    const depths = page
      ? this.session.scrollDepths.filter(s => s.page === page)
      : this.session.scrollDepths;
    return depths.length ? Math.max(...depths.map(s => s.depth)) : 0;
  }

  // ─── A/B Testing ────────────────────────────────────────────────────────────

  getABVariant(testId: string, testName: string): 'A' | 'B' {
    if (this.abTests.has(testId)) {
      return this.abTests.get(testId)!.variant;
    }

    // Deterministic split based on session id
    const hash = this.session.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const variant: 'A' | 'B' = hash % 2 === 0 ? 'A' : 'B';

    this.abTests.set(testId, { id: testId, name: testName, variant, startTime: Date.now() });
    return variant;
  }

  trackABConversion(testId: string): void {
    const test = this.abTests.get(testId);
    if (!test) return;
    // In production this would send to analytics backend
    console.debug(`A/B conversion: ${test.name} variant ${test.variant}`);
  }

  // ─── Feedback ───────────────────────────────────────────────────────────────

  submitFeedback(rating: number, comment: string, page: string): void {
    const feedback = {
      sessionId: this.session.id,
      rating,
      comment,
      page,
      timestamp: Date.now(),
      deviceType: this.session.deviceType,
      language: this.session.language
    };

    // Store locally (in production: send to backend)
    const existing = JSON.parse(localStorage.getItem('user_feedback') || '[]');
    existing.push(feedback);
    // Keep last 50 entries
    localStorage.setItem('user_feedback', JSON.stringify(existing.slice(-50)));
  }

  getFeedback(): any[] {
    return JSON.parse(localStorage.getItem('user_feedback') || '[]');
  }

  // ─── Summary ────────────────────────────────────────────────────────────────

  getSummary() {
    return {
      sessionId: this.session.id,
      duration: this.getSessionDuration(),
      pagesVisited: this.session.pages.length,
      featuresUsed: this.session.features.length,
      totalClicks: this.session.clicks.length,
      maxScrollDepth: this.getMaxScrollDepth(),
      deviceType: this.session.deviceType,
      language: this.session.language
    };
  }
}

export const userBehavior = new UserBehaviorService();
export default userBehavior;