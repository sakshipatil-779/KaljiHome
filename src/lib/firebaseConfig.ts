// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
