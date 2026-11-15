// Shared Care Activity Timeline Service
// Complies with 04_USER_WORKFLOWS.md (Workflow 7) and 09_DATA_MODEL.md

import { getDb } from '@/lib/db';
import { AuditEvent } from '@/types';
import { assertCan } from './policy';

export interface FormattedTimelineItem {
  id: string;
  eventType: string;
  actorName: string;
  timestamp: string;
  description: string;
  iconType: 'medication' | 'dose' | 'appointment' | 'member' | 'system';
}

export function getCareTimeline(
  profileId: string,
  requestingUserId: string,
  limit = 50
): FormattedTimelineItem[] {
  // Authorization: must have view_timeline permission
  assertCan(requestingUserId, 'view_timeline', profileId);

  const db = getDb();
  const rows = db.prepare(`
    SELECT a.*, u.display_name as actor_name, u.role_title as actor_role_title
    FROM audit_events a
    LEFT JOIN users u ON a.actor_user_id = u.id
    WHERE a.profile_id = ?
    ORDER BY a.occurred_at DESC
    LIMIT ?
  `).all(profileId, limit) as any[];

  return rows.map((r) => {
    let description = 'Activity recorded';
    let iconType: 'medication' | 'dose' | 'appointment' | 'member' | 'system' = 'system';
    const metadata = r.metadata_json ? JSON.parse(r.metadata_json) : {};

    switch (r.event_type) {
      case 'profile_initialized':
        description = 'Care profile and initial Care Circle initialized';
        iconType = 'system';
        break;
      case 'invitation_created':
        description = `Invited ${metadata.invitee_email || 'new member'} as ${metadata.role || 'member'}`;
        iconType = 'member';
        break;
      case 'invitation_accepted':
        description = `Member joined the Care Circle with role ${metadata.role || 'member'}`;
        iconType = 'member';
        break;
      case 'membership_revoked':
        description = 'Revoked membership access for a care circle member';
        iconType = 'member';
        break;
      case 'medication_created':
        description = `Added medication: ${metadata.medication_name || 'Prescription item'} (${metadata.frequency || 'routine'})`;
        iconType = 'medication';
        break;
      case 'medication_status_changed':
        description = `Medication status changed to ${metadata.new_status}`;
        iconType = 'medication';
        break;
      case 'dose_status_recorded':
        const statusLabel = 
          metadata.status === 'reported_taken' ? 'Reported Taken' :
          metadata.status === 'reported_skipped' ? 'Reported Skipped' :
          metadata.status === 'snoozed' ? 'Snoozed (15m)' :
          metadata.status === 'unable_to_confirm' ? 'Unable to confirm' : metadata.status;
        description = `Medication status recorded: ${statusLabel} (${metadata.source || 'caregiver'})`;
        iconType = 'dose';
        break;
      case 'appointment_created':
        description = `Scheduled doctor appointment with ${metadata.clinician || 'doctor'} at ${metadata.facility || 'clinic'}`;
        iconType = 'appointment';
        break;
      case 'appointment_status_changed':
        description = `Appointment status updated to ${metadata.new_status}`;
        iconType = 'appointment';
        break;
      default:
        description = `${r.event_type} on ${r.resource_type}`;
        iconType = 'system';
    }

    return {
      id: r.id,
      eventType: r.event_type,
      actorName: r.actor_name || 'System Automation',
      timestamp: r.occurred_at,
      description,
      iconType,
    };
  });
}
