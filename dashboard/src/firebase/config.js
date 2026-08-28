/**
 * Guardian Bot Dashboard - Firebase Firestore & Backend Connector
 */

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

// Read from environment variables if configured
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment12345",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "guardian-bot.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "guardian-bot-senior-safety",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "guardian-bot.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

let db = null;
let isFirebaseConfigured = false;

try {
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
    isFirebaseConfigured = true;
    console.log("🔥 [Dashboard Firebase] Initialized live Firestore client.");
  } else {
    console.log("⚡ [Dashboard] Operating in Direct WebSocket & Backend REST mode.");
  }
} catch (error) {
  console.warn("⚠️ [Dashboard Firebase] Initialization skipped:", error.message);
}

export { db, isFirebaseConfigured };
