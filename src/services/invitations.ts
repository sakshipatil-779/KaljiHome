// Passcode-Based Scoped Care Circle Invitation & Revocation Service
// Complies with 10_SECURITY_AND_TRUST.md and 04_USER_WORKFLOWS.md (Workflow 2 & Workflow 8)

import { getDb } from '@/lib/db';
import { generateInvitationCode, computePasscodeDigest, generateId } from '@/lib/crypto';
import { DEFAULT_ROLE_PERMISSIONS, MembershipPermissions, UserRole, User, CareMembership } from '@/types';
import { assertCan } from './policy';

export interface CreateInvitationResult {
  invitationId: string;
  plaintextCode: string; // Displayed ONCE to inviter to share; never logged or stored in plain DB
  expiresAt: string;
  inviteeEmail: string;
  role: UserRole;
}

/**
 * Create a scoped, expiring, one-time invitation passcode
 */
export function createInvitation(
  profileId: string,
  inviterUserId: string,
  inviteeEmail: string,
  role: UserRole,
  customPermissions?: Partial<MembershipPermissions>
): CreateInvitationResult {
  // Authorization: inviter must have manage_members permission
  assertCan(inviterUserId, 'manage_members', profileId);

  const db = getDb();
  const normalizedEmail = inviteeEmail.trim().toLowerCase();

  // Rate-limiting check: max 5 active pending invitations per profile per hour
  const recentPendingCount = (db.prepare(`
    SELECT count(*) as count FROM invitations 
    WHERE profile_id = ? AND status = 'pending' AND created_at > datetime('now', '-1 hour')
  `).get(profileId) as any).count;

  if (recentPendingCount >= 10) {
    throw new Error('Rate limit exceeded: Too many pending invitations created recently for this profile.');
  }

  // Revoke any prior pending invitation for this specific email/profile combo to prevent stale codes
  db.prepare(`
    UPDATE invitations 
    SET status = 'revoked', revoked_at = datetime('now')
    WHERE profile_id = ? AND invitee_email = ? AND status = 'pending'
  `).run(profileId, normalizedEmail);

  const plaintextCode = generateInvitationCode();
  const codeDigest = computePasscodeDigest(plaintextCode, profileId, normalizedEmail);
  const id = generateId();
  const now = new Date();
  // 10-minute expiry per prototype specification
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString();
  const nowIso = now.toISOString();

  const permissions: MembershipPermissions = {
    ...DEFAULT_ROLE_PERMISSIONS[role],
    ...(customPermissions || {}),
  };

  db.prepare(`
    INSERT INTO invitations (
      id, profile_id, inviter_user_id, invitee_email, role, permissions_json,
      code_digest, expires_at, max_attempts, attempt_count, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 5, 0, 'pending', ?)
  `).run(
    id,
    profileId,
    inviterUserId,
    normalizedEmail,
    role,
    JSON.stringify(permissions),
    codeDigest,
    expiresAt,
    nowIso
  );

  // Log audit event
  db.prepare(`
    INSERT INTO audit_events (id, profile_id, actor_user_id, event_type, resource_type, resource_id, metadata_json, occurred_at)
    VALUES (?, ?, ?, 'invitation_created', 'invitation', ?, ?, ?)
  `).run(
    generateId(),
    profileId,
    inviterUserId,
    id,
    JSON.stringify({ invitee_email: normalizedEmail, role }),
    nowIso
  );

  return {
    invitationId: id,
    plaintextCode,
    expiresAt,
    inviteeEmail: normalizedEmail,
    role,
  };
}

/**
 * Accept an invitation using passcode.
 * Atomic transaction verifies code digest, expiry, attempt counter, and binds to user email.
 */
