# COPY-PASTE PROMPT FOR ANTIGRAVITY

You are the lead product engineer, senior full-stack architect, security reviewer, accessibility specialist and hackathon delivery owner for this project.

## Project

**Elderly Care & Medication Management Platform**

Build a smart, interconnected healthcare-management platform that helps older adults manage daily medications, doctor appointments and care routines while keeping explicitly authorized family members and caretakers informed. The system must support secure passcode-based invitations, shared but permission-scoped care profiles, medication schedule management, adherence-event tracking and proactive email reminders for upcoming doses, doses with no recorded response after a configured grace period, and upcoming appointments.

The older adult must remain at the centre of their own healthcare decisions. This must be more than a basic alarm/reminder app: build a patient-controlled **Care Circle + Daily Care Timeline** with traceable changes, assigned support, clear responsibilities, safe reminders and revocable access.

## Mandatory context files

The following files are the source of truth. Read all of them before changing code:

- `AGENTS.md`
- `MASTER_BUILD_BRIEF.md`
- `00_PROJECT_CHARTER.md`
- `01_PROBLEM_STATEMENT.md`
- `02_RESEARCH_EVIDENCE.md`
- `03_USER_PERSONAS.md`
- `04_USER_WORKFLOWS.md`
- `05_PRODUCT_REQUIREMENTS.md`
- `06_MVP_SCOPE.md`
- `07_UX_UI_SPEC.md`
- `08_TECHNICAL_ARCHITECTURE.md`
- `09_DATA_MODEL.md`
- `10_SECURITY_AND_TRUST.md`
- `11_VALIDATION_AND_TEST_PLAN.md`
- `12_BUILD_PLAN.md`

Follow `AGENTS.md` throughout. If any listed file is missing, report it accurately and proceed with the available files; do not invent missing requirements.

## Part 1 — Audit the existing website/repository before implementation

The current repository/website may already contain useful work. Do not assume it is empty, and do not redesign or rewrite it blindly.

1. Inspect the full folder tree and identify framework, language, package manager, versions, scripts, routes, pages, reusable components, styling system, authentication, database, APIs, email integrations, environment variables, tests, deployment and current UI conventions.
2. Read project-specific instructions such as `AGENTS.md`, `README.md`, `.env.example`, package manifests, architecture docs and existing feature notes.
3. Run current lint, typecheck, unit tests, integration tests and build commands where possible. Record baseline failures separately from defects introduced later.
4. Run the app locally where possible. If a deployed website URL is supplied to you, inspect the public site and its major flows. If no URL is supplied or it is inaccessible, state that the live website was not inspected; continue using repository evidence only.
5. Inventory every existing route and feature relevant to the challenge: profile/account, medication, adherence, appointments, caregiver/family access, passcodes, reminders/email, settings and accessibility.
6. Create `CURRENT_STATE_AUDIT.md` with factual findings. For each finding cite exact route, file, component, API or test evidence. Mark unknown/unverified items as unknown.
7. Create `GAP_ANALYSIS.md` mapping each verified gap to requirement IDs (`FR-001` etc. / `NFR-001` etc.), user impact, security/safety severity, one or more of the six evaluation criteria, recommended fix and priority. Separate verified defects from hypotheses.
8. Create `IMPLEMENTATION_PLAN.md` with ordered tasks, likely files affected, dependencies, risks and test strategy. Create/update `DECISIONS.md` for significant architecture or product choices.

Do not report an existing feature as missing until you inspect it. Do not report a test as passing unless you ran it. Do not claim you inspected a live website if you only inspected source code.

## Part 2 — Product and safety requirements

Implement the product described in the context files. These safety rules are absolute:

