import { useUser } from '@clerk/react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Permission, UserRole, ROLE_DEFINITIONS } from '../roles/config';

export interface UserOrgRole {
  org_id: string;
  role: UserRole;
  permissions: Permission[];
}

export const useUserRole = (orgId?: string) => {
  const { user } = useUser();

  return useQuery({
    queryKey: ['userRole', user?.id, orgId],
    queryFn: async (): Promise<UserOrgRole | null> => {
      if (!user) return null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from('user_roles')
        .select('org_id, role, permissions')
        .eq('user_id', user.id);

      if (orgId) {
        query = query.eq('org_id', orgId);
      }

      const { data, error } = await query.single();
      if (error || !data) return null;
      return data as unknown as UserOrgRole;
    },
    enabled: !!user,
  });
};

export const useHasPermission = (
  permission: Permission,
  orgId?: string
): boolean => {
  const { data: userRole } = useUserRole(orgId);

  if (!userRole) return false;

  const roleDef = ROLE_DEFINITIONS[userRole.role];
  if (!roleDef) return false;

  // Check wildcard permissions
  if (roleDef.permissions.includes('*')) return true;
  if (roleDef.permissions.includes(permission)) return true;

  // Check wildcard for resource type
  const resourceType = permission.split(':')[0];
  if (roleDef.permissions.includes(`${resourceType}:*` as Permission)) return true;

  return false;
};

export const useIsAdmin = (orgId?: string): boolean => {
  const { data: userRole } = useUserRole(orgId);
  if (!userRole) return false;
  return ROLE_DEFINITIONS[userRole.role]?.isAdmin ?? false;
};
