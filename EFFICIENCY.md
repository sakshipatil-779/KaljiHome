# Efficiency & Performance — KaljiHome

---

## 1. Relational Database Indexing & Bounded Horizons
* **Targeted Indexes:** Indexes on `care_memberships(profile_id, user_id, status)`, `dose_occurrences(profile_id, scheduled_local_date)`, `dose_events(occurrence_id)`, and `notification_outbox(status, scheduled_for_utc)` avoid full table scans.
* **Bounded Occurrence Horizons:** The timezone-aware recurrence engine generates occurrences within bounded planning horizons (7–14 days) rather than calculating unbounded future dates.
* **Idempotent Occurrence Keys:** Occurrences utilize unique keys `(schedule_version_id, local_occurrence_key)` ensuring that re-running recurrence generation creates zero duplicate database records.

## 2. In-Memory SHA-256 LRU Caching for GenAI
* **Challenge:** Redundant Gemini API calls for identical patient consultation preparation or language summaries inflate latency and quota consumption.
* **Solution:** `src/services/gemini.ts` implements an in-memory SHA-256 hash-keyed cache (`aiCache`) with a 100-entry capacity and LRU eviction policy. Identical payloads return instantly from memory.

## 3. Persistent Transactional Notification Outbox
* **Batch Worker Claims:** Background outbox dispatcher queries pending notifications using scheduled timestamp bounds (`scheduled_for_utc <= now`), avoiding aggressive database polling.
* **Deduplication Keys:** Unique dedupe keys `(profile_id, type, business_event_id, recipient)` prevent duplicate notification dispatching on network retries.

## 4. Frontend Optimization & Lightweight Bundle
* **Zero Heavy Charting Dependencies:** Dashboards use native, accessible HTML/CSS and inline SVGs rather than multi-megabyte charting bundles, maintaining sub-100KB initial page loads.
* **Next.js Static & Dynamic Optimization:** All core routes are pre-rendered statically with dynamic server-side API handlers on demand.
