import React from 'react';
import { Question } from '../types';
import { getCategories } from '../utils/storage';
import { Play, Sparkles, Brain, Compass, Atom, Hash, Flame } from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  isOpen: boolean;
  questions: Question[];
  onSelectCategory: (category: string) => void;
  onOpenQuestionManager: () => void;
  onOpenHelp: () => void;
}

export const CategorySelectModal: React.FC<Props> = ({
  isOpen,
  questions,
  onSelectCategory,
  onOpenQuestionManager,
  onOpenHelp,
}) => {
  if (!isOpen) return null;

  const categories = getCategories(questions);

  const getCategoryIcon = (cat: string) => {
    if (cat.includes('Đố vui') || cat.includes('mẹo')) return <Sparkles className="w-6 h-6 text-amber-400" />;
    if (cat.includes('Khoa học') || cat.includes('tự nhiên')) return <Atom className="w-6 h-6 text-cyan-400" />;
    if (cat.includes('Lịch sử') || cat.includes('Địa lý')) return <Compass className="w-6 h-6 text-emerald-400" />;
    if (cat.includes('Toán') || cat.includes('logic')) return <Hash className="w-6 h-6 text-purple-400" />;
    return <Brain className="w-6 h-6 text-rose-400" />;
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-red-600 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-red-950/60 text-center space-y-6">
        
        {/* Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/80 border border-red-500 rounded-full text-red-400 text-xs font-arcade animate-pulse">
            <Flame className="w-4 h-4 text-red-500" />
            CHIẾN BINH TRI THỨC
          </div>
          <h1 className="font-arcade text-2xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 tracking-wider">
            CONTRA KIẾN THỨC
          </h1>
          <p className="text-slate-300 font-military text-sm sm:text-base max-w-lg mx-auto">
            Hãy chọn chủ đề ôn tập để bắt đầu nhiệm vụ! Vượt qua các cổng phong ấn, hạ gục lính địch và giành chiến thắng vinh quang.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[45vh] overflow-y-auto p-1">
          {/* Mixed Option */}
          <button
            onClick={() => {
              sound.playShootSpread();
              onSelectCategory('ALL');
            }}
            className="group flex items-center gap-4 p-4 bg-slate-800/80 hover:bg-red-950/60 border-2 border-slate-700 hover:border-red-500 rounded-xl transition-all duration-200 text-left hover:scale-[1.02] shadow-lg"
          >
            <div className="p-3 bg-red-600/20 border border-red-500 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-colors">
              <Flame className="w-6 h-6 text-red-400 group-hover:text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-arcade text-xs text-yellow-400 group-hover:text-yellow-300">
                Tất cả chủ đề hỗn hợp
              </h3>
              <p className="text-xs text-slate-400 font-military mt-0.5">
                Tổng hợp {questions.length} câu đố từ mọi lĩnh vực
              </p>
            </div>
            <Play className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Specific Categories */}
          {categories.map(cat => {
            const count = questions.filter(q => q.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => {
                  sound.playShootSpread();
                  onSelectCategory(cat);
                }}
                className="group flex items-center gap-4 p-4 bg-slate-800/80 hover:bg-slate-700/80 border-2 border-slate-700 hover:border-yellow-500 rounded-xl transition-all duration-200 text-left hover:scale-[1.02] shadow-lg"
              >
                <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl group-hover:border-yellow-500 transition-colors">
                  {getCategoryIcon(cat)}
                </div>
                <div className="flex-1">
                  <h3 className="font-military font-bold text-sm sm:text-base text-slate-100 group-hover:text-yellow-300">
                    {cat}
                  </h3>
                  <p className="text-xs text-slate-400 font-military mt-0.5">
                    {count} câu hỏi thử thách
                  </p>
                </div>
                <Play className="w-5 h-5 text-yellow-400 group-hover:translate-x-1 transition-transform" />
              </button>
            );
          })}
        </div>

        {/* Action Buttons: Question Manager & Help */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              sound.playJump();
              onOpenQuestionManager();
            }}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-yellow-400 hover:text-yellow-300 border border-yellow-500/50 rounded-xl text-xs sm:text-sm font-arcade tracking-wider transition-all shadow-md"
          >
            ⚙️ QUẢN LÝ CÂU HỎI
          </button>

          <button
            onClick={() => {
              sound.playJump();
              onOpenHelp();
            }}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs sm:text-sm font-military font-bold transition-all shadow-md"
          >
            🎮 Hướng Dẫn Phím & Vũ Khí
          </button>
        </div>

      </div>
    </div>
  );
};
