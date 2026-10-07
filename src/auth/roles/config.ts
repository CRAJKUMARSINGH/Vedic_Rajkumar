export type UserRole = 'owner' | 'admin' | 'astrologer' | 'client' | 'viewer';

export type Permission =
  | 'charts:read'
  | 'charts:create'
  | 'charts:update'
  | 'charts:delete'
  | 'charts:export'
  | 'profiles:read'
  | 'profiles:manage'
  | 'consultations:read'
  | 'consultations:create'
  | 'consultations:update'
  | 'org:manage'
  | 'org:invite'
  | 'org:delete'
  | 'billing:manage'
  | 'audit:read'
  | '*'
  | 'charts:*'
  | 'profiles:*'
  | 'consultations:*';

export interface RoleDefinition {
  name: UserRole;
  displayName: string;
  description: string;
  permissions: Permission[];
  canInvite: boolean;
  canManageBilling: boolean;
  isAdmin: boolean;
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  owner: {
    name: 'owner',
    displayName: 'Owner',
    description: 'Full control of the organization',
    permissions: ['*'], // All permissions
    canInvite: true,
    canManageBilling: true,
    isAdmin: true,
  },
  admin: {
    name: 'admin',
    displayName: 'Admin',
    description: 'Can manage users and settings',
    permissions: [
      'charts:*',
      'profiles:*',
      'consultations:*',
      'org:manage',
      'org:invite',
      'billing:manage',
      'audit:read',
    ],
    canInvite: true,
    canManageBilling: true,
    isAdmin: true,
  },
  astrologer: {
    name: 'astrologer',
    displayName: 'Astrologer',
    description: 'Can create charts and consultations',
    permissions: [
      'charts:read',
      'charts:create',
      'charts:update',
      'charts:export',
      'profiles:read',
      'consultations:read',
      'consultations:create',
      'consultations:update',
    ],
    canInvite: false,
    canManageBilling: false,
    isAdmin: false,
  },
  client: {
    name: 'client',
    displayName: 'Client',
    description: 'Can view own charts and consultations',
    permissions: [
      'charts:read',
      'charts:export',
      'consultations:read',
    ],
    canInvite: false,
    canManageBilling: false,
    isAdmin: false,
  },
  viewer: {
    name: 'viewer',
    displayName: 'Viewer',
    description: 'Read-only access',
    permissions: [
      'charts:read',
      'consultations:read',
    ],
    canInvite: false,
    canManageBilling: false,
    isAdmin: false,
  },
};
