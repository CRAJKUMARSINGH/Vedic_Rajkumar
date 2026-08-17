/**
 * Core domain types for the Matchmaking (Kundli Milan) feature.
 */

import type { BirthData } from '@/features/kundli/types';

export interface CompatibilityInput {
  person1: BirthData;
  person2: BirthData;
}

export interface GunaDetail {
  /** Name of the kuta (e.g. "Varna", "Vashya", "Tara") */
  kuta: string;
  /** Maximum possible points */
  maxPoints: number;
  /** Points scored */
  scored: number;
  /** Whether this kuta has a dosha */
  hasDosha: boolean;
  description?: string;
}

export interface GunaMilanResult {
  totalPoints: number;
  maxPoints: 36;
  details: GunaDetail[];
  /** Whether Nadi dosha is present */
  nadiDosha: boolean;
  /** Whether Bhakoot dosha is present */
  bhakootDosha: boolean;
  /** Whether Gana dosha is present */
  ganaDosha: boolean;
}

export interface CompatibilityResult {
  input: CompatibilityInput;
  gunaMilan: GunaMilanResult;
  /** Overall compatibility verdict */
  verdict: 'excellent' | 'good' | 'average' | 'needs-remedies' | 'not-recommended';
  summary: string;
  calculatedAt: string;
}
