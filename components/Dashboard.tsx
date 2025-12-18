
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Transaction, BankAccount, Category } from '../types';

interface DashboardProps {
  accounts: BankAccount[];
  transactions: Transaction[];
  categories: Category[];
}

const Dashboard: React.FC<DashboardProps> = ({ accounts, transactions, categories }) => {
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  
  const incomeThisMonth = transactions
    .filter(t => t.type === 'INCOME' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseThisMonth = transactions
    .filter(t => t.type === 'EXPENSE' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.amount, 0);

  // Group by category for pie chart
  const expenseByCategory = categories.map(cat => {
    const amount = transactions
      .filter(t => t.type === 'EXPENSE' && t.categoryId === cat.id)
      .reduce((sum, t) => sum + t.amount, 0);
    return { name: cat.name, value: amount, color: cat.color };
  }).filter(c => c.value > 0);

  // Recent activity
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-lg shadow-blue-200">
          <p className="text-blue-100 text-sm font-medium mb-1 uppercase tracking-wider">總資產淨值</p>
          <h2 className="text-3xl font-bold">${totalBalance.toLocaleString()}</h2>
          <p className="text-xs text-blue-200 mt-4 font-light italic">跨帳戶彙總數據</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm border-l-4 border-l-green-500">
          <p className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wider">本月總收入</p>
          <h2 className="text-3xl font-bold text-green-600">+${incomeThisMonth.toLocaleString()}</h2>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
             <div className="bg-green-500 h-full w-[70%]"></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm border-l-4 border-l-red-500">
          <p className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wider">本月總支出</p>
          <h2 className="text-3xl font-bold text-red-500">-${expenseThisMonth.toLocaleString()}</h2>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
             <div className="bg-red-500 h-full w-[45%]"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Charts Section */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">支出分佈比例</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">最近五筆交易</h3>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? recentTransactions.map(t => {
                const cat = categories.find(c => c.id === t.categoryId);
                return (
                    <div key={t.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-50 last:border-0">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${cat?.color || 'bg-slate-100'} bg-opacity-20`}>
                                {cat?.icon || '❓'}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800">{t.note || cat?.name}</p>
                                <p className="text-[10px] text-blue-400 font-medium uppercase">{cat?.name}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                                {t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-slate-400">{t.date}</p>
                        </div>
                    </div>
                );
            }) : (
                <p className="text-center text-slate-400 py-12">尚無交易紀錄</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
