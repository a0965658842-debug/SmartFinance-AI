
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
    const q = query(collection(db, "accounts"), where("userId", "==", auth.currentUser.uid));
    const snapshot = await getDocs(q);
    const fbAccounts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as BankAccount));
    // 如果 FB 是空的且剛註冊，回傳模擬資料
    return fbAccounts.length > 0 ? fbAccounts : this.getDemoStore().accounts;
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
    // 判斷是否為 Firebase 文件 (通常由亂序字母數字組成)
    if (id && id.length > 10 && !id.startsWith('acc-')) {
      await setDoc(doc(db, "accounts", id), { ...data, userId });
    } else {
      await addDoc(collection(db, "accounts"), { ...data, userId });
    }
    return this.getAccounts(false);
  }

  static async deleteAccount(id: string, isDemo: boolean = false): Promise<BankAccount[]> {
    if (isDemo || !db) {
      const store = this.getDemoStore();
      store.accounts = store.accounts.filter((a: any) => a.id !== id);
      this.saveDemoStore(store);
      return store.accounts;
    }
    try {
      if (!id.startsWith('acc-')) {
        await deleteDoc(doc(db, "accounts", id));
      }
    } catch (e) {
      console.warn("Delete account failed:", e);
    }
    return this.getAccounts(false);
  }

  static async getTransactions(isDemo: boolean = false): Promise<Transaction[]> {
    if (isDemo || !db || !auth?.currentUser) return this.getDemoStore().transactions;
    const q = query(collection(db, "transactions"), where("userId", "==", auth.currentUser.uid));
    const snapshot = await getDocs(q);
    const fbTrans = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Transaction));
    return fbTrans.length > 0 ? fbTrans : this.getDemoStore().transactions;
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
    if (id && id.length > 10 && !id.startsWith('t')) {
      await setDoc(doc(db, "transactions", id), { ...data, userId });
    } else {
      await addDoc(collection(db, "transactions"), { ...data, userId });
    }
    return this.getTransactions(false);
  }

  static async deleteTransaction(id: string, isDemo: boolean = false): Promise<Transaction[]> {
    // 無論如何都先嘗試清理本地展示緩存
    const store = this.getDemoStore();
    const originalCount = store.transactions.length;
    store.transactions = store.transactions.filter((t: any) => t.id !== id);
    if (store.transactions.length !== originalCount) {
        this.saveDemoStore(store);
    }

    if (isDemo || !db) return store.transactions;

    // 正式模式：如果是真正的 Firebase ID 則從雲端刪除
    if (id && id.length > 10 && !id.startsWith('t')) {
        try {
            await deleteDoc(doc(db, "transactions", id));
        } catch (e) {
            console.warn("Firestore delete transaction error:", e);
        }
    }
    return this.getTransactions(false);
  }

  static async getCategories(): Promise<Category[]> {
    return DEFAULT_CATEGORIES;
  }
}
