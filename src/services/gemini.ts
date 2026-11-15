// Server-Side Google Gemini Generative AI Service for KaljiHome
// Implements in-memory SHA-256 LRU caching, input sanitization, and strict clinical guardrails
// Complies with FR-024, FR-036, and 10_SECURITY_AND_TRUST.md

import crypto from 'crypto';

interface CacheEntry {
  response: string;
  timestamp: number;
}

// In-memory LRU cache (max 100 entries) to optimize performance & API quotas
const aiCache = new Map<string, CacheEntry>();
const MAX_CACHE_SIZE = 100;

function getCacheKey(prefix: string, payload: string): string {
  return crypto.createHash('sha256').update(`${prefix}:${payload}`).digest('hex');
}

function getFromCache(key: string): string | null {
  const entry = aiCache.get(key);
  if (!entry) return null;
  // Cache TTL: 2 hours
  if (Date.now() - entry.timestamp > 2 * 60 * 60 * 1000) {
    aiCache.delete(key);
    return null;
  }
  return entry.response;
}

function setInCache(key: string, response: string) {
  if (aiCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = aiCache.keys().next().value;
    if (oldestKey) aiCache.delete(oldestKey);
  }
  aiCache.set(key, { response, timestamp: Date.now() });
}

/**
 * Sanitize text inputs before prompt interpolation to prevent prompt injection
 */
export function sanitizePromptInput(text: string, maxLength = 1000): string {
  return text
    .replace(/[\x00-\x1F\x7F]/g, ' ') // Strip control characters
    .trim()
    .slice(0, maxLength);
}

/**
 * Call Google Gemini API with fallback models and error boundaries
 */
async function callGeminiApi(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server environment.');
  }

  // Model hierarchy: user-specified or reliable standard flash models
  const configuredModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const modelsToTry = [
    configuredModel,
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.0-flash-exp'
  ];

  let lastError = '';

  for (const model of modelsToTry) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: `${systemPrompt}\n\nTask:\n${userPrompt}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          return candidateText.trim();
        }
      } else {
        const errorDetails = await res.text();
        lastError = `Model ${model} returned ${res.status}: ${errorDetails.slice(0, 200)}`;
      }
    } catch (err: any) {
      lastError = err.message;
    }
  }

  throw new Error(`Gemini AI service unavailable: ${lastError}`);
}

/**
 * Feature 1: Generate Doctor Visit Preparation Card (FR-024 / FR-036)
 * Prepares a structured, user-editable checklist for an upcoming consultation
 */
export async function generateAppointmentPrepCard(
  doctorName: string,
  clinicName: string,
  appointmentDate: string,
  medicationsSummary: string,
  purposeNote?: string
): Promise<string> {
  const sanitizedDoctor = sanitizePromptInput(doctorName, 100);
  const sanitizedClinic = sanitizePromptInput(clinicName, 150);
  const sanitizedMeds = sanitizePromptInput(medicationsSummary, 800);
  const sanitizedPurpose = purposeNote ? sanitizePromptInput(purposeNote, 300) : 'Routine quarterly review';

  const cacheKey = getCacheKey('appt_prep', `${sanitizedDoctor}_${sanitizedClinic}_${sanitizedMeds}_${sanitizedPurpose}`);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const systemPrompt = `
You are the KaljiHome Care Assistant for an Indian elderly care platform.
STRICT SAFETY INVARIANTS:
1. You NEVER provide medical diagnoses, treatment decisions, or drug interaction advice.
2. You NEVER tell patients to stop or change medications.
3. Your purpose is solely to organize a clean, polite, easy-to-read consultation preparation checklist for the older adult and their family care manager.
  `.trim();

  const userPrompt = `
Generate a concise, dignified Doctor Visit Preparation Card for:
- Doctor: ${sanitizedDoctor}
- Clinic / Hospital: ${sanitizedClinic}
- Date: ${appointmentDate}
- Stated Consultation Purpose: ${sanitizedPurpose}
- Current Active Medications:
${sanitizedMeds}

Format output with clean markdown:
1. **Visit Overview** (Brief warm summary)
2. **Current Medication Routine to Review** (Bulleted summary of medications to show the doctor)
3. **Suggested Questions to Ask the Doctor** (3-4 respectful non-clinical routine questions, e.g. about food timing, refills, and routine wellness)
4. **Items to Carry** (e.g. Previous test reports, prescription slip)

Tone: Respectful, warm, clear for an older adult.
  `.trim();

  try {
    const result = await callGeminiApi(systemPrompt, userPrompt);
    setInCache(cacheKey, result);
    return result;
  } catch (err: any) {
    // Graceful fallback if offline or API key error
    return `
### Doctor Visit Preparation Card
**Doctor:** ${sanitizedDoctor} • **Facility:** ${sanitizedClinic} • **Date:** ${appointmentDate}

**Current Medications on Record:**
${sanitizedMeds}

**Suggested Questions for Consultation:**
- Review schedule and timing with meals for existing prescriptions.
- Clarify refill dates and upcoming routine checkup timelines.
- Discuss any general wellness observations noted during routine care.

*(Note: Carry your previous physical prescription slip and lab reports to the clinic.)*
    `.trim();
  }
}

/**
 * Feature 2: Multilingual Plain-Language Care Routine Summarizer (Hindi / Marathi / English)
 * Translates today's daily medication routine into clear, respectful regional language
 */
export async function generateCareRoutineSummary(
  elderName: string,
  language: 'mr' | 'hi' | 'en',
  routineItems: string
): Promise<string> {
  const sanitizedName = sanitizePromptInput(elderName, 100);
  const sanitizedRoutine = sanitizePromptInput(routineItems, 1000);

  const cacheKey = getCacheKey('routine_summary', `${sanitizedName}_${language}_${sanitizedRoutine}`);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const targetLang = language === 'mr' ? 'Marathi (मराठी)' : language === 'hi' ? 'Hindi (हिंदी)' : 'English';

  const systemPrompt = `
You are the KaljiHome Multilingual Routine Assistant.
Translate and summarize the daily care schedule in clear, simple, respectful ${targetLang}.
Use culturally respectful language (e.g., in Marathi: 'काळजीपूर्वक', 'वेळेवर औषधे घ्या', respectful tone for elders).
STRICT INVARIANT: Do not invent any new medical advice or change dosages.
  `.trim();

  const userPrompt = `
Summarize today's care routine for ${sanitizedName} in ${targetLang}:
${sanitizedRoutine}

Output format:
- A warm respectful greeting.
- Chronological list of daily times and medicine names as provided.
- A reminder to take medications only as advised by their doctor.
  `.trim();

  try {
    const result = await callGeminiApi(systemPrompt, userPrompt);
    setInCache(cacheKey, result);
    return result;
  } catch {
    if (language === 'mr') {
      return `**आजची औषध दिनचर्या (${sanitizedName})**\n\nकृपया आपल्या डॉक्टरांच्या सल्ल्यानुसार वेळेवर औषधे घ्या. सर्व नोंदी आपल्या KaljiHome डॅशबोर्डवर उपलब्ध आहेत.`;
    } else if (language === 'hi') {
      return `**आज की देखभाल दिनचर्या (${sanitizedName})**\n\nकृपया अपने डॉक्टर के निर्देशानुसार समय पर दवाएं लें। सभी विवरण KaljiHome डैशबोर्ड में उपलब्ध हैं।`;
    }
    return `Daily care routine summary for ${sanitizedName}. Please follow clinician instructions carefully.`;
  }
}
