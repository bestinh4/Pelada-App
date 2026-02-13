
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, query, orderBy, updateDoc, addDoc, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configuração fornecida pelo usuário para o projeto 'ousadia-5b1d8'
const firebaseConfig = {
  apiKey: "AIzaSyBa8kF4pSrx_-GuHVT_hGMgh_UmRc0NBx0",
  authDomain: "ousadia-5b1d8.firebaseapp.com",
  projectId: "ousadia-5b1d8",
  storageBucket: "ousadia-5b1d8.firebasestorage.app",
  messagingSenderId: "812821310641",
  appId: "1:812821310641:web:d5256ab8fea0ad1323c690"
};

// Inicialização segura
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configurações para garantir o redirecionamento correto em ambientes de preview
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const loginWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

export const logout = () => signOut(auth);

export { 
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
  where 
};
