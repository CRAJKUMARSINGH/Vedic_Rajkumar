/**
 * Feature flag key definitions.
 * These string values must match the flag names created in the Flagsmith dashboard.
 * The static tier gating in src/config/features.ts acts as the first gate;
 * Flagsmith provides the dynamic on/off switch for remote rollout.
 */

export const FEATURE_FLAGS = {
  // Core — always on for all tiers
  KUNDLI: 'kundli',
  PRASHNA: 'prashna',
  MATCHMAKING: 'matchmaking',
  PANCHANG: 'panchang',

  // Registered tier
  FAMILY_PROFILES: 'family_profiles',
  PDF_EXPORT: 'pdf_export',
  CHART_HISTORY: 'chart_history',
  EXPORT_DATA: 'export_data',

  // Premium tier
  DASHA_TIMELINE: 'dasha_timeline',
  TRANSIT_ALERTS: 'transit_alerts',
  ADVANCED_PDF: 'advanced_pdf',
  UNLIMITED_PDF: 'unlimited_pdf',

  // Practitioner / Enterprise
  CLIENT_CRM: 'client_crm',
  CONSULTATION_NOTES: 'consultation_notes',
  WHITE_LABEL: 'white_label',

  // Experimental
  KP_SYSTEM: 'kp_system',
  ASHTAKAVARGA_V2: 'ashtakavarga_v2',
  NEW_UI: 'new_ui',
} as const;

export type FeatureFlag = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];
