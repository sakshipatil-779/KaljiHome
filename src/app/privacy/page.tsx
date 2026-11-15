'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  FileCheck, 
  Users, 
  Scale, 
  KeyRound, 
  CheckCircle2 
} from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
        <div className="inline-flex items-center gap-2 bg-kalji-50 text-kalji-800 text-xs font-bold px-3 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Governance &amp; Clinical Safety</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Trust, Safety &amp; Legal Architecture
        </h1>
        <p className="text-base text-slate-600 font-medium leading-relaxed">
          How KaljiHome protects older adults, preserves clinical boundaries, and implements privacy-by-design under Indian healthcare and data protection standards.
        </p>
      </div>

      {/* 1. Clinical Boundaries & Mandatory Safety Disclaimers */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
            <AlertTriangle className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Clinical Safety Boundaries</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Non-Negotiable System Invariants</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-slate-700 leading-relaxed pt-2">
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
            <h3 className="font-extrabold text-amber-900">Not a Prescribing or Diagnostic Device</h3>
            <p>
              KaljiHome is strictly a routine care coordination, reminder, and family collaboration platform. It does <strong>not</strong> provide medical diagnosis, clinical symptom triage, drug-interaction calculators, or automated dose adjustments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="border border-slate-200 p-4 rounded-xl space-y-1.5">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Prescription Transcription Only</span>
              </h4>
              <p className="text-xs text-slate-600">
                All medications must be transcribed directly from a valid clinician prescription and explicitly confirmed by an authorized user before schedule generation.
              </p>
            </div>

            <div className="border border-slate-200 p-4 rounded-xl space-y-1.5">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Reported vs. Ingestion Distinction</span>
              </h4>
              <p className="text-xs text-slate-600">
                A &quot;Taken&quot; record is always labeled as self-reported or caregiver-reported with actor attribution. It is never misrepresented as biochemical proof of ingestion.
              </p>
            </div>

            <div className="border border-slate-200 p-4 rounded-xl space-y-1.5">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Grace Period &quot;Unconfirmed&quot; Rule</span>
              </h4>
              <p className="text-xs text-slate-600">
                When no status is recorded after the grace period, the state transitions to <em>Unconfirmed / No status recorded</em>. It is never silently marked as skipped or taken.
              </p>
            </div>

            <div className="border border-slate-200 p-4 rounded-xl space-y-1.5">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>No Missed-Dose Advice</span>
              </h4>
              <p className="text-xs text-slate-600">
                The platform will never advise a user to double a dose or compensate for missed medication. Users are directed to their prescribing clinician or pharmacist.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. India DPDP Act & ABDM Reference */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-kalji-100 text-kalji-800 rounded-xl">
            <Scale className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">India Data Protection Standards</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">DPDP Act, 2023 &amp; SPDI Rules</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-700 leading-relaxed pt-2">
          <p>
            As of November 2026, India&apos;s Digital Personal Data Protection (DPDP) Act, 2023 and DPDP Rules, 2025 have entered their phased implementation timeline (with primary compliance tranches in force and operational enforcement scheduled for 13 May 2027). IT Act Section 43A and SPDI Rules govern existing practices. KaljiHome builds to future DPDP standards today:
          </p>

          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600">
            <li>
              <strong>Data Minimization:</strong> We store only minimum required operational data. No Aadhaar numbers, full physical addresses, or extraneous health histories are collected.
            </li>
            <li>
              <strong>Purpose Limitation:</strong> Patient data is used strictly for medication coordination and appointment reminders. Zero data is shared with advertisers, brokers, or third parties.
            </li>
            <li>
              <strong>Patient Consent &amp; Agency:</strong> The older adult owns their profile. Family relationships alone do not grant access; explicit revocable permissions are required for every member.
            </li>
            <li>
              <strong>ABDM Alignment:</strong> Architectural separation of identity, profile, and audit logs follows the design principles of the Ayushman Bharat Digital Mission (ABDM) Health Data Management Policy.
            </li>
          </ul>
        </div>
      </div>

      {/* 3. Cryptographic Passcodes & Least Privilege RBAC */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-terracotta-100 text-terracotta-800 rounded-xl">
            <KeyRound className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Access Security &amp; Passcode Architecture</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Zero Shared Household Passwords</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs text-slate-700">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <h4 className="font-bold text-slate-900">Keyed HMAC-SHA256 Storage</h4>
            <p className="text-slate-600">
              Passcodes are never stored or logged in plaintext. Only HMAC digests salted with the profile ID and invitee email are written to disk.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <h4 className="font-bold text-slate-900">Atomic Acceptance &amp; Expiry</h4>
            <p className="text-slate-600">
              Passcodes expire in 10 minutes and lock after 5 failed attempts. Atomic database transactions eliminate race-condition replays.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <h4 className="font-bold text-slate-900">Immediate Revocation</h4>
            <p className="text-slate-600">
              Revoking a member invalidates access on every server route instantly, even if the revoked user holds an active browser session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
