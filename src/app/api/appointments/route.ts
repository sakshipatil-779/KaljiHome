import { NextRequest, NextResponse } from 'next/server';
import { listAppointments, createAppointment, updateAppointmentStatus } from '@/services/appointments';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const profileId = searchParams.get('profileId') || 'prof_meera';
  const userId = searchParams.get('userId') || 'usr_meera';

  try {
    const appointments = listAppointments(profileId, userId);
    return NextResponse.json({ appointments });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'update_status') {
      const { appointmentId, profileId, userId, newStatus } = body;
      updateAppointmentStatus(appointmentId, profileId, userId, newStatus);
      return NextResponse.json({ success: true, message: `Appointment status updated to ${newStatus}` });
    }

    const {
      profileId,
      userId,
      clinicianDisplayName,
      facilityDisplayName,
      locationText,
      scheduledLocalDate,
      scheduledLocalTime,
      purposeNote,
      reminderOffsetsHours,
    } = body;

    const appt = createAppointment({
      profileId,
      userId,
      clinicianDisplayName,
      facilityDisplayName,
      locationText,
      scheduledLocalDate,
      scheduledLocalTime,
      purposeNote,
      reminderOffsetsHours,
    });

    return NextResponse.json({ success: true, appointment: appt });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
