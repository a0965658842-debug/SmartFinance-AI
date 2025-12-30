
import React, { useState } from 'react';
import { Transaction, BankAccount, Category } from '../types';

interface TransactionsProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  categories: Category[];
  onAdd: (t: Transaction) => void;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

const Transactions: React.FC<TransactionsProps> = ({ transactions, accounts, categories, onAdd, onEdit, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: 'EXPENSE',
    amount: 0,
    accountId: accounts[0]?.id || '',
    categoryId: categories[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
        ...formData,
        id: editingTransaction?.id || Date.now().toString(),
    } as Transaction;
    
    if (editingTransaction) {
      onEdit(payload);
    } else {
      onAdd(payload);
    }
    setIsModalOpen(false);
  };

  const openModal = (t?: Transaction) => {
    if (t) {
      setEditingTransaction(t);
      setFormData(t);
    } else {
      setEditingTransaction(null);
      setFormData({
        type: 'EXPENSE',
        amount: 0,
        accountId: accounts[0]?.id || '',
        categoryId: categories[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        note: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('確定要刪除這筆紀錄嗎？這將會自動調整關聯帳戶的餘額。')) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">財務紀錄</h2>
          <p className="text-slate-500">追蹤每一筆收入與支出的細節</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl font-semibold shadow-md shadow-blue-100 transition-all flex items-center gap-2"
        >
          <span>➕</span> 記錄一筆交易
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">日期</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">分類 / 備註</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">帳戶</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">金額</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((t) => {
                const cat = categories.find(c => c.id === t.categoryId);
                const acc = accounts.find(a => a.id === t.accountId);
                return (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                      {t.date}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-xl ${cat?.color || 'bg-slate-100'} bg-opacity-15 w-10 h-10 rounded-xl flex items-center justify-center`}>
                          {cat?.icon || '📦'}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-800">{cat?.name || '未知'}</p>
                          <p className="text-xs text-blue-500/70 italic">{t.note || '無備註'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {acc?.name || '未知'}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-lg font-bold ${t.type === 'INCOME' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <button onClick={() => openModal(t)} className="text-blue-500 hover:text-blue-700 font-medium text-sm">編輯</button>
                        <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-600 font-medium text-sm">刪除</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className="text-center py-20 bg-white">
                <p className="text-slate-400">目前沒有交易紀錄，快來新增一筆吧！</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-scaleIn">
            <h3 className="text-xl font-bold mb-6">{editingTransaction ? '編輯紀錄' : '新增紀錄'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${formData.type === 'EXPENSE' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-500'}`}
                  >支出</button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'INCOME' })}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${formData.type === 'INCOME' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500'}`}
                  >收入</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">日期</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-blue-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">金額</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className={`w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold ${formData.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">支付/收款帳戶</label>
                <select
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                >
                  {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance.toLocaleString()})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">分類</label>
                <div className="grid grid-cols-4 gap-2 h-32 overflow-y-auto p-2 border border-slate-100 rounded-xl">
                  {categories.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, categoryId: cat.id })}
                        className={`flex flex-col items-center p-2 rounded-lg transition-all ${formData.categoryId === cat.id ? `${cat.color} bg-opacity-20 border-2 border-current` : 'hover:bg-slate-50 border-2 border-transparent'}`}
                      >
                          <span className="text-xl">{cat.icon}</span>
                          <span className="text-[10px] text-slate-600 truncate w-full text-center">{cat.name}</span>
                      </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">備註</label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="輸入一些細節..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-blue-800 placeholder:text-slate-300"
                />
              </div>
              <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  >取消</button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-100"
                  >確定儲存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
