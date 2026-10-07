import React, { ReactNode } from 'react';
import { useHasPermission } from '@/auth/permissions/usePermission';
import { Permission } from '@/auth/roles/config';

export interface PermissionCheckProps {
  permission: Permission;
  orgId?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const PermissionCheck: React.FC<PermissionCheckProps> = ({
  permission,
  orgId,
  children,
  fallback = null,
}) => {
  const hasAccess = useHasPermission(permission, orgId);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
