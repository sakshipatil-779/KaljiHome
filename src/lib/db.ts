// SQLite Database Initialization & Schema Definition for KaljiHome
// Complies with 08_TECHNICAL_ARCHITECTURE.md and 09_DATA_MODEL.md

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { hashPassword, generateId } from './crypto';

const dbPath = process.env.DATABASE_PATH 
  ? path.resolve(process.cwd(), process.env.DATABASE_PATH)
  : path.resolve(process.cwd(), 'data/kaljihome.db');

// Ensure database directory exists
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(dbPath);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    initializeSchema(dbInstance);
  }
  return dbInstance;
}

export function initializeSchema(db: Database.Database) {
  db.exec(`
    -- 1. Users
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role_title TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_login_at TEXT
    );

    -- 2. Elder Profiles
    CREATE TABLE IF NOT EXISTS elder_profiles (
      id TEXT PRIMARY KEY,
      preferred_name TEXT NOT NULL,
      timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
      preferred_language TEXT NOT NULL DEFAULT 'en',
      contact_email TEXT,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      owner_user_id TEXT NOT NULL REFERENCES users(id),
      created_by_user_id TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      archived_at TEXT
    );

    -- 3. Care Memberships (RBAC)
    CREATE TABLE IF NOT EXISTS care_memberships (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL REFERENCES elder_profiles(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      view_profile INTEGER NOT NULL DEFAULT 1,
      view_medications INTEGER NOT NULL DEFAULT 1,
      manage_medications INTEGER NOT NULL DEFAULT 0,
      record_dose INTEGER NOT NULL DEFAULT 0,
      view_appointments INTEGER NOT NULL DEFAULT 1,
      manage_appointments INTEGER NOT NULL DEFAULT 0,
      view_timeline INTEGER NOT NULL DEFAULT 1,
      manage_members INTEGER NOT NULL DEFAULT 0,
      manage_preferences INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      granted_by_user_id TEXT REFERENCES users(id),
      granted_at TEXT NOT NULL,
      revoked_by_user_id TEXT REFERENCES users(id),
      revoked_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(profile_id, user_id)
    );

    -- 4. Passcode Invitations
    CREATE TABLE IF NOT EXISTS invitations (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL REFERENCES elder_profiles(id) ON DELETE CASCADE,
      inviter_user_id TEXT NOT NULL REFERENCES users(id),
      invitee_email TEXT NOT NULL COLLATE NOCASE,
      role TEXT NOT NULL,
      permissions_json TEXT NOT NULL,
      code_digest TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      max_attempts INTEGER NOT NULL DEFAULT 5,
      attempt_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      accepted_at TEXT,
      accepted_by_user_id TEXT REFERENCES users(id),
      revoked_at TEXT,
      created_at TEXT NOT NULL
    );

    -- 5. Medications
    CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL REFERENCES elder_profiles(id) ON DELETE CASCADE,
      display_name TEXT NOT NULL,
      strength_text TEXT NOT NULL,
      dose_amount TEXT,
      dose_unit TEXT,
      route TEXT DEFAULT 'oral',
      source_note TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_by_user_id TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- 6. Medication Schedule Versions
    CREATE TABLE IF NOT EXISTS medication_schedule_versions (
      id TEXT PRIMARY KEY,
      medication_id TEXT NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
      profile_id TEXT NOT NULL REFERENCES elder_profiles(id) ON DELETE CASCADE,
      version_number INTEGER NOT NULL,
      frequency_type TEXT NOT NULL,
      weekdays_json TEXT,
      local_times_json TEXT NOT NULL,
      timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
      start_local_date TEXT NOT NULL,
      end_local_date TEXT,
      instructions_text TEXT,
      grace_period_minutes INTEGER NOT NULL DEFAULT 45,
      entered_by_user_id TEXT NOT NULL REFERENCES users(id),
      confirmed_by_user_id TEXT NOT NULL REFERENCES users(id),
      confirmed_at TEXT NOT NULL,
      effective_from TEXT NOT NULL,
      effective_until TEXT,
      change_reason TEXT,
      created_at TEXT NOT NULL
    );

    -- 7. Dose Occurrences
    CREATE TABLE IF NOT EXISTS dose_occurrences (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL REFERENCES elder_profiles(id) ON DELETE CASCADE,
      medication_id TEXT NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
      schedule_version_id TEXT NOT NULL REFERENCES medication_schedule_versions(id) ON DELETE CASCADE,
      local_occurrence_key TEXT NOT NULL,
      scheduled_local_date TEXT NOT NULL,
      scheduled_local_time TEXT NOT NULL,
      timezone TEXT NOT NULL,
      scheduled_at_utc TEXT NOT NULL,
      grace_deadline_at_utc TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(schedule_version_id, local_occurrence_key)
    );

    -- 8. Dose Events (Immutable Ledger)
    CREATE TABLE IF NOT EXISTS dose_events (
      id TEXT PRIMARY KEY,
      occurrence_id TEXT NOT NULL REFERENCES dose_occurrences(id) ON DELETE CASCADE,
      profile_id TEXT NOT NULL REFERENCES elder_profiles(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      recorded_by_user_id TEXT REFERENCES users(id),
      recorded_at_utc TEXT NOT NULL,
      source TEXT NOT NULL,
      note TEXT,
      idempotency_key TEXT NOT NULL,
      supersedes_event_id TEXT REFERENCES dose_events(id),
      created_at TEXT NOT NULL,
      UNIQUE(occurrence_id, idempotency_key)
    );

    -- 9. Appointments
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL REFERENCES elder_profiles(id) ON DELETE CASCADE,
      clinician_display_name TEXT NOT NULL,
      facility_display_name TEXT NOT NULL,
      location_text TEXT,
      scheduled_local_date TEXT NOT NULL,
      scheduled_local_time TEXT NOT NULL,
      timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
      scheduled_at_utc TEXT NOT NULL,
      purpose_note TEXT,
      status TEXT NOT NULL DEFAULT 'upcoming',
      reminder_offsets_hours_json TEXT NOT NULL DEFAULT '[24, 2]',
      created_by_user_id TEXT NOT NULL REFERENCES users(id),
      updated_by_user_id TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- 10. Notification Preferences
    CREATE TABLE IF NOT EXISTS notification_preferences (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL REFERENCES elder_profiles(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      notify_upcoming_dose INTEGER NOT NULL DEFAULT 1,
      notify_unconfirmed_dose INTEGER NOT NULL DEFAULT 1,
      notify_upcoming_appointment INTEGER NOT NULL DEFAULT 1,
      channel TEXT NOT NULL DEFAULT 'email',
      quiet_hours_enabled INTEGER NOT NULL DEFAULT 0,
      quiet_hours_start TEXT DEFAULT '22:00',
      quiet_hours_end TEXT DEFAULT '07:00',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(profile_id, user_id)
    );

    -- 11. Notification Outbox
    CREATE TABLE IF NOT EXISTS notification_outbox (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL REFERENCES elder_profiles(id) ON DELETE CASCADE,
      recipient_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      notification_type TEXT NOT NULL,
      business_event_id TEXT NOT NULL,
      dedupe_key TEXT UNIQUE NOT NULL,
      template_key TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued',
      scheduled_for_utc TEXT NOT NULL,
      dispatched_at_utc TEXT,
      attempt_count INTEGER NOT NULL DEFAULT 0,
      max_attempts INTEGER NOT NULL DEFAULT 3,
      last_error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- 12. Notification Attempts
    CREATE TABLE IF NOT EXISTS notification_attempts (
      id TEXT PRIMARY KEY,
      outbox_id TEXT NOT NULL REFERENCES notification_outbox(id) ON DELETE CASCADE,
      attempt_number INTEGER NOT NULL,
      status TEXT NOT NULL,
      provider_response TEXT,
      error_message TEXT,
      created_at TEXT NOT NULL
    );

    -- 13. Audit Events
    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL REFERENCES elder_profiles(id) ON DELETE CASCADE,
      actor_user_id TEXT REFERENCES users(id),
      event_type TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      metadata_json TEXT,
      occurred_at TEXT NOT NULL
    );

    -- Performance & Authorization Indexes
    CREATE INDEX IF NOT EXISTS idx_memberships_lookup ON care_memberships(profile_id, user_id, status);
    CREATE INDEX IF NOT EXISTS idx_occurrences_date ON dose_occurrences(profile_id, scheduled_local_date);
    CREATE INDEX IF NOT EXISTS idx_occurrences_status ON dose_occurrences(profile_id, status);
    CREATE INDEX IF NOT EXISTS idx_dose_events_occ ON dose_events(occurrence_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_time ON appointments(profile_id, scheduled_at_utc);
    CREATE INDEX IF NOT EXISTS idx_outbox_due ON notification_outbox(status, scheduled_for_utc);
    CREATE INDEX IF NOT EXISTS idx_audit_timeline ON audit_events(profile_id, occurred_at);
  `);

  seedInitialData(db);
}

