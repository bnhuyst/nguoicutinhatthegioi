import React, { useState } from 'react';
import { Question } from '../types';
import { sound } from '../utils/sound';
import { ShieldAlert, Lightbulb, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';

interface Props {
  question: Question;
  gateIndex: number;
  totalGates: number;
  onCorrect: () => void;
  onWrong: () => void;
}

export const QuizGateOverlay: React.FC<Props> = ({
  question,
  gateIndex,
  totalGates,
  onCorrect,
  onWrong,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);

  const handleSelectOption = (index: number) => {
    if (isSuccess) return;
    setSelectedOption(index);

    if (index === question.correctIndex) {
      // Correct!
      setIsSuccess(true);
      setHasError(false);
      sound.playCorrect();
      setTimeout(() => {
        onCorrect();
      }, 1400);
    } else {
      // Wrong!
      setHasError(true);
      setAttempts(prev => prev + 1);
      sound.playWrong();
      onWrong();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-xl bg-slate-900 border-2 rounded-2xl p-6 sm:p-8 shadow-2xl transition-all duration-300 ${
          isSuccess 
            ? 'border-emerald-500 shadow-emerald-500/40' 
            : hasError 
              ? 'border-red-500 shadow-red-500/40 animate-shake' 
              : 'border-cyan-500 shadow-cyan-500/30'
        }`}
      >
        {/* Header: Cyber Gate Alert */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              isSuccess 
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400' 
                : 'bg-cyan-950/80 border-cyan-500 text-cyan-400'
            }`}>
              {isSuccess ? <CheckCircle2 className="w-6 h-6 animate-bounce" /> : <ShieldAlert className="w-6 h-6 animate-pulse" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-arcade text-xs text-yellow-400">
                  CỔNG PHONG ẤN {gateIndex + 1}/{totalGates}
                </span>
                <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] text-cyan-300 font-military">
                  {question.category}
                </span>
              </div>
              <h2 className="font-arcade text-sm sm:text-base text-slate-100 tracking-wide mt-1">
                {isSuccess ? 'PHONG ẤN ĐÃ ĐƯỢC GIẢI MÃ!' : 'GIẢI MÃ TRẮC NGHIỆM ĐỂ MỞ CỔNG'}
              </h2>
            </div>
          </div>
          <div className="px-3 py-1 bg-red-950/80 border border-red-500 rounded text-red-400 text-xs font-arcade animate-pulse">
            ĐÓNG BĂNG
          </div>
        </div>

        {/* Question Prompt */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 sm:p-5 mb-5 shadow-inner">
          <p className="font-military font-bold text-base sm:text-lg text-slate-100 leading-relaxed">
            {question.prompt}
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {question.options.map((option, idx) => {
            const letter = ['A', 'B', 'C', 'D'][idx];
            const isChosen = selectedOption === idx;
            const isTheRightAnswer = isSuccess && idx === question.correctIndex;
            const isTheWrongAnswer = hasError && isChosen && idx !== question.correctIndex;

            return (
              <button
                key={idx}
                disabled={isSuccess}
                onClick={() => handleSelectOption(idx)}
                className={`group relative flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border-2 text-left font-military transition-all duration-150 ${
                  isTheRightAnswer
                    ? 'bg-emerald-900/60 border-emerald-400 text-white shadow-lg shadow-emerald-500/30'
                    : isTheWrongAnswer
                      ? 'bg-red-900/60 border-red-500 text-red-200 shadow-md shadow-red-500/20'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 hover:border-cyan-400 text-slate-200 hover:scale-[1.02]'
                }`}
              >
                <span className={`w-7 h-7 flex items-center justify-center font-arcade text-xs rounded-lg font-bold shrink-0 transition-colors ${
                  isTheRightAnswer
                    ? 'bg-emerald-400 text-slate-950'
                    : isTheWrongAnswer
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-900 group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-300'
                }`}>
                  {letter}
                </span>
                <span className="text-sm font-semibold flex-1">
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* Feedback Section: Hint & Error or Success Message */}
        {hasError && !isSuccess && (
          <div className="p-4 bg-red-950/70 border border-red-500/80 rounded-xl space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-red-400 font-arcade text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>TRẢ LỜI SAI! BẠN PHẢI CHỌN LẠI ĐÚNG MỚI ĐƯỢC ĐI TIẾP (LẦN THỬ: {attempts})</span>
            </div>
            {question.hint && (
              <div className="flex items-start gap-2 text-amber-300 text-xs sm:text-sm font-military pt-1 border-t border-red-900/40">
                <Lightbulb className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <span><strong>Gợi ý:</strong> {question.hint}</span>
              </div>
            )}
          </div>
        )}

        {isSuccess && (
          <div className="p-4 bg-emerald-950/70 border border-emerald-500 rounded-xl flex items-center justify-between animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-yellow-400 animate-spin" />
              <span className="font-arcade text-xs sm:text-sm text-emerald-300">
                CHÍNH XÁC! CỔNG ĐANG NỔ TUNG...
              </span>
            </div>
            <span className="text-xs font-military text-slate-300">
              Tiếp tục chạy!
            </span>
          </div>
        )}

      </div>
    </div>
  );
};
