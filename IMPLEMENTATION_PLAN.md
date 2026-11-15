# IMPLEMENTATION_PLAN.md — KaljiHome Delivery Plan

**Project:** KaljiHome (Elderly Care & Medication Management Platform)  
**Execution Date:** 15 November 2026  
**Author:** Antigravity  

This plan outlines the vertical slices to deliver the complete KaljiHome solution in compliance with `12_BUILD_PLAN.md` and `AGENTS.md`.

---

## Slice Breakdown & Delivery Order

### Slice 1: Project Foundation, Logo & Design System
- Initialize Next.js 14+ TypeScript project, Tailwind CSS, Lucide icons, and accessible styling tokens.
- Implement the **KaljiHome** logo (SVG vector brandmark, header, favicon, and generated brand asset).
- Create high-contrast, WCAG 2.2 AA accessible base layout: large typography (>= 18px body font), generous touch targets (>= 48px), visible focus rings, responsive mobile/desktop navigation.
- Configure safe environment variable handling and `.env.example`.

### Slice 2: Database Schema, Migrations & Core Domain Services
- Implement relational SQLite schema using `better-sqlite3` with foreign keys and indexes:
  - `users`, `elder_profiles`, `care_memberships`, `invitations`, `consent_grants`
  - `medications`, `medication_schedule_versions`, `dose_occurrences`, `dose_events`
  - `appointments`, `notification_preferences`, `notification_outbox`, `notification_attempts`, `audit_events`
- Seed synthetic demo data (Persona A: Meera, Persona B: Arjun, Persona C: Sunita, Persona E: Nisha) with zero real patient information.
- Build server-side RBAC policy service: `can(user, action, profile)`.

### Slice 3: Identity, Care Profiles & Passcode-Based Care Circle
- Individual account authentication (password hashing with salt, session management).
- Elder profile creation and profile switching.
- Scoped passcode invitation flow:
  - Generate cryptographically secure 8-character single-use code.
  - Compute and store HMAC-SHA256 digest (`code_digest`).
  - Enforce 10-minute expiration, max 5 attempts, rate limiting, and invitee email binding.
  - Atomic acceptance transaction.
- Care Circle management UI: member list, exact granted permissions, revocation flow that instantly invalidates access.

### Slice 4: Medication Management & Timezone-Aware Recurrence Engine
- Medication entry form adhering to strict safety rules:
  - Exact display name, strength, dose quantity, unit, route.
  - Recurrence rules: daily, specific weekdays.
  - Profile IANA timezone (default `Asia/Kolkata`).
  - Mandatory confirmation checkbox ("I checked these details against prescription").
  - Explicit warning against self-prescribing or AI dosing.
- Idempotent occurrence generation engine with unique key `(schedule_version_id, local_occurrence_key)`.
- Schedule versioning: edit/pause/discontinue creates immutable new versions and preserves audit history.

### Slice 5: Daily Care Timeline & Adherence Event Ledger
- "Today" screen:
  - Next scheduled dose banner with exact local time and countdown.
  - Chronological daily routine list with distinct status badges.
  - Accessible primary actions: **Taken (Reported)**, **Skipped (Reported)**, **Snooze (15m)**, **Unable to confirm**.
  - Late response handling: records both scheduled time and actual recording time.
  - Actor attribution: "Reported taken by [Name] ([Role]) at [Time]".
  - Overdue grace period evaluator: marks occurrences without a response as `Unconfirmed / No status recorded` (never auto-marked taken or skipped).

### Slice 6: Doctor Appointments & Local Timezone Display
- Appointment CRUD: date, time, doctor/clinician name, clinic/facility, location/contact, purpose note.
- Timezone-aware local formatting and status tracking (Upcoming, Completed, Cancelled).
- Integration into the "Today" dashboard summary.

### Slice 7: Proactive Notification Outbox, Email Reminders & Dev Sink
- Event-triggered notifications:
  1. Upcoming dose reminders.
  2. Overdue/unconfirmed dose alerts after grace period.
  3. Upcoming appointment reminders.
- Persistent `NotificationOutbox` with unique dedupe keys, status tracking (`queued`, `dispatched`, `failed`), and retry backoff.
- Privacy-first templates: No medicine names, doses, or diagnosis in email subjects/previews.
- In-app **Notification Sink & Email Previewer** allowing testing, demo inspection, and zero external dependency failures.

### Slice 8: Shared Activity Timeline & Audit Feed
- Chronological care feed tracking all events:
  - Dose events, schedule updates, appointments, member invitations, acceptances, and revocations.
  - Strict server-side permission filtering (viewers only see what their role allows).
  - Clear actor attribution and timestamping.

### Slice 9: Comprehensive Testing & Evaluation Verification
- Unit tests: recurrence generation, timezone accuracy, dose state transitions, idempotency, passcode HMAC verification.
- Integration tests: RBAC negative authorization tests, cross-profile IDOR tests, atomic invite consumption, member revocation.
- End-to-end user workflows: Meera, Arjun, Sunita, Dev scenarios.
- Accessibility verification: WCAG 2.2 AA review, keyboard navigation, touch targets, contrast ratios.
- Documentation update: test reports, demo instructions, and scorecard.
