
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Accounts from './components/Accounts';
import Transactions from './components/Transactions';
import FinancialAdvisor from './components/FinancialAdvisor';
import FortuneSlip from './components/FortuneSlip';
import FinanceGame from './components/FinanceGame';
import { StorageService } from './services/storageService';
import { User, BankAccount, Transaction, Category, AppMode } from './types';
import { auth } from './firebase';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // 監聽 Firebase 登入狀態
    const unsubscribe = auth?.onAuthStateChanged(async (fbUser) => {
      const stored = localStorage.getItem('smart_finance_user');
      const cached = stored ? JSON.parse(stored) : null;

      if (fbUser) {
        const u = { id: fbUser.uid, email: fbUser.email || "", displayName: fbUser.displayName || "", isDemo: false };
        setUser(u);
        await loadData(false);
      } else if (cached?.isDemo) {
        setUser(cached);
        await loadData(true);
      } else {
        setUser(null);
      }
      
      const catData = await StorageService.getCategories();
      setCategories(catData);
      setIsInitializing(false);
    });

    return () => unsubscribe?.();
  }, []);

  const loadData = async (isDemo: boolean) => {
    const [accs, trans] = await Promise.all([
      StorageService.getAccounts(isDemo),
      StorageService.getTransactions(isDemo),
    ]);
    setAccounts(accs);
    setTransactions(trans);
  };

  const handleAuthSuccess = async (userData: User, mode: AppMode) => {
    setUser(userData);
    localStorage.setItem('smart_finance_user', JSON.stringify(userData));
    await loadData(mode === 'DEMO');
  };

  const handleLogout = async () => {
    if (auth) await auth.signOut();
    setUser(null);
    localStorage.removeItem('smart_finance_user');
  };

  const isDemo = user?.isDemo || false;

  const onAddAcc = async (a: BankAccount) => {
    const updated = await StorageService.saveAccount(a, isDemo);
    setAccounts(updated);
  };
  const onEditAcc = async (a: BankAccount) => {
    const updated = await StorageService.saveAccount(a, isDemo);
    setAccounts(updated);
  };
  const onDelAcc = async (id: string) => {
    const updated = await StorageService.deleteAccount(id, isDemo);
    setAccounts(updated);
  };

  const onAddTrans = async (t: Transaction) => {
    const updated = await StorageService.saveTransaction(t, isDemo);
    setTransactions(updated);
    // 自動更新餘額
    const acc = accounts.find(a => a.id === t.accountId);
    if (acc) {
      const newBal = t.type === 'INCOME' ? acc.balance + t.amount : acc.balance - t.amount;
      await onEditAcc({ ...acc, balance: newBal });
    }
  };

  if (isInitializing) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return <Auth onAuthSuccess={handleAuthSuccess} />;

  return (
    <Layout user={user} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <Dashboard accounts={accounts} transactions={transactions} categories={categories} />}
      {activeTab === 'accounts' && <Accounts accounts={accounts} onAdd={onAddAcc} onEdit={onEditAcc} onDelete={onDelAcc} />}
      {activeTab === 'transactions' && <Transactions transactions={transactions} accounts={accounts} categories={categories} onAdd={onAddTrans} onEdit={()=>{}} onDelete={()=>{}} />}
      {activeTab === 'advisor' && <FinancialAdvisor transactions={transactions} accounts={accounts} categories={categories} />}
      {activeTab === 'fortune' && <FortuneSlip />}
      {activeTab === 'game' && <FinanceGame />}
    </Layout>
  );
};

export default App;
