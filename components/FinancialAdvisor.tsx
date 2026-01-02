
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { Transaction, BankAccount, Category } from '../types';

interface FinancialAdvisorProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  categories: Category[];
}

const FinancialAdvisor: React.FC<FinancialAdvisorProps> = ({ transactions, accounts, categories }) => {
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState<'NONE' | 'KEY_REQUIRED' | 'API_ERROR'>('NONE');

  const handleOpenKey = async () => {
    if ((window as any).aistudio) {
      try {
        await (window as any).aistudio.openSelectKey();
        setErrorState('NONE');
        // 規範要求：觸發後直接繼續流程
        getAdvice();
      } catch (e) {
        console.error("Open key dialog failed", e);
      }
    } else {
      alert("環境不支援金鑰選擇對話框。請確保環境變數 API_KEY 已設定。");
    }
  };

  const getAdvice = async () => {
    if (accounts.length === 0) {
      alert("請先新增銀行帳戶資料，AI 才能根據您的資產狀況提供建議喔！");
      return;
    }
    setLoading(true);
    setErrorState('NONE');
    try {
      const result = await GeminiService.getFinancialAdvice(transactions, accounts, categories);
      setAdvice(result);
    } catch (e: any) {
      console.error("Advisor View Error:", e);
      if (e.message === 'AI_KEY_REQUIRED' || e.message === 'AI_KEY_INVALID' || e.message === 'AI_KEY_MISSING') {
        setErrorState('KEY_REQUIRED');
      } else {
        setErrorState('API_ERROR');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
      <div className="text-center space-y-4">
        <div className="inline-block p-4 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-3xl text-4xl mb-2 shadow-xl">
          🤖
        </div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">AI 智慧理財報告</h2>
        <p className="text-slate-500 max-w-lg mx-auto font-medium">
          使用高效能 Gemini 3 Flash 模型，分析您的資產配置與收支狀況，提供即時理財指引。
        </p>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 p-8 md:p-12 shadow-2xl shadow-slate-200/50 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
        {/* 背景裝飾 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-50 rounded-full -ml-12 -mb-12 opacity-50"></div>

        {errorState === 'KEY_REQUIRED' ? (
          <div className="text-center space-y-8 animate-scaleIn relative z-10">
            <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 max-w-sm">
              <div className="text-4xl mb-4">🔑</div>
              <h4 className="text-rose-800 font-bold text-lg mb-2">需要 API 金鑰連結</h4>
              <p className="text-rose-600 text-sm leading-relaxed">
                由於本系統運行於瀏覽器端，您需要連結自己的 Google AI API Key 才能啟動免費層級的 AI 服務。
              </p>
            </div>
            <button
              onClick={handleOpenKey}
              className="px-12 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
            >
              立刻連結並啟動 AI
            </button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center space-y-8 animate-fadeIn relative z-10">
            <div className="relative">
              <div className="w-20 h-20 border-8 border-blue-100 rounded-full"></div>
              <div className="w-20 h-20 border-8 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
            <div className="text-center">
              <p className="text-blue-600 font-black text-xl mb-2">正在深度分析財務數據...</p>
              <p className="text-slate-400 text-sm font-medium">正在使用高效 Flash 模型計算中</p>
            </div>
          </div>
        ) : advice ? (
          <div className="w-full space-y-8 animate-fadeIn relative z-10">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                <h3 className="text-2xl font-black text-slate-800">顧問建議摘要</h3>
              </div>
              <button 
                onClick={getAdvice} 
                className="text-blue-600 hover:text-blue-700 text-sm font-black flex items-center gap-1 bg-blue-50 px-4 py-2 rounded-xl transition-colors"
              >
                <span>🔄</span> 重新分析
              </button>
            </div>
            <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
              <div className="prose prose-slate max-w-none text-slate-700 leading-loose">
                {advice.split('\n').map((line, i) => (
                  <p key={i} className={`mb-4 ${line.startsWith('#') || line.includes('**') ? 'font-bold text-slate-900' : ''}`}>
                    {line.replace(/\*\*/g, '')}
                  </p>
                ))}
              </div>
            </div>
            <div className="p-4 bg-blue-50/50 rounded-2xl text-center">
              <p className="text-xs text-blue-400 font-medium">※ 以上建議由 Gemini 3 Flash AI 生成，數據來源於您的真實紀錄，僅供理財參考。</p>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-10 relative z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl">🏦</div>
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-3xl">💰</div>
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-3xl">📊</div>
              </div>
              <p className="text-slate-500 font-medium max-w-xs leading-relaxed">
                我將根據您的 {accounts.length} 個帳戶與 {transactions.length} 筆交易紀錄，為您提供省錢與理財的具體方向。
              </p>
            </div>
            <button
              onClick={getAdvice}
              className="px-16 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-[2rem] shadow-2xl shadow-blue-200 transition-all hover:scale-110 active:scale-95 text-lg"
            >
              🚀 生成我的理財建議報告
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialAdvisor;
