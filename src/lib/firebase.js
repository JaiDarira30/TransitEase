import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB0fZU6xuW1eAiw73uY4HuZ3xdpISM46TU",
  authDomain: "transitease-f268b.firebaseapp.com",
  projectId: "transitease-f268b",
  storageBucket: "transitease-f268b.firebasestorage.app",
  messagingSenderId: "574323251225",
  appId: "1:574323251225:web:77ff5d8be6e0825617f288",
  measurementId: "G-EH3WNTHMCV",
};

/* ✅ Prevent duplicate app error */
const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

/* ✅ Exports */
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
