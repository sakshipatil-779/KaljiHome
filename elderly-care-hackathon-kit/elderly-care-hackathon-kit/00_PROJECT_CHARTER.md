# 00 — Project Charter

## Mission

Help older adults stay in control of daily healthcare routines while giving the people they trust a safe, transparent way to support them.

## Vision

One shared, accessible and permission-based care space for medicines, appointments and care coordination—without taking medical decisions away from the person or their clinician.

## Objectives

1. Reduce missed or unrecorded routine events through useful reminders and a shared timeline.
2. Reduce ambiguity across family members and caretakers by showing responsibility, status and event attribution.
3. Make medication and appointment information easy to view, update and verify.
4. Give the older adult understandable control over who can access which parts of their profile.
5. Make the system usable for people with changing vision, hearing, mobility, memory and digital confidence.

## Scope statement

The MVP covers patient profile, care-circle invitations, scoped access, medication schedule management, adherence event recording, appointment management, email reminders, audit history and a simple shared dashboard. It is a coordination product; it does not provide clinical decisions.

## Guiding principles

- **Agency before surveillance:** an older adult should be able to understand and control sharing. Monitoring is opt-in and visible.
- **Support, not replacement:** caregivers assist; they do not automatically own the profile.
- **Truthful status:** distinguish planned, self-reported, caregiver-recorded, skipped, snoozed and unconfirmed events.
- **Safety over cleverness:** do not infer clinical meaning from incomplete data.
- **Privacy by default:** minimum data, minimum permissions, visible access and revocation.
- **Accessible by design:** avoid tiny type, dense dashboards, ambiguous icons and color-only signals.
- **Reliable delivery:** reminders must be generated deterministically, deduplicated and logged; email delivery is never guaranteed.
- **Explainability:** users can see what changed, who changed it and when.

## Stakeholders

Older adults/care recipients, family care managers, paid caretakers, platform operator/support, hackathon judges and (for later review) clinicians/pharmacists and legal/privacy advisors.

## Assumptions to validate

- Some older adults will use the platform themselves; others will need assisted onboarding.
- A care recipient may have more than one family member/caretaker and each needs a different permission set.
- Email is a required channel in the challenge statement, but some older adults may not check email regularly; the app should also show in-app status and allow an authorized family recipient to receive configured alerts.
- Users may share devices or have unreliable connectivity.
- A manually entered medicine schedule can contain errors; confirmation against the source prescription is essential.

These are product hypotheses, not claims about every older adult.

## Constraints

- Hackathon time, team size, API access, email quotas and hosting credentials may be limited.
- No live hospital/ABDM/EMR integration is assumed.
- No clinical validation is assumed.
- The actual existing website and repository have not been supplied in this request; a codebase audit is required before implementation changes.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Incorrectly entered dose | Source-of-truth prompt, required confirmation, editor attribution, immutable change history. |
| False missed-dose alert | Label it “No status recorded” after configured grace; allow late status entry; do not infer ingestion. |
| Caregiver sees more than intended | Per-profile invitations, explicit scope, server-side authorization, audit and revocation. |
| Duplicate emails | Transactional outbox, unique event key, retries and delivery attempt log. |
| Confusing older users | Plain language, large controls, progressive disclosure, usability testing with older adults. |
| Over-scoped AI features | Keep diagnosis, drug safety analysis, OCR activation and chatbot advice out of MVP. |

## Definition of success

A user can safely create a care circle, add a medication schedule and appointment, receive relevant email reminders, record a dose status, see who recorded it, and revoke another member's access. The flows work on mobile, are keyboard-accessible, and pass the security and test checks in the validation plan.
