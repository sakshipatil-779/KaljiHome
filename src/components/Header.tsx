'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { useApp } from './AppContext';
import { FirebaseAuthModal } from './FirebaseAuthModal';
import { 
  ShieldCheck, 
  UserCheck, 
  Bell, 
  Clock, 
  Lock, 
  Sparkles,
  LogIn
} from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, availableUsers, switchUser, currentProfile, activeNotification } = useApp();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm" role="banner">
      {/* Active notification announcement banner */}
      {activeNotification && (
        <div 
          className="bg-kalji-700 text-white px-4 py-2.5 text-center text-sm font-semibold flex items-center justify-center gap-2"
          role="status"
          aria-live="polite"
        >
          <Bell className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>{activeNotification}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        {/* Left: Brand Logo & Elder Profile Context */}
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <Link href="/" className="focus-visible:ring-4 focus-visible:ring-kalji-600 rounded-lg">
            <Logo size="md" />
          </Link>

          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-200 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">{currentProfile.preferred_name}</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              {currentProfile.timezone}
            </span>
          </div>

          {/* Firebase Sign In CTA button (mobile / tablet accessible) */}
          <button
            onClick={() => setIsAuthOpen(true)}
            className="xl:hidden inline-flex items-center gap-1.5 px-3 py-1.5 bg-kalji-50 hover:bg-kalji-100 border border-kalji-200 text-kalji-800 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Lock className="w-3.5 h-3.5 text-kalji-700" />
            <span>Firebase Auth</span>
          </button>
        </div>

        {/* Right: Firebase Sign-In Button + Hackathon Persona Switcher (RBAC) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Direct Firebase Auth Modal trigger */}
          <button
            onClick={() => setIsAuthOpen(true)}
            className="hidden xl:inline-flex min-h-touch items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white rounded-xl text-xs font-bold shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-teal-500"
            title="Firebase Authentication & Demo Account Switcher"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Firebase Login</span>
            <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded font-mono">
              Live Auth
            </span>
          </button>

          {/* Persona Switcher Container */}
          <div className="flex flex-wrap items-center gap-2 bg-cream-100 border border-slate-200 p-1.5 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 px-2 py-1">
              <UserCheck className="w-4 h-4 text-kalji-700" aria-hidden="true" />
              <span className="hidden sm:inline">Active:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5" role="radiogroup" aria-label="Select Active Persona">
              {availableUsers.map((user) => {
                const isActive = user.id === currentUser.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => switchUser(user.id)}
                    role="radio"
                    aria-checked={isActive}
                    className={`min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-kalji-700 text-white shadow-sm ring-2 ring-kalji-800'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{user.display_name.split(' ')[0]}</span>
                    <span className={`text-[9px] uppercase tracking-wider font-semibold px-1 py-0.5 rounded ${
                      isActive ? 'bg-kalji-800 text-teal-100' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {user.id === 'usr_sakshi' ? 'Admin' :
                       user.id === 'usr_meera' ? 'Owner' :
                       user.id === 'usr_arjun' ? 'Manager' :
                       user.id === 'usr_sunita' ? 'Caretaker' :
                       user.id === 'usr_nisha' ? 'Read-only' : 'Elder'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Firebase Authentication Modal */}
      <FirebaseAuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header>
  );
};
