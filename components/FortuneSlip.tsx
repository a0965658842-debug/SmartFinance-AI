
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';

const FortuneSlip: React.FC = () => {
  const [fortune, setFortune] = useState<{ title: string; poem: string; meaning: string; luck: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsKey, setNeedsKey] = useState(false);

  const drawFortune = async () => {
    setLoading(true);
    setNeedsKey(false);
    try {
      const result = await GeminiService.getDailyFortune();
      setFortune(result);
    } catch (e: any) {
      console.error("Fortune View Error:", e);
      if (e.message === 'AI_KEY_REQUIRED' || e.message === 'AI_KEY_INVALID' || e.message === 'AI_KEY_MISSING') {
        setNeedsKey(true);
      } else {
        // 本地備份
        setFortune({
          title: "第十九籤 龍德入命",
          poem: "龍德星君照命宮。財源滾滾似長江。不須苦苦勞心力。自有福人助建功。",
          meaning: "今日貴人運強，理財建議多聽專家意見。",
          luck: "⭐⭐⭐⭐⭐"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setNeedsKey(false);
      drawFortune();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 p-4">
      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-800">🏮 今日財運詩籤</h2>
        <p className="text-slate-500">求籤指引財富之路</p>
      </div>

      {needsKey ? (
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl text-center space-y-6">
          <p className="text-slate-600">偵測不到 API 金鑰，請先完成連結才能求籤：</p>
          <button
            onClick={handleOpenKey}
            className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700"
          >
            🔑 啟動 AI 並連結金鑰
          </button>
        </div>
      ) : loading ? (
        <div className="text-6xl animate-spin">🏮</div>
      ) : fortune ? (
        <div className="bg-[#fcf8ef] border-4 border-red-800/20 p-8 rounded-xl shadow-2xl max-w-sm w-full animate-fadeIn">
          <div className="border-2 border-red-800 p-6 flex flex-col items-center space-y-6">
            <h3 className="text-2xl font-black text-red-800 border-b-2 border-red-800 pb-2 w-full text-center">{fortune.title}</h3>
            <div className="text-2xl">{fortune.luck}</div>
            <div className="text-2xl font-serif text-slate-800 flex flex-row-reverse gap-4" style={{ writingMode: 'vertical-rl' }}>
              {fortune.poem.split(/[。，]/).filter(s => s).map((s, i) => <p key={i} className="tracking-[0.4em]">{s}。</p>)}
            </div>
            <div className="w-full pt-4 border-t border-red-800/30 text-slate-700 text-sm">
              <p className="font-bold text-red-800 mb-1">【 解析 】</p>
              {fortune.meaning}
            </div>
            <button onClick={() => setFortune(null)} className="text-xs text-slate-400">重新求籤</button>
          </div>
        </div>
      ) : (
        <button onClick={drawFortune} className="w-40 h-40 bg-red-600 rounded-full text-6xl shadow-2xl animate-bounce">🧧</button>
      )}
    </div>
  );
};

export default FortuneSlip;
