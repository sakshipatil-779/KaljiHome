'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { Medication, FrequencyType } from '@/types';
import { 
  Pill, 
  Plus, 
  Clock, 
  FileText, 
  CheckSquare, 
  AlertTriangle, 
  PauseCircle, 
  StopCircle, 
  PlayCircle,
  History,
  ShieldCheck,
  X
} from 'lucide-react';

export default function MedicationsPage() {
  const { currentUser, currentProfile, refreshKey, triggerRefresh, showNotification } = useApp();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [strengthText, setStrengthText] = useState('');
  const [doseAmount, setDoseAmount] = useState('1');
  const [doseUnit, setDoseUnit] = useState('tablet');
  const [route, setRoute] = useState('oral');
  const [sourceNote, setSourceNote] = useState('');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('daily');
  const [time1, setTime1] = useState('08:00');
  const [time2, setTime2] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [instructionsText, setInstructionsText] = useState('');
  const [confirmedPrescription, setConfirmedPrescription] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/medications?profileId=${currentProfile.id}&userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.medications) {
          setMedications(data.medications);
        } else if (data.error) {
          showNotification(`Notice: ${data.error}`);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [currentProfile.id, currentUser.id, refreshKey, showNotification]);

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedPrescription) {
      showNotification('Clinical Safety: You must verify that details match the prescription.');
      return;
    }

    const localTimes = [time1];
    if (time2.trim()) localTimes.push(time2);

    setSubmitting(true);
    try {
      const res = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: currentProfile.id,
          userId: currentUser.id,
          displayName,
          strengthText,
          doseAmount,
          doseUnit,
          route,
          sourceNote,
          frequencyType,
          localTimes,
          startDate,
          instructionsText,
          confirmedPrescription,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        showNotification(`Error: ${data.error || 'Failed to add medication'}`);
      } else {
        showNotification(`Successfully added ${displayName}`);
        setShowAddModal(false);
        // Reset form
        setDisplayName('');
        setStrengthText('');
        setSourceNote('');
        setInstructionsText('');
        setConfirmedPrescription(false);
        triggerRefresh();
      }
    } catch (err: any) {
      showNotification(`Request error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (medicationId: string, newStatus: 'active' | 'paused' | 'discontinued') => {
    if (!confirm(`Are you sure you want to mark this medication as ${newStatus}?`)) return;

    try {
      const res = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          medicationId,
          profileId: currentProfile.id,
          userId: currentUser.id,
          newStatus,
          reason: `Updated to ${newStatus} by ${currentUser.display_name}`,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        showNotification(`Error: ${data.error || 'Failed to update status'}`);
      } else {
        showNotification(`Medication status updated to ${newStatus}`);
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
            <Pill className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Prescription Records</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Prescriptions &amp; Schedules
          </h1>
          <p className="text-slate-600 mt-1 font-medium">
            Managed medication regimens for <span className="font-bold text-slate-900">{currentProfile.preferred_name}</span>
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="min-h-touch px-6 py-3 bg-kalji-700 hover:bg-kalji-800 text-white font-extrabold text-sm rounded-xl shadow transition-colors flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          <span>Add Medication</span>
        </button>
      </div>

      {/* Clinical Safety Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
          <strong>Clinical Verification Guard:</strong> All medications must be transcribed directly from a valid clinician prescription. KaljiHome does not suggest, auto-complete, or infer dosages, and will never recommend compensation for a missed dose.
        </div>
      </div>

      {/* Medication List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          Loading medication records...
        </div>
      ) : medications.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          No medications currently registered. Use &quot;Add Medication&quot; above to record one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {medications.map((med) => {
            const sched = med.current_schedule;
            const isActive = med.status === 'active';
            const isPaused = med.status === 'paused';
            const isDiscontinued = med.status === 'discontinued';

            return (
              <div 
                key={med.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-extrabold text-slate-900">{med.display_name}</h2>
                      <span className="text-sm font-bold bg-slate-100 text-slate-800 px-3 py-0.5 rounded-lg border border-slate-200">
                        {med.strength_text}
                      </span>
                      <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isActive ? 'bg-emerald-100 text-emerald-800' :
                        isPaused ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {med.status}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 font-medium">
                      {med.dose_amount} {med.dose_unit} • Route: {med.route} • Frequency: {sched?.frequency_type}
                    </p>

                    {med.source_note && (
                      <p className="text-xs text-slate-500 pt-1">
                        <strong>Prescriber / Source:</strong> {med.source_note}
                      </p>
                    )}
                  </div>

                  {/* Status Actions */}
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <button
                        onClick={() => handleStatusChange(med.id, 'paused')}
                        className="px-3.5 py-2 text-xs font-bold rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 flex items-center gap-1.5 transition-colors"
                      >
                        <PauseCircle className="w-4 h-4" aria-hidden="true" />
                        <span>Pause</span>
                      </button>
                    )}
                    {isPaused && (
                      <button
                        onClick={() => handleStatusChange(med.id, 'active')}
                        className="px-3.5 py-2 text-xs font-bold rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 flex items-center gap-1.5 transition-colors"
                      >
                        <PlayCircle className="w-4 h-4" aria-hidden="true" />
                        <span>Resume</span>
                      </button>
                    )}
                    {!isDiscontinued && (
                      <button
                        onClick={() => handleStatusChange(med.id, 'discontinued')}
                        className="px-3.5 py-2 text-xs font-bold rounded-lg border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1.5 transition-colors"
                      >
                        <StopCircle className="w-4 h-4" aria-hidden="true" />
                        <span>Discontinue</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Schedule Details Box */}
                {sched && (
                  <div className="bg-cream-100 border border-slate-200 rounded-xl p-4 text-xs sm:text-sm space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-kalji-700" aria-hidden="true" />
                        Scheduled Times ({sched.timezone}):
                      </span>
                      <div className="flex items-center gap-2">
                        {sched.local_times.map((t, idx) => (
                          <span key={idx} className="bg-white border border-slate-300 px-2.5 py-1 rounded-md font-bold text-slate-900">
                            {t} IST
                          </span>
                        ))}
                      </div>
                    </div>

                    {sched.instructions_text && (
                      <p className="text-slate-600">
                        <strong>Usage Instructions:</strong> {sched.instructions_text}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
                      <span>Schedule Version: v{sched.version_number} (Effective from {sched.start_local_date})</span>
                      <span>Grace period: {sched.grace_period_minutes} minutes</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="add-med-title">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <Pill className="w-6 h-6 text-kalji-700" aria-hidden="true" />
                <h2 id="add-med-title" className="text-2xl font-extrabold text-slate-900">
                  Add Prescription Medication
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

            <form onSubmit={handleAddMedication} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Medication Name (as written on prescription) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metformin Hydrochloride"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-kalji-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Strength *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500 mg, 5 mg, 10 ml"
                    value={strengthText}
                    onChange={(e) => setStrengthText(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-kalji-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Route
                  </label>
                  <select
                    value={route}
                    onChange={(e) => setRoute(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-kalji-600 bg-white"
                  >
                    <option value="oral">Oral (by mouth)</option>
                    <option value="topical">Topical (skin ointment/drops)</option>
                    <option value="inhalation">Inhalation (inhaler/nebulizer)</option>
                    <option value="subcutaneous">Subcutaneous (injection/insulin)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Time 1 (IST) *
                  </label>
                  <input
                    type="time"
                    required
                    value={time1}
                    onChange={(e) => setTime1(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Time 2 (Optional)
                  </label>
                  <input
                    type="time"
                    value={time2}
                    onChange={(e) => setTime2(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Prescription Note / Doctor Info
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prescribed by Dr. Kulkarni on 10 Nov 2026"
                  value={sourceNote}
                  onChange={(e) => setSourceNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Patient Usage Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Take immediately after breakfast with half a glass of water"
                  value={instructionsText}
                  onChange={(e) => setInstructionsText(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              {/* Mandatory Confirmation */}
              <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl space-y-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={confirmedPrescription}
                    onChange={(e) => setConfirmedPrescription(e.target.checked)}
                    className="mt-1 h-5 w-5 rounded text-kalji-700 focus:ring-kalji-600"
                  />
                  <span className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    I have verified these medication details directly against the official physician prescription or instructions.
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 pl-8">
                  KaljiHome strictly requires human verification to prevent accidental misadministration.
                </p>
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
                  {submitting ? 'Saving...' : 'Save Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
