import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateId, hashPassword } from '@/lib/crypto';

export async function GET(req: NextRequest) {
  const db = getDb();
  // Return all persona demo users for evaluation switcher
  const users = db.prepare(`
    SELECT id, email, display_name, role_title, status FROM users ORDER BY created_at ASC
  `).all();

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, displayName, firebaseUid } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const db = getDb();
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    let user = db.prepare(`
      SELECT id, email, display_name, role_title, status FROM users WHERE LOWER(email) = ?
    `).get(normalizedEmail) as any;

    const now = new Date().toISOString();

    if (!user) {
      // Create new user linked to Firebase
      const userId = `usr_${generateId().slice(0, 10)}`;
      const name = displayName?.trim() || normalizedEmail.split('@')[0];
      const defaultPasswordHash = hashPassword('firebase-oauth-auth');

      db.prepare(`
        INSERT INTO users (id, email, display_name, password_hash, role_title, status, created_at, updated_at, last_login_at)
        VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?)
      `).run(userId, normalizedEmail, name, defaultPasswordHash, 'Family Member & Caregiver', now, now, now);

      // Automatically grant care manager membership for Meera Sharma's profile
      db.prepare(`
        INSERT OR IGNORE INTO care_memberships (
          id, profile_id, user_id, role,
          view_profile, view_medications, manage_medications, record_dose,
          view_appointments, manage_appointments, view_timeline, manage_members, manage_preferences,
          status, granted_by_user_id, granted_at, created_at, updated_at
        ) VALUES (
          ?, 'prof_meera', ?, 'care_manager',
          1, 1, 1, 1, 1, 1, 1, 1, 1,
          'active', 'usr_meera', ?, ?, ?
        )
      `).run(`mem_${generateId().slice(0, 10)}`, userId, now, now, now);

      user = {
        id: userId,
        email: normalizedEmail,
        display_name: name,
        role_title: 'Family Member & Caregiver',
        status: 'active',
      };
    } else {
      // Update last login
      db.prepare(`UPDATE users SET last_login_at = ? WHERE id = ?`).run(now, user.id);
    }

    return NextResponse.json({
      success: true,
      user,
      firebaseLinked: true,
    });
  } catch (err: any) {
    console.error('Firebase Auth Sync Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
