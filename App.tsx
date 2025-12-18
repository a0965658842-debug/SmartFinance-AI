
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
    const unsubscribe = auth?.onAuthStateChanged(async (firebaseUser) => {
      const storedUser = localStorage.getItem('smart_finance_user');
      const cachedUser = storedUser ? JSON.parse(storedUser) : null;

      if (firebaseUser) {
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName || "",
          isDemo: false
        };
        setUser(userData);
        loadData(false);
      } else if (cachedUser?.isDemo) {
        setUser(cachedUser);
        loadData(true);
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
    const [accData, transData] = await Promise.all([
      StorageService.getAccounts(isDemo),
      StorageService.getTransactions(isDemo),
    ]);
    setAccounts(accData);
    setTransactions(transData);
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

  // Handlers with isDemo flag
  const isDemo = user?.isDemo || false;

  const addAccount = async (acc: BankAccount) => {
    const updated = await StorageService.saveAccount(acc, isDemo);
    setAccounts(updated);
  };
  const editAccount = async (acc: BankAccount) => {
    const updated = await StorageService.saveAccount(acc, isDemo);
    setAccounts(updated);
  };
  const deleteAccount = async (id: string) => {
    if (confirm('確定要刪除此帳戶嗎？')) {
      const updated = await StorageService.deleteAccount(id, isDemo);
      setAccounts(updated);
    }
  };

  const addTransaction = async (t: Transaction) => {
    const updated = await StorageService.saveTransaction(t, isDemo);
    setTransactions(updated);
    // 更新餘額
    const acc = accounts.find(a => a.id === t.accountId);
    if (acc) {
      const newBalance = t.type === 'INCOME' ? acc.balance + t.amount : acc.balance - t.amount;
      await editAccount({ ...acc, balance: newBalance });
    }
  };

  const editTransaction = async (t: Transaction) => {
    const updated = await StorageService.saveTransaction(t, isDemo);
    setTransactions(updated);
  };

  const deleteTransaction = async (id: string) => {
    const updated = await StorageService.deleteTransaction(id, isDemo);
    setTransactions(updated);
  };

  if (isInitializing) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard accounts={accounts} transactions={transactions} categories={categories} />;
      case 'accounts': return <Accounts accounts={accounts} onAdd={addAccount} onEdit={editAccount} onDelete={deleteAccount} />;
      case 'transactions': return <Transactions transactions={transactions} accounts={accounts} categories={categories} onAdd={addTransaction} onEdit={editTransaction} onDelete={deleteTransaction} />;
      case 'advisor': return <FinancialAdvisor transactions={transactions} accounts={accounts} categories={categories} />;
      case 'fortune': return <FortuneSlip />;
      case 'game': return <FinanceGame />;
      default: return <Dashboard accounts={accounts} transactions={transactions} categories={categories} />;
    }
  };

  return (
    <Layout user={user} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
