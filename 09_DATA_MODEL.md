# 09 — Data Model

This is a logical relational model. Adapt names and types to the repository. Use UUIDs or equivalent opaque identifiers. Do not expose sequential IDs as the sole access control.

## 1. `User`

- `id`
- `email` (unique where account model requires; verified state)
- `display_name`
- `auth_provider_subject` or secure password-hash reference (never plaintext password)
- `status` (active, suspended, deleted/pending deletion)
- `created_at`, `updated_at`, `last_login_at`

Keep identity/account data separate from health profile data.

## 2. `ElderProfile`

- `id`
- `preferred_name`
- `date_of_birth` (optional; omit if age/date is not required)
- `timezone` (IANA identifier)
- `preferred_language`
- `contact_email` (only if needed and consented)
- `owner_user_id` (or another explicit ownership/control mapping)
- `created_by_user_id`
- `created_at`, `updated_at`, `archived_at`

Collect minimum information. Avoid storing full address, identity documents or ABHA number unless a separately justified feature requires it.

## 3. `CareMembership`

- `id`
- `profile_id`
- `user_id`
- `role` (owner, care_manager, caretaker, read_only; roles are labels)
- explicit boolean/permission-set fields such as `view_profile`, `view_medications`, `manage_medications`, `record_dose`, `view_appointments`, `manage_appointments`, `view_timeline`, `manage_members`, `manage_preferences`
- `status` (pending, active, revoked, expired)
- `granted_by_user_id`, `granted_at`, `revoked_by_user_id`, `revoked_at`
- `created_at`, `updated_at`

Unique active membership per `(profile_id, user_id)`. Never rely only on frontend route visibility.

## 4. `Invitation`

- `id`, `profile_id`, `inviter_user_id`
- `invitee_email` (normalized)
- `role` and permission snapshot
- `code_digest` (keyed digest/HMAC, not plaintext)
- `expires_at`, `max_attempts`, `attempt_count`
- `accepted_at`, `accepted_by_user_id`, `revoked_at`
- `created_at`

Store enough audit metadata to explain the grant. Do not log the raw code. Use an atomic consume/accept transaction.

## 5. `ConsentGrant`

- `id`, `profile_id`, `grantor_user_id`, `grantee_user_id` or invitation/member reference
- `purpose`, `scope` (explicit permission snapshot/version)
- `status` (active, revoked, expired)
- `notice_version`, `granted_at`, `revoked_at`, `capture_method`

This is a product consent record; it is not a claim that the record alone satisfies every legal requirement. Record notice/permission changes over time.

## 6. `Medication`

- `id`, `profile_id`
- `display_name` (exact name entered by user)
- `strength_text`
- `dose_amount` and `dose_unit` (nullable if not known; no inference)
- `route` (nullable or “not recorded”)
- `source_note` / `prescriber_display` (optional)
- `status` (active, paused, discontinued)
- `created_by_user_id`, `created_at`, `updated_at`

Avoid storing unnecessary diagnosis or full prescription image content in the MVP.

## 7. `MedicationScheduleVersion`

- `id`, `medication_id`, `profile_id`
- `version_number`
- `frequency_type` (once, daily, selected_weekdays; only implement supported values)
- `weekdays` (if relevant)
- `local_times` (normalized child rows or structured validated data)
- `timezone` (snapshot of the applicable profile timezone)
- `start_local_date`, `end_local_date`
- `instructions_text` copied from source instruction if applicable
- `entered_by_user_id`, `confirmed_by_user_id`, `confirmed_at`
- `effective_from`, `effective_until`
- `change_reason` (optional)
- `created_at`

Schedule changes create new versions; do not overwrite old instructions used for historical occurrences.

## 8. `DoseOccurrence`

