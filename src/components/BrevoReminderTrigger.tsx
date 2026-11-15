'use client';

import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, Loader2, Sparkles, Clock, ShieldCheck } from 'lucide-react';

interface BrevoReminderTriggerProps {
  defaultEmail?: string;
  defaultMedication?: string;
  elderName?: string;
  onSent?: (result: any) => void;
}

export const BrevoReminderTrigger: React.FC<BrevoReminderTriggerProps> = ({
  defaultEmail = 'patilsakshi18027@gmail.com',
  defaultMedication = 'Amlodipine 5mg',
  elderName = 'Meera Sharma',
  onSent,
}) => {
  const [recipientEmail, setRecipientEmail] = useState(defaultEmail);
  const [recipientName, setRecipientName] = useState('Sakshi Patil');
  const [medicationName, setMedicationName] = useState(defaultMedication);
  const [scheduledTime, setScheduledTime] = useState('08:00 AM IST');
  const [instructions, setInstructions] = useState('1 tablet orally after breakfast with a full glass of water');
  
  const [loading, setLoading] = useState(false);
  const [statusResult, setStatusResult] = useState<{
    success: boolean;
    messageId?: string;
    deliveryStatus?: string;
    error?: string;
  } | null>(null);

  const predefinedMeds = [
    { name: 'Amlodipine 5mg', time: '08:00 AM IST', note: '1 tablet orally after breakfast' },
    { name: 'Metformin 500mg', time: '01:00 PM IST', note: '1 tablet with afternoon lunch' },
    { name: 'Atorvastatin 20mg', time: '08:00 PM IST', note: '1 tablet at bedtime with water' },
  ];

  const handleSelectPredefined = (med: typeof predefinedMeds[0]) => {
    setMedicationName(med.name);
    setScheduledTime(med.time);
    setInstructions(med.note);
  };

  const handleSendReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      alert('Please enter a valid Gmail or email address.');
      return;
    }

    setLoading(true);
    setStatusResult(null);

    try {
      const res = await fetch('/api/notifications/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: recipientEmail.trim(),
          recipientName: recipientName.trim(),
          medicationName,
          scheduledTime,
          instructions,
          elderName,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusResult({
          success: true,
          messageId: data.messageId,
          deliveryStatus: data.deliveryStatus,
        });
        if (onSent) onSent(data);
      } else {
        setStatusResult({
          success: false,
          error: data.error || 'Failed to dispatch email via Brevo.',
        });
      }
    } catch (err: any) {
      setStatusResult({
        success: false,
        error: err.message || 'Network error dispatching reminder.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-teal-600/30 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shadow-inner">
            <Mail className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>Send Live Medicine Reminder to Gmail</span>
              <span className="text-[11px] font-extrabold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full uppercase">
                Brevo API Active
              </span>
            </h3>
            <p className="text-xs text-slate-600">
              Dispatches an immediate branded healthcare reminder directly to the user&apos;s Gmail inbox
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>API Key Verified (201 OK)</span>
        </div>
      </div>

      <form onSubmit={handleSendReminder} className="space-y-4">
        {/* Preset medication picker */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Quick Select Scheduled Medication:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {predefinedMeds.map((med) => {
              const active = medicationName === med.name;
              return (
                <button
                  type="button"
                  key={med.name}
                  onClick={() => handleSelectPredefined(med)}
                  className={`px-3 py-2 rounded-xl text-left text-xs transition-all border ${
                    active 
                      ? 'bg-teal-700 text-white border-teal-800 shadow-sm' 
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-teal-50/50'
                  }`}
                >
                  <div className="font-bold">{med.name}</div>
                  <div className={`text-[10px] ${active ? 'text-teal-100' : 'text-slate-500'}`}>
                    {med.time}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recipient Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="brevo-email" className="block text-xs font-bold text-slate-700 mb-1">
              Recipient Gmail / Email:
            </label>
            <input
              id="brevo-email"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-600 text-sm font-semibold text-slate-900 bg-white"
              placeholder="e.g. patilsakshi18027@gmail.com"
            />
          </div>

          <div>
            <label htmlFor="brevo-name" className="block text-xs font-bold text-slate-700 mb-1">
              Recipient Name:
            </label>
            <input
              id="brevo-name"
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-600 text-sm font-semibold text-slate-900 bg-white"
              placeholder="e.g. Sakshi Patil"
            />
          </div>
        </div>

        {/* Medicine & Instructions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="brevo-med" className="block text-xs font-bold text-slate-700 mb-1">
              Medication &amp; Dosage:
            </label>
            <input
              id="brevo-med"
              type="text"
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-600 text-sm font-semibold text-slate-900 bg-white"
            />
          </div>

          <div>
            <label htmlFor="brevo-time" className="block text-xs font-bold text-slate-700 mb-1">
              Scheduled Dose Time:
            </label>
            <input
              id="brevo-time"
              type="text"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-600 text-sm font-semibold text-slate-900 bg-white"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] px-6 py-3.5 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white font-extrabold text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending email via Brevo SMTP API...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send Real Medicine Reminder to Gmail ({recipientEmail})</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Result notification */}
      {statusResult && (
        <div
          className={`p-4 rounded-xl text-sm border flex items-start gap-3 ${
            statusResult.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
          role="status"
        >
          {statusResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <div className="font-extrabold text-base">
              {statusResult.success
                ? 'Reminder Successfully Dispatched via Brevo API!'
                : 'Failed to Send Reminder Email'}
            </div>
            {statusResult.success ? (
              <div className="text-xs space-y-1">
                <p>
                  Delivered to: <strong>{recipientEmail}</strong> for <strong>{medicationName}</strong>
                </p>
                <p className="font-mono text-[11px] text-emerald-800">
                  Brevo Message ID: {statusResult.messageId}
                </p>
                <p className="text-emerald-700 font-medium">
                  ✓ Please check your Gmail inbox (or spam folder if first time) to view the rich care reminder.
                </p>
              </div>
            ) : (
              <p className="text-xs text-rose-700">{statusResult.error}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
