# Testing Strategy & Quality Assurance — KaljiHome

KaljiHome utilizes a risk-based testing pyramid with automated unit, integration, and security negative tests executed via **Vitest**.

---

## 1. Test Architecture & Coverage

### §1.1 Cryptographic & Security Verification
* **PBKDF2 Password Hashing:** Validates unique salt generation, iteration depth, and timing-safe equality verification in `src/lib/db.test.ts`.
* **HMAC-SHA256 Passcode Digests:** Verifies deterministic digest generation bound to profile ID and normalized email address.
* **Format Compliance:** Asserts 8-character human-friendly invitation code structure (`XXXX-XXXX`).

### §1.2 RBAC Policy & Authorization (Negative Security Testing)
* **Least Privilege:** Verifies permissions across `owner`, `care_manager`, `caretaker`, and `read_only` roles.
* **Negative Authorization:** Asserts that read-only members cannot edit medications or record doses, and that caretakers cannot alter prescriptions or invite members.
* **Cross-Profile IDOR Protection:** Asserts that users from separate profiles cannot view or mutate another patient's medical data.

### §1.3 Recurrence Engine & Timezone Accuracy
* **Calendar Math:** Validates daily and selected weekday occurrence generation in `Asia/Kolkata` (+05:30 IST) without UTC conversion drift.
* **Prescription Confirmation Guardrail:** Asserts that adding a medication without checking the human prescription confirmation checkbox throws a clinical safety exception.
* **Idempotency:** Re-running generation creates zero duplicate database records.

### §1.4 Adherence State Machine & Grace Period
* **Actor Attribution:** Validates that Taken events record the actor ID, timestamp, and source (`older_adult`, `caretaker`, `family`).
* **Grace Period Evaluator:** Verifies that overdue occurrences past their grace deadline transition to `unconfirmed_after_grace`, and are **never** falsely auto-marked as taken or skipped.
* **Idempotency Deduplication:** Submitting duplicate events with identical idempotency keys is safely rejected.

### §1.5 Notifications & Outbox
* **Privacy Enforcement (FR-027):** Verifies that rendered email subjects and previews strictly omit drug names, strengths, and medical diagnoses.
* **Eligibility Re-check:** Verifies that outbox dispatching re-validates active recipient membership before delivery.

---

## 2. Test Execution Commands

Run all tests:
```bash
npm run test
```

Watch mode for development:
```bash
npm run test:watch
```

Current Results: **21/21 passing (100% success rate)**.
