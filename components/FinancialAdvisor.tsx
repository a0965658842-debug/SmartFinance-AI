
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
  const [errorType, setErrorType] = useState<'NONE' | 'KEY_REQUIRED' | 'OTHER'>('NONE');

  const handleOpenKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setErrorType('NONE');
      getAdvice();
    }
  };

  const getAdvice = async () => {
    setLoading(true);
    setErrorType('NONE');
    try {
      const result = await GeminiService.getFinancialAdvice(transactions, accounts, categories);
      setAdvice(result);
    } catch (e: any) {
      if (e.message === 'AI_KEY_REQUIRED' || e.message === 'AI_KEY_INVALID') {
        setErrorType('KEY_REQUIRED');
      } else {
        setErrorType('OTHER');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatAdvice = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.match(/^\d\./) || line.startsWith('-')) {
        return <p key={i} className="pl-4 py-1 text-slate-700 border-l-2 border-blue-200 ml-2 mb-2 bg-blue-50/30 rounded-r-lg">{line}</p>;
      }
      if (line.includes(':')) {
        const [title, ...contentParts] = line.split(':');
        const content = contentParts.join(':');
        return <p key={i} className="mb-2"><span className="font-bold text-blue-700">{title}:</span><span className="text-slate-600">{content}</span></p>;
      }
      return <p key={i} className="mb-2 text-slate-600">{line}</p>;
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="inline-block p-4 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-3xl text-4xl mb-4 shadow-lg shadow-blue-200">
          🤖
        </div>
        <h2 className="text-3xl font-bold text-slate-800">AI 智慧理財顧問</h2>
        <p className="text-slate-500 max-w-lg mx-auto font-medium">
          基於您的收支行為與資產狀況，由 Gemini AI 為您提供量身打造的財務健檢。
        </p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-100/50">
        {errorType === 'KEY_REQUIRED' ? (
          <div className="py-12 text-center space-y-6">
            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 inline-block max-w-sm">
              <p className="text-amber-800 font-bold mb-2">需要啟用 AI 服務</p>
              <p className="text-amber-600 text-sm">由於目前在部署環境中，您需要點擊下方按鈕連結您的 Gemini API Key 才能使用 AI 功能。</p>
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-xs text-amber-500 underline mt-2 inline-block">了解計費與金鑰說明</a>
            </div>
            <br />
            <button
              onClick={handleOpenKey}
              className="px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all hover:bg-blue-700"
            >
              🔑 連結您的 API 金鑰
            </button>
          </div>
        ) : !advice && !loading ? (
          <div className="py-12 text-center">
            <button
              onClick={getAdvice}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all hover:scale-105 active:scale-95"
            >
              🚀 獲取個人化理財建議
            </button>
          </div>
        ) : loading ? (
          <div className="py-20 flex flex-col items-center space-y-6">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
            <p className="text-blue-600 font-bold animate-pulse text-lg tracking-tight">正在深度分析您的財務大數據...</p>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                    <h3 className="text-2xl font-black text-slate-800">顧問建議報告</h3>
                </div>
                <button 
                  onClick={getAdvice} 
                  className="bg-slate-50 text-blue-600 px-4 py-2 rounded-xl text-sm hover:bg-blue-50 font-bold transition-colors"
                >
                  重新生成
                </button>
            </div>
            <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                <div className="prose prose-blue max-w-none">
                  {formatAdvice(advice)}
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialAdvisor;
