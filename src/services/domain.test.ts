import { describe, it, expect, beforeEach } from 'vitest';
import { getDb } from '@/lib/db';
import { can, assertCan, getActiveMembership } from './policy';
import { 
  createInvitation, 
  acceptInvitation, 
  revokeMembership, 
  listCareMembers 
} from './invitations';
import { 
  addMedication, 
  generateDoseOccurrences, 
  listMedications,
  updateMedicationStatus 
} from './medications';
import { 
  recordDoseEvent, 
  evaluateGracePeriodOccurrences, 
  getDailyOccurrences 
} from './dose-ledger';
import { 
  createAppointment, 
  listAppointments, 
  updateAppointmentStatus 
} from './appointments';
import { 
  renderNotificationEmail, 
  processNotificationOutbox, 
  listNotificationOutbox 
} from './notifications';
import { getCareTimeline } from './timeline';
import { generateId } from '@/lib/crypto';
import { User } from '@/types';

describe('Domain Services & Security Enforcement', () => {
  const profileId = 'prof_meera';
  const ownerId = 'usr_meera';
  const managerId = 'usr_arjun';
  const caretakerId = 'usr_sunita';
  const readOnlyId = 'usr_nisha';

  describe('1. RBAC Policy & Object-Level Authorization', () => {
    it('verifies owner has full permissions', () => {
      expect(can(ownerId, 'view_profile', profileId)).toBe(true);
      expect(can(ownerId, 'manage_medications', profileId)).toBe(true);
      expect(can(ownerId, 'record_dose', profileId)).toBe(true);
      expect(can(ownerId, 'manage_members', profileId)).toBe(true);
      expect(can(ownerId, 'manage_appointments', profileId)).toBe(true);
    });

    it('verifies caretaker can record doses but cannot edit medications or manage members', () => {
      expect(can(caretakerId, 'record_dose', profileId)).toBe(true);
      expect(can(caretakerId, 'view_medications', profileId)).toBe(true);
      expect(can(caretakerId, 'manage_medications', profileId)).toBe(false);
      expect(can(caretakerId, 'manage_members', profileId)).toBe(false);
      expect(can(caretakerId, 'manage_appointments', profileId)).toBe(false);
    });

    it('verifies read-only member cannot mutate medications, doses, or appointments', () => {
      expect(can(readOnlyId, 'view_profile', profileId)).toBe(true);
      expect(can(readOnlyId, 'view_medications', profileId)).toBe(true);
      expect(can(readOnlyId, 'record_dose', profileId)).toBe(false);
      expect(can(readOnlyId, 'manage_medications', profileId)).toBe(false);
      expect(can(readOnlyId, 'manage_appointments', profileId)).toBe(false);
    });

    it('denies access to non-members (Cross-profile / IDOR protection)', () => {
      const outsiderId = 'usr_dev'; // Dev is an independent user, not a member of Meera's profile
      expect(can(outsiderId, 'view_profile', profileId)).toBe(false);
      expect(can(outsiderId, 'view_medications', profileId)).toBe(false);
      expect(() => assertCan(outsiderId, 'view_medications', profileId)).toThrow(/Forbidden/);
    });
  });

  describe('2. Passcode-Based Scoped Care Circle Invitations', () => {
    it('generates a one-time expiring invitation with attempt limit', () => {
      const result = createInvitation(
        profileId,
        ownerId,
        'newhelper@example.com',
        'caretaker'
      );

      expect(result.plaintextCode).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
      expect(result.inviteeEmail).toBe('newhelper@example.com');
      expect(new Date(result.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });

    it('rejects invitation creation if inviter lacks manage_members permission', () => {
      expect(() => {
        createInvitation(profileId, caretakerId, 'unauthorized@example.com', 'caretaker');
      }).toThrow(/Forbidden/);
    });

    it('atomically accepts valid invitation and prevents double-consumption / replay', () => {
      const uniqueSuffix = generateId().slice(0, 8);
      const invitee: User = {
        id: generateId(),
        email: `nurse_${uniqueSuffix}@example.com`,
        display_name: 'Pooja Nurse',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Add user to DB first
      const db = getDb();
      db.prepare(`
        INSERT INTO users (id, email, display_name, password_hash, status, created_at, updated_at)
        VALUES (?, ?, ?, 'hash', 'active', ?, ?)
      `).run(invitee.id, invitee.email, invitee.display_name, invitee.created_at, invitee.updated_at);

      // Create invite
      const invite = createInvitation(profileId, ownerId, invitee.email, 'caretaker');

      // First acceptance must succeed
      const acceptResult = acceptInvitation(profileId, invite.plaintextCode, invitee);
      expect(acceptResult.success).toBe(true);

      // Caretaker membership is now active
      expect(can(invitee.id, 'record_dose', profileId)).toBe(true);
      expect(can(invitee.id, 'manage_medications', profileId)).toBe(false);

      // Second acceptance of the SAME code must fail (single-use token)
      expect(() => {
        acceptInvitation(profileId, invite.plaintextCode, invitee);
      }).toThrow(/no longer active/);
    });

    it('rejects invitation acceptance when bound email does not match', () => {
      const invite = createInvitation(profileId, ownerId, 'intended@example.com', 'read_only');
      const impostor: User = {
        id: generateId(),
        email: 'impostor@example.com',
        display_name: 'Impostor',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(() => {
        acceptInvitation(profileId, invite.plaintextCode, impostor);
      }).toThrow(/Invalid invitation code or code not intended for your email/);
    });
  });

  describe('3. Medication Scheduling & Timezone Recurrence Engine', () => {
    it('generates daily occurrences deterministically and idempotently', () => {
      const schedule = {
        id: 'test_ver_1',
        medication_id: 'med_test_1',
        profile_id: profileId,
        version_number: 1,
        frequency_type: 'daily' as const,
        local_times: ['08:00', '20:00'],
        timezone: 'Asia/Kolkata',
        start_local_date: '2026-11-15',
        end_local_date: '2026-11-16',
        grace_period_minutes: 45,
        entered_by_user_id: ownerId,
        confirmed_by_user_id: ownerId,
        confirmed_at: new Date().toISOString(),
        effective_from: '2026-11-15',
        created_at: new Date().toISOString(),
      };

      const occurrences = generateDoseOccurrences(schedule, '2026-11-15', '2026-11-16');
      // 2 days * 2 times per day = 4 occurrences
      expect(occurrences.length).toBe(4);
      expect(occurrences[0].scheduled_local_time).toBe('08:00');
      expect(occurrences[1].scheduled_local_time).toBe('20:00');
      expect(occurrences[0].scheduled_at_utc).toContain('2026-11-15T02:30:00.000Z'); // 8:00 AM IST is 2:30 AM UTC
    });

    it('requires explicit prescription confirmation before activating a medication (Safety rule)', () => {
      expect(() => {
        addMedication({
          profileId,
          userId: ownerId,
          displayName: 'Paracetamol',
          strengthText: '650 mg',
          frequencyType: 'daily',
          localTimes: ['14:00'],
          startDate: '2026-11-15',
          confirmedPrescription: false, // Fails clinical safety requirement
        });
      }).toThrow(/Clinical Safety Requirement/);
    });

    it('successfully adds medication when confirmed by authorized manager', () => {
      const med = addMedication({
        profileId,
        userId: managerId, // Arjun has manage_medications permission
        displayName: 'Pantoprazole',
        strengthText: '40 mg',
        doseAmount: '1',
        doseUnit: 'tablet',
        route: 'oral',
        sourceNote: 'Dr. Kulkarni prescription for acidity control',
        frequencyType: 'daily',
        localTimes: ['07:30'],
        startDate: '2026-11-15',
        confirmedPrescription: true,
      });

      expect(med.id).toBeDefined();
      expect(med.display_name).toBe('Pantoprazole');
      expect(med.status).toBe('active');
    });
  });

  describe('4. Dose Ledger & Adherence State Machine', () => {
    it('records user-reported Taken status with actor attribution', () => {
      const occurrences = getDailyOccurrences(profileId, ownerId);
      expect(occurrences.length).toBeGreaterThan(0);
      const targetOcc = occurrences.find(o => o.status === 'scheduled') || occurrences[0];

      const result = recordDoseEvent({
        occurrenceId: targetOcc.id,
        profileId,
        userId: caretakerId, // Sunita recorded it
        eventType: 'reported_taken',
        source: 'caretaker',
        note: 'Administered with warm water after breakfast',
      });

      expect(result.event.event_type).toBe('reported_taken');
      expect(result.event.source).toBe('caretaker');
      expect(result.occurrence.status).toBe('reported_taken');
    });

    it('enforces idempotency and prevents duplicate events for same idempotency key', () => {
      const occurrences = getDailyOccurrences(profileId, ownerId);
      const targetOcc = occurrences[0];
      const stableKey = `idempotent_test_key_${generateId()}`;

      recordDoseEvent({
        occurrenceId: targetOcc.id,
        profileId,
        userId: ownerId,
        eventType: 'reported_taken',
        source: 'older_adult',
        idempotencyKey: stableKey,
      });

      // Repeating with the same key throws SQLite constraint violation
      expect(() => {
        recordDoseEvent({
          occurrenceId: targetOcc.id,
          profileId,
          userId: ownerId,
          eventType: 'reported_taken',
          source: 'older_adult',
          idempotencyKey: stableKey,
        });
      }).toThrow();
    });

    it('transitions overdue occurrences past grace to unconfirmed_after_grace (Never auto-skipped)', () => {
      const db = getDb();
      // Insert an artificial occurrence with an expired grace deadline in the past
      const uniqueOccKey = `overdue_key_${generateId().slice(0, 8)}`;
      const pastOccId = `occ_overdue_test_${generateId()}`;
      const pastScheduledUtc = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
      const pastGraceUtc = new Date(Date.now() - 1800000).toISOString(); // 30 min ago

      db.prepare(`
        INSERT INTO dose_occurrences (
          id, profile_id, medication_id, schedule_version_id, local_occurrence_key,
          scheduled_local_date, scheduled_local_time, timezone, scheduled_at_utc,
          grace_deadline_at_utc, status, created_at, updated_at
        ) VALUES (?, ?, 'med_metformin', 'ver_med_metformin', ?, '2026-11-15', '06:00', 'Asia/Kolkata', ?, ?, 'scheduled', datetime('now'), datetime('now'))
      `).run(pastOccId, profileId, uniqueOccKey, pastScheduledUtc, pastGraceUtc);

      // Run grace period evaluator
      const transitioned = evaluateGracePeriodOccurrences(profileId);
      expect(transitioned).toBeGreaterThanOrEqual(1);

      const check = db.prepare('SELECT status FROM dose_occurrences WHERE id = ?').get(pastOccId) as any;
      expect(check.status).toBe('unconfirmed_after_grace'); // NOT 'reported_skipped', NOT 'reported_taken'!
    });
  });

  describe('5. Privacy-Preserving Notifications & Dev Outbox Sink', () => {
    it('strictly omits medication names and dosages from email subjects and previews (FR-027)', () => {
      const sampleItem = {
        id: 'outbox_1',
        profile_id: profileId,
        recipient_user_id: managerId,
        notification_type: 'upcoming_dose' as const,
        business_event_id: 'evt_1',
        dedupe_key: 'dedupe_1',
        template_key: 'tpl_upcoming_dose',
        status: 'queued' as const,
        scheduled_for_utc: new Date().toISOString(),
        attempt_count: 0,
        max_attempts: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const email = renderNotificationEmail(sampleItem, 'Arjun Sharma', 'arjun@example.com');
      expect(email.subject).toBe('Upcoming Medication Reminder — KaljiHome');
      expect(email.subject).not.toContain('Metformin');
      expect(email.subject).not.toContain('500 mg');
      expect(email.bodyText).toContain('KaljiHome');
      expect(email.bodyText).toContain('Sign in to your secure care dashboard');
    });

    it('dispatches queued items through development email sink', async () => {
      const result = await processNotificationOutbox();
      expect(result).toHaveProperty('processed');
      expect(result).toHaveProperty('succeeded');
      expect(result).toHaveProperty('failed');
    });
  });

  describe('6. Shared Care Activity Timeline', () => {
    it('returns chronological activity with actor names and descriptions', () => {
      const timeline = getCareTimeline(profileId, ownerId);
      expect(timeline.length).toBeGreaterThan(0);
      expect(timeline[0]).toHaveProperty('actorName');
      expect(timeline[0]).toHaveProperty('description');
      expect(timeline[0]).toHaveProperty('timestamp');
    });
  });
});
