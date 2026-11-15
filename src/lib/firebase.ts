// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  updateProfile,
  User as FirebaseUser,
  Auth
} from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyAFsNaoQouwWXxt_2kn6mVWZBiM6_XzhDE",
  authDomain: "kaljihome.firebaseapp.com",
  projectId: "kaljihome",
  storageBucket: "kaljihome.firebasestorage.app",
  messagingSenderId: "579630814455",
  appId: "1:579630814455:web:9163181455968633ed6ff2",
  measurementId: "G-H679PS2MDP"
};

// Initialize Firebase
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const firebaseApp = app;
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

// Firebase Authentication instance
export const firebaseAuth: Auth = getAuth(app);

let analyticsInstance: Analytics | null = analytics;

export const initFirebaseAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window !== "undefined") {
    const supported = await isSupported().catch(() => false);
    if (supported && !analyticsInstance) {
      analyticsInstance = getAnalytics(app);
    }
    return analyticsInstance;
  }
  return null;
};

/**
 * Sign in using Firebase Email & Password
 */
export async function signInWithFirebase(email: string, pass: string): Promise<FirebaseUser> {
  const userCredential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), pass);
  return userCredential.user;
}

/**
 * Register a new user using Firebase Email & Password
 */
export async function registerWithFirebase(email: string, pass: string, displayName: string): Promise<FirebaseUser> {
  const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), pass);
  if (displayName) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential.user;
}

/**
 * Sign out of Firebase session
 */
export async function signOutFirebase(): Promise<void> {
  await firebaseSignOut(firebaseAuth);
}

/**
 * Listen for active user auth state changes
 */
export function onAuthStateChangedListener(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(firebaseAuth, callback);
}
