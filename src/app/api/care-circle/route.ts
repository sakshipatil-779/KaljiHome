import { NextRequest, NextResponse } from 'next/server';
import { 
  listCareMembers, 
  createInvitation, 
  acceptInvitation, 
  revokeMembership 
} from '@/services/invitations';
import { getUserById } from '@/services/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const profileId = searchParams.get('profileId') || 'prof_meera';
  const userId = searchParams.get('userId') || 'usr_meera';

  try {
    const members = listCareMembers(profileId, userId);
    return NextResponse.json({ members });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'create_invitation') {
      const { profileId, inviterUserId, inviteeEmail, role, customPermissions } = body;
      const result = createInvitation(profileId, inviterUserId, inviteeEmail, role, customPermissions);
      return NextResponse.json({ success: true, invitation: result });
    }

    if (action === 'accept_invitation') {
      const { profileId, plaintextCode, userId } = body;
      const user = getUserById(userId);
      if (!user) {
        return NextResponse.json({ error: 'User account not found' }, { status: 404 });
      }
      const result = acceptInvitation(profileId, plaintextCode, user);
      return NextResponse.json(result);
    }

    if (action === 'revoke_membership') {
      const { profileId, targetUserId, revokingUserId } = body;
      revokeMembership(profileId, targetUserId, revokingUserId);
      return NextResponse.json({ success: true, message: 'Membership revoked successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
