
import { db, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
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
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { User, BankAccount, Transaction, Category } from '../types';
import { DEFAULT_CATEGORIES, MOCK_ACCOUNTS, MOCK_TRANSACTIONS } from '../constants';

const STORAGE_KEY = 'smart_finance_demo_db';

export class StorageService {
  // --- DEMO MODE (Local Storage) ---
  private static getDemoStore(): any {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {
      accounts: MOCK_ACCOUNTS,
      transactions: MOCK_TRANSACTIONS,
      categories: DEFAULT_CATEGORIES
    };
  }

  private static saveDemoStore(store: any) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  // --- AUTHENTICATION ---
  static async login(email: string, password: string): Promise<User | null> {
    if (!auth) throw new Error("Firebase Auth not initialized");
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
    if (!auth) throw new Error("Firebase Auth not initialized");
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const user = credential.user;
    await updateProfile(user, { displayName });
    return {
      id: user.uid,
      email: user.email || "",
      displayName: displayName,
      isDemo: false
    };
  }

  // --- ACCOUNTS ---
  static async getAccounts(isDemo: boolean = false): Promise<BankAccount[]> {
    if (isDemo || !db || !auth?.currentUser) return this.getDemoStore().accounts;
    
    const q = query(collection(db, "accounts"), where("userId", "==", auth.currentUser.uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as BankAccount));
  }

  static async saveAccount(account: BankAccount, isDemo: boolean = false): Promise<BankAccount[]> {
    if (isDemo || !db || !auth?.currentUser) {
      const store = this.getDemoStore();
      const index = store.accounts.findIndex((a: any) => a.id === account.id);
      if (index >= 0) store.accounts[index] = account;
      else store.accounts.push({ ...account, id: Date.now().toString() });
      this.saveDemoStore(store);
      return store.accounts;
    }

    const userId = auth.currentUser.uid;
    if (account.id && !account.id.startsWith('acc-') && isNaN(Number(account.id))) {
       await setDoc(doc(db, "accounts", account.id), { ...account, userId });
    } else {
       const { id, ...data } = account;
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
    await deleteDoc(doc(db, "accounts", id));
    return this.getAccounts(false);
  }

  // --- TRANSACTIONS ---
  static async getTransactions(isDemo: boolean = false): Promise<Transaction[]> {
    if (isDemo || !db || !auth?.currentUser) return this.getDemoStore().transactions;
    
    const q = query(collection(db, "transactions"), where("userId", "==", auth.currentUser.uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Transaction));
  }

  static async saveTransaction(transaction: Transaction, isDemo: boolean = false): Promise<Transaction[]> {
    if (isDemo || !db || !auth?.currentUser) {
      const store = this.getDemoStore();
      const index = store.transactions.findIndex((t: any) => t.id === transaction.id);
      if (index >= 0) store.transactions[index] = transaction;
      else store.transactions.push({ ...transaction, id: Date.now().toString() });
      this.saveDemoStore(store);
      return store.transactions;
    }

    const userId = auth.currentUser.uid;
    if (transaction.id && !transaction.id.startsWith('t') && isNaN(Number(transaction.id))) {
      await setDoc(doc(db, "transactions", transaction.id), { ...transaction, userId });
    } else {
      const { id, ...data } = transaction;
      await addDoc(collection(db, "transactions"), { ...data, userId });
    }
    return this.getTransactions(false);
  }

  static async deleteTransaction(id: string, isDemo: boolean = false): Promise<Transaction[]> {
    if (isDemo || !db) {
      const store = this.getDemoStore();
      store.transactions = store.transactions.filter((t: any) => t.id !== id);
      this.saveDemoStore(store);
      return store.transactions;
    }
    await deleteDoc(doc(db, "transactions", id));
    return this.getTransactions(false);
  }

  static async getCategories(): Promise<Category[]> {
    return DEFAULT_CATEGORIES;
  }
}
