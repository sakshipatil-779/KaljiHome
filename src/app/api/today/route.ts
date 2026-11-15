import { NextRequest, NextResponse } from 'next/server';
import { getDailyOccurrences, evaluateGracePeriodOccurrences } from '@/services/dose-ledger';
import { listAppointments } from '@/services/appointments';
import { getActiveMembership } from '@/services/policy';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const profileId = searchParams.get('profileId') || 'prof_meera';
  const userId = searchParams.get('userId') || 'usr_meera';
  const dateStr = searchParams.get('date') || new Date().toISOString().slice(0, 10);

  try {
    // 1. Run grace period evaluation to update overdue occurrences to unconfirmed_after_grace
    evaluateGracePeriodOccurrences(profileId);

    // 2. Fetch occurrences
    const occurrences = getDailyOccurrences(profileId, userId, dateStr);

    // 3. Fetch appointments
    let appointments: any[] = [];
    try {
      appointments = listAppointments(profileId, userId);
    } catch {
      // Permission filtered if user lacks appointment viewing
    }

    // 4. Fetch user's membership and permissions
    const membership = getActiveMembership(profileId, userId);

    return NextResponse.json({
      profileId,
      date: dateStr,
      occurrences,
      appointments: appointments.filter(a => a.status === 'upcoming').slice(0, 3),
      membership,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}
