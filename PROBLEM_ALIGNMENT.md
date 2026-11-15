# Problem Statement Alignment — KaljiHome

## 1. Problem Definition
Indian older adults often manage complex multiple chronic medications across paper prescriptions, family WhatsApp chats, and separate calendars. Care is shared between relatives and paid caretakers, causing critical ambiguity: who updated a prescription, who gave the dose, did anyone check up after an alert, and when is the next clinic consultation? A standard smartphone alarm only alerts one person, lacks audit trails, and fails to support collaborative family care.

---

## 2. Requirement Mapping to KaljiHome Features

### §1.1 Patient-Controlled Care Circle
* **Problem:** Older adults feel disempowered when family members take over their healthcare decisions.
* **KaljiHome Solution:** The older adult (`usr_meera`) remains the profile owner. Members are granted explicit, revocable, least-privilege permissions. Hiding buttons is backed by server-side verification.

### §1.2 Scoped, One-Time Expiring Passcodes
* **Problem:** Shared household passwords compromise privacy and prevent accountability.
* **KaljiHome Solution:** Single-use 8-character passcodes valid for 10 minutes, bound to email, stored as HMAC-SHA256 digests, and atomically consumed.

### §1.3 Clinical Safety Guardrails
* **Problem:** Apps that auto-diagnose or guess drug names create fatal health risks.
* **KaljiHome Solution:** Strict prescription transcription only with mandatory human verification. Overdue doses transition to *"Unconfirmed / No status recorded"* — never auto-marked as skipped or taken. Zero missed-dose AI advice.

### §1.4 Proactive Notification Outbox
* **Problem:** Overdue doses go unnoticed by busy family members living in other cities.
* **KaljiHome Solution:** Transactional outbox with Brevo email delivery alerting caregivers of upcoming doses, unconfirmed grace alerts, and appointments without leaking sensitive drug names into lock-screen previews (FR-027).

### §1.5 Transparent Care Activity Feed
* **Problem:** Caregivers dispute who gave medication or whether a doctor visit was cancelled.
* **KaljiHome Solution:** Immutable event ledger tracking actor user ID, timestamp, and role for every recorded action.

### §1.6 Regional Dignity & Multilingual Access
* **Problem:** Language barriers prevent elderly patients from understanding daily schedules.
* **KaljiHome Solution:** Gemini AI-assisted care routine summaries in Marathi (*काळजी मार्गदर्शक*) and Hindi, alongside Doctor Visit Preparation Cards.
