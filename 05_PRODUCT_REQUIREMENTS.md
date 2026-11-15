# 05 — Product Requirements

Requirement IDs are used across the build, audit, testing and evaluation documents. Priority: P0 = required for MVP; P1 = high-value enhancement; P2 = later.

## A. Identity, profile and care-circle access

- **FR-001 (P0):** Users can create/sign into an individual account using the existing or selected secure authentication method.
- **FR-002 (P0):** An authorized owner can create an elderly person's care profile with an explicit timezone and minimal contact/preferences data.
- **FR-003 (P0):** Each profile has a clear owner/control model and a visible list of authorized members.
- **FR-004 (P0):** Owner or permitted manager can invite a member using a one-time expiring passcode scoped to one profile and invitee.
- **FR-005 (P0):** Invitation acceptance validates account/email, expiry, use status, attempts and profile scope; acceptance consumes the code atomically.
- **FR-006 (P0):** Membership roles and permissions can distinguish view profile, view medication, edit medication, record dose, view appointments, manage appointments, view timeline and manage members.
- **FR-007 (P0):** All patient-scoped access is authorized server-side on every request.
- **FR-008 (P0):** Owner/authorized manager can revoke membership; revocation blocks subsequent requests.
- **FR-009 (P1):** Member can configure preferred alert channel and quiet-hours settings.

## B. Medication and adherence

- **FR-010 (P0):** Authorized member can add a medication using explicit clinician/prescription-sourced details; no fields are auto-inferred from a drug name.
- **FR-011 (P0):** User can configure a recurrence pattern, local time(s), effective start/end date and profile timezone.
- **FR-012 (P0):** Schedule can be edited, paused or discontinued with actor, timestamp and effective date preserved in history.
- **FR-013 (P0):** User can view today's and upcoming medication occurrences in chronological order.
- **FR-014 (P0):** Older adult or permitted helper can record Taken, Skipped, Snoozed or Unable to confirm with attribution and timestamp.
- **FR-015 (P0):** A Taken entry is explicitly represented as a user/caregiver report, not verified ingestion.
- **FR-016 (P0):** A schedule occurrence without a response after configured grace is displayed as Unconfirmed / No status recorded. It is not silently treated as skipped or taken.
- **FR-017 (P0):** A late entry/correction preserves the original scheduled timestamp and the actual action timestamp.
- **FR-018 (P0):** Duplicate requests/retries do not create duplicate dose events.
- **FR-019 (P1):** User can record a reason/context for a skipped or unconfirmed dose; it is optional and not interpreted clinically.
- **FR-020 (P1):** A medicine/schedule change can show a source note and optional second-person confirmation.

## C. Appointments

- **FR-021 (P0):** Authorized member can create, edit, cancel and view doctor appointments.
- **FR-022 (P0):** Appointment date/time is stored correctly using the profile timezone and shown in local time.
- **FR-023 (P0):** Appointment status is Upcoming, Completed or Cancelled; completion is user-recorded.
- **FR-024 (P1):** A user can create a concise appointment preparation summary for themselves/authorized care team.

## D. Notifications

- **FR-025 (P0):** The system sends configurable email reminders for upcoming doses, no-status/missed-dose events after grace, and upcoming appointments.
- **FR-026 (P0):** Recipients are selected by profile membership, notification preference and permission—not merely by an email address appearing in the record.
- **FR-027 (P0):** Email subject/preview avoids medicine name, diagnosis, appointment reason or other sensitive data unless a user has explicitly chosen and understood a supported detail setting.
- **FR-028 (P0):** Notification dispatch uses a persistent outbox, unique event keys, retries and attempt status.
- **FR-029 (P0):** UI states that email can be delayed, filtered or unread; there is no claim of guaranteed real-time delivery.
- **FR-030 (P1):** Members can tune alert types, recipients, quiet hours and escalation order.

## E. Dashboard and shared care activity

- **FR-031 (P0):** Today view shows upcoming and past-today dose occurrences, clear statuses and upcoming appointments.
- **FR-032 (P0):** Care Circle dashboard summarizes status without implying clinical adherence certainty.
- **FR-033 (P0):** Timeline identifies who changed/recorded an event and when.
- **FR-034 (P0):** Views and timeline details respect viewer permissions.
- **FR-035 (P1):** Care handoff shows assigned helper/backup helper and unresolved tasks.
- **FR-036 (P1):** Appointment preparation card is editable and clearly marked as user-created, not clinician-verified.

## F. Accessibility and usability

- **NFR-001 (P0):** Critical flows target WCAG 2.2 AA.
- **NFR-002 (P0):** Keyboard operability, visible focus, semantic labels, error association and screen-reader announcements are supported.
- **NFR-003 (P0):** Primary touch controls are preferably at least 44×44 CSS pixels; do not fall below WCAG 2.2 AA target-size minimum without a valid exception.
- **NFR-004 (P0):** Text can resize to 200% without loss of content/functionality; layouts reflow on mobile.
- **NFR-005 (P0):** Status is communicated with text/icon plus color, never color alone.
- **NFR-006 (P0):** Use respectful plain language and define unfamiliar terms.
- **NFR-007 (P1):** Interface is ready for professionally reviewed language packs.

## G. Security, privacy, data integrity and operations

- **NFR-008 (P0):** All health/profile API routes require authentication and object-level authorization.
- **NFR-009 (P0):** Invitation, authentication and sensitive actions are rate-limited and logged safely.
- **NFR-010 (P0):** Secrets are environment-managed and never returned to clients.
- **NFR-011 (P0):** No health content is written to routine logs or generic analytics.
- **NFR-012 (P0):** All schedule/event/appointment/member writes validate input server-side.
- **NFR-013 (P0):** Timezone-aware schedule generation is deterministic and idempotent.
- **NFR-014 (P0):** Database queries are bounded and indexed for profile/time-window access.
- **NFR-015 (P0):** Backup, retention, correction/deletion and incident-handling procedures are documented.
- **NFR-016 (P1):** Observability records queue lag, email failures, API errors and security events without sensitive payloads.

## Acceptance criteria for the primary demo

1. Owner creates an older-adult profile and invites a caretaker.
2. Caretaker accepts with a valid code; an invalid/expired/reused code fails.
3. Owner adds a medicine using sample prescription details and confirms the schedule.
4. Today screen shows a scheduled occurrence; user records Taken or Skipped and actor/time are visible.
5. A second occurrence left without a response crosses its configured grace period and creates a no-status alert.
6. An appointment is added and a scheduled email reminder is generated/dispatched through the configured test provider or a clearly labelled development email sink.
7. Read-only member cannot edit medicine; revoked caretaker cannot view profile.
8. App is usable with keyboard and on a phone-sized viewport.

## Traceability

The validation plan maps FR-001–FR-036 and NFR-001–NFR-016 to tests. If a requirement is not implemented, mark it as deferred in the gap analysis instead of leaving a dead/inert control in the UI.
