// Adherence Event Ledger & Grace Period Service
// Complies with 08_TECHNICAL_ARCHITECTURE.md, 09_DATA_MODEL.md, and Safety Principles

import { getDb } from '@/lib/db';
import { generateId } from '@/lib/crypto';
import { 
  DoseOccurrence, 
  DoseEvent, 
  DoseEventType, 
  EventActorSource,
  OccurrenceStatus 
} from '@/types';
import { assertCan } from './policy';

export interface RecordDoseInput {
  occurrenceId: string;
  profileId: string;
  userId: string;
  eventType: 'reported_taken' | 'reported_skipped' | 'snoozed' | 'unable_to_confirm' | 'correction';
  source: EventActorSource;
  note?: string;
  idempotencyKey?: string;
  snoozeMinutes?: number;
}

/**
 * Record a user or caregiver reported dose event into the immutable ledger.
 */
export function recordDoseEvent(input: RecordDoseInput): { event: DoseEvent; occurrence: DoseOccurrence } {
  // Authorization: must have record_dose permission
  assertCan(input.userId, 'record_dose', input.profileId);

  const db = getDb();
  const now = new Date().toISOString();
  const idempotencyKey = input.idempotencyKey || `evt_${input.occurrenceId}_${Date.now()}`;

  const transaction = db.transaction(() => {
    // 1. Fetch target occurrence and ensure it belongs to the profile
    const occurrence = db.prepare(`
      SELECT * FROM dose_occurrences WHERE id = ? AND profile_id = ?
    `).get(input.occurrenceId, input.profileId) as any;

    if (!occurrence) {
      throw new Error(`Occurrence ${input.occurrenceId} not found in profile ${input.profileId}`);
    }

    // 2. Fetch existing latest event for superseding/correction tracking
    const existingEvent = db.prepare(`
      SELECT id FROM dose_events WHERE occurrence_id = ? ORDER BY created_at DESC LIMIT 1
    `).get(input.occurrenceId) as any;

    const eventId = generateId();

    // 3. Insert immutable DoseEvent
    db.prepare(`
      INSERT INTO dose_events (
        id, occurrence_id, profile_id, event_type, recorded_by_user_id,
        recorded_at_utc, source, note, idempotency_key, supersedes_event_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      eventId,
      input.occurrenceId,
      input.profileId,
      input.eventType,
      input.userId,
      now,
      input.source,
      input.note?.trim() || null,
      idempotencyKey,
      existingEvent ? existingEvent.id : null,
      now
    );

    // 4. Update derived status of occurrence
    let newStatus: OccurrenceStatus;
    if (input.eventType === 'reported_taken') {
      newStatus = 'reported_taken';
    } else if (input.eventType === 'reported_skipped') {
      newStatus = 'reported_skipped';
    } else if (input.eventType === 'snoozed') {
      newStatus = 'snoozed';
    } else if (input.eventType === 'unable_to_confirm') {
      newStatus = 'unable_to_confirm';
    } else {
      newStatus = 'reported_taken'; // Correction default
    }

    // If snoozed, extend grace deadline
    let updatedGrace = occurrence.grace_deadline_at_utc;
    if (input.eventType === 'snoozed') {
      const minutes = input.snoozeMinutes || 15;
      updatedGrace = new Date(Date.now() + minutes * 60000).toISOString();
    }

    db.prepare(`
      UPDATE dose_occurrences 
      SET status = ?, grace_deadline_at_utc = ?, updated_at = ?
      WHERE id = ?
    `).run(newStatus, updatedGrace, now, input.occurrenceId);

    // 5. Audit Log
    db.prepare(`
      INSERT INTO audit_events (id, profile_id, actor_user_id, event_type, resource_type, resource_id, metadata_json, occurred_at)
      VALUES (?, ?, ?, 'dose_status_recorded', 'dose_occurrence', ?, ?, ?)
    `).run(
      generateId(),
      input.profileId,
      input.userId,
      input.occurrenceId,
      JSON.stringify({ 
        status: newStatus, 
        source: input.source, 
        note: input.note ? 'User attached a note' : undefined 
      }),
      now
    );

    const updatedOccurrenceRow = db.prepare('SELECT * FROM dose_occurrences WHERE id = ?').get(input.occurrenceId) as any;

    return {
      event: {
        id: eventId,
        occurrence_id: input.occurrenceId,
        profile_id: input.profileId,
        event_type: input.eventType,
        recorded_by_user_id: input.userId,
        recorded_at_utc: now,
        source: input.source,
        note: input.note,
        idempotency_key: idempotencyKey,
        supersedes_event_id: existingEvent ? existingEvent.id : undefined,
        created_at: now,
      },
      occurrence: {
        ...updatedOccurrenceRow,
      },
    };
  });

  return transaction();
}

/**
 * Scan for overdue scheduled occurrences past their grace period and transition to unconfirmed_after_grace.
 * Enforces FR-016: Never silently converts unconfirmed occurrences to taken or skipped!
 */
export function evaluateGracePeriodOccurrences(profileId?: string): number {
  const db = getDb();
  const now = new Date().toISOString();

  let query = `
    SELECT id, profile_id, scheduled_local_date, scheduled_local_time, medication_id 
    FROM dose_occurrences 
    WHERE status IN ('scheduled', 'snoozed') AND grace_deadline_at_utc < ?
  `;
  const params: any[] = [now];
  if (profileId) {
    query += ' AND profile_id = ?';
    params.push(profileId);
  }

  const overdueOccurrences = db.prepare(query).all(...params) as any[];

  let transitionedCount = 0;
  for (const occ of overdueOccurrences) {
    db.transaction(() => {
      // 1. Update status
      db.prepare(`
        UPDATE dose_occurrences 
        SET status = 'unconfirmed_after_grace', updated_at = ? 
        WHERE id = ? AND status IN ('scheduled', 'snoozed')
      `).run(now, occ.id);

      // 2. Append system dose event
      const eventId = generateId();
      db.prepare(`
        INSERT INTO dose_events (
          id, occurrence_id, profile_id, event_type, recorded_by_user_id,
          recorded_at_utc, source, note, idempotency_key, created_at
        ) VALUES (?, ?, ?, 'unconfirmed_after_grace', NULL, ?, 'system', 'No response recorded after configured grace period', ?, ?)
      `).run(eventId, occ.id, occ.profile_id, now, `grace_timeout_${occ.id}`, now);

      // 3. Queue proactive notification outbox item for members
      queueUnconfirmedDoseNotification(occ.profile_id, occ.id);

      transitionedCount++;
    })();
  }

  return transitionedCount;
}

/**
 * Queue proactive email notifications for unconfirmed doses
 */
function queueUnconfirmedDoseNotification(profileId: string, occurrenceId: string) {
  const db = getDb();
  const now = new Date().toISOString();

  // Find eligible members with notify_unconfirmed_dose preference
  const recipients = db.prepare(`
    SELECT m.user_id 
    FROM care_memberships m
    JOIN notification_preferences np ON np.profile_id = m.profile_id AND np.user_id = m.user_id
    WHERE m.profile_id = ? AND m.status = 'active' AND np.notify_unconfirmed_dose = 1
  `).all(profileId) as { user_id: string }[];

  const insertOutbox = db.prepare(`
    INSERT OR IGNORE INTO notification_outbox (
      id, profile_id, recipient_user_id, notification_type, business_event_id,
      dedupe_key, template_key, status, scheduled_for_utc, created_at, updated_at
    ) VALUES (?, ?, ?, 'unconfirmed_dose', ?, ?, 'tpl_unconfirmed_dose', 'queued', ?, ?, ?)
  `);

  for (const r of recipients) {
    const dedupeKey = `unconfirmed_${occurrenceId}_${r.user_id}`;
    insertOutbox.run(
      generateId(),
      profileId,
      r.user_id,
      occurrenceId,
      dedupeKey,
      now,
      now,
      now
    );
  }
}

/**
 * Retrieve today's occurrences for a profile in chronological order
 */
export function getDailyOccurrences(
  profileId: string,
  requestingUserId: string,
  dateStr?: string
): DoseOccurrence[] {
  assertCan(requestingUserId, 'view_medications', profileId);

  const db = getDb();
  const localDate = dateStr || new Date().toISOString().slice(0, 10);

  const rows = db.prepare(`
    SELECT 
      o.*,
      m.display_name as med_display_name,
      m.strength_text as med_strength_text,
      m.dose_amount as med_dose_amount,
      m.dose_unit as med_dose_unit,
      m.route as med_route,
      m.source_note as med_source_note,
      msv.instructions_text as med_instructions_text
    FROM dose_occurrences o
    JOIN medications m ON o.medication_id = m.id
    JOIN medication_schedule_versions msv ON o.schedule_version_id = msv.id
    WHERE o.profile_id = ? AND o.scheduled_local_date = ?
    ORDER BY o.scheduled_local_time ASC
  `).all(profileId, localDate) as any[];

  return rows.map((r) => {
    // Get latest event if any
    const eventRow = db.prepare(`
      SELECT e.*, u.display_name as recorder_name, u.role_title as recorder_role_title
      FROM dose_events e
      LEFT JOIN users u ON e.recorded_by_user_id = u.id
      WHERE e.occurrence_id = ?
      ORDER BY e.created_at DESC
      LIMIT 1
    `).get(r.id) as any;

    let latestEvent: DoseEvent | undefined;
    if (eventRow) {
      latestEvent = {
        id: eventRow.id,
        occurrence_id: eventRow.occurrence_id,
        profile_id: eventRow.profile_id,
        event_type: eventRow.event_type,
        recorded_by_user_id: eventRow.recorded_by_user_id,
        recorded_at_utc: eventRow.recorded_at_utc,
        source: eventRow.source,
        note: eventRow.note,
        idempotency_key: eventRow.idempotency_key,
        supersedes_event_id: eventRow.supersedes_event_id,
        created_at: eventRow.created_at,
        recorder_name: eventRow.recorder_name,
      };
    }

    return {
      id: r.id,
      profile_id: r.profile_id,
      medication_id: r.medication_id,
      schedule_version_id: r.schedule_version_id,
      local_occurrence_key: r.local_occurrence_key,
      scheduled_local_date: r.scheduled_local_date,
      scheduled_local_time: r.scheduled_local_time,
      timezone: r.timezone,
      scheduled_at_utc: r.scheduled_at_utc,
      grace_deadline_at_utc: r.grace_deadline_at_utc,
      status: r.status,
      created_at: r.created_at,
      updated_at: r.updated_at,
      medication: {
        id: r.medication_id,
        profile_id: r.profile_id,
        display_name: r.med_display_name,
        strength_text: r.med_strength_text,
        dose_amount: r.med_dose_amount,
        dose_unit: r.med_dose_unit,
        route: r.med_route,
        source_note: r.med_source_note,
        instructions_text: r.med_instructions_text,
        status: 'active',
        created_by_user_id: '',
        created_at: '',
        updated_at: '',
      },
      latest_event: latestEvent,
    };
  });
}
