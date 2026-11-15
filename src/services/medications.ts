// Medication & Versioned Schedule Management Service
// Adheres strictly to 08_TECHNICAL_ARCHITECTURE.md, 09_DATA_MODEL.md, and Clinical Safety Rules

import { getDb } from '@/lib/db';
import { generateId } from '@/lib/crypto';
import { 
  Medication, 
  MedicationScheduleVersion, 
  DoseOccurrence, 
  FrequencyType 
} from '@/types';
import { assertCan } from './policy';

export interface CreateMedicationInput {
  profileId: string;
  userId: string;
  displayName: string;
  strengthText: string;
  doseAmount?: string;
  doseUnit?: string;
  route?: string;
  sourceNote?: string;
  frequencyType: FrequencyType;
  weekdays?: number[];
  localTimes: string[]; // e.g. ["08:00", "20:00"]
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  instructionsText?: string;
  gracePeriodMinutes?: number;
  confirmedPrescription: boolean;
}

export interface UpdateMedicationScheduleInput {
  medicationId: string;
  profileId: string;
  userId: string;
  frequencyType: FrequencyType;
  weekdays?: number[];
  localTimes: string[];
  instructionsText?: string;
  gracePeriodMinutes?: number;
  changeReason?: string;
  effectiveFrom: string; // YYYY-MM-DD
}

/**
 * Generate concrete occurrences for a given schedule version within a date window.
 * Deterministic, idempotent, timezone-aware.
 */
export function generateDoseOccurrences(
  version: MedicationScheduleVersion,
  startDateStr: string,
  endDateStr: string
): Omit<DoseOccurrence, 'id' | 'created_at' | 'updated_at'>[] {
  const occurrences: Omit<DoseOccurrence, 'id' | 'created_at' | 'updated_at'>[] = [];
  
  const start = new Date(`${startDateStr}T00:00:00Z`);
  const end = new Date(`${endDateStr}T23:59:59Z`);
  
  // Iterate day by day in local calendar
  const current = new Date(start);
  while (current <= end) {
    const year = current.getUTCFullYear();
    const month = String(current.getUTCMonth() + 1).padStart(2, '0');
    const day = String(current.getUTCDate()).padStart(2, '0');
    const localDateStr = `${year}-${month}-${day}`;
    
    // Check if within schedule effective range
    if (localDateStr < version.start_local_date) {
      current.setUTCDate(current.getUTCDate() + 1);
      continue;
    }
    if (version.end_local_date && localDateStr > version.end_local_date) {
      current.setUTCDate(current.getUTCDate() + 1);
      continue;
    }

    const dayOfWeek = current.getUTCDay(); // 0 = Sunday, 1 = Monday, ...
    
    let isApplicable = false;
    if (version.frequency_type === 'daily') {
      isApplicable = true;
    } else if (version.frequency_type === 'selected_weekdays' && version.weekdays) {
      isApplicable = version.weekdays.includes(dayOfWeek);
    }

    if (isApplicable) {
      for (const timeStr of version.local_times) {
        const localOccurrenceKey = `${localDateStr}_${timeStr}`;
        
        // India Standard Time is UTC+5:30 (Asia/Kolkata)
        // If timezone is Asia/Kolkata, calculate UTC accurately
        const localDateTimeStr = `${localDateStr}T${timeStr}:00+05:30`;
        const scheduledUtc = new Date(localDateTimeStr).toISOString();
        const graceDeadlineUtc = new Date(
          new Date(scheduledUtc).getTime() + (version.grace_period_minutes || 45) * 60000
        ).toISOString();

        occurrences.push({
          profile_id: version.profile_id,
          medication_id: version.medication_id,
          schedule_version_id: version.id,
          local_occurrence_key: localOccurrenceKey,
          scheduled_local_date: localDateStr,
          scheduled_local_time: timeStr,
          timezone: version.timezone,
          scheduled_at_utc: scheduledUtc,
          grace_deadline_at_utc: graceDeadlineUtc,
          status: 'scheduled',
        });
      }
    }

    current.setUTCDate(current.getUTCDate() + 1);
  }

  return occurrences;
}

/**
 * Add a new medication and its initial schedule version.
 */
