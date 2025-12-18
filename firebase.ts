
import { initializeApp, getApps } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
// Fix: Consolidate getAuth and the Auth type into a single import block to ensure type visibility
import { getAuth, Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

/**
 * 請在此處填入您的 Firebase 配置。
 * 這是在 Firebase Console 的「專案設定」中可以找到的 Web App 配置物件。
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

// 檢查是否已填入有效配置（非預設字串）
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
    console.warn("Firebase 初始化失敗，將進入展示模式。", e);
  }
} else {
  console.info("Firebase 未配置或使用預設值，系統將運作於展示模式。");
}

export { auth, db };
