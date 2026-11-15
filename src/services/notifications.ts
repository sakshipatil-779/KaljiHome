// Notification Outbox & Privacy-Preserving Email Service
// Complies with 08_TECHNICAL_ARCHITECTURE.md, 10_SECURITY_AND_TRUST.md, and FR-025 - FR-029

import { getDb } from '@/lib/db';
import { generateId } from '@/lib/crypto';
import { NotificationOutboxItem, NotificationStatus } from '@/types';
import { getActiveMembership } from './policy';

export interface RenderedEmail {
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml: string;
}

/**
 * Generate privacy-preserving email content.
 * Enforces FR-027: Medication names, doses, and diagnoses are STRICTLY EXCLUDED from subject and preview.
 */
export function renderNotificationEmail(outboxItem: NotificationOutboxItem, recipientName: string, recipientEmail: string): RenderedEmail {
  let subject = 'Care Notification from KaljiHome';
  let messageTitle = 'Care Notification';
  let messageBody = 'You have a new update in your KaljiHome care dashboard.';

  if (outboxItem.notification_type === 'upcoming_dose') {
    subject = 'Upcoming Medication Reminder — KaljiHome';
    messageTitle = 'Upcoming Medication Routine';
    messageBody = 'A scheduled medication dose is due shortly for your care circle. Please sign in to your KaljiHome dashboard to review the schedule and record status.';
  } else if (outboxItem.notification_type === 'unconfirmed_dose') {
    subject = 'Action Needed: Medication Status Unconfirmed — KaljiHome';
    messageTitle = 'Medication Status Unconfirmed';
    messageBody = 'No response has been recorded for a scheduled medication dose after the configured grace period. Please check your shared KaljiHome dashboard to verify care coordination.';
  } else if (outboxItem.notification_type === 'upcoming_appointment') {
    subject = 'Upcoming Doctor Appointment Reminder — KaljiHome';
    messageTitle = 'Upcoming Healthcare Appointment';
    messageBody = 'There is an upcoming doctor appointment scheduled for your care circle. Please sign in to your KaljiHome dashboard to view the doctor, time, and location details.';
  }

  const bodyText = `
Hello ${recipientName},

${messageTitle}
${messageBody}

Sign in to your secure care dashboard:
https://kaljihome.local/dashboard

---
Privacy Note: To protect sensitive healthcare details, medication names, strengths, and clinical reasons are not included in email previews.
KaljiHome — Safe, respectful elderly care coordination.
  `.trim();

  const bodyHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background-color: #FAF8F5;">
      <div style="border-bottom: 2px solid #0D9488; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="color: #0F766E; margin: 0; font-size: 22px;">Kalji<span style="color: #C2410C;">Home</span> <span style="font-size: 14px; color: #64748B; font-weight: normal;">(काळजी)</span></h2>
        <p style="margin: 4px 0 0 0; color: #475569; font-size: 13px;">Elderly Care &amp; Medication Coordination Platform</p>
      </div>
      <div style="background-color: #FFFFFF; padding: 20px; border-radius: 8px; border: 1px solid #E2E8F0;">
        <h3 style="color: #1E293B; margin-top: 0; font-size: 18px;">${messageTitle}</h3>
        <p style="color: #334155; line-height: 1.6; font-size: 15px;">Hello ${recipientName},</p>
        <p style="color: #334155; line-height: 1.6; font-size: 15px;">${messageBody}</p>
        <div style="margin: 24px 0;">
          <a href="https://kaljihome.local/dashboard" style="background-color: #0F766E; color: #FFFFFF; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Open Care Dashboard</a>
        </div>
      </div>
      <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #E2E8F0; font-size: 12px; color: #64748B;">
        <p style="margin: 0 0 6px 0;"><strong>Privacy &amp; Safety Note:</strong> To safeguard personal health information, prescription names, dosages, and medical notes are not exposed in email messages. Please view them securely within your authenticated account.</p>
        <p style="margin: 0;">KaljiHome is a routine care coordination platform, not an emergency medical alert system.</p>
      </div>
    </div>
  `;

  return {
    to: recipientEmail,
    subject,
    bodyText,
    bodyHtml,
  };
}

/**
 * Dispatch email via Brevo API if configured, or record to dev sink
 */
async function dispatchEmail(
  email: RenderedEmail, 
  recipientName: string
): Promise<{ mode: string; messageId?: string }> {
  const brevoKey = process.env.BREVO_API_KEY;
  const brevoSender = process.env.BREVO_SENDER_EMAIL || 'patilsakshi18027@gmail.com';

  if (brevoKey && process.env.EMAIL_DELIVERY_MODE !== 'sink') {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoKey,
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'KaljiHome Care Circle', email: brevoSender },
          to: [{ email: email.to, name: recipientName }],
          subject: email.subject,
          htmlContent: email.bodyHtml,
          textContent: email.bodyText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return { mode: 'brevo_live', messageId: data.messageId || `brevo_${Date.now()}` };
      } else {
        const errBody = await res.text();
        return { mode: 'dev_sink_brevo_fallback', messageId: `fallback_${res.status}` };
      }
    } catch {
      return { mode: 'dev_sink_network_fallback', messageId: `offline_sink_${Date.now()}` };
    }
  }

  return { mode: 'dev_sink', messageId: `dev_sink_${Date.now()}` };
}

/**
 * Process pending notification outbox items.
 * Validates recipient eligibility (membership still active), dispatches via Brevo or dev sink,
 * and records attempt history.
 */
export async function processNotificationOutbox(limit = 20): Promise<{ processed: number; succeeded: number; failed: number }> {
  const db = getDb();
  const now = new Date().toISOString();

  // Find due items
  const items = db.prepare(`
    SELECT o.*, u.email as recipient_email, u.display_name as recipient_name
    FROM notification_outbox o
    JOIN users u ON o.recipient_user_id = u.id
    WHERE o.status = 'queued' AND o.scheduled_for_utc <= ?
    ORDER BY o.scheduled_for_utc ASC
    LIMIT ?
  `).all(now, limit) as any[];

  let succeeded = 0;
  let failed = 0;

  for (const item of items) {
    const attemptNumber = item.attempt_count + 1;
    const attemptId = generateId();

    try {
      // 1. Re-verify recipient eligibility: membership must still be active!
      const membership = getActiveMembership(item.profile_id, item.recipient_user_id);
      if (!membership) {
        throw new Error('Recipient membership was revoked or is no longer active.');
      }

      // 2. Render safe email
      const email = renderNotificationEmail(item, item.recipient_name, item.recipient_email);

      // 3. Dispatch via Brevo or dev sink
      const dispatchResult = await dispatchEmail(email, item.recipient_name);

      db.transaction(() => {
        // Record successful attempt
        db.prepare(`
          INSERT INTO notification_attempts (id, outbox_id, attempt_number, status, provider_response, created_at)
          VALUES (?, ?, ?, 'success', ?, ?)
        `).run(attemptId, item.id, attemptNumber, JSON.stringify({ mode: dispatchResult.mode, messageId: dispatchResult.messageId, delivered_to: email.to }), now);

        // Update outbox status to dispatched
        db.prepare(`
          UPDATE notification_outbox
          SET status = 'dispatched', dispatched_at_utc = ?, attempt_count = ?, last_error = NULL, updated_at = ?
          WHERE id = ?
        `).run(now, attemptNumber, now, item.id);
      })();

      succeeded++;
    } catch (err: any) {
      const errorMessage = err?.message || 'Unknown notification error';
      failed++;

      db.transaction(() => {
        // Record failed attempt
        db.prepare(`
          INSERT INTO notification_attempts (id, outbox_id, attempt_number, status, error_message, created_at)
          VALUES (?, ?, ?, 'failed', ?, ?)
        `).run(attemptId, item.id, attemptNumber, errorMessage, now);

        const newStatus = attemptNumber >= item.max_attempts ? 'failed' : 'queued';
        db.prepare(`
          UPDATE notification_outbox
          SET status = ?, attempt_count = ?, last_error = ?, updated_at = ?
          WHERE id = ?
        `).run(newStatus, attemptNumber, errorMessage, now, item.id);
      })();
    }
  }

  return {
    processed: items.length,
    succeeded,
    failed,
  };
}

/**
 * List all outbox items for inspection in the in-app Dev Email Sink / Notification Center
 */
export function listNotificationOutbox(profileId: string): NotificationOutboxItem[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT o.*, u.email as recipient_email, u.display_name as recipient_name
    FROM notification_outbox o
    JOIN users u ON o.recipient_user_id = u.id
    WHERE o.profile_id = ?
    ORDER BY o.created_at DESC
    LIMIT 50
  `).all(profileId) as any[];

  return rows.map((r) => {
    const email = renderNotificationEmail(r, r.recipient_name || 'Care Circle Member', r.recipient_email || 'member@example.com');
    return {
      ...r,
      email_subject: email.subject,
      email_body: email.bodyText,
    };
  });
}
