
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
        // 假設成功並嘗試重新獲取
        setErrorState('NONE');
        getAdvice();
      } catch (e) {
        console.error("Open key dialog failed", e);
      }
    } else {
      alert("請在支援 AI Studio 的環境中開啟此功能，或在環境變數中設定 API_KEY。");
    }
  };

  const getAdvice = async () => {
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
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="inline-block p-4 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-3xl text-4xl mb-4 shadow-lg">
          🤖
        </div>
        <h2 className="text-3xl font-bold text-slate-800">AI 智慧理財顧問</h2>
        <p className="text-slate-500 max-w-lg mx-auto">
          基於您的收支行為，由 Gemini 3 Pro 提供深度財務建議。
        </p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl min-h-[300px] flex items-center justify-center">
        {errorState === 'KEY_REQUIRED' ? (
          <div className="text-center space-y-6 animate-scaleIn">
            <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 inline-block">
              <p className="text-rose-800 font-bold mb-1">未檢測到有效的 API 金鑰</p>
              <p className="text-rose-600 text-sm">請點擊下方按鈕連結您的 Google AI API Key。</p>
            </div>
            <br />
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={handleOpenKey}
                className="px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl hover:bg-blue-700 transition-all"
              >
                🔑 點此連結 API 金鑰
              </button>
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-xs text-slate-400 underline">為什麼需要這一步？</a>
            </div>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center space-y-6">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-600 font-bold animate-pulse">正在運算您的財務數據...</p>
          </div>
        ) : advice ? (
          <div className="w-full space-y-6 animate-fadeIn text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-800">建議報告</h3>
              <button onClick={getAdvice} className="text-blue-600 text-sm font-bold">重新分析</button>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl whitespace-pre-wrap leading-relaxed text-slate-700">
              {advice}
            </div>
          </div>
        ) : errorState === 'API_ERROR' ? (
          <div className="text-center space-y-4">
            <p className="text-slate-500">AI 呼叫發生非預期錯誤</p>
            <button onClick={getAdvice} className="px-6 py-2 bg-slate-100 rounded-xl font-bold">重試</button>
          </div>
        ) : (
          <button
            onClick={getAdvice}
            className="px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl hover:scale-105 transition-transform"
          >
            🚀 獲取 AI 理財建議
          </button>
        )}
      </div>
    </div>
  );
};

export default FinancialAdvisor;
