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
            className="hidden sm:inline-flex min-h-[36px] items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-teal-600"
            title="Sign in with Google"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google Login</span>
          </button>

          <button
            onClick={() => setIsAuthOpen(true)}
            className="hidden xl:inline-flex min-h-[36px] items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white rounded-xl text-xs font-bold shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-teal-500"
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
