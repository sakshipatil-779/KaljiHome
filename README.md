# KaljiHome (काळजी) — Elderly Care & Medication Management Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-2.1-success.svg)](https://vitest.dev/)
[![WCAG 2.2 AA](https://img.shields.io/badge/Accessibility-WCAG%202.2%20AA-emerald.svg)](https://www.w3.org/WAI/WCAG22/quickref/)

**KaljiHome** (*काळजी* — affectionate care, concern, and protection in Marathi/Hindi/Gujarati) is an India-first, patient-centered healthcare and daily medication management platform. It helps older adults manage daily medications and doctor appointments while keeping authorized family members and caretakers safely coordinated through a scoped **Care Circle**.

---

## 🌟 Brand Identity & Logo

- **Visual Concept:** Gentle caring hands forming the protective roof of a welcoming home, cradling an inner terracotta heart of affection and emerald leaf of health.
- **Assets Included:**
  - `public/assets/kaljihome_brand_logo.jpg` — High-resolution brand graphic.
  - `public/assets/kaljihome_logo.svg` — Scalable vector logo with wordmark, tagline, and Marathi cultural badge (`काळजी`).
  - `public/assets/kaljihome_icon.svg` — Standalone squircle application icon and favicon.
  - `src/components/Logo.tsx` — Accessible, responsive React brand component.

---

## 🚀 Key Features

1. **Elderly Agency at the Center:** Older adults own their care profile (`prof_meera`), review routines in local time (`Asia/Kolkata`), record self-reported dose actions, and maintain full control over Care Circle access.
2. **Cryptographic Passcode Invitations:** Replaces insecure shared household passwords with single-use, 10-minute expiring passcodes stored strictly as HMAC-SHA256 digests.
3. **Strict Clinical Safety Boundaries:**
   - Transcribes details directly from valid clinician prescriptions with mandatory human confirmation.
   - Prohibits AI auto-guessing of drugs or dosages.
   - Differentiates user-reported taken events from biochemical ingestion.
   - Grace period evaluator transitions overdue doses to `Unconfirmed / No status recorded` (never auto-marked skipped or taken).
   - Directs users to prescribing clinicians/pharmacists; never advises doubling a dose.
4. **Privacy-Preserving Notification Outbox:** Dispatches proactive email reminders for upcoming doses, unconfirmed grace alerts, and appointments. Subjects and previews are strictly scrubbed of medication names, doses, and diagnoses (FR-027).
5. **Interactive Persona Switcher:** Switch between 5 personas directly in the header to test RBAC and authorization in real-time:
   - **Meera Sharma:** Older Adult & Profile Owner (Full control)
   - **Arjun Sharma:** Family Care Manager / Son (Prescriptions & appointments)
   - **Sunita Patil:** Paid Caretaker (Dose recording only; cannot alter prescriptions)
   - **Nisha Sharma:** Family Member (Read-only viewing)
   - **Dev Anand:** Independent Older Adult
6. **Chronological Care Timeline:** Audit feed recording all medication updates, dose events, and appointments with actor attribution and timestamps.

---

## 🛠️ Quickstart

### 1. Requirements
- Node.js 18+ (tested on Node v24.14.0)
- npm 9+

### 2. Installation
```bash
npm install
```

### 3. Run Automated Tests
```bash
npm run test
```
*Executes all 21 unit and integration tests across crypto, RBAC policy, scheduling, and adherence ledgers.*

### 4. Code Quality & Linting
```bash
npm run lint
```
*Runs Next.js and ESLint code hygiene checks (0 warnings, 0 errors).*

### 5. Production Build
```bash
npm run build
```

### 6. Start the App
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📊 Six Hackathon Evaluation Criteria

| Criterion | Score & Evidence Summary |
|---|---|
| **Code Quality** | Strict TypeScript, modular services (`src/services/`), clean ORM schema, 0 lint warnings, clean build. |
| **Security** | Centralized `can(user, action, profile)` policy, HMAC-SHA256 passcodes, atomic invite transactions, immediate revocation. |
| **Efficiency** | Indexed relational schema, bounded horizons, unique idempotency deduplication keys, zero external database daemons. |
| **Testing** | 21 unit & integration tests in Vitest covering security negative tests, timezone recurrence, and adherence state machines. |
| **Accessibility** | WCAG 2.2 AA target, min 48px touch targets, visible focus outline, high contrast, zero color-only states. |
| **Problem Alignment** | Collaborative Care Circle, elder at center of care, transparent attribution, proactive reminders, India DPDP Act alignment. |

For detailed findings, please see `CURRENT_STATE_AUDIT.md`, `GAP_ANALYSIS.md`, `DECISIONS.md`, and `FINAL_DELIVERY_REPORT.md`.
