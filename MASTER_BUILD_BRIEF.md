# MASTER BUILD BRIEF — Elderly Care & Medication Management Platform

**Version:** 1.0  | **Research baseline:** 15 November 2026  | **Market context:** India-first  
**Working name:** ElderCare Platform (placeholder)

## 1. Product thesis

Build a secure, accessible, collaborative care space that helps an older adult manage prescribed medication routines and medical appointments while allowing explicitly authorized family members and caretakers to support them. The elderly person—not the caregiver or the software—remains the decision-making centre wherever they can make and communicate their choices.

The product must go beyond a reminder list. Its defining capability is a **patient-controlled Care Circle**: scoped members, clear responsibilities, shared status, traceable changes, configurable email notifications and a reliable timeline of care activity.

## 2. The problem to solve

Medication and appointment routines are distributed across paper prescriptions, phone calls, memory, family WhatsApp messages and separate calendars. Care may be shared across relatives or paid caretakers, creating ambiguity about who updated a schedule, who recorded a dose, whether anyone responded to an alert, and which appointment is next. A conventional alarm can notify one person but does not create a trusted shared record or safe collaboration model.

This is a coordination and adherence-support problem—not a diagnosis or prescribing problem. The product must not turn missing data into a clinical conclusion.

## 3. Primary users and roles

1. **Older adult / care recipient:** owns or participates in their profile, sees today's routine, records a dose status, reviews appointments, understands who can access the profile, and can request help or revoke access.
2. **Family care manager:** invited by the older adult or an authorized representative; may manage schedules and appointments within granted permissions.
3. **Caretaker / helper:** may view assigned routines and record a care event, but should not automatically be allowed to alter prescriptions or membership.
4. **Read-only family member:** sees only the information specifically granted.
5. **Platform operator:** handles platform operations and support; must not have routine access to health content. Any exceptional support access requires controlled, logged procedures.

Role labels are a starting point, not a substitute for per-profile permissions. A member can have different permissions for different older adults.

## 4. Core MVP promise

- Create an elderly person's healthcare profile.
- Invite family/caretakers with a one-time, expiring passcode and explicit role/permission grant.
- Add, edit, pause and discontinue medication schedules using clinician/prescription-provided details.
- View a readable daily medication timeline and record Taken, Skipped, Snoozed or Unable to confirm, with actor and timestamp.
- Distinguish an explicit skipped entry from an overdue dose with no response recorded.
- Add, edit and view doctor appointments.
- Send configured email reminders for upcoming doses, no-response/missed-dose events and upcoming appointments.
- Let the older adult and authorized care circle review one shared activity timeline and upcoming-care dashboard.
- Preserve audit history for medication, schedule, appointment, membership and consent changes.

## 5. Product differentiators (build only when core is safe)

- **Care Circle with least privilege:** separate medication-management, dose-recording, appointment-management and read-only permissions.
- **Acknowledgement attribution:** make it clear whether the older adult, a family member or a caretaker recorded a status.
- **Care handoff:** a simple “assigned helper / backup helper” view and activity trail, avoiding multiple people assuming someone else has acted.
- **Appointment preparation card:** a consent-controlled, user-editable summary of upcoming appointment details and current medication list; no generated clinical advice.
- **Routine friction feedback:** optional reason recorded by the user (forgot, schedule changed by clinician, supply unavailable, felt unwell, prefer not to say). Use it for conversation and coordination, never to diagnose or make automated clinical recommendations.
- **Plain-language and multilingual-ready interface:** start with English; structure copy for later Hindi/Marathi or other language packs after human review.

## 6. Safety boundaries

The app records what users enter and sends reminders. It does not verify ingestion, prescribe, diagnose, interpret symptoms, calculate treatment changes, check drug interactions, decide whether a missed dose should be taken, or replace a clinician/pharmacist. A reminder response is not a medical record created by a clinician. Email is not an emergency channel and cannot guarantee immediate delivery or reading.

If someone is unsure what to do after a missed dose, the interface should direct them to their prescription leaflet, prescribing clinician or pharmacist. It must not provide one-size-fits-all instructions or tell anyone to double a dose.

## 7. India-first trust and privacy approach

