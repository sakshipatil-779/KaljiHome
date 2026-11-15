// Doctor Appointments Service
// Complies with 08_TECHNICAL_ARCHITECTURE.md, 09_DATA_MODEL.md, and Privacy Rules

import { getDb } from '@/lib/db';
import { generateId } from '@/lib/crypto';
import { Appointment, AppointmentStatus } from '@/types';
import { assertCan } from './policy';

export interface CreateAppointmentInput {
  profileId: string;
  userId: string;
  clinicianDisplayName: string;
  facilityDisplayName: string;
  locationText?: string;
  scheduledLocalDate: string; // YYYY-MM-DD
  scheduledLocalTime: string; // HH:mm
  purposeNote?: string;
  reminderOffsetsHours?: number[]; // e.g. [24, 2]
}

export function createAppointment(input: CreateAppointmentInput): Appointment {
  assertCan(input.userId, 'manage_appointments', input.profileId);

  if (!input.clinicianDisplayName.trim() || !input.facilityDisplayName.trim()) {
    throw new Error('Clinician name and clinic/facility name are required.');
  }

  const db = getDb();
  const profile = db.prepare('SELECT timezone FROM elder_profiles WHERE id = ?').get(input.profileId) as any;
  const timezone = profile?.timezone || 'Asia/Kolkata';

  const localDateTimeStr = `${input.scheduledLocalDate}T${input.scheduledLocalTime}:00+05:30`;
  const scheduledUtc = new Date(localDateTimeStr).toISOString();
  const offsets = input.reminderOffsetsHours || [24, 2];

  const apptId = generateId();
  const now = new Date().toISOString();

  const transaction = db.transaction(() => {
    db.prepare(`
      INSERT INTO appointments (
        id, profile_id, clinician_display_name, facility_display_name, location_text,
        scheduled_local_date, scheduled_local_time, timezone, scheduled_at_utc,
        purpose_note, status, reminder_offsets_hours_json, created_by_user_id, updated_by_user_id,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'upcoming', ?, ?, ?, ?, ?)
    `).run(
      apptId,
      input.profileId,
      input.clinicianDisplayName.trim(),
      input.facilityDisplayName.trim(),
      input.locationText?.trim() || null,
      input.scheduledLocalDate,
      input.scheduledLocalTime,
      timezone,
      scheduledUtc,
      input.purposeNote?.trim() || null,
      JSON.stringify(offsets),
      input.userId,
      input.userId,
      now,
      now
    );

    // Queue reminder outbox entries for active members who have appointment reminders enabled
    const eligibleMembers = db.prepare(`
      SELECT m.user_id 
      FROM care_memberships m
      JOIN notification_preferences np ON np.profile_id = m.profile_id AND np.user_id = m.user_id
      WHERE m.profile_id = ? AND m.status = 'active' AND np.notify_upcoming_appointment = 1
    `).all(input.profileId) as { user_id: string }[];

    const insertOutbox = db.prepare(`
      INSERT OR IGNORE INTO notification_outbox (
        id, profile_id, recipient_user_id, notification_type, business_event_id,
        dedupe_key, template_key, status, scheduled_for_utc, created_at, updated_at
      ) VALUES (?, ?, ?, 'upcoming_appointment', ?, ?, 'tpl_upcoming_appointment', 'queued', ?, ?, ?)
    `);

    for (const member of eligibleMembers) {
      for (const offset of offsets) {
        const scheduledSendTime = new Date(
          new Date(scheduledUtc).getTime() - offset * 60 * 60 * 1000
        ).toISOString();

        // Only queue if reminder time is in the future
        if (new Date(scheduledSendTime) > new Date()) {
          const dedupeKey = `appt_${apptId}_${offset}h_${member.user_id}`;
          insertOutbox.run(
            generateId(),
            input.profileId,
            member.user_id,
            apptId,
            dedupeKey,
            scheduledSendTime,
            now,
            now
          );
        }
      }
    }

    // Audit log
    db.prepare(`
      INSERT INTO audit_events (id, profile_id, actor_user_id, event_type, resource_type, resource_id, metadata_json, occurred_at)
      VALUES (?, ?, ?, 'appointment_created', 'appointment', ?, ?, ?)
    `).run(
      generateId(),
      input.profileId,
      input.userId,
      apptId,
      JSON.stringify({ 
        clinician: input.clinicianDisplayName, 
        facility: input.facilityDisplayName,
        date: input.scheduledLocalDate,
        time: input.scheduledLocalTime 
      }),
      now
    );

    return {
      id: apptId,
      profile_id: input.profileId,
      clinician_display_name: input.clinicianDisplayName.trim(),
      facility_display_name: input.facilityDisplayName.trim(),
      location_text: input.locationText?.trim(),
      scheduled_local_date: input.scheduledLocalDate,
      scheduled_local_time: input.scheduledLocalTime,
      timezone,
      scheduled_at_utc: scheduledUtc,
      purpose_note: input.purposeNote?.trim(),
      status: 'upcoming' as AppointmentStatus,
      reminder_offsets_hours: offsets,
      created_by_user_id: input.userId,
      updated_by_user_id: input.userId,
      created_at: now,
      updated_at: now,
    };
  });

  return transaction();
}

