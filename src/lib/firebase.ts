// Firebase Initialization for KaljiHome
// Complies with client analytics & web app configuration

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAFsNaoQouwWXxt_2kn6mVWZBiM6_XzhDE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "kaljihome.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "kaljihome",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "kaljihome.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "579630814455",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:579630814455:web:9163181455968633ed6ff2",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-H679PS2MDP"
};

// Safe initialization for both server-side and client-side Next.js environments
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let analyticsInstance: Analytics | null = null;

export const initFirebaseAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window !== "undefined") {
    const supported = await isSupported().catch(() => false);
    if (supported && !analyticsInstance) {
      analyticsInstance = getAnalytics(firebaseApp);
    }
    return analyticsInstance;
  }
  return null;
};
