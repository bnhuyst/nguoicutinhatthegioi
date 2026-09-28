import React, { useEffect } from 'react';
import { GameStats } from '../types';
import { sound } from '../utils/sound';
import { Skull, RotateCcw, Home, HelpCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  stats: GameStats;
  onRetry: () => void;
  onReturnMenu: () => void;
  onOpenQuestionManager: () => void;
}

export const GameOverModal: React.FC<Props> = ({
  isOpen,
  stats,
  onRetry,
  onReturnMenu,
  onOpenQuestionManager,
}) => {
  useEffect(() => {
    if (isOpen) {
      sound.playGameOver();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-red-600 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-red-950/70 text-center space-y-6">
        
        <div className="space-y-3">
          <div className="inline-flex p-4 bg-red-950/60 border-2 border-red-500 rounded-full text-red-500 animate-pulse shadow-lg shadow-red-950">
            <Skull className="w-12 h-12" />
          </div>
          <h1 className="font-arcade text-3xl text-red-500 tracking-wider text-glow-red">
            GAME OVER
          </h1>
          <p className="text-slate-300 font-military text-sm">
            Chiến binh đã hết máu! Đừng nản lòng, hãy nhặt hộp tiếp tế (Nấm thần, Súng S, Súng L) hoặc dùng Khiên Hộ Thể (phím K) để phòng thủ tốt hơn!
          </p>
        </div>

        {/* Stats */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs font-military text-slate-300">
          <div className="flex justify-between">
            <span>Điểm đạt được:</span>
            <strong className="text-yellow-400 font-arcade">{stats.score}</strong>
          </div>
          <div className="flex justify-between">
            <span>Cổng đã vượt qua:</span>
            <strong className="text-emerald-400 font-arcade">{stats.gatesCleared}/{stats.totalGates}</strong>
          </div>
          <div className="flex justify-between">
            <span>Số quái tiêu diệt:</span>
            <strong className="text-cyan-400 font-arcade">{stats.enemiesDefeated}</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              sound.playShootNormal();
              onRetry();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 text-white font-arcade text-xs sm:text-sm rounded-xl shadow-lg shadow-red-600/30 transition-all border border-red-400 active:scale-98"
          >
            <RotateCcw className="w-4 h-4" />
            HỒI SINH & THỬ LẠI
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => {
                sound.playJump();
                onReturnMenu();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-military font-bold border border-slate-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              Menu Chính
            </button>

            <button
              onClick={() => {
                sound.playJump();
                onOpenQuestionManager();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-yellow-400 rounded-xl text-xs font-military font-bold border border-slate-700 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              Ôn Câu Hỏi
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