export function acceptInvitation(
  profileId: string,
  plaintextCode: string,
  acceptingUser: User
): { success: boolean; membershipId: string; message: string } {
  const db = getDb();
  const normalizedEmail = acceptingUser.email.trim().toLowerCase();
  const digest = computePasscodeDigest(plaintextCode, profileId, normalizedEmail);
  const now = new Date().toISOString();

  // Run in an atomic transaction to prevent race conditions or double consumption
  const transaction = db.transaction(() => {
    // Lookup by digest and profile
    const invitation = db.prepare(`
      SELECT * FROM invitations 
      WHERE profile_id = ? AND code_digest = ?
    `).get(profileId, digest) as any;

    if (!invitation) {
      throw new Error('Invalid invitation code or code not intended for your email.');
    }

    if (invitation.status !== 'pending') {
      throw new Error(`Invitation is no longer active (status: ${invitation.status}).`);
    }

    if (invitation.attempt_count >= invitation.max_attempts) {
      db.prepare("UPDATE invitations SET status = 'expired' WHERE id = ?").run(invitation.id);
      throw new Error('Invitation code locked: Maximum verification attempts exceeded.');
    }

    if (new Date(invitation.expires_at) < new Date()) {
      db.prepare("UPDATE invitations SET status = 'expired' WHERE id = ?").run(invitation.id);
      throw new Error('Invitation code has expired (10-minute limit exceeded). Please request a new code.');
    }

    if (invitation.invitee_email.toLowerCase() !== normalizedEmail) {
      // Increment attempt count on email mismatch
      db.prepare('UPDATE invitations SET attempt_count = attempt_count + 1 WHERE id = ?').run(invitation.id);
      throw new Error('This invitation code was issued to a different email address.');
    }

    // Atomically consume the invitation
    db.prepare(`
      UPDATE invitations 
      SET status = 'accepted', accepted_at = ?, accepted_by_user_id = ?, attempt_count = attempt_count + 1
      WHERE id = ?
    `).run(now, acceptingUser.id, invitation.id);

    const permissions: MembershipPermissions = JSON.parse(invitation.permissions_json);
    const membershipId = generateId();

    // Insert or update membership
    db.prepare(`
      INSERT INTO care_memberships (
        id, profile_id, user_id, role,
        view_profile, view_medications, manage_medications, record_dose,
        view_appointments, manage_appointments, view_timeline, manage_members, manage_preferences,
        status, granted_by_user_id, granted_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)
      ON CONFLICT(profile_id, user_id) DO UPDATE SET
        role = excluded.role,
        view_profile = excluded.view_profile,
        view_medications = excluded.view_medications,
        manage_medications = excluded.manage_medications,
        record_dose = excluded.record_dose,
        view_appointments = excluded.view_appointments,
        manage_appointments = excluded.manage_appointments,
        view_timeline = excluded.view_timeline,
        manage_members = excluded.manage_members,
        manage_preferences = excluded.manage_preferences,
        status = 'active',
        granted_by_user_id = excluded.granted_by_user_id,
        granted_at = excluded.granted_at,
        revoked_at = NULL,
        revoked_by_user_id = NULL,
        updated_at = excluded.updated_at
    `).run(
      membershipId,
      profileId,
      acceptingUser.id,
      invitation.role,
      permissions.view_profile ? 1 : 0,
      permissions.view_medications ? 1 : 0,
      permissions.manage_medications ? 1 : 0,
      permissions.record_dose ? 1 : 0,
      permissions.view_appointments ? 1 : 0,
      permissions.manage_appointments ? 1 : 0,
      permissions.view_timeline ? 1 : 0,
      permissions.manage_members ? 1 : 0,
      permissions.manage_preferences ? 1 : 0,
      invitation.inviter_user_id,
      now,
      now,
      now
    );

    // Create default notification preferences if not existing
    db.prepare(`
      INSERT OR IGNORE INTO notification_preferences (
        id, profile_id, user_id, notify_upcoming_dose, notify_unconfirmed_dose,
        notify_upcoming_appointment, channel, quiet_hours_enabled, quiet_hours_start, quiet_hours_end,
        created_at, updated_at
      ) VALUES (?, ?, ?, 1, 1, 1, 'email', 0, '22:00', '07:00', ?, ?)
    `).run(generateId(), profileId, acceptingUser.id, now, now);

    // Audit log
    db.prepare(`
      INSERT INTO audit_events (id, profile_id, actor_user_id, event_type, resource_type, resource_id, metadata_json, occurred_at)
      VALUES (?, ?, ?, 'invitation_accepted', 'care_membership', ?, ?, ?)
    `).run(
      generateId(),
      profileId,
      acceptingUser.id,
      membershipId,
      JSON.stringify({ role: invitation.role, user_email: normalizedEmail }),
      now
    );

    return {
      success: true,
      membershipId,
      message: `Successfully joined care circle with role: ${invitation.role}`,
    };
  });

  return transaction();
}

