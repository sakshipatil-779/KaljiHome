'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { Appointment, AppointmentStatus } from '@/types';
import { 
  Stethoscope, 
  Plus, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Bell, 
  X,
  AlertCircle
} from 'lucide-react';

export default function AppointmentsPage() {
  const { currentUser, currentProfile, refreshKey, triggerRefresh, showNotification } = useApp();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [clinicianDisplayName, setClinicianDisplayName] = useState('');
  const [facilityDisplayName, setFacilityDisplayName] = useState('');
  const [locationText, setLocationText] = useState('');
  const [scheduledLocalDate, setScheduledLocalDate] = useState('');
  const [scheduledLocalTime, setScheduledLocalTime] = useState('10:00');
  const [purposeNote, setPurposeNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduledLocalDate(tomorrow.toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/appointments?profileId=${currentProfile.id}&userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.appointments) {
          setAppointments(data.appointments);
        } else if (data.error) {
          showNotification(`Notice: ${data.error}`);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [currentProfile.id, currentUser.id, refreshKey, showNotification]);

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: currentProfile.id,
          userId: currentUser.id,
          clinicianDisplayName,
          facilityDisplayName,
          locationText,
          scheduledLocalDate,
          scheduledLocalTime,
          purposeNote,
          reminderOffsetsHours: [24, 2],
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        showNotification(`Error: ${data.error || 'Failed to schedule appointment'}`);
      } else {
        showNotification(`Appointment scheduled with ${clinicianDisplayName}`);
        setShowAddModal(false);
        setClinicianDisplayName('');
        setFacilityDisplayName('');
        setLocationText('');
        setPurposeNote('');
        triggerRefresh();
      }
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          appointmentId,
          profileId: currentProfile.id,
          userId: currentUser.id,
          newStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        showNotification(`Error: ${data.error || 'Failed to update status'}`);
      } else {
        showNotification(`Appointment marked as ${newStatus}`);
        triggerRefresh();
      }
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-kalji-50 text-kalji-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <Stethoscope className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Healthcare Visits</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Doctor Appointments
          </h1>
          <p className="text-slate-600 mt-1 font-medium">
            Clinical consultations &amp; checkups for <span className="font-bold text-slate-900">{currentProfile.preferred_name}</span>
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="min-h-touch px-6 py-3 bg-kalji-700 hover:bg-kalji-800 text-white font-extrabold text-sm rounded-xl shadow transition-colors flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          <span>Schedule Appointment</span>
        </button>
      </div>

      {/* Privacy Notice on Appointment Reminders */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          <strong>Privacy Guard:</strong> Automated email reminders (24h and 2h prior) will notify Care Circle members without leaking clinical purpose notes or diagnosis onto notification lock screens.
        </div>
      </div>

      {/* Appointment Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          Loading appointments...
        </div>
      ) : appointments.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          No appointments recorded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appointments.map((appt) => {
            const isUpcoming = appt.status === 'upcoming';
            const isCompleted = appt.status === 'completed';
            const isCancelled = appt.status === 'cancelled';

            return (
              <div
                key={appt.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                      {appt.clinician_display_name}
                    </h2>
                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      isUpcoming ? 'bg-kalji-100 text-kalji-800 border border-kalji-200' :
                      isCompleted ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {appt.status}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-700">
                    {appt.facility_display_name}
                  </p>

                  <div className="bg-cream-100 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5 text-slate-700">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <Clock className="w-4 h-4 text-kalji-700" aria-hidden="true" />
                      <span>{appt.scheduled_local_date} at {appt.scheduled_local_time} IST</span>
                    </div>

                    {appt.location_text && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{appt.location_text}</span>
                      </div>
                    )}
                  </div>

                  {appt.purpose_note && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <strong>Consultation Purpose:</strong> {appt.purpose_note}
                    </p>
                  )}
                </div>

                {/* Status Action Buttons */}
                {isUpcoming && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleStatusChange(appt.id, 'completed')}
                      className="min-h-touch px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      <span>Mark Attended / Completed</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(appt.id, 'cancelled')}
                      className="min-h-touch px-3 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <XCircle className="w-4 h-4 text-slate-500" aria-hidden="true" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Appointment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="add-appt-title">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-6 h-6 text-kalji-700" aria-hidden="true" />
                <h2 id="add-appt-title" className="text-2xl font-extrabold text-slate-900">
                  Schedule Doctor Visit
                </h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                aria-label="Close dialog"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Doctor / Clinician Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sneha Kulkarni"
                  value={clinicianDisplayName}
                  onChange={(e) => setClinicianDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-kalji-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Clinic / Hospital Facility *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apollo Clinic - Aundh, Pune"
                  value={facilityDisplayName}
                  onChange={(e) => setFacilityDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-kalji-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduledLocalDate}
                    onChange={(e) => setScheduledLocalDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Time (IST) *
                  </label>
                  <input
                    type="time"
                    required
                    value={scheduledLocalTime}
                    onChange={(e) => setScheduledLocalTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Clinic Location / Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3rd Floor, Commercial Wing, ITI Road, Aundh, Pune"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Consultation Purpose (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Quarterly routine checkup; blood sugar & BP assessment"
                  value={purposeNote}
                  onChange={(e) => setPurposeNote(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="min-h-touch px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="min-h-touch px-6 py-2.5 bg-kalji-700 hover:bg-kalji-800 text-white font-extrabold rounded-xl shadow disabled:opacity-50"
                >
                  {submitting ? 'Scheduling...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
