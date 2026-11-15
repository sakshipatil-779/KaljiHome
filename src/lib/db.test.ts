import { describe, it, expect, beforeEach } from 'vitest';
import { hashPassword, verifyPassword, generateInvitationCode, computePasscodeDigest } from './crypto';
import { getDb } from './db';

describe('Crypto & Passcode Security', () => {
  it('correctly hashes and verifies passwords with PBKDF2 salt', () => {
    const raw = 'SecureElderCare2026!';
    const hashed = hashPassword(raw);
    expect(hashed).toContain('pbkdf2_sha512');
    expect(verifyPassword(raw, hashed)).toBe(true);
    expect(verifyPassword('WrongPassword', hashed)).toBe(false);
  });

  it('generates an 8-character human-friendly invitation code', () => {
    const code = generateInvitationCode();
    expect(code).toMatch(/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/);
  });

  it('computes deterministic HMAC-SHA256 digests bound to profile and normalized email', () => {
    const code = 'K7M2-P9X4';
    const profileId = 'prof_123';
    const email = 'Caregiver@Example.COM';

    const digest1 = computePasscodeDigest(code, profileId, email);
    const digest2 = computePasscodeDigest('k7m2p9x4', profileId, 'caregiver@example.com');
    expect(digest1).toBe(digest2);

    // Wrong email or profile yields different digest
    const digestWrongEmail = computePasscodeDigest(code, profileId, 'other@example.com');
    expect(digest1).not.toBe(digestWrongEmail);
  });
});

describe('Database Schema & Seed Validation', () => {
  it('initializes tables, seeds demo users and elder profile', () => {
    const db = getDb();
    
    // Check users
    const userCount = (db.prepare('SELECT count(*) as count FROM users').get() as { count: number }).count;
    expect(userCount).toBeGreaterThanOrEqual(5);

    // Check Meera's profile
    const profile = db.prepare('SELECT * FROM elder_profiles WHERE id = ?').get('prof_meera') as any;
    expect(profile).toBeDefined();
    expect(profile.preferred_name).toBe('Meera Sharma');
    expect(profile.timezone).toBe('Asia/Kolkata');

    // Check care memberships
    const memberships = db.prepare('SELECT * FROM care_memberships WHERE profile_id = ?').all('prof_meera');
    expect(memberships.length).toBeGreaterThanOrEqual(4);

    // Check medications and occurrences
    const meds = db.prepare('SELECT * FROM medications WHERE profile_id = ?').all('prof_meera');
    expect(meds.length).toBeGreaterThanOrEqual(3);

    const occurrences = db.prepare('SELECT * FROM dose_occurrences WHERE profile_id = ?').all('prof_meera');
    expect(occurrences.length).toBeGreaterThanOrEqual(4);
  });
});
