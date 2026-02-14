/**
 * ⚠️ ARQUIVO CRÍTICO: Inicialização do Firebase SDK v10.
 * Centraliza a configuração e garante que os serviços sejam registrados corretamente.
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  updateDoc, 
  setDoc, 
  addDoc, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  getDoc, 
  where 
} from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

// 🔐 CONFIGURAÇÃO DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBa8kF4pSrx_-GuHVT_hGMgh_UmRc0NBx0",
  authDomain: "ousadia-5b1d8.firebaseapp.com",
  projectId: "ousadia-5b1d8",
  storageBucket: "ousadia-5b1d8.firebasestorage.app",
  messagingSenderId: "812821310641",
  appId: "1:812821310641:web:d5256ab8fea0ad1323c690"
};

// 1. Inicializar o Firebase App antes de qualquer outro serviço (Singleton)
// A ordem de execução aqui é vital para o registro de componentes no registry interno.
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Inicializar e exportar as instâncias dos serviços vinculadas ao 'app'
// Passar o 'app' explicitamente resolve o erro "Component not registered".
export const auth = getAuth(app);
export const db = getFirestore(app);

// 3. Inicializar Messaging com tratamento de erro
let messagingInstance = null;
try {
  messagingInstance = getMessaging(app);
} catch (e) {
  // Falha silenciosa se o ambiente não suportar (ex: SSR, InPrivate)
}
export const messaging = messagingInstance;

// 4. Configuração de Providers e Helpers
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Realiza o login via popup do Google
 */
export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

/**
 * Realiza o logout da aplicação
 */
export const logout = async () => {
  await signOut(auth);
};

// 5. Exportações Modulares para uso em todo o App
export { 
  onAuthStateChanged,
  GoogleAuthProvider,
  doc, 
  updateDoc, 
  setDoc, 
  addDoc, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  getDoc,
  where
};

export default app;
