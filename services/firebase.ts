
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut 
} from "firebase/auth";

import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc, 
  addDoc, 
  where 
} from "firebase/firestore";

// Import dinâmico para evitar quebra em ambientes sem service worker
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBa8kF4pSrx_-GuHVT_hGMgh_UmRc0NBx0",
  authDomain: "ousadia-5b1d8.firebaseapp.com",
  projectId: "ousadia-5b1d8",
  storageBucket: "ousadia-5b1d8.firebasestorage.app",
  messagingSenderId: "812821310641",
  appId: "1:812821310641:web:d5256ab8fea0ad1323c690"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Messaging só é inicializado se suportado pelo navegador
let messaging = null;
try {
  messaging = getMessaging(app);
} catch (e) {
  console.warn("FCM não suportado neste navegador.");
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export const loginWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};

export const logout = () => signOut(auth);

export {
  auth,
  db,
  messaging,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  addDoc,
  where,
};
