import { NextRequest, NextResponse } from 'next/server';
import { generateAppointmentPrepCard, generateCareRoutineSummary } from '@/services/gemini';
import { assertCan } from '@/services/policy';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, profileId, userId } = body;

    if (!profileId || !userId) {
      return NextResponse.json({ error: 'Missing profileId or userId' }, { status: 400 });
    }

    // Server-side authorization check
    assertCan(userId, 'view_profile', profileId);

    if (action === 'appointment_prep') {
      const { doctorName, clinicName, appointmentDate, medicationsSummary, purposeNote } = body;
      if (!doctorName || !clinicName) {
        return NextResponse.json({ error: 'Doctor name and clinic name are required' }, { status: 400 });
      }

      const card = await generateAppointmentPrepCard(
        doctorName,
        clinicName,
        appointmentDate || new Date().toISOString().slice(0, 10),
        medicationsSummary || 'Routine maintenance prescriptions',
        purposeNote
      );

      return NextResponse.json({ success: true, card });
    }

    if (action === 'routine_summary') {
      const { elderName, language, routineItems } = body;
      if (!routineItems) {
        return NextResponse.json({ error: 'Routine items are required' }, { status: 400 });
      }

      const summary = await generateCareRoutineSummary(
        elderName || 'Meera Sharma',
        language || 'mr',
        routineItems
      );

      return NextResponse.json({ success: true, summary });
    }

    return NextResponse.json({ error: 'Invalid AI action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'AI request error' }, { status: 500 });
  }
}
