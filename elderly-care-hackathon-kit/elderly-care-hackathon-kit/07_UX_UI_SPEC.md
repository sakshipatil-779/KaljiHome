# 07 — UX/UI Specification

## Experience direction

Warm, calm, dignified and highly readable. The product should feel like a dependable care companion, not a hospital control room, a surveillance dashboard or a children's app. Visual hierarchy should prioritise today's action and next appointment over charts and decorative metrics.

## Information architecture

- **Today:** date, local timezone, next dose, remaining dose timeline, status history for today, next appointment.
- **Medications:** active schedule list, add/edit/pause/discontinue, source and change history.
- **Appointments:** upcoming/past/cancelled list, appointment details and reminders.
- **Care Circle:** members, roles, permission detail, invite passcode flow, revoke access.
- **Timeline:** chronological changes, dose events, appointment changes and notification states.
- **Settings:** profile details, timezone, language, accessibility preferences, notification recipients/preferences, privacy and support.

Navigation labels should be explicit and consistent. Use a simple bottom navigation on small screens only if it remains labelled and accessible; desktop may use a compact sidebar.

## Primary screen: Today

1. Header with older adult's preferred display name, current date and timezone.
2. A small “Next” summary showing the next scheduled item and exact local time.
3. A chronological medication list with medicine name, strength, dose/route as entered, schedule time, status and clear action buttons.
4. Status text: Scheduled, Reminder sent, Taken (reported), Skipped (reported), Snoozed, Unable to confirm, No status recorded.
5. Upcoming appointment card with date/time, clinic/doctor name and edit/view action based on permission.
6. Care-circle context such as “Shared with 2 people” and “Last updated by [name] at [time]”.

Do not display a percentage adherence score as the core interaction. If a summary metric is added later, explain its calculation and avoid implying clinical adherence certainty.

## Medication add/edit form

- Medicine name (plain text; no autocomplete that silently chooses a drug).
- Strength (exact text/number/unit from source).
- Dose amount and unit (explicit, not guessed).
- Route (only when provided; allow “Not recorded” rather than forced guessing).
- Frequency/pattern and one or more local times.
- Start date and optional end date.
- Instructions (optional text copied from prescription/clinician).
- Source/prescriber note and person entering the details.
- Preview of next occurrences and timezone.
- Checkbox/confirmation: “I checked these details against the current prescription or clinician instruction.”

Show a permanent note that the app does not recommend or validate a dose. Do not offer AI auto-fill from medicine names.

## Passcode and Care Circle UX

Invitation screen must show:
- Invitee identity/email.
- Chosen role and each permitted action in plain words.
- Expiry and single-use nature of the code.
- Clear share/send action and confirmation after code creation.
- A revoke button with confirmation and clear consequences.

Never display a reusable permanent household passcode. Never put the passcode in a public URL or log. Hide or mask invitee contact information from members who do not need it.

## Notification language

Use short, factual and non-alarming language. Examples:

- Upcoming: “A medication reminder is scheduled for 8:00 AM. Open your care dashboard to view details.”
- No response: “No status has been recorded for a scheduled medication reminder. Please check the care dashboard.”
- Appointment: “You have an upcoming appointment. Sign in to view the details.”

Do not put medicine names, dosage, diagnosis, appointment purpose or patient name in the subject line by default. Do not say the email was read. Do not say the medicine was definitely missed based only on the absence of a response.

## Visual and interaction requirements

- Body text target: 18px or larger for primary older-adult views; use relative units and support browser zoom.
- Primary button height/active target: aim for 48–56 CSS pixels; maintain generous gaps between destructive and positive actions.
- Prefer 44×44 CSS-pixel targets. WCAG 2.2 AA target-size minimum is 24×24 CSS pixels with specified exceptions.
- Contrast: meet WCAG AA (normal text 4.5:1, large text 3:1); use non-colour text labels alongside status colours.
- Use readable fonts with clear numeral forms. Avoid thin weights, all-caps paragraphs and long italic text.
- Do not convey critical meaning through red/green alone.
- Keep focus visible and logical. On modal open, move focus into the dialog; on close, return focus to the trigger.
- Avoid drag-only controls, hover-only content, auto-advancing carousels, short timeout forms and tiny icon-only buttons.
- Use progressive disclosure: show necessary details first, optional complexity behind clearly named expansion sections.
- Every control must have a visible label or accessible name. Errors must explain the correction and be associated with the input.
- Destructive actions (delete/discontinue/revoke) require an explicit confirmation and explain impact. Prefer reversible pause/archive over hard delete when an audit trail is required.

## States every important screen must design

Loading, empty state, success, validation error, server error, offline/slow network, permission denied, expired session, expired invitation, revoked access, no email configuration and delayed/failed email delivery. Do not leave a blank screen or an inert button.

## Responsive expectations

Support narrow mobile portrait, tablet and desktop layouts. On mobile, use a single-column primary flow and keep key actions reachable without horizontal scrolling. Tables should collapse to labelled cards or remain scrollable with clear context. Ensure browser zoom/reflow and keyboard focus do not cause hidden content.

## Language and tone

Use respectful, adult language. Say “older adult”, “care recipient”, “family member” or the person's preferred name. Avoid “old people”, “non-compliant”, “failed patient” and infantilizing icons. Write in short sentences. Plan for translation, but do not rely on raw machine translation for medical instructions; have language packs reviewed by fluent humans.

## UX validation tasks

Ask participants to: find the next dose; record Taken; correct an accidental status; find who changed the medicine schedule; invite a caretaker with read-only access; understand a no-response alert; find an upcoming appointment; revoke access. Record completion, hesitation, errors and participant feedback. Never use real personal health data in tests.
