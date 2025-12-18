
import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import { User, AppMode } from '../types';

interface AuthProps {
  onAuthSuccess: (user: User, mode: AppMode) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<AppMode>('PRO');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const user = await StorageService.login(email, password);
        if (user) {
          onAuthSuccess(user, 'PRO');
        } else {
          setError('登入失敗，請檢查電子郵件與密碼。');
        }
      } else {
        const user = await StorageService.register(email, password, displayName);
        onAuthSuccess(user, 'PRO');
      }
    } catch (err) {
      setError('操作過程中發生錯誤。');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser: User = {
      id: 'demo-user-id',
      email: 'demo@smartfinance.ai',
      displayName: '體驗帳號',
      isDemo: true
    };
    onAuthSuccess(demoUser, 'DEMO');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
      {/* Mode Switcher */}
      <div className="mb-8 p-1 bg-slate-200 rounded-2xl flex w-full max-w-[280px] shadow-inner">
        <button 
          onClick={() => setMode('PRO')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition-all ${mode === 'PRO' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
        >
          正式模式
        </button>
        <button 
          onClick={() => setMode('DEMO')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition-all ${mode === 'DEMO' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}
        >
          展示模式
        </button>
      </div>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100 transition-all duration-500">
        <div className="p-10">
          <div className="text-center mb-10">
            <h1 className={`text-4xl font-black tracking-tight transition-colors ${mode === 'PRO' ? 'text-blue-600' : 'text-orange-500'}`}>
              SmartFinance {mode === 'DEMO' && <span className="text-sm align-top bg-orange-100 px-2 py-0.5 rounded-full ml-1 font-bold">Demo</span>}
            </h1>
            <p className="text-slate-400 mt-2 font-medium">
              {mode === 'PRO' ? '個人智慧化財務管理核心' : '快速探索 AI 理財功能'}
            </p>
          </div>

          {mode === 'PRO' ? (
            <form onSubmit={handleSubmit} className="space-y-5 animate-fadeIn">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">顯示名稱</label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-semibold"
                    placeholder="您的姓名或暱稱"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">電子郵件</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-semibold"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">密碼</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-semibold"
                  placeholder="至少 6 位字元"
                />
              </div>

              {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? '處理中...' : (isLogin ? '立刻登入' : '完成註冊')}
              </button>

              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-slate-500 hover:text-blue-600 font-semibold transition-colors text-sm"
                >
                  {isLogin ? '尚未擁有帳號？點此註冊' : '已經有帳號了？點此登入'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 animate-fadeIn py-4">
              <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 text-center">
                <p className="text-orange-800 font-bold mb-4">展示模式將使用預設的測試數據，無需註冊即可體驗所有 AI 功能。</p>
                <div className="flex justify-center gap-4 text-2xl mb-2">
                  <span>📊</span><span>🤖</span><span>🎮</span>
                </div>
              </div>
              <button
                onClick={handleDemoLogin}
                className="w-full py-5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl shadow-xl shadow-orange-200 transition-all active:scale-95 text-lg flex items-center justify-center gap-3"
              >
                🚀 一鍵進入展示空間
              </button>
            </div>
          )}
        </div>
        <div className="bg-slate-50 p-6 text-center">
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em]">Secure Authentication powered by SmartFinance AI</p>
        </div>
      </div>
      <div className="mt-8 text-slate-400 text-xs">
          &copy; 2024 SmartFinance AI. All rights reserved.
      </div>
    </div>
  );
};

export default Auth;
