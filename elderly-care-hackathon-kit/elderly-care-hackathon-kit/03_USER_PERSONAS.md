# 03 — User Personas

Personas are research hypotheses for design and testing, not stereotypes or claims that every older adult behaves alike. Validate them with real participants. All names are fictional.

## Persona A — Meera, older adult and care recipient

**Context:** 72, lives with a spouse, uses a smartphone for calls and messaging, prefers large text and predictable screens. Her adult daughter lives in another city and helps coordinate appointments.

**Goals:** Know what is scheduled today; record a dose without navigating multiple screens; see which family members can access her profile; stay in control of changes.

**Frustrations / risks:** Small buttons, unexplained medical abbreviations, being treated as incapable, family members changing information without telling her, too many notifications.

**Needs:** A simple “Today” screen, clear medication name/strength exactly as entered, large Taken / Skipped / Remind me later actions, visible source and timestamp for changes, privacy/access panel, option to ask a trusted person for help.

**Design rule:** Default to direct, respectful language and patient visibility. Do not use infantilizing copy, forced caretaker mode or a hidden “patient” view.

## Persona B — Arjun, family care manager

**Context:** 39, works full-time, lives in another city, coordinates care with a sibling and a paid caretaker.

**Goals:** Keep the schedule current, receive important no-response and appointment alerts, know who recorded a dose, share responsibility without giving everyone full control.

**Frustrations / risks:** Phone calls to verify routine events, conflicting versions of the medication list, unclear alert status, shared passwords, alert overload.

**Needs:** Role-based invitations, a shared timeline, medication change history, configurable alert recipients, appointment overview and a quick way to contact the older adult/caretaker.

**Design rule:** The family manager's convenience must not override the older adult's consent or permissions.

## Persona C — Sunita, paid caretaker / helper

**Context:** 48, supports multiple households, uses a mobile browser, may have limited time between tasks.

**Goals:** Quickly see today's tasks for the assigned person, record accurately, avoid accidental edits to prescribed details and hand off unresolved tasks.

**Frustrations / risks:** Being given the wrong schedule, navigating a dense app, being blamed for a task not assigned to her, using a shared phone/account.

**Needs:** A simple assigned-person selector, clear date/time, large action controls, actor attribution, read/record permissions without medicine-edit privileges by default, sign-out and privacy on shared devices.

**Design rule:** A caretaker is not automatically a medication prescriber or administrator. Grant only the permissions needed for the specific care task.

## Persona D — Dev, older adult with low digital confidence

**Context:** 79, may use a basic smartphone and sometimes needs a relative to help with setup. May have reduced vision, hearing, dexterity or memory, with capabilities varying day to day.

**Goals:** Complete essential actions with minimal typing and without fear of making an irreversible mistake.

**Frustrations / risks:** Password complexity, tiny controls, hidden menus, confusing status colors, time-limited forms, unclear error messages.

**Needs:** Assisted onboarding, simple recovery, readable labels, forgiving confirmation flows, no drag-only interaction, clear “saved / not saved” feedback, support contact route.

**Design rule:** Offer assistance without silently transferring account ownership or broad data access.

## Persona E — Nisha, read-only family member

**Context:** 34, is a relative who wants awareness of upcoming appointments but should not be able to modify medication details.

**Goals:** See the information the older adult has chosen to share and know when action is needed.

**Needs:** Read-only scope, no editing controls, notification preferences, clear indication of last update and who is responsible.

**Design rule:** Read-only must be enforced by the server, not only by hiding edit buttons.

## Cross-persona accessibility and trust needs

- A person may switch between independent use and assisted use; do not attach assumptions to age alone.
- Multiple people may share a device. Session visibility, sign-out, member-specific accounts and no shared global password are important.
- Each care profile needs its own timezone, contact preferences and access roster.
- Users need to distinguish schedule data, self-reported events, caretaker-recorded events and system-generated alerts.
- Caregivers need boundaries too: assignment visibility, handoff, and a way to state that they cannot complete a task.

## Research recruitment and validation

Before final UX sign-off, aim to test with at least 3–5 older adults across different levels of digital confidence and 3–5 family/caretaker participants if access and consent allow. This is a formative hackathon usability sample, not a statistically representative study. Ask participants to complete a medication reminder, record an event, find an appointment, invite a helper and revoke access. Observe where they hesitate; do not coach until after the attempt. Provide accessible consent and do not use real medication/health details during prototype testing.
