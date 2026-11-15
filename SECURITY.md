# Security Blueprint — KaljiHome

KaljiHome implements a defense-in-depth, zero-trust security architecture designed specifically for sensitive personal healthcare coordination in accordance with OWASP Top 10 and the India DPDP Act.

---

## 1. Object-Level Access Control (IDOR/BOLA Protection)
* **Central Policy Gatekeeper:** Every profile-scoped read and write passes through `can(userId, action, profileId)` and `assertCan(userId, action, profileId)` in `src/services/policy.ts`.
* **Zero Client-Side Reliance:** Hiding UI controls does not represent authorization. API routes (`/api/medications`, `/api/dose-events`, `/api/appointments`, `/api/care-circle`) verify user membership and exact granted permissions server-side.
* **Immediate Revocation Enforcement:** When a member's access is revoked by the profile owner or care manager, the database status immediately switches to `revoked`. Active browser sessions are blocked on their very next request.

## 2. Passcode Architecture (No Shared Household Passwords)
* **Single-Use Scoped Passcodes:** Generates cryptographically secure 8-character codes (`generateInvitationCode`) bound to a single profile and intended email address.
* **Keyed HMAC-SHA256 Storage:** Plaintext invitation passcodes are **never** stored or logged in the database. Only HMAC digests (`code_digest`) keyed with a server secret are persisted.
* **Atomic Consumption & Rate Limiting:** Passcodes expire in 10 minutes, lock after 5 incorrect attempts, and are consumed atomically in a database transaction to eliminate race conditions and replay attacks.

## 3. Safe Notification Messaging (FR-027)
* **Lock-Screen Privacy Scrubbing:** Email subjects and preview snippets strictly exclude medication names, dosages, frequencies, and doctor consultation notes.
* **Neutral Subject Lines:** Reminders use non-identifying subjects (e.g. *"Upcoming Medication Reminder — KaljiHome"*) and require sign-in to the authenticated dashboard to view prescription details.

## 4. API Key & Secret Hygiene
* **Server-Side Execution Only:** Google Gemini API keys and Brevo email credentials remain strictly server-side in `.env.local` and environment variables. Zero credentials are leaked into client JavaScript bundles.
* **Repository Sanitation:** Committed `.env.example` contains only descriptive parameter names. `.env*.local` is explicitly ignored in `.gitignore`.

## 5. Input Validation & Prompt Injection Defense
* **Sanitization:** All inputs routed to Google Gemini AI are stripped of ASCII control characters (`[\x00-\x1F\x7F]`) and bounded in length before prompt interpolation.
* **Strict Clinical Boundary Invariants:** System prompts prohibit diagnosis, treatment modifications, or AI clinical triage.
