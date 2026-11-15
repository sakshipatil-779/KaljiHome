import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateId } from '@/lib/crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      recipientEmail, 
      recipientName = 'Care Circle Member',
      medicationName = 'Amlodipine 5mg',
      scheduledTime = '08:00 AM IST',
      instructions = '1 tablet orally after breakfast with a full glass of water',
      elderName = 'Meera Sharma',
      profileId = 'prof_meera',
      userId = 'usr_sakshi'
    } = body;

    if (!recipientEmail || !recipientEmail.includes('@')) {
      return NextResponse.json({ error: 'Valid recipient email is required' }, { status: 400 });
    }

    const brevoApiKey = process.env.BREVO_API_KEY;
    const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL || 'patilsakshi18027@gmail.com';
    const brevoSenderName = 'KaljiHome (काळजी) Healthcare';

    const subject = `🔔 Medicine Reminder: ${elderName} — ${medicationName} Due at ${scheduledTime}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 20px; color: #1E293B; }
          .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: #0F766E; color: white; padding: 24px 28px; text-align: left; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
          .header p { margin: 4px 0 0; font-size: 14px; opacity: 0.9; }
          .body-content { padding: 28px; }
          .alert-box { background: #F0FDFA; border-left: 4px solid #0D9488; padding: 16px 20px; border-radius: 8px; margin: 20px 0; }
          .med-badge { display: inline-block; background: #CCFBF1; color: #0F766E; font-size: 18px; font-weight: 700; padding: 8px 16px; border-radius: 8px; margin-bottom: 8px; }
          .details-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          .details-table td { padding: 10px 0; border-bottom: 1px solid #F1F5F9; font-size: 15px; }
          .details-table td.label { color: #64748B; font-weight: 600; width: 35%; }
          .details-table td.value { color: #0F172A; font-weight: 700; }
          .button-area { margin: 28px 0; text-align: center; }
          .cta-button { background: #0F766E; color: #FFFFFF !important; font-weight: 700; font-size: 16px; text-decoration: none; padding: 14px 28px; border-radius: 10px; display: inline-block; box-shadow: 0 2px 6px rgba(15, 118, 110, 0.3); }
          .footer { background: #F8FAFC; padding: 20px 28px; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; line-height: 1.5; }
          .marathi-note { color: #C2410C; font-weight: 600; font-size: 14px; margin-top: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>KaljiHome <span style="font-size: 16px; font-weight: normal; color: #99F6E4;">(काळजी होम)</span></h1>
            <p>Elderly Care, Medication Management &amp; Family Coordination</p>
          </div>
          <div class="body-content">
            <h2 style="font-size: 20px; color: #0F172A; margin-top: 0;">Namaste ${recipientName},</h2>
            <p style="font-size: 15px; line-height: 1.6; color: #334155;">
              This is a proactive scheduled reminder for <strong>${elderName}</strong>&apos;s daily healthcare routine.
            </p>

            <div class="alert-box">
              <div class="med-badge">💊 ${medicationName}</div>
              <table class="details-table">
                <tr>
                  <td class="label">Scheduled Time:</td>
                  <td class="value">⏰ ${scheduledTime}</td>
                </tr>
                <tr>
                  <td class="label">Instructions:</td>
                  <td class="value">${instructions}</td>
                </tr>
                <tr>
                  <td class="label">Care Recipient:</td>
                  <td class="value">👵 ${elderName}</td>
                </tr>
              </table>
            </div>

            <p class="marathi-note">
              काळजीपूर्वक आठवण: कृपया वेळेवर औषध घ्या आणि आवश्यक असल्यास कुटुंबीयांना सूचित करा.
            </p>

            <div class="button-area">
              <a href="https://kaljihome.local/dashboard" class="cta-button">Open KaljiHome Dashboard &amp; Record Status</a>
            </div>

            <p style="font-size: 13px; color: #64748B;">
              Once taken or assisted, please record &quot;Taken&quot; in the KaljiHome dashboard to keep Arjun, Sunita, and the entire care circle updated in real-time.
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 6px 0;"><strong>Safety &amp; Privacy Notice:</strong> KaljiHome is an assistive coordination tool, not an emergency medical alert system or prescriptive authority. Always consult your attending doctor or pharmacist for clinical advice.</p>
            <p style="margin: 0;">Sent securely via Brevo SMTP API to ${recipientEmail} • KaljiHome Healthcare System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
KaljiHome Medicine Reminder
Elder: ${elderName}
Medication: ${medicationName}
Scheduled Time: ${scheduledTime}
Instructions: ${instructions}

Dear ${recipientName},
This is a scheduled reminder to take or assist with the above medication.
Please sign in to KaljiHome to record the dose status: https://kaljihome.local/dashboard

Stay healthy and safe!
    `.trim();

    // Send via Brevo API
    let brevoMessageId = `sink_${Date.now()}`;
    let deliveryStatus = 'simulated';

    if (brevoApiKey) {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: brevoSenderName, email: brevoSenderEmail },
          to: [{ email: recipientEmail, name: recipientName }],
          subject,
          htmlContent,
          textContent,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        brevoMessageId = data.messageId || `brevo_${Date.now()}`;
        deliveryStatus = 'sent_brevo_live';
      } else {
        const errorText = await res.text();
        console.error('Brevo API send error:', res.status, errorText);
        deliveryStatus = `failed_brevo_${res.status}`;
      }
    }

    // Record in SQLite database for auditing and notification history
    try {
      const db = getDb();
      const now = new Date().toISOString();
      const outboxId = `out_${generateId().slice(0, 10)}`;

      db.prepare(`
        INSERT INTO notification_outbox (
          id, profile_id, recipient_user_id, notification_type, business_event_id,
          dedupe_key, template_key, status, scheduled_for_utc, dispatched_at_utc,
          attempt_count, created_at, updated_at
        ) VALUES (?, ?, ?, 'upcoming_dose', ?, ?, 'reminder_email', ?, ?, 1, ?, ?)
      `).run(
        outboxId,
        profileId,
        userId,
        `manual_remind_${Date.now()}`,
        `dedupe_${Date.now()}_${Math.random()}`,
        now,
        now,
        now,
        now
      );

      // Audit event
      db.prepare(`
        INSERT INTO audit_events (
          id, profile_id, actor_user_id, action_category, action_name,
          target_entity_type, target_entity_id, occurred_at, client_ip, user_agent, metadata_json
        ) VALUES (?, ?, ?, 'notification', 'email_dispatched', 'notification_outbox', ?, ?, '127.0.0.1', 'BrevoService/1.0', ?)
      `).run(
        `aud_${generateId().slice(0, 10)}`,
        profileId,
        userId,
        outboxId,
        now,
        JSON.stringify({ recipientEmail, medicationName, brevoMessageId, deliveryStatus })
      );
    } catch (dbErr) {
      console.warn('Could not record notification audit in DB:', dbErr);
    }

    return NextResponse.json({
      success: true,
      deliveryStatus,
      messageId: brevoMessageId,
      recipientEmail,
      recipientName,
      medicationName,
      scheduledTime,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Send Reminder API Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to dispatch reminder' }, { status: 500 });
  }
}
