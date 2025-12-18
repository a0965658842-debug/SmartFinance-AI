
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: '總覽', icon: '📊' },
    { id: 'accounts', label: '銀行帳戶', icon: '🏦' },
    { id: 'transactions', label: '財務紀錄', icon: '📝' },
    { id: 'advisor', label: 'AI 財務顧問', icon: '🤖' },
    { id: 'fortune', label: '財運詩籤', icon: '🏮' },
    { id: 'game', label: '存錢大作戰', icon: '🎮' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-100 flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <span>💎</span> SmartFinance
          </h1>
          {user.isDemo && (
            <span className="text-[10px] bg-orange-100 text-orange-600 font-black px-2 py-0.5 rounded-full uppercase tracking-widest w-fit">
              展示模式 (Demo)
            </span>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${user.isDemo ? 'bg-orange-500' : 'bg-blue-500'}`}>
              {user.displayName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-800">{user.displayName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors font-medium text-sm"
          >
            <span>🚪</span> 登出系統
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header Mobile */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-blue-600">SmartFinance</h1>
            {user.isDemo && <span className="text-[8px] bg-orange-100 text-orange-600 font-black px-2 py-0.5 rounded-full uppercase">Demo Mode</span>}
          </div>
          <div className="flex gap-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
            {menuItems.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => setActiveTab(item.id)}
                  className={`p-2 px-3 flex items-center gap-2 rounded-lg transition-all ${activeTab === item.id ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-400'}`}
                >
                    <span>{item.icon}</span>
                    <span className="text-sm">{item.label}</span>
                </button>
            ))}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
