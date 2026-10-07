/**
 * Organization Service
 * Week 4: CRUD for organizations and user_roles tables via Supabase.
 * All DB access goes through this service — no direct Supabase calls from components.
 */

import { supabase } from '@/integrations/supabase/client';
import type { Organization, UserRole, AuditLogEntry } from '@/types/auth';

// ─── Organizations ────────────────────────────────────────────────────────────

export interface CreateOrgInput {
  name: string;
  slug?: string;
  tier?: Organization['tier'];
  billingEmail?: string;
}

export interface UpdateOrgInput {
  name?: string;
  tier?: Organization['tier'];
  maxProfiles?: number;
  maxConsultations?: number;
  settings?: Record<string, unknown>;
  billingEmail?: string;
}

export const organizationService = {
  /**
   * Get all organizations the current user belongs to.
   */
  async getMyOrganizations(): Promise<Organization[]> {
    const { data, error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('organizations' as any)
      .select(`
        id, name, tier, max_profiles, max_consultations,
        settings, created_at, updated_at,
        user_roles!inner(user_id)
      `)
      .eq('user_roles.user_id', (await supabase.auth.getUser()).data.user?.id ?? '');

    if (error) throw new Error(error.message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map((row: any) => ({
      id: row.id,
      name: row.name,
      tier: row.tier,
      maxProfiles: row.max_profiles,
      maxConsultations: row.max_consultations,
      settings: row.settings,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  /**
   * Get a single organization by ID.
   */
  async getOrganization(orgId: string): Promise<Organization | null> {
    const { data, error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('organizations' as any)
      .select('id, name, tier, max_profiles, max_consultations, settings, created_at, updated_at')
      .eq('id', orgId)
      .single();

    if (error || !data) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = data as any;
    return {
      id: row.id,
      name: row.name,
      tier: row.tier,
      maxProfiles: row.max_profiles,
      maxConsultations: row.max_consultations,
      settings: row.settings,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  /**
   * Create a new organization. The calling user is automatically set as owner.
   */
  async createOrganization(input: CreateOrgInput): Promise<Organization> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error('Not authenticated');

    // Create the org
    const { data: orgData, error: orgError } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('organizations' as any)
      .insert({
        name: input.name,
        slug: input.slug ?? input.name.toLowerCase().replace(/\s+/g, '-'),
        tier: input.tier ?? 'individual',
        billing_email: input.billingEmail,
      })
      .select()
      .single();

    if (orgError || !orgData) throw new Error(orgError?.message ?? 'Failed to create organization');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const org = orgData as any;

    // Assign owner role
    const { error: roleError } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('user_roles' as any)
      .insert({
        user_id: userId,
        org_id: org.id,
        role: 'owner',
        permissions: [],
        accepted_at: new Date().toISOString(),
      });

    if (roleError) throw new Error(roleError.message);

    return {
      id: org.id,
      name: org.name,
      tier: org.tier,
      maxProfiles: org.max_profiles,
      maxConsultations: org.max_consultations,
      settings: org.settings,
      createdAt: org.created_at,
      updatedAt: org.updated_at,
    };
  },

  /**
   * Update organization settings. Caller must be owner or admin (enforced by RLS).
   */
  async updateOrganization(orgId: string, input: UpdateOrgInput): Promise<void> {
    const updates: Record<string, unknown> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.tier !== undefined) updates.tier = input.tier;
    if (input.maxProfiles !== undefined) updates.max_profiles = input.maxProfiles;
    if (input.maxConsultations !== undefined) updates.max_consultations = input.maxConsultations;
    if (input.settings !== undefined) updates.settings = input.settings;
    if (input.billingEmail !== undefined) updates.billing_email = input.billingEmail;
    updates.updated_at = new Date().toISOString();

    const { error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('organizations' as any)
      .update(updates)
      .eq('id', orgId);

    if (error) throw new Error(error.message);
  },

  // ─── User Roles ─────────────────────────────────────────────────────────────

  /**
   * Get all members of an organization with their roles.
   */
  async getOrgMembers(orgId: string): Promise<UserRole[]> {
    const { data, error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('user_roles' as any)
      .select('id, user_id, org_id, role, permissions, created_at')
      .eq('org_id', orgId);

    if (error) throw new Error(error.message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      orgId: row.org_id,
      role: row.role,
      permissions: row.permissions ?? [],
      createdAt: row.created_at,
    }));
  },

  /**
   * Invite a user to an organization with a given role.
   */
  async inviteMember(
    orgId: string,
    userId: string,
    role: UserRole['role']
  ): Promise<void> {
    const { data: meData } = await supabase.auth.getUser();
    const invitedBy = meData.user?.id;

    const { error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('user_roles' as any)
      .insert({
        user_id: userId,
        org_id: orgId,
        role,
        permissions: [],
        invited_by: invitedBy,
        invited_at: new Date().toISOString(),
      });

    if (error) throw new Error(error.message);
  },

  /**
   * Change a member's role within an organization.
   */
  async updateMemberRole(
    orgId: string,
    userId: string,
    newRole: UserRole['role']
  ): Promise<void> {
    const { error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('user_roles' as any)
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('org_id', orgId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  },

  /**
   * Remove a member from an organization.
   */
  async removeMember(orgId: string, userId: string): Promise<void> {
    const { error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('user_roles' as any)
      .delete()
      .eq('org_id', orgId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  },

  /**
   * Get the current user's role in a specific org.
   */
  async getMyRole(orgId: string): Promise<UserRole | null> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return null;

    const { data, error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('user_roles' as any)
      .select('id, user_id, org_id, role, permissions, created_at')
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = data as any;
    return {
      id: row.id,
      userId: row.user_id,
      orgId: row.org_id,
      role: row.role,
      permissions: row.permissions ?? [],
      createdAt: row.created_at,
    };
  },

  /**
   * Fetch recent audit log entries for an org (last N entries).
   */
  async getAuditLog(orgId: string, limit = 100): Promise<AuditLogEntry[]> {
    const { data, error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('audit_logs' as any)
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      orgId: row.org_id,
      action: row.action,
      resourceType: row.resource_type,
      resourceId: row.resource_id,
      changes: row.changes,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at,
    }));
  },
};
