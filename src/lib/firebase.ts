import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDJD-k8qakS0a8iGjBG71dQMBpoA3XjJNA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "humsj-academic-sector.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "humsj-academic-sector",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "humsj-academic-sector.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "103611783382",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:103611783382:web:c0698dd7f51ddf25125177",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-967YB88HBF"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