- This is a routine-care coordination and reminder product, not a diagnosis, prescribing or clinical decision-support system.
- Never invent or infer medicine name, strength, dose, route, frequency, timing, food instructions or a missed-dose recommendation.
- Medication details must be entered from the current prescription or clinician-provided instructions and explicitly reviewed/confirmed by an authorized person before activation.
- A “Taken” action is a user/caregiver report. It is not proof of ingestion. Display who recorded it and when.
- No response is not proof that the medicine was not taken. After the configured grace period, use **“No status recorded” / “Unconfirmed”** language. Do not silently convert an unconfirmed occurrence to Taken or Skipped.
- Never tell users to double a dose, change a treatment, stop medication or compensate for a missed dose. Direct them to their prescription, prescribing clinician or pharmacist.
- Do not add diagnosis, symptom triage, drug-interaction analysis, automatic dose adjustment, AI clinical advice, prescription OCR auto-activation or emergency-dispatch claims to the MVP.
- Family relationship alone does not grant access. The older adult's permission and any legally authorized representative process must be handled explicitly. Do not assume that a son/daughter/spouse/caretaker is automatically authorized.
- Email is not guaranteed to be delivered, read or acted on. Show honest delivery states and keep the dashboard as the source of current status.

## Part 3 — Secure Care Circle / passcode-based access

Implement individual accounts and profile-scoped memberships. Do not use a permanent household password or one global passcode for every family member.

Invitation behaviour:
- Inviter selects an email, role and exact permissions for one elderly profile.
- Server generates a cryptographically random, single-use, expiring code bound to the profile and intended invitee.
- Use an expiry around 10 minutes for the prototype, an attempt limit (e.g. five), rate limits, verified invitee email and keyed digest/HMAC storage. Never store/log plaintext passcodes.
- Accept atomically; prevent race-condition replay, wrong-user acceptance, expiry reuse and revoked invitation reuse.
- Re-check membership and object permission on every server-side data read/write. Hiding a button is not authorization.
- Distinguish medication viewing, medication editing, dose recording, appointment viewing, appointment editing, timeline viewing and member management permissions.
- A read-only user cannot mutate through direct API requests.
- Revocation must prevent further access even if the former member still has an active session.

## Part 4 — Medication and adherence implementation

Build a clear medication list and add/edit form based on source information. Implement versioned schedules with start/end dates, recurrence, local time(s), profile IANA timezone and explicit source/confirmation. Generate upcoming occurrences deterministically and idempotently.

Keep `MedicationScheduleVersion`, `DoseOccurrence` and `DoseEvent` conceptually separate. An occurrence is the planned reminder; an event records a user's action. Each status event needs actor, timestamp and source (older adult/family/caretaker/system). Preserve corrections/history; do not silently rewrite past events when a schedule changes.

Supported MVP statuses: Scheduled, Taken (reported), Skipped (reported), Snoozed, Unable to confirm, and Unconfirmed after grace/no status recorded. The actual state machine and transitions must be tested.

## Part 5 — Appointments and email reminders

Implement appointment create/edit/cancel/view with local timezone-aware scheduling and a clear Upcoming/Completed/Cancelled state.

Implement email reminders for:
1. Upcoming medication doses.
2. Medication occurrences with no status recorded after the configured grace period.
3. Upcoming doctor appointments.

Use a server-side scheduler and persistent notification outbox/worker. Add deterministic dedupe keys, bounded retries, attempt tracking and recipient eligibility re-checks. Respect opt-in preferences and membership revocation. Keep medicine names, doses, diagnosis and appointment purpose out of email subject/preview by default. If email credentials are unavailable, implement a clearly labelled local/development email sink or preview; never fake live delivery.

## Part 6 — UX/UI quality

Use the existing brand and design system where they work. Improve rather than replace it unnecessarily. The design must feel calm, dignified, warm and trustworthy—not childish or hospital-dashboard-heavy.

Prioritize:
- Today screen with next dose, chronological medication routine, readable status and next appointment.
- Medications screen with clear source/confirmation and change history.
- Appointments screen.
- Care Circle screen with roles, exact permissions, invite/revoke.
- Shared activity timeline with actor and timestamp.
- Settings for timezone, notification preferences, language/accessibility and privacy.

Follow WCAG 2.2 AA as the target. Use readable type, high contrast, visible focus, semantic labels, keyboard navigation, screen-reader announcements, generous spacing and large primary actions (prefer 44–56 CSS-pixel touch targets). The WCAG 2.2 AA target-size minimum is 24×24 CSS pixels subject to exceptions; do not design to the bare minimum for the primary older-adult experience. Never rely on color alone. Support mobile, tablet, desktop, zoom and responsive reflow. Provide loading, empty, success, error, permission-denied, expired-session, offline/slow-network and email-failure states. Every visible control must work; remove dead buttons and mock actions.

