import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameStats } from '../types';
import { sound } from '../utils/sound';
import { Trophy, Clock, Target, ShieldCheck, RotateCcw, Home } from 'lucide-react';

interface Props {
  isOpen: boolean;
  stats: GameStats;
  category: string;
  onPlayAgain: () => void;
  onReturnMenu: () => void;
}

export const VictoryModal: React.FC<Props> = ({
  isOpen,
  stats,
  category,
  onPlayAgain,
  onReturnMenu,
}) => {
  useEffect(() => {
    if (isOpen) {
      sound.playVictory();
      // Burst celebratory confetti
      const count = 200;
      const defaults = { origin: { y: 0.7 } };
      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio)
        });
      }
      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Grade calculation
  let grade = 'S';
  if (stats.wrongAttempts > 3) grade = 'B';
  else if (stats.wrongAttempts > 1) grade = 'A';

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in zoom-in-95 duration-300">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/40 border-2 border-yellow-500 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-yellow-500/30 text-center space-y-6">
        
        {/* Victory Trophy */}
        <div className="space-y-2">
          <div className="inline-flex p-4 bg-yellow-500/20 border-2 border-yellow-400 rounded-full text-yellow-400 shadow-lg shadow-yellow-500/40 animate-bounce">
            <Trophy className="w-12 h-12" />
          </div>
          <h1 className="font-arcade text-2xl sm:text-3xl text-yellow-400 tracking-wider">
            CHIẾN THẮNG HUY HOÀNG!
          </h1>
          <p className="text-slate-300 font-military text-sm">
            Nhiệm vụ hoàn thành xuất sắc! Bạn đã giải mã toàn bộ cổng phong ấn chủ đề: <strong className="text-yellow-300">"{category === 'ALL' ? 'Tất cả chủ đề' : category}"</strong>
          </p>
        </div>

        {/* Grade Badge */}
        <div className="inline-block px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 rounded-xl font-arcade text-lg font-black shadow-lg">
          HẠNG CHIẾN BINH: {grade}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center gap-3">
            <Target className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <div className="text-[11px] text-slate-400 font-military">TỔNG ĐIỂM SỐ</div>
              <div className="font-arcade text-sm sm:text-base text-yellow-400">{stats.score.toLocaleString()}</div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[11px] text-slate-400 font-military">CỔNG VƯỢT QUA</div>
              <div className="font-arcade text-sm sm:text-base text-emerald-400">{stats.gatesCleared}/{stats.totalGates}</div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center gap-3">
            <Trophy className="w-6 h-6 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[11px] text-slate-400 font-military">QUÁI ĐÃ DIỆT</div>
              <div className="font-arcade text-sm sm:text-base text-cyan-400">{stats.enemiesDefeated} kẻ địch</div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center gap-3">
            <Clock className="w-6 h-6 text-purple-400 shrink-0" />
            <div>
              <div className="text-[11px] text-slate-400 font-military">THỜI GIAN VƯỢT ẢI</div>
              <div className="font-arcade text-sm sm:text-base text-purple-400">{formatTime(stats.timeElapsed)}</div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              sound.playShootNormal();
              onPlayAgain();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 text-white font-arcade text-xs sm:text-sm rounded-xl shadow-lg shadow-red-600/30 transition-all border border-red-400"
          >
            <RotateCcw className="w-4 h-4" />
            CHƠI LẠI
          </button>

          <button
            onClick={() => {
              sound.playJump();
              onReturnMenu();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-military font-bold text-sm rounded-xl border border-slate-700 transition-all"
          >
            <Home className="w-4 h-4" />
            Về Menu Chính
          </button>
        </div>

      </div>
    </div>
  );
};
