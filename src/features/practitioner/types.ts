/**
 * Practitioner Domain Types
 * Week 9: Consultation management, recommendations, and white-label support.
 */

export interface RichTextContent {
  html: string;
  plainText: string;
  wordCount: number;
}

export type ConsultationType = 'kundli' | 'prashna' | 'matchmaking';
export type ConsultationStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type RecommendationType = 'gemstone' | 'mantra' | 'yantra' | 'ritual' | 'timing';

export interface Recommendation {
  type: RecommendationType;
  description: string;
  /** 0.0–1.0 confidence score based on chart evidence */
  confidence: number;
  /** Mandatory liability disclaimer */
  disclaimer: string;
  /** Scriptural or classical references */
  references: string[];
}

export interface Consultation {
  id: string;
  astrologerId: string;
  clientId: string;
  type: ConsultationType;
  scheduledAt: Date;
  completedAt?: Date;
  notes: RichTextContent;
  /** Encrypted cloud storage URL for session recording */
  recordingUrl?: string;
  recommendations: Recommendation[];
  followUpDate?: Date;
  status: ConsultationStatus;
}

export interface PractitionerProfile {
  id: string;
  userId: string;
  name: string;
  businessName: string;
  certification?: string;
  logoUrl?: string;
  primaryColor?: string;
  footerText?: string;
  contactEmail?: string;
  website?: string;
  tier: 'practitioner' | 'enterprise';
}
