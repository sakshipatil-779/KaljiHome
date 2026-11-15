# 06 — MVP Scope and Prioritization

## MVP goal

Demonstrate one complete, safe routine-care loop across an older adult and at least one authorized helper: invite → manage medicine/appointment → send reminders → record/see events → revoke access.

## Must ship (P0)

1. Individual sign-in and care profile creation.
2. Explicit owner/control model and care-circle member list.
3. One-time passcode invitation with expiry, rate limits and scoped role permissions.
4. Medication creation/edit/pause/discontinue from manually entered source instructions.
5. Timezone-aware schedules and generated dose occurrences.
6. Today and upcoming routine views.
7. Dose statuses: Taken, Skipped, Snoozed, Unable to confirm; overdue/no response remains Unconfirmed.
8. Appointment CRUD and upcoming appointment view.
9. Email reminders for upcoming doses, no-status alerts after grace and appointment reminders.
10. Shared activity timeline with actor/time and auditable schedule changes.
11. Role-based server authorization and immediate membership revocation.
12. Accessible responsive layouts and test evidence for six scoring dimensions.

## Should ship if time allows (P1)

- Care handoff with assigned helper and backup.
- Alert preference controls and configurable grace/appointment offsets.
- Optional reason note on Skipped/Unconfirmed.
- Appointment preparation summary.
- Professionally reviewed English/Hindi/Marathi copy if competent reviewers are available.
- Low-stock reminder based on a user-entered quantity, clearly separated from clinical advice.
- Accessible print/export of the schedule for the older adult, with explicit permission and no extra health data.

## Explicitly defer (P2 / out of MVP)

- AI chatbot for medical questions.
- Symptom interpretation, diagnosis, triage or risk prediction.
- Drug interaction checker, side-effect prediction or dose recommendation.
- Prescription OCR that directly creates or activates medicine schedules.
- AI-generated treatment plan, dose changes or “missed dose recovery” advice.
- Video consultations or clinician portal.
- ABHA/ABDM integration until formal sandbox, consent and conformance work is approved.
- Pharmacy ordering, medicine delivery and payment flows.
- Wearable/IoT integrations, biometric adherence proof or pillbox integrations.
- Emergency-service dispatch or guaranteed emergency notifications.
- Complex analytics, predictive scores or gamified adherence pressure.

## Suggested hackathon demo narrative (4–6 minutes)

1. Open the older adult's Today page with readable medication and appointment summaries.
2. Show the Care Circle roster and current permissions.
3. Invite a caretaker; demonstrate successful code acceptance and one invalid/expired-code rejection.
4. Add a sample medication from a fictional prescription; show source/confirmation and local schedule.
5. Record a dose as Taken by the older adult, then show how a caretaker-recorded status is attributed differently.
6. Show a second occurrence with no response; demonstrate a neutral “No status recorded” alert, not a clinical conclusion.
7. Add an appointment and show email outbox/preview/test delivery.
8. Switch to read-only member and show blocked editing; revoke caretaker access and show that the next request fails.
9. Finish with test/security/accessibility evidence, not a fabricated score.

## Non-goals and scope guardrails

- Do not build a dozen dashboards before core dose and access flows work.
- Do not add fake integrations or simulated emails that appear to be real; label development sinks clearly.
- Do not make the product dependent on an unavailable paid API.
- Do not put medical data in demo screenshots or public seed accounts.
- Do not claim reminders guarantee adherence or improve clinical outcomes without evaluation.