Treat medication names, health history, appointments and care activity as highly sensitive from the first prototype. Collect only fields required for the stated workflow. Explain who can see each item. Access requires explicit profile-specific authorization and can be revoked. No data sharing with advertisers, data brokers or unrelated third parties. Use the ABDM Health Data Management Policy as a design reference for privacy-by-design, purpose limitation and consent. Do not claim ABDM connectivity or certification without completing the relevant integration and approval process.

As of 15 November 2026, India's DPDP Act and DPDP Rules have a phased commencement schedule. The main operational provisions are scheduled to commence on 13 May 2027, while certain provisions/rules have earlier dates; the IT Act section 43A and SPDI Rules remain relevant until the repeal provision takes effect. This is a design-planning observation, not legal advice. Build to the future DPDP principles now and obtain legal review before launch.

## 8. Target architecture

Respect the existing repository's proven framework and deployment constraints. If the repository is empty, use a TypeScript-first web app, server-side API, relational database, robust authentication, role-based authorization, background email outbox/worker and a responsive PWA-capable UI. PostgreSQL is the default relational choice only if it fits the existing environment. Do not build microservices for a hackathon MVP.

A server-side schedule engine generates dose occurrences using the care profile's IANA timezone. Email notifications are queued through an outbox and dispatched by a worker with retries and idempotency. The browser never sends email directly and never decides access permissions.

## 9. Core data concepts

User, ElderProfile, CareMembership, Invitation, ConsentGrant, Medication, MedicationSchedule, DoseOccurrence, DoseEvent, Appointment, NotificationPreference, NotificationOutbox, NotificationAttempt and AuditEvent. A member's relationship and permissions are scoped to one elder profile. A dose occurrence is a planned event; a dose event is a user/caregiver action or system transition. The two must not be conflated.

## 10. Six evaluation dimensions — acceptance rubric

| Criterion | What the implementation must demonstrate |
|---|---|
| Code Quality | Clear domain boundaries; strict types; validated inputs; reusable components; readable naming; no duplicated scheduling rules; documented setup; clean lint/typecheck/build. |
| Security | Authenticated access; patient-scoped server-side authorization; least privilege; one-time passcodes; rate limiting; secure sessions; safe secrets; audit trails; IDOR/BOLA negative tests; no sensitive email leakage. |
| Efficiency | Indexed patient/time queries; pagination or bounded ranges; batch reminder scheduling; no N+1 list queries; queue-based email; idempotent retry; sensible bundle and network usage. |
| Testing | Unit tests for recurrence/timezones and dose-state transitions; integration tests for permission boundaries and outbox; end-to-end tests for full flows; accessibility and failure-state checks. |
| Accessibility | WCAG 2.2 AA target; high contrast; keyboard and screen-reader support; large readable type and controls; simple language; visible focus; no color-only state; responsive layouts. |
| Problem Statement Alignment | Real multi-person care circle; secure passcode invitation; medication and appointment CRUD; adherence record; proactive dose/appointment email reminders; patient agency and caretaker collaboration. |

Do not game the evaluation with mocked buttons, hard-coded metrics, fake test results, or hidden exceptions. Provide reproducible evidence.

## 11. Baseline success measures for a hackathon demo

- A care recipient profile can be created and accessed by its owner.
- A permitted family/caretaker can join only through a valid, unexpired invitation.
- An unauthorized user cannot view or change the profile by guessing an ID or reusing an invite.
- A medication schedule generates the correct upcoming local-time occurrences across the chosen timezone and does not duplicate them on retries.
- A dose can be recorded with actor, timestamp and status; unconfirmed is not silently converted to taken or skipped.
- Appointment reminders and dose reminders are produced at the configured times and delivery attempts are observable.
- Revoking a member immediately blocks their next request.
- The critical flows can be completed with keyboard and on a small mobile viewport.

## 12. Delivery order

1. Existing website/repository audit and gap matrix.
2. Architecture/data/auth foundation.
3. Profile, invitation, consent and membership access.
4. Medication schedules, occurrences and dose events.
5. Appointment management.
6. Email outbox, templates, retries and preference controls.
7. Care timeline/dashboard and accessibility pass.
8. Automated tests, security review, demo seed data and final scoring evidence.

## 13. Decision rule

When a feature increases clinical risk, privacy exposure or scope without directly improving one of the explicit problem-statement outcomes, defer it. Prefer a smaller, correct and demonstrable care workflow over a broad, unreliable healthcare super-app.
