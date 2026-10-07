import { describe, it, expect } from 'vitest';
import { ROLE_DEFINITIONS, UserRole } from '@/auth/roles/config';

describe('RBAC Role Definitions & Permissions', () => {
  it('defines all required roles with appropriate privileges', () => {
    const roles: UserRole[] = ['owner', 'admin', 'astrologer', 'client', 'viewer'];
    roles.forEach((role) => {
      expect(ROLE_DEFINITIONS[role]).toBeDefined();
      expect(ROLE_DEFINITIONS[role].name).toBe(role);
    });
  });

  it('owner has wildcard access and admin permissions', () => {
    const owner = ROLE_DEFINITIONS.owner;
    expect(owner.isAdmin).toBe(true);
    expect(owner.canInvite).toBe(true);
    expect(owner.canManageBilling).toBe(true);
    expect(owner.permissions).toContain('*');
  });

  it('astrologer has chart and consultation permissions but no billing access', () => {
    const astrologer = ROLE_DEFINITIONS.astrologer;
    expect(astrologer.isAdmin).toBe(false);
    expect(astrologer.canManageBilling).toBe(false);
    expect(astrologer.canInvite).toBe(false);
    expect(astrologer.permissions).toContain('charts:create');
    expect(astrologer.permissions).toContain('consultations:create');
  });

  it('client and viewer have read-only or scoped access', () => {
    const client = ROLE_DEFINITIONS.client;
    expect(client.permissions).toContain('charts:read');
    expect(client.permissions).not.toContain('charts:create');

    const viewer = ROLE_DEFINITIONS.viewer;
    expect(viewer.permissions).toContain('charts:read');
    expect(viewer.permissions).not.toContain('charts:export');
  });
});
