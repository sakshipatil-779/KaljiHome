import { NextRequest, NextResponse } from 'next/server';
import { listNotificationOutbox, processNotificationOutbox } from '@/services/notifications';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const profileId = searchParams.get('profileId') || 'prof_meera';

  try {
    const outbox = listNotificationOutbox(profileId);
    return NextResponse.json({ outbox });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = await processNotificationOutbox();
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