export function listAppointments(profileId: string, requestingUserId: string): Appointment[] {
  assertCan(requestingUserId, 'view_appointments', profileId);

  const db = getDb();
  const rows = db.prepare(`
    SELECT a.*, u.display_name as creator_name
    FROM appointments a
    LEFT JOIN users u ON a.created_by_user_id = u.id
    WHERE a.profile_id = ?
    ORDER BY a.scheduled_local_date ASC, a.scheduled_local_time ASC
  `).all(profileId) as any[];

  return rows.map((r) => ({
    id: r.id,
    profile_id: r.profile_id,
    clinician_display_name: r.clinician_display_name,
    facility_display_name: r.facility_display_name,
    location_text: r.location_text,
    scheduled_local_date: r.scheduled_local_date,
    scheduled_local_time: r.scheduled_local_time,
    timezone: r.timezone,
    scheduled_at_utc: r.scheduled_at_utc,
    purpose_note: r.purpose_note,
    status: r.status,
    reminder_offsets_hours: JSON.parse(r.reminder_offsets_hours_json || '[24, 2]'),
    created_by_user_id: r.created_by_user_id,
    updated_by_user_id: r.updated_by_user_id,
    created_at: r.created_at,
    updated_at: r.updated_at,
    creator_name: r.creator_name,
  }));
}

export function updateAppointmentStatus(
  appointmentId: string,
  profileId: string,
  userId: string,
  newStatus: AppointmentStatus
) {
  assertCan(userId, 'manage_appointments', profileId);

  const db = getDb();
  const now = new Date().toISOString();

  const transaction = db.transaction(() => {
    db.prepare('UPDATE appointments SET status = ?, updated_by_user_id = ?, updated_at = ? WHERE id = ? AND profile_id = ?').run(
      newStatus,
      userId,
      now,
      appointmentId,
      profileId
    );

    if (newStatus === 'cancelled') {
      // Cancel queued notifications
      db.prepare(`
        UPDATE notification_outbox 
        SET status = 'failed', last_error = 'Appointment cancelled by user', updated_at = ?
        WHERE business_event_id = ? AND status = 'queued'
      `).run(now, appointmentId);
    }

    // Audit log
    db.prepare(`
      INSERT INTO audit_events (id, profile_id, actor_user_id, event_type, resource_type, resource_id, metadata_json, occurred_at)
      VALUES (?, ?, ?, 'appointment_status_changed', 'appointment', ?, ?, ?)
    `).run(
      generateId(),
      profileId,
      userId,
      appointmentId,
      JSON.stringify({ new_status: newStatus }),
      now
    );
  });

  transaction();
}
