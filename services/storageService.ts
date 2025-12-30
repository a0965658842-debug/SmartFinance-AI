
import { db, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { User, BankAccount, Transaction, Category } from '../types';
import { DEFAULT_CATEGORIES, MOCK_ACCOUNTS, MOCK_TRANSACTIONS } from '../constants';

const DEMO_KEY = 'smart_finance_demo_db';

export class StorageService {
  private static getDemoStore(): any {
    const data = localStorage.getItem(DEMO_KEY);
    return data ? JSON.parse(data) : {
      accounts: MOCK_ACCOUNTS,
      transactions: MOCK_TRANSACTIONS,
      categories: DEFAULT_CATEGORIES
    };
  }

  private static saveDemoStore(store: any) {
    localStorage.setItem(DEMO_KEY, JSON.stringify(store));
  }

  static async login(email: string, password: string): Promise<User | null> {
    if (!auth) throw new Error("Firebase 未配置，請使用展示模式。");
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const user = credential.user;
    return {
      id: user.uid,
      email: user.email || "",
      displayName: user.displayName || email.split('@')[0],
      isDemo: false
    };
  }

  static async register(email: string, password: string, displayName: string): Promise<User> {
    if (!auth) throw new Error("Firebase 未配置，請使用展示模式。");
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const user = credential.user;
    await updateProfile(user, { displayName });
    return { id: user.uid, email: user.email || "", displayName: displayName, isDemo: false };
  }

  static async getAccounts(isDemo: boolean = false): Promise<BankAccount[]> {
    if (isDemo || !db || !auth?.currentUser) return this.getDemoStore().accounts;
    
    try {
      const q = query(collection(db, "accounts"), where("userId", "==", auth.currentUser.uid));
      const snapshot = await getDocs(q);
      const fbAccounts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as BankAccount));
      
      // 注意：不再檢查長度，空的就是空的，避免回退到模擬資料
      return fbAccounts;
    } catch (e) {
      console.error("Firestore getAccounts error:", e);
      return [];
    }
  }

  static async saveAccount(account: BankAccount, isDemo: boolean = false): Promise<BankAccount[]> {
    if (isDemo || !db || !auth?.currentUser) {
      const store = this.getDemoStore();
      const index = store.accounts.findIndex((a: any) => a.id === account.id);
      if (index >= 0) store.accounts[index] = account;
      else store.accounts.push({ ...account, id: 'acc-' + Date.now() });
      this.saveDemoStore(store);
      return store.accounts;
    }
    const userId = auth.currentUser.uid;
    const { id, ...data } = account;
    if (id && id.length > 15 && !id.startsWith('acc-')) {
      await setDoc(doc(db, "accounts", id), { ...data, userId });
    } else {
      await addDoc(collection(db, "accounts"), { ...data, userId });
    }
    return this.getAccounts(false);
  }

  static async deleteAccount(id: string, isDemo: boolean = false): Promise<BankAccount[]> {
    if (isDemo || !db || !auth?.currentUser) {
      const store = this.getDemoStore();
      store.accounts = store.accounts.filter((a: any) => a.id !== id);
      this.saveDemoStore(store);
      return store.accounts;
    }
    try {
      // 只有非模擬 ID 才去 Firestore 刪除
      if (!id.startsWith('acc-')) {
        await deleteDoc(doc(db, "accounts", id));
      } else {
        // 如果在正式模式刪除的是模擬資料，也要從本地緩存移除
        const store = this.getDemoStore();
        store.accounts = store.accounts.filter((a: any) => a.id !== id);
        this.saveDemoStore(store);
      }
    } catch (e) {
      console.warn("Delete account failed:", e);
    }
    return this.getAccounts(false);
  }

  static async getTransactions(isDemo: boolean = false): Promise<Transaction[]> {
    if (isDemo || !db || !auth?.currentUser) return this.getDemoStore().transactions;
    
    try {
      const q = query(collection(db, "transactions"), where("userId", "==", auth.currentUser.uid));
      const snapshot = await getDocs(q);
      const fbTrans = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Transaction));
      
      // 關鍵修正：如果是正式模式，直接回傳 Firestore 的結果（即使為空）
      // 不再判斷 fbTrans.length > 0，否則會導致刪除最後一筆後又跑出模擬資料
      return fbTrans;
    } catch (e) {
      console.error("Firestore getTransactions error:", e);
      return [];
    }
  }

  static async saveTransaction(transaction: Transaction, isDemo: boolean = false): Promise<Transaction[]> {
    if (isDemo || !db || !auth?.currentUser) {
      const store = this.getDemoStore();
      const index = store.transactions.findIndex((t: any) => t.id === transaction.id);
      if (index >= 0) store.transactions[index] = transaction;
      else store.transactions.push({ ...transaction, id: 't' + Date.now() });
      this.saveDemoStore(store);
      return store.transactions;
    }
    const userId = auth.currentUser.uid;
    const { id, ...data } = transaction;
    if (id && id.length > 15 && !id.startsWith('t')) {
      await setDoc(doc(db, "transactions", id), { ...data, userId });
    } else {
      await addDoc(collection(db, "transactions"), { ...data, userId });
    }
    return this.getTransactions(false);
  }

  static async deleteTransaction(id: string, isDemo: boolean = false): Promise<Transaction[]> {
    // 永遠清理本地快取中的這筆 ID (預防萬一)
    const store = this.getDemoStore();
    store.transactions = store.transactions.filter((t: any) => t.id !== id);
    this.saveDemoStore(store);

    if (isDemo || !db || !auth?.currentUser) return store.transactions;

    // 正式模式：如果是 Firebase 的真正 ID，則執行遠端刪除
    if (id && id.length > 15 && !id.startsWith('t')) {
        try {
            await deleteDoc(doc(db, "transactions", id));
        } catch (e) {
            console.error("Firestore delete transaction failed:", e);
        }
    }
    
    return this.getTransactions(false);
  }

  static async getCategories(): Promise<Category[]> {
    return DEFAULT_CATEGORIES;
  }
}
