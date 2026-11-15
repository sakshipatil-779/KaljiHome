# GAP_ANALYSIS.md — Functional & Non-Functional Gap Matrix

**Project:** KaljiHome (Elderly Care & Medication Management Platform)  
**Baseline Date:** 15 November 2026  
**Auditor:** Antigravity  

This document maps all required capabilities from `05_PRODUCT_REQUIREMENTS.md` and `10_SECURITY_AND_TRUST.md` to our build plan, tracking severity, user impact, evaluation criteria alignment, and planned remediation.

---

## 1. Traceability & Gap Matrix

| Req ID | Description | Priority | Baseline State | Severity | Affected Criteria | Remediation Plan |
|---|---|---|---|---|---|---|
| **FR-001** | Individual account creation / secure login | P0 | Not Implemented | Critical | Security, Code Quality | Implement server-side password hashing (Argon2/scrypt/bcrypt), secure session cookies, profile switching |
| **FR-002** | Create elderly care profile with IANA timezone | P0 | Not Implemented | High | Problem Alignment, Security | Create ElderProfile schema with timezone (`Asia/Kolkata` default), preferred language, ownership record |
| **FR-003** | Visible owner/control model & active care circle | P0 | Not Implemented | High | Problem Alignment, Security | Display care circle members with granted permissions and status on UI |
| **FR-004** | Scoped, expiring, single-use passcode invitation | P0 | Not Implemented | Critical | Security, Problem Alignment | Generate cryptographically secure 8-character codes; store as HMAC-SHA256 digests; 10 min TTL; attempt limits |
| **FR-005** | Atomic invite acceptance, wrong-user prevention | P0 | Not Implemented | Critical | Security | Atomic DB transaction: verify bound email, check expiry & attempts, invalidate token, create membership |
| **FR-006** | Granular RBAC permissions (view/edit meds, record dose, appointments, manage members) | P0 | Not Implemented | Critical | Security, Code Quality | Server-side permission policy check `can(user, action, profile)` on every endpoint |
| **FR-007** | Server-side authorization for all reads/writes | P0 | Not Implemented | Critical | Security | Enforce tenant/profile and membership boundary in API handler layer |
| **FR-008** | Immediate revocation blocking active sessions | P0 | Not Implemented | High | Security | Server checks active membership status on every API call; revocation immediately revokes access |
| **FR-009** | Member alert channel & quiet hours | P1 | Not Implemented | Medium | Problem Alignment | Notification preference model with opt-in switches and quiet-hour windows |
| **FR-010** | Add medication with explicit clinician details (no AI guessing) | P0 | Not Implemented | Critical | Problem Alignment, Code Quality | Strictly validated form: exact name, strength, dose quantity, unit, route; require confirmation checkbox |
| **FR-011** | Recurrence pattern, local time(s), start/end date, timezone | P0 | Not Implemented | High | Problem Alignment, Efficiency | Structured schedule versioning storing local clock times, weekdays, and IANA timezone |
| **FR-012** | Versioned schedule: edit, pause, discontinue with history | P0 | Not Implemented | High | Problem Alignment, Testing | `MedicationScheduleVersion` entity; updates generate new version without altering past history |
| **FR-013** | Today & upcoming chronological medication occurrences | P0 | Not Implemented | High | Problem Alignment, UX | Idempotent timezone-aware schedule generator generating `DoseOccurrence` records |
| **FR-014** | Dose status recording: Taken, Skipped, Snoozed, Unable to confirm | P0 | Not Implemented | Critical | Problem Alignment, UX | `DoseEvent` ledger capturing actor user ID, timestamp, status, idempotency key, source role |
| **FR-015** | Taken represented as user/caregiver report, not verified ingestion | P0 | Not Implemented | High | Problem Alignment, UX | Explicit UI labeling: "Reported taken by [Name] at [Time]"; disclaim clinical ingestion verification |
| **FR-016** | Unconfirmed after grace period; no silent auto-skipped | P0 | Not Implemented | Critical | Problem Alignment, Safety | Scheduled evaluator marks overdue occurrences as `unconfirmed_after_grace`; never auto-marks taken/skipped |
| **FR-017** | Late response preserves scheduled time & action time | P0 | Not Implemented | Medium | Testing, Code Quality | Store both `scheduled_at_utc` and `recorded_at_utc` explicitly |
| **FR-018** | Deduplication / idempotency for dose submissions | P0 | Not Implemented | High | Security, Efficiency | Unique constraint on `(occurrence_id, idempotency_key)` or `idempotency_key` |
| **FR-019** | Optional context reason for skipped/unconfirmed dose | P1 | Not Implemented | Low | UX, Problem Alignment | Allow non-clinical structured reason note (e.g. forgot, fasting, clinician advised) |
| **FR-020** | Source note and confirmation for medicine updates | P1 | Not Implemented | Medium | Security, UX | Record prescriber note, prescription date, and reviewer confirmation |
| **FR-021** | Doctor appointments CRUD & local timezone display | P0 | Not Implemented | High | Problem Alignment | `Appointment` entity with date, time, clinician, facility, purpose note |
| **FR-022** | Store appointment with timezone; display in local time | P0 | Not Implemented | High | Problem Alignment | Store local ISO date-time, timezone string, and UTC timestamp |
| **FR-023** | Appointment status: Upcoming, Completed, Cancelled | P0 | Not Implemented | Medium | Problem Alignment | Explicit status lifecycle; completion recorded by user |
| **FR-024** | Appointment preparation summary card | P1 | Not Implemented | Low | UX | Exportable/printable user summary of active meds & questions for doctor |
| **FR-025** | Email reminders for upcoming doses, unconfirmed grace, appointments | P0 | Not Implemented | Critical | Problem Alignment, Efficiency | Persistent `NotificationOutbox` + background worker dispatcher |
| **FR-026** | Recipient eligibility check based on membership & preferences | P0 | Not Implemented | High | Security | Worker verifies recipient membership is still active at time of dispatch |
| **FR-027** | Privacy-preserving emails: no medicine/diagnosis in subject | P0 | Not Implemented | Critical | Security, Privacy | Neutral email subjects ("Medication reminder for your care circle"); details only inside authenticated app |
| **FR-028** | Persistent outbox, dedupe keys, bounded retries | P0 | Not Implemented | High | Efficiency, Testing | Deduplication keys `(profile_id, type, business_event_id, recipient)`; max 3 retries with backoff |
| **FR-029** | Transparent delivery state UI & dev email sink | P0 | Not Implemented | Medium | UX, Testing | In-app notification viewer / email sink showing pending, dispatched, and failed states |
| **FR-030** | Configurable quiet hours and escalation order | P1 | Not Implemented | Low | UX | Member notification preferences controls |
| **FR-031** | Today dashboard: next dose, timeline, next appointment | P0 | Not Implemented | High | Problem Alignment, Accessibility | Centralized Today view with calm, legible cards and prominent next action |
| **FR-032** | Care Circle dashboard without false clinical metrics | P0 | Not Implemented | High | UX, Problem Alignment | Avoids pseudo-scientific adherence %; focuses on factual events and member visibility |
| **FR-033** | Shared activity timeline with actor and timestamp | P0 | Not Implemented | High | Problem Alignment | Unified chronological audit feed filtered by user's permitted profile |
| **FR-034** | Timeline respects viewer permissions | P0 | Not Implemented | High | Security | Filter timeline items server-side based on viewer role |
| **NFR-001** | WCAG 2.2 AA target compliance | P0 | Not Implemented | High | Accessibility | Semantic HTML5, accessible color contrast (>= 4.5:1), ARIA live regions |
| **NFR-002** | Keyboard operability, visible focus, screen-reader labels | P0 | Not Implemented | High | Accessibility | Focus rings, skip navigation, aria-labels, fieldset/legend semantics |
| **NFR-003** | Touch targets >= 44x44 CSS pixels (prefer 48-56px) | P0 | Not Implemented | High | Accessibility | Big buttons, comfortable touch padding, generous spacing |
| **NFR-004** | Responsive reflow, text resize up to 200% | P0 | Not Implemented | Medium | Accessibility | Fluid layouts, mobile-first CSS, rem/em units |
| **NFR-005** | No color-only status indicators | P0 | Not Implemented | High | Accessibility | Explicit text labels ("Taken (Reported)", "Unconfirmed") + clear icons |
| **NFR-008** | Object-level authorization on all API routes | P0 | Not Implemented | Critical | Security | Enforce profile membership check before accessing any record |
| **NFR-009** | Rate limiting and safe security audit logging | P0 | Not Implemented | High | Security | In-memory / DB rate limiters for login, invite code submission, and dose actions |
| **NFR-010** | Safe secret management; no leaks in client bundles | P0 | Not Implemented | Critical | Security | Secrets only in server environment; sanitized `.env.example` |
| **NFR-011** | No sensitive health data in routine logs or analytics | P0 | Not Implemented | High | Security, Privacy | Redacted logger omitting medication names, dosages, and passwords |
| **NFR-012** | Server-side schema validation (Zod) | P0 | Not Implemented | High | Code Quality, Security | Strict Zod schemas validating all API request payloads |
| **NFR-013** | Deterministic, idempotent schedule generator | P0 | Not Implemented | High | Efficiency, Testing | `generateDoseOccurrences(schedule, startDate, endDate)` with unique occurrence keys |
| **NFR-014** | Indexed, bounded queries | P0 | Not Implemented | High | Efficiency | Proper DB indexes on foreign keys, scheduled dates, and membership pairs |

---

## 2. Six Hackathon Evaluation Criteria Priorities
1. **Code Quality:** Strict TypeScript, modular clean architecture, domain services, Zod validation, zero type errors.
2. **Security:** Object-level authorization (`can`), single-use expiring HMAC-SHA256 passcodes, atomic acceptance, secret sanitization, audit trail.
3. **Efficiency:** Idempotent occurrence generation, indexed queries, bounded list horizons, transactional outbox worker.
4. **Testing:** Comprehensive unit tests for scheduling & transitions, integration tests for RBAC & invites, E2E flows.
5. **Accessibility:** WCAG 2.2 AA compliant, 48px+ touch targets, visible high-contrast focus rings, screen-reader live regions, zero color-only states.
6. **Problem Statement Alignment:** Real collaborative care circle, elder at center of care, transparent attribution, proactive reminders.