export function addMedication(input: CreateMedicationInput): Medication {
  // Authorization
  assertCan(input.userId, 'manage_medications', input.profileId);

  // Clinical safety check: Mandatory human confirmation against prescription
  if (!input.confirmedPrescription) {
    throw new Error('Clinical Safety Requirement: You must explicitly confirm that medication details match the current prescription or clinician instructions.');
  }

  if (!input.displayName.trim() || !input.strengthText.trim()) {
    throw new Error('Medication name and strength are required fields.');
  }

  if (!input.localTimes || input.localTimes.length === 0) {
    throw new Error('At least one daily administration time must be specified.');
  }

  const db = getDb();
  const profile = db.prepare('SELECT timezone FROM elder_profiles WHERE id = ?').get(input.profileId) as any;
  const timezone = profile?.timezone || 'Asia/Kolkata';

  const medId = generateId();
  const versionId = generateId();
  const now = new Date().toISOString();

  const transaction = db.transaction(() => {
    // 1. Insert medication
    db.prepare(`
      INSERT INTO medications (
        id, profile_id, display_name, strength_text, dose_amount, dose_unit, route,
        source_note, status, created_by_user_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
    `).run(
      medId,
      input.profileId,
      input.displayName.trim(),
      input.strengthText.trim(),
      input.doseAmount?.trim() || '1',
      input.doseUnit?.trim() || 'dose',
      input.route?.trim() || 'oral',
      input.sourceNote?.trim() || '',
      input.userId,
      now,
      now
    );

    // 2. Insert initial Schedule Version
    const scheduleVersion: MedicationScheduleVersion = {
      id: versionId,
      medication_id: medId,
      profile_id: input.profileId,
      version_number: 1,
      frequency_type: input.frequencyType,
      weekdays: input.weekdays,
      local_times: input.localTimes,
      timezone,
      start_local_date: input.startDate,
      end_local_date: input.endDate,
      instructions_text: input.instructionsText?.trim(),
      grace_period_minutes: input.gracePeriodMinutes || 45,
      entered_by_user_id: input.userId,
      confirmed_by_user_id: input.userId,
      confirmed_at: now,
      effective_from: input.startDate,
      created_at: now,
    };

    db.prepare(`
      INSERT INTO medication_schedule_versions (
        id, medication_id, profile_id, version_number, frequency_type, weekdays_json,
        local_times_json, timezone, start_local_date, end_local_date, instructions_text,
        grace_period_minutes, entered_by_user_id, confirmed_by_user_id, confirmed_at,
        effective_from, created_at
      ) VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      versionId,
      medId,
      input.profileId,
      input.frequencyType,
      input.weekdays ? JSON.stringify(input.weekdays) : null,
      JSON.stringify(input.localTimes),
      timezone,
      input.startDate,
      input.endDate || null,
      input.instructionsText?.trim() || null,
      input.gracePeriodMinutes || 45,
      input.userId,
      input.userId,
      now,
      input.startDate,
      now
    );

    // 3. Generate initial concrete occurrences for next 7 days
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    const endDateStr = endDate.toISOString().slice(0, 10);
    const todayStr = new Date().toISOString().slice(0, 10);

    const occurrences = generateDoseOccurrences(scheduleVersion, todayStr, endDateStr);

    const insertOcc = db.prepare(`
      INSERT OR IGNORE INTO dose_occurrences (
        id, profile_id, medication_id, schedule_version_id, local_occurrence_key,
        scheduled_local_date, scheduled_local_time, timezone, scheduled_at_utc,
        grace_deadline_at_utc, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?, ?)
    `);

    for (const occ of occurrences) {
      insertOcc.run(
        generateId(),
        occ.profile_id,
        occ.medication_id,
        occ.schedule_version_id,
        occ.local_occurrence_key,
        occ.scheduled_local_date,
        occ.scheduled_local_time,
        occ.timezone,
        occ.scheduled_at_utc,
        occ.grace_deadline_at_utc,
        now,
        now
      );
    }

    // 4. Record Audit Event
    db.prepare(`
      INSERT INTO audit_events (id, profile_id, actor_user_id, event_type, resource_type, resource_id, metadata_json, occurred_at)
      VALUES (?, ?, ?, 'medication_created', 'medication', ?, ?, ?)
    `).run(
      generateId(),
      input.profileId,
      input.userId,
      medId,
      JSON.stringify({ medication_name: input.displayName, frequency: input.frequencyType }),
      now
    );

    return {
      id: medId,
      profile_id: input.profileId,
      display_name: input.displayName.trim(),
      strength_text: input.strengthText.trim(),
      dose_amount: input.doseAmount?.trim() || '1',
      dose_unit: input.doseUnit?.trim() || 'dose',
      route: input.route?.trim() || 'oral',
      source_note: input.sourceNote?.trim(),
      status: 'active' as const,
      created_by_user_id: input.userId,
      created_at: now,
      updated_at: now,
      current_schedule: scheduleVersion,
    };
  });

  return transaction();
}

/**
 * List all active medications with their current schedule version for a profile
 */
export function listMedications(profileId: string, requestingUserId: string): Medication[] {
  assertCan(requestingUserId, 'view_medications', profileId);

  const db = getDb();
  const rows = db.prepare(`
    SELECT * FROM medications 
    WHERE profile_id = ?
    ORDER BY created_at DESC
  `).all(profileId) as any[];

  return rows.map((r) => {
    // Get latest schedule version
    const versionRow = db.prepare(`
      SELECT * FROM medication_schedule_versions 
      WHERE medication_id = ? 
      ORDER BY version_number DESC 
      LIMIT 1
    `).get(r.id) as any;

    let currentSchedule: MedicationScheduleVersion | undefined;
    if (versionRow) {
      currentSchedule = {
        id: versionRow.id,
        medication_id: versionRow.medication_id,
        profile_id: versionRow.profile_id,
        version_number: versionRow.version_number,
        frequency_type: versionRow.frequency_type,
        weekdays: versionRow.weekdays_json ? JSON.parse(versionRow.weekdays_json) : undefined,
        local_times: JSON.parse(versionRow.local_times_json),
        timezone: versionRow.timezone,
        start_local_date: versionRow.start_local_date,
        end_local_date: versionRow.end_local_date,
        instructions_text: versionRow.instructions_text,
        grace_period_minutes: versionRow.grace_period_minutes,
        entered_by_user_id: versionRow.entered_by_user_id,
        confirmed_by_user_id: versionRow.confirmed_by_user_id,
        confirmed_at: versionRow.confirmed_at,
        effective_from: versionRow.effective_from,
        effective_until: versionRow.effective_until,
        change_reason: versionRow.change_reason,
        created_at: versionRow.created_at,
      };
    }

    return {
      id: r.id,
      profile_id: r.profile_id,
      display_name: r.display_name,
      strength_text: r.strength_text,
      dose_amount: r.dose_amount,
      dose_unit: r.dose_unit,
      route: r.route,
      source_note: r.source_note,
      status: r.status,
      created_by_user_id: r.created_by_user_id,
      created_at: r.created_at,
      updated_at: r.updated_at,
      current_schedule: currentSchedule,
    };
  });
}

/**
 * Pause or Discontinue a Medication
 */
export function updateMedicationStatus(
  medicationId: string,
  profileId: string,
  userId: string,
  newStatus: 'active' | 'paused' | 'discontinued',
  reason?: string
) {
  assertCan(userId, 'manage_medications', profileId);

  const db = getDb();
  const now = new Date().toISOString();

  const transaction = db.transaction(() => {
    db.prepare('UPDATE medications SET status = ?, updated_at = ? WHERE id = ? AND profile_id = ?').run(
      newStatus,
      now,
      medicationId,
      profileId
    );

    // If discontinued, cancel future unreached occurrences
    if (newStatus === 'discontinued') {
      db.prepare(`
        UPDATE dose_occurrences 
        SET status = 'cancelled', updated_at = ? 
        WHERE medication_id = ? AND scheduled_at_utc > ? AND status = 'scheduled'
      `).run(now, medicationId, now);
    }

    // Audit log
    db.prepare(`
      INSERT INTO audit_events (id, profile_id, actor_user_id, event_type, resource_type, resource_id, metadata_json, occurred_at)
      VALUES (?, ?, ?, 'medication_status_changed', 'medication', ?, ?, ?)
    `).run(
      generateId(),
      profileId,
      userId,
      medicationId,
      JSON.stringify({ new_status: newStatus, reason: reason || 'User action' }),
      now
    );
  });

  transaction();
}
