# DECISIONS.md — Architecture & Technical Choices

**Project:** KaljiHome (Elderly Care & Medication Management Platform)  
**Date:** 15 November 2026  
**Architect:** Antigravity  

This document logs significant technical, architectural, and safety decisions made in accordance with `08_TECHNICAL_ARCHITECTURE.md` and `AGENTS.md`.

---

## Decision 1: Application Architecture & Technology Stack
- **Context:** The repository had no pre-existing application code. `08_TECHNICAL_ARCHITECTURE.md` recommends a monolithic, TypeScript-first web architecture.
- **Decision:** Build **KaljiHome** as a TypeScript full-stack web application using Next.js (App Router), React, Tailwind CSS, Lucide Icons, SQLite (via `better-sqlite3` / typed SQLite schema), and Vitest / Node test runner.
- **Rationale:**
  1. Complete type-safety across frontend UI, server API routes, and database access.
  2. Single coherent codebase with fast local development, testing, and zero external database daemon dependencies during evaluation or judge review.
  3. Relational SQLite with strict foreign keys, parameterized queries, and ACID transactions satisfies all relational model requirements in `09_DATA_MODEL.md`.
  4. Next.js server actions / route handlers keep business logic and authorization strictly server-side.

## Decision 2: Branding & Identity — "KaljiHome"
- **Context:** The project requires a warm, dignified, culturally grounded identity suitable for an Indian-first elderly care and medication coordination platform.
- **Decision:** Name the platform **KaljiHome** (from Marathi/Hindi/Gujarati *काळजी / કાળજી* meaning affectionate care, concern, and protection).
- **Design Metaphor:** Gentle, caring hands forming the roof of a welcoming home, cradling a heart and leaf of health. Color palette uses calm warm terracotta (`#C85A32`), serene deep teal (`#115E59`), warm cream (`#FAF8F5`), and dark slate (`#1E293B`) for high-contrast accessibility.
- **Assets:** Custom SVG logo, responsive header brandmark, favicon, and generated AI brand mark.

## Decision 3: Security & Passcode-Based Care Circle Access
- **Context:** Passcodes must not be permanent household passwords, global codes, or insecure tokens.
- **Decision:** 
  1. Passcodes are cryptographically random 8-character codes generated using Node `crypto.randomBytes`.
  2. Stored strictly as HMAC-SHA256 digests (`code_digest`) with a server-side secret key; plaintext codes are never persisted or logged.
  3. Single-use, expiring (default 10-minute prototype TTL), with an attempt counter (max 5) and rate limits.
  4. Scoped to a single `elder_profile_id` and intended invitee email.
  5. Acceptance occurs in an atomic database transaction.

## Decision 4: Separation of Planned Occurrences and Dose Events
- **Context:** `09_DATA_MODEL.md` requires that planned occurrences and recorded events must never be conflated.
- **Decision:**
  1. `DoseOccurrence`: Represents the planned schedule slot (e.g. 8:00 AM on 15 Nov 2026), generated idempotently by the timezone-aware recurrence engine.
  2. `DoseEvent`: Immutable event record of an action taken (reported_taken, reported_skipped, snoozed, unable_to_confirm, correction, unconfirmed_after_grace) including actor ID, timestamp, and source.
  3. Derived status is computed from the event ledger; past events are never overwritten when schedules change.

## Decision 5: Clinical Safety & Ethical Language
- **Context:** Overdue doses or missing responses must never be clinically misinterpreted.
- **Decision:**
  1. "Taken" is always presented as "Reported taken by [Name] at [Time]", never as "Verified ingestion".
  2. Unanswered occurrences after the grace period transition to "Unconfirmed / No status recorded" — never automatically to "Skipped" or "Taken".
  3. The platform explicitly prohibits and disclaims clinical decision-making, diagnosis, or advice on compensating for missed doses. A clear advisory directs users to consult their prescription, doctor, or pharmacist.

## Decision 6: Notification Outbox & Privacy-Preserving Emails
- **Context:** Email delivery is not guaranteed real-time, and email previews can leak sensitive health details on lock screens.
- **Decision:**
  1. Transactional `NotificationOutbox` with unique dedupe keys, status tracking (`queued`, `dispatched`, `failed`), retry counters, and attempt logs.
  2. Privacy-preserving email templates: Subjects and previews do not include medication names, dosages, or appointment reasons (e.g., subject is "Care Circle Reminder from KaljiHome").
  3. Local in-app development email sink / previewer so tests and judges can review queued and dispatched emails without needing external SMTP credentials.
