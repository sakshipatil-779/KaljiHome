# 01 — Problem Statement and Opportunity

## Challenge statement (preserved in meaning)

Develop a smart, interconnected healthcare management platform that helps elderly individuals manage daily medications, medical appointments and healthcare routines while keeping family members and caretakers informed. Authorized members must be able to securely access a shared healthcare profile using passcode-based access, view/add/edit/manage medication schedules, track adherence and monitor upcoming doctor appointments. The platform must proactively send email reminders for missed medications, upcoming doses and appointments. It must be more than a basic reminder app, and older adults must remain central to their healthcare decisions.

## Reframed problem

The core problem is **fragmented routine-care coordination**. Information is often spread across prescriptions, medicine packaging, calendars, phone calls and the memories of several people. A standalone alarm may notify someone, but it does not reliably answer:

- Which schedule is current, and who last changed it?
- Who is allowed to see or update the older adult's health profile?
- Has a dose been recorded, was it explicitly skipped, or is its status simply unknown?
- Who is responsible for helping when there is no response?
- What appointments are approaching, and who has been notified?
- Can access be revoked when a caretaker or family arrangement changes?

The opportunity is to create a shared source of routine-care coordination with clear permissions and trustworthy status—not to automate medical judgment.

## Current-state failure modes to test in user research

1. **Single-user reminder gap:** reminders reach one device/account but not the person supporting the older adult.
2. **Unclear responsibility:** several family members assume someone else has checked the routine.
3. **Ambiguous adherence:** absence of a tap is mistaken for a missed dose, or a tap is treated as proof the medicine was taken.
4. **Unsafe schedule edits:** no clear source, editor or history for medication changes.
5. **Weak access control:** a shared static code or shared login exposes the entire profile indefinitely.
6. **Notification fatigue:** alerts are too frequent, duplicated, sent to the wrong person or contain excessive health detail.
7. **Accessibility friction:** small controls, dense screens, unfamiliar icons, low contrast and complicated setup make independent use difficult.
8. **Disconnected appointments:** appointments exist in a separate diary and are not visible in the same care workflow.
9. **Connectivity and delivery uncertainty:** email may be delayed, filtered or never opened; the product may overstate successful delivery.

These are hypotheses to inspect and validate, not verified facts about the user's current website.

## Primary jobs to be done

- “Help me see what I need to do today without reading a complicated dashboard.”
- “Let my chosen family member or caretaker help, but only with the access I grant.”
- “Show everyone what has been recorded and who recorded it.”
- “Let us know when a dose has no recorded status or an appointment is coming up.”
- “Make it easy to correct a schedule when the clinician changes it, while preserving what changed.”
- “Help me stay in charge rather than making me feel monitored or controlled.”

## Product opportunity

Position the solution as a **Care Circle + Daily Care Timeline**. A patient-centred profile, permission model, dose-event ledger and appointment calendar form the core. Smartness comes from coordination, clarity and reliable automation—not risky AI-generated clinical advice.

## Out of scope

Diagnosis, symptom triage, prescribing, dose recommendations, drug-interaction analysis, automatic prescription interpretation, medication ordering/delivery, emergency services, remote patient monitoring, insurance decisions and replacement of a hospital/clinician system.