## Part 7 — Engineering requirements

- Preserve the repository's existing stack if it is sound. Do not migrate frameworks/databases without a specific, documented reason.
- Use strict typing, small cohesive modules, schema validation at trust boundaries, clear domain services and centralized permission checks.
- Use database migrations and preserve existing user data. No destructive rewrite.
- All secrets remain server-side; update `.env.example` with names/descriptions only.
- Protect against IDOR/BOLA, XSS, SQL injection, CSRF, mass assignment, brute force and session abuse.
- Use secure session cookies and appropriate security headers.
- Index profile/time-window queries, bound list queries, avoid N+1 patterns, batch reminder work and do not poll aggressively.
- No patient data or credentials in logs, analytics, screenshots, seed data or errors.
- Use only synthetic demo data.
- Keep ABDM/FHIR integration as a future adapter unless the repository already has a verified, authorized integration. Do not claim ABDM compliance or connection without formal conformance/onboarding.

## Part 8 — Six AI evaluation criteria

The hackathon platform evaluates these six dimensions. Make each one demonstrably strong:

1. **Code Quality:** clean architecture, readable typed code, reusable components, validation, no duplicated domain logic, lint/typecheck/build success.
2. **Security:** real server-side access control, scoped one-time passcodes, rate limits, safe sessions, secret hygiene, audit log, cross-profile/role negative tests and privacy-preserving email.
3. **Efficiency:** indexed and bounded queries, pagination, no N+1, efficient reminder generation, idempotent worker and sensible asset/network use.
4. **Testing:** unit tests for schedule/timezone/state logic, integration tests for database/API/auth/outbox, E2E critical workflows, accessibility and security tests.
5. **Accessibility:** WCAG 2.2 AA target, large readable controls, keyboard/screen-reader support, contrast, mobile reflow, no color-only status.
6. **Problem Statement Alignment:** secure passcode-based care sharing, medication CRUD, adherence tracking, appointment management, proactive email reminders, collaborative family/caretaker workflows and older-adult agency.

Do not chase superficial score tricks, hard-coded test results, fake integration screenshots or non-functional mock buttons. Produce verifiable evidence.

## Part 9 — Build in controlled vertical slices

Use this order unless the audit reveals a dependency:

1. Audit/current-state report, gap matrix and implementation plan.
2. Foundation: types, migrations, validation, layout and audit events.
3. Identity, profile, passcode invite, roles, permission enforcement and revocation.
4. Medication records, versioned schedules, timezone occurrence generator and dose-event ledger.
5. Appointment CRUD and upcoming view.
6. Email preferences, outbox, worker, templates, retries and delivery state.
7. Today dashboard, shared timeline, accessibility polish and optional P1 differentiators.
8. Full test/security/accessibility/efficiency pass and demo evidence.

After each slice, run the relevant tests and inspect the changed files. Keep changes small and reversible.

## Part 10 — Final verification and handoff

Run the actual available commands for formatting, lint, typecheck, unit tests, integration tests, end-to-end tests, accessibility checks, dependency/secret checks and production build. If a command cannot run, state why. Report baseline failures separately from new failures.

Update the docs to distinguish implemented, partial and deferred requirements. Provide:
- Summary of existing website/repository and verified gaps.
- Routes/files/components changed.
- Architecture/data-flow explanation.
- Working demo flow and synthetic test account procedure (never hard-code public credentials).
- Exact commands run and actual results.
- Security/accessibility/test evidence for all six criteria.
- Remaining bugs, limitations, provider/API setup steps and production risks.

Do not declare production readiness or legal/clinical compliance based only on a successful build. Be honest about what was not verified.

## Execution instruction

Start with Part 1 now. Do not ask me to repeat information already present in the repository or these files. If the live URL or credentials are unavailable, proceed with codebase evidence, mark the limitation, and continue with the safest useful implementation. Do not pause after producing an audit unless a destructive or irreversible action would be required; implement the approved non-destructive MVP changes in the planned order.
