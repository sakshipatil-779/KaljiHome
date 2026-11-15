// Authentication & Session Management Service
// Adheres strictly to 10_SECURITY_AND_TRUST.md (no plaintext passwords, safe cookies, crypto tokens)

import { getDb } from '@/lib/db';
import { hashPassword, verifyPassword, generateId } from '@/lib/crypto';
import { User } from '@/types';
import crypto from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'kaljihome-dev-session-secret-key-32-chars-long!';

export interface SessionPayload {
  userId: string;
  email: string;
  displayName: string;
  exp: number; // UTC unix timestamp in seconds
}

/**
 * Sign a session payload with HMAC-SHA256
 */
export function createSessionToken(user: User, expiresInSeconds = 86400 * 7): string {
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    displayName: user.display_name,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payloadB64).digest('base64url');
  return `${payloadB64}.${signature}`;
}

/**
 * Verify and parse a session token
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payloadB64, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payloadB64).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }
    const payload: SessionPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (Date.now() / 1000 > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

export function getUserById(id: string): User | null {
  const db = getDb();
  const row = db.prepare('SELECT id, email, display_name, role_title, status, created_at, updated_at, last_login_at FROM users WHERE id = ?').get(id) as any;
  if (!row) return null;
  return row as User;
}

export function getUserByEmail(email: string): User | null {
  const db = getDb();
  const row = db.prepare('SELECT id, email, display_name, role_title, status, created_at, updated_at, last_login_at FROM users WHERE email = ? COLLATE NOCASE').get(email.trim().toLowerCase()) as any;
  if (!row) return null;
  return row as User;
}

export function authenticateUser(email: string, password: string): User | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE').get(email.trim().toLowerCase()) as any;
  if (!row) return null;
  if (row.status !== 'active') return null;

  const valid = verifyPassword(password, row.password_hash);
  if (!valid) return null;

  const now = new Date().toISOString();
  db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(now, row.id);

  return {
    id: row.id,
    email: row.email,
    display_name: row.display_name,
    role_title: row.role_title,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    last_login_at: now,
  };
}

export function registerUser(email: string, password: string, displayName: string, roleTitle?: string): User {
  const db = getDb();
  const normalizedEmail = email.trim().toLowerCase();
  const existing = getUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const id = generateId();
  const passwordHash = hashPassword(password);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, email, display_name, password_hash, role_title, status, created_at, updated_at, last_login_at)
    VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?)
  `).run(id, normalizedEmail, displayName.trim(), passwordHash, roleTitle || 'Family Member', now, now, now);

  return {
    id,
    email: normalizedEmail,
    display_name: displayName.trim(),
    role_title: roleTitle || 'Family Member',
    status: 'active',
    created_at: now,
    updated_at: now,
    last_login_at: now,
  };
}
