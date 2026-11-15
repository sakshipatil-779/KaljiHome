import { NextRequest, NextResponse } from 'next/server';
import { recordDoseEvent } from '@/services/dose-ledger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { occurrenceId, profileId, userId, eventType, source, note, snoozeMinutes } = body;

    if (!occurrenceId || !profileId || !userId || !eventType) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const result = recordDoseEvent({
      occurrenceId,
      profileId,
      userId,
      eventType,
      source: source || 'caretaker',
      note,
      snoozeMinutes,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
