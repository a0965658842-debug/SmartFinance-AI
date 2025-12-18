
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

const firebaseConfigStr = process.env.FIREBASE_CONFIG;

if (firebaseConfigStr) {
  try {
    const config = JSON.parse(firebaseConfigStr);
    if (getApps().length === 0) {
      app = initializeApp(config);
      auth = getAuth(app);
      db = getFirestore(app);
      console.log("Firebase initialized successfully in PRO mode.");
    }
  } catch (e) {
    console.warn("Invalid FIREBASE_CONFIG. Falling back to DEMO mode.", e);
  }
} else {
  console.log("No FIREBASE_CONFIG found. Operating in DEMO mode only.");
}

export { auth, db };
