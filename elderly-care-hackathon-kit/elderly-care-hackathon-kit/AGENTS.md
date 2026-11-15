# AGENTS.md — Repository Operating Rules

These instructions apply to every AI coding agent and contributor working in this repository.

## 1. Start with discovery; never assume the current website's state

1. Inspect the full repository tree, package manifests, lockfiles, framework configuration, environment examples, routes/pages, components, database schema, migrations, authentication, email integrations, tests, deployment configuration and existing documentation.
2. Run the existing application and its current lint/typecheck/test/build commands before changing anything, when the environment permits. Record failures that existed before your changes.
3. If a deployed URL is supplied, inspect its public pages and flows as well. Do not claim that a URL or feature was inspected unless it was actually accessible.
4. Create `CURRENT_STATE_AUDIT.md` and `GAP_ANALYSIS.md` in the repository root. Every identified gap must include evidence: route/file/component, observed behaviour, impact, target requirement ID, and severity. Separate verified defects from hypotheses and unavailable checks.
5. Preserve working features, existing user data, deployment conventions, brand assets and established design patterns unless the evidence and product requirements justify a change. Never delete or replace the project wholesale.

## 2. Specification precedence

Read all of these before implementation:

- `MASTER_BUILD_BRIEF.md`
- `00_PROJECT_CHARTER.md` through `12_BUILD_PLAN.md`
- This file

If specifications conflict, use this order: patient safety and security requirements; `MASTER_BUILD_BRIEF.md`; specialized numbered specification; existing architecture where compatible. Document any unavoidable conflict and the chosen resolution in `DECISIONS.md`.

## 3. Non-negotiable clinical safety rules

- This is a medication-management, reminder and coordination tool, not a diagnostic or prescribing system.
- Never invent a drug, strength, dose, route, frequency, timing, food instruction, refill rule, interaction, contraindication or missed-dose recommendation.
- Medication schedules must be entered from a prescription or clinician-provided instruction by an authorized person and explicitly confirmed before activation.
- A “Taken” event is self-reported or caregiver-recorded. It is not proof of ingestion. Display who recorded it and when.
- No response after a reminder is not evidence that a dose was not taken. Use language such as “No status recorded” / “Unconfirmed after reminder”; distinguish this from a user explicitly recording “Skipped”.
- Never advise a person to double a dose, change timing, stop medication, or compensate for a missed dose. Show the prescription/packaging/clinician/pharmacist contact route, not an AI-generated answer.
- Do not add diagnosis, AI triage, drug-interaction analysis, automatic dose adjustment, prescription OCR auto-activation, or emergency-dispatch claims to the MVP.
- The elderly person remains the centre of the care relationship. A family relationship alone does not grant access. Permission must be explicit, scoped, visible, auditable and revocable.

## 4. Product and engineering standards

- Follow the existing stack and coding conventions when sound. Do not introduce a new framework, database, state library or UI kit without a documented reason.
- If no usable application scaffold exists, propose a simple TypeScript-first web architecture: accessible responsive frontend, server-side API, relational database, authenticated sessions, and background email worker. Confirm the actual deployment and credential constraints before choosing vendors.
- Use strict types, small cohesive modules, clear names, schema validation at trust boundaries, consistent error handling, and no duplicated business rules.
- Keep all secrets server-side and out of source control. Do not hard-code API keys, credentials, patient data, demo passwords or production URLs.
- Use parameterized database access and server-side authorization for every patient-scoped read/write. Hiding a button is not authorization.
- Keep sensitive health information out of logs, analytics, email subject lines and notification previews.
- Use database migrations. Do not perform destructive schema/data changes without a reversible migration and explicit rationale.
- Use idempotency for dose-event submissions, reminder scheduling and email outbox processing. Avoid duplicate notifications on retries.
- All critical actions need visible confirmation, clear failure states and audit attribution.
- Follow WCAG 2.2 AA as the accessibility target. Prefer 44×44 CSS-pixel controls even though WCAG 2.2 AA's minimum target-size criterion is 24×24 CSS pixels or an allowed exception.

## 5. Security and privacy requirements

- Use a trusted authentication/session mechanism where possible. Passwords, if managed by this app, must be hashed with a modern password-hashing algorithm; never store plaintext passwords.
- Invitation passcodes must be one-time, scoped to one elder profile, bound to the intended invitee where feasible, short-lived, rate-limited, stored as a keyed hash/digest, and invalidated after acceptance/revocation/expiry.
- Enforce least privilege, membership state, role permissions and patient-profile boundaries in server-side code and tests.
- Revoke access immediately when membership is revoked; rotate or invalidate related sessions/tokens as appropriate.
- Protect against CSRF, XSS, SQL injection, IDOR/BOLA, brute force, session fixation, mass assignment, unsafe file uploads and open redirects.
- Use HTTPS in deployed environments; secure, HttpOnly, SameSite cookies; secrets management; encrypted managed storage; secure backups; and a documented retention/deletion process.
- Audit access grants, revocations, medication changes, dose-state events and appointment changes without copying sensitive payloads into the audit log.
- Treat email as a convenience channel, not a safety-critical real-time guarantee. Show delivery state where useful and do not imply a message was read.

## 6. Required development workflow

1. Baseline audit and gap analysis.
2. Map existing routes/components to requirements.
3. Present a concise implementation plan and risk list in `IMPLEMENTATION_PLAN.md`.
4. Implement in small vertical slices, prioritizing access control and medication-event correctness before visual polish.
5. Add/update tests with each slice.
6. Run formatting, lint, typecheck, unit, integration, end-to-end and production build commands available in the repository.
7. Test responsive layout and keyboard/screen-reader basics. Run automated accessibility checks, then manually inspect critical flows.
8. Re-check the six hackathon criteria: Code Quality, Security, Efficiency, Testing, Accessibility and Problem Statement Alignment.
9. Update docs, list changed files, list test commands and actual results, and disclose remaining gaps. Never claim a check passed if it was not run.

## 7. Demo and seed-data rules

- Use clearly fictional demo identities, medications, clinicians and appointments. Never use real patient data in screenshots, source code, commits or sample logs.
- Mark demo data as synthetic and make reset behaviour explicit.
- Do not include default public credentials in a deployed demo. If a demo account is necessary, use an environment-controlled seed process and rotate credentials.
- Do not market the prototype as clinically validated, legally compliant, ABDM-integrated, HIPAA-compliant or production-ready unless the relevant verification has actually occurred.

## 8. Definition of done

A feature is not done merely because it renders. It must have a working happy path, validation, authorization, error/empty/loading states, responsive behaviour, accessibility treatment, automated tests proportionate to risk, and accurate documentation. For health-data access or medication actions, negative authorization and audit tests are mandatory.
