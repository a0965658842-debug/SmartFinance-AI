
import React, { useState } from 'react';
import { BankAccount } from '../types';

interface AccountsProps {
  accounts: BankAccount[];
  onAdd: (acc: BankAccount) => void;
  onEdit: (acc: BankAccount) => void;
  onDelete: (id: string) => void;
}

const Accounts: React.FC<AccountsProps> = ({ accounts, onAdd, onEdit, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [formData, setFormData] = useState<Partial<BankAccount>>({
    name: '',
    bankName: '',
    balance: 0,
    accountType: '儲蓄',
    color: '#3b82f6'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
        ...formData,
        id: editingAccount?.id || Date.now().toString(),
    } as BankAccount;
    
    if (editingAccount) {
      onEdit(payload);
    } else {
      onAdd(payload);
    }
    closeModal();
  };

  const openModal = (acc?: BankAccount) => {
    if (acc) {
      setEditingAccount(acc);
      setFormData(acc);
    } else {
      setEditingAccount(null);
      setFormData({ name: '', bankName: '', balance: 0, accountType: '儲蓄', color: '#3b82f6' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">我的帳戶</h2>
          <p className="text-slate-500">管理您的銀行帳號與資產分佈</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl font-semibold shadow-md shadow-blue-100 transition-all flex items-center gap-2"
        >
          <span>➕</span> 新增帳戶
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <div key={acc.id} className="group bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openModal(acc)} className="p-2 bg-slate-50 text-blue-600 rounded-lg hover:bg-blue-50">✏️</button>
                <button onClick={() => onDelete(acc.id)} className="p-2 bg-slate-50 text-red-500 rounded-lg hover:bg-red-50">🗑️</button>
            </div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl" style={{ backgroundColor: acc.color }}>
                🏦
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-full">{acc.accountType}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800">{acc.name}</h3>
            <p className="text-slate-400 text-sm mb-4">{acc.bankName}</p>
            <div className="mt-6">
              <p className="text-slate-400 text-xs mb-1 uppercase">帳戶餘額</p>
              <p className="text-2xl font-bold text-slate-900">${acc.balance.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingAccount ? '編輯帳戶' : '新增帳戶'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">帳戶名稱</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 font-medium"
                  placeholder="例如：生活費專戶"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">銀行名稱</label>
                <input
                  type="text"
                  required
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 font-medium"
                  placeholder="例如：中國信託"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">當前餘額</label>
                  <input
                    type="number"
                    required
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">帳戶類別</label>
                  <select
                    value={formData.accountType}
                    onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 font-medium bg-white"
                  >
                    <option>儲蓄</option>
                    <option>支票</option>
                    <option>投資</option>
                    <option>數位帳戶</option>
                    <option>其它</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">代表顏色</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-12 p-1 bg-white border border-slate-200 rounded-xl cursor-pointer"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-blue-100 transition-all"
              >
                儲存帳戶資訊
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
