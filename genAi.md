# Generative AI Integration — KaljiHome

> **Project:** KaljiHome (काळजी) — Elderly Care & Medication Management Platform  
> **AI Provider:** Google Gemini (`gemini-3.5-flash-lite` / `gemini-1.5-flash`)  
> **Server-Side Integration:** `src/services/gemini.ts` & `src/app/api/ai/route.ts`  

---

## 1. Executive Summary

In KaljiHome, Generative AI is deployed as a **warm, supportive, non-clinical assistant** that respects patient safety boundaries. In strict compliance with healthcare ethics and `AGENTS.md`, AI is **never** used for medical diagnosis, drug-interaction calculations, or dose compensation advice.

Google Gemini powers two high-value features:
1. **Doctor Visit Preparation Card (FR-024 / FR-036):** Synthesizes the patient's upcoming appointment details and active prescriptions into a clean, printable checklist of non-clinical routine questions to ask the doctor.
2. **Multilingual Care Routine Summarizer:** Translates today's chronological schedule into clear, respectful regional languages (Marathi *काळजी मार्गदर्शक* and Hindi) for elderly family members.

---

## 2. Technical Architecture & Defense-in-Depth

### 2.1 Server-Side Execution Only
All Gemini API interactions execute strictly on the Next.js server (`src/services/gemini.ts`). The `GEMINI_API_KEY` is loaded from server environment variables and is never transmitted to the browser.

### 2.2 In-Memory SHA-256 LRU Caching
To prevent redundant API calls, reduce latency, and minimize quota consumption, `src/services/gemini.ts` maintains an in-memory SHA-256 hash cache:
* Payloads are hashed using `crypto.createHash('sha256')`.
* Max capacity: 100 entries with automatic Least Recently Used (LRU) eviction.
* TTL: 2 hours.

### 2.3 Prompt Injection Defense & Sanitization
* All user-provided doctor names, clinic notes, and medication text are scrubbed of ASCII control characters (`[\x00-\x1F\x7F]`) before prompt interpolation.
* Strict input length boundaries (doctor name <= 100 chars, clinic <= 150 chars, medication summary <= 800 chars).

### 2.4 Strict Safety System Prompt Invariant
Every Gemini request is prepended with immutable system constraints:
```text
You are the KaljiHome Care Assistant for an Indian elderly care platform.
STRICT SAFETY INVARIANTS:
1. You NEVER provide medical diagnoses, treatment decisions, or drug interaction advice.
2. You NEVER tell patients to stop or change medications.
3. Your purpose is solely to organize a clean, polite, easy-to-read consultation preparation checklist.
```

### 2.5 Resilient Fallbacks
If the external Gemini API is unreachable or rate-limited, the service returns pre-formatted, deterministic checklist and summary templates, ensuring zero service disruption for elderly users.
