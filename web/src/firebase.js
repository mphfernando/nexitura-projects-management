import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyAudQTibH_ufCh-Im-hIhsiLlEY-ooGl_8",
  authDomain:        "aleken-hub.firebaseapp.com",
  projectId:         "aleken-hub",
  storageBucket:     "aleken-hub.firebasestorage.app",
  messagingSenderId: "497670944179",
  appId:             "1:497670944179:web:3f5dac3a537d8358be07c6"
};

export const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Secondary app instance: used only to create new user accounts without
// signing the acting admin out of their own session.
export function getSecondaryAuth(){
  const existing = getApps().find(a => a.name === "secondary");
  const secondaryApp = existing || initializeApp(FIREBASE_CONFIG, "secondary");
  return getAuth(secondaryApp);
}

export { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword };
export const LEGACY_DOC_PATH = ["aleken-hub", "v3"];
