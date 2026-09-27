import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, onValue, runTransaction, get, set } from "firebase/database";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyDnM0oaLCnTsy69idzQaF0ZfcYcEMvRr-k",
  authDomain: "busvision-ai.firebaseapp.com",
  databaseURL: "https://busvision-ai-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "busvision-ai",
  storageBucket: "busvision-ai.firebasestorage.app",
  messagingSenderId: "472036250826",
  appId: "1:472036250826:web:f917b9a576fe1a74b9d033",
  measurementId: "G-DF32WV8773"
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getDatabase(app);
export const rtdb = db;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { 
  ref, 
  onValue, 
  runTransaction, 
  get, 
  set,
  signInWithPopup,
  signOut,
  onAuthStateChanged
};
export type { FirebaseUser };

