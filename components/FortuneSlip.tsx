
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';

const FortuneSlip: React.FC = () => {
  const [fortune, setFortune] = useState<{ title: string; poem: string; meaning: string; luck: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showKeyBtn, setShowKeyBtn] = useState(false);

  const drawFortune = async () => {
    setLoading(true);
    setShowKeyBtn(false);
    try {
      const result = await GeminiService.getDailyFortune();
      setFortune(result);
    } catch (e: any) {
      if (e.message === 'AI_KEY_REQUIRED' || e.message === 'AI_KEY_INVALID') {
        setShowKeyBtn(true);
      } else {
        // 使用備份方案
        const backups = [
          { title: "第十九籤 龍德入命", poem: "龍德星君照命宮。財源滾滾似長江。不須苦苦勞心力。自有福人助建功。", meaning: "今日貴人運強，理財適合諮詢專業人士，會有收穫。", luck: "⭐⭐⭐⭐⭐" }
        ];
        setFortune(backups[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setShowKeyBtn(false);
      drawFortune();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 p-4">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800">🏮 今日財運詩籤</h2>
        <p className="text-slate-500">沉澱心情，為今日的財富之路求一指引</p>
      </div>

      {showKeyBtn ? (
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl text-center space-y-6">
          <p className="text-slate-600 font-medium">為了獲得 AI 生成的原創詩籤，請連結金鑰：</p>
          <button
            onClick={handleOpenKey}
            className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-100 transition-all hover:bg-red-700"
          >
            🔑 啟動 AI 服務
          </button>
        </div>
      ) : !fortune && !loading ? (
        <div className="flex flex-col items-center animate-bounce">
          <button
            onClick={drawFortune}
            className="group relative w-48 h-48 bg-red-600 rounded-full flex items-center justify-center text-6xl shadow-2xl hover:scale-105 transition-transform"
          >
            <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25"></div>
            🧧
          </button>
          <p className="mt-6 font-bold text-red-600 tracking-widest uppercase">點擊求籤</p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="text-6xl animate-spin">🏮</div>
          <p className="text-slate-600 font-bold animate-pulse">正在向財神爺問卜中...</p>
        </div>
      ) : (
        <div className="bg-[#fcf8ef] border-4 border-red-800/20 p-8 rounded-xl shadow-2xl max-w-sm w-full relative animate-fadeIn overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-800/10 rounded-bl-full"></div>
          <div className="border-2 border-red-800 p-6 flex flex-col items-center space-y-8">
            <h3 className="text-2xl font-black text-red-800 border-b-2 border-red-800 pb-2 w-full text-center">
              {fortune.title}
            </h3>
            <div className="flex items-center gap-1 text-2xl">{fortune.luck}</div>
            <div className="text-3xl font-serif text-slate-800 leading-loose flex flex-row-reverse gap-4" style={{ writingMode: 'vertical-rl' }}>
              {fortune.poem.split(/[。，]/).filter(s => s).map((s, i) => (
                <p key={i} className="tracking-[0.5em]">{s}。</p>
              ))}
            </div>
            <div className="w-full pt-6 border-t border-red-800/30">
              <p className="text-xs font-bold text-red-800 uppercase mb-2">【 籤文解說 】</p>
              <p className="text-slate-700 leading-relaxed font-medium">{fortune.meaning}</p>
            </div>
            <button onClick={() => setFortune(null)} className="text-xs text-red-800/50 hover:text-red-800">再次求籤</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FortuneSlip;
