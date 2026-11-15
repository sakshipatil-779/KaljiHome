# 08 — Technical Architecture

## Architecture principle

Build a modular monolith for the hackathon: one deployable application with clearly separated domain modules, a relational database and a background notification worker. Do not introduce microservices, a graph database or an AI service unless the actual existing project already uses them for a justified requirement.

## Repository-first rule

Before choosing libraries or replacing code, inventory the existing stack, versions, hosting platform, deployment pipeline, authentication, database, UI components and current integrations. Prefer compatible extensions over rewrites. If no scaffold exists, use the default architecture below and record the choice in `DECISIONS.md`.

## Recommended default stack (only when the repository is empty or unsuitable)

- **Frontend:** TypeScript web app using an established React/Next.js or equivalent framework already familiar to the team; responsive design and semantic HTML.
- **Styling/components:** existing design system if available; otherwise a small consistent component layer with accessible primitives.
- **Backend:** framework server routes/actions or a typed API, with all business rules and authorization on the server.
- **Database:** PostgreSQL relational schema and migrations.
- **Data access:** typed ORM/query builder consistent with the repository; parameterized queries.
- **Authentication:** reputable session-based provider or well-maintained auth library; no home-grown password/session cryptography.
- **Email:** server-side provider adapter selected after checking account access, sandbox/test mode and quotas. Keep provider behind an interface.
- **Background work:** database-backed outbox plus a scheduler/worker supported by the host. A scheduled function is acceptable for a hackathon, but retries and idempotency are still required.
- **Tests:** existing test stack; if absent, add unit tests for domain logic, integration tests for database/API boundaries and browser end-to-end tests for critical flows.

These are defaults, not mandatory replacements for a working current stack.

## Logical components

1. **Web UI:** Today, medications, appointments, Care Circle, timeline and settings.
2. **Identity/session module:** individual account authentication, session lifecycle, account recovery.
3. **Profile and membership module:** care profiles, invitations, consent grants, role/permission checks.
4. **Medication module:** medication records, versioned schedules, occurrence generation, dose-event ledger.
5. **Appointment module:** appointment CRUD and reminder offsets.
6. **Notification module:** preferences, event-to-notification policy, outbox, email adapter, retry and delivery records.
7. **Audit module:** append-only business/security events with safe metadata.
8. **Operations module:** health checks, queue lag and provider failures, without exposing health details.

## Suggested request flow

Browser → authenticated server endpoint → input schema validation → session verification → profile membership/permission check → domain service → database transaction → audit/outbox event → response. The browser must never be trusted to select its own actor ID, role, profile permission or reminder recipient.

## API/domain boundary examples

- `POST /profiles` — create profile for authenticated actor.
- `GET /profiles/:profileId/today` — read today's occurrences, appointments and permitted summary.
- `POST /profiles/:profileId/invitations` — create scoped invitation.
- `POST /invitations/accept` — accept one-time invitation.
- `GET/POST/PATCH /profiles/:profileId/medications` — list/create/update medication records and schedule versions.
- `POST /profiles/:profileId/dose-occurrences/:occurrenceId/events` — append a dose status event.
- `GET/POST/PATCH /profiles/:profileId/appointments` — appointment CRUD.
- `GET /profiles/:profileId/timeline` — permission-filtered event history.
- `POST /profiles/:profileId/members/:memberId/revoke` — revoke a membership.

Route names are illustrative; adapt to the current app's conventions. Every endpoint must enforce both profile membership and action permission server-side.

## Medication scheduling engine

- Store a profile's IANA timezone, e.g. `Asia/Kolkata`, not only a fixed UTC offset.
- Store recurrence intent (daily, selected weekdays, one-off, or the small set actually supported), local clock time(s), effective date range and timezone.
- Generate a bounded horizon of concrete `DoseOccurrence` records, for example the next 7–14 days, using local calendar semantics.
- Persist both the intended local date/time/timezone and resolved UTC instant. Define a policy for daylight-saving gaps/folds for non-India profiles (e.g. skip nonexistent local times and choose the earlier/later offset for repeated times consistently); test it.
- Use a unique key such as `(schedule_id, local_occurrence_key)` to make generation idempotent. A job retry must not create duplicate occurrences.
- When a schedule is edited, close the old version at an explicit effective boundary and generate future occurrences from the new version. Do not mutate past occurrences or dose events.
- Grace period and reminder offsets are configuration, not hidden constants. Store the rule that produced an alert.
- Avoid calculating medication quantity, tapering, dose adjustments or interactions.

## Dose-event model

A planned occurrence is not an event. Keep `DoseOccurrence` (planned item and derived state) separate from immutable `DoseEvent` records (Taken/Skipped/Snoozed/UnableToConfirm/correction). Store `recorded_by_user_id`, `recorded_at`, `source` (self/caregiver/system), optional non-clinical note and idempotency key. A system-generated `unconfirmed_after_grace` state should be a derived status or explicit system event—not an assertion that the person did not take the medicine.

## Notification architecture

1. Scheduler detects a due occurrence/appointment threshold.
2. In a transaction, create a unique outbox row using a deterministic business key (profile + occurrence/appointment + recipient + notification type + scheduled threshold/version).
3. Worker claims pending rows safely, checks recipient membership and preferences again, renders a minimal template and calls the provider.
4. Store attempt number, timestamps, provider message ID (if safe), accepted/failed/delivered/bounced state and retry metadata.
5. Retry transient failures with bounded exponential backoff and jitter; stop on permanent invalid-recipient/provider errors and surface them.
6. Provider webhooks update status only after signature validation. Do not claim read/open unless explicitly measured, and avoid email-open tracking for sensitive notifications.
7. Never send health details in an email template by default. The email should link to the authenticated dashboard.

Use a development email sink or local preview in tests. Do not fabricate successful delivery when no provider credentials exist.

## Security controls in architecture

- Centralized `can(user, action, profile)` policy or equivalent service.
- Tenant/profile scoping on every query; consider row-level security only if it is correctly configured and tested.
- Schema validation for route payloads and provider webhooks.
- Rate limits on auth, invite creation/acceptance, sensitive mutations and email-trigger endpoints.
- Strict Content Security Policy and security headers consistent with the framework.
- No secrets or sensitive details in client bundles, logs or error responses.

## Performance and efficiency

- Index membership by `(profile_id, user_id, status)` and event/occurrence lists by `(profile_id, scheduled_at)` / `(profile_id, recorded_at)` as appropriate.
- Fetch only the selected profile and bounded date range; paginate longer timeline views.
- Avoid per-row permission lookups by loading membership/policy context once and enforcing it centrally.
- Batch notification candidate discovery and outbox inserts.
- Do not poll the database every few seconds for every user; use scheduled jobs, bounded windows and queue claims.
- Keep dashboards simple; do not calculate expensive analytics on every page load.
- Add caching only to non-sensitive or safely scoped data; never let a cache key omit profile/user authorization context.

## Deployment and environments

- Separate local/test/staging/production environment variables.
- Provide `.env.example` with names and descriptions only, no secrets.
- Use migrations as part of deployment with rollback/backup plan.
- Configure HTTPS, trusted origin/CORS, secure cookies, email provider/domain verification, scheduler/worker and database backups.
- Restrict production admin/support access and use synthetic demo records only in public demos.
- Provide a health endpoint that reports service status without patient data or secrets.

## Future integration seams

Keep external integrations behind adapters. A future ABDM/FHIR effort must separately cover formal onboarding, approved scopes, consent flows, security assessment, conformance and operational approval. A FHIR-shaped database column alone is not integration. Future SMS/WhatsApp/voice channels also require consent, provider assessment and message privacy review.
