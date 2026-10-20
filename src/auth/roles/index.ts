// Role definitions — extend as auth tiers are implemented
export type UserRole = 'anonymous' | 'registered' | 'premium' | 'practitioner' | 'enterprise';

export const DEFAULT_ROLE: UserRole = 'anonymous';
