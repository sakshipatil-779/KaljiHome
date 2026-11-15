# 10 — Security, Privacy and Trust

## Threat model

### Assets to protect

Identity and contact details; older-adult profile; medicine names/strengths/doses/timings; appointment details; care relationships; notification destinations; session credentials; invitation tokens; audit history; provider credentials.

### Likely threats

- A guessed/modified profile ID exposes another person's medicines (IDOR/BOLA).
- A family member receives permissions broader than intended.
- A shared or reusable passcode lets an unintended person join.
- A revoked caretaker continues using an active session.
- An email subject or preview exposes a medicine/diagnosis to a shared inbox or lock screen.
- Repeated scheduler retries create multiple reminders or dose events.
- Malicious input causes XSS, SQL injection, mass assignment or unsafe file upload.
- A leaked API key enables forged email or data access.
- A platform operator or analytics tool receives more health data than needed.
- Shared devices leave a signed-in session available to the next person.

## Access-control model

Use individual accounts and profile-specific memberships. An email address or family relationship is not authorization. Define an explicit matrix for `view_profile`, `view_medications`, `manage_medications`, `record_dose`, `view_appointments`, `manage_appointments`, `view_timeline`, `manage_members` and preferences.

For every read/write, the server verifies: authenticated user → active membership for target profile → required action permission → resource belongs to same profile → resource state permits operation. Test object-level authorization with a second profile and a revoked account.

The older adult should see the current care circle and the permissions granted. A legally authorized representative situation may require special handling; do not infer that status from a “child”, “spouse” or “caretaker” label. Obtain legal advice for incapacity/representation workflows.

## Passcode design

- Create cryptographically random, one-time invitation codes scoped to a single profile and a single intended invitee.
- Prefer at least 8 decimal digits or a longer alphanumeric code; combine with verified invitee identity, strict rate limits and short expiry. Do not rely on code length alone.
- Expiry recommendation for the prototype: 10 minutes; configurable and displayed.
- Limit attempts (e.g. 5) and apply IP/account-level throttling and abuse monitoring.
- Store a keyed digest/HMAC using a server secret; never store or log plaintext codes.
- Accept atomically so concurrent attempts cannot reuse the same code.
- Bind to normalized invitee email and re-check it at acceptance.
- Invalidate on use, expiry, cancellation, member revocation or resend that replaces the token.
- Do not put passcodes in URL query strings, browser analytics or crash logs.

## Authentication and session controls

Prefer a trusted auth provider. If the app manages passwords, use a modern password hashing scheme and secure recovery. Use Secure, HttpOnly, SameSite cookies; rotate session IDs after authentication and privilege change; expire/revoke sessions appropriately; protect state-changing requests from CSRF. Offer re-authentication for sensitive actions such as changing access grants. Ensure sign-out works on shared devices. Do not expose tokens to localStorage if an HttpOnly session model is feasible.

## Health-data minimization and safe messaging

- Collect only data used by a named feature.
- Do not add date of birth, address, diagnosis, insurance, Aadhaar or ABHA fields “just in case”.
- Do not put medicine/dose/diagnosis/appointment purpose into email subject or preview by default.
- Email should say a reminder is available and require sign-in for detail.
- Keep third-party analytics free of health details, profile IDs that can identify people, and dose-event payloads.
- Do not sell, advertise against, or share user health information for unrelated purposes.
- Do not include real patient data in logs, error traces, code samples, public demo accounts or screenshots.

## Encryption and infrastructure

- Enforce HTTPS/TLS for all network traffic in deployed environments.
- Use managed encryption at rest for databases, object storage and backups; protect keys and rotate them according to provider guidance.
- Store secrets in the deployment secret manager/environment, not repository files or client bundles.
- Restrict database credentials by environment and least privilege.
- Backups must be encrypted and restore-tested.
- Keep production support access controlled, logged and time-limited.

## Application security controls

Validate input at server boundaries with allowlisted enums and length/range constraints. Parameterize queries. Escape user-controlled output. Use framework protections and a strict Content Security Policy. Prevent mass assignment by selecting writable fields explicitly. Protect upload endpoints or omit uploads from MVP. Validate webhook signatures. Apply rate limits to login, invite, email and high-impact actions. Return generic authentication/invite errors where detailed responses could leak account existence.

## Audit and accountability

Log invitation creation/acceptance/revocation, membership changes, sensitive data access where feasible, medication/schedule changes, dose events, appointment changes and notification failures. Include actor, timestamp, action, resource reference and request correlation ID. Do not copy medicine names, dose instructions, symptoms or full request bodies into security logs. Audit data is access-controlled and append-only by application convention.

## Reminder reliability and user trust

Email is not an emergency channel and is not guaranteed to be delivered, read or acted upon. The UI must distinguish queued, provider-accepted, delivered/bounced when provider data exists, and failed. Do not call a message “read” without a real read signal—and do not add invasive tracking solely for that claim. Keep the in-app dashboard as the source of current state.

## India privacy/legal planning

- The ABDM Health Data Management Policy is a design reference for privacy-by-design, purpose limitation, consent and data minimization; formal ABDM ecosystem participation requires separate onboarding and conformance.
- The DPDP Act, 2023 and Rules, 2025 have phased commencement. On the research date, some early provisions are in force from 13 November 2025 and the one-year tranche from 13 November 2026; the eighteen-month tranche is scheduled for 13 May 2027. The IT Act section 43A and SPDI Rules remain relevant until the section 44(2) change takes effect. Check the official Gazette for updates and get advice from qualified Indian counsel.
- Do not claim legal compliance just because a privacy policy page exists. Policies, consent, security controls, vendor contracts, rights handling, breach process and retention must match the real system.
- The product is not a HIPAA product merely because it manages health information; do not claim HIPAA compliance. Obtain professional advice on Indian regulatory classification and obligations before making clinical claims or launching.

## Incident response checklist

1. Detect and classify suspected account compromise, unauthorized access, lost device, passcode abuse or provider credential leak.
2. Contain: revoke sessions/tokens, disable affected invite flows, rotate secrets, restrict access.
3. Preserve minimal relevant logs without spreading sensitive data.
4. Assess impacted profiles, data types, recipients and time range.
5. Follow the currently applicable legal/regulatory and contractual notification obligations, confirmed by counsel.
6. Communicate transparently to impacted users and provide protective steps.
7. Patch, test, document root cause and review whether the product design needs change.

## Security acceptance tests

- User A cannot read User B's profile by changing an ID in URL/API.
- Read-only member cannot post medication edits, appointment edits or membership changes by calling APIs directly.
- Caretaker with dose-record-only permissions cannot edit schedule or add members.
- Expired, consumed, wrong-invitee and revoked passcodes fail.
- A revoked member's already-issued session cannot access profile data after revocation.
- Invalid/out-of-profile occurrence and appointment IDs are rejected.
- Concurrent repeated dose submissions create one logical event.
- Email subject and routine logs contain no medicine name or dosage.
- Provider secrets are absent from client bundles and repository history.