/**
 * Revoke a member's access immediately.
 * In accordance with 10_SECURITY_AND_TRUST.md, revocation immediately blocks subsequent API requests.
 */
export function revokeMembership(profileId: string, targetUserId: string, revokingUserId: string) {
  // Authorization: must have manage_members permission or be the profile owner
  assertCan(revokingUserId, 'manage_members', profileId);

  const db = getDb();
  const profile = db.prepare('SELECT owner_user_id FROM elder_profiles WHERE id = ?').get(profileId) as any;
  if (profile && profile.owner_user_id === targetUserId) {
    throw new Error('Cannot revoke access for the profile owner.');
  }

  const now = new Date().toISOString();
  const result = db.prepare(`
    UPDATE care_memberships
    SET status = 'revoked', revoked_by_user_id = ?, revoked_at = ?, updated_at = ?
    WHERE profile_id = ? AND user_id = ? AND status = 'active'
  `).run(revokingUserId, now, now, profileId, targetUserId);

  if (result.changes === 0) {
    throw new Error('Active membership not found or already revoked.');
  }

  // Audit log
  db.prepare(`
    INSERT INTO audit_events (id, profile_id, actor_user_id, event_type, resource_type, resource_id, metadata_json, occurred_at)
    VALUES (?, ?, ?, 'membership_revoked', 'care_membership', ?, ?, ?)
  `).run(
    generateId(),
    profileId,
    revokingUserId,
    targetUserId,
    JSON.stringify({ revoked_user_id: targetUserId }),
    now
  );
}

/**
 * List all members of a profile's care circle
 */
export function listCareMembers(profileId: string, requestingUserId: string): CareMembership[] {
  // Authorization: must have view_profile permission
  assertCan(requestingUserId, 'view_profile', profileId);

  const db = getDb();
  const rows = db.prepare(`
    SELECT m.*, u.email as user_email, u.display_name as user_name, u.role_title as user_role_title
    FROM care_memberships m
    JOIN users u ON m.user_id = u.id
    WHERE m.profile_id = ? AND m.status = 'active'
    ORDER BY CASE m.role 
      WHEN 'owner' THEN 1 
      WHEN 'care_manager' THEN 2 
      WHEN 'caretaker' THEN 3 
      ELSE 4 END
  `).all(profileId) as any[];

  return rows.map((r) => ({
    id: r.id,
    profile_id: r.profile_id,
    user_id: r.user_id,
    role: r.role,
    view_profile: Boolean(r.view_profile),
    view_medications: Boolean(r.view_medications),
    manage_medications: Boolean(r.manage_medications),
    record_dose: Boolean(r.record_dose),
    view_appointments: Boolean(r.view_appointments),
    manage_appointments: Boolean(r.manage_appointments),
    view_timeline: Boolean(r.view_timeline),
    manage_members: Boolean(r.manage_members),
    manage_preferences: Boolean(r.manage_preferences),
    status: r.status,
    granted_by_user_id: r.granted_by_user_id,
    granted_at: r.granted_at,
    revoked_by_user_id: r.revoked_by_user_id,
    revoked_at: r.revoked_at,
    created_at: r.created_at,
    updated_at: r.updated_at,
    user: {
      id: r.user_id,
      email: r.user_email,
      display_name: r.user_name,
      role_title: r.user_role_title,
      status: 'active',
      created_at: r.created_at,
      updated_at: r.updated_at,
    },
  }));
}
