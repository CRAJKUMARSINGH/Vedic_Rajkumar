/**
 * useOrganization hooks
 * Week 4: React Query wrappers for all organization service calls.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/react';
import {
  organizationService,
  type CreateOrgInput,
  type UpdateOrgInput,
} from '@/services/organizationService';
import { audit } from '@/services/auditService';
import type { UserRole } from '@/types/auth';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const orgQueryKeys = {
  myOrgs: ['organizations', 'mine'] as const,
  org: (id: string) => ['organizations', id] as const,
  members: (orgId: string) => ['organizations', orgId, 'members'] as const,
  myRole: (orgId: string) => ['organizations', orgId, 'myRole'] as const,
  auditLog: (orgId: string) => ['organizations', orgId, 'audit'] as const,
};

// ─── Read hooks ───────────────────────────────────────────────────────────────

/**
 * All organizations the signed-in user belongs to.
 */
export const useMyOrganizations = () => {
  const { isSignedIn } = useUser();
  return useQuery({
    queryKey: orgQueryKeys.myOrgs,
    queryFn: () => organizationService.getMyOrganizations(),
    enabled: !!isSignedIn,
    staleTime: 1000 * 60 * 5, // 5 min
  });
};

/**
 * A single organization by ID.
 */
export const useOrganization = (orgId: string | undefined) => {
  return useQuery({
    queryKey: orgId ? orgQueryKeys.org(orgId) : ['organizations', 'none'],
    queryFn: () => organizationService.getOrganization(orgId!),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * All members (user_roles rows) for an org.
 */
export const useOrgMembers = (orgId: string | undefined) => {
  return useQuery({
    queryKey: orgId ? orgQueryKeys.members(orgId) : ['organizations', 'none', 'members'],
    queryFn: () => organizationService.getOrgMembers(orgId!),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * The signed-in user's role in a specific org.
 */
export const useMyOrgRole = (orgId: string | undefined) => {
  const { isSignedIn } = useUser();
  return useQuery({
    queryKey: orgId ? orgQueryKeys.myRole(orgId) : ['organizations', 'none', 'myRole'],
    queryFn: () => organizationService.getMyRole(orgId!),
    enabled: !!orgId && !!isSignedIn,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Audit log for an org (last 100 entries).
 */
export const useOrgAuditLog = (orgId: string | undefined, limit = 100) => {
  return useQuery({
    queryKey: orgId ? orgQueryKeys.auditLog(orgId) : ['organizations', 'none', 'audit'],
    queryFn: () => organizationService.getAuditLog(orgId!, limit),
    enabled: !!orgId,
    staleTime: 1000 * 60,
  });
};

// ─── Mutation hooks ───────────────────────────────────────────────────────────

/**
 * Create a new organization. Invalidates the myOrgs list on success.
 */
export const useCreateOrganization = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrgInput) => organizationService.createOrganization(input),
    onSuccess: async (org) => {
      await audit.log('create', 'organization', org.id);
      await qc.invalidateQueries({ queryKey: orgQueryKeys.myOrgs });
    },
  });
};

/**
 * Update an organization's settings.
 */
export const useUpdateOrganization = (orgId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateOrgInput) =>
      organizationService.updateOrganization(orgId, input),
    onSuccess: async () => {
      await audit.log('update', 'organization', orgId);
      await qc.invalidateQueries({ queryKey: orgQueryKeys.org(orgId) });
      await qc.invalidateQueries({ queryKey: orgQueryKeys.myOrgs });
    },
  });
};

/**
 * Invite a user to an org with a given role.
 */
export const useInviteMember = (orgId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole['role'] }) =>
      organizationService.inviteMember(orgId, userId, role),
    onSuccess: async (_, { userId, role }) => {
      await audit.log('invite', 'user_role', userId, {
        orgId,
        changes: { after: { role } },
      });
      await qc.invalidateQueries({ queryKey: orgQueryKeys.members(orgId) });
    },
  });
};

/**
 * Change a member's role.
 */
export const useUpdateMemberRole = (orgId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, newRole }: { userId: string; newRole: UserRole['role'] }) =>
      organizationService.updateMemberRole(orgId, userId, newRole),
    onSuccess: async (_, { userId, newRole }) => {
      await audit.logRoleChange(userId, '', newRole, orgId);
      await qc.invalidateQueries({ queryKey: orgQueryKeys.members(orgId) });
    },
  });
};

/**
 * Remove a member from an org.
 */
export const useRemoveMember = (orgId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => organizationService.removeMember(orgId, userId),
    onSuccess: async (_, userId) => {
      await audit.log('delete', 'user_role', userId, { orgId });
      await qc.invalidateQueries({ queryKey: orgQueryKeys.members(orgId) });
    },
  });
};
