// KaljiHome Domain Types & Interfaces
// Aligned with 09_DATA_MODEL.md and 10_SECURITY_AND_TRUST.md

export type UserRole = 'owner' | 'care_manager' | 'caretaker' | 'read_only';

export interface MembershipPermissions {
  view_profile: boolean;
  view_medications: boolean;
  manage_medications: boolean;
  record_dose: boolean;
  view_appointments: boolean;
  manage_appointments: boolean;
  view_timeline: boolean;
  manage_members: boolean;
  manage_preferences: boolean;
}

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, MembershipPermissions> = {
  owner: {
    view_profile: true,
    view_medications: true,
    manage_medications: true,
    record_dose: true,
    view_appointments: true,
    manage_appointments: true,
    view_timeline: true,
    manage_members: true,
    manage_preferences: true,
  },
  care_manager: {
    view_profile: true,
    view_medications: true,
    manage_medications: true,
    record_dose: true,
    view_appointments: true,
    manage_appointments: true,
    view_timeline: true,
    manage_members: false,
    manage_preferences: true,
  },
  caretaker: {
    view_profile: true,
    view_medications: true,
    manage_medications: false,
    record_dose: true,
    view_appointments: true,
    manage_appointments: false,
    view_timeline: true,
    manage_members: false,
    manage_preferences: false,
  },
  read_only: {
    view_profile: true,
    view_medications: true,
    manage_medications: false,
    record_dose: false,
    view_appointments: true,
    manage_appointments: false,
    view_timeline: true,
    manage_members: false,
    manage_preferences: false,
  },
};

export interface User {
  id: string;
  email: string;
  display_name: string;
  role_title?: string;
  status: 'active' | 'suspended' | 'deleted';
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface ElderProfile {
  id: string;
  preferred_name: string;
  timezone: string;
  preferred_language: string;
  contact_email?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  owner_user_id: string;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
  archived_at?: string;
}

export interface CareMembership extends MembershipPermissions {
  id: string;
  profile_id: string;
  user_id: string;
  role: UserRole;
  status: 'pending' | 'active' | 'revoked' | 'expired';
  granted_by_user_id?: string;
  granted_at: string;
  revoked_by_user_id?: string;
  revoked_at?: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Invitation {
  id: string;
  profile_id: string;
  inviter_user_id: string;
  invitee_email: string;
  role: UserRole;
  permissions: MembershipPermissions;
  code_digest: string;
  expires_at: string;
  max_attempts: number;
  attempt_count: number;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  accepted_at?: string;
  accepted_by_user_id?: string;
  revoked_at?: string;
  created_at: string;
  inviter_name?: string;
}

export interface Medication {
  id: string;
  profile_id: string;
  display_name: string;
  strength_text: string;
  dose_amount?: string;
  dose_unit?: string;
  route?: string;
  source_note?: string;
  instructions_text?: string;
  status: 'active' | 'paused' | 'discontinued';
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
  current_schedule?: MedicationScheduleVersion;
}

export type FrequencyType = 'daily' | 'selected_weekdays' | 'as_needed';

export interface MedicationScheduleVersion {
  id: string;
  medication_id: string;
  profile_id: string;
  version_number: number;
  frequency_type: FrequencyType;
  weekdays?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  local_times: string[]; // e.g. ["08:00", "20:00"]
  timezone: string;
  start_local_date: string; // YYYY-MM-DD
  end_local_date?: string;
  instructions_text?: string;
  grace_period_minutes: number;
  entered_by_user_id: string;
  confirmed_by_user_id: string;
  confirmed_at: string;
  effective_from: string;
  effective_until?: string;
  change_reason?: string;
  created_at: string;
  entered_by_name?: string;
  confirmed_by_name?: string;
}

export type OccurrenceStatus = 
  | 'scheduled'
  | 'reported_taken'
  | 'reported_skipped'
  | 'snoozed'
  | 'unable_to_confirm'
  | 'unconfirmed_after_grace'
  | 'cancelled';

export interface DoseOccurrence {
  id: string;
  profile_id: string;
  medication_id: string;
  schedule_version_id: string;
  local_occurrence_key: string;
  scheduled_local_date: string;
  scheduled_local_time: string;
  timezone: string;
  scheduled_at_utc: string;
  grace_deadline_at_utc: string;
  status: OccurrenceStatus;
  created_at: string;
  updated_at: string;
  medication?: Medication;
  latest_event?: DoseEvent;
}

export type DoseEventType = 
  | 'reported_taken'
  | 'reported_skipped'
  | 'snoozed'
  | 'unable_to_confirm'
  | 'correction'
  | 'unconfirmed_after_grace';

export type EventActorSource = 'older_adult' | 'family' | 'caretaker' | 'system';

export interface DoseEvent {
  id: string;
  occurrence_id: string;
  profile_id: string;
  event_type: DoseEventType;
  recorded_by_user_id?: string;
  recorded_at_utc: string;
  source: EventActorSource;
  note?: string;
  idempotency_key: string;
  supersedes_event_id?: string;
  created_at: string;
  recorder_name?: string;
}

export type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  profile_id: string;
  clinician_display_name: string;
  facility_display_name: string;
  location_text?: string;
  scheduled_local_date: string;
  scheduled_local_time: string;
  timezone: string;
  scheduled_at_utc: string;
  purpose_note?: string;
  status: AppointmentStatus;
  reminder_offsets_hours: number[];
  created_by_user_id: string;
  updated_by_user_id: string;
  created_at: string;
  updated_at: string;
  creator_name?: string;
}

export interface NotificationPreference {
  id: string;
  profile_id: string;
  user_id: string;
  notify_upcoming_dose: boolean;
  notify_unconfirmed_dose: boolean;
  notify_upcoming_appointment: boolean;
  channel: 'email';
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  created_at: string;
  updated_at: string;
}

export type NotificationType = 'upcoming_dose' | 'unconfirmed_dose' | 'upcoming_appointment';
export type NotificationStatus = 'queued' | 'dispatched' | 'failed';

export interface NotificationOutboxItem {
  id: string;
  profile_id: string;
  recipient_user_id: string;
  notification_type: NotificationType;
  business_event_id: string;
  dedupe_key: string;
  template_key: string;
  status: NotificationStatus;
  scheduled_for_utc: string;
  dispatched_at_utc?: string;
  attempt_count: number;
  max_attempts: number;
  last_error?: string;
  created_at: string;
  updated_at: string;
  recipient_email?: string;
  recipient_name?: string;
  email_subject?: string;
  email_body?: string;
}

export interface AuditEvent {
  id: string;
  profile_id: string;
  actor_user_id?: string;
  event_type: string;
  resource_type: string;
  resource_id: string;
  metadata_json?: string;
  occurred_at: string;
  actor_name?: string;
}
