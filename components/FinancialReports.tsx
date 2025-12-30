
import React, { useMemo, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, Legend, PieChart, Pie 
} from 'recharts';
import { Transaction, BankAccount, Category } from '../types';

interface FinancialReportsProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  categories: Category[];
}

const FinancialReports: React.FC<FinancialReportsProps> = ({ transactions, accounts, categories }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // 過濾當月交易
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  // 當月每日收支數據
  const dailyData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const data = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${i}日`;
      const income = currentMonthTransactions
        .filter(t => t.type === 'INCOME' && new Date(t.date).getDate() === i)
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = currentMonthTransactions
        .filter(t => t.type === 'EXPENSE' && new Date(t.date).getDate() === i)
        .reduce((sum, t) => sum + t.amount, 0);
      data.push({ name: dateStr, income, expense });
    }
    return data;
  }, [currentMonthTransactions, selectedMonth, selectedYear]);

  // 當月分類支出佔比
  const monthlyCategoryData = useMemo(() => {
    return categories.map(cat => {
      const amount = currentMonthTransactions
        .filter(t => t.type === 'EXPENSE' && t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: cat.name, value: amount, color: cat.color };
    }).filter(c => c.value > 0).sort((a, b) => b.value - a.value);
  }, [currentMonthTransactions, categories]);

  const monthIncome = currentMonthTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const monthExpense = currentMonthTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  const monthBalance = monthIncome - monthExpense;
  const savingsRate = monthIncome > 0 ? ((monthBalance / monthIncome) * 100).toFixed(1) : "0";

  // 模擬預算 (假設每月預算為 30000)
  const budget = 30000;
  const budgetUsage = Math.min((monthExpense / budget) * 100, 100);

  const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800">
            {selectedYear}年 {monthNames[selectedMonth]} 財務月報
          </h2>
          <p className="text-slate-500 font-medium">深入分析您本月的消費習慣與資產變動</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          {[-1, 0].map(offset => {
            const d = new Date();
            d.setMonth(d.getMonth() + offset);
            const m = d.getMonth();
            const y = d.getFullYear();
            return (
              <button
                key={m}
                onClick={() => { setSelectedMonth(m); setSelectedYear(y); }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedMonth === m ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                {m === new Date().getMonth() ? '本月' : '上個月'}
              </button>
            )
          })}
        </div>
      </div>

      {/* 核心摘要卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">本月收入</p>
          <p className="text-2xl font-black text-green-600">${monthIncome.toLocaleString()}</p>
          <div className="mt-2 text-[10px] text-green-500 font-bold bg-green-50 w-fit px-2 py-0.5 rounded-full">
            Cash Inflow
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">本月支出</p>
          <p className="text-2xl font-black text-rose-500">${monthExpense.toLocaleString()}</p>
          <div className="mt-2 text-[10px] text-rose-500 font-bold bg-rose-50 w-fit px-2 py-0.5 rounded-full">
            Cash Outflow
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">本月結餘</p>
          <p className={`text-2xl font-black ${monthBalance >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
            ${monthBalance.toLocaleString()}
          </p>
          <div className="mt-2 text-[10px] text-blue-500 font-bold bg-blue-50 w-fit px-2 py-0.5 rounded-full">
            Net Cash Flow
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">儲蓄率</p>
          <p className="text-2xl font-black text-indigo-600">{savingsRate}%</p>
          <div className="mt-2 text-[10px] text-indigo-500 font-bold bg-indigo-50 w-fit px-2 py-0.5 rounded-full">
            Savings Index
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 每日收支明細圖 */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800">每日收支趨勢</h3>
            <div className="flex gap-4 text-xs font-bold">
               <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-500 rounded-full"></span> 收入</div>
               <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-rose-500 rounded-full"></span> 支出</div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="income" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={8} />
                <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 預算進度與分類佔比 */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">預算執行進度</h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    {budgetUsage.toFixed(0)}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    ${monthExpense.toLocaleString()} / ${budget.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-blue-100">
                <div style={{ width: `${budgetUsage}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${budgetUsage > 90 ? 'bg-rose-500' : 'bg-blue-600'}`}></div>
              </div>
              <p className="text-[10px] text-slate-400">
                {budgetUsage > 100 ? '⚠️ 已超出預算' : budgetUsage > 80 ? '🚩 接近預算上限' : '✅ 預算控制良好'}
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">當月支出分類</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={monthlyCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {monthlyCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color.replace('bg-', '#').replace('-500', '')} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {monthlyCategoryData.slice(0, 3).map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <div className={`w-2 h-2 rounded-full ${cat.color}`}></div>
                    {cat.name}
                  </div>
                  <span className="font-bold text-slate-800">${cat.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 最大筆支出排行 */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-6">本月大額支出排行</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentMonthTransactions
            .filter(t => t.type === 'EXPENSE')
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 6)
            .map((t, idx) => {
              const cat = categories.find(c => c.id === t.categoryId);
              return (
                <div key={t.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="text-2xl font-black text-slate-200 w-8">0{idx + 1}</div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${cat?.color || 'bg-slate-400'}`}>
                    {cat?.icon || '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{t.note || cat?.name}</p>
                    <p className="text-[10px] text-slate-400">{t.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-rose-500">-${t.amount.toLocaleString()}</p>
                  </div>
                </div>
              )
            })
          }
          {currentMonthTransactions.filter(t => t.type === 'EXPENSE').length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 font-medium">
              本月尚無支出紀錄
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;
