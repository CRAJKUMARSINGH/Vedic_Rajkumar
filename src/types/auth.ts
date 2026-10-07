/**
 * Authentication and RBAC Types
 * Week 4: Organization and Role-Based Access Control
 */

export type OrganizationTier = 'individual' | 'family' | 'practitioner' | 'enterprise';

export interface Organization {
  id: string;
  name: string;
  tier: OrganizationTier;
  maxProfiles: number;
  maxConsultations: number;
  settings?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type RoleType = 'owner' | 'admin' | 'astrologer' | 'client' | 'viewer';

export interface UserRole {
  id: string;
  userId: string;
  orgId: string;
  role: RoleType;
  permissions: string[];
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId?: string;
  orgId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}
