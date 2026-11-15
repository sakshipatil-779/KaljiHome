import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserById } from '@/services/auth';

export async function GET(req: NextRequest) {
  const db = getDb();
  // Return all persona demo users for easy evaluation switcher
  const users = db.prepare(`
    SELECT id, email, display_name, role_title, status FROM users ORDER BY created_at ASC
  `).all();

  return NextResponse.json({ users });
}