- `id`, `profile_id`, `medication_id`, `schedule_version_id`
- `local_occurrence_key` (unique per schedule/version occurrence)
- `scheduled_local_date`, `scheduled_local_time`, `timezone`
- `scheduled_at_utc`
- `grace_deadline_at_utc`
- derived/current status (scheduled, snoozed, reported_taken, reported_skipped, unable_to_confirm, unconfirmed_after_grace, cancelled)
- `created_at`, `updated_at`

Unique key must prevent generation duplicates. Keep the schedule snapshot or a stable reference to its immutable version.

## 9. `DoseEvent`

- `id`, `occurrence_id`, `profile_id`
- `event_type` (reported_taken, reported_skipped, snoozed, unable_to_confirm, correction, system_unconfirmed)
- `recorded_by_user_id` (nullable only for system events)
- `recorded_at_utc`
- `source` (older_adult, family, caretaker, system)
- `note` (optional, short and access-controlled)
- `idempotency_key` (unique within actor/profile scope)
- `supersedes_event_id` (for corrections; do not delete earlier events)
- `created_at`

The audit meaning is “a user reported/recorded this status”, not “ingestion was verified”.

## 10. `Appointment`

- `id`, `profile_id`
- `clinician_display_name`, `facility_display_name`
- `location_text` / optional contact fields
- `scheduled_local_date`, `scheduled_local_time`, `timezone`, `scheduled_at_utc`
- `purpose_note` (optional and sensitive; do not expose in generic email)
- `status` (upcoming, completed, cancelled)
- `reminder_offsets` (validated values)
- `created_by_user_id`, `updated_by_user_id`, timestamps

## 11. `NotificationPreference`

- `id`, `profile_id`, `user_id`
- enabled notification types (upcoming dose, no-status alert, appointment)
- recipient channel and destination verification state
- quiet-hours window and timezone
- active/disabled state, timestamps

A recipient must be an active member with relevant alert permission. Membership revocation overrides preferences.

## 12. `NotificationOutbox` and `NotificationAttempt`

Outbox: `id`, `profile_id`, `recipient_user_id`, `notification_type`, `business_event_id`, `dedupe_key`, `template_key`, `status`, `scheduled_for`, `attempt_count`, `next_attempt_at`, timestamps. `dedupe_key` is unique.

Attempt: `id`, `outbox_id`, attempt number, provider status/message ID, started/completed timestamps, error category/code safe for logs, retryability. Do not persist full message content where not needed.

## 13. `AuditEvent`

- `id`, `profile_id`, `actor_user_id` (nullable for system)
- `event_type`, `resource_type`, `resource_id`
- `occurred_at`, `request_id`, safe metadata (e.g. changed field names/version IDs, not full sensitive values)

Append-only by application convention and restricted database permissions. Audit reads are permission-filtered.

## Relationships (logical)

- User 1—many CareMemberships and Invitations.
- ElderProfile 1—many CareMemberships, ConsentGrants, Medications, DoseOccurrences, Appointments, NotificationOutbox and AuditEvents.
- Medication 1—many immutable ScheduleVersions.
- ScheduleVersion 1—many DoseOccurrences.
- DoseOccurrence 1—many DoseEvents.
- Appointment 1—many reminder/outbox items through business event reference.
- NotificationOutbox 1—many NotificationAttempts.

## Integrity and indexing

- Foreign keys for all profile/resource relationships.
- Database constraint that active membership is unique for profile/user.
- Unique invitation digest or token ID and atomic acceptance semantics.
- Unique dose occurrence key and dose-event idempotency key.
- Index profile/time queries, membership checks, active schedules and pending outbox scans.
- Enforce valid status transitions in domain code and test them; do not trust arbitrary client-supplied status.
- Store all server timestamps in UTC; preserve local timezone intent for schedules and appointments.
- Use transactions when recording critical events and creating audit/outbox entries.

## Deletion and retention

Define retention periods with counsel and operational needs. Support profile archive, correction and deletion requests through a documented process. If legal/audit retention requires retaining a minimal record, explain it to the user. Do not retain invitation codes, sessions or unnecessary health detail indefinitely. Backups need expiry and secure restore procedures.
