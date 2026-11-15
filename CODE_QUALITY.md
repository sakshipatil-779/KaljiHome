# Code Quality Guidelines — KaljiHome

## 1. Directory Structure & Modular Separation
KaljiHome follows a strict domain-driven, modular architecture separating UI components, business services, database access, types, and automated tests:
* `src/components/` — Accessible, semantic React components (`Header`, `Navigation`, `Footer`, `Logo`, `AppContext`).
* `src/services/` — Pure business domain logic and I/O handlers:
  * `auth.ts` — Authentication & PBKDF2 session token management.
  * `policy.ts` — Centralized RBAC and least-privilege authorization gatekeeper.
  * `invitations.ts` — Scoped, expiring HMAC-SHA256 passcode generation and atomic acceptance.
  * `medications.ts` — Medication CRUD, versioned schedule management, and deterministic recurrence engine.
  * `dose-ledger.ts` — Immutable adherence event ledger and grace period transition logic.
  * `appointments.ts` — Doctor appointment management and local timezone handling.
  * `notifications.ts` — Persistent outbox dispatcher supporting Brevo and local Dev Sink.
  * `gemini.ts` — Server-side Google Gemini integration with in-memory SHA-256 LRU cache.
  * `timeline.ts` — Permission-aware chronological audit feed.
* `src/lib/` — Relational SQLite connection (`better-sqlite3`), WAL mode, schema initialization, and Firebase configuration.
* `src/types/` — Shared TypeScript type declarations, enums, and request/response interfaces.
* `src/app/` — Next.js 14 App Router pages and validated REST API endpoints.

## 2. Strict Compiler & Typing Standards
Configured via `tsconfig.json` with strict type enforcement:
* `strict: true` — Full type strictness checking across all modules.
* `noImplicitAny: true` — Zero untyped `any` leaks in domain entities.
* `strictNullChecks: true` — Eliminates null/undefined runtime reference errors.
* `noEmit: true` — Typecheck verification without polluting build outputs.

## 3. Linter & Static Analysis (ESLint)
* Configured with `eslint-config-next` (`.eslintrc.json`).
* Verification command: `npm run lint` passes with **0 errors and 0 warnings**.
* Enforces React Hooks dependency correctness and prevents dead code.
