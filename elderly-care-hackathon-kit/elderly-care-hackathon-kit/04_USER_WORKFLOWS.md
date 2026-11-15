# 04 — User Workflows

## Workflow 1 — Create a care profile and establish owner control

1. User creates an account or signs in through the existing secure authentication flow.
2. User creates a care profile for themselves or begins an assisted setup for an older adult.
3. The interface clearly states who will own/control the profile and who is entering information.
4. Collect only required profile fields: display name, preferred language (if supported), timezone, contact/notification preferences and optional emergency contact label/number only if the product has a defined use for it.
5. Explain privacy and sharing in plain language. Do not preselect broad family access.
6. If a family member assists with setup, record the setup actor and capture the older adult's permission where possible. Do not assume legal authority based solely on relationship.
7. Show a “Your care circle” view with no members until invited.

**Success state:** A profile exists, owner is clear, timezone is explicit and no other person has access by default.

## Workflow 2 — Invite a family member or caretaker using a passcode

1. An owner or member with explicit `manage_members` permission selects Invite.
2. Enter invitee email, role and per-profile permissions. Display exactly what the person can view or change.
3. Server creates a cryptographically random, one-time code; binds it to the elder profile and intended invitee, sets a short expiry (e.g. 10 minutes), applies an attempt limit and stores only a keyed digest/HMAC.
4. Deliver the code through a protected channel. Do not expose the code in application logs or analytics.
5. Invitee signs in or creates an individual account, verifies the bound email and enters the code.
6. Server checks expiry, unused status, attempt count, invitee identity and profile scope; it consumes the code atomically.
7. Both sides see the member and permissions. Owner can revoke at any time.

**Failure states:** expired, invalid, already used, wrong email, rate-limited, revoked. Provide safe retry/resend flow without revealing whether another person's account exists.

## Workflow 3 — Add or change a medication schedule

1. Authorized member opens Medications and selects Add medication.
2. Form prompts them to copy details from the current prescription/clinician instruction. Fields should include medicine display name, strength, dose quantity/unit, route, schedule pattern, local time(s), start date, optional end date, instruction text, prescriber/source and who entered it.
3. Do not infer a dose, route or frequency from the medicine name.
4. User reviews a plain-language schedule summary and confirms it matches the source instruction.
5. New schedule has a draft/needs-confirmation state until confirmed by an authorized editor; for the MVP, one explicit confirmation is the minimum. A later version may require two-person verification for selected changes.
6. The schedule engine generates future occurrences in the profile timezone.
7. Editing a schedule creates a new version/effective date. Preserve past occurrences and events; do not rewrite historical events silently.
8. Pause/discontinue actions require confirmation and a reason/source note where appropriate.

**Safety message:** “Enter only the instructions on the current prescription or from the prescribing clinician. This app does not recommend doses.”

## Workflow 4 — View today's medication routine and record a status

1. Older adult opens Today. Show date, local time, medicine name as entered, strength, dose instruction and the scheduled time.
2. Primary options: Taken, Remind me later, Skipped, Unable to confirm. Use explicit text labels; icons are supplementary.
3. Before confirming Taken, show a light confirmation such as “Record that this dose was taken?” Avoid implying the app has verified ingestion.
4. On submission, server checks membership and permission, occurrence ownership/state and an idempotency key.
5. Create an immutable dose event with actor, timestamp, status and optional note; update the derived current state.
6. Display “Recorded by you / [member] at [time]”. A caretaker action must be labelled as caretaker-recorded.
7. Allow correction via a follow-up event or controlled correction flow; never erase the audit trail.

## Workflow 5 — Handle a dose with no recorded status

1. At schedule time, create an occurrence with status `scheduled`.
2. Send the upcoming reminder to enabled recipients according to their preferences.
3. After a configurable grace period, if no status exists, set the derived state to `unconfirmed_after_grace`.
4. Notify the older adult and authorized recipients with neutral language: “No status has been recorded for the 8:00 AM medication reminder.” Do not say “You definitely missed your medicine.”
5. Recipient can record a late Taken/Skipped/Unable-to-confirm event with its actual recorded time. Preserve scheduled time and event time separately.
6. If the user explicitly records Skipped, communicate that exact user-reported status; never generate missed-dose instructions.
7. If there is a configured escalation contact, send only after the policy's next step and only to a recipient authorized for that alert.

## Workflow 6 — Manage doctor appointments

1. Authorized member adds date, local time, clinician/facility display name, location/contact notes and optional purpose.
2. Show timezone clearly and allow editing/cancellation.
3. Set reminder offsets (e.g. 24 hours and 2 hours) per profile/preference; these are configurable examples, not mandatory medical rules.
4. Send emails with generic subject and minimal sensitive content. A secure sign-in is required to view detail.
5. Show appointment state: upcoming, completed, cancelled. Do not claim attendance unless a user records it.

## Workflow 7 — Review the shared care timeline

Show a chronological feed of medication schedule changes, dose status records, appointment additions/changes, invitations, permission changes and reminder outcomes. Each item needs actor, timestamp, event type and an appropriate detail level for the current viewer's permissions. Do not expose an audit log entry if the current member lacks permission for the underlying information.

## Workflow 8 — Revoke a member or end a caretaker relationship

1. Owner/member with `manage_members` opens Care Circle.
2. Selects member and reviews what access will be removed.
3. Confirms revocation.
4. Server marks membership revoked, invalidates invite/session-derived access and checks membership on every later request.
5. Show confirmation and retain a minimal audit event that access was revoked, by whom and when.

## Workflow 9 — Email notification lifecycle

1. A schedule/appointment event reaches its due point via the server scheduler.
2. Scheduler inserts a uniquely keyed notification into the outbox in the same transaction or through a safe transactional-outbox pattern.
3. Worker claims the item, rechecks recipient membership/preferences, sends the message, and stores attempt/provider status.
4. Transient errors retry with bounded exponential backoff and jitter. Permanent errors stop and become visible to operators.
5. Webhook/provider delivery events can update delivery status if available. Do not equate accepted/sent/delivered with read.
6. Retries must not create duplicate user-visible notifications when the provider supports idempotency; otherwise use a stable application notification key and record the residual limitation.
