import { NextRequest, NextResponse } from 'next/server';
import { listMedications, addMedication, updateMedicationStatus } from '@/services/medications';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const profileId = searchParams.get('profileId') || 'prof_meera';
  const userId = searchParams.get('userId') || 'usr_meera';

  try {
    const medications = listMedications(profileId, userId);
    return NextResponse.json({ medications });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'update_status') {
      const { medicationId, profileId, userId, newStatus, reason } = body;
      updateMedicationStatus(medicationId, profileId, userId, newStatus, reason);
      return NextResponse.json({ success: true, message: `Status updated to ${newStatus}` });
    }

    const {
      profileId,
      userId,
      displayName,
      strengthText,
      doseAmount,
      doseUnit,
      route,
      sourceNote,
      frequencyType,
      weekdays,
      localTimes,
      startDate,
      endDate,
      instructionsText,
      gracePeriodMinutes,
      confirmedPrescription,
    } = body;

    const med = addMedication({
      profileId,
      userId,
      displayName,
      strengthText,
      doseAmount,
      doseUnit,
      route,
      sourceNote,
      frequencyType,
      weekdays,
      localTimes,
      startDate,
      endDate,
      instructionsText,
      gracePeriodMinutes,
      confirmedPrescription,
    });

    return NextResponse.json({ success: true, medication: med });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
