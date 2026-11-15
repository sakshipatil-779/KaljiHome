'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/AppContext';
import { DoseOccurrence, Appointment, CareMembership } from '@/types';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  BellOff, 
  HelpCircle, 
  Stethoscope, 
  Users, 
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';

export default function TodayPage() {
  const { currentUser, currentProfile, refreshKey, triggerRefresh, showNotification } = useApp();
  const [occurrences, setOccurrences] = useState<DoseOccurrence[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [membership, setMembership] = useState<CareMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<{ [key: string]: string }>({});
  const [showNoteInput, setShowNoteInput] = useState<{ [key: string]: boolean }>({});

  const todayDateStr = new Date().toISOString().slice(0, 10);
  const formattedToday = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    setLoading(true);
    fetch(`/api/today?profileId=${currentProfile.id}&userId=${currentUser.id}&date=${todayDateStr}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          showNotification(`Access notice: ${data.error}`);
        } else {
          setOccurrences(data.occurrences || []);
          setAppointments(data.appointments || []);
          setMembership(data.membership || null);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [currentProfile.id, currentUser.id, refreshKey, showNotification, todayDateStr]);

  const handleRecordStatus = async (
    occurrenceId: string, 
    eventType: 'reported_taken' | 'reported_skipped' | 'snoozed' | 'unable_to_confirm'
  ) => {
    try {
      const source = 
        currentUser.id === currentProfile.owner_user_id ? 'older_adult' :
        currentUser.id === 'usr_sunita' ? 'caretaker' : 'family';

      const res = await fetch('/api/dose-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occurrenceId,
          profileId: currentProfile.id,
          userId: currentUser.id,
          eventType,
          source,
          note: selectedNote[occurrenceId] || undefined,
          snoozeMinutes: eventType === 'snoozed' ? 15 : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        showNotification(`Error: ${data.error || 'Failed to record action'}`);
      } else {
        const labels: Record<string, string> = {
          reported_taken: 'Reported Taken',
          reported_skipped: 'Reported Skipped',
          snoozed: 'Snoozed for 15 minutes',
          unable_to_confirm: 'Unable to confirm',
        };
        showNotification(`Success: Recorded ${labels[eventType]} as ${currentUser.display_name}`);
        triggerRefresh();
      }
    } catch (err: any) {
      showNotification(`Request error: ${err.message}`);
    }
  };

  // Find next upcoming dose
  const nextDose = occurrences.find((o) => o.status === 'scheduled');
  const canRecord = membership?.record_dose ?? false;

  return (
    <div className="space-y-8">
      {/* 1. Header greeting & Local Context */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-kalji-50 text-kalji-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <span>Daily Care Companion</span>
            <span>•</span>
            <span>{currentProfile.timezone}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Today&apos;s Care Routine
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-1 font-medium">
            {formattedToday} for <span className="font-bold text-slate-900">{currentProfile.preferred_name}</span>
          </p>
        </div>

        {/* Read-only / Caretaker permission alert badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700">
            <div className="font-bold text-slate-900 mb-0.5 flex items-center gap-1.5">
              <span>Your Role:</span>
              <span className="uppercase text-kalji-700 font-extrabold">{membership?.role || 'Guest'}</span>
            </div>
            <div>
              {canRecord ? (
                <span className="text-emerald-700 font-semibold">✓ Authorized to record dose actions</span>
              ) : (
                <span className="text-amber-800 font-semibold">⚠ Read-only viewer (dose recording restricted)</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Next Scheduled Dose Highlight Card */}
      {nextDose ? (
        <div className="bg-gradient-to-r from-kalji-700 to-kalji-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-teal-100">
                <Clock className="w-4 h-4" aria-hidden="true" />
                Next Scheduled Dose
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {nextDose.medication?.display_name} {nextDose.medication?.strength_text}
              </h2>
              <p className="text-sm sm:text-base text-teal-100 font-medium">
                Scheduled for <strong className="text-white font-extrabold">{nextDose.scheduled_local_time} IST</strong> • {nextDose.medication?.dose_amount} {nextDose.medication?.dose_unit} ({nextDose.medication?.route})
              </p>
            </div>

            {canRecord && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleRecordStatus(nextDose.id, 'reported_taken')}
                  className="min-h-touch px-6 py-3 bg-white text-kalji-900 hover:bg-teal-50 font-extrabold text-base rounded-xl shadow transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                  <span>Report Taken</span>
                </button>
                <button
                  onClick={() => handleRecordStatus(nextDose.id, 'snoozed')}
                  className="min-h-touch px-4 py-3 bg-kalji-800 hover:bg-kalji-600 text-white font-bold text-sm rounded-xl border border-teal-500 transition-colors flex items-center gap-2"
                >
                  <BellOff className="w-4 h-4" aria-hidden="true" />
                  <span>Snooze (15m)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-6 flex items-center gap-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" aria-hidden="true" />
          <div>
            <h3 className="font-bold text-lg">All scheduled doses for today have been reviewed!</h3>
            <p className="text-sm text-emerald-800">
              No further pending doses are scheduled for today. You can review today&apos;s log below.
            </p>
          </div>
        </div>
      )}

      {/* 3. Chronological Daily Medication Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>Today&apos;s Medication Routine</span>
            <span className="text-sm font-bold bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full">
              {occurrences.length}
            </span>
          </h2>
          <Link 
            href="/medications" 
            className="text-kalji-700 hover:text-kalji-800 font-bold text-sm flex items-center gap-1 hover:underline"
          >
            <span>View all prescriptions</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 font-medium">
            Loading today&apos;s routine...
          </div>
        ) : occurrences.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            No medication occurrences scheduled for today.
          </div>
        ) : (
          <div className="space-y-4" role="feed" aria-label="Today&apos;s Dose Occurrences">
            {occurrences.map((occ) => {
              const isTaken = occ.status === 'reported_taken';
              const isSkipped = occ.status === 'reported_skipped';
              const isUnconfirmed = occ.status === 'unconfirmed_after_grace';
              const isSnoozed = occ.status === 'snoozed';
              const isScheduled = occ.status === 'scheduled';

              return (
                <div 
                  key={occ.id}
                  className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all ${
                    isTaken ? 'border-emerald-200 bg-emerald-50/20' :
                    isUnconfirmed ? 'border-amber-300 bg-amber-50/30' :
                    isSkipped ? 'border-slate-300 bg-slate-50/50' :
                    'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Time & Drug Info */}
                    <div className="flex items-start gap-4">
                      {/* Big Time Indicator */}
                      <div className="bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-center min-w-[80px] flex-shrink-0">
                        <span className="block text-xl font-extrabold text-slate-900">{occ.scheduled_local_time}</span>
                        <span className="block text-[11px] font-bold text-slate-500 uppercase">IST</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-extrabold text-slate-900">
                            {occ.medication?.display_name}
                          </h3>
                          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md">
                            {occ.medication?.strength_text}
                          </span>
                        </div>

                        <p className="text-sm text-slate-600 font-medium">
                          {occ.medication?.dose_amount} {occ.medication?.dose_unit} • {occ.medication?.route}
                        </p>

                        {occ.medication?.instructions_text && (
                          <p className="text-xs text-slate-500 italic bg-cream-100 border border-cream-200 px-2.5 py-1 rounded-md inline-block">
                            Instructions: {occ.medication.instructions_text}
                          </p>
                        )}

                        {/* Attribution / Status Badge */}
                        <div className="pt-2">
                          {isTaken && (
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
                              <CheckCircle2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                              <span>
                                Reported Taken by {occ.latest_event?.recorder_name || 'Care Circle'} at {new Date(occ.latest_event?.recorded_at_utc || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          )}

                          {isSkipped && (
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-200 border border-slate-300 px-3 py-1 rounded-full">
                              <XCircle className="w-4 h-4 text-slate-700" aria-hidden="true" />
                              <span>
                                Reported Skipped by {occ.latest_event?.recorder_name || 'User'}
                              </span>
                            </div>
                          )}

                          {isUnconfirmed && (
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100 border border-amber-400 px-3 py-1 rounded-full">
                              <AlertTriangle className="w-4 h-4 text-amber-700" aria-hidden="true" />
                              <span>
                                No status recorded after grace period (Unconfirmed)
                              </span>
                            </div>
                          )}

                          {isSnoozed && (
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 bg-blue-100 border border-blue-300 px-3 py-1 rounded-full">
                              <BellOff className="w-4 h-4 text-blue-700" aria-hidden="true" />
                              <span>Snoozed (15m reminder active)</span>
                            </div>
                          )}

                          {isScheduled && (
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                              <Clock className="w-4 h-4 text-slate-500" aria-hidden="true" />
                              <span>Scheduled for today</span>
                            </div>
                          )}

                          {occ.latest_event?.note && (
                            <p className="text-xs text-slate-600 mt-1 pl-1">
                              Note: &quot;{occ.latest_event.note}&quot;
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons for Authorized Care Circle Members */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 lg:pt-0">
                      {canRecord ? (
                        <>
                          <button
                            onClick={() => handleRecordStatus(occ.id, 'reported_taken')}
                            className="min-h-touch px-4 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                            <span>{isTaken ? 'Re-confirm Taken' : 'Mark Taken'}</span>
                          </button>

                          <button
                            onClick={() => handleRecordStatus(occ.id, 'reported_skipped')}
                            className="min-h-touch px-3.5 py-2.5 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <XCircle className="w-4 h-4 text-slate-500" aria-hidden="true" />
                            <span>Skip</span>
                          </button>

                          <button
                            onClick={() => handleRecordStatus(occ.id, 'snoozed')}
                            className="min-h-touch px-3.5 py-2.5 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <BellOff className="w-4 h-4 text-slate-500" aria-hidden="true" />
                            <span>Snooze</span>
                          </button>
                        </>
                      ) : (
                        <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg italic">
                          Recording disabled for your assigned role ({membership?.role || 'read_only'}).
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Upcoming Doctor Appointments Summary Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-kalji-700" aria-hidden="true" />
            <h2 className="text-2xl font-extrabold text-slate-900">Upcoming Medical Appointments</h2>
          </div>
          <Link
            href="/appointments"
            className="text-kalji-700 hover:text-kalji-800 font-bold text-sm flex items-center gap-1 hover:underline"
          >
            <span>Manage appointments</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {appointments.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No upcoming appointments scheduled.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map((appt) => (
              <div key={appt.id} className="p-4 rounded-xl border border-teal-100 bg-teal-50/30 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">{appt.clinician_display_name}</h3>
                    <p className="text-xs text-slate-600 font-medium">{appt.facility_display_name}</p>
                  </div>
                  <span className="text-xs font-bold uppercase bg-kalji-100 text-kalji-800 px-2 py-0.5 rounded">
                    {appt.status}
                  </span>
                </div>
                <div className="text-xs text-slate-700 font-semibold flex items-center gap-1.5 pt-1">
                  <Clock className="w-4 h-4 text-kalji-700" aria-hidden="true" />
                  <span>
                    {appt.scheduled_local_date} at {appt.scheduled_local_time} IST
                  </span>
                </div>
                {appt.purpose_note && (
                  <p className="text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                    <strong>Purpose:</strong> {appt.purpose_note}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Care Circle Summary Footer Card */}
      <div className="bg-cream-100 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-terracotta-100 text-terracotta-700 p-3 rounded-xl">
            <Users className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Your Active Care Circle</h3>
            <p className="text-xs text-slate-600">
              Coordinated care between Meera Sharma, Arjun Sharma (Son), Sunita Patil (Caregiver), and Nisha Sharma.
            </p>
          </div>
        </div>
        <Link
          href="/care-circle"
          className="min-h-touch px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm rounded-xl flex items-center gap-2 shadow-sm transition-colors"
        >
          <span>View Care Circle &amp; Invite Members</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
