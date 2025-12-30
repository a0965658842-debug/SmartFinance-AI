
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Accounts from './components/Accounts';
import Transactions from './components/Transactions';
import FinancialReports from './components/FinancialReports';
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
    try {
      const [accs, trans] = await Promise.all([
        StorageService.getAccounts(isDemo),
        StorageService.getTransactions(isDemo),
      ]);
      setAccounts([...accs]);
      setTransactions([...trans]);
    } catch (e) {
      console.error("Load Data Error:", e);
    }
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
    await StorageService.saveAccount(a, isDemo);
    await loadData(isDemo);
  };

  const onEditAcc = async (a: BankAccount) => {
    await StorageService.saveAccount(a, isDemo);
    await loadData(isDemo);
  };

  const onDelAcc = async (id: string) => {
    if (!window.confirm('確定要刪除此帳戶嗎？')) return;
    await StorageService.deleteAccount(id, isDemo);
    await loadData(isDemo);
  };

  const onAddTrans = async (t: Transaction) => {
    const acc = accounts.find(a => a.id === t.accountId);
    if (acc) {
      const newBal = t.type === 'INCOME' ? acc.balance + t.amount : acc.balance - t.amount;
      await StorageService.saveAccount({ ...acc, balance: newBal }, isDemo);
    }
    await StorageService.saveTransaction(t, isDemo);
    await loadData(isDemo);
  };

  const onEditTrans = async (updatedTrans: Transaction) => {
    try {
      const oldTrans = transactions.find(t => t.id === updatedTrans.id);
      if (!oldTrans) return;

      const oldAcc = accounts.find(a => a.id === oldTrans.accountId);
      if (oldAcc) {
        const revertedBal = oldTrans.type === 'INCOME' ? oldAcc.balance - oldTrans.amount : oldAcc.balance + oldTrans.amount;
        await StorageService.saveAccount({ ...oldAcc, balance: revertedBal }, isDemo);
      }

      const latestAccs = await StorageService.getAccounts(isDemo);
      const newAcc = latestAccs.find(a => a.id === updatedTrans.accountId);
      if (newAcc) {
        const finalBal = updatedTrans.type === 'INCOME' ? newAcc.balance + updatedTrans.amount : newAcc.balance - updatedTrans.amount;
        await StorageService.saveAccount({ ...newAcc, balance: finalBal }, isDemo);
      }

      await StorageService.saveTransaction(updatedTrans, isDemo);
      await loadData(isDemo);
    } catch (e) {
      console.error("Edit error:", e);
      alert("編輯紀錄時發生錯誤。");
    }
  };

  const onDelTrans = async (id: string) => {
    try {
      const target = transactions.find(t => t.id === id);
      if (!target) return;

      setTransactions(prev => prev.filter(t => t.id !== id));

      const acc = accounts.find(a => a.id === target.accountId);
      if (acc) {
        const newBal = target.type === 'INCOME' ? acc.balance - target.amount : acc.balance + target.amount;
        await StorageService.saveAccount({ ...acc, balance: newBal }, isDemo);
      }

      await StorageService.deleteTransaction(id, isDemo);
      await loadData(isDemo);
    } catch (e) {
      console.error("Delete error:", e);
      alert("刪除失敗，請重新整理頁面。");
      await loadData(isDemo);
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
      {activeTab === 'transactions' && (
        <Transactions 
          transactions={transactions} 
          accounts={accounts} 
          categories={categories} 
          onAdd={onAddTrans} 
          onEdit={onEditTrans} 
          onDelete={onDelTrans} 
        />
      )}
      {activeTab === 'reports' && <FinancialReports transactions={transactions} accounts={accounts} categories={categories} />}
      {activeTab === 'advisor' && <FinancialAdvisor transactions={transactions} accounts={accounts} categories={categories} />}
      {activeTab === 'fortune' && <FortuneSlip />}
      {activeTab === 'game' && <FinanceGame />}
    </Layout>
  );
};

export default App;
