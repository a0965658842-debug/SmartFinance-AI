
import React, { useState, useEffect, useRef } from 'react';

const FinanceGame: React.FC = () => {
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'OVER'>('IDLE');
  const [score, setScore] = useState(0);
  const [items, setItems] = useState<{ id: number; x: number; y: number; type: 'COIN' | 'BOMB' }[]>([]);
  const [piggyPos, setPiggyPos] = useState(50); // percentage
  const gameLoopRef = useRef<number>(0);
  const nextIdRef = useRef(0);

  const startGame = () => {
    setScore(0);
    setItems([]);
    setGameState('PLAYING');
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const interval = setInterval(() => {
      const type = Math.random() > 0.25 ? 'COIN' : 'BOMB';
      setItems(prev => [...prev, {
        id: nextIdRef.current++,
        x: Math.random() * 90 + 5,
        y: -15,
        type
      }]);
    }, 650); // 稍微加快生成頻率

    const gameLoop = () => {
      setItems(prev => {
        const newItems = prev.map(item => ({ ...item, y: item.y + 1.8 }));
        
        // Collision check
        const caught = newItems.filter(item => {
          const isAtBottom = item.y > 78 && item.y < 92;
          const isAligned = Math.abs(item.x - piggyPos) < 14; // 增加碰撞判定範圍
          return isAtBottom && isAligned;
        });

        if (caught.some(i => i.type === 'BOMB')) {
          setGameState('OVER');
          return prev;
        }

        if (caught.length > 0) {
          setScore(s => s + caught.length * 10);
        }

        return newItems.filter(item => item.y < 105 && !caught.includes(item));
      });
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, piggyPos]);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== 'PLAYING') return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const container = e.currentTarget.getBoundingClientRect();
    const relativeX = ((clientX - container.left) / container.width) * 100;
    setPiggyPos(Math.min(Math.max(relativeX, 5), 95));
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800 italic tracking-tight">💰 存錢筒大作戰</h2>
        <p className="text-slate-500 font-medium">接住閃亮的大金幣，小心黑色炸彈！</p>
      </div>

      <div 
        className="relative h-[650px] bg-gradient-to-b from-sky-200 via-sky-100 to-blue-200 rounded-[3rem] border-[12px] border-white shadow-2xl overflow-hidden cursor-crosshair touch-none"
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
      >
        {/* Score Board */}
        <div className="absolute top-8 left-0 right-0 flex justify-center z-30 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md px-10 py-3 rounded-full shadow-2xl border-4 border-yellow-400 transform -rotate-1">
            <span className="text-[10px] font-black text-yellow-600 block text-center uppercase tracking-widest mb-0.5">My Savings</span>
            <span className="text-4xl font-black text-blue-700 tracking-tighter">${score}</span>
          </div>
        </div>

        {gameState === 'IDLE' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-600/30 backdrop-blur-md z-40">
            <div className="text-9xl mb-8 animate-bounce drop-shadow-2xl">🐷</div>
            <button 
                onClick={startGame}
                className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-black px-16 py-6 rounded-[2rem] shadow-2xl transition-all transform hover:scale-110 active:scale-90 text-2xl border-b-8 border-yellow-600"
            >
                開始遊戲
            </button>
          </div>
        )}

        {gameState === 'OVER' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-600/40 backdrop-blur-xl animate-fadeIn z-40">
            <div className="text-9xl mb-6 drop-shadow-2xl">😵</div>
            <h3 className="text-5xl font-black text-white mb-2 drop-shadow-lg italic">GAME OVER!</h3>
            <p className="text-white font-black text-2xl mb-10 bg-black/30 px-10 py-3 rounded-full border-2 border-white/50">
                Score: ${score}
            </p>
            <button 
                onClick={startGame}
                className="bg-white hover:bg-slate-100 text-red-600 font-black px-16 py-6 rounded-[2rem] shadow-2xl transition-all transform hover:scale-110 active:scale-90 text-2xl border-b-8 border-slate-300"
            >
                再試一次
            </button>
          </div>
        )}

        {/* Falling Items */}
        {items.map(item => (
          <div 
            key={item.id}
            className="absolute transition-transform flex items-center justify-center"
            style={{ 
              left: `${item.x}%`, 
              top: `${item.y}%`, 
              transform: `translateX(-50%)` 
            }}
          >
            {item.type === 'COIN' ? (
              <div className="relative group animate-spin-slow">
                {/* Golden Glow Effect */}
                <div className="absolute -inset-4 bg-yellow-400 rounded-full blur-xl opacity-60 animate-pulse"></div>
                {/* 3D Looking Coin */}
                <div className="relative w-16 h-16 bg-gradient-to-tr from-yellow-700 via-yellow-400 to-yellow-100 rounded-full border-4 border-yellow-800 shadow-2xl flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-1 border-2 border-yellow-500/50 rounded-full"></div>
                    <span className="text-4xl select-none filter drop-shadow-md">💰</span>
                </div>
              </div>
            ) : (
              <div className="relative animate-bounce">
                {/* Red Danger Glow */}
                <div className="absolute -inset-3 bg-red-600 rounded-full blur-lg opacity-50"></div>
                {/* Bomb Body */}
                <div className="relative w-16 h-16 bg-slate-900 rounded-full border-4 border-slate-700 shadow-2xl flex items-center justify-center">
                    <div className="absolute -top-2 -right-1 w-6 h-6 bg-red-500 rounded-full animate-ping opacity-75"></div>
                    <span className="text-4xl select-none">💣</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Piggy Player */}
        <div 
          className="absolute bottom-16 transition-all duration-75 select-none pointer-events-none z-20"
          style={{ left: `${piggyPos}%`, transform: 'translateX(-50%)' }}
        >
          <div className="relative">
             {/* Dynamic Shadow on Ground */}
             <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black/20 rounded-full blur-md"></div>
             {/* Character */}
             <div className="text-8xl drop-shadow-[0_20px_20px_rgba(0,0,0,0.3)] filter saturate-150 transform hover:scale-110 transition-transform">
                {gameState === 'OVER' ? '😵' : '🐷'}
             </div>
          </div>
        </div>
        
        {/* Grass ground decorations */}
        <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-green-500 to-green-400 border-t-8 border-white/20 z-10 flex items-center justify-around">
            <span className="text-2xl opacity-40">🌱</span>
            <span className="text-2xl opacity-40">🌼</span>
            <span className="text-2xl opacity-40">🌱</span>
            <span className="text-2xl opacity-40">🌻</span>
            <span className="text-2xl opacity-40">🌱</span>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl text-center">
        <div className="flex justify-center gap-12 mb-6">
            <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-yellow-200">💰</div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">+10 金幣</span>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-red-200">💣</div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">遊戲結束</span>
            </div>
        </div>
        <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.3em] leading-relaxed">
            Move mouse to control Piggy<br/>
            左右移動滑鼠或滑動手指
        </p>
      </div>
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default FinanceGame;
