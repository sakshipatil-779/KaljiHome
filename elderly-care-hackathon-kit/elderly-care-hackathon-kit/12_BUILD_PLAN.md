# 12 — Build Plan

The sequence below is dependency-based. Adjust sprint length to the actual hackathon deadline and team capacity. Do not promise a feature until the required credentials, infrastructure and tests exist.

## Phase 0 — Existing product audit (first)

**Tasks**
- Inventory repository, stack, deployed routes, components, forms, data model, auth, email and deployment.
- Run baseline commands and capture existing failures.
- Inspect current website with supplied URL if available.
- Produce `CURRENT_STATE_AUDIT.md`, `GAP_ANALYSIS.md`, route-to-requirement mapping and `IMPLEMENTATION_PLAN.md`.
- Identify unsafe or misleading existing behaviour (e.g. fake reminders, client-only role checks, hard-coded medical advice).

**Exit:** verified inventory, evidence-based gap list and agreed architecture that preserves working code.

## Phase 1 — Foundation and design system

**Tasks**
- Establish shared tokens, typography, spacing, responsive shell, semantic controls and error/loading/empty states.
- Configure strict types, validation, logging redaction, environment variables and health checks.
- Add database migrations and test database setup.
- Add audit-event foundation.

**Exit:** app builds, lint/typecheck baseline is green or documented, accessible shell works on mobile/desktop.

## Phase 2 — Identity, profile and Care Circle

**Tasks**
- Implement individual account/session integration.
- Create care profiles and profile timezone/preferences.
- Create role/permission policy service and permission matrix.
- Implement invite passcode generation, digest storage, expiry, rate limits, acceptance and revocation.
- Add security-negative tests for cross-profile access and role boundaries.

**Exit:** profile and invitation E2E flow works; revoked account loses access; no global shared passcode.

## Phase 3 — Medication schedules and dose ledger

**Tasks**
- Implement medication form, source/confirmation fields and versioned schedule model.
- Implement timezone-aware recurrence generation and unique occurrence keys.
- Implement Today/upcoming medication list.
- Implement dose-event state machine with actor attribution, late status and corrections.
- Add unit and integration tests before visual expansion.

**Exit:** correct deterministic occurrences; duplicate prevention; unconfirmed remains unconfirmed; history is preserved.

## Phase 4 — Appointments

**Tasks**
- Implement appointment CRUD, timezone handling and status.
- Add upcoming view to Today.
- Add configurable reminder offsets.

**Exit:** create/edit/cancel and upcoming appointment states work with permissions.

## Phase 5 — Email automation

**Tasks**
- Confirm provider credentials, sending-domain verification, quota and sandbox/test capability.
- Implement notification preferences and recipient eligibility.
- Implement transactional outbox, worker/scheduler, idempotency, retries and attempt log.
- Create generic privacy-preserving email templates.
- Demonstrate test delivery; label any development sink.

**Exit:** upcoming dose, no-status-after-grace and appointment reminders are generated exactly once logically and failures are visible.

## Phase 6 — Care dashboard, timeline and differentiators

**Tasks**
- Implement shared care timeline with permission-aware records.
- Add care handoff if time allows.
- Add appointment preparation card if time allows.
- Add optional status context/reason only if it can be stored safely and not interpreted clinically.

**Exit:** collaboration is visible and understandable; older adult remains central.

## Phase 7 — Hardening and scoring evidence

**Tasks**
- Run all unit/integration/E2E tests and capture real results.
- Run accessibility scanner and manual keyboard/screen-reader checks.
- Run dependency and secret scans; review headers, cookies, IDOR/BOLA and invite flow.
- Measure app bundle, database query patterns and API response time in the available environment.
- Validate demo data reset and email provider configuration.
- Prepare a short judge demo with the six criteria and reproducible evidence.

**Exit:** no blocker from the release gates in `11_VALIDATION_AND_TEST_PLAN.md`; limitations and outstanding risks disclosed.

## Suggested ownership for a three-person team (adapt as needed)

- **Member 1 — Frontend/UX:** accessible navigation, Today, medication/appointment forms, Care Circle and responsive design.
- **Member 2 — Backend/data/security:** auth, profile model, membership permissions, invitations, medication/schedule/dose APIs, migrations and authorization tests.
- **Member 3 — Automation/testing/integration:** email outbox/worker, appointment/dose reminders, E2E/testing, reliability, demo data and evaluation evidence.

All members review security and medication-state changes. Ownership does not permit parallel changes to shared schema/API without coordination.

## Required project artifacts after audit

- `CURRENT_STATE_AUDIT.md` — what exists today, with file/routes evidence.
- `GAP_ANALYSIS.md` — verified gaps mapped to FR/NFR IDs and six evaluation criteria.
- `IMPLEMENTATION_PLAN.md` — ordered changes, files likely to change, risks and dependencies.
- `DECISIONS.md` — architecture/product decisions and trade-offs.
- Updated docs/test evidence — actual implemented behaviour versus deferred requirements.

## Change-control rule

When time is short, cut P1 items before compromising authorization, medication-state correctness, email privacy, accessibility of critical actions or tests. A small working core is better than a broad UI made of mock buttons.
