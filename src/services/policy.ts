// Centralized RBAC and Object-Level Authorization Service
// Implements strict least-privilege checks per 10_SECURITY_AND_TRUST.md

import { getDb } from '@/lib/db';
import { CareMembership, MembershipPermissions } from '@/types';

export type PolicyAction = keyof MembershipPermissions;

export interface AuthContext {
  userId: string;
  email: string;
}

/**
 * Get active care membership for a given user and profile
 * Verifies profile scope and ensures membership status is 'active' (not revoked or expired)
 */
export function getActiveMembership(profileId: string, userId: string): CareMembership | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT * FROM care_memberships 
    WHERE profile_id = ? AND user_id = ? AND status = 'active'
  `).get(profileId, userId) as any;

  if (!row) return null;

  return {
    id: row.id,
    profile_id: row.profile_id,
    user_id: row.user_id,
    role: row.role,
    view_profile: Boolean(row.view_profile),
    view_medications: Boolean(row.view_medications),
    manage_medications: Boolean(row.manage_medications),
    record_dose: Boolean(row.record_dose),
    view_appointments: Boolean(row.view_appointments),
    manage_appointments: Boolean(row.manage_appointments),
    view_timeline: Boolean(row.view_timeline),
    manage_members: Boolean(row.manage_members),
    manage_preferences: Boolean(row.manage_preferences),
    status: row.status,
    granted_by_user_id: row.granted_by_user_id,
    granted_at: row.granted_at,
    revoked_by_user_id: row.revoked_by_user_id,
    revoked_at: row.revoked_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Core authorization policy gatekeeper: can(userId, action, profileId)
 * Returns true only if the user has an active membership with the exact permission.
 */
export function can(userId: string, action: PolicyAction, profileId: string): boolean {
  const membership = getActiveMembership(profileId, userId);
  if (!membership) return false;
  return Boolean(membership[action]);
}

/**
 * Assert that the user is authorized for the given action on the profile.
 * Throws a typed 403 authorization error if denied.
 */
export function assertCan(userId: string, action: PolicyAction, profileId: string): CareMembership {
  const membership = getActiveMembership(profileId, userId);
  if (!membership) {
    throw new Error(`Forbidden: User ${userId} has no active membership in profile ${profileId}`);
  }
  if (!membership[action]) {
    throw new Error(`Forbidden: User lacks '${action}' permission for profile ${profileId}`);
  }
  return membership;
}
