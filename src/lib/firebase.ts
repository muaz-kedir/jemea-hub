import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDJD-k8qakS0a8iGjBG71dQMBpoA3XjJNA",
  authDomain: "humsj-academic-sector.firebaseapp.com",
  projectId: "humsj-academic-sector",
  storageBucket: "humsj-academic-sector.firebasestorage.app",
  messagingSenderId: "103611783382",
  appId: "1:103611783382:web:c0698dd7f51ddf25125177",
  measurementId: "G-967YB88HBF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
