'use client';

import React, { useState } from 'react';
import { 
  signInWithFirebase, 
  registerWithFirebase, 
  signInWithGoogle,
  signOutFirebase 
} from '@/lib/firebase';
import { useApp } from './AppContext';
import { 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  Check, 
  X, 
  AlertCircle,
  KeyRound,
  Sparkles,
  Loader2
} from 'lucide-react';

interface FirebaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseAuthModal: React.FC<FirebaseAuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, switchUser, availableUsers, showNotification } = useApp();
  const [tab, setTab] = useState<'signin' | 'signup' | 'demo'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [roleTitle, setRoleTitle] = useState('Family Care Manager');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);

    try {
      const user = await signInWithGoogle();
      
      // Sync with backend SQLite session
      try {
        const syncRes = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0],
            firebaseUid: user.uid,
          }),
        });
        const syncData = await syncRes.json();
        if (syncData.user) {
          switchUser(syncData.user.id);
        }
      } catch (syncErr) {
        console.warn('Backend Google auth sync warning:', syncErr);
      }

      showNotification(`Signed in with Google as ${user.displayName || user.email}!`);
      onClose();
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Google sign-in popup was closed before completing.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMsg('Sign-in popup was blocked by your browser. Please allow popups for localhost.');
      } else {
        setErrorMsg(err.message || 'Failed to authenticate with Google.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const user = await signInWithFirebase(email, password);
      // Sync with backend SQLite session
      try {
        const syncRes = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            displayName: user.displayName,
            firebaseUid: user.uid,
          }),
        });
        const syncData = await syncRes.json();
        if (syncData.user) {
          switchUser(syncData.user.id);
        }
      } catch (syncErr) {
        console.warn('Backend auth sync warning:', syncErr);
      }

      showNotification(`Firebase Auth: Successfully signed in as ${user.email}`);
      onClose();
    } catch (err: any) {
      let message = err.message || 'Firebase login failed';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        message = 'Invalid email or password. You can also use "Continue with Google" or "Demo Profiles".';
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const user = await registerWithFirebase(email, password, displayName);
      
      // Sync with backend SQLite
      try {
        const syncRes = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            displayName: displayName || user.displayName,
            firebaseUid: user.uid,
          }),
        });
        const syncData = await syncRes.json();
        if (syncData.user) {
          switchUser(syncData.user.id);
        }
      } catch (syncErr) {
        console.warn('Backend register sync warning:', syncErr);
      }

      showNotification(`Firebase Auth: Account registered for ${user.email}!`);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Firebase registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (userId: string) => {
    switchUser(userId);
    const selected = availableUsers.find(u => u.id === userId);
    showNotification(`Active profile switched to ${selected?.display_name} (${selected?.email})`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="firebase-auth-title">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 my-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-kalji-50 text-kalji-700 rounded-xl border border-kalji-200">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="firebase-auth-title" className="text-xl font-extrabold text-slate-900">
                KaljiHome Authentication
              </h2>
              <p className="text-xs text-slate-500 font-medium">Google &amp; Firebase Secure Access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg focus-visible:ring-2 focus-visible:ring-kalji-600"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold" role="tablist">
          <button
            onClick={() => { setTab('signin'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-lg transition-all ${tab === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            role="tab"
            aria-selected={tab === 'signin'}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('signup'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-lg transition-all ${tab === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            role="tab"
            aria-selected={tab === 'signup'}
          >
            Create Account
          </button>
          <button
            onClick={() => { setTab('demo'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-lg transition-all ${tab === 'demo' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            role="tab"
            aria-selected={tab === 'demo'}
          >
            Demo Profiles
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google Authentication Option (Highlighted) */}
        {(tab === 'signin' || tab === 'signup') && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full min-h-[48px] px-4 py-3 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-800 font-extrabold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-3 focus-visible:ring-2 focus-visible:ring-teal-600 disabled:opacity-50"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-teal-700" />
                  <span>Connecting with Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="relative my-3 flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                or sign in with email
              </span>
            </div>
          </div>
        )}

        {/* Sign In Tab Form */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Gmail / Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-kalji-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-kalji-600 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-touch py-3 bg-kalji-700 hover:bg-kalji-800 text-white font-extrabold text-sm rounded-xl shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating with Firebase...' : 'Sign In with Email'}
            </button>
          </form>
        )}

        {/* Create Account Tab Form */}
        {tab === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sakshi Patil"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-kalji-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="patilsakshi18027@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-kalji-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Create Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-kalji-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Care Circle Role
              </label>
              <select
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold bg-white focus:ring-2 focus:ring-kalji-600 focus:outline-none"
              >
                <option value="Older Adult & Profile Owner">Older Adult (Self Care)</option>
                <option value="Family Care Manager">Family Care Manager (Daughter / Son)</option>
                <option value="Trained Caretaker">Trained Caretaker / Nurse</option>
                <option value="Family Member (Observer)">Family Member (Observer / Read-only)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-touch py-3 bg-kalji-700 hover:bg-kalji-800 text-white font-extrabold text-sm rounded-xl shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Register in Firebase'}
            </button>
          </form>
        )}

        {/* Demo Personas Tab */}
        {tab === 'demo' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-600 font-medium">
              Click any demo profile to switch the active session and test role-scoped permissions immediately:
            </p>

            <div className="space-y-2">
              {availableUsers.map((u) => {
                const isSelected = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => handleDemoSelect(u.id)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected 
                        ? 'border-kalji-600 bg-kalji-50/70 shadow-sm ring-1 ring-kalji-600' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="font-extrabold text-sm text-slate-900">{u.display_name}</p>
                      <p className="text-xs text-slate-500 font-mono">{u.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {u.role_title || 'Care Member'}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="p-1 rounded-full bg-kalji-700 text-white">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
