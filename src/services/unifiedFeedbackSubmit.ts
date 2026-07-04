/**
 * Single submission path for in-app feedback: writes to userFeedbackService (primary)
 * and mirrors to feedbackService so FeedbackDashboard / feedbackAnalysisService stay in sync.
 */

import { feedbackService, type FeedbackCategory, type FeedbackPriority, type FeedbackType } from './feedbackService';
import { userFeedbackService, type UserFeedback } from './userFeedbackService';

function mapLegacyTypeToUser(t: FeedbackType): UserFeedback['type'] {
  switch (t) {
    case 'feature_request':
      return 'feature';
    case 'bug':
      return 'bug';
    case 'improvement':
      return 'improvement';
    case 'complaint':
    case 'praise':
      return 'general';
    default:
      return 'general';
  }
}

function mapLegacyCategoryToUser(c: FeedbackCategory): UserFeedback['category'] {
  switch (c) {
    case 'ui_ux':
      return 'ui';
    case 'content':
      return 'documentation';
    case 'accuracy':
    case 'performance':
    case 'features':
    case 'other':
      return c;
    default:
      return 'other';
  }
}

/** Floating widget: one user action → both stores (legacy analytics + user feedback UI). */
export async function submitFloatingFeedbackDual(params: {
  type: FeedbackType;
  category: FeedbackCategory;
  title: string;
  description: string;
  rating?: number;
  userEmail?: string;
  priority: FeedbackPriority;
  page: string;
}): Promise<void> {
  await userFeedbackService.submitFeedback({
    type: mapLegacyTypeToUser(params.type),
    category: mapLegacyCategoryToUser(params.category),
    title: params.title,
    description: params.description,
    rating: params.rating,
    priority: params.priority,
    status: 'pending',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    sessionId: typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('sessionId') || 'anonymous' : 'anonymous',
    tags: params.userEmail ? [`email:${params.userEmail}`] : [],
  });

  feedbackService.submitFeedback({
    type: params.type,
    category: params.category,
    title: params.title,
    description: params.description,
    rating: params.rating,
    userEmail: params.userEmail,
    priority: params.priority,
    page: params.page,
  });
}

/** Full-page user widget already saves to userFeedbackService; mirror one row into legacy store for analysis dashboards. */
export function mirrorUserFeedbackToLegacy(u: UserFeedback): void {
  const type: FeedbackType =
    u.type === 'feature'
      ? 'feature_request'
      : u.type === 'bug'
        ? 'bug'
        : u.type === 'improvement'
          ? 'improvement'
          : 'general';

  const category: FeedbackCategory =
    u.category === 'ui'
      ? 'ui_ux'
      : u.category === 'documentation'
        ? 'content'
        : u.category === 'performance'
          ? 'performance'
          : u.category === 'accuracy'
            ? 'accuracy'
            : u.category === 'features'
              ? 'features'
              : 'other';

  feedbackService.submitFeedback({
    type,
    category,
    title: u.title,
    description:
      u.type === 'rating' && u.rating
        ? `${u.description}\n\n[Rating: ${u.rating}/5]`
        : u.description,
    rating: u.rating,
    priority: u.priority,
    page: u.metadata.page,
    metadata: { source: 'user-feedback-widget', userFeedbackId: u.id },
  });
}
