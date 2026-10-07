import React, { ReactNode } from 'react';
import { useUserRole } from '@/auth/permissions/usePermission';
import { UserRole } from '@/auth/roles/config';
import { Shield, Loader2 } from 'lucide-react';

export interface RoleGateProps {
  allowedRoles: UserRole[];
  orgId?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const RoleGate: React.FC<RoleGateProps> = ({
  allowedRoles,
  orgId,
  children,
  fallback,
}) => {
  const { data: userRole, isLoading } = useUserRole(orgId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!userRole || !allowedRoles.includes(userRole.role)) {
    return (
      (fallback as React.ReactElement) || (
        <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-muted">
          <Shield className="h-8 w-8 mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            You don't have permission to access this feature.
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
};
