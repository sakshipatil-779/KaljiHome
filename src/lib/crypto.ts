// Cryptographic utilities for KaljiHome
// Implements secure password hashing and HMAC-SHA256 passcode generation/storage
// Adheres strictly to 10_SECURITY_AND_TRUST.md

import crypto from 'crypto';

const HMAC_SECRET = process.env.PASSCODE_HMAC_SECRET || 'kaljihome-default-dev-hmac-secret-entropy-128bit';

/**
 * Hash a password using PBKDF2 with SHA-512 and unique salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const iterations = 10000;
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
  return `pbkdf2_sha512$${iterations}$${salt}$${hash}`;
}

/**
 * Verify a password against a stored PBKDF2 hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split('$');
    if (parts.length !== 4) return false;
    const iterations = parseInt(parts[1], 10);
    const salt = parts[2];
    const originalHash = parts[3];
    const testHash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(originalHash, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Generate a cryptographically random, human-friendly 8-character invitation passcode
 * Example: "K7M2-P9X4"
 */
export function generateInvitationCode(): string {
  // Using unambiguous characters (avoid 0, O, 1, I, L)
  const charset = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  const randomBytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    code += charset[randomBytes[i] % charset.length];
  }
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

/**
 * Compute the HMAC-SHA256 digest of an invitation passcode bound to profileId and normalized email
 * Plaintext codes are never stored in the database.
 */
export function computePasscodeDigest(code: string, profileId: string, inviteeEmail: string): string {
  const normalizedCode = code.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const normalizedEmail = inviteeEmail.trim().toLowerCase();
  const message = `${normalizedCode}:${profileId}:${normalizedEmail}`;
  return crypto.createHmac('sha256', HMAC_SECRET).update(message).digest('hex');
}

/**
 * Generate UUID v4
 */
export function generateId(): string {
  return crypto.randomUUID();
}