export function seedInitialData(db: Database.Database) {
  const existingUser = db.prepare('SELECT id FROM users LIMIT 1').get();
  if (existingUser) return; // Database already seeded

  const now = new Date().toISOString();
  const defaultPasswordHash = hashPassword('demoPass123!');

  // Insert Personas (03_USER_PERSONAS.md)
  const users = [
    {
      id: 'usr_meera',
      email: 'meera@example.com',
      display_name: 'Meera Sharma',
      role_title: 'Older Adult & Profile Owner',
    },
    {
      id: 'usr_arjun',
      email: 'arjun@example.com',
      display_name: 'Arjun Sharma',
      role_title: 'Family Care Manager (Son)',
    },
    {
      id: 'usr_sunita',
      email: 'sunita@example.com',
      display_name: 'Sunita Patil',
      role_title: 'Paid Caretaker / Helper',
    },
    {
      id: 'usr_nisha',
      email: 'nisha@example.com',
      display_name: 'Nisha Sharma',
      role_title: 'Family Member (Read-only)',
    },
    {
      id: 'usr_dev',
      email: 'dev@example.com',
      display_name: 'Dev Anand',
      role_title: 'Older Adult (Independent)',
    },
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, display_name, password_hash, role_title, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'active', ?, ?)
  `);

  for (const u of users) {
    insertUser.run(u.id, u.email, u.display_name, defaultPasswordHash, u.role_title, now, now);
  }

  // Create Meera's Elder Profile
  const profileId = 'prof_meera';
  db.prepare(`
    INSERT INTO elder_profiles (
      id, preferred_name, timezone, preferred_language, contact_email,
      emergency_contact_name, emergency_contact_phone, owner_user_id, created_by_user_id,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    profileId,
    'Meera Sharma',
    'Asia/Kolkata',
    'en',
    'meera@example.com',
    'Arjun Sharma (Son)',
    '+91 98200 12345',
    'usr_meera',
    'usr_meera',
    now,
    now
  );

  // Memberships for Meera's Profile
  const insertMembership = db.prepare(`
    INSERT INTO care_memberships (
      id, profile_id, user_id, role,
      view_profile, view_medications, manage_medications, record_dose,
      view_appointments, manage_appointments, view_timeline, manage_members, manage_preferences,
      status, granted_by_user_id, granted_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)
  `);

  // Meera (Owner)
  insertMembership.run(
    'mem_meera', profileId, 'usr_meera', 'owner',
    1, 1, 1, 1, 1, 1, 1, 1, 1,
    'usr_meera', now, now, now
  );

  // Arjun (Care Manager)
  insertMembership.run(
    'mem_arjun', profileId, 'usr_arjun', 'care_manager',
    1, 1, 1, 1, 1, 1, 1, 0, 1,
    'usr_meera', now, now, now
  );

  // Sunita (Caretaker)
  insertMembership.run(
    'mem_sunita', profileId, 'usr_sunita', 'caretaker',
    1, 1, 0, 1, 1, 0, 1, 0, 0,
    'usr_meera', now, now, now
  );

  // Nisha (Read-Only)
  insertMembership.run(
    'mem_nisha', profileId, 'usr_nisha', 'read_only',
    1, 1, 0, 0, 1, 0, 1, 0, 0,
    'usr_meera', now, now, now
  );

  // Notification Preferences
  const insertPref = db.prepare(`
    INSERT INTO notification_preferences (
      id, profile_id, user_id, notify_upcoming_dose, notify_unconfirmed_dose,
      notify_upcoming_appointment, channel, quiet_hours_enabled, quiet_hours_start, quiet_hours_end,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'email', 0, '22:00', '07:00', ?, ?)
  `);

  insertPref.run('pref_meera', profileId, 'usr_meera', 1, 1, 1, now, now);
  insertPref.run('pref_arjun', profileId, 'usr_arjun', 1, 1, 1, now, now);
  insertPref.run('pref_sunita', profileId, 'usr_sunita', 1, 0, 0, now, now);

  // Seed Initial Medications & Schedules for Meera
  const meds = [
    {
      id: 'med_metformin',
      name: 'Metformin Hydrochloride',
      strength: '500 mg',
      doseAmount: '1',
      doseUnit: 'tablet',
      route: 'oral',
      sourceNote: 'Prescribed by Dr. Kulkarni for routine glycaemic maintenance. (Apollo Clinic, 10 Nov 2026)',
      times: ['08:30', '20:30'],
      instructions: 'Take immediately with or after food with plenty of water.',
      grace: 45
    },
    {
      id: 'med_amlodipine',
      name: 'Amlodipine Besylate',
      strength: '5 mg',
      doseAmount: '1',
      doseUnit: 'tablet',
      route: 'oral',
      sourceNote: 'Morning blood pressure management as per Dr. Kulkarni.',
      times: ['09:00'],
      instructions: 'Take in the morning with half a glass of water.',
      grace: 45
    },
    {
      id: 'med_atorvastatin',
      name: 'Atorvastatin Calcium',
      strength: '10 mg',
      doseAmount: '1',
      doseUnit: 'tablet',
      route: 'oral',
      sourceNote: 'Lipid balance; Dr. Sneha Kulkarni prescription.',
      times: ['21:30'],
      instructions: 'Take at bedtime.',
      grace: 60
    }
  ];

  const todayStr = new Date().toISOString().slice(0, 10);

  for (const m of meds) {
    db.prepare(`
      INSERT INTO medications (id, profile_id, display_name, strength_text, dose_amount, dose_unit, route, source_note, status, created_by_user_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', 'usr_meera', ?, ?)
    `).run(m.id, profileId, m.name, m.strength, m.doseAmount, m.doseUnit, m.route, m.sourceNote, now, now);

    const versionId = `ver_${m.id}`;
    db.prepare(`
      INSERT INTO medication_schedule_versions (
        id, medication_id, profile_id, version_number, frequency_type, local_times_json,
        timezone, start_local_date, instructions_text, grace_period_minutes,
        entered_by_user_id, confirmed_by_user_id, confirmed_at, effective_from, created_at
      ) VALUES (?, ?, ?, 1, 'daily', ?, 'Asia/Kolkata', ?, ?, ?, 'usr_meera', 'usr_meera', ?, ?, ?)
    `).run(
      versionId, m.id, profileId, JSON.stringify(m.times),
      todayStr, m.instructions, m.grace,
      now, now, now
    );

    // Generate Occurrences for Today
    for (const time of m.times) {
      const occurrenceKey = `${todayStr}_${time}`;
      const occId = `occ_${m.id}_${todayStr}_${time.replace(':', '')}`;
      const scheduledUtc = new Date(`${todayStr}T${time}:00+05:30`).toISOString();
      const graceUtc = new Date(new Date(scheduledUtc).getTime() + m.grace * 60000).toISOString();

      db.prepare(`
        INSERT INTO dose_occurrences (
          id, profile_id, medication_id, schedule_version_id, local_occurrence_key,
          scheduled_local_date, scheduled_local_time, timezone, scheduled_at_utc,
          grace_deadline_at_utc, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Asia/Kolkata', ?, ?, 'scheduled', ?, ?)
      `).run(occId, profileId, m.id, versionId, occurrenceKey, todayStr, time, scheduledUtc, graceUtc, now, now);
    }
  }

  // Pre-record one morning dose as reported taken by Meera for realism
  const morningMetforminOcc = `occ_med_metformin_${todayStr}_0830`;
  const eventId = generateId();
  db.prepare(`
    INSERT INTO dose_events (
      id, occurrence_id, profile_id, event_type, recorded_by_user_id,
      recorded_at_utc, source, note, idempotency_key, created_at
    ) VALUES (?, ?, ?, 'reported_taken', 'usr_meera', ?, 'older_adult', 'Taken after breakfast', ?, ?)
  `).run(eventId, morningMetforminOcc, profileId, now, `seed_${morningMetforminOcc}`, now);

  db.prepare(`
    UPDATE dose_occurrences SET status = 'reported_taken', updated_at = ? WHERE id = ?
  `).run(now, morningMetforminOcc);

  // Doctor Appointment for Meera
  const apptDate = new Date();
  apptDate.setDate(apptDate.getDate() + 2); // 2 days ahead
  const apptDateStr = apptDate.toISOString().slice(0, 10);
  const apptTimeStr = '10:30';
  const apptUtc = new Date(`${apptDateStr}T${apptTimeStr}:00+05:30`).toISOString();

  db.prepare(`
    INSERT INTO appointments (
      id, profile_id, clinician_display_name, facility_display_name, location_text,
      scheduled_local_date, scheduled_local_time, timezone, scheduled_at_utc,
      purpose_note, status, reminder_offsets_hours_json, created_by_user_id, updated_by_user_id,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Asia/Kolkata', ?, ?, 'upcoming', '[24, 2]', 'usr_arjun', 'usr_arjun', ?, ?)
  `).run(
    'appt_kulkarni_routine',
    profileId,
    'Dr. Sneha Kulkarni (Internal Medicine)',
    'Apollo Clinic - Aundh, Pune',
    '3rd Floor, Commercial Wing, ITI Road, Aundh, Pune',
    apptDateStr,
    apptTimeStr,
    apptUtc,
    'Quarterly routine review: fasting blood glucose & blood pressure checkup',
    now,
    now
  );

  // Initial Audit Event
  db.prepare(`
    INSERT INTO audit_events (id, profile_id, actor_user_id, event_type, resource_type, resource_id, metadata_json, occurred_at)
    VALUES (?, ?, ?, 'profile_initialized', 'elder_profile', ?, ?, ?)
  `).run(
    generateId(),
    profileId,
    'usr_meera',
    profileId,
    JSON.stringify({ note: 'Meera Sharma care profile created with Care Circle' }),
    now
  );
}
