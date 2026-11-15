'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { CareMembership, UserRole } from '@/types';
import { 
  Users, 
  UserPlus, 
  KeyRound, 
  ShieldCheck, 
  Trash2, 
  Copy, 
  Check, 
  Clock, 
  Lock, 
  AlertTriangle,
  X
} from 'lucide-react';

export default function CareCirclePage() {
  const { currentUser, currentProfile, refreshKey, triggerRefresh, showNotification } = useApp();
  const [members, setMembers] = useState<CareMembership[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('caretaker');
  const [generatedPasscode, setGeneratedPasscode] = useState<string | null>(null);
  const [passcodeExpiresAt, setPasscodeExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [submittingInvite, setSubmittingInvite] = useState(false);

  // Accept passcode modal state
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [inputPasscode, setInputPasscode] = useState('');
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/care-circle?profileId=${currentProfile.id}&userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.members) {
          setMembers(data.members);
        } else if (data.error) {
          showNotification(`Notice: ${data.error}`);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [currentProfile.id, currentUser.id, refreshKey, showNotification]);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingInvite(true);
    try {
      const res = await fetch('/api/care-circle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_invitation',
          profileId: currentProfile.id,
          inviterUserId: currentUser.id,
          inviteeEmail: inviteEmail,
          role: inviteRole,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        showNotification(`Error: ${data.error || 'Failed to generate invitation'}`);
      } else {
        setGeneratedPasscode(data.invitation.plaintextCode);
        setPasscodeExpiresAt(data.invitation.expiresAt);
        showNotification(`Single-use invitation passcode generated for ${inviteEmail}`);
        triggerRefresh();
      }
    } catch (err: any) {
      showNotification(`Request error: ${err.message}`);
    } finally {
      setSubmittingInvite(false);
    }
  };

  const handleAcceptPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccepting(true);
    try {
      const res = await fetch('/api/care-circle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept_invitation',
          profileId: currentProfile.id,
          plaintextCode: inputPasscode,
          userId: currentUser.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        showNotification(`Error: ${data.error || 'Passcode verification failed'}`);
      } else {
        showNotification(`Success: ${data.message}`);
        setShowAcceptModal(false);
        setInputPasscode('');
        triggerRefresh();
      }
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    } finally {
      setAccepting(false);
    }
  };

  const handleRevokeMembership = async (targetUserId: string, userName: string) => {
    if (!confirm(`Are you sure you want to revoke access for ${userName}? They will immediately lose access to this profile.`)) {
      return;
    }

    try {
      const res = await fetch('/api/care-circle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'revoke_membership',
          profileId: currentProfile.id,
          targetUserId,
          revokingUserId: currentUser.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        showNotification(`Error: ${data.error || 'Failed to revoke access'}`);
      } else {
        showNotification(`Access for ${userName} has been permanently revoked.`);
        triggerRefresh();
      }
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-kalji-50 text-kalji-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Authorized Network</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Care Circle &amp; Permissions
          </h1>
          <p className="text-slate-600 mt-1 font-medium">
            Family members and caretakers authorized to support <span className="font-bold text-slate-900">{currentProfile.preferred_name}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAcceptModal(true)}
            className="min-h-touch px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition-colors flex items-center gap-2"
          >
            <KeyRound className="w-4 h-4 text-slate-500" aria-hidden="true" />
            <span>Enter Passcode</span>
          </button>

          <button
            onClick={() => {
              setGeneratedPasscode(null);
              setShowInviteModal(true);
            }}
            className="min-h-touch px-5 py-2.5 bg-kalji-700 hover:bg-kalji-800 text-white font-extrabold text-sm rounded-xl shadow transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            <span>Invite with Passcode</span>
          </button>
        </div>
      </div>

      {/* Security Architecture Info Banner */}
      <div className="bg-cream-100 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-kalji-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          <strong>Cryptographic Access Guarantee:</strong> KaljiHome never uses permanent household passwords. Invitations generate single-use, 10-minute expiring passcodes stored strictly as HMAC-SHA256 digests. Memberships are profile-scoped and revoking access immediately invalidates session permissions on every endpoint.
        </div>
      </div>

      {/* Members List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          Loading Care Circle roster...
        </div>
      ) : members.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          No members currently in the care circle.
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900">
            Active Members ({members.length})
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {members.map((member) => {
              const isOwner = member.role === 'owner';
              const isCurrentUser = member.user_id === currentUser.id;

              return (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-extrabold text-slate-900">
                        {member.user?.display_name}
                      </h3>
                      <span className={`text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        member.role === 'owner' ? 'bg-terracotta-100 text-terracotta-800' :
                        member.role === 'care_manager' ? 'bg-kalji-100 text-kalji-800' :
                        member.role === 'caretaker' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {member.role.replace('_', ' ')}
                      </span>

                      {isCurrentUser && (
                        <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          (You)
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 font-medium">
                      {member.user?.email} • Role: {member.user?.role_title || member.role}
                    </p>

                    {/* Permissions breakdown */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${member.view_medications ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                        {member.view_medications ? '✓' : '✗'} View Meds
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${member.manage_medications ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                        {member.manage_medications ? '✓' : '✗'} Edit Meds
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${member.record_dose ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                        {member.record_dose ? '✓' : '✗'} Record Dose
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${member.manage_appointments ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                        {member.manage_appointments ? '✓' : '✗'} Manage Appts
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${member.manage_members ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                        {member.manage_members ? '✓' : '✗'} Invite/Revoke
                      </span>
                    </div>
                  </div>

                  {/* Revoke Access Button (disabled for owner) */}
                  {!isOwner && (
                    <div>
                      <button
                        onClick={() => handleRevokeMembership(member.user_id, member.user?.display_name || 'Member')}
                        className="min-h-touch px-4 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                        <span>Revoke Access</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="invite-title">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-kalji-700" aria-hidden="true" />
                <h2 id="invite-title" className="text-2xl font-extrabold text-slate-900">
                  Invite to Care Circle
                </h2>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                aria-label="Close dialog"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {!generatedPasscode ? (
              <form onSubmit={handleCreateInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Invitee Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. helper.sunita@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-kalji-600"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    The passcode will be cryptographically bound to this exact email address.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Care Circle Role *
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-kalji-600 bg-white"
                  >
                    <option value="caretaker">Caretaker / Helper (Can record doses; cannot alter prescription details)</option>
                    <option value="care_manager">Family Care Manager (Can manage prescriptions &amp; appointments)</option>
                    <option value="read_only">Read-Only Family Member (Viewing only)</option>
                  </select>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-800">Security Safeguards:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>One-time use (atomically invalidated upon acceptance)</li>
                    <li>Expires in 10 minutes</li>
                    <li>Locked after 5 incorrect attempts</li>
                    <li>Plaintext code is never logged or stored in the database</li>
                  </ul>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="min-h-touch px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingInvite}
                    className="min-h-touch px-6 py-2.5 bg-kalji-700 hover:bg-kalji-800 text-white font-extrabold rounded-xl shadow disabled:opacity-50"
                  >
                    {submittingInvite ? 'Generating...' : 'Generate Passcode'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Single-Use Passcode Generated
                  </span>
                  
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-mono text-3xl sm:text-4xl font-black text-slate-900 tracking-widest bg-white px-4 py-2 rounded-xl border border-emerald-200 shadow-sm">
                      {generatedPasscode}
                    </span>
                    <button
                      onClick={() => copyToClipboard(generatedPasscode)}
                      className="p-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-sm text-slate-700"
                      title="Copy passcode"
                    >
                      {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 font-medium">
                    Bound to: <strong className="text-slate-900">{inviteEmail}</strong> • Valid for 10 minutes
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
                  <strong>Important:</strong> Share this code securely with {inviteEmail}. It will expire at {new Date(passcodeExpiresAt || '').toLocaleTimeString()} and cannot be viewed again once this dialog is closed.
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="min-h-touch px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Accept Passcode Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="accept-title">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-6 h-6 text-kalji-700" aria-hidden="true" />
                <h2 id="accept-title" className="text-2xl font-extrabold text-slate-900">
                  Join Care Circle
                </h2>
              </div>
              <button
                onClick={() => setShowAcceptModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                aria-label="Close dialog"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAcceptPasscode} className="space-y-4">
              <div className="text-xs text-slate-600">
                You are currently signed in as <strong className="text-slate-900">{currentUser.display_name} ({currentUser.email})</strong>. The passcode must match this email address.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  8-Character Passcode *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. K7M2-P9X4"
                  value={inputPasscode}
                  onChange={(e) => setInputPasscode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-lg font-mono font-bold tracking-widest text-center focus:ring-2 focus:ring-kalji-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAcceptModal(false)}
                  className="min-h-touch px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={accepting}
                  className="min-h-touch px-6 py-2.5 bg-kalji-700 hover:bg-kalji-800 text-white font-extrabold rounded-xl shadow disabled:opacity-50"
                >
                  {accepting ? 'Verifying...' : 'Verify & Join'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
