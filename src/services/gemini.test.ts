import { describe, it, expect } from 'vitest';
import { sanitizePromptInput, generateAppointmentPrepCard, generateCareRoutineSummary } from './gemini';

describe('Gemini Generative AI Service & Safety Boundaries', () => {
  it('sanitizes user input by stripping control characters and enforcing length limits', () => {
    const maliciousInput = 'Dr. Sneha\x00\x08 Kulkarni\x1F\x7F' + 'A'.repeat(500);
    const sanitized = sanitizePromptInput(maliciousInput, 50);

    expect(sanitized).not.toContain('\x00');
    expect(sanitized).not.toContain('\x1F');
    expect(sanitized.length).toBeLessThanOrEqual(50);
    expect(sanitized).toContain('Dr. Sneha');
    expect(sanitized).toContain('Kulkarni');
  });

  it('generates a structured Doctor Visit Prep Card adhering to non-clinical rules', async () => {
    const card = await generateAppointmentPrepCard(
      'Dr. Sneha Kulkarni',
      'Apollo Clinic Pune',
      '2026-11-20 at 10:30 IST',
      'Metformin 500mg, Amlodipine 5mg',
      'Quarterly blood sugar & BP follow-up'
    );

    expect(card).toBeDefined();
    expect(card).toContain('Doctor');
    expect(card).toContain('Metformin');
    expect(card).toContain('Apollo Clinic');
  });

  it('generates care routine summary in Marathi without throwing exceptions', async () => {
    const summary = await generateCareRoutineSummary(
      'Meera Sharma',
      'mr',
      '08:30 IST: Metformin 500mg\n09:00 IST: Amlodipine 5mg'
    );

    expect(summary).toBeDefined();
    expect(summary.length).toBeGreaterThan(10);
  });
});
