import { initializeApp, getApps } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

/**
 * Firebase 配置已直接寫入程式碼，方便開發與佈署。
 */
const firebaseConfig = {
  apiKey: "AIzaSyAlYj_KfR7dLxWc-b1ISNe26vA5NDnToos",
  authDomain: "smartfinance-ai-37655.firebaseapp.com",
  projectId: "smartfinance-ai-37655",
  storageBucket: "smartfinance-ai-37655.firebasestorage.app",
  messagingSenderId: "253999358636",
  appId: "1:253999358636:web:68e19caa081c71e8b0b509"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// 檢查配置是否有效
const isValidConfig = firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("YOUR_");

if (isValidConfig) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    if (app) {
      auth = getAuth(app);
      db = getFirestore(app);
    }
  } catch (e) {
    console.warn("Firebase 初始化失敗，系統切換至展示模式。", e);
  }
} else {
  console.info("Firebase 未配置，系統運作於展示模式（僅使用 LocalStorage）。");
}

export { auth, db };