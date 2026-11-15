import { NextRequest, NextResponse } from 'next/server';
import { getCareTimeline } from '@/services/timeline';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const profileId = searchParams.get('profileId') || 'prof_meera';
  const userId = searchParams.get('userId') || 'usr_meera';

  try {
    const timeline = getCareTimeline(profileId, userId);
    return NextResponse.json({ timeline });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}
