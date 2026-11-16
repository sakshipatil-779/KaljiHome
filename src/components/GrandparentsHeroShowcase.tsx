'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FirebaseAuthModal } from './FirebaseAuthModal';
import { 
  Heart, 
  Pill, 
  Calendar, 
  Users, 
  Mail, 
  Volume2, 
  ShieldCheck, 
  Eye, 
  X, 
  ExternalLink,
  Sparkles 
} from 'lucide-react';

export const GrandparentsHeroShowcase: React.FC = () => {
  const [showFullPosterModal, setShowFullPosterModal] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-teal-700/50">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Elder Image & Visual Care Card */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative group">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl bg-teal-950">
              <Image
                src="/assets/grandparents_phone.jpg"
                alt="Grandfather and Grandmother smiling warmly while using KaljiHome on their smartphone"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-center">
                <span className="inline-block bg-teal-700/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow border border-teal-400/30">
                  Care Together at Home 💙
                </span>
              </div>
            </div>

            {/* Float badge */}
            <div className="absolute -top-3 -right-3 bg-white text-teal-900 font-extrabold text-xs px-3 py-1.5 rounded-full shadow-lg border border-teal-100 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>Independent &amp; Safe</span>
            </div>
          </div>

          <button
            onClick={() => setShowFullPosterModal(true)}
            className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-teal-200 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full transition-colors border border-white/10"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Full Healthcare Poster &amp; Vision</span>
          </button>
        </div>

        {/* Right Column: Platform Vision & Key Capabilities */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-teal-200 border border-teal-400/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Introducing KaljiHome (काळजी होम)</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Smart Healthcare Companion for <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-teal-100 to-amber-200">Our Seniors</span>
          </h2>

          <p className="text-teal-100/90 text-sm sm:text-base leading-relaxed">
            A connected, secure platform to manage medications, doctor appointments, and daily routines — while keeping family members, children, and caretakers informed and in sync.
          </p>

          {/* 6 Key Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/10 text-xs">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-200 flex items-center justify-center flex-shrink-0">
                <Pill className="w-4 h-4 text-teal-300" />
              </div>
              <div>
                <strong className="block text-white font-bold">Smart Medication Tracking</strong>
                <span className="text-teal-200/80 text-[11px]">Adherence &amp; dose verification</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/10 text-xs">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-200 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-teal-300" />
              </div>
              <div>
                <strong className="block text-white font-bold">Doctor Appointments</strong>
                <span className="text-teal-200/80 text-[11px]">Upcoming visits &amp; prep notes</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/10 text-xs">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-200 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-teal-300" />
              </div>
              <div>
                <strong className="block text-white font-bold">Family Care Circle</strong>
                <span className="text-teal-200/80 text-[11px]">Role-based access &amp; collaboration</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/10 text-xs">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-200 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-teal-300" />
              </div>
              <div>
                <strong className="block text-white font-bold">Brevo Gmail Reminders</strong>
                <span className="text-teal-200/80 text-[11px]">Real-time inbox alerts</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/10 text-xs">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-200 flex items-center justify-center flex-shrink-0">
                <Volume2 className="w-4 h-4 text-teal-300" />
              </div>
              <div>
                <strong className="block text-white font-bold">8 Indian Voice Languages</strong>
                <span className="text-teal-200/80 text-[11px]">मराठी, हिंदी, English &amp; more</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/10 text-xs">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-200 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4 text-teal-300" />
              </div>
              <div>
                <strong className="block text-white font-bold">Elder-Friendly &amp; Secure</strong>
                <span className="text-teal-200/80 text-[11px]">Passcode &amp; Firebase Auth</span>
              </div>
            </div>
          </div>

          {/* Three bottom pillars & Google Auth CTA */}
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-teal-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Safer &amp; More Independent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                <span>Informed &amp; Connected Families</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Better Health Outcomes</span>
              </div>
            </div>

            <button
              onClick={() => setIsAuthOpen(true)}
              className="min-h-[40px] px-3.5 py-1.5 bg-white hover:bg-teal-50 text-slate-900 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 border border-slate-200"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
      </div>

      {/* Firebase & Google Authentication Modal */}
      <FirebaseAuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Modal for full showcase poster */}
      {showFullPosterModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-w-3xl w-full max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden flex flex-col border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-800 text-white">
              <h4 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                <span>KaljiHome Official Showcase Poster</span>
                <span className="text-xs bg-teal-600 px-2 py-0.5 rounded-full font-bold">#BuildForImpact</span>
              </h4>
              <button
                onClick={() => setShowFullPosterModal(false)}
                className="p-1.5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative flex-1 min-h-[480px] p-2 bg-slate-950 flex items-center justify-center">
              <Image
                src="/assets/grandparents_showcase.jpg"
                alt="KaljiHome Official Platform Overview Poster"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
