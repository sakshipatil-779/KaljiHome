# 11 — Validation and Test Plan

## Test strategy

Use a risk-based test pyramid: many small domain/unit tests, focused database/API integration tests and a smaller set of complete browser end-to-end flows. Security, timezone and medication-state correctness are release blockers.

## 1. Unit tests

### Medication schedule engine
- Daily schedule produces one occurrence per configured local time and date.
- Selected-weekday schedule does not produce occurrences on other days.
- Start/end dates are inclusive/exclusive according to one documented rule and tests.
- Profile timezone is applied correctly; no accidental UTC/local conversion drift.
- Daylight-saving gap/fold policy is deterministic for zones that observe DST.
- Schedule version change affects only occurrences after the effective boundary.
- Re-running generation creates no duplicates.
- Invalid frequency/time/date combinations are rejected.

### Dose-event transitions
- Only authorized and valid transitions are accepted.
- Taken is represented as a report, not verified ingestion.
- Skipped remains explicitly user-recorded.
- No event after grace becomes unconfirmed, not automatically skipped/taken.
- Late response preserves both scheduled time and actual recorded time.
- Correction appends a new event and retains prior history.
- Repeated idempotency key creates one logical event.

### Permission policy
- Each role/permission combination permits and denies expected actions.
- Revoked/pending/expired membership cannot access profile resources.
- Resource profile ID must match the membership scope.

### Notification logic
- Each reminder type is generated at configured offset/threshold.
- Opted-out recipient is not queued.
- Revoked member is not queued or is removed before send.
- Duplicate scheduler run creates no duplicate outbox item.
- Sensitive fields are excluded from templates by default.

## 2. Integration tests

- Create profile, invitation and membership in a transactionally consistent way.
- Accept passcode once; test concurrent acceptance race.
- Verify authorization at API and database boundary.
- Add/update medication and preserve old schedule version/history.
- Generate occurrences with correct profile scope.
- Record DoseEvent and AuditEvent atomically; verify outbox/event consistency.
- Trigger worker retries and permanent failure handling with a fake email provider.
- Validate provider webhook signatures if webhooks are used.
- Confirm revocation blocks subsequent API requests even with an existing session.

## 3. End-to-end scenarios

1. Owner creates profile and sees empty Today state.
2. Owner invites caretaker; caretaker accepts; both see the same profile with permitted actions.
3. Caretaker with restricted role records a dose but cannot edit the schedule.
4. Owner adds a fictional medicine and appointment; they appear in Today/Upcoming.
5. User records Taken and UI labels it as reported by that actor.
6. A second reminder is not acknowledged; configured grace triggers an unconfirmed/no-status alert.
7. Appointment reminder is queued and displayed in the development email sink or provider test inbox.
8. Read-only family member cannot mutate data through direct API calls.
9. Owner revokes caretaker; next request fails and member disappears from active Care Circle.
10. User can complete key tasks using keyboard only at mobile and desktop viewport widths.

## 4. Accessibility validation

- Run an automated scanner (e.g. axe integration) on Today, medication form, invite flow, appointments and modal dialogs.
- Manually verify semantic headings, landmarks, labels, fieldset/legend, error associations and announcement of status changes.
- Tab through every critical flow; visible focus; logical focus order; no keyboard trap.
- Screen-reader smoke test with one mainstream screen reader/browser combination available to the team.
- Test 200% zoom, narrow viewport/reflow, text spacing where practical and dark/high-contrast OS settings if supported.
- Confirm primary targets are preferably 44×44 CSS pixels and at minimum satisfy WCAG 2.2 AA 2.5.8 (24×24 CSS pixels or a valid exception).
- Check contrast for text, controls and focus indicators; do not rely on colour alone.
- Ask older adult participants to perform tasks and observe actual usability; automated scans are insufficient.

## 5. Security validation

- Run dependency vulnerability audit using available tooling.
- Scan for committed secrets and verify `.env` files are ignored.
- Test IDOR/BOLA across at least two profiles.
- Test role escalation, mass assignment and revoked membership.
- Test invite brute-force throttling, expiry and replay.
- Test XSS and SQL injection payloads in user-controlled fields.
- Verify CSRF/session protections appropriate to the architecture.
- Verify logs and email templates do not leak health content.
- Check security headers, cookie flags and HTTPS in deployment.
- Review with OWASP ASVS 5.0.0 categories proportionate to the system.

## 6. Efficiency and reliability validation

- Verify indexes support profile/time-window queries.
- Inspect query count on dashboard; avoid N+1 patterns.
- Load a synthetic profile with many occurrences/events and ensure pagination/bounded queries work.
- Test scheduler/worker under duplicate execution and transient email provider errors.
- Verify retry backoff is bounded and does not create notification storms.
- Measure frontend bundle and API latency in the available environment; record measurements honestly without inventing a target pass.

## 7. Six-criterion scoring evidence

| Criterion | Evidence to prepare for judges |
|---|---|
| Code Quality | Repository structure, types, lint/typecheck/build logs, documented domain services and reviewable diffs. |
| Security | Permission matrix, threat model, invite safeguards, negative authorization tests, safe email/log examples, secret scan. |
| Efficiency | Indexed query plan or schema, bounded pagination, bundle/query measurements, queue/idempotency demonstration. |
| Testing | Test summary with exact command/output, unit + integration + E2E coverage of critical scenarios. |
| Accessibility | WCAG 2.2 AA checklist, automated scan output, keyboard walkthrough, screen-reader/manual test notes. |
| Problem Alignment | End-to-end demonstration of all challenge requirements and evidence that the Care Circle adds collaboration beyond a simple alarm. |

## 8. Test data policy

Only synthetic names, medications, dose instructions, clinicians, appointments and email addresses. Prefix development fixtures with DEMO/SYNTHETIC where practical. Never use real patient records. Do not store demo credentials in public source or screenshots.

## 9. Release gate

Do not call the MVP ready if any of the following remains: cross-profile access vulnerability; caretaker permission escalation; passcode replay; schedule duplicate generation; false status transition from unconfirmed to taken/skipped; email contains sensitive details by default; critical flow is unusable by keyboard; build fails; or no evidence exists for medication-state tests. Document non-blocking limitations clearly.
